#!/usr/bin/env node
/**
 * Garde-fous pipeline blog actu auto (file template + qualité CI).
 */
var fs = require("fs");
var path = require("path");
var { spawnSync } = require("child_process");
var { isQueuePlaceholder, looksEnglishTitle, isStaleCandidate, isHighIntentLeadCandidate } = require("./blog-actu-lib.cjs");

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

var queue = JSON.parse(fs.readFileSync(path.join(root, "data/blog-actu-queue.json"), "utf8"));
var template = (queue.items || []).find(function (i) {
  return i.id === "cafeyn-pending-template";
});
assert(!!template, "gabarit Cafeyn présent dans la file");
assert(template && template.status !== "pending" && template.status !== "queued", "gabarit Cafeyn n'est plus pending");
assert(isQueuePlaceholder(template), "isQueuePlaceholder détecte le gabarit");
assert(
  isQueuePlaceholder({ title: "COLLEZ ICI le titre de la une Cafeyn", status: "pending" }),
  "isQueuePlaceholder détecte le titre COLLEZ ICI"
);
assert(!isQueuePlaceholder({ id: "rss-ok", title: "Mutuelle : reste à charge 2026", status: "pending" }), "vrai sujet non filtré");
assert(
  looksEnglishTitle("HSBC Continental Europe Enters Into a Memorandum of Understanding Regarding Potential Sale"),
  "titre anglais HSBC filtré"
);
assert(!looksEnglishTitle("Franchise médicale : le plafond annuel passera à 140 euros"), "titre FR franchise conservé");
assert(
  isStaleCandidate({ pubDate: "Fri, 20 Dec 2024 06:32:00 GMT" }, 21),
  "communiqué 2024 considéré périmé"
);
assert(
  isHighIntentLeadCandidate({ title: "Franchise médicale : le plafond annuel passera à 140 euros" }),
  "franchise médicale = intent lead"
);

(queue.items || []).forEach(function (item) {
  if (isQueuePlaceholder(item)) return;
  if (item.status === "pending" || item.status === "queued") {
    assert(String(item.title || "").trim().length > 12, "item actif a un titre réel: " + item.id);
  }
});

var qualitySrc = fs.readFileSync(path.join(root, "scripts/verify-actu-quality.cjs"), "utf8");
assert(qualitySrc.indexOf("loadPendingFile") !== -1, "qualité : fallback pending si stdin vide");
assert(qualitySrc.indexOf(".trim()") !== -1, "qualité : stdin vide ignoré");

var ingestSrc = fs.readFileSync(path.join(root, "scripts/fetch-actu-candidates.cjs"), "utf8");
assert(ingestSrc.indexOf("isQueuePlaceholder") !== -1, "fetch ignore les gabarits");

var autoSrc = fs.readFileSync(path.join(root, "scripts/auto-actu-publish.cjs"), "utf8");
assert(autoSrc.indexOf("isQueuePlaceholder") !== -1, "auto-publish ignore les gabarits");

var emptyStdin = spawnSync(process.execPath, [path.join(root, "scripts/verify-actu-quality.cjs")], {
  cwd: root,
  input: "",
  encoding: "utf8",
});
assert(emptyStdin.status === 0, "qualité CI stdin vide → exit 0 (pending vide)");
assert(!/Unexpected end of JSON/i.test(emptyStdin.stderr || ""), "plus de SyntaxError JSON stdin vide");

if (failed) {
  console.error("\nverify-actu-auto: " + failed + " échec(s)");
  process.exit(1);
}
console.log("\nverify-actu-auto OK");
