const express = require("express");
const apiRouter = express.Router();

apiRouter.use("/products", require("./products_api.js"));
apiRouter.use("/categories", require("./categories_api.js"));
apiRouter.use("/auth", require("./auth_api.js"));
apiRouter.use("/cart", require("./cart_api.js"));

// Возвращает 404 для неизвестных endpoints
apiRouter.use((req, res) => {
  res.status(404).json({ message: "API endpoint не найден" });
});

module.exports = apiRouter;
