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
assert(hub.indexOf("einvTestMake") !== -1, "panneau Make");
assert(hub.indexOf("einvTestNotion") !== -1, "bouton test Notion");
assert(hub.indexOf("einvMarkNotionOk") !== -1, "bouton Notion pret");
assert(hub.indexOf("pending_identity") !== -1, "option pending_identity UI");
assert(hub.indexOf("einvMarkTiimeOk") !== -1, "bouton Tiime verifie");
assert(hub.indexOf("einvMarkMakeOk") !== -1, "bouton Make cree");
assert(hub.indexOf("einvIssueForm") !== -1, "formulaire emission Factur-X");

var js = read("js/crm-e-invoicing.js");
assert(js.indexOf("/api/crm/e-invoicing") !== -1, "appels API e-invoicing");
assert(js.indexOf("apply-smart-mix") !== -1, "action apply-smart-mix");
assert(js.indexOf("test-make") !== -1, "action test-make UI");
assert(js.indexOf("test-notion") !== -1, "action test-notion UI");
assert(js.indexOf("mark-tiime-verified") !== -1, "UI mark-tiime-verified");

var api = read("api/_lib/routes/crm-e-invoicing.js");
assert(api.indexOf("ensureEInvoicingSchema") !== -1, "schema auto");
assert(api.indexOf("buildSmartMix") !== -1, "smart mix API");
assert(api.indexOf("makeBridge") !== -1, "dispatch Make");
assert(api.indexOf("notionBridge") !== -1, "dispatch Notion");
assert(api.indexOf("mark-tiime-verified") !== -1, "action mark-tiime-verified");
assert(api.indexOf("mark-make-ready") !== -1, "action mark-make-ready");
assert(api.indexOf("mark-notion-ready") !== -1, "action mark-notion-ready");
assert(api.indexOf("test-notion") !== -1, "action test-notion");

var wh = read("api/webhooks/[action].js");
assert(wh.indexOf("make-einvoice") !== -1, "webhook make-einvoice");

assert(read("api/_lib/make-einvoice.js").indexOf("MAKE_EINVOICE_WEBHOOK_URL") !== -1, "env MAKE");
assert(read("api/_lib/notion-einvoice.js").indexOf("api.notion.com") !== -1, "client Notion API");

assert(read("docs/MAKE-TIIME-EINVOICE.md").indexOf("Tiime Free") !== -1, "doc Make Tiime");
assert(read("docs/NOTION-EINVOICE.md").indexOf("NOTION_TOKEN") !== -1, "doc Notion");
assert(read("docs/MAKE-TIIME-GOLIVE.md").indexOf("Notion") !== -1, "golive Notion");

var blueprint = JSON.parse(read("data/make-blueprints/einvoice-crm-to-make.json"));
assert(blueprint.plan === "make-free", "blueprint make-free");

var bpNotion = JSON.parse(read("data/make-blueprints/einvoice-crm-to-make-notion.json"));
assert(
  bpNotion.modules.some(function (m) {
    return String(m.type).indexOf("notion") !== -1;
  }),
  "blueprint Make Notion"
);

var notionSchema = JSON.parse(read("data/notion/einvoice-database-schema.json"));
assert(notionSchema.properties && notionSchema.properties.length >= 8, "schema Notion props");

assert(read("api/crm/[action].js").indexOf('"e-invoicing"') !== -1, "route CRM e-invoicing");
assert(read("js/crm-sidebar.js").indexOf("crm-e-invoicing.html") !== -1, "lien sidebar");
assert(read("crm-financial.html").indexOf("crm-e-invoicing.html") !== -1, "lien hub financier");

var cfg = JSON.parse(read("config/e-invoicing.json"));
assert(cfg.siren === "810571513", "SIREN config");
assert(cfg.stackPrimaryPdp === "tiime", "stack primaire Tiime");
assert(cfg.tiimeIsPrimaryPlatform === true, "Tiime plateforme principale confirmee");
assert(cfg.pdpName === "Tiime", "pdpName Tiime");
assert(cfg.pdpStatus === "pending_identity", "statut pending identity Tiime");
assert(cfg.tiimeAccountCreated === true, "compte Tiime cree");
assert(/plateforme principale/i.test(cfg.notes || ""), "notes plateforme principale");

var hub = read("crm-e-invoicing.html");
assert(/Plateforme principale\s*:\s*<strong>Tiime<\/strong>/i.test(hub) || hub.indexOf("Plateforme principale") !== -1 && hub.indexOf("Tiime") !== -1, "CRM annonce Tiime principale");
assert(hub.indexOf("plateforme principale") !== -1, "select/label plateforme principale");
assert(cfg.makeAccountPending === true, "Make en attente compte");
assert(cfg.notionAccountPending === true, "Notion pending config");

var stack = JSON.parse(read("config/e-invoicing-stack.json"));
assert(stack.recommendedPrimaryPdp === "tiime", "reco Tiime");
["indy", "abby", "shine", "make", "notion", "odoo"].forEach(function (id) {
  assert(
    stack.tools.some(function (t) {
      return t.id === id;
    }),
    "catalogue " + id
  );
});
assert(stack.rule.indexOf("Une seule PDP") !== -1, "regle une seule PDP");

assert(read("database/e-invoicing.sql").indexOf("e_invoices_received") !== -1, "table received");
assert(read("docs/FACTURATION-ELECTRONIQUE.md").indexOf("Notion") !== -1, "doc mix Notion");

var lib = require(path.join(__dirname, "..", "api/_lib/e-invoicing.js"));
var settings = lib.mergeSettings(null);
var ready = lib.readiness(settings);
assert(ready.tiimeIdentityPending === true, "readiness identity pending");
assert(ready.pdpTrajectory === true, "readiness trajectoire PDP");
assert(lib.isValidSiren("810571513"), "SIREN valide");

var mix = lib.buildSmartMix(settings);
assert(mix.recommendedPrimaryPdp === "tiime", "buildSmartMix reco Tiime");
assert(mix.tools.length >= 6, "buildSmartMix outils");

var notion = require(path.join(__dirname, "..", "api/_lib/notion-einvoice.js"));
var props = notion.buildPageProperties("invoice_issued", {
  invoiceNumber: "FAC-1",
  buyerName: "Client",
  buyerSiren: "123456782",
  amountHt: 10,
  amountTtc: 12,
});
assert(props.Nom && props.Nom.title, "Notion props Nom");
assert(props.Type && props.Type.select, "Notion props Type");

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

assert(JSON.parse(read("package.json")).scripts["verify:e-invoicing"], "script npm verify:e-invoicing");

if (failed) {
  console.log("\n" + failed + " echec(s)");
  process.exit(1);
}
console.log("\nFacturation electronique (Tiime / Make / Notion) : OK.");
