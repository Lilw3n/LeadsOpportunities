#!/usr/bin/env node
/**
 * Vérifie la détection / le filtre du réseau d’acquisition
 * (Meta via fbclid, distinct de landing_form).
 */
var fs = require("fs");
var path = require("path");
var Net = require("../api/_lib/lead-network");
var Filters = require("../api/_lib/leads-filters");
var failed = 0;

function assert(cond, msg) {
  if (!cond) {
    failed++;
    console.log("FAIL", msg);
  } else {
    console.log("OK  ", msg);
  }
}

function read(rel) {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf8");
}

var metaChasse = {
  source: "landing_form",
  vertical: "chasse",
  utm_source: null,
  platform: null,
  payload: {
    parcours_id: "meta_lead_rapide",
    fbclid: "IwAR0chasseBeziers",
    source: "landing_form",
    seo_city: "beziers",
  },
};

var metaVtc = {
  source: "landing_form",
  vertical: "vtc",
  payload: JSON.stringify({
    parcours_id: "meta_lead_rapide",
    attr_last_fbclid: "abc123fbclid",
    source: "landing_form",
  }),
};

var organique = {
  source: "landing_form",
  vertical: "vtc",
  payload: { source: "landing_form", parcours_id: "devis_standard" },
};

var googleLead = {
  source: "landing_quick",
  gclid: "Cj0KCQjw",
  payload: { source: "landing_quick" },
};

var insta = {
  source: "landing_form",
  utm_source: "instagram",
  payload: { utm_source: "instagram", fbclid: "igclid" },
};

var tiktokStored = {
  source: "landing_form",
  platform: "tiktok",
  utm_source: null,
  payload: { source: "landing_form" },
};

var tiktokClick = {
  source: "landing_quick",
  ttclid: "E.C.P.v3.abc",
  payload: { source: "landing_quick" },
};

assert(Net.detectNetwork(metaChasse) === "facebook", "chasse + fbclid + meta_lead_rapide → Meta");
assert(Net.networkLabel(metaChasse) === "Meta", "label Meta");
assert(Net.detectNetwork(metaVtc) === "facebook", "payload JSON string + attr_last_fbclid → Meta");
assert(Net.detectNetwork(organique) === "site_web", "landing_form sans clic id → site");
assert(Net.detectNetwork(googleLead) === "google", "gclid → Google");
assert(Net.detectNetwork(insta) === "instagram", "utm instagram → Instagram");
assert(Net.detectNetwork(tiktokStored) === "tiktok", "colonne platform=tiktok → TikTok");
assert(Net.detectNetwork(tiktokClick) === "tiktok", "ttclid → TikTok");
assert(Net.networkLabel(tiktokStored) === "TikTok", "label TikTok");

assert(Net.matchesNetworkFilter(metaChasse, "facebook"), "filtre Meta garde le lead chasse");
assert(Net.matchesNetworkFilter(metaChasse, "meta"), "filtre meta alias");
assert(!Net.matchesNetworkFilter(metaChasse, "google"), "filtre Google exclut Meta");
assert(!Net.matchesNetworkFilter(metaChasse, "site_web"), "filtre Site exclut Meta (même si landing_form)");
assert(Net.matchesNetworkFilter(organique, "site_web"), "filtre Site garde organique");
assert(!Net.matchesNetworkFilter(organique, "facebook"), "filtre Meta exclut organique");
assert(Net.matchesNetworkFilter(insta, "facebook"), "filtre Meta inclut Instagram");
assert(Net.matchesNetworkFilter(insta, "instagram"), "filtre Instagram garde IG");
assert(Net.matchesNetworkFilter(tiktokStored, "tiktok"), "filtre TikTok garde platform stockée");
assert(Net.matchesNetworkFilter(tiktokClick, "tiktok"), "filtre TikTok garde ttclid");
assert(!Net.matchesNetworkFilter(tiktokStored, "facebook"), "filtre Meta exclut TikTok");
assert(Net.normalizeNetworkFilter("landing_form") === "site_web", "landing_form → site_web");
assert(Net.normalizeNetworkFilter("Meta") === "facebook", "Meta → facebook");

var enriched = Filters.enrichLeadRow({
  source: "landing_form",
  platform: null,
  payload: { fbclid: "x", parcours_id: "meta_lead_rapide" },
});
assert(enriched.network === "facebook", "enrichLeadRow détecte Meta");
assert(enriched.network_label === "Meta", "enrichLeadRow label Meta");
assert(enriched.platform === "facebook", "enrichLeadRow remplace platform vide");
assert(enriched.form_source === "landing_form", "enrichLeadRow conserve form_source");
assert(Net.normalizeNetworkFilter("landing_form") === "site_web", "landing_form → site_web");

var enriched = Filters.enrichLeadRow({
  source: "landing_form",
  payload: { parcours_id: "meta_lead_rapide", fbclid: "x" },
});
assert(enriched.network === "facebook" && enriched.network_label === "Meta", "enrichLeadRow pose network Meta");
assert(enriched.platform === "facebook", "platform n’est plus landing_form");
assert(enriched.form_source === "landing_form", "form_source conserve le type de formulaire");

var parsed = Filters.parseLeadListFilters(new URL("http://x/?platform=Meta"));
assert(parsed.platform === "facebook", "parseLeadListFilters meta → facebook");

var dash = read("dashboard.html");
assert(dash.indexOf('value="landing_form"') < 0, "dropdown sans landing_form");
assert(dash.indexOf("leadNetworkLabel") >= 0, "affichage network_label");

var api = read("api/_lib/routes/leads.js");
assert(api.indexOf("sqlLeadNetworkFilter") >= 0, "API liste : prédicat réseau");
assert(api.indexOf("attr_last_fbclid") >= 0 || read("api/_lib/lead-network.js").indexOf("attr_last_fbclid") >= 0, "SQL/JS lit attr_last_fbclid");

["api/_lib/lead-network.js", "api/_lib/leads-filters.js", "api/_lib/routes/leads.js"].forEach(function (rel) {
  require("child_process").execFileSync(process.execPath, ["--check", path.join(__dirname, "..", rel)]);
  assert(true, "syntaxe " + rel);
});

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nTous les contrôles réseau d’acquisition sont OK.");
