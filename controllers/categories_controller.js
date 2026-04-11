const fs = require("fs").promises;
const path = require("path");

DATA_FILE = path.join(__dirname, "../config/data.json")

async function readData() {
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

// Рендеринг страницы с категориями
function showCategoriesPage(req, res){
  try {
    res.render("categories", {
      categories: res.locals.data.categories
    });
  } catch (err) {
    res.status(500).send("Ошибка сервера");
  }
}

// Рендеринг страницы конкретной категории
function showCategoryPage(req, res){
  try {
    let categoryId = req.params.id;
    let categoryInfo = res.locals.data.categories.find(c => c.id === categoryId);

    if (!categoryInfo){
      res.status(404).render("not_found", {
        message: "Категория не найдена!"
      });
    };

    let products = res.locals.data.products.filter(p => p.category === categoryId);

    res.render("category", {
      category: categoryInfo,
      products: products
    });
  } catch (err) {
    res.status(500).send("Ошибка сервера");
  }
}

// Возвращает товары категории
async function getCategoryProductsJson(req, res) {
  try {
    const categoryId = String(req.params.id || "").trim();
    if (!categoryId) {
      return res.status(400).json({ message: "Некорректный category id" });
    }

    const data = await readData();
    const category = (data.categories || []).find((c) => c.id === categoryId);
    if (!category) {
      return res.status(404).json({ message: "Категория не найдена" });
    }

    const products = (data.products || []).filter((p) => p.category === categoryId);
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({message: 'Ошибка сервера'});
  }
}

// Возвращает список категорий
async function getCategoriesJson(req, res) {
  try {
    const data = await readData();
    res.status(200).json(data.categories || []);
  } catch (err) {
    res.status(500).json({message: 'Ошибка сервера'});
  }
}

module.exports = {
  showCategoriesPage,
  showCategoryPage,
  getCategoryProductsJson,
  getCategoriesJson
}