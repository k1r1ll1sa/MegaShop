//роут корзины
const express = require("express");
const cartRouter = express.Router();
const cartController = require("../../controllers/cart_controller")

cartRouter.get("/", cartController.showCart);

module.exports = cartRouter;