require("dotenv").config();
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "depto.db"));

const email = process.env.ADMIN_EMAIL || "admin@depto.cd";
const password = process.env.ADMIN_PASSWORD || "ChangeMoi2026!";

const existing = db
  .prepare("SELECT id FROM admins WHERE email = ?")
  .get(email);

if (existing) {
  console.log("Admin deja existant :", email);
  db.close();
  process.exit(0);
}

const hash = bcrypt.hashSync(password, 10);

db.prepare("INSERT INTO admins (email, password) VALUES (?, ?)").run(
  email,
  hash
);

console.log("Admin cree :", email);
db.close();