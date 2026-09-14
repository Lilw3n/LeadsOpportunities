#!/usr/bin/env node
/**
 * Garde-fous pipeline actu auto (placeholder inbox + qualité CI).
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
  }) === true,
  "template Cafeyn ignoré"
);
assert(
  isPlaceholderActuItem({
    title: "Les taux français à 10 ans passent le seuil des 4,5%",
    url: "https://example.fr/taux",
  }) === false,
  "titre RSS réel accepté"
);
assert(isPlaceholderActuItem({ title: "" }) === true, "titre vide ignoré");

var queue = JSON.parse(fs.readFileSync(path.join(root, "data/blog-actu-queue.json"), "utf8"));
(queue.items || []).forEach(function (item) {
  if (!isPlaceholderActuItem(item)) return;
  assert(
    item.status === "rejected" || item.status === "published",
    "placeholder " + item.id + " non publiable (status=" + item.status + ")"
  );
});

var qualitySrc = fs.readFileSync(path.join(root, "scripts/verify-actu-quality.cjs"), "utf8");
assert(qualitySrc.indexOf("wantStdin") !== -1, "qualité : --stdin explicite (pas TTY CI)");
assert(qualitySrc.indexOf("!process.stdin.isTTY") === -1, "qualité : plus de branche isTTY");

var autoSrc = fs.readFileSync(path.join(root, "scripts/auto-actu-publish.cjs"), "utf8");
assert(autoSrc.indexOf("isPlaceholderActuItem") !== -1, "auto-publish filtre les placeholders");

var fetchSrc = fs.readFileSync(path.join(root, "scripts/fetch-actu-candidates.cjs"), "utf8");
assert(fetchSrc.indexOf("isPlaceholderActuItem") !== -1, "fetch ignore les placeholders queue");

var piped = spawnSync("node", ["scripts/verify-actu-quality.cjs"], {
  cwd: root,
  encoding: "utf8",
  input: "",
});
assert(piped.status === 0, "qualité CI stdin vide → pending.json (exit " + piped.status + ")");
assert(
  String(piped.stderr || "").indexOf("Unexpected end of JSON") === -1,
  "qualité CI : pas de JSON.parse stdin vide"
);

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nPipeline actu auto OK");
