#!/usr/bin/env node
/**
 * Copie les PDF depuis docs/pret-grilles/_inbox (ou un dossier passé en arg)
 * vers docs/pret-grilles/<categorie>/<canonical>, puis reconstruit le catalogue.
 *
 * Usage:
 *   node scripts/import-pret-grilles.cjs
 *   node scripts/import-pret-grilles.cjs /chemin/vers/dossier
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.join(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "scripts", "pret-grilles-manifest.json"), "utf8"));
const inbox = path.resolve(process.argv[2] || path.join(root, manifest.inbox || "docs/pret-grilles/_inbox"));

function norm(name) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

if (!fs.existsSync(inbox)) {
  fs.mkdirSync(inbox, { recursive: true });
  console.log("Inbox créée:", inbox);
  console.log("Déposez-y les PDF puis relancez: node scripts/import-pret-grilles.cjs");
  process.exit(0);
}

const files = fs.readdirSync(inbox).filter((f) => /\.(pdf|xlsx|xls)$/i.test(f));
if (!files.length) {
  console.log("Aucun PDF/XLS dans", inbox);
  console.log("Copiez vos fichiers depuis Téléchargements vers ce dossier, puis relancez.");
  process.exit(0);
}

let matched = 0;
let unmatched = [];

files.forEach(function (file) {
  const n = norm(file);
  const entry = manifest.files.find(function (f) {
    const names = [f.canonical].concat(f.aliases || []);
    return names.some(function (a) {
      return norm(a) === n || n.indexOf(norm(a).replace(/\.pdf$/, "")) >= 0;
    });
  });
  if (!entry) {
    unmatched.push(file);
    return;
  }
  const destDir = path.join(root, "docs", "pret-grilles", entry.category);
  fs.mkdirSync(destDir, { recursive: true });
  const dest = path.join(destDir, entry.canonical);
  fs.copyFileSync(path.join(inbox, file), dest);
  matched++;
  console.log("OK", file, "→", path.relative(root, dest));
});

execFileSync(process.execPath, [path.join(root, "scripts", "build-pret-grilles-catalog.cjs")], {
  stdio: "inherit",
});

console.log("\nImport:", matched, "fichier(s). Non reconnus:", unmatched.length);
if (unmatched.length) unmatched.forEach((u) => console.log("  ?", u));
