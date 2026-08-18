#!/usr/bin/env node
/**
 * Vérifie le modèle relations / parrainage / quote-parts.
 * Aucune rémunération n’est jamais promise aux apporteurs.
 */
var Rel = require("../js/crm-people-relations-lib.js");
var failed = 0;

function assert(cond, msg) {
  if (!cond) {
    failed++;
    console.log("FAIL", msg);
  } else {
    console.log("OK  ", msg);
  }
}

assert(!!Rel.NO_PROMISE && Rel.NO_PROMISE.indexOf("rémunération") !== -1, "disclaimer rémunération");
assert(Rel.NO_PROMISE.toLowerCase().indexOf("promis") !== -1, "disclaimer dit « promis »");

var dirty = {
  from_contact_id: "ct_a",
  to_contact_id: "ct_b",
  rel_type: "parrainage",
  promisedPct: 10,
  reward: "cadeau",
  commission_promise: 500,
  notes: "connaissance du quartier",
};
assert(Rel.hasForbiddenPromise(dirty), "détecte clés interdites");
var clean = Rel.stripPromises(dirty);
assert(!clean.promisedPct && !clean.reward && !clean.commission_promise, "stripPromises retire les promesses");
assert(clean.notes === "connaissance du quartier", "notes métier conservées");
assert(clean.rel_type === "parrainage", "type parrainage conservé");

var norm = Rel.normalizeRelationship(dirty);
assert(norm.rel_type === "parrainage", "normalize parrainage");
assert(!Object.prototype.hasOwnProperty.call(norm, "promisedPct"), "normalize sans promisedPct");
assert(norm.from_contact_id === "ct_a" && norm.to_contact_id === "ct_b", "sens filleul → apporteur");

var threw = false;
try {
  Rel.normalizeRelationship({ from_contact_id: "x", to_contact_id: "x", rel_type: "conjoint" });
} catch (e) {
  threw = true;
}
assert(threw, "refuse auto-lien");

threw = false;
try {
  Rel.normalizeRelationship({ from_contact_id: "a", to_contact_id: "b", rel_type: "bonus" });
} catch (e) {
  threw = true;
}
assert(threw, "refuse type inconnu");

var d = Rel.describeRelation(
  { from_contact_id: "filleul", to_contact_id: "apporteur", rel_type: "parrainage" },
  "filleul"
);
assert(d.isParrainage && d.label.indexOf("Parrainé") !== -1, "vue filleul : parrainé par");
var d2 = Rel.describeRelation(
  { from_contact_id: "filleul", to_contact_id: "apporteur", rel_type: "parrainage" },
  "apporteur"
);
assert(d2.label.indexOf("orienté") !== -1 || d2.label.indexOf("filleul") !== -1, "vue apporteur : a orienté");

var child = Rel.describeRelation(
  { from_contact_id: "kid", to_contact_id: "parent", rel_type: "enfant" },
  "kid"
);
assert(child.label === "Enfant de", "enfant → parent");

assert(Rel.normalizeMarital("marie") === "marie", "statut marital");
assert(!Rel.normalizeMarital("riche"), "statut marital inconnu rejeté");

var parties = [
  { role: "vendeur", share_pct: 50, legal_form: "sci", capacity: "associe", entity_name: "SCI Dupont" },
  { role: "heritier", share_pct: 30 },
  { role: "usufruitier", share_pct: 20 },
  { role: "apporteur", share_pct: 99 },
];
var tot = Rel.ownershipShareTotal(parties);
assert(tot.sum === 100 && tot.ok, "quote-parts proprio = 100 % (apporteur ignoré)");
assert(tot.counted === 3, "3 rôles propriétaires comptés");

var bad = Rel.ownershipShareTotal([
  { role: "vendeur", share_pct: 40 },
  { role: "heritier", share_pct: 40 },
]);
assert(!bad.ok && bad.warning.indexOf("80") !== -1, "alerte si parts ≠ 100 %");

var empty = Rel.ownershipShareTotal([{ role: "notaire" }]);
assert(empty.ok && empty.counted === 0, "pas d’alerte sans quote-part");

var p = Rel.normalizeParty({
  role: "associe_sci",
  name: "SCI Martin",
  share_pct: 120,
  promisedAmount: 1000,
  legal_form: "sci",
  capacity: "associe",
});
assert(p.share_pct === 100, "share clampée à 100");
assert(p.legal_form === "sci" && p.capacity === "associe", "forme + capacité");
assert(!p.promisedAmount, "party sans promesse");

assert(Rel.REL_TYPES.some(function (t) { return t.id === "conjoint"; }), "type conjoint");
assert(Rel.REL_TYPES.some(function (t) { return t.id === "heritier"; }), "type héritier");
assert(Rel.REL_TYPES.some(function (t) { return t.id === "associe"; }), "type associé");
assert(Rel.OWNERSHIP_ROLE_IDS.indexOf("usufruitier") !== -1, "usufruit dans ownership");

var fs = require("fs");
var path = require("path");
function read(rel) {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf8");
}

var libSrc = read("js/crm-people-relations-lib.js");
assert(!/vous recevrez|cadeau offert|commission garantie/i.test(libSrc), "lib sans langage de récompense");

var landing = read("landings/acheteur-immo.html");
assert(landing.indexOf("Parrain / connaissance") !== -1, "landing : option parrain");
assert(/rémunération.*promis|promis.*rémunération/i.test(landing), "landing : disclaimer parrain");

var apportLanding = read("landings/apporteur-affaires.html");
assert(apportLanding.indexOf("apporteur") !== -1, "landing apporteur public");
assert(apportLanding.indexOf("conclusion") !== -1, "landing : dossier finalisé");
assert(apportLanding.indexOf("reconnaissance") !== -1, "landing : reconnaissance étudiée");
assert(!/vous recevrez|commission garantie|% garanti|prime garantie/i.test(apportLanding), "landing sans promesse chiffrée");

var fees = read("crm-agency-fees.html");
assert(fees.indexOf("reconnaissance") !== -1, "barèmes : reconnaissance si abouti");

var api = read("api/_lib/routes/crm-relations.js");
assert(api.indexOf("no_promise") !== -1, "API refuse les clés de promesse");

var sql = read("database/crm-contact-relationships.sql");
assert(sql.indexOf("crm_contact_relationships") !== -1, "DDL relations");
assert(sql.indexOf("share_pct") !== -1, "DDL quote-parts");
assert(!/promised|reward|commission/i.test(sql), "DDL sans colonne de promesse");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nRelations / parrainage / parts : OK");
