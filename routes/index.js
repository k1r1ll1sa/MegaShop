const express = require("express");
const indexRouter = express.Router();

indexRouter.get("/", function (req, res){
  res.render("index");
});

module.exports = indexRouter;