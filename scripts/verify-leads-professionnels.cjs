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
ok(page.indexOf("pilier-finance.jpg") !== -1, "hero image plein écran");
ok(page.indexOf("Syne") !== -1, "police display Syne");

ok(!/\bRIB\b/i.test(page), "pas de mention RIB");
ok(!/\bIBAN\b/i.test(page), "pas de mention IBAN");
ok(!/coordonn[ée]es bancaires/i.test(page), "pas de coords bancaires");

ok(css.indexOf("--lp-sea") !== -1, "variables CSS");
ok(css.indexOf("lp-ken") !== -1, "motion hero");
ok(css.indexOf("lp-rise") !== -1, "motion texte");

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
