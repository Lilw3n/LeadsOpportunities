#!/usr/bin/env node
/**
 * Garde-fous pipeline blog actu (cron GitHub + file manuelle).
 */
var fs = require("fs");
var path = require("path");
var { spawnSync } = require("child_process");
var { isPlaceholderActuItem } = require("./blog-actu-lib.cjs");

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
  isPlaceholderActuItem({
    id: "cafeyn-pending-template",
    title: "COLLEZ ICI le titre de la une Cafeyn (Le Figaro, Le Parisien…)",
  }),
  "placeholder Cafeyn détecté"
);
assert(!isPlaceholderActuItem({ title: "Mutuelle : dépassements d'honoraires en 2026" }), "titre réel accepté");
assert(isPlaceholderActuItem({ title: "" }), "titre vide rejeté");

var { isEnglishActuTitle, isLeadWorthyActuCandidate } = require("./blog-actu-lib.cjs");
assert(
  isEnglishActuTitle("HSBC Continental Europe Enters Into a Memorandum of Understanding Regarding Potential Sale"),
  "titre anglais filtré"
);
assert(
  !isLeadWorthyActuCandidate({
    title: "EN DIRECT - Inondations dévastatrices au Népal et au Tibet : le bilan atteint 359 morts",
  }),
  "actu internationale hors leads filtrée"
);
assert(
  isLeadWorthyActuCandidate({
    title: "Nouvelle cyber attaque massive d’une mutuelle : plus d’un million d’assurés concernés",
  }),
  "mutuelle cyberattaque = lead"
);
assert(
  isLeadWorthyActuCandidate({
    title: "Arbres couchés, toitures arrachées... Les images des orages survenus dans l'ouest de la France",
  }),
  "orages toitures = lead habitation"
);

var queue = JSON.parse(fs.readFileSync(path.join(root, "data/blog-actu-queue.json"), "utf8"));
var template = (queue.items || []).find(function (i) {
  return i.id === "cafeyn-pending-template" || /collez ici/i.test(i.title || "");
});
if (template) {
  assert(template.status === "rejected", "placeholder file = rejected (pas pending/queued)");
} else {
  console.log("OK   pas de placeholder dans la file");
}

var wf = fs.readFileSync(path.join(root, ".github/workflows/blog-actu-auto.yml"), "utf8");
assert(/node-version:\s*"22"/.test(wf), "workflow Node 22");
assert(/blog:actu:auto/.test(wf), "workflow lance blog:actu:auto");

var quality = spawnSync(process.execPath, [path.join(__dirname, "verify-actu-quality.cjs")], {
  cwd: root,
  encoding: "utf8",
  input: "",
  stdio: ["pipe", "pipe", "pipe"],
});
assert(quality.status === 0, "qualité stdin vide ne crash pas (code " + quality.status + ")");
assert(
  !/Unexpected end of JSON input/.test(quality.stderr || "") &&
    !/Unexpected end of JSON input/.test(quality.stdout || ""),
  "pas de JSON.parse(stdin vide)"
);

var qualitySrc = fs.readFileSync(path.join(root, "scripts/verify-actu-quality.cjs"), "utf8");
assert(qualitySrc.indexOf("loadPendingArticles") !== -1, "qualité relit pending si stdin vide");

var autoSrc = fs.readFileSync(path.join(root, "scripts/auto-actu-publish.cjs"), "utf8");
assert(autoSrc.indexOf("isPlaceholderActuItem") !== -1, "auto-publish ignore les placeholders");
assert(autoSrc.indexOf('stdio: ["ignore"') !== -1, "auto-publish n'hérite pas stdin CI");

process.exit(failed ? 1 : 0);
