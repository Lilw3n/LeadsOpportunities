/**
 * Intelligence multi-contrats — opportunités cross-sell pour le courtier
 */
const path = require("path");
const fs = require("fs");
const { normalizeAnswers, ageFromDob } = require("./eligibility-engine");

var matrixCache = null;

function loadMatrix() {
  if (matrixCache) return matrixCache;
  matrixCache = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../../data/cross-sell-matrix.json"), "utf8")
  );
  return matrixCache;
}

function parseMonthly(val) {
  if (val == null || val === "") return null;
  var n = parseFloat(String(val).replace(/[^\d.,]/g, "").replace(",", "."));
  return isNaN(n) ? null : n;
}

function normalizePortfolio(raw) {
  raw = raw || {};
  var primary =
    raw.primaryProduct ||
    raw.vertical ||
    raw.need ||
    (raw.portfolio && raw.portfolio.primaryProduct) ||
    "vtc";
  primary = String(primary).toLowerCase().replace(/_/g, "-");
  if (primary === "credit_immo") primary = "credit-immo";

  var contracts = {};
  var list = raw.portfolio && raw.portfolio.contracts;
  if (Array.isArray(list)) {
    list.forEach(function (c) {
      if (c && c.product) contracts[c.product] = c;
    });
  }

  var productKeys = [
    "auto",
    "vtc",
    "sante",
    "mutuelle",
    "credit-auto",
    "credit-immo",
    "habitation",
    "prevoyance",
    "rc-pro",
  ];
  productKeys.forEach(function (key) {
    var k = key === "mutuelle" ? "sante" : key;
    var prefix = key.replace(/-/g, "");
    var hasKey = "has" + prefix.charAt(0).toUpperCase() + prefix.slice(1);
    var monthlyKey = key + "Monthly";
    var altMonthly = "monthly" + prefix.charAt(0).toUpperCase() + prefix.slice(1);

    if (!contracts[k]) contracts[k] = {};
    if (raw["has" + key] != null || raw[hasKey] != null) {
      contracts[k].hasContract = raw["has" + key] || raw[hasKey];
    }
    if (raw[monthlyKey] != null || raw[altMonthly] != null) {
      contracts[k].monthlyPremium = parseMonthly(raw[monthlyKey] || raw[altMonthly]);
    }
    if (raw[key + "Insurer"] != null) contracts[k].insurer = raw[key + "Insurer"];
  });

  if (raw.hasMutuelle != null || raw.mutuelleMonthly != null) {
    contracts.sante = contracts.sante || {};
    if (raw.hasMutuelle != null) contracts.sante.hasContract = raw.hasMutuelle;
    if (raw.mutuelleMonthly != null) contracts.sante.monthlyPremium = parseMonthly(raw.mutuelleMonthly);
  }
  if (raw.hasCreditAuto != null || raw.creditAutoMonthly != null) {
    contracts["credit-auto"] = contracts["credit-auto"] || {};
    if (raw.hasCreditAuto != null) contracts["credit-auto"].hasContract = raw.hasCreditAuto;
    if (raw.creditAutoMonthly != null) {
      contracts["credit-auto"].monthlyPremium = parseMonthly(raw.creditAutoMonthly);
    }
  }

  return { primaryProduct: primary, contracts: contracts };
}

function buildSignals(raw, portfolio, data) {
  var signals = {};
  var age = data.age != null ? data.age : ageFromDob(raw.driverDob || raw.birthDate);
  if (age != null) {
    signals.age_gte_55 = age >= 55;
    signals.age_gte_65 = age >= 65;
    signals.age_senior = age >= 70;
  }
  var c = portfolio.contracts;
  function hasContract(product) {
    var x = c[product];
    if (!x) return false;
    var h = String(x.hasContract || "").toLowerCase();
    return h === "yes" || h === "oui" || h === "true" || h === "1";
  }
  function unknownPrice(product) {
    var x = c[product];
    if (!x) return true;
    if (hasContract(product) && (x.monthlyPremium == null || x.monthlyPremium === "")) return true;
    return false;
  }

  signals.no_contract_sante = !hasContract("sante");
  signals.unknown_sante_price = unknownPrice("sante") || !hasContract("sante");
  var santeMonthly = c.sante && c.sante.monthlyPremium != null ? c.sante.monthlyPremium : null;
  signals.high_sante_price = santeMonthly != null && santeMonthly >= 55;
  signals.renegotiate_sante = hasContract("sante") && santeMonthly != null;
  signals.no_contract_credit_auto = !hasContract("credit-auto");
  signals.no_contract_habitation = !hasContract("habitation");
  signals.no_contract_prevoyance = !hasContract("prevoyance");
  signals.no_contract_rc_pro = !hasContract("rc-pro");
  signals.self_employed_signal =
    /vtc|taxi|uber|chauffeur|independant|auto-entrepreneur|liberal/i.test(
      String(raw.activity || raw.profession || raw.vertical || "") +
        String(raw.hasCompany || "")
    ) || portfolio.primaryProduct === "vtc";
  signals.has_company =
    raw.hasCompany === true ||
    raw.hasCompany === "yes" ||
    raw.hasCompany === "oui" ||
    /oui|yes|true|1/i.test(String(raw.hasCompany || ""));
  signals.vehicle_financing_signal =
    /credit|loa|lld|leasing|financement/i.test(
      String(raw.vehicleOwnership || raw.financing || "")
    );
  signals.homeowner_signal =
    /proprietaire|owner|achat immo/i.test(String(raw.housingStatus || raw.projectType || ""));

  return signals;
}

function matchTriggers(triggers, signals) {
  if (!triggers || !triggers.length) return true;
  return triggers.every(function (t) {
    return !!signals[t];
  });
}

function estimateOpportunity(toProduct, contract, matrix) {
  var meta = matrix.products[toProduct];
  if (!meta) return null;
  var monthly = contract && contract.monthlyPremium != null ? contract.monthlyPremium : null;
  var benchmark = meta.avgMonthlyCommission || 30;
  var savingsHint = null;
  if (monthly != null && monthly > 60) {
    savingsHint = "Cotisation actuelle élevée (" + monthly + " €/mois) — marge de négo.";
  } else if (monthly == null) {
    savingsHint = "Montant inconnu — question prioritaire au premier appel.";
  }
  return {
    estimatedCommissionMonthly: benchmark,
    competitorMonthly: monthly,
    savingsHint: savingsHint,
  };
}

function computeCrossSell(raw) {
  var matrix = loadMatrix();
  var portfolio = normalizePortfolio(raw);
  var data = normalizeAnswers(raw);
  var signals = buildSignals(raw, portfolio, data);
  var primary = portfolio.primaryProduct;
  if (primary === "mutuelle") primary = "sante";

  var opportunities = [];
  (matrix.affinities || []).forEach(function (aff) {
    if (aff.from !== primary) return;
    if (!matchTriggers(aff.triggers, signals)) return;
    var to = aff.to;
    if (to === portfolio.primaryProduct) return;
    var productMeta = matrix.products[to];
    if (!productMeta) return;
    var contract = portfolio.contracts[to] || {};
    var est = estimateOpportunity(to, contract, matrix);
    opportunities.push({
      product: to,
      label: productMeta.label,
      priority: aff.priority,
      score: aff.priority === "high" ? 90 : aff.priority === "medium" ? 65 : 40,
      reason: aff.reason,
      brokerQuestion: aff.brokerQuestion,
      landingUrl: productMeta.landing,
      estimatedCommissionMonthly: est.estimatedCommissionMonthly,
      competitorMonthly: est.competitorMonthly,
      savingsHint: est.savingsHint,
      status: contract.hasContract ? "replace_or_renegotiate" : "new_business",
    });
  });

  opportunities.sort(function (a, b) {
    return b.score - a.score;
  });

  var topQuestions = [];
  opportunities.slice(0, 4).forEach(function (o) {
    if (o.brokerQuestion && topQuestions.indexOf(o.brokerQuestion) === -1) {
      topQuestions.push(o.brokerQuestion);
    }
  });

  var totalCommissionPotential = opportunities.reduce(function (s, o) {
    return s + (o.estimatedCommissionMonthly || 0);
  }, 0);

  return {
    primaryProduct: portfolio.primaryProduct,
    portfolio: portfolio,
    signals: signals,
    opportunities: opportunities,
    topQuestions: topQuestions,
    summary:
      opportunities.length === 0
        ? "Aucune opportunité cross-sell détectée — enrichir le portefeuille client au questionnaire."
        : opportunities.length +
          " opportunité(s) cross-sell — potentiel commission ~" +
          totalCommissionPotential +
          " €/mois.",
    totalOpportunities: opportunities.length,
    totalCommissionPotentialMonthly: totalCommissionPotential,
  };
}

module.exports = {
  loadMatrix: loadMatrix,
  normalizePortfolio: normalizePortfolio,
  computeCrossSell: computeCrossSell,
};
