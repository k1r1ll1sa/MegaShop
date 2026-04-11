const express = require("express");
const categoriesApiRouter = express.Router();
const categoriesController = require("../../controllers/categories_controller");

// GET /api/categories/:id/products — возвращает товары категории
categoriesApiRouter.get("/:id/products", categoriesController.getCategoryProductsJson);

// GET /api/categories — возвращает список категорий
categoriesApiRouter.get("/", categoriesController.getCategoriesJson);

module.exports = categoriesApiRouter;