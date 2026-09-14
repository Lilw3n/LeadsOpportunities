#!/usr/bin/env node
/**
 * Garde-fou pipeline actu → leads (placeholder Cafeyn, scoring, qualité CI).
 */
const { spawnSync } = require("child_process");
const path = require("path");
const {
  isPlaceholderQueueItem,
  scoreLeadPotential,
  readJson,
} = require("./blog-actu-lib.cjs");

var failed = 0;

function ok(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    failed += 1;
  } else {
    console.log("OK:", msg);
  }
}

ok(
  isPlaceholderQueueItem({
    title: "COLLEZ ICI le titre de la une Cafeyn (Le Figaro, Le Parisien…)",
    id: "cafeyn-pending-template",
  }),
  "placeholder inbox détecté"
);
ok(
  !isPlaceholderQueueItem({
    title: "Les taux français à 10 ans passent le seuil des 4,5%",
    url: "https://example.com/taux",
  }),
  "vraie une conservée"
);

var phScore = scoreLeadPotential({
  title: "COLLEZ ICI le titre de la une Cafeyn (Le Figaro, Le Parisien…)",
  summary: "Angle assurance a preciser",
  status: "queued",
  sourceType: "cafeyn",
  need: "habitation",
  section: "actu",
  id: "cafeyn-pending-template",
});
ok(phScore === 0, "score placeholder = 0 (got " + phScore + ")");

var geo = scoreLeadPotential({
  title: "Guerre en Ukraine : Jean-Noël Barrot dénonce la frappe",
  summary: "",
  status: "candidate",
  sourceType: "cafeyn",
  need: "habitation",
  section: "actu",
});
var rates = scoreLeadPotential({
  title: "Les taux français à 10 ans passent le seuil des 4,5%",
  summary: "OAT au plus haut depuis 2011",
  status: "candidate",
  sourceType: "cafeyn",
  need: "emprunteur",
  section: "finance",
});
var autoScore = scoreLeadPotential({
  title: "Automobile. C'est le moment d'acheter : le marché de la voiture électrique d'occasion",
  summary: "",
  status: "candidate",
  sourceType: "cafeyn",
  need: "auto",
  section: "auto",
});
var drugScore = scoreLeadPotential({
  title: "Quelles sont les idées reçues sur la consommation de drogue",
  summary: "",
  status: "candidate",
  sourceType: "firefox",
  need: "sante",
  section: "sante",
});
ok(rates > geo, "taux immo score > géopolitique (" + rates + " > " + geo + ")");
ok(autoScore > drugScore, "auto EV score > drogue (" + autoScore + " > " + drugScore + ")");

var queue = readJson("blog-actu-queue.json", { items: [] });
(queue.items || []).forEach(function (item) {
  if (item.status === "pending" || item.status === "queued") {
    ok(!isPlaceholderQueueItem(item), "file sans placeholder actif: " + item.id);
  }
});

var r = spawnSync(process.execPath, [path.join(__dirname, "verify-actu-quality.cjs")], {
  input: "",
  encoding: "utf8",
  cwd: path.join(__dirname, ".."),
});
ok(r.status === 0, "qualité stdin vide ne plante pas (code " + r.status + ")");
ok(String(r.stderr || "").indexOf("Unexpected end of JSON") === -1, "pas de SyntaxError JSON stdin vide");

if (failed) {
  console.error("\nverify:actu-pipeline: " + failed + " échec(s)");
  process.exit(1);
}
console.log("\nverify:actu-pipeline OK");
