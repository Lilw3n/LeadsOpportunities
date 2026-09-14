#!/usr/bin/env node
/** Garde-fous pipeline actu → leads (placeholder inbox + contrôle qualité CI). */
var path = require("path");
var { spawnSync } = require("child_process");
var { isPlaceholderQueueItem, readJson, matchTopic, scoreLeadPotential, relatedForSection } = require("./blog-actu-lib.cjs");

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
  isPlaceholderQueueItem({
    id: "cafeyn-pending-template",
    title: "COLLEZ ICI le titre de la une Cafeyn (Le Figaro, Le Parisien…)",
    status: "pending",
  }),
  "placeholder Cafeyn ignoré même en pending"
);
assert(
  isPlaceholderQueueItem({
    id: "manual-1",
    title: "Taux du prêt immobilier",
    status: "template",
  }),
  "statut template ignoré"
);
assert(
  !isPlaceholderQueueItem({
    id: "taux-10-ans",
    title: "Les taux français à 10 ans passent le seuil des 4,5%",
    status: "queued",
  }),
  "vraie une RSS conservée"
);
assert(matchTopic("Les taux français à 10 ans et le prêt immobilier").matched, "taux/prêt = niche emprunteur");
assert(!matchTopic("Guerre en Ukraine : Poutine veut désunir l’Europe").matched, "géopolitique sans niche");
var warScore = scoreLeadPotential({
  title: "Guerre en Ukraine : Poutine veut désunir l’Europe",
  sourceType: "cafeyn",
});
var rateScore = scoreLeadPotential({
  title: "Les taux français à 10 ans passent le seuil des 4,5%, prêt immobilier",
  sourceType: "cafeyn",
});
assert(rateScore > warScore, "une crédit score au-dessus d’une géopolitique");

var queue = readJson("blog-actu-queue.json", { items: [] });
var livePlaceholders = (queue.items || []).filter(function (item) {
  return isPlaceholderQueueItem(item) && item.status === "pending";
});
assert(livePlaceholders.length === 0, "aucun placeholder pending dans la file");

var root = path.join(__dirname, "..");
var emptyStdin = spawnSync(process.execPath, ["scripts/verify-actu-quality.cjs"], {
  cwd: root,
  encoding: "utf8",
  input: "",
});
assert(emptyStdin.status === 0, "stdin vide (CI) ne casse plus le contrôle qualité");
assert(
  /Aucun article à vérifier|Qualité OK/.test(emptyStdin.stdout || ""),
  "fallback pending si stdin CI vide"
);
assert(
  relatedForSection("finance").some(function (l) {
    return String(l.href).indexOf("nancy-metropole") !== -1 && /Varangéville/.test(l.label);
  }),
  "liens emprunteur → bassin Nancy / Varangéville"
);

process.exit(failed ? 1 : 0);
