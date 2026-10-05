/**
 * Vérifie le pack domaine assurancevtcfrance.com (pub / SEO / leads).
 */
var assert = require("assert");
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

assert.ok(fs.existsSync(path.join(root, "assurance-vtc-france/index.html")), "index");
assert.ok(fs.existsSync(path.join(root, "assurance-vtc-france/devis.html")), "devis");
assert.ok(fs.existsSync(path.join(root, "assurance-vtc-france/styles.css")), "styles");
assert.ok(fs.existsSync(path.join(root, "docs/ASSURANCE-VTC-FRANCE-DNS.md")), "doc DNS");

var index = read("assurance-vtc-france/index.html");
assert.ok(index.indexOf("Assurance VTC France") !== -1, "marque home");
assert.ok(index.indexOf("canonical") !== -1 && index.indexOf("assurancevtcfrance.com") !== -1, "canonical");
assert.ok(index.indexOf("Devis assurance VTC") !== -1 || index.indexOf("devis-vtc") !== -1, "page VTC");
assert.ok(index.indexOf("leadsopportunities.fr") !== -1, "mention LO");
assert.ok(index.indexOf('name="need" value="vtc"') !== -1, "form need=vtc sur /");
assert.ok(index.indexOf("data-quick-devis") !== -1, "form express sur home");
assert.ok(index.indexOf("Wakam") !== -1, "angle Wakam");
assert.ok(index.indexOf('name="source" value="assurancevtcfrance"') !== -1, "source AVF");
assert.ok(index.indexOf('name="utm_source" value="assurancevtcfrance"') !== -1, "utm_source AVF");
assert.ok(index.indexOf("avf-btn-submit") !== -1, "bouton submit sticky visible");

assert.ok(index.indexOf('href="/assurance-vtc-france/styles.css"') !== -1, "CSS absolu (rewrite /)");
assert.ok(index.indexOf('src="/assurance-vtc-france/attr-boot.js"') !== -1, "attr-boot absolu");
assert.ok(index.indexOf('href="./styles.css"') === -1, "pas de CSS relatif cassé");
assert.ok(index.indexOf('src="./attr-boot.js"') === -1, "pas d'attr relatif cassé");

var styles = read("assurance-vtc-france/styles.css");
assert.ok(styles.indexOf("avf-btn-submit") !== -1, "CSS sticky submit");
assert.ok(styles.indexOf("z-index: 260") !== -1 || styles.indexOf("z-index:260") !== -1, "submit au-dessus cookie");

var devis = read("assurance-vtc-france/devis.html");
assert.ok(devis.indexOf('name="need" value="vtc"') !== -1, "need=vtc devis");
assert.ok(devis.indexOf("assurancevtcfrance.com") !== -1, "site_domain devis");
assert.ok(devis.indexOf("data-quick-devis") !== -1, "form express devis");
assert.ok(devis.indexOf("leadsopportunities.fr") !== -1, "mention LO devis");
assert.ok(devis.indexOf('href="/assurance-vtc-france/styles.css"') !== -1, "CSS absolu devis");
assert.ok(devis.indexOf("/landings/tracking.js") !== -1 || devis.indexOf("landings/tracking.js") !== -1, "tracking");
assert.ok(devis.indexOf('name="utm_source" value="assurancevtcfrance"') !== -1, "utm devis");
assert.ok(devis.indexOf("avf-btn-submit") !== -1, "submit devis");

var tracking = read("landings/tracking.js");
assert.ok(tracking.indexOf("getAvfLeadDefaults") !== -1, "tracking force AVF");
assert.ok(tracking.indexOf("assurancevtcfrance") !== -1, "tracking tag AVF");

var crmSources = read("crm-sources.html");
assert.ok(crmSources.indexOf("assurancevtcfrance") !== -1, "CRM filtre AVF");
assert.ok(crmSources.indexOf("avfRecensement") !== -1, "CRM panneau recensement AVF");

var crmSourcesJs = read("crm-sources.js");
assert.ok(crmSourcesJs.indexOf("renderAvf") !== -1, "CRM render AVF");

var crmApi = read("api/_lib/routes/crm-leads-sources.js");
assert.ok(crmApi.indexOf("assurancevtcfrance") !== -1, "API sources AVF");
assert.ok(crmApi.indexOf("by_site_domain") !== -1, "API by_site_domain");

var dash = read("dashboard.html");
assert.ok(dash.indexOf('value="assurancevtcfrance"') !== -1, "dashboard filtre AVF");

var brand = read("js/site-host-brand.js");
assert.ok(brand.indexOf("isAssuranceVtcFrance") !== -1, "brand host");
assert.ok(brand.indexOf("assurancevtcfrance.com") !== -1, "origin AVF");

var vercel = read("vercel.json");
assert.ok(vercel.indexOf('"value": "assurancevtcfrance.com"') !== -1, "rewrite apex");
assert.ok(vercel.indexOf('"value": "www.assurancevtcfrance.com"') !== -1, "rewrite www");
assert.ok(vercel.indexOf("/assurance-vtc-france/index.html") !== -1, "rewrite home VTC");
assert.ok(vercel.indexOf("/assurance-vtc-france/devis.html") !== -1, "rewrite devis");
assert.ok(vercel.indexOf("https://www.assurancevtcfrance.com/:path*") === -1, "pas de redirect apex→www qui change l’URL");

var mw = read("middleware.js");
assert.ok(mw.indexOf("isAssuranceVtcFranceHost") !== -1, "middleware host AVF");
assert.ok(mw.indexOf("rewriteAvfHome") !== -1, "middleware rewrite home VTC");
assert.ok(mw.indexOf("/assurance-vtc-france/index.html") !== -1, "middleware cible page VTC");

assert.ok(fs.existsSync(path.join(root, "ads/meta-assurancevtcfrance.csv")), "meta ads");
assert.ok(fs.existsSync(path.join(root, "ads/google-assurancevtcfrance.csv")), "google ads");
var meta = read("ads/meta-assurancevtcfrance.csv");
assert.ok(meta.indexOf("https://assurancevtcfrance.com/") !== -1, "meta landing apex VTC");

var partners = read("data/partner-sites.json");
assert.ok(partners.indexOf("assurancevtcfrance.com") !== -1, "partner-sites entry");

var pkg = read("package.json");
assert.ok(pkg.indexOf("verify:assurance-vtc-france") !== -1, "npm script");

console.log("verify:assurance-vtc-france OK");
