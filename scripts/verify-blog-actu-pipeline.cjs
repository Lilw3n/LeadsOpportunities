#!/usr/bin/env node
/**
 * Garde-fous pipeline blog actu → leads (placeholders, qualité CI).
 */
var fs = require("fs");
var path = require("path");
var { execFileSync } = require("child_process");
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
    status: "pending",
  }),
  "titre COLLEZ ICI = placeholder"
);
assert(
  isPlaceholderActuItem({ id: "foo", title: "Taux immobilier 2026", status: "queued" }) === false,
  "titre réel n'est pas un placeholder"
);
assert(isPlaceholderActuItem({ id: "x", title: "", status: "pending" }), "titre vide = placeholder");
assert(
  isPlaceholderActuItem({ id: "manual", title: "Mutuelle", status: "template" }),
  "status template = placeholder"
);

var audience = require("./france-audience-lib.cjs");
assert(
  audience.isWeakLeadActuTopic(
    "Côte d'Ivoire : le président guinéen Mamadi Doumbouya en visite officielle"
  ),
  "diplomatie étrangère = faible lead"
);
assert(
  audience.isFranceMarketTopic("Les précisions de Jean Barrere, correspondant France 24 à Abidjan.") === false,
  "France 24 dans un résumé ne compte pas comme marché FR"
);
assert(
  audience.isFranceMarketTopic("Dette française : gel des pensions, hausse d'impôts"),
  "dette / pensions = marché FR"
);

var queue = JSON.parse(fs.readFileSync(path.join(root, "data/blog-actu-queue.json"), "utf8"));
var template = (queue.items || []).find(function (it) {
  return it.id === "cafeyn-pending-template";
});
assert(!!template, "gabarit Cafeyn conservé dans la file");
assert(template && template.status === "template", "gabarit Cafeyn n'est plus pending");
assert(template && isPlaceholderActuItem(template), "gabarit Cafeyn filtré par isPlaceholderActuItem");

var qualitySrc = fs.readFileSync(path.join(root, "scripts/verify-actu-quality.cjs"), "utf8");
assert(qualitySrc.indexOf("stdin.isTTY") !== -1, "qualité lit stdin seulement si présent");
assert(/stdin[\s\S]{0,80}trim\(/.test(qualitySrc), "stdin vide ignoré (trim)");

var out = execFileSync(process.execPath, [path.join(root, "scripts/verify-actu-quality.cjs")], {
  cwd: root,
  encoding: "utf8",
  input: "",
  stdio: ["pipe", "pipe", "pipe"],
});
assert(out.indexOf("Aucun article") !== -1 || out.indexOf("Qualité OK") !== -1, "qualité CI stdin vide ne crash pas");

var autoSrc = fs.readFileSync(path.join(root, "scripts/auto-actu-publish.cjs"), "utf8");
assert(autoSrc.indexOf("isPlaceholderActuItem") !== -1, "auto-publish ignore les placeholders");
var fetchSrc = fs.readFileSync(path.join(root, "scripts/fetch-actu-candidates.cjs"), "utf8");
assert(fetchSrc.indexOf("isPlaceholderActuItem") !== -1, "fetch ignore les placeholders");

process.exit(failed ? 1 : 0);
