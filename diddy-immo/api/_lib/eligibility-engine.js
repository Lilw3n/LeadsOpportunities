/**
 * Moteur d'éligibilité — règles catalogue + partenaires grossistes
 */
const path = require("path");
const fs = require("fs");

var catalogCache = null;

function loadCatalog() {
  if (catalogCache) return catalogCache;
  var p = path.join(__dirname, "../../data/tariff-catalog.json");
  catalogCache = JSON.parse(fs.readFileSync(p, "utf8"));
  return catalogCache;
}

var PARTNERS = [
  { id: "sollyazar", displayName: "Solly Azar Pro", products: ["vtc-taxi", "auto"], minAge: 27, maxAge: 65, minLicenseYears: 5, bonusMin: 0.5, bonusMax: 0.85, maxMaterialClaims: 2, maxBodilyResp: 0 },
  { id: "zephir", displayName: "Zéphir VTC Taxi", products: ["vtc-taxi"], minAge: 23, maxAge: 70, minLicenseYears: 3, bonusMin: 0.5, bonusMax: 1.5, maxMaterialClaims: 3, maxBodilyResp: 1 },
  { id: "2m2a", displayName: "2M2A VTC Taxi", products: ["vtc-taxi"], minAge: 25, maxAge: 68, minLicenseYears: 4, bonusMin: 0.5, bonusMax: 1.0, maxMaterialClaims: 0, maxBodilyResp: 0 },
  { id: "april", displayName: "April", products: ["sante", "habitation", "auto"], minAge: 18, maxAge: 75, minLicenseYears: 0, bonusMin: 0.5, bonusMax: 2.5, maxMaterialClaims: 5, maxBodilyResp: 2 },
];

function ageFromDob(dob) {
  if (!dob) return null;
  var d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  var t = new Date();
  var age = t.getFullYear() - d.getFullYear();
  var m = t.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < d.getDate())) age--;
  return age;
}

function normalizeAnswers(raw) {
  raw = raw || {};
  var vertical = String(raw.vertical || raw.need || "vtc").toLowerCase().replace(/_/g, "-");
  if (vertical === "credit_immo") vertical = "credit-immo";
  var age = raw.age != null && raw.age !== "" ? parseInt(raw.age, 10) : ageFromDob(raw.driverDob || raw.birthDate || raw.dateNaissance);
  var licenseYears = raw.licenseYears != null && raw.licenseYears !== "" ? parseFloat(raw.licenseYears) : null;
  if (licenseYears == null && raw.licenseDate) {
    var ld = new Date(raw.licenseDate);
    if (!isNaN(ld.getTime())) licenseYears = (Date.now() - ld.getTime()) / (365.25 * 24 * 3600 * 1000);
  }
  return {
    vertical: vertical,
    journey: raw.journey || raw.formJourney || "full",
    age: age,
    licenseYears: licenseYears != null ? Math.floor(licenseYears) : null,
    bonusMalus: raw.bonusMalus != null && raw.bonusMalus !== "" ? parseFloat(raw.bonusMalus) : null,
    claimsCount36: raw.claimsCount36 != null && raw.claimsCount36 !== "" ? parseInt(raw.claimsCount36, 10) : raw.claims36 != null ? parseInt(raw.claims36, 10) : null,
    vehicleValue: raw.vehicleValue != null ? parseFloat(raw.vehicleValue) : null,
    household: raw.household || raw.profile || null,
    level: raw.coverageLevel || raw.level || null,
    ltv: raw.ltv != null ? parseFloat(raw.ltv) : null,
    debtRatio: raw.debtRatio != null ? parseFloat(raw.debtRatio) : null,
    monthlyIncome: raw.monthlyIncome != null ? parseFloat(raw.monthlyIncome) : raw.income != null ? parseFloat(raw.income) : null,
    loanAmount: raw.loanAmount != null ? parseFloat(raw.loanAmount) : null,
  };
}

function evalRule(rule, data) {
  var val = data[rule.field];
  if (val == null || val === "" || isNaN(val)) return null;
  var v = Number(rule.value);
  var hit = false;
  switch (rule.op) {
    case "gt":
      hit = val > v;
      break;
    case "gte":
      hit = val >= v;
      break;
    case "lt":
      hit = val < v;
      break;
    case "lte":
      hit = val <= v;
      break;
    case "eq":
      hit = val === v;
      break;
    default:
      return null;
  }
  if (!hit) return null;
  return {
    id: rule.id,
    code: rule.code,
    severity: rule.severity,
    message: rule.message,
    field: rule.field,
  };
}

function productRules(catalog, vertical) {
  var key = vertical === "credit_immo" ? "credit-immo" : vertical;
  var p = catalog.products[key];
  return (p && p.rules) || [];
}

function checkPartner(partner, data) {
  var score = 100;
  var reasons = [];
  var eligible = true;

  if (data.age == null || isNaN(data.age)) {
    return { partnerId: partner.id, partnerName: partner.displayName, isEligible: false, score: 40, reasons: ["Âge manquant"], missingInfo: ["age"] };
  }
  if (data.age < partner.minAge || data.age > partner.maxAge) {
    eligible = false;
    score -= 30;
    reasons.push("Âge hors plage " + partner.minAge + "–" + partner.maxAge + " ans");
  } else reasons.push("Âge OK");

  if (partner.minLicenseYears > 0 && data.licenseYears != null) {
    if (data.licenseYears < partner.minLicenseYears) {
      eligible = false;
      score -= 25;
      reasons.push("Permis < " + partner.minLicenseYears + " ans");
    } else reasons.push("Permis OK");
  }

  if (data.bonusMalus != null && !isNaN(data.bonusMalus)) {
    if (data.bonusMalus < partner.bonusMin || data.bonusMalus > partner.bonusMax) {
      eligible = false;
      score -= 20;
      reasons.push("Bonus-malus hors plage partenaire");
    }
  }

  if (data.claimsCount36 != null && data.claimsCount36 > partner.maxMaterialClaims) {
    eligible = false;
    score -= 20;
    reasons.push("Sinistres > " + partner.maxMaterialClaims + " / 36 mois");
  }

  return {
    partnerId: partner.id,
    partnerName: partner.displayName,
    isEligible: eligible && score >= 55,
    score: Math.max(0, Math.min(100, score)),
    reasons: reasons,
  };
}

function computeEligibility(raw) {
  var catalog = loadCatalog();
  var data = normalizeAnswers(raw);
  var vertical = data.vertical;
  var productKey = vertical === "vtc" ? "vtc-taxi" : vertical === "sante" ? "sante" : vertical;

  var hits = [];
  productRules(catalog, vertical).forEach(function (rule) {
    var r = evalRule(rule, data);
    if (r) hits.push(r);
  });

  var blockers = hits.filter(function (h) {
    return h.severity === "block";
  });
  var warnings = hits.filter(function (h) {
    return h.severity === "warning";
  });

  var partners = PARTNERS.filter(function (p) {
    return p.products.indexOf(productKey) !== -1 || (vertical === "vtc" && p.products.indexOf("vtc-taxi") !== -1);
  }).map(function (p) {
    return checkPartner(p, data);
  });

  var eligiblePartners = partners.filter(function (p) {
    return p.isEligible;
  });

  return {
    normalized: data,
    canQuote: blockers.length === 0,
    canSubmitLead: true,
    blockers: blockers,
    warnings: warnings,
    partners: partners,
    eligiblePartnerCount: eligiblePartners.length,
    insurerSummary:
      blockers.length > 0
        ? "Dossier bloquant sur critères standards — étude manuelle ou dérogation."
        : eligiblePartners.length === 0
          ? "Aucun partenaire automatique — à qualifier au téléphone."
          : eligiblePartners.length + " partenaire(s) potentiel(s).",
  };
}

module.exports = {
  loadCatalog: loadCatalog,
  normalizeAnswers: normalizeAnswers,
  ageFromDob: ageFromDob,
  computeEligibility: computeEligibility,
};
