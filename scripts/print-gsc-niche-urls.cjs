#!/usr/bin/env node
/** URLs niches — indexation GSC (faible concurrence). npm run gsc:niches */
const markets = require("../data/seo-niche-markets.json");
const { SITE_ORIGIN: SITE } = require("./site-url.cjs");

var urls = markets.indexationWeek1.concat(
  "/assurance-animaux/chien/",
  "/assurance-animaux/chat/",
  "/assurance-chasse/paris/",
  "/assurance-chasse/lyon/",
  "/assurance-equitation/paris/",
  "/assurance-equitation/marseille/",
  "/assurance-chien/paris/",
  "/assurance-chat/paris/",
  "/landings/animaux-express.html",
  "/landings/chasse.html",
  "/landings/equitation.html",
  "/landings/vsp.html",
  "/landings/devis.html?need=chasse",
  "/landings/devis.html?need=equitation",
  "/landings/devis.html?need=vsp",
  "/assurance-voiture-sans-permis/paris/"
);

console.log("# URLs niches — indexation prioritaire (Search Console)\n");
urls.forEach(function (path, i) {
  var abs = path.indexOf("http") === 0 ? path : SITE + (path.charAt(0) === "/" ? path : "/" + path);
  console.log(String(i + 1).padStart(2, "0") + ".", abs);
});
console.log("\n" + urls.length + " URLs — après l'accueil, prioriser chasse + équitation + VSP + animaux longue traîne.");
console.log("Guide : docs/PLAN-VISIBILITE-NICHES.md");
