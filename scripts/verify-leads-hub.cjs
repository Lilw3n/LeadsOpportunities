#!/usr/bin/env node
/**
 * Vérifie la page leads propres : identité, spam IP, fusion / liaison.
 */
var fs = require("fs");
var path = require("path");
var Ident = require("../js/lead-identity-lib.js");
var failed = 0;

function assert(cond, msg) {
  if (!cond) {
    failed++;
    console.log("FAIL", msg);
  } else {
    console.log("OK  ", msg);
  }
}

function read(rel) {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf8");
}

assert(Ident.normalizeEmail(" Jean@Mail.FR ") === "jean@mail.fr", "email normalisé");
assert(Ident.normalizePhone("06 12 34 56 78").length === 9, "téléphone → 9 chiffres nationaux");
assert(Ident.isDisposableEmail("a@yopmail.com"), "email jetable détecté");
assert(Ident.isBotUa("curl/8.0"), "curl = robot");
assert(Ident.isBotUa(""), "UA vide = robot");
assert(!Ident.isBotUa("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile Safari"), "Safari iPhone = humain");

var humain = Ident.scoreTrust({
  email: "marie@gmail.com",
  phone: "0612345678",
  ip: "90.1.2.3",
  ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
  country: "FR",
  gclid: "abc",
});
assert(humain.label === "humain" && humain.score >= 55, "profil humain (got " + humain.label + " " + humain.score + ")");

var bot = Ident.scoreTrust({
  email: "x@yopmail.com",
  ua: "python-requests/2.0",
  ip: "1.1.1.1",
  ipIdentityCount: 8,
});
assert(bot.label === "spam", "robot + IP partagée + jetable = spam (got " + bot.label + " " + bot.score + ")");

var sameMail = Ident.matchPair(
  { id: "a", email: "jean@test.fr", phone: "0611111111" },
  { id: "b", email: "jean@test.fr", phone: "0622222222" }
);
assert(sameMail.strength === "identity" && Ident.canFuse(sameMail), "même email → fusion possible");

var sameIp = Ident.matchPair(
  { id: "a", email: "a@x.fr", ip: "80.1.1.1" },
  { id: "b", email: "b@x.fr", ip: "80.1.1.1" }
);
assert(sameIp.strength === "ip" && Ident.canLink(sameIp) && !Ident.canFuse(sameIp), "même IP seule → liaison, pas fusion");

var items = [
  { id: "1", email: "a@x.fr", phone: "0611111111", ip: "1.1.1.1" },
  { id: "2", email: "a@x.fr", phone: "0699999999", ip: "9.9.9.9" },
  { id: "3", email: "z@z.fr", phone: "0688888888", ip: "2.2.2.2" },
];
var groups = Ident.clusterItems(items, Ident.countIdentitiesByIp(items));
assert(groups.length === 1 && groups[0].length === 2, "cluster email (got " + groups.length + ")");

var page = read("crm-leads.html");
assert(page.indexOf("crm-leads.js") >= 0, "page charge le JS");
assert(page.indexOf("lead-identity-lib.js") >= 0, "page charge l’identité");
assert(page.indexOf("value=\"pending\"") >= 0, "filtre à valider admin");

var js = read("crm-leads.js");
assert(js.indexOf('confirm: "SUPPRIMER"') >= 0, "double validation SUPPRIMER");
assert(js.indexOf("confirmAck") >= 0, "double validation case à cocher");
assert(js.indexOf("deleteInterlocutor") >= 0, "suppression interlocuteur");
assert(js.indexOf('action: "promote"') >= 0, "devenir prospect");
assert(js.indexOf("crm-contact.html?id=") >= 0, "promote ouvre la fiche interlocuteur");
assert(js.indexOf('kind === "fuse"') >= 0, "fusion");
assert(js.indexOf('data-link-a') >= 0, "liaison");
assert(js.indexOf('action: "unlink"') >= 0, "déliaison");
assert(js.indexOf('action: "split"') >= 0, "séparation");

var api = read("api/_lib/routes/crm-lead-lifecycle.js");
assert(api.indexOf('action === "promote"') >= 0, "API promote");
assert(api.indexOf("Double validation requise") >= 0, "API refuse sans double confirm");
assert(api.indexOf("admin uniquement") >= 0, "API admin pour delete/review");
assert(api.indexOf("applyContactMerge") >= 0, "fusion contacts");
assert(api.indexOf('status = \'split\'') >= 0 || api.indexOf('status = "split"') >= 0, "séparation restaure");

var hub = read("api/_lib/routes/crm-leads-hub.js");
assert(hub.indexOf("scoreTrust") >= 0, "hub calcule le trust");
assert(hub.indexOf("clusterItems") >= 0, "hub groupe les doublons");

var router = read("api/crm/[action].js");
assert(router.indexOf("leads-hub") >= 0 && router.indexOf("lead-lifecycle") >= 0, "routes CRM enregistrées");

var ingest = read("api/_lib/routes/public-lead.js");
assert(ingest.indexOf("clientUa") >= 0, "ingest stocke le user-agent");
assert(ingest.indexOf("isIpBlocked") >= 0, "ingest ignore les IP bloquées");

var dash = read("dashboard.html");
assert(dash.indexOf("filterIp") >= 0, "dashboard : filtre IP");
assert(dash.indexOf("bulkDeleteLeads") >= 0, "dashboard : suppression groupée");
assert(dash.indexOf("btnBlockIp") >= 0, "dashboard : bloquer IP");
assert(dash.indexOf("data-unblock-ip") >= 0, "dashboard : débloquer IP");
assert(dash.indexOf("lead-row-check") >= 0, "dashboard : cases à cocher");
assert(dash.indexOf("filterScore") >= 0, "dashboard : filtre score");
assert(dash.indexOf("acheteur_immo") >= 0, "dashboard : vertical acheteur immo");

var del = read("api/_lib/routes/lead-delete.js");
assert(del.indexOf("leadIds") >= 0, "API suppression multiple");

var ipApi = read("api/_lib/routes/ip-block.js");
assert(ipApi.indexOf("setIpBlock") >= 0, "API ip-block");

var dashRouter = read("api/dashboard/[action].js");
assert(dashRouter.indexOf("ip-block") >= 0, "route dashboard ip-block");

assert(js.indexOf("lhBulkDelete") >= 0, "CRM : suppression groupée");
assert(js.indexOf("data-block-ip") >= 0, "CRM : bloquer IP");
assert(page.indexOf("lhIp") >= 0, "CRM : champ filtre IP");

var side = read("js/crm-sidebar.js");
assert(side.indexOf("crm-leads.html") >= 0, "sidebar : page leads");

["js/lead-identity-lib.js", "crm-leads.js", "api/_lib/routes/crm-leads-hub.js", "api/_lib/routes/crm-lead-lifecycle.js", "api/_lib/ip-blocks.js", "api/_lib/routes/ip-block.js", "api/_lib/routes/lead-delete.js"].forEach(
  function (rel) {
    require("child_process").execFileSync(process.execPath, ["--check", path.join(__dirname, "..", rel)]);
    assert(true, "syntaxe " + rel);
  }
);

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nTous les contrôles leads / prospects sont OK.");
