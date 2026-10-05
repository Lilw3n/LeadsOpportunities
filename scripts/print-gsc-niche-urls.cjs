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
  "/landings/ramonage.html",
  "/landings/esthetique-bien-etre.html",
  "/landings/salles-loisirs.html",
  "/landings/padel.html",
  "/landings/immeuble-professionnel.html",
  "/landings/decennale.html",
  "/landings/convoyage-vehicules.html",
  "/assurance-voiture-sans-permis/paris/",
  "/assurance-voiture-sans-permis/nancy/",
  "/assurance-voiture-sans-permis/varangeville/",
  "/blog/tarif-assurance-voiture-sans-permis-2026.html",
  "/blog/citroen-ami-assurance-sans-permis.html",
  "/blog/assurance-vsp-nancy-varangeville-meurthe-et-moselle.html",
  "/blog/assurance-ramoneur-rc-pro-multirisque-2026.html",
  "/blog/assurance-immeuble-professionnel-multirisque-2026.html",
  "/blog/assurance-decennale-artisan-guide-2026.html",
  "/blog/assurance-salle-loisirs-escape-game-accrobranche-trampoline-2026.html",
  "/blog/assurance-terrain-padel-club-rc-pro-2026.html"
);

console.log("# URLs niches — indexation prioritaire (Search Console)\n");
urls.forEach(function (path, i) {
  var abs = path.indexOf("http") === 0 ? path : SITE + (path.charAt(0) === "/" ? path : "/" + path);
  console.log(String(i + 1).padStart(2, "0") + ".", abs);
});
console.log("\n" + urls.length + " URLs — niches live + partenariat (ramonage, loisirs, padel, immeuble, décennale, convoyage).");
console.log("Guide : docs/PLAN-VISIBILITE-NICHES.md");
