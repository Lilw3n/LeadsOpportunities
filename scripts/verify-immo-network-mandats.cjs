/**
 * Vérifie le socle mandat / partenaires / multi-liens / honoraires.
 */
var fs = require("fs");
var path = require("path");
var root = path.join(__dirname, "..");

function ok(c, m) {
  if (!c) throw new Error("FAIL: " + m);
  console.log("OK ", m);
}

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}

ok(fs.existsSync(path.join(root, "database/crm-immo-network-mandats.sql")), "sql schema");
ok(fs.existsSync(path.join(root, "partenaires-immo/index.html")), "hub partenaires");
ok(fs.existsSync(path.join(root, "partenaires-immo/inscription.html")), "inscription");
ok(fs.existsSync(path.join(root, "partenaires-immo/espace.html")), "espace");
ok(fs.existsSync(path.join(root, "partenaires-immo/mandat-duree.html")), "mandat duree");
ok(fs.existsSync(path.join(root, "vendeur-cherche-acquereur/index.html")), "hub vendeur");
ok(fs.existsSync(path.join(root, "docs/MANDAT-PARTENAIRES-HONORAIRES.md")), "doc");

var Mandate = require("../js/immo-mandate-acl-lib.js");
var Fee = require("../js/immo-fee-share-legal-lib.js");
var Links = require("../js/immo-property-links-lib.js");

var dur = Mandate.computeDuration(
  { mandate_started_at: "2026-01-01", mandate_ends_at: "2026-12-31" },
  {}
);
ok(dur.ok && dur.totalDays > 300, "durée mandat calcul");

ok(
  !Mandate.canViewMandateDuration({ partnerId: "x" }, { owner_contact_id: "ct_1" }),
  "partenaire ne voit pas durée"
);
ok(
  Mandate.canViewMandateDuration({ isAdmin: true }, { owner_contact_id: "ct_1" }),
  "admin voit durée"
);
ok(
  Mandate.canViewMandateDuration({ contactId: "ct_1" }, { owner_contact_id: "ct_1" }),
  "owner voit durée"
);

var stripped = Mandate.stripMandatePrivate({
  title: "Maison",
  mandate_started_at: "2026-01-01",
  date_echeance: "2026-12-31",
});
ok(!stripped.mandate_started_at && !stripped.date_echeance, "strip dates");

var links = Links.normalizeList([
  "https://www.leboncoin.fr/ad/x",
  "seloger.com/annonce/y",
  "https://www.leboncoin.fr/ad/x",
]);
ok(links.length === 2 && links[0].portal === "leboncoin", "multi liens dédoublonnés");

var alloc = Fee.defaultSortantEntrantSplit(10000, 60, 40);
ok(alloc.rows.length === 2 && alloc.allocated === 10000, "split entrant/sortant");
ok(Fee.LEGAL_NOTES.length >= 4, "notes légales");

ok(read("js/crm-immo-matcher.js").indexOf("avocat") >= 0, "role avocat");
ok(read("js/crm-immo-matcher.js").indexOf("negociateur") >= 0, "role negociateur");
ok(read("api/_lib/immo-properties-store.js").indexOf("immo-network-store") >= 0, "ensure network");
ok(read("api/[action].js").indexOf("immo-network-dispatch") >= 0, "route via [action]");
ok(read("api/_lib/routes/immo-network-dispatch.js").indexOf("immo-network-register") >= 0, "dispatch register");
ok(read("vercel.json").indexOf("/api/immo-network/:op") >= 0, "rewrite vercel");
ok(!fs.existsSync(path.join(root, "api/immo-network")), "pas de 13e serverless");
ok(read("immobilier/index.html").indexOf("partenaires-immo") >= 0, "hub immo link");
ok(
  read("scripts/blog-articles-manifest.cjs").indexOf("blog-vendeur-acquereur-seo-articles") >= 0,
  "blog wired"
);

var apiEntries = [];
function walkApi(dir, depth) {
  fs.readdirSync(dir).forEach(function (name) {
    if (name === "_lib") return;
    var full = path.join(dir, name);
    var st = fs.statSync(full);
    if (st.isDirectory()) walkApi(full, depth + 1);
    else if (name.endsWith(".js")) apiEntries.push(path.relative(path.join(root, "api"), full));
  });
}
walkApi(path.join(root, "api"), 0);
ok(apiEntries.length <= 12, "≤12 serverless (Hobby), got " + apiEntries.length);

console.log("\nMandat / partenaires / honoraires : OK.");
