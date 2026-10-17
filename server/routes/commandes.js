const express = require("express");
const db = require("../db/database");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const STATUTS_VALIDES = [
  "En attente",
  "Avance payee",
  "Paiement complet",
  "Inspectee",
  "Expediee",
  "Arrivee Kinshasa",
  "Livree",
  "Annulee",
];

function generateCode() {
  const year = new Date().getFullYear();
  const count = db.prepare("SELECT COUNT(*) AS n FROM commandes").get().n;
  const seq = String(count + 1).padStart(4, "0");
  return "DPT-" + year + "-" + seq;
}

router.post("/api/commandes", function (req, res) {
  const { client_nom, client_telephone, items } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Panier vide" });
  }

  const code = generateCode();
  let total = 0;

  items.forEach(function (item) {
    total += Number(item.prix) * Number(item.quantite);
  });

  const insertCommande = db.prepare(
    `INSERT INTO commandes (code, client_nom, client_telephone, total, montant_paye, statut)
     VALUES (?, ?, ?, ?, 0, 'En attente')`
  );

  const insertItem = db.prepare(
    `INSERT INTO commande_items
     (commande_id, produit_id, nom, prix, quantite, taille, couleur)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );

  const tx = db.transaction(function () {
    const result = insertCommande.run(
      code,
      client_nom || null,
      client_telephone || null,
      total
    );

    items.forEach(function (item) {
      insertItem.run(
        result.lastInsertRowid,
        item.produit_id || null,
        item.nom,
        Number(item.prix),
        Number(item.quantite),
        item.taille || null,
        item.couleur || null
      );
    });

    return result.lastInsertRowid;
  });

  const id = tx();
  const commande = db.prepare("SELECT * FROM commandes WHERE id = ?").get(id);

  res.status(201).json(commande);
});

router.get("/api/commandes", requireAuth, function (req, res) {
  const commandes = db
    .prepare("SELECT * FROM commandes ORDER BY created_at DESC")
    .all();
  res.json(commandes);
});

router.get("/api/commandes/suivi/:code", function (req, res) {
  const commande = db
    .prepare("SELECT * FROM commandes WHERE code = ?")
    .get(req.params.code);

  if (!commande) {
    return res.status(404).json({ error: "Commande introuvable" });
  }

  const items = db
    .prepare("SELECT * FROM commande_items WHERE commande_id = ?")
    .all(commande.id);

  res.json({
    code: commande.code,
    client_nom: commande.client_nom,
    statut: commande.statut,
    total: commande.total,
    montant_paye: commande.montant_paye,
    created_at: commande.created_at,
    items: items,
  });
});

router.put(
  "/api/commandes/:id/statut",
  requireAuth,
  function (req, res) {
    const { statut, montant_paye } = req.body || {};

    if (!STATUTS_VALIDES.includes(statut)) {
      return res.status(400).json({ error: "Statut invalide" });
    }

    const existing = db
      .prepare("SELECT id, total FROM commandes WHERE id = ?")
      .get(req.params.id);

    if (!existing) {
      return res.status(404).json({ error: "Commande introuvable" });
    }

    let montant = existing.total;
    if (montant_paye !== undefined) {
      montant = Number(montant_paye);
      if (montant < 0) montant = 0;
      if (montant > existing.total) montant = existing.total;
    }

    db.prepare("UPDATE commandes SET statut = ?, montant_paye = ? WHERE id = ?").run(
      statut,
      montant,
      req.params.id
    );

    const commande = db
      .prepare("SELECT * FROM commandes WHERE id = ?")
      .get(req.params.id);

    res.json(commande);
  }
);

module.exports = router;