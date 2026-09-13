#!/usr/bin/env node
/**
 * Garde-fous pipeline blog actu auto (cron GitHub + Cursor).
 */
var fs = require("fs");
var path = require("path");
var { execSync } = require("child_process");
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

assert(isPlaceholderActuItem({ id: "cafeyn-pending-template", title: "x" }), "id template Cafeyn");
assert(
  isPlaceholderActuItem({ title: "COLLEZ ICI le titre de la une Cafeyn (Le Figaro)" }),
  "titre COLLEZ ICI"
);
assert(!isPlaceholderActuItem({ title: "Mutuelle : reste à charge canicule 2026" }), "titre réel accepté");

var queue = JSON.parse(fs.readFileSync(path.join(root, "data/blog-actu-queue.json"), "utf8"));
var pendingPlaceholders = (queue.items || []).filter(function (item) {
  return isPlaceholderActuItem(item) && item.status !== "rejected" && item.status !== "published";
});
assert(!pendingPlaceholders.length, "aucun placeholder actif dans la file");

var qualitySrc = fs.readFileSync(path.join(root, "scripts/verify-actu-quality.cjs"), "utf8");
assert(qualitySrc.indexOf("indexOf(\"--stdin\")") !== -1, "qualité : stdin uniquement avec --stdin");
assert(qualitySrc.indexOf("isTTY") === -1, "qualité : plus de branche isTTY (casse le cron CI)");

var autoSrc = fs.readFileSync(path.join(root, "scripts/auto-actu-publish.cjs"), "utf8");
assert(autoSrc.indexOf("isPlaceholderActuItem") !== -1, "auto-publish ignore les placeholders");

try {
  execSync("node scripts/verify-actu-quality.cjs", {
    cwd: root,
    stdio: ["pipe", "pipe", "pipe"],
    encoding: "utf8",
  });
  assert(true, "verify-actu-quality sans TTY (stdin vide) ne crash pas");
} catch (e) {
  var err = String((e && e.stderr) || e.message || e);
  assert(err.indexOf("Unexpected end of JSON") === -1, "verify-actu-quality ne parse plus un stdin vide");
  if (err.indexOf("Unexpected end of JSON") === -1 && e.status) {
    assert(true, "verify-actu-quality exit " + e.status + " (pending invalide OK, pas un JSON stdin)");
  }
}

if (failed) {
  console.error("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nPipeline actu auto OK.");
