#!/usr/bin/env node
/**
 * Vérifie la page dédiée vente de leads professionnels (B2B).
 */
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function ok(c, m) {
  if (!c) throw new Error("FAIL: " + m);
  console.log("OK ", m);
}

ok(fs.existsSync(path.join(root, "landings/leads-professionnels.html")), "page HTML");
ok(fs.existsSync(path.join(root, "landings/leads-professionnels.css")), "CSS dédié");

var page = read("landings/leads-professionnels.html");
var css = read("landings/leads-professionnels.css");

ok(page.indexOf("Leads Opportunities") !== -1, "marque hero");
ok(page.indexOf("déjà joignables") !== -1 || page.indexOf("deja joignables") !== -1, "message joignabilité");
ok(/e-?mail/i.test(page) && /t[ée]l[ée]phone/i.test(page), "email + téléphone mis en avant");
ok(page.indexOf("data-callback-source=\"leads_professionnels\"") !== -1, "formulaire callback");
ok(page.indexOf("canonical") !== -1 && page.indexOf("leads-professionnels.html") !== -1, "canonical");
ok(page.indexOf("assets/leads-pro/hero-smartphone.jpg") !== -1, "hero image smartphone");
ok(page.indexOf("assets/leads-pro/metier-chantier.jpg") !== -1, "bande métiers");
ok(page.indexOf("assets/leads-pro/equipe-bureau.jpg") !== -1, "visuel équipe");
ok(page.indexOf("assets/leads-pro/accueil-client.jpg") !== -1, "visuel CTA");
ok(page.indexOf("Syne") !== -1, "police display Syne");
ok(page.indexOf("lp-nav-brand") !== -1, "logo nav");

ok(page.indexOf("Wendy Buchet") === -1, "pas de Wendy Buchet");
ok(!/Wendy Buchet\s*[·•]\s*ORIAS/i.test(page), "pas de sous-titre Wendy · ORIAS");

ok(/tous secteurs|n['’]importe quel métier|multi-?secteurs|Autres métiers/i.test(page), "message multi-secteurs");
ok(page.indexOf("réseau partenaire") !== -1 || page.indexOf("reseau partenaire") !== -1, "origine réseau partenaire");
ok(/pas seulement l.assurance|pas limit. .*assurance/i.test(page), "pas limité assurance");
ok(page.indexOf("Verticales disponibles") === -1, "plus de liste fermée « Verticales disponibles »");

ok(/stock limité|lots sur demande|Lots sur demande/i.test(page), "stock / lots limités");
ok(/abonnement/i.test(page) && /illimit/i.test(page), "avertissement abonnement illimité");
ok(/5(?:\s|&nbsp;)*000|5000/.test(page) && /6(?:\s|&nbsp;)*000|6000/.test(page), "ordre de grandeur stock");
ok(page.indexOf("lp-samples") !== -1 || page.indexOf("lp-sample") !== -1, "aperçu leads");
ok(page.indexOf("Demander un lot") !== -1, "CTA lot");

ok(!/\bRIB\b/i.test(page), "pas de mention RIB");
ok(!/\bIBAN\b/i.test(page), "pas de mention IBAN");
ok(!/coordonn[ée]es bancaires/i.test(page), "pas de coords bancaires");
ok(!/mandat SEPA/i.test(page), "pas de mention mandat SEPA");
ok(!/prélèvement mensuel illimité|volume mensuel illimité/i.test(page) || /ne propose pas|Pas d/i.test(page), "pas de promesse de volume mensuel illimité");

ok(fs.existsSync(path.join(root, "assets/leads-pro/hero-smartphone.jpg")), "fichier hero");
ok(fs.existsSync(path.join(root, "assets/leads-pro/metier-chantier.jpg")), "fichier chantier");
ok(fs.existsSync(path.join(root, "assets/leads-pro/equipe-bureau.jpg")), "fichier équipe");
ok(fs.existsSync(path.join(root, "assets/leads-pro/accueil-client.jpg")), "fichier CTA");

ok(css.indexOf("--lp-sea") !== -1, "variables CSS");
ok(css.indexOf("lp-ken") !== -1, "motion hero");
ok(css.indexOf("lp-rise") !== -1, "motion texte");
ok(css.indexOf("lp-band") !== -1 && css.indexOf("lp-split") !== -1, "bandes photo + split");
ok(css.indexOf("lp-sample") !== -1 && css.indexOf("lp-offer") !== -1, "styles aperçu + offre");

var hub = read("landings/index.html");
ok(hub.indexOf("leads-professionnels.html") !== -1, "hub landings");

var index = read("index.html");
ok(index.indexOf("leads-professionnels.html") !== -1, "lien accueil");
ok(index.indexOf('id="achat-leads"') !== -1, "section accueil #achat-leads");
ok(index.indexOf("home-achat-leads.css") !== -1, "CSS section achat leads");
ok(index.indexOf("Achetez des leads professionnels") !== -1, "titre section achat leads");
ok(index.indexOf("#achat-leads") !== -1, "lien nav achat leads");
ok(fs.existsSync(path.join(root, "css/home-achat-leads.css")), "fichier CSS home-achat-leads");

var catalog = read("js/service-catalog.js");
ok(catalog.indexOf("leads-professionnels") !== -1, "service catalog");

var seoLib = read("scripts/seo-geo-lib.cjs");
ok(seoLib.indexOf("/landings/leads-professionnels.html") !== -1, "sitemap source");

var sm = read("sitemap-main.xml");
ok(sm.indexOf("leads-professionnels.html") !== -1, "sitemap-main");

console.log("\nverify-leads-professionnels: OK");
