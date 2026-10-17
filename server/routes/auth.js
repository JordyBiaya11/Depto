const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db/database");
const { signToken } = require("../middleware/auth");

const router = express.Router();

router.post("/api/admin/login", function (req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  const admin = db
    .prepare("SELECT * FROM admins WHERE email = ?")
    .get(email);

  if (!admin) {
    return res.status(401).json({ error: "Identifiants invalides" });
  }

  const ok = bcrypt.compareSync(password, admin.password);
  if (!ok) {
    return res.status(401).json({ error: "Identifiants invalides" });
  }

  const token = signToken(admin);
  res.json({
    token: token,
    user: { id: admin.id, email: admin.email },
  });
});

module.exports = router;