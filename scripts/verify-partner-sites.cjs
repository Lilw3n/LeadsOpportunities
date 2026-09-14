#!/usr/bin/env node
/** Vérifie sites partenaires (data, lib, CRM, API, pages). */
var fs = require("fs");
var path = require("path");
var Lib = require("../js/partner-sites-lib.js");

var root = path.join(__dirname, "..");
var failed = 0;

function ok(cond, msg) {
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

ok(exists("data/partner-sites.json"), "data/partner-sites.json");
ok(exists("js/partner-sites-lib.js"), "lib");
ok(exists("js/public-partner-sites.js"), "public js");
ok(exists("js/crm-partner-sites.js"), "crm js");
ok(exists("css/partner-sites.css"), "css");
ok(exists("sites-partenaires/index.html"), "hub page");
ok(exists("crm-partner-sites.html"), "crm page");
ok(exists("api/_lib/partner-sites-store.js"), "store Neon");
ok(exists("api/_lib/routes/crm-partner-sites.js"), "route CRM");
ok(exists("api/_lib/routes/public-partner-sites.js"), "route publique");

var data = JSON.parse(read("data/partner-sites.json"));
var cat = Lib.normalizeCatalog(data);
ok(cat.categories.some(function (c) { return c.id === "batiment"; }), "catégorie bâtiment");
ok(cat.categories.some(function (c) { return c.id === "outre-mer"; }), "catégorie outre-mer");
ok(cat.categories.some(function (c) { return c.id === "associatif"; }), "catégorie associatif");
ok(cat.categories.some(function (c) { return c.id === "annuaire"; }), "catégorie annuaire");
ok(cat.categories.some(function (c) { return c.id === "agriculture"; }), "catégorie agriculture");
ok(Lib.DEFAULT_CATEGORIES && Lib.DEFAULT_CATEGORIES.length >= 20, "DEFAULT_CATEGORIES élargi (≥20)");
ok(typeof Lib.mergeDefaultCategories === "function", "mergeDefaultCategories");
ok(cat.categories.some(function (c) { return c.id === "culture"; }), "catégorie culture");
ok(cat.sites.some(function (s) { return s.id === "leonida-vice"; }), "Leonida Vice dans le catalogue");
ok(cat.sites.some(function (s) { return s.id === "leonida-vice" && s.category === "culture"; }), "Leonida Vice catégorie culture");
ok(
  cat.sites.some(function (s) {
    return s.id === "leonida-vice" && String(s.url).indexOf("utm_campaign=leonida_vice") !== -1;
  }),
  "Leonida Vice UTM leads"
);

var withPhoto = Lib.normalizeSite({
  name: "Test BTP",
  url: "https://exemple-btp.fr",
  preview_image_url: "https://cdn.exemple.fr/facade.jpg",
  category: "batiment",
});
ok(Lib.previewUrl(withPhoto).indexOf("facade.jpg") !== -1, "photo manuelle prioritaire");

var auto = Lib.normalizeSite({ name: "Auto", url: "https://exemple-btp.fr", category: "batiment" });
ok(Lib.previewUrl(auto).indexOf("mshots") !== -1, "fallback mshots");

ok(Lib.sitesByCategory(cat, true).length >= 1, "groupement par catégorie");
ok(Lib.API_URL === "/api/partner-sites", "API_URL publique");

var index = read("index.html");
ok(index.indexOf("data-partner-sites") !== -1, "accueil : section");
ok(index.indexOf("partner-sites.css") !== -1, "accueil : css");
ok(index.indexOf("public-partner-sites.js") !== -1, "accueil : js");

var crm = read("crm-partner-sites.html");
ok(crm.indexOf("crm.css") !== -1, "CRM : crm.css (pas styles.css cassé)");
ok(crm.indexOf("dashboard.css") === -1, "CRM : pas de dashboard.css 404");
ok(crm.indexOf("sitePreviewImage") !== -1, "CRM : champ photo");
ok(crm.indexOf("btnPublishSites") !== -1, "CRM : bouton Publier");
ok(crm.indexOf("btnSelectAllPublic") !== -1, "CRM : tout public");
ok(crm.indexOf("btnSelectNonePublic") !== -1, "CRM : rien en public");
ok(crm.indexOf("sitePublished") !== -1, "CRM : case Afficher en public");
ok(crm.indexOf("Publier sur le site") !== -1, "CRM : libellé publication");
ok(crm.indexOf("font-size: 16px") !== -1, "CRM : inputs mobile (anti-zoom iOS)");

var hub = read("sites-partenaires/index.html");
ok(hub.indexOf("width=device-width") !== -1, "hub : viewport mobile");
ok(hub.indexOf("hamburger") !== -1, "hub : menu hamburger");
ok(hub.indexOf("G-JX8E35693F") !== -1, "hub : GA4");
ok(hub.indexOf("x7yqp46fj9") !== -1, "hub : Clarity");
ok(hub.indexOf("data-partner-sites") !== -1, "hub : montage");

var css = read("css/partner-sites.css");
ok(css.indexOf("overflow-x: auto") !== -1, "css : filtres scroll mobile");
ok(css.indexOf("@media (max-width: 900px)") !== -1, "css : breakpoint mobile");
ok(css.indexOf("partner-hub-nav") !== -1, "css : nav hub mobile");

var crmJs = read("js/crm-partner-sites.js");
ok(crmJs.indexOf("/api/crm/partner-sites") !== -1, "CRM JS : API publish");
ok(crmJs.indexOf("toggle-public") !== -1, "CRM JS : toggle Public liste");
ok(crmJs.indexOf("setSitePublic") !== -1, "CRM JS : setSitePublic");
ok(crmJs.indexOf("countPublic") !== -1, "CRM JS : compte public");

var publicJs = read("js/public-partner-sites.js");
ok(publicJs.indexOf("API_URL") !== -1 || publicJs.indexOf("apiUrl") !== -1, "public JS : charge API");
ok(publicJs.indexOf("sitesByCategory") !== -1, "public JS : filtre actifs");

ok(read("api/crm/[action].js").indexOf("partner-sites") !== -1, "api/crm action");
ok(read("api/[action].js").indexOf("partner-sites") !== -1, "api public action");

ok(read("js/crm-sidebar.js").indexOf("crm-partner-sites.html") !== -1, "sidebar CRM");
ok(read("sites-partenaires/index.html").indexOf("data-partner-sites") !== -1, "hub : montage");

var store = require("../api/_lib/partner-sites-store.js");
var mixed = Lib.normalizeCatalog({
  categories: cat.categories,
  sites: [
    { id: "a", name: "A", url: "https://a.fr", active: true, category: "batiment" },
    { id: "b", name: "B", url: "https://b.fr", active: false, category: "batiment" },
  ],
});
var pub = store.publicCatalog(mixed);
ok(pub.sites.length === 1 && pub.sites[0].id === "a", "publicCatalog : seulement sites active");
ok(pub.sites.every(function (s) { return s.active === undefined; }), "publicCatalog : sans champ active");
ok(store.normalizeCatalog(data).sites.length >= 1, "store normalize");

var pkg = JSON.parse(read("package.json"));
ok(!!(pkg.scripts && pkg.scripts["verify:partner-sites"]), "npm script verify:partner-sites");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nTous les checks sites partenaires OK");
