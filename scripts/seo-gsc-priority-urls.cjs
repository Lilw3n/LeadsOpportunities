/**
 * URLs prioritaires : Search Console (indexation manuelle) + IndexNow.
 * Source unique — npm run gsc:urls pour la checklist.
 */
const { SITE_ORIGIN: SITE } = require("./site-url.cjs");

const GSC_INDEX_NOW_PRIORITY = [
  "/",
  "/nos-services.html",
  "/assurances/",
  "/france/",
  "/landings/vtc.html",
  "/landings/sante.html",
  "/landings/credit-immo.html",
  "/landings/devis.html",
  "/landings/questionnaire.html?need=vtc&journey=standard",
  "/landings/questionnaire.html?need=sante&journey=standard",
  "/landings/questionnaire.html?need=credit-immo&journey=standard",
  "/blog/",
  "/assurance-vtc/",
  "/assurance-vtc/paris/",
  "/assurance-vtc/lyon/",
  "/assurance-vtc/marseille/",
  "/assurance-sante/",
  "/assurance-sante/paris/",
  "/credit-immo/",
  "/credit-immo/paris/",
  "/methode.html",
  "/assurances-niches.html",
  "/assurance-animaux/",
  "/assurance-animaux/chien/pas-cher/",
  "/assurance-animaux/comparatif/",
  "/assurance-chasse/",
  "/assurance-chasse/rc-chasseur/",
  "/assurance-equitation/",
  "/assurance-equitation/rc-equestre/",
  "/landings/animaux.html",
  "/assurance-habitation/",
  "/blog/assurance-vtc-moins-cher-2026.html",
  "/blog/mutuelle-sante-5-criteres.html",
  "/blog/pret-immo-erreurs-a-eviter.html",
  "/blog/assurance-vtc-rc-pro-garanties.html",
  "/mentions-legales.html",
];

function absoluteUrls() {
  return GSC_INDEX_NOW_PRIORITY.map(function (path) {
    if (path.indexOf("http") === 0) return path;
    return SITE + (path.charAt(0) === "/" ? path : "/" + path);
  });
}

module.exports = {
  GSC_INDEX_NOW_PRIORITY: GSC_INDEX_NOW_PRIORITY,
  absoluteUrls: absoluteUrls,
};
