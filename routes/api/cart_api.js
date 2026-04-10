const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const cartApiRouter = express.Router();
const DATA_FILE = path.join(__dirname, "../../config", "data.json");

async function readData() {
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

function ensureAuthenticated(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Требуется авторизация" });
  }
  next();
}

// Инициализирует и возвращает корзину API в сессии
function getApiCart(req) {
  if (!Array.isArray(req.session.apiCart)) {
    req.session.apiCart = [];
  }
  return req.session.apiCart;
}

// Формирует ответ корзины с товарами и общей суммой
function buildCartResponse(cart, products) {
  const items = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return null;
      }

      return {
        productId: item.productId,
        quantity: item.quantity,
        product,
        lineTotal: product.price * item.quantity
      };
    })
    .filter(Boolean);

  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return { items, total };
}

// PUT /api/cart/items/:productId — обновляет количество товара
cartApiRouter.put("/items/:productId", ensureAuthenticated, async (req, res) => {
  const productId = Number(req.params.productId);
  const quantity = Number(req.body.quantity);

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ message: "Некорректный product id" });
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ message: "quantity должен быть целым числом > 0" });
  }

  const data = await readData();
  const cart = getApiCart(req);
  const existing = cart.find((i) => i.productId === productId);

  if (!existing) {
    return res.status(404).json({ message: "Товар не найден в корзине" });
  }

  existing.quantity = quantity;
  res.status(200).json(buildCartResponse(cart, data.products || []));
});

// DELETE /api/cart/items/:productId — удаляет товар из корзины
cartApiRouter.delete("/items/:productId", ensureAuthenticated, async (req, res) => {
  const productId = Number(req.params.productId);
  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ message: "Некорректный product id" });
  }

  const data = await readData();
  const cart = getApiCart(req);
  const nextCart = cart.filter((item) => item.productId !== productId);

  if (nextCart.length === cart.length) {
    return res.status(404).json({ message: "Товар не найден в корзине" });
  }

  req.session.apiCart = nextCart;
  res.status(200).json(buildCartResponse(nextCart, data.products || []));
});

// POST /api/cart/items — добавляет товар в корзину
cartApiRouter.post("/items", ensureAuthenticated, async (req, res) => {
  const productId = Number(req.body.productId);
  const quantity = Number(req.body.quantity);

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ message: "Некорректный productId" });
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ message: "quantity должен быть целым числом > 0" });
  }

  const data = await readData();
  const product = (data.products || []).find((p) => p.id === productId);
  if (!product) {
    return res.status(404).json({ message: "Товар не найден" });
  }

  const cart = getApiCart(req);
  const existing = cart.find((i) => i.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }

  res.status(201).json(buildCartResponse(cart, data.products || []));
});

// DELETE /api/cart/clear — полностью очищает корзину
cartApiRouter.delete("/clear", ensureAuthenticated, (req, res) => {
  req.session.apiCart = [];
  res.status(200).json({ message: "Корзина очищена", items: [], total: 0 });
});

// GET /api/cart — возвращает корзину текущего пользователя
cartApiRouter.get("/", ensureAuthenticated, async (req, res) => {
  const data = await readData();
  const cart = getApiCart(req);
  res.status(200).json(buildCartResponse(cart, data.products || []));
});

module.exports = cartApiRouter;