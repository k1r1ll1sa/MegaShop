// Роут регистрации
const express = require("express");
const registerRouter = express.Router();
const bcrypt = require("bcrypt");
const fs = require("fs").promises;
const path = require("path");
const DATA_FILE = path.join(__dirname, "../../config", "data.json");

// Обработка страницы регистрации
registerRouter.get("/", function(req, res){
    res.render("register", {
        register: res.locals.data.register || {}
    });
});

module.exports = registerRouter;