#!/usr/bin/env node
/**
 * Rotation Meta 4 semaines — calcule la semaine active + CPL estimé.
 * Usage:
 *   node scripts/meta-campaign-rotation.cjs
 *   node scripts/meta-campaign-rotation.cjs --write
 */
const path = require("path");

try {
  require("dotenv").config({ path: path.join(process.cwd(), ".env") });
} catch (e) {
  /* optional */
}

const { getSql } = require("../api/_lib/db");
const {
  buildRotationState,
  buildAndPersist,
  ACTIVE_PATH,
} = require("../api/_lib/meta-campaign-rotation");

function hasFlag(name) {
  return process.argv.indexOf("--" + name) >= 0;
}

async function main() {
  var sql = null;
  if (process.env.DATABASE_URL) {
    try {
      sql = getSql();
    } catch (e) {
      console.warn("[meta-rotation] DB indisponible:", e.message);
    }
  }

  if (hasFlag("write")) {
    var state = await buildAndPersist({ sql: sql });
    console.log("Écrit:", ACTIVE_PATH);
    printSummary(state);
    return;
  }

  var state = await buildRotationState({ sql: sql });
  printSummary(state);
  console.log("\nGénérer data/meta-campaign-rotation-active.json : npm run meta:rotation:build");
}

function printSummary(state) {
  var slot = state.active_slot || {};
  var focus = slot.site_focus || {};
  console.log("\n=== Meta rotation intelligente (1 €/jour) ===\n");
  console.log("Semaine calendrier:", state.calendar_week, "| slot:", slot.id, "| vertical:", slot.vertical);
  console.log("Du", state.week_bounds.startsAt.slice(0, 10), "au", state.week_bounds.endsAt.slice(0, 10));
  console.log("");
  console.log("--- Site (focus public) ---");
  console.log("Landing:", focus.landing || slot.landing_path);
  console.log("Hero:", focus.heroTitle);
  console.log("CTA:", focus.cta);
  console.log("");
  console.log("--- Meta Ads (1 campagne active) ---");
  console.log("Form ID:", slot.form_id, "|", slot.form_name);
  console.log("Headline:", slot.ad_copy && slot.ad_copy.headline);
  console.log("Primary:", slot.ad_copy && slot.ad_copy.primary);
  console.log("UTM:", slot.utm_campaign);
  if (slot.discrete) console.log("[discret] Pas de VSP/VTC explicite dans la pub");
  console.log("");
  console.log("--- Stats semaine en cours ---");
  console.log("Leads Meta:", state.current_stats.leads, "| CPL est.:", state.current_stats.cpl_eur != null ? state.current_stats.cpl_eur + " €" : "—");
  console.log("Verdict:", state.current_stats.verdict, "—", state.current_stats.message);
  console.log("");
  console.log("--- Recommandation ---");
  console.log(state.recommendation.action + ":", state.recommendation.reason);
  console.log("");
  console.log("Plan 4 semaines:");
  (state.schedule || []).forEach(function (s) {
    console.log((s.is_current ? "▶" : "·") + " S" + s.week, s.id, "—", s.site_label, s.discrete ? "[discret]" : "");
  });
  console.log("");
}

main().catch(function (e) {
  console.error(e);
  process.exit(1);
});
