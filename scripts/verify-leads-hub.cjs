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

assert(page.indexOf("dashboard.html?section=leads") >= 0, "lien vers liste complète dashboard");

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
assert(dash.indexOf("purgeNoiseLeads") >= 0, "dashboard : supprimer le bruit");
assert(dash.indexOf("btnBlockIp") >= 0, "dashboard : bloquer IP");
assert(dash.indexOf("data-unblock-ip") >= 0, "dashboard : débloquer IP");
assert(dash.indexOf("lead-row-check") >= 0, "dashboard : cases à cocher");
assert(dash.indexOf("filterScore") >= 0, "dashboard : filtre score");
assert(dash.indexOf("acheteur_immo") >= 0, "dashboard : vertical acheteur immo");
assert(dash.indexOf("leadStatTotal") >= 0, "dashboard : KPI tous les leads");
assert(dash.indexOf("leadStatQuestionnaires") >= 0, "dashboard : compteur questionnaires remplis");
assert(dash.indexOf("leadArticlesBody") >= 0, "dashboard : articles à côté des leads");
assert(dash.indexOf("callQueueBody") >= 0 && dash.indexOf("Clients à rappeler") >= 0, "dashboard : file d'appels");
assert(fs.readFileSync(path.join(__dirname, "..", "blog/index.html"), "utf8").indexOf("need=vtc") >= 0, "blog : devis VTC en tête");
assert(dash.indexOf("leadArticleCell") >= 0, "dashboard : colonne article du lead");
assert(dash.indexOf("filterLimit") >= 0, "dashboard : 100 par page");
assert(dash.indexOf("renderLeadsPagination") >= 0, "dashboard : pagination lisible");
assert(dash.indexOf("leads au total") >= 0, "dashboard : total explicite");

var leadsApi = read("api/_lib/routes/leads.js");
assert(leadsApi.indexOf("Math.min(250") >= 0, "API leads : jusqu’à 250 par page");

var del = read("api/_lib/routes/lead-delete.js");
assert(del.indexOf("leadIds") >= 0, "API suppression multiple");
assert(del.indexOf('purge === "no-contact"') >= 0, "API suppression du bruit sans contact");

var delLib = require("../api/_lib/lead-delete-lib");
assert(delLib.leadLacksEmailAndPhone("", "") === true, "bruit : vide");
assert(delLib.leadLacksEmailAndPhone("  ", "12") === true, "bruit : téléphone trop court");
assert(delLib.leadLacksEmailAndPhone("a@b.fr", "") === false, "e-mail conservé");
assert(delLib.leadLacksEmailAndPhone("", "06 12 34 56 78") === false, "téléphone conservé");

var ipApi = read("api/_lib/routes/ip-block.js");
assert(ipApi.indexOf("setIpBlock") >= 0, "API ip-block");

var dashRouter = read("api/dashboard/[action].js");
assert(dashRouter.indexOf("ip-block") >= 0, "route dashboard ip-block");

assert(js.indexOf("lhBulkDelete") >= 0, "CRM : suppression groupée");
assert(js.indexOf("lhPurgeNoise") >= 0, "CRM : supprimer le bruit");
assert(js.indexOf("data-block-ip") >= 0, "CRM : bloquer IP");
assert(page.indexOf("lhIp") >= 0, "CRM : champ filtre IP");

var side = read("js/crm-sidebar.js");
assert(side.indexOf("crm-leads.html") >= 0, "sidebar : page leads");

["js/lead-identity-lib.js", "crm-leads.js", "api/_lib/routes/crm-leads-hub.js", "api/_lib/routes/crm-lead-lifecycle.js", "api/_lib/ip-blocks.js", "api/_lib/routes/ip-block.js", "api/_lib/routes/lead-delete.js", "api/_lib/lead-article.js", "api/_lib/routes/leads.js", "api/_lib/routes/lead-detail.js"].forEach(
  function (rel) {
    require("child_process").execFileSync(process.execPath, ["--check", path.join(__dirname, "..", rel)]);
    assert(true, "syntaxe " + rel);
  }
);

var summarized = require("../api/_lib/lead-article").summarizeQuestionnaireLeads(
  [
    {
      source: "landing_form",
      email: "client@example.fr",
      phone: "0612345678",
      questionnaire_step: 4,
      payload: { utm_content: "assurance-garage-negociant-auto-rc-mrp-2026" },
    },
    { source: "landing_form", email: "", phone: "", questionnaire_step: 2, payload: {} },
  ],
  { "assurance-garage-negociant-auto-rc-mrp-2026": 11 }
);
assert(summarized.questionnaire_total === 1, "compteur ignore le formulaire vide");
assert(
  summarized.articles[0] &&
    summarized.articles[0].slug === "assurance-garage-negociant-auto-rc-mrp-2026" &&
    summarized.articles[0].clicks === 11 &&
    summarized.articles[0].questionnaire_leads === 1,
  "article source à côté du questionnaire"
);

var queue = require("../api/_lib/lead-article").buildCallQueue([
  {
    id: "vtc-1",
    source: "landing_form",
    vertical: "vtc",
    email: "chauffeur@example.fr",
    phone: "06 18 23 47 59",
    status: "new",
    created_at: "2026-10-17T08:00:00.000Z",
    questionnaire_step: 3,
    landing_slug: "vtc",
    payload: { firstName: "Camille", lastName: "Martin" },
  },
  {
    id: "mail-only",
    source: "landing_form",
    vertical: "sante",
    email: "sans-tel@example.fr",
    phone: "",
    status: "new",
    questionnaire_step: 2,
    payload: {},
  },
  {
    id: "lost",
    source: "landing_form",
    vertical: "vtc",
    email: "perdu@example.fr",
    phone: "0699887766",
    status: "lost",
    questionnaire_step: 2,
    payload: {},
  },
]);
assert(queue.length === 1 && queue[0].id === "vtc-1" && queue[0].product === "VTC", "file d'appel : téléphone et dossier ouvert");
assert(queue[0].tel === "tel:+33618234759" && queue[0].phone === "06 18 23 47 59", "lien d'appel");
assert(queue[0].name === "Camille Martin", "nom du client");
assert(queue[0].origin.indexOf("landing_form") >= 0 && queue[0].origin.indexOf("vtc") >= 0, "origine du numéro");

var kept = require("../api/_lib/lead-article").buildCallQueue([
  { id: "exemple", source: "landing_form", vertical: "vtc", phone: "0612345678", status: "new", questionnaire_step: 2, payload: {} },
  { id: "cabinet", source: "landing_form", vertical: "sante", phone: "06 51 36 62 22", status: "new", questionnaire_step: 2, payload: {} },
  { id: "court", source: "landing_form", vertical: "auto", phone: "+3363258758", status: "new", questionnaire_step: 2, payload: {} },
  { id: "caledonie", source: "landing_form", landing_slug: "commerce", phone: ",+68788811983", status: "new", created_at: "2026-10-17T09:00:00.000Z", questionnaire_step: 2, payload: {} },
  { id: "client", source: "landing_form", vertical: "vtc", phone: "06 67 26 63 09", status: "new", created_at: "2026-10-17", questionnaire_step: 2, payload: { firstName: "Inès" } },
  { id: "doublon", source: "landing_form", vertical: "vtc", phone: "0667266309", status: "new", created_at: "2026-10-16", questionnaire_step: 2, payload: {} },
]);
var keptIds = kept.map(function (row) { return row.id; }).sort().join(",");
assert(kept.length === 6 && keptIds.indexOf("exemple") >= 0 && keptIds.indexOf("caledonie") >= 0, "file d'appel : tous les numéros saisis restent");
var caledonie = kept.filter(function (row) { return row.id === "caledonie"; })[0];
assert(caledonie && caledonie.phone === ",+68788811983" && caledonie.origin.indexOf("commerce") >= 0, "origine conservée telle que saisie");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nTous les contrôles leads / prospects sont OK.");
