const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const productsApiRouter = express.Router();
const DATA_FILE = path.join(__dirname, "../../config", "data.json");

async function readData() {
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

// GET /api/products/:id — возвращает товар по id
productsApiRouter.get("/:id", async (req, res) => {
  const productId = Number(req.params.id);
  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ message: "Некорректный product id" });
  }

  const data = await readData();
  const product = (data.products || []).find((p) => p.id === productId);

  if (!product) {
    return res.status(404).json({ message: "Товар не найден" });
  }

  res.status(200).json(product);
});

// GET /api/products — возвращает список всех товаров
productsApiRouter.get("/", async (req, res) => {
  const data = await readData();
  res.status(200).json(data.products || []);
});

module.exports = productsApiRouter;