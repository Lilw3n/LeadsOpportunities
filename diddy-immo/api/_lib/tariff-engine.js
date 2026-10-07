/**
 * Calcul devis indicatif à partir du questionnaire (données internes courtier)
 */
const { loadCatalog, normalizeAnswers, computeEligibility } = require("./eligibility-engine");

function applyModifier(mod, data, base) {
  if (mod.type === "multiplier" && mod.field === "bonusMalus") {
    var bm = data.bonusMalus != null ? data.bonusMalus : mod.default || 1;
    var factor = 1;
    (mod.ranges || []).forEach(function (r) {
      if (bm <= r.max) factor = r.factor;
    });
    return base * factor;
  }
  if (mod.type === "surcharge" && mod.field === "claimsCount36") {
    var c = data.claimsCount36 || 0;
    if (c > (mod.threshold || 0)) return base + (c - mod.threshold) * (mod.perUnit || 0);
    return base;
  }
  if (mod.type === "factor" && mod.field === "vehicleValue") {
    var v = data.vehicleValue || 0;
    var f = 1 + Math.min(mod.cap || 2, (v / 10000) * (mod.per10k || 0));
    return base * f;
  }
  if (mod.type === "factor" && mod.field === "licenseYears") {
    if (data.licenseYears != null && data.licenseYears < 3) return base * (mod.under3 || 1);
    if (data.licenseYears != null && data.licenseYears < 5) return base * (mod.under5 || 1);
    return base;
  }
  if (mod.type === "multiplier" && mod.map) {
    var key = data[mod.field] || "solo";
    return base * (mod.map[key] || 1);
  }
  return base;
}

function buildVtcQuote(product, data, eligibility) {
  var annual = product.baseAnnualPremium;
  (product.modifiers || []).forEach(function (mod) {
    annual = applyModifier(mod, data, annual);
  });
  if (eligibility.warnings.some(function (w) {
    return w.code === "AGE_70_75";
  })) {
    annual *= 1.18;
  }

  var rows = (product.guarantees || []).map(function (g) {
    var prem = Math.round(annual * g.share);
    return {
      code: g.code,
      label: g.label,
      franchise: g.code === "RC" ? 0 : 150,
      annualPremium: prem,
      monthlyPremium: Math.round((prem / 12) * 100) / 100,
    };
  });

  var totalAnnual = rows.reduce(function (s, r) {
    return s + r.annualPremium;
  }, 0);

  return {
    product: "vtc",
    productLabel: product.label,
    currency: "EUR",
    source: "tariff_catalog_v2026",
    confidence: eligibility.eligiblePartnerCount > 0 ? "medium" : "low",
    totalAnnual: totalAnnual,
    totalMonthly: Math.round((totalAnnual / 12) * 100) / 100,
    rows: rows,
    note: "Fourchette indicative interne — non contractuelle. Valider sur bordereau partenaire.",
  };
}

function buildSanteQuote(product, data) {
  var annual = product.baseAnnualPremium;
  (product.modifiers || []).forEach(function (mod) {
    annual = applyModifier(mod, data, annual);
  });
  var rows = (product.guarantees || []).map(function (g) {
    var prem = Math.round(annual * g.share);
    return { code: g.code, label: g.label, annualPremium: prem, monthlyPremium: Math.round((prem / 12) * 100) / 100 };
  });
  var totalAnnual = rows.reduce(function (s, r) {
    return s + r.annualPremium;
  }, 0);
  return {
    product: "sante",
    productLabel: product.label,
    currency: "EUR",
    source: "tariff_catalog_v2026",
    confidence: "medium",
    totalAnnual: totalAnnual,
    totalMonthly: Math.round((totalAnnual / 12) * 100) / 100,
    rows: rows,
    note: "Estimation mutuelle — affiner selon garanties optique/dentaire.",
  };
}

function buildCreditQuote(product, data) {
  var amount = data.loanAmount || 200000;
  var years = 20;
  var profile = "standard";
  if (data.debtRatio != null && data.debtRatio > 33) profile = "difficult";
  else if (data.monthlyIncome != null && data.monthlyIncome >= 3500 && (data.ltv == null || data.ltv <= 90)) profile = "good";
  else if (data.monthlyIncome != null && data.monthlyIncome >= 5000 && data.ltv != null && data.ltv <= 80) profile = "excellent";

  var band = product.rateIndicators[profile] || product.rateIndicators.standard;
  var rateMid = (band.minRate + band.maxRate) / 2;
  var monthly =
    (amount * (rateMid / 100 / 12) * Math.pow(1 + rateMid / 100 / 12, years * 12)) /
    (Math.pow(1 + rateMid / 100 / 12, years * 12) - 1);

  return {
    product: "credit-immo",
    productLabel: product.label,
    currency: "EUR",
    source: "tariff_catalog_v2026",
    confidence: profile === "difficult" ? "low" : "medium",
    loanAmount: amount,
    rateProfile: profile,
    indicativeRateMin: band.minRate,
    indicativeRateMax: band.maxRate,
    indicativeMonthly: Math.round(monthly),
    durationYears: years,
    note: "Simulation indicative — accord bancaire sous réserve d'instruction complète.",
  };
}

function computeTariffQuote(raw) {
  var catalog = loadCatalog();
  var eligibility = computeEligibility(raw);
  var data = eligibility.normalized;
  var key = data.vertical === "credit_immo" ? "credit-immo" : data.vertical;
  var product = catalog.products[key];

  if (!product) {
    return { ok: false, error: "Produit inconnu", eligibility: eligibility };
  }

  if (!eligibility.canQuote && data.vertical !== "credit-immo") {
    return {
      ok: true,
      quote: null,
      eligibility: eligibility,
      message: "Devis automatique suspendu — blocage éligibilité.",
    };
  }

  var quote = null;
  if (key === "vtc") quote = buildVtcQuote(product, data, eligibility);
  else if (key === "sante") quote = buildSanteQuote(product, data);
  else if (key === "credit-immo") quote = buildCreditQuote(product, data);

  return { ok: true, quote: quote, eligibility: eligibility };
}

module.exports = {
  computeTariffQuote: computeTariffQuote,
  normalizeAnswers: normalizeAnswers,
};
