#!/usr/bin/env node
/**
 * Affiche la campagne santé collective (Google + Meta) prête à activer.
 * Usage: npm run meta:collective
 */
var fs = require("fs");
var path = require("path");

var META = path.join(process.cwd(), "config/meta-campaign-collective.json");
var GOOGLE = path.join(process.cwd(), "config/google-campaign-collective.json");
var CSV = path.join(process.cwd(), "ads/meta-collective-priorite.csv");

function main() {
  if (!fs.existsSync(META) || !fs.existsSync(GOOGLE)) {
    console.error("Configs collective manquantes");
    process.exit(1);
  }
  var meta = JSON.parse(fs.readFileSync(META, "utf8"));
  var google = JSON.parse(fs.readFileSync(GOOGLE, "utf8"));
  var c = meta.campaign || {};
  var ad = c.ad_copy || {};
  var g = google.campaign || {};

  console.log("\n=== Santé collective — activation pubs ===\n");

  console.log("--- Google Search ---");
  console.log("Campagne:", g.id, "|", g.active ? "▶ READY" : "pause");
  console.log("Budget:", g.budget_eur_day, "€/jour");
  console.log("CSV:", g.csv);
  console.log("Landing:", g.landing);
  console.log("Import: Google Ads Editor →", g.editor_csv || g.csv);
  console.log("");

  console.log("--- Meta (1 €/jour) ---");
  console.log("Campagne:", c.id, "|", c.active ? "▶ READY" : "pause");
  console.log("Budget:", c.budget_eur_day, "€/jour");
  console.log("Headline:", ad.headline);
  console.log("Primary:", ad.primary);
  console.log("CTA:", ad.cta);
  console.log("Landing:", c.landing + "?utm_source=meta&utm_medium=paid_social&utm_campaign=" + c.utm_campaign);
  console.log("CSV:", CSV);
  console.log("");

  console.log("--- Checklist Google ---");
  (google.activation_checklist || []).forEach(function (line, i) {
    console.log("  " + (i + 1) + ". " + line);
  });
  console.log("");
  console.log("--- Checklist Meta ---");
  (meta.activation_checklist || []).forEach(function (line, i) {
    console.log("  " + (i + 1) + ". " + line);
  });
  console.log("");
  console.log("CRM pubs: https://www.leadsopportunities.fr/crm-pubs.html");
  console.log("Ads Manager Meta: https://www.facebook.com/adsmanager/manage/campaigns?act=997768686183548");
  console.log("Google Ads: https://ads.google.com/aw/campaigns");
  console.log("");
}

main();
