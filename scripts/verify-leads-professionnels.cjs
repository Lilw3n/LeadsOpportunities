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

ok(/tous secteurs|n['’]importe quel métier|multi-?secteurs|Et bien d['’]autres métiers/i.test(page), "message multi-secteurs");
ok(page.indexOf("réseau partenaire") !== -1 || page.indexOf("reseau partenaire") !== -1, "origine réseau partenaire");
ok(page.indexOf("pas seulement l’assurance") !== -1 || page.indexOf("pas limité à l’assurance") !== -1 || page.indexOf("Pas limité à l’assurance") !== -1 || /pas seulement l.assurance|pas limit. .*assurance/i.test(page), "pas limité assurance");
ok(page.indexOf("Verticales disponibles") === -1, "plus de liste fermée « Verticales disponibles »");

ok(!/\bRIB\b/i.test(page), "pas de mention RIB");
ok(!/\bIBAN\b/i.test(page), "pas de mention IBAN");
ok(!/coordonn[ée]es bancaires/i.test(page), "pas de coords bancaires");

ok(fs.existsSync(path.join(root, "assets/leads-pro/hero-smartphone.jpg")), "fichier hero");
ok(fs.existsSync(path.join(root, "assets/leads-pro/metier-chantier.jpg")), "fichier chantier");
ok(fs.existsSync(path.join(root, "assets/leads-pro/equipe-bureau.jpg")), "fichier équipe");
ok(fs.existsSync(path.join(root, "assets/leads-pro/accueil-client.jpg")), "fichier CTA");

ok(css.indexOf("--lp-sea") !== -1, "variables CSS");
ok(css.indexOf("lp-ken") !== -1, "motion hero");
ok(css.indexOf("lp-rise") !== -1, "motion texte");
ok(css.indexOf("lp-band") !== -1 && css.indexOf("lp-split") !== -1, "bandes photo + split");

var hub = read("landings/index.html");
ok(hub.indexOf("leads-professionnels.html") !== -1, "hub landings");

var index = read("index.html");
ok(index.indexOf("leads-professionnels.html") !== -1, "lien accueil");

var catalog = read("js/service-catalog.js");
ok(catalog.indexOf("leads-professionnels") !== -1, "service catalog");

var seoLib = read("scripts/seo-geo-lib.cjs");
ok(seoLib.indexOf("/landings/leads-professionnels.html") !== -1, "sitemap source");

var sm = read("sitemap-main.xml");
ok(sm.indexOf("leads-professionnels.html") !== -1, "sitemap-main");

console.log("\nverify-leads-professionnels: OK");
