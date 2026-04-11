// Роут логина
const express = require("express");
const loginRouter = express.Router();
const authController = require("../../controllers/auth_controller");

// GET - отображение страницы входа
loginRouter.get("/", authController.showLoginPage);

module.exports = loginRouter;