#!/usr/bin/env node
/**
 * Import PDF pièces / réglementaires depuis docs/pret-pieces/_inbox/
 * vers docs/pret-pieces/<category>/ et met à jour le catalogue.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const inbox = path.join(root, "docs", "pret-pieces", "_inbox");
const baseDir = path.join(root, "docs", "pret-pieces");
const catalogPath = path.join(root, "data", "pret-pieces-reglementaires.json");

function norm(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

if (!fs.existsSync(catalogPath)) {
  console.error("Catalogue manquant — lance npm run pret:pieces:build");
  process.exit(1);
}

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
fs.mkdirSync(inbox, { recursive: true });

const files = fs
  .readdirSync(inbox)
  .filter((f) => /\.(pdf|docx?|jpe?g|png)$/i.test(f));

if (!files.length) {
  console.log("Inbox vide:", inbox);
  console.log("Déposez les PDF (noms Téléchargements) puis relancez.");
  process.exit(0);
}

let matched = 0;
files.forEach((file) => {
  const n = norm(file);
  const doc = catalog.documents.find((d) => {
    if (norm(d.filename) === n) return true;
    return (d.aliases || []).some((a) => norm(a) === n);
  });
  if (!doc) {
    console.warn("Non matché:", file);
    return;
  }
  const destDir = path.join(baseDir, doc.category);
  fs.mkdirSync(destDir, { recursive: true });
  const destName = doc.filename.replace(/\.pdf\.pdf$/i, ".pdf");
  const dest = path.join(destDir, destName);
  fs.renameSync(path.join(inbox, file), dest);
  doc.status = "available";
  doc.path = path.relative(root, dest).replace(/\\/g, "/");
  doc.filename = destName;
  matched++;
  console.log("OK", file, "→", doc.path);
});

catalog.updatedAt = new Date().toISOString().slice(0, 10);
catalog.manifest.available = catalog.documents.filter((d) => d.status === "available").length;
catalog.manifest.pending = catalog.documents.filter((d) => d.status !== "available").length;
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + "\n");
console.log("Importés:", matched, "/", files.length);
