#!/usr/bin/env node
/**
 * Garde-fous pipeline blog actu (placeholders, qualité, CTA).
 */
var fs = require("fs");
var path = require("path");
var os = require("os");
var { execFileSync } = require("child_process");
var { isPlaceholderActuItem, isLikelyEnglishHeadline, isCoreLeadActu } = require("./blog-actu-lib.cjs");
var { enrichFromCandidate } = require("./blog-actu-enrich.cjs");

var failed = 0;
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
  "placeholder « COLLEZ ICI » ignoré"
);
assert(
  isPlaceholderActuItem({ id: "x", title: "Gabarit", status: "template" }),
  "status template ignoré"
);
assert(
  isLikelyEnglishHeadline("A tornado tears through a village in southern France, wrecking 300 homes"),
  "titre anglais Bing filtré"
);
assert(
  isLikelyEnglishHeadline(
    "HSBC Continental Europe Enters Into a Memorandum of Understanding Regarding Potential Sale"
  ),
  "titre anglais Bing (memorandum) filtré"
);
assert(
  !isLikelyEnglishHeadline("Médicaments, appareils auditifs, soins dentaires bientôt moins remboursés"),
  "titre français conservé"
);
assert(
  !isCoreLeadActu({ title: "Jérôme Fourquet : parc Dragon Ball, la France accepte son destin" }),
  "sujet people/parc d’attractions exclu"
);
assert(
  isCoreLeadActu({ title: "Ostéopathie : quel remboursement avec sa mutuelle en 2026 ?" }),
  "sujet mutuelle conservé"
);

var article = enrichFromCandidate({
  title: "Mutuelle : dépistage cadmium bientôt remboursé",
  summary: "Prise en charge partielle pour une partie des Français.",
  sourceType: "cafeyn",
  suggestedFile: "mutuelle-depistage-cadmium-actu.html",
  need: "sante",
});
assert(article && article.blocks && article.blocks.length >= 6, "enrich ≥ 6 blocs");
assert(
  article.blocks.some(function (b) {
    return b.type === "bridge";
  }),
  "bridge CTA présent"
);
assert(
  article.cta && article.cta.href.indexOf("utm_medium=actu_daily") !== -1,
  "utm_medium=actu_daily sur le CTA"
);
assert(article.description && article.description.length >= 80, "meta description ≥ 80");

var tmp = path.join(os.tmpdir(), "verify-actu-quality-" + Date.now() + ".json");
fs.writeFileSync(tmp, JSON.stringify({ articles: [article] }), "utf8");
try {
  execFileSync(process.execPath, [path.join(__dirname, "verify-actu-quality.cjs"), "--file=" + tmp], {
    stdio: "pipe",
    cwd: path.join(__dirname, ".."),
  });
  assert(true, "verify-actu-quality --file OK");
} catch (e) {
  assert(false, "verify-actu-quality --file: " + (e.stderr || e.stdout || e.message));
} finally {
  try {
    fs.unlinkSync(tmp);
  } catch (e2) {}
}

try {
  require("./blog-actu-queue-db.cjs");
  assert(true, "blog-actu-queue-db charge api/_lib/db");
} catch (e) {
  assert(false, "blog-actu-queue-db: " + e.message);
}

var queue = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "blog-actu-queue.json"), "utf8"));
var livePlaceholders = (queue.items || []).filter(function (item) {
  return item.status === "pending" || item.status === "queued";
}).filter(isPlaceholderActuItem);
assert(livePlaceholders.length === 0, "aucun placeholder pending/queued dans la file");

if (failed) {
  console.error("\n" + failed + " échec(s) pipeline actu");
  process.exit(1);
}
console.log("\nPipeline actu OK.");
