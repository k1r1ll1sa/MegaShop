const fs = require("fs").promises;
const path = require("path");

DATA_FILE = path.join(__dirname, "../config/data.json")

async function readData() {
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

// Рендеринг страницы конкретного товара
function showProductPage(req, res) {
  try {
    let productId = parseInt(req.params.id);
    let productInfo = res.locals.data.products.find(p => p.id === productId);

    if (!productInfo){
      res.status(404).render("not_found", {
        message: "Товар не найден"
      });
    };

    res.render("product", {
      product: productInfo
    });
  } catch (err) {
    res.status(500).send("Ошибка сервера");
  }
}

// Рендеринг страницы всех товаров
function showProductsPage(req, res){
  try {
    res.render("products", {
      products: res.locals.data.products
    });
  } catch (err) {
    res.status(500).send("Ошибка сервера");
  }
}

// Возвращает товар по id в формате JSON
async function getProductJson(req, res) {
  try {
    const productId = Number(req.params.id);
    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ message: "Некорректный product id" });
    }

    const data = await readData();
    const product = (data.products || []).find((p) => p.id === productId);

    if (!product) {
      return res.status(404).json({ message: "Товар не найден" });
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({message: 'Ошибка сервера'});
  }
}

//Возвращает список всех товаров в формате JSON
async function getProductsJson(req, res) {
  try {
    const data = await readData();
    res.status(200).json(data.products || []);
  } catch (err) {
    res.status(500).json({message: 'Ошибка сервера'});
  }
}

module.exports = {
  showProductPage, 
  showProductsPage,
  getProductJson,
  getProductsJson
}