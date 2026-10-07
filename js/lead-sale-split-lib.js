/**
 * Répartition vente lead : part partenaire = % du prix fournisseur (pas du prix de vente).
 * Ex. fournisseur 80 €, 50 % → dû partenaire 40 € ; vente 180 € → tu gardes 140 €.
 * Navigateur : window.LeadSaleSplit  |  Node : module.exports
 */
(function (root) {
  function round2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }

  /**
   * @param {object} input
   * @param {number} input.supplierPriceEur — prix fournisseur (pote)
   * @param {number} [input.partnerSharePct=50] — % du prix fournisseur pour le partenaire
   * @param {number} input.salePriceEur — prix de vente (ajustable, non montré au partenaire)
   */
  function compute(input) {
    input = input || {};
    var supplier = round2(Math.max(0, Number(input.supplierPriceEur) || 0));
    var sharePct = Number(input.partnerSharePct);
    if (!Number.isFinite(sharePct)) sharePct = 50;
    sharePct = Math.max(0, Math.min(100, sharePct));
    var sale = round2(Math.max(0, Number(input.salePriceEur) || 0));
    var partnerDue = round2((supplier * sharePct) / 100);
    var youKeep = round2(sale - partnerDue);
    return {
      supplierPriceEur: supplier,
      partnerSharePct: sharePct,
      salePriceEur: sale,
      partnerDueEur: partnerDue,
      youKeepEur: youKeep,
      marginOverSupplier: round2(sale - supplier),
    };
  }

  function partnerView(split) {
    split = compute(split);
    return {
      supplierPriceEur: split.supplierPriceEur,
      partnerSharePct: split.partnerSharePct,
      partnerDueEur: split.partnerDueEur,
      // Pas de salePriceEur / youKeepEur — volontairement omis
    };
  }

  var api = {
    compute: compute,
    partnerView: partnerView,
    round2: round2,
    DEFAULT_PARTNER_SHARE_PCT: 50,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.LeadSaleSplit = api;
})(typeof window !== "undefined" ? window : globalThis);
