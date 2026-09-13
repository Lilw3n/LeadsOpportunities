#!/usr/bin/env node
/** Garde-fous pipeline blog actu : placeholders + qualité CI. */
var { spawnSync } = require("child_process");
var path = require("path");
var {
  isPlaceholderActuTitle,
  isActionableQueueItem,
  readJson,
} = require("./blog-actu-lib.cjs");

var failed = 0;
function assert(cond, msg) {
  if (!cond) {
    failed += 1;
    console.log("FAIL", msg);
  } else {
    console.log("OK  ", msg);
  }
}

assert(isPlaceholderActuTitle("COLLEZ ICI le titre de la une Cafeyn (Le Figaro, Le Parisien…)"), "placeholder Cafeyn");
assert(isPlaceholderActuTitle(""), "titre vide");
assert(isPlaceholderActuTitle("TODO article mutuelle") === true, "TODO");
assert(isPlaceholderActuTitle("Coupe du monde 2026 : les Bleus") === false, "titre réel");

assert(
  isActionableQueueItem({
    title: "COLLEZ ICI le titre de la une Cafeyn (Le Figaro, Le Parisien…)",
    status: "pending",
  }) === false,
  "queue placeholder non actionnable"
);
assert(
  isActionableQueueItem({
    title: "Mutuelle : reste à charge canicule",
    status: "queued",
  }) === true,
  "queue réelle actionnable"
);
assert(
  isActionableQueueItem({
    title: "Mutuelle : reste à charge canicule",
    status: "template",
  }) === false,
  "status template ignoré"
);

var queue = readJson("blog-actu-queue.json", { items: [] });
(queue.items || []).forEach(function (item) {
  if (item.status === "pending" || item.status === "queued") {
    assert(!isPlaceholderActuTitle(item.title), "queue " + item.id + " sans placeholder");
  }
});

var verify = path.join(__dirname, "verify-actu-quality.cjs");
var ciLike = spawnSync(process.execPath, [verify], {
  cwd: path.join(__dirname, ".."),
  encoding: "utf8",
  stdio: ["pipe", "pipe", "pipe"],
});
assert(ciLike.status === 0, "verify-actu-quality sans TTY (CI) ne crash pas");
assert(
  String(ciLike.stderr || "").indexOf("Unexpected end of JSON input") === -1,
  "pas de JSON.parse stdin vide"
);

if (failed) {
  console.error("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nPipeline actu OK");
