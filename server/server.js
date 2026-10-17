require("dotenv").config();

const path = require("path");
const express = require("express");

const authRoutes = require("./routes/auth");
const produitsRoutes = require("./routes/produits");
const commandesRoutes = require("./routes/commandes");

const app = express();
const PORT = process.env.PORT || 3000;

const publicDir = path.join(__dirname, "..", "public");

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(publicDir));

app.use(authRoutes);
app.use(produitsRoutes);
app.use(commandesRoutes);

app.use("/api", function (req, res) {
  res.status(404).json({ error: "Route API introuvable" });
});

app.get("/admin", function (req, res) {
  res.redirect("/admin/login.html");
});

app.use(function (err, req, res, next) {
  if (err && err.message && err.message.includes("Format d'image")) {
    return res.status(400).json({ error: err.message });
  }
  if (err && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "Image trop volumineuse (5 Mo max)" });
  }
  console.error(err);
  res.status(500).json({ error: "Erreur serveur" });
});

app.listen(PORT, function () {
  console.log("DEPTO en ligne sur http://localhost:" + PORT);
  console.log("Admin : http://localhost:" + PORT + "/admin/login.html");
});