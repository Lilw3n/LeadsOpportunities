#!/usr/bin/env node
/** Liens bidirectionnels pige ↔ interlocuteur. */
var fs = require("fs");
var path = require("path");
var root = path.join(__dirname, "..");
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
  return fs.readFileSync(path.join(root, rel), "utf8");
}

var lib = read("js/crm-immo-contact-links.js");
assert(lib.indexOf("linksForProperty") >= 0, "linksForProperty");
assert(lib.indexOf("propertiesForContact") >= 0, "propertiesForContact");
assert(lib.indexOf("linkAsOwner") >= 0, "linkAsOwner");
assert(lib.indexOf("digitsPhone") >= 0, "digitsPhone");

var propsJs = read("js/crm-immo-properties-page.js");
assert(propsJs.indexOf("prospectBlockHtml") >= 0, "bloc prospect liste");
assert(propsJs.indexOf("hydrateContactLabels") >= 0, "hydrate noms");
assert(propsJs.indexOf("crm-contact.html?id=") >= 0, "lien vers contact");

var propsHtml = read("crm-immo-properties.html");
assert(propsHtml.indexOf("crm-immo-contact-links.js") >= 0, "script links piges");
assert(propsHtml.indexOf(".immo-prospect") >= 0, "CSS prospect");

var contactJs = read("crm-contact.js");
assert(contactJs.indexOf("renderImmoLinkedProperties();") >= 0, "appel depuis render()");
assert(contactJs.indexOf("function renderImmoLinkedProperties") >= 0, "fonction définie");
assert(
  contactJs.indexOf("renderDossier();\n    renderImmoLinkedProperties();") >= 0 ||
    /renderDossier\(\);\s*renderImmoLinkedProperties\(\);/.test(contactJs),
  "render() appelle bien renderImmoLinkedProperties"
);

var contactHtml = read("crm-contact.html");
assert(contactHtml.indexOf("immoLinkedPropertiesPanel") >= 0, "panel HTML contact");
assert(contactHtml.indexOf("crm-immo-contact-links.js") >= 0, "script links contact");
assert(contactHtml.indexOf("Biens / piges CRM") >= 0, "titre section");

var pkg = JSON.parse(read("package.json"));
assert(pkg.scripts["verify:immo-lien-prospect"], "npm script");

// Unit: phone normalize + soft match
var Links = require("../js/crm-immo-contact-links.js");
assert(Links.digitsPhone("06 18 39 15 12") === "0618391512", "normalize FR phone");
var fakeStore = {
  listProperties: function () {
    return [
      {
        id: "prop_1",
        title: "Bien vendeur · LUNEVILLE · 260000 €",
        city: "LUNEVILLE",
        postal_code: "54300",
        phone: "0618391512",
        price_fai: 260000,
        updated_at: "2026-09-14T09:02:00.000Z",
      },
    ];
  },
  listParties: function () {
    return [];
  },
  getProperty: function (id) {
    return this.listProperties().find(function (p) {
      return p.id === id;
    });
  },
  upsertProperty: function (p) {
    this._last = p;
    return p;
  },
  upsertParty: function (p) {
    this._party = p;
    return p;
  },
};
var contact = { id: "ct_pierre", first_name: "Pierre", last_name: "LESIEUR", phone: "06 18 39 15 12" };
var rows = Links.propertiesForContact(contact, fakeStore, null);
assert(rows.length === 1 && rows[0].soft === true, "soft match tél. pige↔contact");
Links.linkAsOwner(fakeStore, rows[0].property, contact);
assert(fakeStore._last && fakeStore._last.owner_contact_id === "ct_pierre", "linkAsOwner set owner");
assert(fakeStore._party && fakeStore._party.role === "vendeur", "party vendeur créée");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nOK verify-immo-lien-prospect");
