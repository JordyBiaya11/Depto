const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const dbDir = __dirname;
const dbPath = path.join(dbDir, "depto.db");

// Force la création du dossier db s'il n'existe pas
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

module.exports = db;