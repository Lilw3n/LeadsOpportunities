#!/usr/bin/env node
/**
 * Vérifie que les liens de reprise CRM n’embarquent plus d’e-mail / téléphone
 * et que l’API refuse un leadId seul.
 */
var fs = require("fs");
var path = require("path");
var failed = 0;
var root = path.join(__dirname, "..");

function assert(cond, msg) {
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

var identity = require("../api/_lib/resume-identity");
assert(identity.identityMatchesLead({ email: "Romain@Orange.fr", phone: "06 83 02 94 23" }, { email: "romain@orange.fr" }), "match e-mail");
assert(identity.identityMatchesLead({ email: "a@b.fr", phone: "0683029423" }, { phone: "06 83 02 94 23" }), "match téléphone");
assert(
  !identity.identityMatchesLead({ email: "a@b.fr", phone: "0683029423" }, { email: "other@b.fr" }),
  "e-mail différent refusé"
);
assert(!identity.identityMatchesLead({ email: "a@b.fr" }, {}), "sans coordonnées → refusé");
assert(
  !identity.identityMatchesLead(
    { email: "a@b.fr", phone: "0683029423" },
    { email: "a@b.fr", phone: "0600000000" }
  ),
  "téléphone fourni mais faux → refusé"
);

var tokenLib = require("../api/_lib/resume-link-token");
var tok = tokenLib.signResumeToken({
  leadId: "7af64e12-e7f3-4ce4-8548-0a765b7912aa",
  purpose: "conseiller",
  hat: "vendeur",
});
var decoded = tokenLib.verifyResumeToken(tok);
assert(decoded && decoded.leadId === "7af64e12-e7f3-4ce4-8548-0a765b7912aa", "JWT reprise vérifiable");
assert(decoded.purpose === "conseiller", "purpose conseiller");
assert(!tokenLib.verifyResumeToken("not-a-token"), "jeton bidon rejeté");
assert(!tokenLib.verifyResumeToken(""), "jeton vide rejeté");

var publicUrl = tokenLib.buildPublicResumeUrl(tok, { purpose: "conseiller", hat: "vendeur" });
assert(publicUrl.indexOf("rt=") >= 0, "URL publique contient rt=");
assert(publicUrl.indexOf("email=") < 0, "URL publique sans email=");
assert(publicUrl.indexOf("phone=") < 0, "URL publique sans phone=");
assert(publicUrl.indexOf("leadId=") < 0, "URL publique sans leadId=");
assert(publicUrl.indexOf("contactId=") < 0, "URL publique sans contactId=");
assert(publicUrl.indexOf("acheteur-immo.html") >= 0, "landing immo vendeur");

var tools = read("js/crm-questionnaire-tools.js");
assert(tools.indexOf("params.set(\"email\"") < 0, "buildResumeUrl n’écrit plus email");
assert(tools.indexOf("params.set(\"phone\"") < 0, "buildResumeUrl n’écrit plus phone");
assert(tools.indexOf("params.set(\"leadId\"") < 0, "buildResumeUrl n’écrit plus leadId");
assert(tools.indexOf("/api/crm/resume-link") >= 0, "client appelle resume-link");
assert(tools.indexOf("data-crm-q-resume") >= 0, "bouton Reprendre sans href PII");
assert(tools.indexOf("openResumeLink") >= 0, "openResumeLink exporté");
assert(tools.indexOf("lo_token") >= 0, "fallback Bearer lo_token");

var mailbox = read("js/dashboard-mailbox.js");
assert(mailbox.indexOf("buildResumeUrl({ leadId: leadId, email:") < 0, "mailbox ne colle plus l’e-mail dans l’URL");
assert(mailbox.indexOf("mbxBtnResumeQuest") >= 0, "mailbox : bouton reprise");
assert(mailbox.indexOf("openResumeLink") >= 0, "mailbox : openResumeLink");
assert(Buffer.byteLength(mailbox, "utf8") > 50000, "dashboard-mailbox.js > 50000 octets");

var deposit = read("js/acheteur-immo-deposit-guide.js");
assert(deposit.indexOf("resume-deposit?rt=") >= 0, "reprise GET uniquement avec rt");
assert(deposit.indexOf("method: \"POST\"") >= 0, "reprise formulaire en POST");
assert(deposit.indexOf("params.get(\"email\")") < 0, "deposit-guide ne lit plus email dans l’URL");
assert(deposit.indexOf("scrubResumeQuery") >= 0, "scrub des query PII");

var fill = read("js/acheteur-immo-fill-mode.js");
assert(fill.indexOf("scrubPiiFromUrl") >= 0, "fill-mode scrub PII");
assert(fill.indexOf("params.delete(k)") >= 0, "fill-mode retire email/phone de l’historique");

var landing = read("landings/acheteur-immo.html");
assert(landing.indexOf("history.replaceState") >= 0, "landing : scrub PII avant analytics");
assert(landing.indexOf("strict-origin-when-cross-origin") >= 0, "landing : referrer policy");
assert(landing.indexOf("acheteur-immo-deposit-guide.js?v=20260826rt1") >= 0, "cache-bust deposit-guide");
assert(landing.indexOf("acheteur-immo-fill-mode.js?v=20260826rt1") >= 0, "cache-bust fill-mode");

var api = read("api/_lib/routes/external-resume-deposit.js");
assert(api.indexOf("verifyResumeToken") >= 0, "API : jeton rt");
assert(api.indexOf("identityMatchesLead") >= 0, "API : match identité en POST");
assert(api.indexOf("token_required") >= 0, "GET sans jeton → found false");
assert(api.indexOf("WHERE id = ${leadId}") >= 0 || api.indexOf("WHERE id = ${leadId}") >= 0, "chargement lead");

var crmIndex = read("api/crm/[action].js");
assert(crmIndex.indexOf("resume-link") >= 0, "route CRM resume-link enregistrée");
assert(fs.existsSync(path.join(root, "api/_lib/routes/crm-resume-link.js")), "fichier crm-resume-link.js");

var dash = read("dashboard.html");
assert(dash.indexOf("crm-questionnaire-tools.js?v=20260826rt1") >= 0, "cache-bust questionnaire-tools dashboard");
assert(dash.indexOf("dashboard-mailbox.js?v=20260826rt1") >= 0, "cache-bust mailbox");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nOK liens de reprise sécurisés");
