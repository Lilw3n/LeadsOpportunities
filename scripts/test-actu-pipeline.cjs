#!/usr/bin/env node
/**
 * Garde-fous pipeline actu (cron GitHub + agent Cursor).
 * Usage: node scripts/test-actu-pipeline.cjs
 */
const assert = require("assert");
const { spawnSync } = require("child_process");
const path = require("path");
const {
  isPlaceholderCandidate,
  looksLikeEnglishHeadline,
  isStaleActuCandidate,
  scoreLeadPotential,
} = require("./blog-actu-lib.cjs");
const { validateArticle } = require("./verify-actu-quality.cjs");

var failed = 0;
function check(name, fn) {
  try {
    fn();
    console.log("OK  ", name);
  } catch (e) {
    failed += 1;
    console.error("FAIL", name, "—", e.message);
  }
}

check("placeholder COLLEZ ICI", function () {
  assert.strictEqual(
    isPlaceholderCandidate({
      id: "cafeyn-pending-template",
      title: "COLLEZ ICI le titre de la une Cafeyn (Le Figaro, Le Parisien…)",
      status: "pending",
    }),
    true
  );
});

check("placeholder status template", function () {
  assert.strictEqual(
    isPlaceholderCandidate({ title: "Vraie une Figaro mutuelle", status: "template" }),
    true
  );
});

check("vrai titre FR non placeholder", function () {
  assert.strictEqual(
    isPlaceholderCandidate({
      title: "Mutuelle santé : comment choisir sa complémentaire en 2026",
      status: "queued",
    }),
    false
  );
});

check("titre anglais Business Wire", function () {
  assert.strictEqual(
    looksLikeEnglishHeadline("Company enters into memorandum of understanding regarding potential sale"),
    true
  );
});

check("titre français conservé", function () {
  assert.strictEqual(
    looksLikeEnglishHeadline("Mutuelle santé : les 5 critères pour comparer en 2026"),
    false
  );
});

check("actu trop ancienne", function () {
  assert.strictEqual(
    isStaleActuCandidate({ pubDate: "2025-01-01T00:00:00.000Z" }, 21),
    true
  );
});

check("actu récente OK", function () {
  assert.strictEqual(isStaleActuCandidate({ pubDate: new Date().toISOString() }, 21), false);
});

check("mutuelle score > sport empilé", function () {
  var mutuelle = scoreLeadPotential({
    title: "Mutuelle santé : comment choisir sa complémentaire",
    summary: "assurance mutuelle remboursement",
    need: "sante",
    sourceType: "edge",
    status: "candidate",
    pubDate: new Date().toISOString(),
  });
  var sport = scoreLeadPotential({
    title: "Équipe de France : Zinédine Zidane annonce son staff chez les Bleus",
    summary: "coupe du monde mbappe deschamps supporters",
    need: "sante",
    sourceType: "cafeyn",
    status: "candidate",
    pubDate: new Date().toISOString(),
  });
  assert.ok(mutuelle >= sport, "mutuelle=" + mutuelle + " sport=" + sport);
});

check("article enrichi passe le contrôle qualité", function () {
  var errs = validateArticle({
    file: "test-mutuelle.html",
    title: "Mutuelle 2026 : que faire ?",
    description: "Une meta description assez longue pour passer le seuil de quatre-vingts caractères minimum.",
    cta: { href: "../landings/questionnaire.html?need=sante&utm_medium=actu_daily", label: "Questionnaire" },
    blocks: [
      { type: "p", text: "p1" },
      { type: "h2", text: "h2" },
      { type: "p", text: "p2" },
      { type: "ul", items: ["a"] },
      { type: "bridge" },
      { type: "h2", text: "h2b" },
      { type: "p", text: "p3" },
    ],
  });
  assert.deepStrictEqual(errs, []);
});

check("verify-actu-quality stdin vide (CI) ne crash pas", function () {
  var r = spawnSync(process.execPath, [path.join(__dirname, "verify-actu-quality.cjs")], {
    input: "",
    encoding: "utf8",
  });
  assert.notStrictEqual(r.status, null);
  assert.ok(
    r.status === 0,
    "exit=" + r.status + " stderr=" + (r.stderr || "").slice(0, 400) + " stdout=" + (r.stdout || "").slice(0, 400)
  );
  assert.ok(
    !/Unexpected end of JSON input/.test(r.stderr || "") && !/Unexpected end of JSON input/.test(r.stdout || ""),
    "JSON.parse stdin vide encore présent"
  );
});

if (failed) {
  console.error("\n" + failed + " test(s) en échec");
  process.exit(1);
}
console.log("\nTous les tests pipeline actu OK.");
