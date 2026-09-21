#!/usr/bin/env node
/**
 * Garde-fous pipeline actu auto (file placeholder + contrôle qualité CI).
 */
var fs = require("fs");
var path = require("path");
var { spawnSync } = require("child_process");
var { isPlaceholderActuItem } = require("./blog-actu-lib.cjs");
var { validateArticle } = require("./verify-actu-quality.cjs");

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
    status: "pending",
  }),
  "gabarit COLLEZ ICI détecté comme placeholder"
);
assert(
  isPlaceholderActuItem({ title: "Taux du prêt immobilier en septembre 2026", status: "queued" }) === false,
  "titre réel n'est pas un placeholder"
);
assert(isPlaceholderActuItem({ title: "", url: "https://example.fr" }), "titre vide = placeholder");
assert(isPlaceholderActuItem({ title: "Une vraie une", status: "template" }), "status template = placeholder");

var queue = JSON.parse(fs.readFileSync(path.join(root, "data", "blog-actu-queue.json"), "utf8"));
var template = (queue.items || []).find(function (i) {
  return i.id === "cafeyn-pending-template";
});
assert(template, "gabarit Cafeyn toujours dans la file (aide inbox)");
assert(template && template.status === "template", "gabarit Cafeyn en status template (non publiable)");

var placeholderErrs = validateArticle({
  title: "COLLEZ ICI le titre de la une Cafeyn",
  file: "collez-ici.html",
  description: "x".repeat(90),
  cta: { href: "/landings/assurance-habitation.html?utm_medium=actu_daily" },
  blocks: [
    { type: "p", text: "a" },
    { type: "h2", text: "b" },
    { type: "p", text: "c" },
    { type: "ul", items: ["1"] },
    { type: "bridge" },
    { type: "p", text: "d" },
  ],
});
assert(
  placeholderErrs.some(function (e) {
    return e.indexOf("placeholder") !== -1;
  }),
  "qualité refuse un titre placeholder"
);

var quality = spawnSync("node", ["scripts/verify-actu-quality.cjs"], {
  cwd: root,
  encoding: "utf8",
  input: "",
});
assert(quality.status === 0, "qualité avec stdin vide (CI) ne plante pas, exit=" + quality.status);
assert(
  /Aucun article à vérifier|Qualité OK/.test(String(quality.stdout || "")),
  "qualité stdin vide lit le pending au lieu de JSON.parse('')"
);

var autoSrc = fs.readFileSync(path.join(root, "scripts", "auto-actu-publish.cjs"), "utf8");
assert(autoSrc.indexOf("--file=data/blog-actu-pending.json") !== -1, "auto-publish pointe le pending pour la qualité");
assert(autoSrc.indexOf("isPlaceholderActuItem") !== -1, "auto-publish ignore les placeholders");

var fetchSrc = fs.readFileSync(path.join(root, "scripts", "fetch-actu-candidates.cjs"), "utf8");
assert(fetchSrc.indexOf("isPlaceholderActuItem") !== -1, "fetch n'ingère pas les gabarits inbox");

if (failed) {
  console.error("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nPipeline actu auto OK");
