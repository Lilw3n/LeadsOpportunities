#!/usr/bin/env node
var fs = require("fs");
var path = require("path");
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

var hub = read("crm-e-invoicing.html");
assert(hub.indexOf("einvMixForm") !== -1, "formulaire mix intelligent");
assert(hub.indexOf("einvMakePanel") !== -1 || hub.indexOf("einvTestMake") !== -1, "panneau Make Tiime");
assert(hub.indexOf("einvIssueForm") !== -1, "formulaire emission Factur-X");
assert(hub.indexOf("einvPdpForm") !== -1, "formulaire PDP");
assert(hub.indexOf("1er septembre 2026") !== -1 || hub.indexOf("septembre 2026") !== -1, "echeance reception 2026");
assert(hub.indexOf("crm-e-invoicing.js") !== -1, "script UI");

var js = read("js/crm-e-invoicing.js");
assert(js.indexOf("/api/crm/e-invoicing") !== -1, "appels API e-invoicing");
assert(js.indexOf("apply-smart-mix") !== -1, "action apply-smart-mix");
assert(js.indexOf("test-make") !== -1, "bouton test Make");
assert(js.indexOf("save-settings") !== -1, "sauvegarde settings");
assert(js.indexOf("register-received") !== -1, "registre reception");

var api = read("api/_lib/routes/crm-e-invoicing.js");
assert(api.indexOf("ensureEInvoicingSchema") !== -1, "schema auto");
assert(api.indexOf("buildCiiXml") !== -1, "generation CII");
assert(api.indexOf("buildSmartMix") !== -1, "smart mix API");
assert(api.indexOf("apply-smart-mix") !== -1, "route apply-smart-mix");
assert(api.indexOf("dispatchToMake") !== -1 || api.indexOf("makeBridge") !== -1, "dispatch Make");
assert(api.indexOf('postAction === "issue"') !== -1, "action issue");

var wh = read("api/webhooks/[action].js");
assert(wh.indexOf("make-einvoice") !== -1, "webhook make-einvoice");

var makeLib = read("api/_lib/make-einvoice.js");
assert(makeLib.indexOf("MAKE_EINVOICE_WEBHOOK_URL") !== -1, "env MAKE_EINVOICE_WEBHOOK_URL");

var makeDoc = read("docs/MAKE-TIIME-EINVOICE.md");
assert(makeDoc.indexOf("Tiime Free") !== -1, "doc parcours Tiime Free");
assert(makeDoc.indexOf("/api/webhooks/make-einvoice") !== -1, "doc inbound webhook");

var blueprint = JSON.parse(read("data/make-blueprints/einvoice-crm-to-make.json"));
assert(blueprint.plan === "make-free", "blueprint make-free");
assert(blueprint.modules && blueprint.modules.length >= 3, "blueprint modules");

var router = read("api/crm/[action].js");
assert(router.indexOf('"e-invoicing"') !== -1, "route CRM e-invoicing");

var sidebar = read("js/crm-sidebar.js");
assert(sidebar.indexOf("crm-e-invoicing.html") !== -1, "lien sidebar");

var fin = read("crm-financial.html");
assert(fin.indexOf("crm-e-invoicing.html") !== -1, "lien hub financier");

var cfg = JSON.parse(read("config/e-invoicing.json"));
assert(cfg.siren === "810571513", "SIREN config");
assert(cfg.receiveDeadline === "2026-09-01", "deadline reception");
assert(cfg.emitDeadline === "2027-09-01", "deadline emission micro");
assert(cfg.stackPrimaryPdp === "tiime", "stack primaire Tiime");
assert(cfg.pdpStatus === "pending_identity", "statut pending identity Tiime");
assert(cfg.tiimeAccountCreated === true, "compte Tiime cree");
assert(cfg.makeAccountPending === true, "Make en attente compte");

var golive = read("docs/MAKE-TIIME-GOLIVE.md");
assert(golive.indexOf("MAKE_EINVOICE_WEBHOOK_URL") !== -1, "golive env Make");
assert(golive.indexOf("Tiime vérifié") !== -1 || golive.indexOf("Tiime verifie") !== -1, "golive bouton Tiime");

var hub = read("crm-e-invoicing.html");
assert(hub.indexOf("pending_identity") !== -1, "option pending_identity UI");
assert(hub.indexOf("einvMarkTiimeOk") !== -1, "bouton Tiime verifie");
assert(hub.indexOf("einvMarkMakeOk") !== -1, "bouton Make cree");

var api = read("api/_lib/routes/crm-e-invoicing.js");
assert(api.indexOf("mark-tiime-verified") !== -1, "action mark-tiime-verified");
assert(api.indexOf("mark-make-ready") !== -1, "action mark-make-ready");

var lib = require(path.join(__dirname, "..", "api/_lib/e-invoicing.js"));
var readyPending = lib.readiness(lib.mergeSettings(null));
assert(readyPending.tiimeIdentityPending === true, "readiness identity pending");
assert(readyPending.pdpTrajectory === true, "readiness trajectoire PDP");
assert(readyPending.status === "waiting" || readyPending.status === "critical", "readiness waiting/critical");

var stack = JSON.parse(read("config/e-invoicing-stack.json"));
assert(stack.recommendedPrimaryPdp === "tiime", "reco Tiime");
assert(
  stack.tools.some(function (t) {
    return t.id === "indy";
  }),
  "catalogue Indy"
);
assert(
  stack.tools.some(function (t) {
    return t.id === "abby";
  }),
  "catalogue Abby"
);
assert(
  stack.tools.some(function (t) {
    return t.id === "shine";
  }),
  "catalogue Shine"
);
assert(
  stack.tools.some(function (t) {
    return t.id === "make";
  }),
  "catalogue Make"
);
assert(
  stack.tools.some(function (t) {
    return t.id === "odoo";
  }),
  "catalogue Odoo"
);
assert(stack.rule.indexOf("Une seule PDP") !== -1, "regle une seule PDP");

var sql = read("database/e-invoicing.sql");
assert(sql.indexOf("e_invoices_received") !== -1, "table received");
assert(sql.indexOf("e_invoices_issued") !== -1, "table issued");

var docs = read("docs/FACTURATION-ELECTRONIQUE.md");
assert(docs.indexOf("plateforme agréée") !== -1 || docs.indexOf("plateforme agreee") !== -1, "doc PDP");
assert(docs.indexOf("Tiime") !== -1, "doc mix Tiime");

var lib = require(path.join(__dirname, "..", "api/_lib/e-invoicing.js"));
var settings = lib.mergeSettings(null);
var ready = lib.readiness(settings);
assert(ready.receiveDeadline === "2026-09-01", "readiness receive deadline");
assert(ready.emitDeadline === "2027-09-01", "readiness emit micro = 2027");
assert(lib.isValidSiren("810571513"), "SIREN valide");
assert(!lib.isValidSiren("123"), "SIREN invalide rejete");

var mix = lib.buildSmartMix(settings);
assert(mix.recommendedPrimaryPdp === "tiime", "buildSmartMix reco Tiime");
assert(mix.tools.length >= 5, "buildSmartMix outils");
var applied = lib.applyStackSelection(settings, { primaryPdp: "tiime", markDesignated: true });
assert(applied.pdpName === "Tiime", "apply stack pdpName Tiime");
assert(applied.pdpStatus === "designated", "apply stack designated");

var xml = lib.buildCiiXml(
  {
    invoiceNumber: "FAC-TEST-0001",
    invoiceDate: "2026-09-01",
    buyerName: "Client Demo SAS",
    buyerSiren: "123456782",
    operationType: "services",
    amountHt: 100,
    vatRate: 20,
    lineDescription: "Honoraires test",
  },
  settings
);
assert(xml.indexOf("CrossIndustryInvoice") !== -1, "XML CII racine");
assert(xml.indexOf("810571513") !== -1, "XML contient SIREN emetteur");
assert(xml.indexOf("123456782") !== -1, "XML contient SIREN client");
assert(xml.indexOf("FAC-TEST-0001") !== -1, "XML numero facture");

var mentions = lib.buildMandatoryMentions(
  {
    buyerSiren: "123456782",
    operationType: "services",
    vatOnDebits: true,
    deliveryAddress: "10 rue Test 54000 Nancy",
  },
  settings
);
assert(
  mentions.some(function (m) {
    return m.indexOf("Client SIREN") !== -1;
  }),
  "mention SIREN client"
);
assert(
  mentions.some(function (m) {
    return m.indexOf("Prestations de services") !== -1;
  }),
  "mention nature ops"
);
assert(
  mentions.some(function (m) {
    return m.indexOf("débits") !== -1;
  }),
  "mention TVA debits"
);

var pkg = JSON.parse(read("package.json"));
assert(pkg.scripts["verify:e-invoicing"], "script npm verify:e-invoicing");

if (failed) {
  console.log("\n" + failed + " echec(s)");
  process.exit(1);
}
console.log("\nFacturation electronique (PDP / Factur-X / mix) : OK.");
