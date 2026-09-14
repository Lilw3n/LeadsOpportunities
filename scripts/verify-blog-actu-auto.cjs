#!/usr/bin/env node
/**
 * Garde-fous pipeline blog actu auto (leads quotidiens).
 * Empêche le modèle inbox Cafeyn et un contrôle qualité vide de bloquer GitHub.
 */
var fs = require("fs");
var path = require("path");
var { spawnSync } = require("child_process");
var { isUnusableActuCandidate, readJson } = require("./blog-actu-lib.cjs");
var { validateArticle } = require("./verify-actu-quality.cjs");

var failed = 0;
var root = path.join(__dirname, "..");

function assert(cond, msg) {
  if (!cond) {
    failed++;
    console.log("FAIL", msg);
  } else {
    console.log("OK  ", msg);
  }
}

assert(
  isUnusableActuCandidate({
    id: "cafeyn-pending-template",
    title: "COLLEZ ICI le titre de la une Cafeyn (Le Figaro, Le Parisien…)",
    status: "pending",
  }),
  "modèle inbox Cafeyn rejeté même en pending"
);

assert(
  isUnusableActuCandidate({
    id: "ok-1",
    title: "COLLEZ ICI",
    status: "queued",
  }),
  "titre placeholder rejeté"
);

assert(
  !isUnusableActuCandidate({
    id: "rss-mutuelle",
    title: "Mutuelle : ce qui change pour les remboursements hospitaliers",
    status: "candidate",
  }),
  "candidat actu réel accepté"
);

var queue = readJson("blog-actu-queue.json", { items: [] });
(queue.items || []).forEach(function (item) {
  if (item.id === "cafeyn-pending-template") {
    assert(item.status === "template", "entrée modèle Cafeyn en status=template");
  }
  if (item.status === "queued" || item.status === "pending") {
    assert(!isUnusableActuCandidate(item), "file publiable sans placeholder: " + item.id);
  }
});

var placeholderErrors = validateArticle({
  title: "COLLEZ ICI le titre de la une Cafeyn (Le Figaro, Le Parisien…)",
  file: "placeholder.html",
  description: "x".repeat(90),
  cta: { href: "/landings/mutuelle.html?utm_medium=actu_daily" },
  blocks: [
    { type: "p", text: "a" },
    { type: "p", text: "b" },
    { type: "p", text: "c" },
    { type: "h2", text: "h" },
    { type: "ul", items: ["1"] },
    { type: "bridge" },
  ],
});
assert(
  placeholderErrors.some(function (e) {
    return /placeholder|modèle|modele/i.test(e);
  }),
  "qualité refuse un titre modèle"
);

var okErrors = validateArticle({
  title: "Taux immobilier : ce que change la décision de la BCE pour votre prêt",
  file: "taux-bce-pret.html",
  description: "La BCE a ajusté sa trajectoire. Voici l'impact sur un prêt immobilier et l'assurance emprunteur.",
  cta: { href: "/landings/credit-immo.html?utm_medium=actu_daily&utm_campaign=emprunteur" },
  blocks: [
    { type: "p", text: "a" },
    { type: "h2", text: "Contrat" },
    { type: "p", text: "b" },
    { type: "h2", text: "Checklist" },
    { type: "ul", items: ["1"] },
    { type: "bridge" },
    { type: "p", text: "c" },
  ],
});
assert(okErrors.length === 0, "article actu valide passe le contrôle qualité");

var quality = spawnSync(process.execPath, [path.join(root, "scripts/verify-actu-quality.cjs")], {
  cwd: root,
  encoding: "utf8",
  input: "",
});
assert(quality.status === 0, "qualité sans stdin (CI) ne plante pas — exit " + quality.status);
if (quality.status !== 0) {
  console.log((quality.stderr || quality.stdout || "").slice(0, 400));
}

var autoSrc = fs.readFileSync(path.join(root, "scripts/auto-actu-publish.cjs"), "utf8");
assert(autoSrc.indexOf("isUnusableActuCandidate") !== -1, "auto-publish filtre les modèles");
var fetchSrc = fs.readFileSync(path.join(root, "scripts/fetch-actu-candidates.cjs"), "utf8");
assert(fetchSrc.indexOf("isUnusableActuCandidate") !== -1, "fetch n'ingère pas les modèles");

process.exit(failed ? 1 : 0);
