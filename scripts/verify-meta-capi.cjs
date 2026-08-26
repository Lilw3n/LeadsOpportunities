#!/usr/bin/env node
/**
 * Vérifie la config Meta CAPI (variables locales ou prod via BASE_URL).
 * Usage :
 *   npm run meta:capi:verify
 *   BASE_URL=https://www.leadsopportunities.fr CRM_TOKEN=... npm run meta:capi:verify -- --validate
 */
const BASE = process.env.BASE_URL || "https://www.leadsopportunities.fr";

function pass(msg) {
  console.log("[OK]", msg);
}

function warn(msg) {
  console.warn("[WARN]", msg);
}

function fail(msg) {
  console.error("[FAIL]", msg);
  process.exitCode = 1;
}

async function checkLocalEnv() {
  var { buildMetaReadiness, validateMetaCapiToken } = require("../api/_lib/meta-readiness");
  var r = buildMetaReadiness();
  console.log("\n=== Variables locales / process.env ===");
  (r.vercel_vars || []).forEach(function (v) {
    if (v.ok) pass(v.key);
    else if (v.required) fail(v.key + " manquant");
    else warn(v.key + " absent (optionnel)");
  });

  if (process.argv.includes("--validate") && r.capi_configured) {
    console.log("\n=== Validation token Graph API ===");
    var v = await validateMetaCapiToken();
    if (v.ok) pass("Token CAPI valide — pixel « " + (v.pixel_name || r.pixel_id) + " »");
    else fail((v.error || v.reason || "validation échouée") + "");
  } else if (process.argv.includes("--validate")) {
    fail("META_CAPI_TOKEN absent — impossible de valider");
  }

  return r;
}

async function checkProdPixel() {
  console.log("\n=== Prod pixel (google-config-env) ===");
  var r = await fetch(BASE + "/api/google-config-env");
  var txt = await r.text();
  if (txt.indexOf("4470774303164658") >= 0 || txt.indexOf("metaPixelId") >= 0) {
    pass("metaPixelId exposé sur " + BASE);
  } else {
    warn("metaPixelId non trouvé dans google-config-env");
  }

  console.log("\n=== Prod meta-status (CAPI bool) ===");
  try {
    var st = await fetch(BASE + "/api/meta-status");
    var data = await st.json();
    if (data.capi_configured) pass("CAPI configuré en prod (META_CAPI_TOKEN présent)");
    else fail("CAPI non configuré en prod — coller META_CAPI_TOKEN sur Vercel + Redeploy");
    if (data.pixel_id) pass("pixel_id=" + data.pixel_id);
  } catch (e) {
    warn("meta-status indisponible (pas encore déployé ?) — " + e.message);
  }
}

async function checkProdReadiness() {
  var token = process.env.CRM_TOKEN || process.env.LO_CRM_TOKEN || "";
  if (!token) {
    warn("CRM_TOKEN absent — skip /api/crm/meta-readiness (connexion CRM requise)");
    return;
  }
  console.log("\n=== Prod meta-readiness (CRM admin) ===");
  var url = BASE + "/api/crm/meta-readiness" + (process.argv.includes("--validate") ? "?validate=1" : "");
  var res = await fetch(url, { headers: { Authorization: "Bearer " + token } });
  var data = await res.json().catch(function () {
    return {};
  });
  if (data.capi_configured) pass("CAPI configuré en prod");
  else fail("CAPI non configuré en prod — ajouter META_CAPI_TOKEN sur Vercel");
  if (data.capi_validation) {
    if (data.capi_validation.ok) pass("Validation prod OK");
    else fail(data.capi_validation.error || "validation prod échouée");
  }
}

async function main() {
  await checkLocalEnv();
  await checkProdPixel();
  await checkProdReadiness();
  console.log("\n=== Checklist Events Manager ===");
  console.log("1. Events Manager → Test events → ouvrir :");
  console.log("   " + BASE + "/landings/rappel.html?utm_source=meta&utm_medium=test&utm_campaign=capi-check");
  console.log("2. Accepter cookies → remplir formulaire test → vérifier Lead (Navigateur + Serveur)");
  console.log("3. CRM → Gestion pubs → « Test Events Manager » avec le code TEST…");
}

main().catch(function (e) {
  fail(e.message);
});
