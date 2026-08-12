#!/usr/bin/env node
/**
 * Régénère data/pret-grilles-taux.json (documents) depuis scripts/pret-grilles-manifest.json
 * en préservant categories / partners / eligibilityRules.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const catalogPath = path.join(root, "data", "pret-grilles-taux.json");
const manifestPath = path.join(root, "scripts", "pret-grilles-manifest.json");

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

function slug(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const documents = manifest.files.map(function (f) {
  const rel = "./docs/pret-grilles/" + f.category + "/" + f.canonical;
  const abs = path.join(root, "docs", "pret-grilles", f.category, f.canonical);
  const available = fs.existsSync(abs);
  return {
    id: slug(f.partner + "-" + f.category + "-" + (f.period || "na") + "-" + f.canonical.replace(/\.pdf$/i, "")),
    category: f.category,
    partner: f.partner,
    title: f.title,
    filename: f.canonical,
    kind: f.kind || "grille",
    period: f.period || null,
    region: f.region || "metropole",
    tags: f.tags || [],
    status: available ? "available" : "pending_upload",
    path: available ? rel : "",
    flags: f.flags || [],
    notes: f.notes || "",
    aliases: f.aliases || [],
    alsoCategories: f.alsoCategories || [],
  };
});

catalog.documents = documents;
catalog.updatedAt = new Date().toISOString().slice(0, 10);
catalog.manifest = {
  source: "scripts/pret-grilles-manifest.json",
  uniqueFiles: documents.length,
  available: documents.filter((d) => d.status === "available").length,
  pending: documents.filter((d) => d.status === "pending_upload").length,
  missingFromDownloadList: manifest.missingFromDownloadList || [],
};

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + "\n", "utf8");
console.log(
  "Catalogue mis à jour:",
  documents.length,
  "docs —",
  catalog.manifest.available,
  "disponibles,",
  catalog.manifest.pending,
  "en attente d'upload"
);
