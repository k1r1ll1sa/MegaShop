//роут корзины
const express = require("express");
const cartRouter = express.Router();
const fs = require("fs").promises;
const path = require("path");
const DATA_FILE = path.join(__dirname, "../../config", "data.json");

cartRouter.get("/", async function(req, res) {
    try {
        // Проверка сессии
        if (!req.session || !req.session.user) {
            return res.redirect('/login');
        }

        const rawData = await fs.readFile(DATA_FILE, "utf-8");
        const data = JSON.parse(rawData);

        const cartIds = req.session.cart || [];

        // Получаем товары из корзины
        const cartItems = data.products?.filter(p => cartIds.includes(p.id)) || [];
        const total = cartItems.reduce((sum, p) => sum + p.price, 0);

        res.render("cart", {
            cartItems,
            total,
            session: req.session
        });

    } catch (err) {
        console.error("Ошибка загрузки корзины:", err);
        res.status(500).send("Ошибка сервера");
    }
});

cartRouter.post("/add", async function(req, res) {
    try {
        const { productId } = req.body;

        // Проверка сессии
        if (!req.session || !req.session.user) {
            return res.json({ success: false, redirect: true, message: "Требуется авторизация" });
        }

        if (!productId) {
            return res.status(400).json({ success: false, message: "Не указан товар" });
        }

        if (!req.session.cart) {
            req.session.cart = [];
        }

        // Проверка наличия в корзине
        if (req.session.cart.includes(productId)) {
            return res.json({ success: false, message: "Товар уже в корзине" });
        }

        // Проверка наличия товара в products
        const rawData = await fs.readFile(DATA_FILE, "utf-8");
        const data = JSON.parse(rawData);
        const product = data.products?.find(p => p.id === productId);

        if (!product) {
            return res.status(404).json({ success: false, message: "Товар не найден" });
        }

        req.session.cart.push(productId);

        console.log(`Товар ${productId} добавлен. Корзина в сессии: ${req.session.cart.length}`);

        res.json({
            success: true,
            message: "Товар добавлен в корзину",
            cartCount: req.session.cart.length
        });

    } catch (err) {
        console.error("Ошибка добавления:", err);
        res.status(500).json({ success: false, message: "Ошибка сервера" });
    }
});

cartRouter.delete("/remove/:productId", async function(req, res) {
    try {
        const productId = parseInt(req.params.productId);

        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: "Требуется авторизация" });
        }

        if (!req.session.cart) {
            return res.json({ success: true, message: "Корзина пуста" });
        }

        const initialLength = req.session.cart.length;
        req.session.cart = req.session.cart.filter(id => id !== productId);

        if (req.session.cart.length === initialLength) {
            return res.status(404).json({ success: false, message: "Товар не найден в корзине" });
        }

        console.log(`Товар ${productId} удалён. Корзина в сессии: ${req.session.cart.length}`);

        res.json({
            success: true,
            message: "Товар удалён",
            cartCount: req.session.cart.length
        });

    } catch (err) {
        console.error("Ошибка удаления:", err);
        res.status(500).json({ success: false, message: "Ошибка сервера" });
    }
});

module.exports = cartRouter;