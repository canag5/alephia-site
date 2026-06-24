// db.js
// Petite base de données fichier JSON. Simple, portable, zéro dépendance native.
// Suffisant pour le volume d'une activité de stages (quelques centaines d'inscrits/an).
// Si le volume explose un jour, migrer vers PostgreSQL est facile (même structure de données).

const fs = require("fs");
const path = require("path");

const DB_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DB_DIR, "db.json");

function ensureDb() {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData(), null, 2));
  }
}

function defaultData() {
  return {
    users: [],
    registrations: [],
    periods: [
      { id: "toussaint", name: "Toussaint", weeks: [
        { id: "toussaint-s1", label: "Semaine 1", dates: "25 oct – 1 nov", capacity: 8 },
        { id: "toussaint-s2", label: "Semaine 2", dates: "2 nov – 8 nov", capacity: 8 }
      ]},
      { id: "noel", name: "Noël", weeks: [
        { id: "noel-s1", label: "Semaine 1", dates: "20 déc – 27 déc", capacity: 8 },
        { id: "noel-s2", label: "Semaine 2", dates: "28 déc – 4 jan", capacity: 8 }
      ]},
      { id: "hiver", name: "Hiver", weeks: [
        { id: "hiver-s1", label: "Semaine 1", dates: "15 fév – 22 fév", capacity: 8 },
        { id: "hiver-s2", label: "Semaine 2", dates: "23 fév – 1 mars", capacity: 8 }
      ]},
      { id: "printemps", name: "Printemps", weeks: [
        { id: "printemps-s1", label: "Semaine 1", dates: "12 avr – 19 avr", capacity: 8 },
        { id: "printemps-s2", label: "Semaine 2", dates: "20 avr – 27 avr", capacity: 8 }
      ]},
      { id: "ete", name: "Été", weeks: [
        { id: "ete-s1", label: "Semaine 1", dates: "5 juil – 12 juil", capacity: 8 },
        { id: "ete-s2", label: "Semaine 2", dates: "13 juil – 19 juil", capacity: 8 }
      ]}
    ]
  };
}

function read() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

function write(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

module.exports = { read, write };
