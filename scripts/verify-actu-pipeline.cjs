#!/usr/bin/env node
/** Garde-fous pipeline actu : placeholder Cafeyn + qualité stdin vide. */
var assert = require("assert");
var { spawnSync } = require("child_process");
var path = require("path");
var { isPlaceholderActuItem } = require("./blog-actu-lib.cjs");

assert.strictEqual(
  isPlaceholderActuItem({
    id: "cafeyn-pending-template",
    title: "COLLEZ ICI le titre de la une Cafeyn (Le Figaro, Le Parisien…)",
  }),
  true,
  "template Cafeyn ignoré"
);
assert.strictEqual(isPlaceholderActuItem({ title: "COLLEZ ICI un titre" }), true, "titre COLLEZ ICI");
assert.strictEqual(isPlaceholderActuItem({ title: "" }), true, "titre vide");
assert.strictEqual(
  isPlaceholderActuItem({
    title: "Mutuelle : ce qui change pour les retraités en 2026",
    id: "rss-mutuelle-retraites",
  }),
  false,
  "vrai titre conservé"
);

var root = path.join(__dirname, "..");
var emptyStdin = spawnSync("node", ["scripts/verify-actu-quality.cjs"], {
  cwd: root,
  encoding: "utf8",
  input: "",
});
assert.strictEqual(emptyStdin.status, 0, "qualité stdin vide ne plante pas: " + (emptyStdin.stderr || emptyStdin.stdout));
assert.ok(
  /Aucun article à vérifier|Qualité OK/.test(emptyStdin.stdout || ""),
  "message qualité stdin vide"
);

console.log("verify-actu-pipeline: OK");
