#!/usr/bin/env node
/** Garde-fous pipeline actu : placeholder Cafeyn + qualité stdin vide. */
var assert = require("assert");
var { spawnSync } = require("child_process");
var path = require("path");
var { isPlaceholderActuItem, isLowLeadIntentActu, hasLeadIntentKeywords, isEnglishHeavyTitle } = require("./blog-actu-lib.cjs");

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

assert.strictEqual(
  isLowLeadIntentActu({ title: "Avant le premier concert de Céline Dion, Emmanuel Grégoire s’époumone" }),
  true,
  "people Céline Dion ignoré"
);
assert.strictEqual(
  isEnglishHeavyTitle("HSBC Continental Europe Enters Into a Memorandum of Understanding Regarding Potential Sale"),
  true,
  "titre anglais corporate ignoré"
);
assert.strictEqual(
  hasLeadIntentKeywords({ title: "Assurance habitation : primes et sinistres, bilan 2025" }),
  true,
  "intent habitation"
);
assert.strictEqual(
  hasLeadIntentKeywords({ title: "La choucroute alsacienne victime de la sécheresse" }),
  false,
  "sécheresse agricole sans assurance"
);
assert.strictEqual(
  hasLeadIntentKeywords({ title: "Camionnettes de prostitution, trafic de drogue, zombies à Lyon" }),
  false,
  "faits divers sans assurance"
);
assert.strictEqual(
  isLowLeadIntentActu({ title: "Emprunteur : Allianz France et Magnolia créent un contrat pour les gros capitaux" }),
  false,
  "emprunteur conservé"
);
assert.strictEqual(
  hasLeadIntentKeywords({
    title: "Coupe du monde 2026 - On n'a pas peur : deux ans après, les Bleus sont prêtes pour une revanche",
  }),
  false,
  "sport sans mot assurance ignoré"
);
assert.strictEqual(
  isEnglishHeavyTitle(
    "HSBC Continental Europe Enters Into a Memorandum of Understanding Regarding Potential Sale of HSBC Assurances Vie (France) to Matmut Société d’Assurance Mutuelle"
  ),
  true,
  "HSBC EN + Mutuelle toujours anglais"
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
