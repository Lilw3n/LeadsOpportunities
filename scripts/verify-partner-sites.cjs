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
ok(cat.sites.some(function (s) { return s.category === "batiment"; }), "site bâtiment");

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
ok(crm.indexOf("sitePreviewImage") !== -1, "CRM : champ photo");
ok(crm.indexOf("btnPublishSites") !== -1, "CRM : bouton Publier");
ok(crm.indexOf("btnExportJson") !== -1, "CRM : export JSON");
ok(crm.indexOf("btnNewSite") !== -1, "CRM : nouveau site");
ok(crm.indexOf("Publier sur le site") !== -1, "CRM : libellé publication");

var crmJs = read("js/crm-partner-sites.js");
ok(crmJs.indexOf("/api/crm/partner-sites") !== -1, "CRM JS : API publish");
ok(crmJs.indexOf("btnPublishSites") !== -1, "CRM JS : handler publish");

var publicJs = read("js/public-partner-sites.js");
ok(publicJs.indexOf("apiUrl") !== -1 || publicJs.indexOf("API_URL") !== -1, "public JS : charge API");

ok(read("api/crm/[action].js").indexOf("partner-sites") !== -1, "api/crm action");
ok(read("api/[action].js").indexOf("partner-sites") !== -1, "api public action");

ok(read("js/crm-sidebar.js").indexOf("crm-partner-sites.html") !== -1, "sidebar CRM");
ok(read("sites-partenaires/index.html").indexOf("data-partner-sites") !== -1, "hub : montage");

var store = require("../api/_lib/partner-sites-store.js");
var pub = store.publicCatalog(cat);
ok(pub.sites.every(function (s) { return s.active === undefined; }), "publicCatalog : sites actifs sans champ active");
ok(store.normalizeCatalog(data).sites.length >= 1, "store normalize");

var pkg = JSON.parse(read("package.json"));
ok(!!(pkg.scripts && pkg.scripts["verify:partner-sites"]), "npm script verify:partner-sites");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nTous les checks sites partenaires OK");
