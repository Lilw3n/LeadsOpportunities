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

ok(Cat.badgeHtml(meta).indexOf("Bot Meta") >= 0, "badge html");
ok(Cat.detailHtml(prospect).indexOf("Prospect") >= 0, "detail html");

console.log("\nCatégories visiteurs : OK.");
