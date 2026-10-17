const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const dbDir = path.join(__dirname);
const dbPath = path.join(dbDir, "depto.db");

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS produits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    prix REAL NOT NULL,
    categorie TEXT NOT NULL,
    tailles TEXT,
    description TEXT,
    photo TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS commandes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    client_nom TEXT,
    client_telephone TEXT,
    total REAL DEFAULT 0,
    statut TEXT DEFAULT 'En attente',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS commande_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    commande_id INTEGER NOT NULL,
    produit_id INTEGER,
    nom TEXT NOT NULL,
    prix REAL NOT NULL,
    quantite INTEGER NOT NULL,
    taille TEXT,
    couleur TEXT,
    FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_produits_categorie ON produits(categorie);
  CREATE INDEX IF NOT EXISTS idx_commandes_code ON commandes(code);
`);

console.log("Base initialisee :", dbPath);

db.close();