const express = require("express");
const router = express.Router();
const db = require("../database");

// Ajouter un appareil
router.post("/", async (req, res) => {
  const { household_id, name, power } = req.body;
  if (!household_id || !name || !power) {
    return res.status(400).json({ error: "Tous les champs sont requis" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO devices (household_id, name, power) VALUES (?, ?, ?)",
      [household_id, name, power]
    );
    res.json({ id: result.insertId, household_id, name, power, is_on: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle ON/OFF d’un appareil
router.put("/toggle/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query("SELECT is_on, created_at, power FROM devices WHERE id = ?", [id]);
    if (results.length === 0) return res.status(404).json({ error: "Appareil introuvable" });

    const { is_on, created_at, power } = results[0];

    if (!is_on) {
      await db.query("UPDATE devices SET is_on = TRUE, created_at = NOW() WHERE id = ?", [id]);
      return res.json({ message: "Appareil allumé" });
    }

    const startTime = new Date(created_at);
    const now = new Date();
    const hoursOn = (now - startTime) / 3600000;
    const consumption = (power * hoursOn) / 1000;
    const date = now.toISOString().split("T")[0];

    await db.query(
      "INSERT INTO consumptions (device_id, date, hours_on, consumption) VALUES (?, ?, ?, ?) \
      ON DUPLICATE KEY UPDATE hours_on = hours_on + ?, consumption = consumption + ?",
      [id, date, hoursOn, consumption, hoursOn, consumption]
    );
    
    await db.query("UPDATE devices SET is_on = FALSE WHERE id = ?", [id]);
    res.json({ message: "Appareil éteint et consommation enregistrée", consumption });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Récupérer la consommation d'un appareil donné
router.get("/oneapp/:deviceId", async (req, res) => {
  const { deviceId } = req.params;
  try {
    const [deviceResults] = await db.query("SELECT * FROM devices WHERE id = ?", [deviceId]);
    if (deviceResults.length === 0) return res.status(404).json({ message: "Aucun appareil trouvé." });

    const [consumptionResults] = await db.query(
      "SELECT date, hours_on, consumption FROM consumptions WHERE device_id = ? ORDER BY date ASC",
      [deviceId]
    );

    res.json({ device: deviceResults[0], consumptions: consumptionResults });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtenir les appareils d'un foyer
router.get("/:household_id", async (req, res) => {
  const { household_id } = req.params;
  try {
    const [results] = await db.query("SELECT * FROM devices WHERE household_id = ?", [household_id]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Supprimer un appareil
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM devices WHERE id = ?", [id]);
    res.json({ message: "Appareil supprimé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
