#!/usr/bin/env node
/** Landings du cluster garage, MRP, RC Pro, bâtiment, transport. */
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var SITE = "https://www.leadsopportunities.fr";

var pages = [
  {
    file: "garage-negociant-auto.html",
    niche: "landing_garage",
    title: "Assurance garage et négociant auto | Dépôt et atelier",
    description:
      "Devis assurance garage et négociant automobile : véhicules en dépôt, essais, atelier, MRP. Courtier ORIAS.",
    keywords: "assurance garage, négociant auto, véhicules en dépôt, assurance atelier",
    badge: "Niche pro — garage & négociant",
    h1: "Garage et négociant auto — dépôt, essai, atelier",
    sub: "L’assurance du gérant ne couvre pas les voitures des clients ni le stock. On sépare dépôt, essais et local.",
    points: ["Véhicules en réparation ou en stock", "Essais et véhicules de prêt", "Atelier : pont, outillage, incendie"],
    need: "rc-pro",
    campaign: "landing_garage",
    primary: "Décrire le garage",
    links: [
      ["../blog/assurance-garage-negociant-auto-rc-mrp-2026.html", "Guide garage"],
      ["./multirisque-professionnelle.html", "Multirisque atelier"],
      ["./transport-logistique.html", "Transport"],
      ["./convoyage-vehicules.html", "Convoyage"],
    ],
  },
  {
    file: "multirisque-professionnelle.html",
    niche: "landing_mrp",
    title: "Multirisque professionnelle | Locaux, stock, perte d’exploitation",
    description:
      "Devis multirisque professionnelle : locaux, matériel, stock, perte d’exploitation. Distinct de la RC Pro et de l’immeuble.",
    keywords: "multirisque professionnelle, MRP, assurance locaux pro, perte d'exploitation",
    badge: "Niche pro — multirisque",
    h1: "Multirisque professionnelle — locaux et matériel",
    sub: "La MRP couvre ce que vous occupez. Elle ne remplace pas la RC Pro, la décennale, ni l’assurance de l’immeuble.",
    points: ["Surface et activité dans les murs", "Stock, matériel, vitrine", "Perte d’exploitation"],
    need: "mrp",
    campaign: "landing_mrp",
    primary: "Devis multirisque",
    links: [
      ["../blog/assurance-multirisque-professionnelle-locaux-2026.html", "Guide MRP"],
      ["./immeuble-professionnel.html", "Immeuble professionnel"],
      ["./rc-pro.html", "RC Pro"],
      ["./sante-collective.html", "Santé collective"],
    ],
  },
  {
    file: "rc-pro.html",
    niche: "landing_rc_pro",
    title: "RC Pro entreprise | Responsabilité civile professionnelle",
    description:
      "Devis RC professionnelle : activité déclarée, plafonds, franchise. À coupler avec MRP ou décennale selon le métier.",
    keywords: "rc pro, responsabilité civile professionnelle, devis rc pro, assurance entreprise",
    badge: "Niche pro — RC",
    h1: "RC Pro — l’activité déclarée fait le contrat",
    sub: "Dommages aux clients et aux tiers. La RC ne couvre ni vos murs, ni l’ouvrage pendant dix ans, ni la flotte.",
    points: ["Métier et sous-traitance", "Plafond et franchise", "Couplage MRP ou décennale"],
    need: "rc-pro",
    campaign: "landing_rc_pro",
    primary: "Décrire l’activité",
    links: [
      ["../blog/assurance-rc-pro-entreprise-guide-2026.html", "Guide RC Pro"],
      ["./metiers-batiment.html", "Métiers du bâtiment"],
      ["./multirisque-professionnelle.html", "Multirisque"],
      ["./decennale.html", "Décennale"],
    ],
  },
  {
    file: "metiers-batiment.html",
    niche: "landing_batiment",
    title: "Assurance métiers du bâtiment | Décennale, RC, atelier",
    description:
      "Artisans du bâtiment : décennale, RC chantier, multirisque atelier, mutuelle des salariés. Un parcours par contrat.",
    keywords: "assurance bâtiment, décennale artisan, rc chantier, métiers du bâtiment",
    badge: "Niche pro — bâtiment",
    h1: "Métiers du bâtiment — un contrat par risque",
    sub: "Maçon, couvreur, électricien, plombier, second œuvre : l’ouvrage, le chantier et l’atelier ne tiennent pas dans une seule case.",
    points: ["Décennale pour l’ouvrage", "RC pour les dommages aux tiers", "MRP pour l’atelier et l’outillage"],
    need: "decennale",
    campaign: "landing_batiment",
    primary: "Devis décennale",
    links: [
      ["../blog/assurance-metiers-batiment-decennale-rc-2026.html", "Guide bâtiment"],
      ["./decennale.html", "Décennale"],
      ["./rc-pro.html", "RC Pro"],
      ["./ramonage.html", "Ramonage"],
      ["./sante-collective.html", "Mutuelle salariés"],
    ],
  },
  {
    file: "transport-logistique.html",
    niche: "landing_transport_logistique",
    title: "Assurance transport et logistique | Marchandises et entrepôt",
    description:
      "Transporteur, commissionnaire, entrepôt : marchandises, RC exploitation, quai. Distinct du convoyage et du VTC.",
    keywords: "assurance transport marchandises, logistique, commissionnaire, entrepôt",
    badge: "Niche pro — logistique",
    h1: "Transport et logistique — la marchandise n’est pas le camion",
    sub: "Flotte, lot transporté et entrepôt se déclarent séparément. Le convoyage d’un véhicule vide est un autre métier.",
    points: ["Compte propre ou compte d’autrui", "Lot, messagerie, température dirigée", "Entrepôt et quai"],
    need: "rc-pro",
    campaign: "landing_transport_logistique",
    primary: "Décrire le transport",
    links: [
      ["../blog/assurance-transport-logistique-marchandises-2026.html", "Guide logistique"],
      ["./transport-voyageurs.html", "Transport de voyageurs"],
      ["./convoyage-vehicules.html", "Convoyage"],
      ["./garage-negociant-auto.html", "Garage"],
    ],
  },
  {
    file: "transport-voyageurs.html",
    niche: "landing_transport_voyageurs",
    title: "Assurance transport de voyageurs | Autocar, lignes, VTC",
    description:
      "Transport de personnes : autocar, navette, scolaire, et renvoi VTC pour la voiture avec chauffeur. Distinct du convoyage.",
    keywords: "assurance transport voyageurs, autocar, transport en commun, transport scolaire",
    badge: "Niche pro — voyageurs",
    h1: "Transport de voyageurs — voiture, autocar, lignes",
    sub: "Le VTC a son parcours. L’autocar, la navette et le scolaire se décrivent ici : capacité, lignes, conducteurs.",
    points: ["VTC et taxi : hub dédié", "Autocar, occasionnel, scolaire", "Pas le convoyage sans passager"],
    need: "rc-pro",
    campaign: "landing_transport_voyageurs",
    primary: "Décrire l’activité voyageurs",
    links: [
      ["../blog/assurance-transport-voyageurs-commun-2026.html", "Guide voyageurs"],
      ["../assurance-vtc/", "Assurance VTC"],
      ["./transport-logistique.html", "Marchandises"],
      ["./convoyage-vehicules.html", "Convoyage"],
    ],
  },
];

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function html(p) {
  var url = SITE + "/landings/" + p.file;
  var q =
    "./questionnaire.html?need=" +
    p.need +
    "&amp;journey=standard&amp;utm_source=landing&amp;utm_campaign=" +
    p.campaign;
  var devis = "./devis.html?need=" + p.need + "&amp;utm_source=landing&amp;utm_campaign=" + p.campaign;
  var points = p.points
    .map(function (item) {
      return "              <li>" + esc(item) + "</li>";
    })
    .join("\n");
  var links =
    'Guide : <a href="' +
    p.links[0][0] +
    '">' +
    esc(p.links[0][1]) +
    "</a> · <a href=\"../assurances-niches.html\">toutes les niches</a>" +
    p.links
      .slice(1)
      .map(function (l) {
        return ' · <a href="' + l[0] + '">' + esc(l[1]) + "</a>";
      })
      .join("") +
    ' · <a href="./questionnaire.html?need=' +
    p.need +
    '&amp;journey=standard">questionnaire</a>';
  return (
    "<!doctype html>\n<html lang=\"fr\">\n<head>\n" +
    '  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n' +
    "  <title>" +
    esc(p.title) +
    "</title>\n" +
    '  <meta name="description" content="' +
    esc(p.description) +
    '" />\n' +
    '  <meta name="keywords" content="' +
    esc(p.keywords) +
    '" />\n' +
    '  <meta name="robots" content="index,follow" />\n  <meta name="geo.region" content="FR" />\n  <meta name="language" content="fr-FR" />\n' +
    '  <link rel="alternate" hreflang="fr-FR" href="' +
    url +
    '" />\n' +
    '  <link rel="alternate" hreflang="x-default" href="' +
    url +
    '" />\n' +
    '  <link rel="canonical" href="' +
    url +
    '" />\n' +
    '  <meta name="google-site-verification" content="I3CAH3KoD216Gpr7VbJ6-p3IM4vGizTzxW0HsqG-HKU" />\n' +
    '  <meta property="og:title" content="' +
    esc(p.title) +
    '" />\n' +
    '  <meta property="og:description" content="' +
    esc(p.description) +
    '" />\n' +
    '  <meta property="og:type" content="website" />\n  <meta property="og:locale" content="fr_FR" />\n' +
    '  <meta property="og:url" content="' +
    url +
    '" />\n' +
    '  <script async src="https://www.googletagmanager.com/gtag/js?id=G-JX8E35693F"></script>\n' +
    "  <script>\n    window.dataLayer = window.dataLayer || [];\n    function gtag(){dataLayer.push(arguments);}\n    gtag('js', new Date());\n    gtag('config', 'G-JX8E35693F');\n  </script>\n" +
    '  <script src="/api/google-config-env"></script>\n  <script src="../google-config.js"></script>\n  <script src="/js/clarity-init.js" defer></script>\n' +
    '  <link rel="stylesheet" href="./styles.css" />\n  <link rel="stylesheet" href="../css/geo-france-banner.css" />\n  <link rel="stylesheet" href="../css/callback-form.css" />\n  <link rel="stylesheet" href="../css/contact-pair.css" />\n' +
    "</head>\n<body data-market-intent=\"FR\" data-niche=\"" +
    p.niche +
    "\">\n" +
    '  <header class="landing-topbar">\n    <div class="landing-topbar-inner">\n' +
    '      <a class="landing-back" href="../assurances-niches.html">Assurances de niche</a>\n' +
    '      <a class="landing-logo" href="../index.html">Leads Opportunities</a>\n    </div>\n  </header>\n' +
    '  <main class="page">\n    <div class="container">\n      <span class="badge">' +
    esc(p.badge) +
    '</span>\n      <section class="card">\n        <div class="hero-surface">\n          <div class="hero">\n            <h1>' +
    esc(p.h1) +
    '</h1>\n            <p class="sub">' +
    esc(p.sub) +
    '</p>\n            <ul class="points">\n' +
    points +
    '\n            </ul>\n            <div class="actions">\n' +
    '              <a class="btn btn-primary" href="' +
    q +
    '">' +
    esc(p.primary) +
    "</a>\n" +
    '              <a class="btn btn-soft" href="' +
    devis +
    '">Devis express</a>\n            </div>\n          </div>\n        </div>\n' +
    '        <div data-callback-strip data-callback-need="' +
    p.need +
    '" data-callback-source="' +
    p.campaign +
    '"></div>\n' +
    '        <p class="small" style="margin-top:16px">' +
    links +
    "</p>\n      </section>\n    </div>\n  </main>\n" +
    '  <footer class="landing-footer">\n    <a href="../index.html#contact">Contact</a>\n    <a href="../mentions-legales.html">Mentions légales</a>\n' +
    "    <span>&copy; 2026 Leads Opportunities — ORIAS n&deg; 15005935</span>\n  </footer>\n" +
    '  <script src="../js/schedule-idle.js"></script>\n  <script src="../js/attribution.js"></script>\n  <script src="../js/callback-form.js"></script>\n  <script src="../js/cookie-banner.js"></script>\n  <script src="../js/geo-france-guard.js"></script>\n  <script src="../js/france-seo-meta.js"></script>\n' +
    "</body>\n</html>\n"
  );
}

pages.forEach(function (p) {
  var dest = path.join(root, "landings", p.file);
  fs.writeFileSync(dest, html(p));
  console.log("written", dest);
});
