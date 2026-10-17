const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "depto.db"));

const nom = "David Mulunda";
const email = "nkuludavid850@gmail.com";
const password = "dvd1234"; 

// Supprime l'ancien admin pour être sûr que le mot de passe est le bon
db.prepare("DELETE FROM admins").run();

const hash = bcrypt.hashSync(password, 10);

db.prepare("INSERT INTO admins (nom, email, password) VALUES (?, ?, ?)").run(
  nom,
  email,
  hash
);

console.log("Admin cree :", email);
db.close();