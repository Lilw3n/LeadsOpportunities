#!/usr/bin/env node
/**
 * Vérifie que le déploiement prod expose les routes clés (CRM pubs, rotation, webhook Meta).
 * Usage: node scripts/check-prod-deploy.cjs
 */
const ORIGIN = process.env.PROD_ORIGIN || "https://www.leadsopportunities.fr";

const checks = [
  { name: "crm-pubs.html", url: "/crm-pubs.html", expect: (r, t) => r.ok && t.includes("presetCampaigns") },
  { name: "crm-trafic.html", url: "/crm-trafic.html", expect: (r) => r.ok },
  { name: "acquisition-focus", url: "/api/acquisition-focus", expect: (r, t) => r.ok && t.includes("meta_sante_senior_canicule") },
  { name: "meta-webhook verify", url: "/api/webhooks/meta-lead?hub.mode=subscribe&hub.verify_token=lo-meta-webhook-2026&hub.challenge=ping", expect: (r, t) => r.ok && t.trim() === "ping" },
  { name: "negociateur-immobilier", url: "/negociateur-immobilier/", expect: (r, t) => r.ok && t.includes("Negociateur immobilier") },
  { name: "agence-varangeville", url: "/agence-varangeville/", expect: (r, t) => r.ok && t.includes("Varangéville") && t.includes("Wendy Buchet") },
  { name: "acheteur-immo landing", url: "/landings/acheteur-immo.html", expect: (r, t) => r.ok && t.includes("acheteur-immo") },
  { name: "projection-achat", url: "/landings/projection-achat.html", expect: (r, t) => r.ok && t.includes("projForm") && t.includes("achat-projection-lib") },
];

async function run() {
  var failed = 0;
  for (var i = 0; i < checks.length; i++) {
    var c = checks[i];
    try {
      var r = await fetch(ORIGIN + c.url);
      var t = await r.text();
      if (c.expect(r, t)) {
        console.log("OK  ", c.name);
      } else {
        console.log("FAIL", c.name, r.status, t.slice(0, 80));
        failed++;
      }
    } catch (e) {
      console.log("ERR ", c.name, e.message);
      failed++;
    }
  }
  if (failed) {
    console.error("\n" + failed + " check(s) failed");
    process.exit(1);
  }
  console.log("\nProd deploy OK —", ORIGIN);
}

run();
