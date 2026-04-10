const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const categoriesApiRouter = express.Router();
const DATA_FILE = path.join(__dirname, "../../config", "data.json");

async function readData() {
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

// GET /api/categories/:id/products — возвращает товары категории
categoriesApiRouter.get("/:id/products", async (req, res) => {
  const categoryId = String(req.params.id || "").trim();
  if (!categoryId) {
    return res.status(400).json({ message: "Некорректный category id" });
  }

  const data = await readData();
  const category = (data.categories || []).find((c) => c.id === categoryId);
  if (!category) {
    return res.status(404).json({ message: "Категория не найдена" });
  }

  const products = (data.products || []).filter((p) => p.category === categoryId);
  res.status(200).json(products);
});

// GET /api/categories — возвращает список категорий
categoriesApiRouter.get("/", async (req, res) => {
  const data = await readData();
  res.status(200).json(data.categories || []);
});

module.exports = categoriesApiRouter;