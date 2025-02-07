const express = require("express");
const router = express.Router();
const db = require("../database");

// Enregistrer une consommation
router.post("/", async (req, res) => {
  try {
    const { device_id, hours_on } = req.body;
    const [result] = await db.query("SELECT power FROM devices WHERE id = ?", [device_id]);
    
    if (result.length === 0) return res.status(404).json({ error: "Appareil non trouvé" });
    
    const consumption = (result[0].power * hours_on) / 1000;
    await db.query(
      "INSERT INTO consumption (device_id, date, hours_on, consumption) VALUES (?, NOW(), ?, ?)",
      [device_id, hours_on, consumption]
    );
    
    res.status(201).json({ message: "Consommation enregistrée", consumption });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtenir la consommation d'un foyer sans sommer les dates
router.get("/consumption/:household_id", async (req, res) => {
  try {
    const { household_id } = req.params;
    const [results] = await db.query(
      `SELECT c.date, SUM(c.consumption) AS total_consumption
       FROM consumptions c
       JOIN devices d ON c.device_id = d.id
       WHERE d.household_id = ?
       GROUP BY c.date
       ORDER BY c.date ASC`,
      [household_id]
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Récupérer la consommation d'un foyer
router.get("/:household_id", async (req, res) => {
  try {
    const { household_id } = req.params;
    const [rows] = await db.query(
      `SELECT c.date, SUM(c.consumption) AS total_consumption
       FROM consumptions c
       JOIN devices d ON c.device_id = d.id
       WHERE d.household_id = ?
       GROUP BY c.date
       ORDER BY c.date DESC;`,
      [household_id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des données" });
  }
});

// Récupérer les consommations d'un appareil spécifique pour le graphe
router.get("/unapa/:deviceId", async (req, res) => {
  try {
    const { deviceId } = req.params;
    if (!deviceId) return res.status(400).json({ error: "L'ID de l'appareil est requis." });

    const [results] = await db.query(
      `SELECT date, consumption FROM consumptions WHERE device_id = ? ORDER BY date ASC`,
      [deviceId]
    );
    
    if (results.length === 0) return res.status(404).json({ message: "Aucune consommation trouvée pour cet appareil." });
    
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération des consommations." });
  }
});

// Récupérer la consommation d'un appareil donné
router.get("/:deviceId/consumption", async (req, res) => {
  try {
    const { deviceId } = req.params;
    if (!deviceId) return res.status(400).json({ error: "L'ID de l'appareil est requis." });
    
    const [results] = await db.query(
      `SELECT date, hours_on, consumption FROM consumptions WHERE device_id = ? ORDER BY date ASC`,
      [deviceId]
    );
    
    if (results.length === 0) return res.status(404).json({ message: "Aucune consommation trouvée pour cet appareil." });
    
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération des consommations." });
  }
});

module.exports = router;
