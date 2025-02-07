require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./database");

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://smebedoh33:PjOL4Miphz4OI01z@eko.tslzc.mongodb.net/geslecdb?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connecté ✅'))
.catch(err => console.error('Erreur de connexion à MongoDB ❌', err));


const app = express();
app.use(express.json());
app.use(cors({ origin: 'https://eko-ten.vercel.app' }));

const userRoutes = require("./routes/userRoutes");
const householdRoutes = require("./routes/householdRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
const consumptionRoutes = require("./routes/consumptionRoutes");

app.use("/users", userRoutes);
app.use("/households", householdRoutes);
app.use("/devices", deviceRoutes);
app.use("/consumption", consumptionRoutes);

app.listen(5000, () => {
  console.log("🚀 Serveur en ligne sur https://eko-bak.onrender.com");
});
