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
  "js/irl-revision-lib.js",
  "js/irl-revision-widget.js",
  "js/location-droits-lib.js",
  "js/location-droits-widget.js",
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
assert(locLanding.indexOf('name="locationRole"') >= 0, "rôle locataire/bailleur/gestion");
assert(locLanding.indexOf('value="gestion"') >= 0, "rôle propriétaire / gestion");
assert(locLanding.indexOf("locationGestionNeed") >= 0, "besoins gestion locative");
assert(locLanding.indexOf("revision_irl") >= 0, "checkbox révision IRL");
assert(locLanding.indexOf("locationColoc") >= 0, "champ colocation");
assert(locLanding.indexOf('value="colocation"') >= 0, "type bien colocation");
assert(locLanding.indexOf("data-irl-widget") >= 0, "widget IRL landing");
assert(locLanding.indexOf("data-droits-widget") >= 0 && locLanding.indexOf('id="droits"') >= 0, "aide-mémoire droits locataire");
assert(locLanding.indexOf("locationNoticeKind") >= 0, "type d’avis");
assert(locLanding.indexOf('value="travaux"') >= 0 && locLanding.indexOf("depot_garantie") >= 0, "travaux + dépôt de garantie");
assert(locLanding.indexOf("location-droits-lib.js") >= 0, "script droits landing");
assert(locLanding.indexOf("irl-revision-lib.js") >= 0, "script IRL landing");
assert(locLanding.indexOf("immo-service-lead-form.js") >= 0, "script lead location");
assert(/Lunéville|Luneville/.test(locLanding), "mention Lunéville");

var synLanding = read("landings/syndic.html");
assert(synLanding.indexOf('name="need" value="syndic"') >= 0, "need=syndic");
assert(/Loi Hoguet|carte/.test(synLanding), "cadre réglementaire syndic");
assert(synLanding.indexOf("immo-service-lead-form.js") >= 0, "script lead syndic");

var locHub = read("immobilier/location/index.html");
assert(locHub.indexOf("role=locataire") >= 0 && locHub.indexOf("role=bailleur") >= 0, "hub location locataire + bailleur");
assert(locHub.indexOf("role=gestion") >= 0, "hub location rôle gestion");
assert(locHub.indexOf("sujet=coloc") >= 0, "hub location colocation");
assert(locHub.indexOf("data-irl-widget") >= 0 && locHub.indexOf('id="irl"') >= 0, "hub location calculateur IRL");
assert(locHub.indexOf("irl-revision-lib.js") >= 0, "script IRL hub");
assert(locHub.indexOf("data-droits-widget") >= 0 && locHub.indexOf("sujet=travaux") >= 0, "hub droits / travaux");
assert(locHub.indexOf("location-droits-lib.js") >= 0, "script droits hub");
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
assert(cat.getService("irl") && cat.getService("irl").need === "location", "alias irl");
assert(cat.getService("colocation") && cat.getService("colocation").need === "location", "alias colocation");
assert(cat.getService("copro") && cat.getService("copro").need === "syndic", "alias copro");
assert(cat.getRapideUrl("location").indexOf("location.html") >= 0, "rapide location");
assert(cat.getRapideUrl("irl").indexOf("sujet=irl") >= 0, "rapide IRL");
assert(cat.getRapideUrl("coloc").indexOf("sujet=coloc") >= 0, "rapide coloc");
assert(cat.getRapideUrl("travaux").indexOf("sujet=travaux") >= 0, "rapide travaux");
assert(cat.getService("droits") && cat.getService("droits").need === "location", "alias droits");
assert(cat.getCompletUrl("syndic").indexOf("syndic.html") >= 0, "complet syndic");

vm.runInNewContext(read("js/questionnaire-config.js"), sandbox, { filename: "js/questionnaire-config.js" });
var qc = sandbox.QUESTIONNAIRE_CONFIG;
assert(typeof qc.NEED_OVERLAYS.location === "function", "overlay questionnaire location");
assert(typeof qc.NEED_OVERLAYS.syndic === "function", "overlay questionnaire syndic");
var locHtml = qc.NEED_OVERLAYS.location();
var synHtml = qc.NEED_OVERLAYS.syndic();
assert(locHtml.indexOf('name="locationRole"') >= 0, "champ locationRole");
assert(locHtml.indexOf('value="gestion"') >= 0, "questionnaire rôle gestion");
assert(locHtml.indexOf("locationGestionNeed") >= 0, "questionnaire besoins gestion");
assert(locHtml.indexOf("locationColoc") >= 0, "questionnaire colocation");
assert(locHtml.indexOf("locationNoticeKind") >= 0 && locHtml.indexOf("depot_garantie") >= 0, "questionnaire avis + DG");
assert(synHtml.indexOf('name="syndicRequest"') >= 0, "champ syndicRequest");

var schema = read("js/crm-immo-property-schema.js");
assert(schema.indexOf('"Syndic"') >= 0, "type_mandat Syndic");
assert(schema.indexOf('"Gestion locative"') >= 0, "type_mandat Gestion locative");
assert(schema.indexOf("clause_revision") >= 0 && schema.indexOf("irl_trimestre_ref") >= 0, "CRM bail IRL");
assert(schema.indexOf("caution_solidaire") >= 0 && schema.indexOf("nb_colocataires") >= 0, "CRM bail colocation");
assert(schema.indexOf("grille_vetuste") >= 0 && schema.indexOf("duree_travaux_jours") >= 0, "CRM bail travaux / vétusté");

vm.runInNewContext(read("js/location-droits-lib.js"), sandbox, { filename: "js/location-droits-lib.js" });
var Droits = sandbox.LocationDroits;
assert(Droits && Droits.explain("travaux").delay.indexOf("8 jours") >= 0, "droits travaux préavis");
var trav = Droits.explain("travaux").tenant.join(" ");
assert(trav.indexOf("21 jours") >= 0, "droits travaux baisse 21 j");
assert(Droits.explain("depot_garantie").tenant.join(" ").indexOf("vétusté") >= 0 || Droits.explain("depot_garantie").tenant.join(" ").indexOf("Vétusté") >= 0, "droits DG vétusté");
assert(Droits.kindFromSujet("depot") === "depot_garantie", "sujet depot → DG");
assert(Droits.explain("visites").landlord.join(" ").indexOf("décent") >= 0, "mise à disposition logement décent");

vm.runInNewContext(read("js/irl-revision-lib.js"), sandbox, { filename: "js/irl-revision-lib.js" });
var Irl = sandbox.IrlRevision;
assert(Irl && Irl.latest().id === "2026-T2", "IRL dernier trimestre T2 2026");
assert(Irl.latest().value === 148.37, "IRL T2 2026 = 148,37");
var prev = Irl.sameQuarterPreviousYear("2026-T2");
assert(prev && prev.id === "2025-T2" && prev.value === 146.68, "IRL même trimestre N-1");
var revised = Irl.revise(650, "2025-T2", "2026-T2");
assert(revised.ok && revised.newRent === 657.49, "IRL 650 € T2 2025→T2 2026 = 657,49 €");
assert(revised.pct === 1.15, "IRL +1,15 %");

var formSrc = read("js/immo-service-lead-form.js");
assert(formSrc.indexOf("panelMatches") >= 0, "panels rôles virgule");
assert(formSrc.indexOf("SUJET_TO_NEED") >= 0 && formSrc.indexOf("proprietaire") >= 0, "URL ?role=gestion / ?sujet=irl");

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
assert(embed.indexOf("dossier * 2") >= 0, "formule total agence TG0422");

var css = read("css/immo-location-syndic.css");
assert(css.indexOf("[data-role-panel][hidden]") >= 0, "CSS hidden panels rôle");
assert(css.indexOf("irl-widget") >= 0, "CSS widget IRL");

var pkg = JSON.parse(read("package.json"));
assert(pkg.scripts["verify:immo-location-syndic"], "script npm verify");

process.exit(failed ? 1 : 0);
