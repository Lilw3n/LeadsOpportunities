#!/usr/bin/env node
/**
 * Tests locaux du pipeline blog actu (sans réseau).
 * Usage: node scripts/test-blog-actu-pipeline.cjs
 */
const assert = require("assert");
const { spawnSync } = require("child_process");
const path = require("path");
const { isPlaceholderQueueItem, rankCandidates } = require("./blog-actu-lib.cjs");
const { franceLeadScoreAdjust } = require("./france-audience-lib.cjs");

var failed = 0;

function check(name, fn) {
  try {
    fn();
    console.log("[OK]", name);
  } catch (e) {
    failed += 1;
    console.error("[FAIL]", name, "—", e.message);
  }
}

check("placeholder Cafeyn ignoré", function () {
  assert.strictEqual(
    isPlaceholderQueueItem({
      id: "cafeyn-pending-template",
      title: "COLLEZ ICI le titre de la une Cafeyn (Le Figaro, Le Parisien…)",
      status: "pending",
    }),
    true
  );
});

check("vraie une Cafeyn conservée", function () {
  assert.strictEqual(
    isPlaceholderQueueItem({
      id: "cafeyn-figaro-1",
      title: "Mutuelle : ce qui change pour les remboursements en 2026",
      url: "https://www.lefigaro.fr/exemple",
    }),
    false
  );
});

check("rankCandidates écarte le gabarit", function () {
  var ranked = rankCandidates([
    {
      title: "COLLEZ ICI le titre de la une Cafeyn (Le Figaro, Le Parisien…)",
      status: "queued",
      sourceType: "cafeyn",
    },
    {
      title: "Sophrologie : quel remboursement avec sa mutuelle en 2026",
      status: "queued",
      sourceType: "edge",
      need: "sante",
    },
  ]);
  assert.strictEqual(ranked.length, 1);
  assert.ok(ranked[0].title.indexOf("Sophrologie") === 0);
});

check("sport étranger sans angle FR pénalisé", function () {
  var foreign = franceLeadScoreAdjust({ title: "Barcelone écrase le Pays-Bas en amical" });
  var france = franceLeadScoreAdjust({ title: "Les Bleus : mutuelle des supporters en déplacement" });
  assert.ok(foreign < 0, "delta sport étranger=" + foreign);
  assert.ok(france > foreign, "France doit scorer plus haut");
});

check("verify-actu-quality lit pending.json si stdin vide (CI)", function () {
  var result = spawnSync(process.execPath, [path.join(__dirname, "verify-actu-quality.cjs")], {
    input: "",
    encoding: "utf8",
    cwd: path.join(__dirname, ".."),
  });
  assert.notStrictEqual(result.status, null, "processus non lancé");
  assert.ok(
    result.status === 0,
    "exit=" + result.status + " stderr=" + (result.stderr || "").slice(0, 400)
  );
  assert.ok(
    /Aucun article à vérifier|Qualité OK/i.test(result.stdout || ""),
    "stdout inattendu: " + (result.stdout || "").slice(0, 200)
  );
});

if (failed) {
  console.error("\n" + failed + " test(s) en échec");
  process.exit(1);
}
console.log("\nPipeline blog actu: tests OK");
