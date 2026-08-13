#!/usr/bin/env node
/**
 * Régressions pipeline actu (sans réseau) : placeholder, stdin CI, scoring.
 */
const assert = require("assert");
const { execSync } = require("child_process");
const path = require("path");
const { isPlaceholderCandidate, isWeakLeadCandidate, scoreLeadPotential } = require("./blog-actu-lib.cjs");

var ROOT = path.join(__dirname, "..");

assert.strictEqual(
  isPlaceholderCandidate({
    id: "cafeyn-pending-template",
    title: "COLLEZ ICI le titre de la une Cafeyn (Le Figaro, Le Parisien…)",
  }),
  true,
  "placeholder Cafeyn doit être ignoré"
);

assert.strictEqual(
  isWeakLeadCandidate({ title: "Éclipse solaire : suivez l’événement exceptionnel" }),
  true,
  "éclipse sans angle assurance = sujet faible"
);

assert.strictEqual(
  isWeakLeadCandidate({
    title: "Canicule : 80 départements en vigilance orange, que faire pour son logement ?",
  }),
  false,
  "canicule + logement = lead habitation"
);

var placeholderScore = scoreLeadPotential({
  id: "cafeyn-pending-template",
  title: "COLLEZ ICI le titre de la une Cafeyn",
  status: "queued",
  sourceType: "cafeyn",
});
assert.ok(placeholderScore < 50, "placeholder ne doit pas dominer le ranking");

execSync("node scripts/verify-actu-quality.cjs --file=data/blog-actu-pending.json", {
  cwd: ROOT,
  stdio: "inherit",
});
execSync("node scripts/verify-actu-quality.cjs < /dev/null", {
  cwd: ROOT,
  stdio: "inherit",
  shell: "/bin/bash",
});

console.log("Pipeline actu OK (placeholder, scoring, qualité stdin vide).");
