#!/usr/bin/env node
/**
 * Garde-fous pipeline actu → leads (CI GitHub + génération locale).
 */
var { spawnSync } = require("child_process");
var path = require("path");
var {
  isPlaceholderCandidate,
  matchTopic,
  scoreLeadPotential,
  ctaWithUtm,
} = require("./blog-actu-lib.cjs");
var { enrichFromCandidate } = require("./blog-actu-enrich.cjs");
var { validateArticle } = require("./verify-actu-quality.cjs");

var failed = 0;

function assert(cond, msg) {
  if (!cond) {
    failed += 1;
    console.log("FAIL", msg);
  } else {
    console.log("OK  ", msg);
  }
}

var placeholder = {
  id: "cafeyn-pending-template",
  title: "COLLEZ ICI le titre de la une Cafeyn (Le Figaro, Le Parisien…)",
  sourceType: "cafeyn",
  status: "queued",
};
assert(isPlaceholderCandidate(placeholder), "placeholder Cafeyn détecté");
assert(scoreLeadPotential(placeholder) === 0, "placeholder score 0");

var rugby = matchTopic("Et si Ramos et Cros restaient au Stade Toulousain");
assert(rugby.matchScore === 0, "un seul mot « stade » ne déclenche pas CDM");

var cdm = matchTopic("Coupe du monde 2026 : les Bleus et les supporters en déplacement");
assert(cdm.matchScore >= 2 && cdm.need === "sante", "CDM + supporters → mutuelle voyage");

var mutuelle = {
  title: "Mutuelle santé : reste à charge optique et dentaire 2026",
  summary: "Remboursements Sécu et complémentaire",
  sourceType: "cafeyn",
  need: "sante",
  status: "candidate",
};
assert(scoreLeadPotential(mutuelle) >= 28, "actu mutuelle score lead ≥ 28");

var gossip = {
  title: "Léa Salamé recrute un nouveau chroniqueur",
  summary: "People télé",
  sourceType: "cafeyn",
  status: "candidate",
};
assert(scoreLeadPotential(gossip) < 28, "people sans angle assurance sous le seuil");

var article = enrichFromCandidate({
  title: "Hausse des cotisations mutuelle 2026",
  summary: "Reste à charge et remboursement optique",
  suggestedFile: "hausse-cotisations-mutuelle-2026.html",
  sourceType: "cafeyn",
  need: "sante",
});
var qualityErrs = validateArticle(article);
assert(qualityErrs.length === 0, "enrich local valide : " + (qualityErrs.join("; ") || "ok"));
assert(article.cta.href.indexOf("utm_medium=actu_daily") !== -1, "CTA utm_medium=actu_daily");
assert(
  article.blocks.some(function (b) {
    return b.type === "bridge";
  }),
  "bloc bridge questionnaire"
);

var cta = ctaWithUtm("emprunteur", "taux-pret-nancy");
assert(cta.href.indexOf("need=emprunteur") !== -1, "CTA emprunteur");

var quality = spawnSync(process.execPath, [path.join(__dirname, "verify-actu-quality.cjs")], {
  encoding: "utf8",
  input: "",
});
assert(quality.status === 0, "qualité CI stdin vide (pas de JSON.parse crash) status=" + quality.status);
if (quality.status !== 0) {
  console.log(quality.stderr || quality.stdout);
}

if (failed) {
  console.error("\nPipeline actu :", failed, "échec(s)");
  process.exit(1);
}
console.log("\nPipeline actu OK");
