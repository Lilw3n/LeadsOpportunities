#!/usr/bin/env node
/**
 * Tests locaux pipeline blog actu (placeholder + qualité).
 */
const assert = require("assert");
const { spawnSync } = require("child_process");
const path = require("path");
const { isPlaceholderQueueItem } = require("./blog-actu-lib.cjs");

assert.strictEqual(
  isPlaceholderQueueItem({
    id: "cafeyn-pending-template",
    title: "COLLEZ ICI le titre de la une Cafeyn (Le Figaro, Le Parisien…)",
  }),
  true,
  "gabarit Cafeyn"
);
assert.strictEqual(
  isPlaceholderQueueItem({
    title: "Mutuelle : ce que change le remboursement des tests cadmium",
    url: "https://www.franceinfo.fr/exemple",
  }),
  false,
  "vrai titre"
);
assert.strictEqual(isPlaceholderQueueItem({ title: "" }), true, "titre vide");

var quality = spawnSync(process.execPath, [path.join(__dirname, "verify-actu-quality.cjs")], {
  input: "",
  encoding: "utf8",
});
assert.strictEqual(quality.status, 0, "qualité stdin vide (CI) : " + quality.stderr);
assert.ok(/Aucun article|Qualité OK/.test(quality.stdout + quality.stderr), quality.stdout);

console.log("OK test-blog-actu-pipeline");
