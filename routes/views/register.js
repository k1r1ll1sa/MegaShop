// Роут регистрации
const express = require("express");
const registerRouter = express.Router();
const authController = require("../../controllers/auth_controller");

// Обработка страницы регистрации
registerRouter.get("/", authController.showRegisterPage);

module.exports = registerRouter;