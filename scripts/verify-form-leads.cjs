#!/usr/bin/env node
/**
 * Classification des leads formulaires + mode contrôle admin (toggle réel).
 */
var fs = require("fs");
var path = require("path");
var FL = require("../js/form-lead-category");
var failed = 0;

function assert(cond, msg) {
  if (!cond) {
    failed++;
    console.log("FAIL", msg);
  } else {
    console.log("OK  ", msg);
  }
}

var vtc = FL.classifyFormLead({
  vertical: "vtc",
  source: "landing_form",
  payload: { need: "vtc", journey: "full", questionnaire_step: 5 },
});
assert(vtc.category === "mobilite", "VTC → mobilité");
assert(vtc.need === "vtc", "VTC need");
assert(vtc.kind === "questionnaire", "wizard → questionnaire");

var immo = FL.classifyFormLead({
  vertical: "credit_immo",
  source: "landing_form",
  payload: { serviceNeed: "credit-immo" },
});
assert(immo.category === "finance", "credit_immo → finance");
assert(immo.need === "credit-immo", "need normalisé credit-immo");

var acheteur = FL.classifyFormLead({ vertical: "acheteur-immo", payload: {} });
assert(acheteur.category === "finance" && acheteur.need === "acheteur-immo", "acheteur-immo");

var vendeur = FL.classifyFormLead({ vertical: "vendeur_immo", payload: { need: "vendeur-immo" } });
assert(vendeur.category === "finance" && vendeur.need === "vendeur-immo", "vendeur-immo");

var sante = FL.classifyFormLead({ vertical: "sante", payload: { need: "mutuelle" } });
assert(sante.category === "sante", "mutuelle → santé");

var auto = FL.classifyFormLead({ payload: { need: "auto" } });
assert(auto.category === "mobilite" && auto.need === "auto", "auto → mobilité");

var mrh = FL.classifyFormLead({ vertical: "habitation", payload: {} });
assert(mrh.category === "habitat", "habitation → habitat");

var pet = FL.classifyFormLead({ vertical: "assurance_animaux", source: "landing_quick", payload: {} });
assert(pet.category === "animaux", "animaux");
assert(pet.kind === "questionnaire", "landing_quick → questionnaire");

var cb = FL.classifyFormLead({
  source: "homepage_callback",
  payload: { callbackRequested: true, message: "Demande de rappel express" },
});
assert(cb.kind === "express_callback", "rappel express");
assert(cb.category === "contact" || cb.need === "autre" || cb.need === "contact", "callback classé");

var contact = FL.classifyFormLead({
  source: "homepage_contact",
  payload: { message: "Bonjour, rappel SVP", vertical: "sante" },
});
assert(contact.kind === "contact_request", "homepage_contact → contact");
assert(contact.category === "sante", "contact santé garde la catégorie métier");

var row = { vertical: "vtc", source: "landing_form", payload: "{}" };
FL.applyToLead(row);
assert(row.formCategory === "mobilite" && row.formKind === "questionnaire", "applyToLead enrichit la ligne");

assert(FL.categoryList().length >= 8, "au moins 8 catégories");
assert(FL.kindList().length === 3, "3 types de formulaires");

var audit = fs.readFileSync(path.join(__dirname, "../js/form-audit.js"), "utf8");
assert(audit.indexOf('localStorage.setItem(STORAGE_KEY, on ? "1" : "0")') >= 0, "préférence 0/1 persistée");
assert(audit.indexOf("Mode test réel") >= 0, "hint mode test réel");
assert(audit.indexOf("skipValidation") >= 0, "skipValidation exporté");
assert(audit.indexOf('form.dataset.auditMode = "1"') === -1 || audit.indexOf("checked ? \"1\" : \"0\"") >= 0, "plus de forçage auditMode=1 hors toggle");
assert(audit.indexOf("data-audit-active checked") === -1, "checkbox plus cochée en dur");

var wizard = fs.readFileSync(path.join(__dirname, "../landings/quote-wizard.js"), "utf8");
assert(wizard.indexOf("invalidIdx") >= 0, "soumission : validation de toutes les étapes");

var html = fs.readFileSync(path.join(__dirname, "../crm-form-leads.html"), "utf8");
assert(html.indexOf("flCatChips") >= 0 && html.indexOf("crm-form-leads.js") >= 0, "page CRM leads formulaires");

var sidebar = fs.readFileSync(path.join(__dirname, "../js/crm-sidebar.js"), "utf8");
assert(sidebar.indexOf("crm-form-leads.html") >= 0, "lien sidebar");

var leadsApi = fs.readFileSync(path.join(__dirname, "../api/_lib/routes/leads.js"), "utf8");
assert(leadsApi.indexOf("VALID_VERTICAL") === -1, "filtre vertical élargi (plus 3 valeurs)");
assert(leadsApi.indexOf("formCategoryVal") >= 0 && leadsApi.indexOf("formStats") >= 0, "API category + stats");

var publicLead = fs.readFileSync(path.join(__dirname, "../api/_lib/routes/public-lead.js"), "utf8");
assert(publicLead.indexOf("formCategory") >= 0, "POST /api/lead stocke la catégorie");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nTous les tests verify:form-leads OK");
