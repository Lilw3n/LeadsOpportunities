/**
 * Pertinence lead : tarif concurrent vs notre offre + alignement besoins / verticale.
 */
var VERTICAL_CAPS = {
  vtc: ["assurance_vtc", "vtc", "auto_pro", "flotte"],
  sante: ["mutuelle", "sante", "prevoyance"],
  "credit-immo": ["credit_immo", "credit-immo", "rachat_credit", "assurance_emprunteur"],
};

function num(v) {
  var n = Number(v);
  return isNaN(n) ? null : n;
}

function inferNeeds(body) {
  var needs = [];
  var v = String(body.vertical || "").toLowerCase();
  if (v === "vtc") needs.push("assurance_vtc");
  if (v === "sante") needs.push("mutuelle");
  if (v === "credit-immo" || v === "credit_immo") needs.push("credit_immo");
  if (body.priority === "Prix") needs.push("optimisation_prix");
  if (body.priority === "Remboursements") needs.push("garanties_elevees");
  return needs;
}

function needsMatchScore(vertical, needs) {
  var caps = VERTICAL_CAPS[vertical] || [];
  if (!needs.length || !caps.length) return 0.5;
  var matched = needs.filter(function (n) {
    return caps.some(function (c) {
      return n.indexOf(c) !== -1 || c.indexOf(n) !== -1;
    });
  });
  return Math.min(1, matched.length / Math.max(needs.length, 1));
}

function computeLeadRelevance(body) {
  var comp = num(body.competitorMonthly || body.current_insurer_price || body.competitor_monthly);
  var ours = num(body.ourOfferMonthly || body.quoted_price || body.our_offer_monthly);
  var score = num(body.leadScore || body.lead_score) || 0;
  var needs = body.needs || inferNeeds(body || {});
  var match = needsMatchScore(String(body.vertical || "").toLowerCase(), needs);
  var reasons = [];

  var priceAdvantage = comp != null && ours != null && comp > ours;
  var priceDisadvantage = comp != null && ours != null && comp > 0 && ours >= comp;

  if (priceAdvantage) reasons.push("Tarif assureur actuel superieur a notre offre");
  if (priceDisadvantage) reasons.push("Tarif concurrent deja inferieur ou egal");
  if (match >= 0.7) reasons.push("Besoins alignes avec nos offres");
  if (match < 0.4) reasons.push("Besoins partiellement hors perimetre");
  if (score >= 70) reasons.push("Score eleve (" + score + "/100)");

  var level = "medium";
  if (priceDisadvantage && match < 0.4) level = "not_relevant";
  else if (priceAdvantage && match >= 0.5) level = "high";
  else if (score >= 70 || (priceAdvantage && score >= 50)) level = "high";
  else if (score < 40 && !priceAdvantage) level = "low";
  else if (priceDisadvantage && score < 50) level = "not_relevant";

  return {
    relevance: level,
    relevanceReasons: reasons,
    competitorMonthly: comp,
    ourOfferMonthly: ours,
  };
}

function relevanceLabel(level) {
  var map = {
    high: "Pertinent",
    medium: "A qualifier",
    low: "Faible",
    not_relevant: "Non pertinent",
  };
  return map[level] || level;
}

module.exports = {
  computeLeadRelevance,
  relevanceLabel,
  inferNeeds,
};
