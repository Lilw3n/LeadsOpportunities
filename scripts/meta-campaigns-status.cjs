#!/usr/bin/env node
/**
 * Affiche la file d'attente campagnes Meta (budget 1 €/jour, 1 active max).
 * Usage: node scripts/meta-campaigns-status.cjs
 */
const fs = require("fs");
const path = require("path");

const QUEUE = path.join(process.cwd(), "config/meta-campaigns-queue.json");

function main() {
  if (!fs.existsSync(QUEUE)) {
    console.error("Manquant:", QUEUE);
    process.exit(1);
  }
  var q = JSON.parse(fs.readFileSync(QUEUE, "utf8"));
  var policy = q.ads_policy || {};
  console.log("\n=== Meta — file campagnes (prêt à activer) ===\n");
  console.log(
    "Budget max:",
    policy.max_daily_budget_eur,
    "€/jour · campagnes actives max:",
    policy.max_active_campaigns
  );
  console.log("Première recommandée:", q.recommended_first_activation || "—");
  console.log("");

  var active = (q.campaigns || []).filter(function (c) {
    return c.active;
  });
  if (active.length > 1) {
    console.warn("[WARN] Plus d'une campagne active=true — respecter 1 €/jour total.\n");
  } else if (active.length === 1) {
    console.log("▶ ACTIVE:", active[0].id, "—", active[0].ad_copy.headline, "\n");
  } else {
    console.log("Aucune campagne active (toutes en attente).\n");
  }

  var sorted = (q.campaigns || []).slice().sort(function (a, b) {
    return (a.priority || 99) - (b.priority || 99);
  });

  sorted.forEach(function (c) {
    var flag = c.active ? "▶" : c.status === "reserve" ? "○" : "·";
    var disc = c.discrete ? " [discret]" : "";
    console.log(
      flag,
      "#" + c.priority,
      c.id + disc,
      "|",
      c.budget_eur_day + "€/j",
      "| form",
      c.form_id,
      "|",
      c.status
    );
    if (c.ad_copy && c.ad_copy.headline) {
      console.log("   ", c.ad_copy.headline);
    }
  });

  console.log("\nActiver: docs/META-CAMPAGNES-ACTIVATION.md");
  console.log("CSV: ads/meta-campaigns-ready.csv\n");
}

main();
