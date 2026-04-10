const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const bcrypt = require("bcrypt");

const authApiRouter = express.Router();
const DATA_FILE = path.join(__dirname, "../../config", "data.json");

async function readData() {
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

// Сохраняет объект данных в JSON
async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

// Возвращает безопасные данные пользователя без пароля
function toSafeUser(user, index) {
  return {
    id: index + 1,
    name: user.name || user.login || "",
    email: normalizeEmail(user.email || "")
  };
}

// Проверяет, что пользователь авторизован в сессии
function ensureAuthenticated(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Требуется авторизация" });
  }
  next();
}


// POST /api/auth/register — регистрирует нового пользователя
authApiRouter.post("/register", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = normalizeEmail(req.body.email || "");
  const password = String(req.body.password || "");

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Поля name, email, password обязательны" });
  }
  if (password.length < 10) {
    return res.status(400).json({ message: "Пароль должен содержать минимум 10 символов" });
  }

  const data = await readData();
  const users = data.users || [];
  const existingUser = users.find((u) => normalizeEmail(u.email || "") === email);
  if (existingUser) {
    return res.status(400).json({ message: "Email уже зарегистрирован" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = { login: name, name, email, password: passwordHash, cart: [] };
  users.push(user);
  data.users = users;
  await writeData(data);

  res.status(201).json({ message: "Регистрация успешна", user: toSafeUser(user, users.length - 1) });
});

// POST /api/auth/login — выполняет вход пользователя
authApiRouter.post("/login", async (req, res) => {
  const email = normalizeEmail(req.body.email || "");
  const password = String(req.body.password || "");

  if (!email || !password) {
    return res.status(400).json({ message: "Поля email и password обязательны" });
  }

  const data = await readData();
  const users = data.users || [];
  const userIndex = users.findIndex((u) => normalizeEmail(u.email || "") === email);
  if (userIndex === -1) {
    return res.status(401).json({ message: "Неверный email или пароль" });
  }

  const user = users[userIndex];
  const isValidPassword = await bcrypt.compare(password, String(user.password || ""));
  if (!isValidPassword) {
    return res.status(401).json({ message: "Неверный email или пароль" });
  }

  req.session.user = {
    login: user.name || user.login || "",
    email: normalizeEmail(user.email || ""),
    id: userIndex + 1
  };

  if (!Array.isArray(req.session.cart)) {
    req.session.cart = [];
  }
  if (!Array.isArray(req.session.apiCart)) {
    req.session.apiCart = [];
  }

  res.status(200).json({ message: "Вход выполнен", user: toSafeUser(user, userIndex) });
});

// POST /api/auth/logout — завершает сессию пользователя
authApiRouter.post("/logout", (req, res) => {
  if (!req.session) {
    return res.status(200).json({ message: "Сессия уже завершена" });
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(400).json({ message: "Не удалось завершить сессию" });
    }
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Выход выполнен" });
  });
});

// GET /api/auth/me — возвращает профиль текущего пользователя
authApiRouter.get("/me", ensureAuthenticated, async (req, res) => {
  const email = normalizeEmail(req.session.user.email || "");
  const data = await readData();
  const users = data.users || [];
  const userIndex = users.findIndex((u) => normalizeEmail(u.email || "") === email);

  if (userIndex === -1) {
    return res.status(404).json({ message: "Пользователь не найден" });
  }

  res.status(200).json(toSafeUser(users[userIndex], userIndex));
});

module.exports = authApiRouter;