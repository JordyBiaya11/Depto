const path = require("path");
const Database = require("better-sqlite3");

const db = new Database(path.join(__dirname, "depto.db"));

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

module.exports = db;