#!/usr/bin/env node
/**
 * Affiche la campagne Meta VSP discrète (1 €/jour, VSP seule).
 * Usage: node scripts/meta-vsp-discret-status.cjs
 */
const fs = require("fs");
const path = require("path");

const CONFIG = path.join(process.cwd(), "config/meta-campaign-vsp-discret.json");
const CSV = path.join(process.cwd(), "ads/meta-vsp-discret.csv");

function main() {
  if (!fs.existsSync(CONFIG)) {
    console.error("Manquant:", CONFIG);
    process.exit(1);
  }
  var cfg = JSON.parse(fs.readFileSync(CONFIG, "utf8"));
  var policy = cfg.ads_policy || {};
  var c = cfg.campaign || {};
  var ad = c.ad_copy || {};
  var t = c.targeting || {};

  console.log("\n=== Meta VSP — pub discrète (seule campagne) ===\n");
  console.log("Budget max:", policy.max_daily_budget_eur, "€/jour · campagnes max:", policy.max_active_campaigns);
  console.log("Statut:", c.active ? "▶ ACTIVE" : "· en attente", "| form_id:", c.form_id);
  console.log("");

  console.log("--- Textes pub (copier dans Ads Manager) ---");
  console.log("Headline:", ad.headline || "—");
  console.log("Primary:", ad.primary || "—");
  console.log("Description:", ad.description || "—");
  console.log("CTA:", ad.cta || "—");
  console.log("");

  console.log("--- Ciblage ---");
  console.log("Geo:", t.geo, "| Langue:", t.language);
  console.log("Age:", t.age_min + "–" + t.age_max, t.age_note ? "(" + t.age_note + ")" : "");
  console.log("Intérêts:", (t.interests_meta || []).join(", "));
  console.log("");

  console.log("--- Interdit dans la pub ---");
  console.log((cfg.discrete_rules && cfg.discrete_rules.public_ad_must_not_contain || []).join(", "));
  console.log("");

  console.log("Doc:", "docs/META-VSP-PUB-DISCRETE.md");
  console.log("CSV:", fs.existsSync(CSV) ? CSV : "(absent)");
  console.log("CRM matching:", cfg.discrete_rules && cfg.discrete_rules.crm_tool || "—");
  console.log("");
}

main();
