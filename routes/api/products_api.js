const express = require("express");
const productsApiRouter = express.Router();
const productsController = require("../../controllers/products_controller");

// GET /api/products/:id — возвращает товар по id
productsApiRouter.get("/:id", productsController.getProductJson);

// GET /api/products — возвращает список всех товаров
productsApiRouter.get("/", productsController.getProductsJson);

module.exports = productsApiRouter;