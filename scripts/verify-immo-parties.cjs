#!/usr/bin/env node
/**
 * Vérifie vendeurs/acquéreurs illimités (ex. 8 héritiers).
 */
const assert = require("assert");
const M = require("../js/crm-immo-matcher.js");

assert.strictEqual(M.parseShare("1/8").share_pct, 12.5);
assert.strictEqual(M.parseShare("1/8").share_label, "1/8");
assert.strictEqual(M.parseShare("12,5").share_pct, 12.5);
assert.strictEqual(M.parseShare("25%").share_pct, 25);
assert.strictEqual(M.parseShare("").share_pct, null);

const heirs = [];
for (let i = 1; i <= 8; i++) {
  heirs.push({
    role: "heritier",
    name: "Héritier " + i,
    share_label: "1/8",
  });
}
heirs.push({ role: "acquereur", name: "Acheteur A" });
heirs.push({ role: "co_acquereur", name: "Acheteur B" });
heirs.push({ role: "notaire", name: "Me Dupont" });

const grouped = M.groupParties(heirs);
assert.strictEqual(grouped.sellers.length, 8, "8 héritiers vendeurs");
assert.strictEqual(grouped.buyers.length, 2, "2 acquéreurs");
assert.strictEqual(grouped.others.length, 1, "1 notaire");
assert.ok(Math.abs(M.shareTotal(grouped.sellers) - 100) < 0.01, "quotes-parts 100 %");

const summary = M.partiesSummary(heirs);
assert.ok(summary.indexOf("8 vendeurs") !== -1, summary);
assert.ok(summary.indexOf("2 acquéreurs") !== -1, summary);

const legacy = M.normalizeParty({ role: "colocataire", name: "Co" });
assert.strictEqual(legacy.role, "co_acquereur");
assert.strictEqual(M.partySide(legacy.role), "buyer");

const doc = M.partiesDocumentPayload(heirs);
assert.strictEqual(doc.vendeurs.length, 8);
assert.strictEqual(doc.acquereurs.length, 2);
assert.strictEqual(doc.mandant, "Héritier 1");
assert.strictEqual(doc.acquereur, "Acheteur A");

assert.ok(M.isSellerRole("heritier"));
assert.ok(M.isSellerRole("co_vendeur"));
assert.ok(M.isBuyerRole("acquereur"));
assert.ok(!M.isSellerRole("notaire"));

const filtered = M.filterProperties(
  [
    {
      id: "p1",
      title: "Maison",
      city: "Lyon",
      _parties_hay: "Marie héritier Paul",
      _parties_count: 8,
    },
  ],
  { q: "marie" }
);
assert.strictEqual(filtered.length, 1, "recherche par nom d'héritier");

console.log("ok — 8 héritiers + co-acquéreurs illimités");
