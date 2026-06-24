// routes/api.js
const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const db = require("../db");
const { sendConfirmationEmail } = require("../emailService");

// ---------- PÉRIODES (avec places restantes) ----------
router.get("/periods", (req, res) => {
  const data = db.read();
  const periods = data.periods.map(p => ({
    ...p,
    weeks: p.weeks.map(w => {
      const taken = data.registrations.filter(r => r.weekId === w.id).length;
      return { ...w, remaining: Math.max(0, w.capacity - taken) };
    })
  }));
  res.json(periods);
});

// ---------- INSCRIPTION ÉLÈVE ----------
router.post("/register", async (req, res) => {
  const { name, email, password, level, phone, weekId, comments } = req.body;

  if (!name || !email || !password || !level || !weekId) {
    return res.status(400).json({ error: "Champs obligatoires manquants." });
  }

  const data = db.read();

  // Vérifier que la semaine existe et a de la place
  let foundWeek = null, foundPeriod = null;
  for (const p of data.periods) {
    const w = p.weeks.find(w => w.id === weekId);
    if (w) { foundWeek = w; foundPeriod = p; break; }
  }
  if (!foundWeek) return res.status(400).json({ error: "Semaine invalide." });

  const taken = data.registrations.filter(r => r.weekId === weekId).length;
  if (taken >= foundWeek.capacity) {
    return res.status(409).json({ error: "Cette semaine est complète." });
  }

  if (data.users.find(u => u.email === email)) {
    return res.status(409).json({ error: "Un compte existe déjà avec cet email." });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const user = {
    id: "u_" + Date.now(),
    name, email, passwordHash, phone: phone || "",
    createdAt: new Date().toISOString()
  };
  data.users.push(user);

  const registration = {
    id: "r_" + Date.now(),
    userId: user.id,
    name, email, level, phone: phone || "",
    periodId: foundPeriod.id,
    weekId,
    comments: comments || "",
    createdAt: new Date().toISOString()
  };
  data.registrations.push(registration);

  db.write(data);

  let emailResult = { simulated: true };
  try {
    emailResult = await sendConfirmationEmail({
      to: email,
      name,
      periodName: foundPeriod.name,
      weekLabel: foundWeek.label,
      weekDates: foundWeek.dates
    });
  } catch (e) {
    // On ne bloque pas l'inscription si l'email échoue, mais on le signale.
    console.error("Inscription enregistrée mais email non envoyé :", e.message);
  }

  res.status(201).json({ success: true, registration, emailSent: !emailResult.simulated });
});

// ---------- CONNEXION ----------
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const data = db.read();
  const user = data.users.find(u => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: "Email ou mot de passe incorrect." });
  }
  req.session.userId = user.id;
  res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

router.get("/me", (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "Non connecté." });
  const data = db.read();
  const user = data.users.find(u => u.id === req.session.userId);
  if (!user) return res.status(401).json({ error: "Non connecté." });
  const registrations = data.registrations.filter(r => r.userId === user.id);
  res.json({ user: { id: user.id, name: user.name, email: user.email }, registrations });
});

// ---------- ADMIN (protégé par un token simple dans .env) ----------
function checkAdmin(req, res, next) {
  const token = req.headers["x-admin-token"];
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return res.status(403).json({ error: "Accès refusé." });
  }
  next();
}

router.get("/admin/registrations", checkAdmin, (req, res) => {
  const data = db.read();
  const enriched = data.registrations.map(r => {
    const period = data.periods.find(p => p.id === r.periodId);
    const week = period?.weeks.find(w => w.id === r.weekId);
    return { ...r, periodName: period?.name, weekLabel: week?.label, weekDates: week?.dates };
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(enriched);
});

module.exports = router;
