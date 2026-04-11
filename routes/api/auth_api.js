const express = require("express");
const authApiRouter = express.Router();
const authController = require("../../controllers/auth_controller");

// Проверяет, что пользователь авторизован в сессии
function ensureAuthenticated(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Требуется авторизация" });
  }
  next();
}

// POST /api/auth/register — регистрирует нового пользователя
authApiRouter.post("/register", authController.registerUser);

// POST /api/auth/login — выполняет вход пользователя
authApiRouter.post("/login", authController.loginUser);

// POST /api/auth/logout — завершает сессию пользователя
authApiRouter.post("/logout", authController.logoutUser);

// GET /api/auth/me — возвращает профиль текущего пользователя
authApiRouter.get("/me", ensureAuthenticated, authController.currentUser);

module.exports = authApiRouter;