const express = require("express");
const fs = require("fs");
const path = require("path");
const db = require("../db/database");
const { requireAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "..", "public", "uploads");

function removePhotoFile(photoUrl) {
  if (!photoUrl || !photoUrl.startsWith("/uploads/")) return;
  const filename = path.basename(photoUrl);
  const fullPath = path.join(uploadDir, filename);
  fs.unlink(fullPath, function () {});
}

router.get("/api/produits", function (req, res) {
  const produits = db
    .prepare("SELECT * FROM produits ORDER BY created_at DESC")
    .all();
  res.json(produits);
});

router.get("/api/produits/:id", function (req, res) {
  const produit = db
    .prepare("SELECT * FROM produits WHERE id = ?")
    .get(req.params.id);

  if (!produit) {
    return res.status(404).json({ error: "Produit introuvable" });
  }
  res.json(produit);
});

router.post(
  "/api/produits",
  requireAuth,
  upload.single("photo"),
  function (req, res) {
    const { nom, prix, categorie, tailles, description } = req.body;

    if (!nom || !prix || !categorie || !req.file) {
      return res.status(400).json({ error: "Champs manquants" });
    }

    const photoUrl = "/uploads/" + req.file.filename;

    const result = db
      .prepare(
        `INSERT INTO produits (nom, prix, categorie, tailles, description, photo)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(
        nom,
        Number(prix),
        categorie,
        tailles || null,
        description || null,
        photoUrl
      );

    const produit = db
      .prepare("SELECT * FROM produits WHERE id = ?")
      .get(result.lastInsertRowid);

    res.status(201).json(produit);
  }
);

router.put(
  "/api/produits/:id",
  requireAuth,
  upload.single("photo"),
  function (req, res) {
    const existing = db
      .prepare("SELECT * FROM produits WHERE id = ?")
      .get(req.params.id);

    if (!existing) {
      return res.status(404).json({ error: "Produit introuvable" });
    }

    const { nom, prix, categorie, tailles, description } = req.body;
    let photoUrl = existing.photo;

    if (req.file) {
      removePhotoFile(existing.photo);
      photoUrl = "/uploads/" + req.file.filename;
    }

    db.prepare(
      `UPDATE produits
       SET nom = ?, prix = ?, categorie = ?, tailles = ?, description = ?, photo = ?
       WHERE id = ?`
    ).run(
      nom || existing.nom,
      prix !== undefined ? Number(prix) : existing.prix,
      categorie || existing.categorie,
      tailles !== undefined ? tailles : existing.tailles,
      description !== undefined ? description : existing.description,
      photoUrl,
      req.params.id
    );

    const produit = db
      .prepare("SELECT * FROM produits WHERE id = ?")
      .get(req.params.id);

    res.json(produit);
  }
);

router.delete("/api/produits/:id", requireAuth, function (req, res) {
  const existing = db
    .prepare("SELECT * FROM produits WHERE id = ?")
    .get(req.params.id);

  if (!existing) {
    return res.status(404).json({ error: "Produit introuvable" });
  }

  db.prepare("DELETE FROM produits WHERE id = ?").run(req.params.id);
  removePhotoFile(existing.photo);

  res.json({ ok: true });
});

module.exports = router;