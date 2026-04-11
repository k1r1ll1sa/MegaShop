const express = require("express");
const catRouter = express.Router();
const categoriesController = require("../../controllers/categories_controller");

// Обработка конкретной категории
catRouter.get("/:id", categoriesController.showCategoryPage);

// Обработка всех категорий
catRouter.get("/", categoriesController.showCategoriesPage);

module.exports = catRouter;