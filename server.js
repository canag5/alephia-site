// server.js
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path");

const apiRoutes = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || "alephia-dev-secret-change-me",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 } // 7 jours
}));

app.use("/api", apiRoutes);
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`Aléphia tourne sur http://localhost:${PORT}`);
  if (!process.env.RESEND_API_KEY) {
    console.log("⚠️  RESEND_API_KEY non configurée — les emails seront simulés (affichés dans la console).");
  }
});
