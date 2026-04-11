const fs = require("fs").promises;
const path = require("path");

DATA_FILE = path.join(__dirname, "../config/data.json")

// Чтение БД
async function readData() {
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

// Инициализирует и возвращает корзину API в сессии
function getApiCart(req) {
  if (!Array.isArray(req.session.apiCart)) {
    req.session.apiCart = [];
  }
  return req.session.apiCart;
}

// Формирует ответ корзины с товарами и общей суммой
function buildCartResponse(cart, products) {
  const items = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return null;
      }

      return {
        productId: item.productId,
        quantity: item.quantity,
        product,
        lineTotal: product.price * item.quantity
      };
    })
    .filter(Boolean);

  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return { items, total };
}

// Рендеринг страницы корзины
async function showCart(req, res) {
  try {
    // Проверка сессии
    if (!req.session || !req.session.user) {
       return res.redirect('/login');
    }

    const data = await readData();
    const products = data.products || [];

    const apiCart = Array.isArray(req.session.apiCart) ? req.session.apiCart : [];

    const cartItems = apiCart
      .map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return null;
        return {
          ...product,
          quantity: item.quantity || 1,
          lineTotal: product.price * (item.quantity || 1)
        };
      })
      .filter(Boolean);
        
    const total = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);

    res.render("cart", {
      cartItems,
      total,
      session: req.session
    });

  } catch (err) {
    console.error("Ошибка загрузки корзины:", err);
    res.status(500).send("Ошибка сервера");
  }
};

// Возвращает корзину текущего пользователя в формате json
async function getCartJson(req, res) {
  try {
    const data = await readData();
    const cart = getApiCart(req);
    res.status(200).json(buildCartResponse(cart, data.products || []));
  } catch (err) {
    res.status(500).json({message: 'Ошибка сервера'});
  }
};

// Полностью очищает корзину
function clearCart(req, res) {
  try {
    req.session.apiCart = [];
    res.status(200).json({message: "Корзина очищена", items: [], total: 0 });
  } catch (err) {
    res.status(500).json({message: 'Ошибка сервера'});
  }
};

// Добавляет товар в корзину
async function addToCart(req, res) {
  try {
    const productId = Number(req.body.productId);
    const quantity = Number(req.body.quantity);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({message: "Некорректный productId"});
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({message: "quantity должен быть целым числом > 0"});
    }

    const data = await readData();
    const product = (data.products || []).find((p) => p.id === productId);
    if (!product) {
      return res.status(404).json({message: "Товар не найден"});
    }

    const cart = getApiCart(req);
    const existing = cart.find((i) => i.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ productId, quantity });
    }

    res.status(201).json(buildCartResponse(cart, data.products || []));
  } catch (err) {
    res.status(500).json({message: 'Ошибка сервера'});
  }
};

// обновляет количество товара
async function updateQuantity(req, res) {
  try {
    const productId = Number(req.params.productId);
    const quantity = Number(req.body.quantity);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ message: "Некорректный product id" });
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ message: "quantity должен быть целым числом > 0" });
    }

    const data = await readData();
    const cart = getApiCart(req);
    const existing = cart.find((i) => i.productId === productId);

    if (!existing) {
      return res.status(404).json({message: "Товар не найден в корзине"});
    }

    existing.quantity = quantity;
    res.status(200).json(buildCartResponse(cart, data.products || []));
  } catch (err) {
    res.status(500).json({message: 'Ошибка сервера'});
  }
};

// Удаляет товар из корзины
async function removeFromCart(req, res) {
  try {
    const productId = Number(req.params.productId);
    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ message: "Некорректный product id" });
    }

    const data = await readData();
    const cart = getApiCart(req);
    const nextCart = cart.filter((item) => item.productId !== productId);

    if (nextCart.length === cart.length) {
      return res.status(404).json({ message: "Товар не найден в корзине" });
    }

    req.session.apiCart = nextCart;
    res.status(200).json(buildCartResponse(nextCart, data.products || []));
  } catch (err) {
    res.status(500).json({message: 'Ошибка сервера'});
  }
};

module.exports = {
  showCart,
  getCartJson,
  clearCart,
  addToCart,
  updateQuantity,
  removeFromCart
}
