//роут корзины
const express = require("express");
const cartRouter = express.Router();
const fs = require("fs").promises;
const path = require("path");
const DATA_FILE = path.join(__dirname, "../../config", "data.json");

async function readData() {
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

cartRouter.get("/", async function(req, res) {
    try {
        // Проверка сессии
        if (!req.session || !req.session.user) {
            return res.redirect('/login');
        }

        const data = await readData();
        const products = data.products || [];

        const apiCart = Array.isArray(req.session.apiCart) ? req.session.apiCart : [];

        const cartItems = apiCart
            .map(item => {
              const product = products.find(p => p.id === item.productId);
              if (!product) return null;
              return {
                ...product,
                quantity: item.quantity || 1,
                lineTotal: product.price * (item.quantity || 1)
              };
            })
            .filter(Boolean);
        
        const total = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);

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

module.exports = cartRouter;