#!/usr/bin/env node
/**
 * Regressions rapides du scoring de candidats actu.
 */
const assert = require("assert");
const { scoreLeadPotential, scaffoldArticle } = require("./blog-actu-lib.cjs");

function candidate(title, extra) {
  var scaffold = scaffoldArticle({
    title: title,
    summary: (extra && extra.summary) || "",
    source: (extra && extra.sourceType) || "edge",
  });
  return Object.assign(
    {
      title: title,
      summary: (extra && extra.summary) || "",
      sourceType: (extra && extra.sourceType) || "edge",
      need: scaffold && scaffold.cta.href.match(/need=([^&]+)/)
        ? scaffold.cta.href.match(/need=([^&]+)/)[1]
        : "habitation",
      pubDate: new Date().toUTCString(),
      status: "candidate",
    },
    extra || {}
  );
}

function score(title, extra) {
  return scoreLeadPotential(candidate(title, extra));
}

var emprunteur = score("Assurance emprunteur : les banques reviennent sur les taux de pret immobilier");
var mutuelleSenior = score("Mutuelle senior : le reste a charge dentaire augmente pour les retraites");
var vtc = score("Chauffeur VTC : comment choisir son assurance professionnelle en 2026");
var football = score("Coupe du monde 2026 : les Bleus lancent leur tournoi contre le Senegal");
var faitsDivers = score("Meurtre de Lyhanna : les resultats complets d'autopsie ne sont toujours pas disponibles");

assert(emprunteur > football, "l'emprunteur doit passer devant le trafic football");
assert(mutuelleSenior > football, "la mutuelle senior doit passer devant le trafic football");
assert(vtc > football, "le VTC doit passer devant le trafic football");
assert(faitsDivers < football, "les faits divers doivent rester en bas du classement");

var autopsieScaffold = scaffoldArticle({
  title: "Les resultats complets d'autopsie sont attendus",
  summary: "",
  source: "edge",
});
assert.notStrictEqual(autopsieScaffold.need, "auto", "auto ne doit pas matcher autopsie");

console.log("[OK] Scoring actu lead:", {
  emprunteur: emprunteur,
  mutuelleSenior: mutuelleSenior,
  vtc: vtc,
  football: football,
  faitsDivers: faitsDivers,
});
