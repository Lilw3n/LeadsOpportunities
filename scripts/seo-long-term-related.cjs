/**
 * Maillage SEO long terme — clusters blog → hubs money / niches.
 * Source unique pour generate-seo-pages, niches, geo, GSC.
 */
function link(href, label) {
  return { href: href, label: label };
}

var CANICULE_MUTUELLE = [
  link("/blog/canicule-mutuelle-coup-chaleur-seniors-2026.html", "Canicule seniors & mutuelle"),
  link("/blog/canicule-vigilance-meteo-france-mutuelle.html", "Vigilance Météo-France"),
  link("/blog/canicule-enfants-famille-mutuelle.html", "Canicule famille"),
  link("/blog/canicule-teleconsultation-medecin-mutuelle.html", "Téléconsultation canicule"),
  link("/blog/canicule-maladies-chroniques-mutuelle.html", "Maladies chroniques"),
  link("/blog/canicule-grossesse-mutuelle-maternite.html", "Grossesse & canicule"),
  link("/blog/insolation-canicule-que-faire-mutuelle-devis.html", "Insolation : que faire"),
];

var PRET_REFUSE = [
  link("/blog/pret-immobilier-refuse-que-faire-2026.html", "Prêt refusé : que faire"),
  link("/blog/pret-refuse-endettement-35-hcsf-solutions.html", "Endettement 35 % HCSF"),
  link("/blog/pret-refuse-courtier-multibanque-deuxieme-chance.html", "Courtier 2e chance"),
  link("/blog/pret-refuse-assurance-emprunteur-sante.html", "Refus & assurance emprunteur"),
  link("/blog/pret-refuse-apport-insuffisant-solutions.html", "Apport insuffisant"),
  link("/blog/pret-refuse-primo-accedant-ptz-solutions.html", "Primo & PTZ"),
  link("/landings/credit-immo.html#pret-refuse", "Landing prêt refusé"),
];

var NICHES_CHASSE = [
  link("/blog/assurance-chasse-rc-chasseur-guide-2026.html", "Guide RC chasseur 2026"),
  link("/blog/assurance-chien-de-chasse-rc-comparatif.html", "Chien de chasse & RC"),
  link("/assurance-chasse/rc-chasseur/", "Hub RC chasseur"),
  link("/assurance-chasse/chien-chasse/", "Hub chien de chasse"),
  link("/landings/chasse.html", "Devis chasse"),
];

var NICHES_EQUITATION = [
  link("/blog/assurance-equitation-rc-equestre-guide-2026.html", "Guide RC équestre 2026"),
  link("/blog/assurance-cheval-pas-cher-criteres-2026.html", "Cheval pas cher : critères"),
  link("/assurance-equitation/rc-equestre/", "Hub RC équestre"),
  link("/assurance-equitation/cheval/", "Hub assurance cheval"),
  link("/landings/equitation.html", "Devis équitation"),
];

var NICHES_ANIMAUX = [
  link("/blog/feux-foret-animaux-chien-chat-assurance.html", "Feux de forêt & animaux"),
  link("/blog/canicule-animaux-eau-chien-chat-oiseaux-assurance.html", "Canicule animaux"),
  link("/blog/assurance-animaux-comment-choisir.html", "Comment choisir"),
  link("/assurance-animaux/chien/pas-cher/", "Chien pas cher"),
  link("/landings/animaux.html", "Devis animaux"),
];

var ACTU_CLIMAT_HABITATION = [
  link("/blog/incendies-gironde-feux-foret-assurance-habitation-2026.html", "Incendies Gironde"),
  link("/blog/restriction-eau-secheresse-gironde-assurance-habitation.html", "Restrictions d'eau"),
  link("/blog/orages-grele-ete-auto-habitation-2026.html", "Orages & grêle"),
  link("/blog/presidentielle-2027-checklist-assurances-foyer.html", "Checklist présidentielle 2027"),
];

var VTC_IDF = [
  link("/assurance-vtc/ile-de-france/", "VTC Île-de-France"),
  link("/assurance-vtc/paris/", "VTC Paris"),
  link("/assurance-vtc/pas-cher/", "VTC pas cher"),
  link("/assurance-vtc/aeroport-cdg/", "Aéroport CDG"),
  link("/assurance-vtc/aeroport-orly/", "Aéroport Orly"),
  link("/blog/assurance-vtc-moins-cher-2026.html", "Payer moins cher"),
  link("/blog/vtc-premiere-course-checklist-assurance.html", "Checklist 1re course"),
  link("/blog/assurance-vtc-uber-bolt-heetch.html", "Uber, Bolt, Heetch"),
];

var ACQUEREUR_IMMO = [
  link("/landings/acheteur-immo.html#alerte", "Alerte acquéreur"),
  link("/recherche-bien/", "Recherche de bien"),
  link("/recherche-bien/villes/", "Par ville"),
  link("/blog/alerte-immobilier-acquereur-avant-les-autres.html", "Alerte avant les autres"),
  link("/blog/acheter-appartement-sans-passer-des-mois-sur-seloger.html", "Acheter sans 3 mois de portails"),
  link("/blog/visite-immobiliere-checklist-acquereur.html", "Checklist visite"),
  link("/blog/offre-achat-immobilier-negocier-sans-se-faire-doubler.html", "Offre d'achat"),
];

var SILOS_IMMO = [
  link("/pret-immobilier/", "Prêt immobilier — villes"),
  link("/recherche-bien/", "Recherche de bien"),
  link("/landings/acheteur-immo.html#alerte", "Alerte acquéreur"),
  link("/credit-immo/", "Crédit immobilier"),
  link("/landings/projection-achat.html", "Projection coût réel"),
];

function mergeUnique() {
  var seen = {};
  var out = [];
  for (var i = 0; i < arguments.length; i++) {
    var arr = arguments[i] || [];
    for (var j = 0; j < arr.length; j++) {
      var item = arr[j];
      if (!item || !item.href || seen[item.href]) continue;
      seen[item.href] = true;
      out.push(item);
    }
  }
  return out;
}

module.exports = {
  CANICULE_MUTUELLE: CANICULE_MUTUELLE,
  PRET_REFUSE: PRET_REFUSE,
  NICHES_CHASSE: NICHES_CHASSE,
  NICHES_EQUITATION: NICHES_EQUITATION,
  NICHES_ANIMAUX: NICHES_ANIMAUX,
  ACTU_CLIMAT_HABITATION: ACTU_CLIMAT_HABITATION,
  VTC_IDF: VTC_IDF,
  ACQUEREUR_IMMO: ACQUEREUR_IMMO,
  SILOS_IMMO: SILOS_IMMO,
  mergeUnique: mergeUnique,
  link: link,
};
