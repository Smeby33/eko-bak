require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();
app.use(express.json());
app.use(cors());

const userRoutes = require("./routes/userRoutes");
const householdRoutes = require("./routes/householdRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
const consumptionRoutes = require("./routes/consumptionRoutes");

app.use("/users", userRoutes);
app.use("/households", householdRoutes);
app.use("/devices", deviceRoutes);
app.use("/consumption", consumptionRoutes);

app.listen(5000, () => {
  console.log("🚀 Serveur en ligne sur http://localhost:5000");
});
