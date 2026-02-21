const express = require("express");
const fs = require('fs').promises;

const app = express();
 
app.set("view engine", "ejs");
app.set("views", __dirname + "/templates");

app.use(express.static(__dirname + "public"));

app.use(async (req, res, next) => {
  try{
    const data = await fs.readFile(__dirname + "/config/data.json", "utf-8");
    res.locals.data = JSON.parse(data);
    next();
  } catch (err){
    console.log(err);
  }
});

app.use("/", require("./routes/index"));
app.use("/categories", require("./routes/categories"));
app.use("/products", require("./routes/products"));

app.listen(3000);