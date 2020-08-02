const express = require("express");
const ejs = require("ejs");
const path = require("path");

const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));

let name = "name";

app.get("/", (req, res) => {
  res.render("index", { name });
});

app.listen(3000, () => {
  console.log("Server is up and running at port 3000");
});
