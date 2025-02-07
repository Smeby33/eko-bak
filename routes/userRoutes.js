const express = require("express");
const router = express.Router();
const db = require("../database");

// ✅ Ajouter un utilisateur (inscription)
router.post("/register", async (req, res) => {
  console.log('Requête reçue pour /register');
  const { uid, email, name } = req.body;

  if (!uid || !email || !name) {
    console.log("Erreur - Champs manquants");
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  try {
    const sql = "INSERT INTO users (uid, email, name) VALUES (?, ?, ?)";
    await db.query(sql, [uid, email, name]);

    console.log("Utilisateur ajouté :", { uid, email, name });
    res.status(201).json({
      uid,
      email,
      name,
      message: "Utilisateur enregistré avec succès"
    });

  } catch (err) {
    console.error("Erreur SQL :", err);
    res.status(500).json({ error: "Erreur lors de l'enregistrement de l'utilisateur." });
  }
});

// ✅ Rechercher un utilisateur par nom ou email
router.get("/search", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);

  try {
    const [users] = await db.query(
      "SELECT id, name, email FROM users WHERE name LIKE ? OR email LIKE ? LIMIT 10",
      [`%${q}%`, `%${q}%`]
    );
    res.json(users);

  } catch (err) {
    console.error("Erreur SQL :", err);
    res.status(500).json({ error: "Erreur de recherche" });
  }
});

// ✅ Récupérer tous les utilisateurs
router.get("/", async (req, res) => {
  try {
    const [users] = await db.query("SELECT * FROM users");
    res.json(users);

  } catch (err) {
    console.error("Erreur SQL :", err);
    res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs." });
  }
});

module.exports = router;
