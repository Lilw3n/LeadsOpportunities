#!/usr/bin/env node
/**
 * Vérifie tri/filtre leads + reconstruction URL d'origine (AVF, UTM, hash).
 */
var fs = require("fs");
var path = require("path");
var LeadOrigin = require("../js/lead-origin-lib.js");
var { enrichLeadRow } = require("../api/_lib/leads-filters.js");

function ok(c, m) {
  if (!c) throw new Error("FAIL: " + m);
  console.log("OK ", m);
}

var root = path.join(__dirname, "..");
var dash = fs.readFileSync(path.join(root, "dashboard.html"), "utf8");
var leadsApi = fs.readFileSync(path.join(root, "api/_lib/routes/leads.js"), "utf8");
var tracking = fs.readFileSync(path.join(root, "landings/tracking.js"), "utf8");
var attr = fs.readFileSync(path.join(root, "js/attribution.js"), "utf8");

ok(dash.indexOf('id="filterEmail"') !== -1, "dashboard filtre email");
ok(dash.indexOf('id="filterPhone"') !== -1, "dashboard filtre téléphone");
ok(dash.indexOf('data-sort="phone"') !== -1, "tri téléphone");
ok(dash.indexOf('data-sort="email"') !== -1, "tri email");
ok(dash.indexOf(">Origine<") !== -1, "colonne Origine");
ok(dash.indexOf("lead-origin-lib.js") !== -1, "dashboard charge LeadOrigin");
ok(dash.indexOf("LeadOrigin.formatCell") !== -1, "cellule origine");
ok(dash.indexOf("LeadOrigin.formatDetail") !== -1, "détail origine");

ok(leadsApi.indexOf('"phone"') !== -1 && leadsApi.indexOf("VALID_SORT") !== -1, "API sort phone");
ok(leadsApi.indexOf("emailPattern") !== -1, "API filtre email");
ok(leadsApi.indexOf("phonePattern") !== -1, "API filtre phone");
ok(leadsApi.indexOf("page_url") !== -1, "API search page_url");

ok(tracking.indexOf("page_url: window.location.href") !== -1, "tracking page_url");
ok(tracking.indexOf("page_hash:") !== -1, "tracking page_hash");
ok(attr.indexOf("page_url:") !== -1, "attribution page_url");

var avf = LeadOrigin.build({
  platform: "assurancevtcfrance",
  utm_source: "assurancevtcfrance",
  utm_medium: "site",
  utm_campaign: "avf_organic",
  payload: {
    site_domain: "assurancevtcfrance.com",
    page_hash: "#devis-vtc",
  },
});
ok(
  avf.url ===
    "https://assurancevtcfrance.com/?utm_source=assurancevtcfrance&utm_medium=site&utm_campaign=avf_organic#devis-vtc",
  "AVF URL reconstruite avec UTM + hash"
);

var lo = LeadOrigin.build({
  utm_source: "google",
  utm_medium: "cpc",
  utm_campaign: "vtc_idf",
  payload: { page: "/landings/vtc.html" },
});
ok(
  lo.url ===
    "https://www.leadsopportunities.fr/landings/vtc.html?utm_source=google&utm_medium=cpc&utm_campaign=vtc_idf",
  "LO landing ne prend pas utm_source comme host"
);

var full = LeadOrigin.build({
  payload: {
    page_url:
      "https://assurancevtcfrance.com/?utm_source=assurancevtcfrance&utm_medium=site&utm_campaign=avf_organic#devis-vtc",
  },
});
ok(full.url.indexOf("assurancevtcfrance.com") !== -1 && full.url.indexOf("#devis-vtc") !== -1, "page_url complète préservée");

var enriched = enrichLeadRow({
  id: 1,
  email: "a@b.fr",
  phone: "0600000000",
  source: "assurancevtcfrance",
  utm_source: "assurancevtcfrance",
  utm_medium: "site",
  utm_campaign: "avf_organic",
  payload: JSON.stringify({
    site_domain: "assurancevtcfrance.com",
    page_hash: "#devis-vtc",
  }),
});
ok(enriched.origin_url && enriched.origin_url.indexOf("utm_campaign=avf_organic") !== -1, "enrichLeadRow origin_url");
ok(enriched.origin_url.indexOf("#devis-vtc") !== -1, "enrichLeadRow hash");

console.log("\nverify-dashboard-leads-origin: OK");
