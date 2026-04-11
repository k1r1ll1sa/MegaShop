const express = require("express");
const cartApiRouter = express.Router();
const cartController = require("../../controllers/cart_controller");

// Проверяет, что пользователь авторизован в сессии
function ensureAuthenticated(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Требуется авторизация" });
  }
  next();
}

// PUT /api/cart/items/:productId — обновляет количество товара
cartApiRouter.put("/items/:productId", ensureAuthenticated, cartController.updateQuantity);

// DELETE /api/cart/items/:productId — удаляет товар из корзины
cartApiRouter.delete("/items/:productId", ensureAuthenticated, cartController.removeFromCart);

// POST /api/cart/items — добавляет товар в корзину
cartApiRouter.post("/items", ensureAuthenticated, cartController.addToCart);

// DELETE /api/cart/clear — полностью очищает корзину
cartApiRouter.delete("/clear", ensureAuthenticated, cartController.clearCart);

// GET /api/cart — возвращает корзину текущего пользователя
cartApiRouter.get("/", ensureAuthenticated, cartController.getCartJson);

module.exports = cartApiRouter;