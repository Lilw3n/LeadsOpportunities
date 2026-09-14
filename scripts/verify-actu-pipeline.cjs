#!/usr/bin/env node
/**
 * Gardes pipeline blog actu (placeholders + contrôle qualité CI).
 */
const assert = require("assert");
const { spawnSync } = require("child_process");
const path = require("path");
const { isPlaceholderActuItem } = require("./blog-actu-lib.cjs");
const { validateArticle } = require("./verify-actu-quality.cjs");

var ROOT = path.join(__dirname, "..");
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

check("placeholder titre Cafeyn", function () {
  assert.strictEqual(
    isPlaceholderActuItem({
      id: "cafeyn-pending-template",
      title: "COLLEZ ICI le titre de la une Cafeyn (Le Figaro, Le Parisien…)",
      status: "pending",
    }),
    true
  );
});

check("placeholder status template", function () {
  assert.strictEqual(isPlaceholderActuItem({ title: "Une vraie actu mutuelle", status: "template" }), true);
});

check("vrai titre RSS non filtré", function () {
  assert.strictEqual(
    isPlaceholderActuItem({
      title: "Mutuelle : ce qui change pour les remboursements en 2026",
      url: "https://www.franceinfo.fr/exemple",
      status: "candidate",
    }),
    false
  );
});

check("qualité refuse un titre placeholder", function () {
  var errs = validateArticle({
    file: "collez-ici.html",
    title: "COLLEZ ICI le titre de la une Cafeyn",
    description: "x".repeat(90),
    cta: { href: "/questionnaire.html?utm_medium=actu_daily" },
    blocks: [
      { type: "p", text: "a" },
      { type: "h2", text: "b" },
      { type: "p", text: "c" },
      { type: "h2", text: "d" },
      { type: "p", text: "e" },
      { type: "bridge" },
    ],
  });
  assert.ok(errs.some(function (e) {
    return e.indexOf("placeholder") !== -1;
  }));
});

check("qualité CI : stdin vide → pending.json (pas de crash JSON)", function () {
  var res = spawnSync(process.execPath, ["scripts/verify-actu-quality.cjs"], {
    cwd: ROOT,
    encoding: "utf8",
    input: "",
    stdio: ["pipe", "pipe", "pipe"],
  });
  assert.strictEqual(res.status, 0, res.stderr || res.stdout);
  assert.ok(!/Unexpected end of JSON/i.test(res.stderr + res.stdout));
});

if (failed) {
  console.error("\n" + failed + " garde(s) en échec.");
  process.exit(1);
}
console.log("\nPipeline actu : gardes OK.");
