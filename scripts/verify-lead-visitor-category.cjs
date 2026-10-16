/**
 * Vérifie la catégorisation visiteurs / IP (CRM).
 */
var Cat = require("../js/lead-visitor-category-lib.js");

function ok(c, m) {
  if (!c) throw new Error("FAIL: " + m);
  console.log("OK ", m);
}

var meta = Cat.categorize({
  client_ip: "57.141.0.43",
  lead_score: 0,
  platform: "landing_wizard",
});
ok(meta.id === "bot_meta", "Meta 57.141 → bot_meta");
ok(/Meta|preview|crawler/i.test(meta.intent), "intent Meta");

var fb = Cat.categorize({ client_ip: "173.252.87.41", lead_score: 0 });
ok(fb.id === "bot_meta", "Facebook 173.252 → bot_meta");

var aws = Cat.categorize({ client_ip: "34.219.156.169", lead_score: 0 });
ok(aws.id === "bot_cloud", "AWS 34.219 → bot_cloud");

var test = Cat.categorize({
  client_ip: "87.231.190.52",
  email: "flood@example.com",
  lead_score: 40,
});
ok(test.id === "test", "example.com → test");

var prospect = Cat.categorize({
  client_ip: "176.184.46.237",
  email: "client@free.fr",
  phone: "0612345678",
  lead_score: 100,
  platform: "landing_form",
});
ok(prospect.id === "prospect", "contact + score → prospect");

var abandon = Cat.categorize({
  client_ip: "82.66.207.189",
  email: "a@b.fr",
  phone: "0611111111",
  lead_score: 20,
  payload: { funnel: { abandonedAt: "2026-08-22T12:00:00Z" } },
});
ok(abandon.id === "abandon", "contact + abandon → abandon");

var noise = Cat.categorize({
  client_ip: "1.2.3.4",
  lead_score: 0,
  platform: "landing_wizard",
});
ok(noise.id === "noise", "wizard sans contact → noise");

ok(Cat.badgeHtml(meta).indexOf("Plage Meta") >= 0, "badge html");
ok(Cat.detailHtml(prospect).indexOf("Prospect") >= 0, "detail html");

var Origin = require("../api/_lib/leads-filters.js");

function originOf(row) {
  return Origin.classifyLeadOrigin(row, row.payload || {});
}

ok(originOf({ source: "crm_create_complete" }).id === "manual", "crm_create_complete → saisie CRM");
ok(originOf({ source: "crm-agenda" }).id === "manual", "crm-agenda → saisie CRM");
ok(originOf({ source: "CRM" }).id === "manual", "CRM → saisie CRM");
ok(
  originOf({ source: "landing_form", client_ip: "57.141.24.10", fbclid: "abc" }).id === "meta_preview",
  "57.141 + fbclid → test Meta, pas un prospect"
);
ok(originOf({ source: "landing_form", fbclid: "abc", client_ip: "82.66.1.2" }).id === "meta_ads", "fbclid → pub Meta");
ok(originOf({ source: "meta_lead_ads", client_ip: "82.66.1.2" }).id === "meta_ads", "meta_lead_ads → pub Meta");
ok(originOf({ source: "landing_form", gclid: "g", client_ip: "82.66.1.2" }).id === "google_ads", "gclid → pub Google");
ok(originOf({ source: "landing_form", ttclid: "t", client_ip: "82.66.1.2" }).id === "tiktok_ads", "ttclid → pub TikTok");
ok(
  originOf({ source: "landing_form", platform: "assurancevtcfrance", client_ip: "82.66.1.2" }).id === "avf",
  "assurancevtcfrance → AVF"
);
ok(originOf({ source: "withallo_call", client_ip: "82.66.1.2" }).id === "withallo", "withallo → Withallo");
ok(originOf({ source: "landing_form", client_ip: "82.66.1.2" }).id === "site", "formulaire sans clic pub → site");

var enriched = Origin.enrichLeadRow({
  source: "landing_quick",
  client_ip: "176.184.46.237",
  email: "a@free.fr",
  phone: "0612345678",
});
ok(enriched.origin_id === "site" && enriched.is_manual === false, "enrichLeadRow pose origin_id");
ok(Origin.enrichLeadRow({ source: "crm_staff_upload" }).is_manual === true, "enrichLeadRow marque la saisie");

console.log("\nCatégories visiteurs : OK.");
