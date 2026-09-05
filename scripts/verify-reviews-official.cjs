#!/usr/bin/env node
/** Vérifie le système d'avis officiels Trustpilot / Google. */
var fs = require("fs");
var path = require("path");
var Lib = require("../js/reviews-official-lib.js");

var root = path.join(__dirname, "..");
var failed = 0;

function ok(cond, msg) {
  if (!cond) {
    failed++;
    console.log("FAIL", msg);
  } else {
    console.log("OK  ", msg);
  }
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

ok(exists("data/reviews-official.json"), "data/reviews-official.json");
ok(exists("js/reviews-official-lib.js"), "lib");
ok(exists("js/public-reviews-official.js"), "public js");
ok(exists("js/crm-reviews-official.js"), "crm js");
ok(exists("css/reviews-official.css"), "css");
ok(exists("crm-reviews-official.html"), "crm page");
ok(exists("api/_lib/routes/reviews-official-env.js"), "api env route");

var data = JSON.parse(read("data/reviews-official.json"));
var cfg = Lib.normalize(data);
ok(cfg.enabled === true, "enabled par défaut");
ok(cfg.trustpilot.verified !== true, "pas de note Trustpilot fake (verified=false)");
ok(cfg.trustpilot.score == null, "score Trustpilot null tant que non vérifié");
ok(Lib.primaryScore(cfg) == null, "pas d’AggregateRating sans verified");
ok(Lib.aggregateRatingLd(cfg) == null, "aggregateRatingLd null");

var verified = Lib.normalize({
  trustpilot: { score: 4.8, reviewCount: 12, verified: true, businessUnitId: "abc", profileUrl: "https://fr.trustpilot.com/review/exemple" },
});
ok(Lib.hasOfficialScore(verified.trustpilot), "score officiel si verified");
ok(Lib.aggregateRatingLd(verified) && Lib.aggregateRatingLd(verified).ratingValue === "4.8", "AggregateRating OK");

var invite = Lib.fillInvite("TP {{trustpilot}} GO {{google}}", {
  trustpilot: { inviteUrl: "https://tp.example/invite" },
  google: { reviewUrl: "https://g.example/review" },
});
ok(invite.indexOf("https://tp.example/invite") !== -1, "template {{trustpilot}}");
ok(invite.indexOf("https://g.example/review") !== -1, "template {{google}}");

var index = read("index.html");
ok(index.indexOf('data-reviews-official') !== -1, "accueil : section");
ok(index.indexOf("id=\"avis-officiels\"") !== -1, "accueil : ancre #avis-officiels");
ok(index.indexOf("reviews-official.css") !== -1, "accueil : css");
ok(index.indexOf("public-reviews-official.js") !== -1, "accueil : js");
ok(index.indexOf("/api/reviews-official-env") !== -1, "accueil : env inject");

var crm = read("crm-reviews-official.html");
ok(crm.indexOf("tpBusinessUnitId") !== -1, "CRM : Business Unit ID");
ok(crm.indexOf("btnExport") !== -1, "CRM : export JSON");
ok(crm.indexOf("btnCopySms") !== -1, "CRM : copier SMS");
ok(crm.indexOf("tpVerified") !== -1, "CRM : flag vérifié");

ok(read("js/crm-sidebar.js").indexOf("crm-reviews-official.html") !== -1, "sidebar CRM");
ok(read("api/auth/[action].js").indexOf("reviews-official-env") !== -1, "auth router");
ok(read("vercel.json").indexOf("/api/reviews-official-env") !== -1, "vercel rewrite");
ok(read(".env.example").indexOf("TRUSTPILOT_BUSINESS_UNIT_ID") !== -1, ".env.example Trustpilot");

var pkg = JSON.parse(read("package.json"));
ok(!!(pkg.scripts && pkg.scripts["verify:reviews-official"]), "npm script verify:reviews-official");

var pub = read("js/public-reviews-official.js");
ok(pub.indexOf("isConfigured") !== -1, "public : masque si non configuré");
ok(pub.indexOf("widget.trustpilot.com") !== -1, "TrustBox bootstrap");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nTous les checks avis officiels OK");
