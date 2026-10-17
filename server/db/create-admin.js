require("dotenv").config();
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "depto.db"));

const nom = "David Mulunda";
const email = "nkuludavid850@gmail.com";
const password = process.env.ADMIN_PASSWORD || "TON_MOT_DE_PASSE_ICI"; // Mets ton mot de passe ici si pas dans .env

// Supprime tous les admins existants pour repartir sur une base propre
db.prepare("DELETE FROM admins").run();

const hash = bcrypt.hashSync(password, 10);

db.prepare("INSERT INTO admins (nom, email, password) VALUES (?, ?, ?)").run(
  nom,
  email,
  hash
);

console.log("Admin cree :", email);
db.close();