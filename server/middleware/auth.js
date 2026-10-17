const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "change-moi-en-production";

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Token manquant" });
  }

  try {
    const payload = jwt.verify(token, SECRET);
    req.admin = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalide" });
  }
}

function signToken(admin) {
  return jwt.sign(
    { id: admin.id, email: admin.email },
    SECRET,
    { expiresIn: "12h" }
  );
}

module.exports = { requireAuth, signToken };