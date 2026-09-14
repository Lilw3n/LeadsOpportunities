#!/usr/bin/env node
/** Garde-fous pipeline actu auto (leads) — placeholder + qualité CI. */
var path = require("path");
var { spawnSync } = require("child_process");
var { isPlaceholderQueueItem } = require("./blog-actu-lib.cjs");

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
  isPlaceholderQueueItem({
    title: "COLLEZ ICI le titre de la une Cafeyn (Le Figaro, Le Parisien…)",
    status: "pending",
  }),
  "placeholder Cafeyn ignoré"
);
assert(isPlaceholderQueueItem({ title: "Une vraie actu mutuelle", status: "template" }), "status template ignoré");
assert(!isPlaceholderQueueItem({ title: "Les taux du crédit immobilier remontent", status: "queued" }), "titre réel conservé");

var { isLowLeadActuTopic, matchTopic } = require("./blog-actu-lib.cjs");
assert(
  isLowLeadActuTopic({
    title: "«Ils ne méritent pas de vivre en société» : au procès Aramburu",
    summary: "assassinat, cour d'assises",
    url: "https://www.lefigaro.fr/faits-divers/exemple",
  }),
  "faits divers / procès ignorés"
);
assert(
  !isLowLeadActuTopic({
    title: "Assurances : pourquoi le prix des assurances emprunteurs est-il le seul à baisser ?",
    summary: "mutuelles santé et habitation",
  }),
  "emprunteur conservé"
);
assert(matchTopic("Assurances emprunteurs en baisse", "mutuelle santé").need === "emprunteur", "titre emprunteur prioritaire sur résumé mutuelle");
assert(
  isLowLeadActuTopic({
    title: "La désescalade devient un impératif économique : guerre au Moyen-Orient",
    summary: "",
  }),
  "géopolitique sans angle assurance ignorée"
);

var quality = spawnSync("node", ["scripts/verify-actu-quality.cjs"], {
  cwd: root,
  input: "",
  encoding: "utf8",
});
assert(
  quality.status === 0,
  "qualité CI sans TTY / stdin vide ne crash pas (code=" + quality.status + " stderr=" + String(quality.stderr || "").slice(0, 120) + ")"
);
assert(
  /Aucun article à vérifier|Qualité OK/i.test(String(quality.stdout || "")),
  "qualité lit pending.json plutôt que stdin vide"
);

process.exit(failed ? 1 : 0);
