const express = require("express"); 
const router = express.Router();
const db = require("../database"); // Utilisation de promise()

// Ajouter un foyer
router.post("/", async (req, res) => {
  const { name, uid } = req.body;

  if (!name || !uid) {
    return res.status(400).json({ error: "Nom et UID sont requis." });
  }

  try {
    const [result] = await db.query("INSERT INTO households (name, uid) VALUES (?, ?)", [name, uid]);
    res.status(201).json({ id: result.insertId, name, uid });
  } catch (err) {
    console.error("Erreur SQL :", err);
    res.status(500).json({ error: err.message });
  }
});

// Récupérer un foyer par utilisateur
router.get("/houseuser", async (req, res) => { 
  const { uid } = req.query;

  if (!uid) {
    return res.status(400).json({ error: "L'email de l'utilisateur est requis." });
  }

  try {
    const [results] = await db.query("SELECT * FROM households WHERE uid = ?", [uid]);
    if (results.length === 0) {
      return res.status(404).json({ message: "Aucun foyer trouvé pour cet utilisateur." });
    }
    res.json(results);
  } catch (err) {
    console.error("Erreur SQL :", err);
    res.status(500).json({ error: err.message });
  }
});

// Associer un utilisateur à un foyer
router.post("/:householdId/add-user/:userId", async (req, res) => {
  const { householdId, userId } = req.params;

  try {
    await db.query("UPDATE users SET household_id = ? WHERE id = ?", [householdId, userId]);
    res.json({ message: "Utilisateur ajouté au foyer" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Récupérer les membres d'un foyer
router.get("/households/:householdId/users", async (req, res) => {
  const { householdId } = req.params;

  try {
    const [users] = await db.query(
      `SELECT u.id, u.name, u.email, uh.role 
       FROM users u
       JOIN user_households uh ON u.id = uh.user_id
       WHERE uh.household_id = ?`,
      [householdId]
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Ajouter un utilisateur à un foyer
router.post("/add1/:householdId/users", async (req, res) => {
  const { householdId } = req.params;
  const { userId, role } = req.body;

  if (!userId || !role) {
    return res.status(400).json({ error: "Utilisateur et rôle requis." });
  }

  try {
    await db.query("INSERT INTO user_households (user_id, household_id, role) VALUES (?, ?, ?)", [userId, householdId, role]);
    res.json({ message: "Utilisateur ajouté au foyer avec succès !" });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de l'ajout de l'utilisateur." });
  }
});

router.get("/viewadd1/:householdId/users", async (req, res) => {
  const { householdId } = req.params;

  try {
    const [results] = await db.query(
      `SELECT u.id, u.name, u.email, uh.role 
       FROM users u
       JOIN user_households uh ON u.id = uh.user_id
       WHERE uh.household_id = ?`,
      [householdId]
    );

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération des membres du foyer." });
  }
});


module.exports = router;
