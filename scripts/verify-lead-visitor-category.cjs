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

/* ---------- Tests et faux contacts ---------- */
ok(
  Cat.categorize({
    client_ip: "82.66.1.2",
    email: "jean@gmail.com",
    lead_score: 80,
    payload: { fullName: "<test lead: dummy data for full_name>" },
  }).id === "test",
  "lead de test Meta (dummy data) → test"
);
ok(Cat.categorize({ client_ip: "82.66.1.2", email: "test@fb.com", lead_score: 80 }).id === "test", "test@fb.com → test");
ok(
  Cat.categorize({ client_ip: "82.66.1.2", phone: "0600000000", lead_score: 80 }).id !== "prospect",
  "0600000000 seul → pas un prospect"
);
ok(
  Cat.categorize({ client_ip: "82.66.1.2", phone: "06 12 34 56 78", lead_score: 80 }).id === "prospect",
  "vrai mobile → prospect"
);

/* ---------- Onglets ---------- */
var B = Origin.leadBucket;
ok(B({ email: "marie@orange.fr", phone: "0698765432", lead_score: 90, client_ip: "82.66.1.2" }).bucket === "prospects", "contact réel → À traiter");
ok(B({ email: "flood@example.com", lead_score: 90 }).bucket === "bruit", "email fictif → Bruit");
ok(B({ lead_score: 0, client_ip: "57.141.0.4", platform: "landing_wizard" }).bucket === "bruit", "plage Meta → Bruit");
ok(B({ lead_score: 0, platform: "landing_wizard" }).bucket === "bruit", "sans contact → Bruit");
ok(B({ email: "marie@orange.fr", lead_score: 90, is_duplicate: true }).bucket === "bruit", "doublon → Bruit");
ok(
  B({ email: "a@b.fr", phone: "0611111112", lead_score: 20, payload: { funnel: { abandonedAt: "2026-10-01" } } }).bucket === "abandons",
  "contact + abandon → Abandons"
);
ok(B({ source: "crm_create_complete", phone: "0698765432" }).bucket === "prospects", "saisie CRM → À traiter");

/* ---------- Canal précis ---------- */
var Ch = require("../js/lead-channel-lib.js");
var c1 = Ch.classify({
  source: "landing_form",
  fbclid: "IwAR1",
  utm_campaign: "vtc-idf-octobre",
  payload: { attr_last_utm_medium: "paid_social", attr_last_utm_content: "video-chauffeur", landing_path: "/assurance-vtc/paris/" },
});
ok(c1.channel === "pub" && c1.network === "Meta", "fbclid + campagne → Pub Meta");
ok(/vtc-idf-octobre/.test(c1.detail) && /video-chauffeur/.test(c1.detail), "détail : campagne + annonce");

var c2 = Ch.classify({
  source: "landing_form",
  payload: { referrer_first: "https://www.google.com/", landing_path: "/assurance-vtc/lyon/" },
});
ok(c2.channel === "seo" && c2.network === "Google" && c2.page === "/assurance-vtc/lyon/", "référent Google sans pub → SEO + page");

var c3 = Ch.classify({
  source: "landing_form",
  article_title: "Mutuelle pas chère après 60 ans",
  payload: { referrer_first: "https://www.bing.com/search?q=x", landing_path: "/blog/mutuelle-60-ans.html" },
});
ok(c3.channel === "seo" && c3.network === "Bing" && /Mutuelle pas chère/.test(c3.detail), "SEO Bing → article de blog");

var c4 = Ch.classify({ source: "landing_form", gclid: "Cj0", utm_campaign: "pret-nancy", utm_term: "pret immo nancy" });
ok(c4.channel === "pub" && c4.network === "Google" && /pret immo nancy/.test(c4.detail), "gclid → Pub Google + mot-clé");

var c5 = Ch.classify({ source: "landing_form", payload: { referrer_first: "https://l.facebook.com/" } });
ok(c5.channel === "social" && c5.network === "Facebook", "lien Facebook sans pub → réseaux sans pub");

var c6 = Ch.classify({ source: "meta_lead_ads", payload: { campaign_name: "Santé collective", ad_name: "Carrousel" } });
ok(c6.channel === "pub" && /formulaire Facebook/.test(c6.label) && /Carrousel/.test(c6.detail), "Lead Ads → Pub Meta (formulaire) + annonce");

var c7 = Ch.classify({ source: "landing_form", payload: { referrer_first: "https://www.comparateur-x.fr/page" } });
ok(c7.channel === "referral" && c7.referrer === "comparateur-x.fr", "autre site → lien externe");

ok(Ch.classify({ source: "landing_form", payload: { landing_path: "/" } }).channel === "direct", "sans provenance → direct");
ok(Ch.classify({ source: "crm_create_complete" }).channel === "manual", "saisie CRM → manual");

var dec = Origin.decorateLeadChannel({
  source: "landing_form",
  email: "paul@sfr.fr",
  lead_score: 70,
  client_ip: "82.66.1.2",
  payload: JSON.stringify({ referrer_first: "https://www.google.fr/", landing_path: "/pret-immobilier/nancy-metropole/" }),
});
ok(dec.channel === "seo" && dec.bucket === "prospects" && dec.channel_page === "/pret-immobilier/nancy-metropole/", "decorateLeadChannel : SEO + À traiter + page");

console.log("\nCatégories visiteurs : OK.");
