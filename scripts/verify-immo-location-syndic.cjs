#!/usr/bin/env node
/** Vérifie les parcours publics location + syndic de copropriété. */
var fs = require("fs");
var path = require("path");
var vm = require("vm");
var failed = 0;
var root = path.join(__dirname, "..");

function assert(cond, msg) {
  if (!cond) {
    failed++;
    console.log("FAIL", msg);
  } else {
    console.log("OK  ", msg);
  }
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

[
  "immobilier/index.html",
  "immobilier/location/index.html",
  "immobilier/syndic/index.html",
  "landings/location.html",
  "landings/syndic.html",
  "js/immo-service-lead-form.js",
  "css/immo-location-syndic.css",
].forEach(function (f) {
  assert(exists(f), f + " existe");
});

var hub = read("immobilier/index.html");
assert(/Location/.test(hub) && /Syndic/.test(hub), "hub immo cartes location + syndic");
assert(hub.indexOf("./location/") >= 0, "lien sous-hub location");
assert(hub.indexOf("./syndic/") >= 0, "lien sous-hub syndic");
assert(hub.indexOf("id=\"location-bareme\"") >= 0, "estimateur honoraires location");
assert(hub.indexOf("Achat, location") >= 0 || hub.indexOf("location &amp; syndic") >= 0, "hero recalé");

var locLanding = read("landings/location.html");
assert(locLanding.indexOf('name="need" value="location"') >= 0, "need=location");
assert(locLanding.indexOf('name="locationRole"') >= 0, "rôle locataire/bailleur");
assert(locLanding.indexOf("immo-service-lead-form.js") >= 0, "script lead location");
assert(/Lunéville|Luneville/.test(locLanding), "mention Lunéville");

var synLanding = read("landings/syndic.html");
assert(synLanding.indexOf('name="need" value="syndic"') >= 0, "need=syndic");
assert(/Loi Hoguet|carte/.test(synLanding), "cadre réglementaire syndic");
assert(synLanding.indexOf("immo-service-lead-form.js") >= 0, "script lead syndic");

var locHub = read("immobilier/location/index.html");
assert(locHub.indexOf("role=locataire") >= 0 && locHub.indexOf("role=bailleur") >= 0, "hub location 2 publics");
var synHub = read("immobilier/syndic/index.html");
assert(/Loi Hoguet/.test(synHub), "disclaimer Loi Hoguet hub syndic");

var catalogSrc = read("js/service-catalog.js");
assert(catalogSrc.indexOf("need: \"location\"") >= 0, "catalogue location");
assert(catalogSrc.indexOf("need: \"syndic\"") >= 0, "catalogue syndic");
assert(catalogSrc.indexOf("landings/location.html") >= 0, "landing location catalogue");
assert(catalogSrc.indexOf("landings/syndic.html") >= 0, "landing syndic catalogue");

var sandbox = { console: console, URLSearchParams: URLSearchParams };
sandbox.window = sandbox;
sandbox.global = sandbox;
vm.runInNewContext(catalogSrc, sandbox, { filename: "js/service-catalog.js" });
var cat = sandbox.SERVICE_CATALOG;
assert(cat.getService("location") && cat.getService("location").need === "location", "getService location");
assert(cat.getService("syndic") && cat.getService("syndic").need === "syndic", "getService syndic");
assert(cat.getService("gestion-locative") && cat.getService("gestion-locative").need === "location", "alias gestion locative");
assert(cat.getService("copro") && cat.getService("copro").need === "syndic", "alias copro");
assert(cat.getRapideUrl("location").indexOf("location.html") >= 0, "rapide location");
assert(cat.getCompletUrl("syndic").indexOf("syndic.html") >= 0, "complet syndic");

vm.runInNewContext(read("js/questionnaire-config.js"), sandbox, { filename: "js/questionnaire-config.js" });
var qc = sandbox.QUESTIONNAIRE_CONFIG;
assert(typeof qc.NEED_OVERLAYS.location === "function", "overlay questionnaire location");
assert(typeof qc.NEED_OVERLAYS.syndic === "function", "overlay questionnaire syndic");
var locHtml = qc.NEED_OVERLAYS.location();
var synHtml = qc.NEED_OVERLAYS.syndic();
assert(locHtml.indexOf('name="locationRole"') >= 0, "champ locationRole");
assert(synHtml.indexOf('name="syndicRequest"') >= 0, "champ syndicRequest");

var schema = read("js/crm-immo-property-schema.js");
assert(schema.indexOf('"Syndic"') >= 0, "type_mandat Syndic");

var home = read("index.html");
assert(home.indexOf("landings/location.html") >= 0 && home.indexOf("landings/syndic.html") >= 0, "pills accueil");

var landingsHub = read("landings/index.html");
assert(landingsHub.indexOf("./location.html") >= 0 && landingsHub.indexOf("./syndic.html") >= 0, "hub landings");

var gsc = read("scripts/seo-gsc-priority-urls.cjs");
assert(gsc.indexOf("/landings/location.html") >= 0 && gsc.indexOf("/immobilier/syndic/") >= 0, "GSC prioritaire");

var seoLib = read("scripts/seo-geo-lib.cjs");
assert(seoLib.indexOf("/immobilier/location/") >= 0, "sitemap lib location");

var sm = read("sitemap-main.xml");
assert(sm.indexOf("/landings/location.html") >= 0, "sitemap location");
assert(sm.indexOf("/immobilier/syndic/") >= 0, "sitemap syndic");

var vercel = read("vercel.json");
assert(vercel.indexOf("/immobilier/location") >= 0 && vercel.indexOf("/immobilier/syndic") >= 0, "rewrites Vercel");

var embed = read("js/immobilier-bareme-embed.js");
assert(embed.indexOf("immoLocSurface") >= 0, "JS estimateur location");

var pkg = JSON.parse(read("package.json"));
assert(pkg.scripts["verify:immo-location-syndic"], "script npm verify");

[
  "blog/louer-appartement-nancy-54-locataire-2026.html",
  "blog/mettre-appartement-en-location-mandat-pno-gli-2026.html",
  "blog/changer-syndic-copropriete-mise-en-concurrence-2026.html",
].forEach(function (f) {
  assert(exists(f), f + " article lead");
});
var locArticle = read("blog/louer-appartement-nancy-54-locataire-2026.html");
assert(locArticle.indexOf("landings/location.html") >= 0, "article locataire CTA location");
assert(/Varangéville/.test(locArticle), "article locataire Varangéville");
var bailArticle = read("blog/mettre-appartement-en-location-mandat-pno-gli-2026.html");
assert(bailArticle.indexOf("role=bailleur") >= 0, "article bailleur rôle");
var synArticle = read("blog/changer-syndic-copropriete-mise-en-concurrence-2026.html");
assert(synArticle.indexOf("landings/syndic.html") >= 0, "article syndic CTA");
assert(/Loi Hoguet/.test(synArticle), "article syndic Hoguet");
assert(locHub.indexOf("louer-appartement-nancy-54-locataire-2026") >= 0, "hub location lien article locataire");
assert(synHub.indexOf("changer-syndic-copropriete-mise-en-concurrence-2026") >= 0, "hub syndic lien article");

process.exit(failed ? 1 : 0);
