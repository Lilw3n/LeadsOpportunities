/**
 * Valeur potentielle d'un lead (rémunération estimée en €).
 *
 * ══════════════════════════════════════════════════════════════════
 *  RÈGLES DE CALCUL — À AJUSTER ICI quand la rémunération réelle
 *  (commissions partenaires, prix de vente du lead, honoraires) sera
 *  précisée. Tout est dans l'objet RULES ci-dessous, rien d'autre à
 *  toucher. Utilisé côté serveur (api/_lib) ET côté dashboard.
 * ══════════════════════════════════════════════════════════════════
 *
 * Logique : base par produit + bonus selon les réponses du questionnaire
 * (besoins cochés, services immo, % du montant financé), puis
 * multiplicateurs de qualité (RDV demandé, téléphone, questionnaire
 * complet, score). Résultat : { value, band, reasons }.
 */
(function (global) {
  var RULES = {
    currency: "EUR",

    /* Commission de base estimée par produit (€ par dossier abouti) */
    baseByVertical: {
      "credit-immo": 900,
      credit_immo: 900,
      emprunteur: 500,
      rachat: 700,
      acheteur_immo: 400,
      "acheteur-immo": 400,
      vtc: 350,
      taxi: 350,
      "sante-collective": 400,
      sante_collective: 400,
      sante: 180,
      equitation: 120,
      auto: 120,
      pno: 100,
      chasse: 90,
      habitation: 80,
      animaux: 60,
    },
    defaultBase: 120,

    /* Bonus par besoin coché (champ buyerNeeds des questionnaires) */
    needBonus: {
      pret: 900,
      rachat: 600,
      emprunteur: 450,
      pno: 100,
      habitation: 80,
      locataire: 40,
      visite: 150,
    },

    /* Bonus par service immobilier demandé (champ serviceSought) */
    serviceBonus: {
      transaction: 1200,
      estimation_vente: 800,
      syndic_copro: 500,
      location_gestion: 400,
      recherche_locataire: 150,
      autre_service: 100,
    },

    /* Part du montant financé (crédit / budget d'achat) : 0.8 %, plafonné */
    loanPct: 0.008,
    loanCap: 2500,

    /* Multiplicateurs de qualité */
    rdvMultiplier: 1.25 /* RDV / rappel demandé */,
    phoneMultiplier: 1.15 /* téléphone renseigné */,
    incompleteMultiplier: 0.5 /* questionnaire < 60 % rempli */,
    scoreMultipliers: [
      { min: 75, x: 1.2 },
      { min: 55, x: 1.0 },
      { min: 0, x: 0.7 },
    ],

    /* Seuils des bandes de priorité (€) */
    bands: { high: 600, medium: 150 },
  };

  function toList(v) {
    if (v == null || v === "") return [];
    if (Array.isArray(v)) return v.map(String);
    return String(v)
      .split(/[,;]/)
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
  }

  function toAmount(v) {
    if (v == null) return 0;
    var n = parseFloat(
      String(v)
        .replace(/[\s€\u00a0]/g, "")
        .replace(",", ".")
    );
    return isFinite(n) && n > 0 ? n : 0;
  }

  function normalizeVertical(v) {
    return String(v || "").trim().toLowerCase();
  }

  function wantsRdv(p) {
    if (p.callbackRequested === true) return true;
    var j = String(p.journey || "").toLowerCase();
    if (j === "callback") return true;
    var src = String(p.source || "").toLowerCase();
    if (src.indexOf("callback") >= 0) return true;
    var msg = String(p.message || p.comment || "").toLowerCase();
    return /rendez[- ]vous|\brdv\b|rappel/.test(msg);
  }

  /**
   * Calcule la valeur potentielle d'un lead à partir de son payload
   * (réponses questionnaire) et éventuellement de la ligne site_leads.
   */
  function computeLeadValue(payload, row) {
    var p = payload || {};
    var r = row || {};
    var reasons = [];

    var vertical = normalizeVertical(r.vertical || p.vertical || p.need || p.serviceNeed);
    var base =
      RULES.baseByVertical[vertical] != null ? RULES.baseByVertical[vertical] : RULES.defaultBase;
    var value = base;
    reasons.push("Base " + (vertical || "produit inconnu") + " : " + base + " €");

    toList(p.buyerNeeds).forEach(function (need) {
      var b = RULES.needBonus[need];
      if (b) {
        value += b;
        reasons.push("Besoin " + need + " : +" + b + " €");
      }
    });

    toList(p.serviceSought).forEach(function (svc) {
      var b = RULES.serviceBonus[svc];
      if (b) {
        value += b;
        reasons.push("Service " + svc + " : +" + b + " €");
      }
    });

    var needsLoan =
      vertical.indexOf("credit") >= 0 ||
      toList(p.buyerNeeds).indexOf("pret") >= 0 ||
      toList(p.buyerNeeds).indexOf("rachat") >= 0;
    if (needsLoan) {
      var amount = toAmount(p.loanAmount || p.immoPropertyPrice || p.propertyPrice || p.budgetMax);
      if (amount > 0) {
        var loanPart = Math.min(Math.round(amount * RULES.loanPct), RULES.loanCap);
        value += loanPart;
        reasons.push("Montant financé ~" + Math.round(amount) + " € : +" + loanPart + " €");
      }
    }

    if (wantsRdv(p)) {
      value *= RULES.rdvMultiplier;
      reasons.push("RDV / rappel demandé : ×" + RULES.rdvMultiplier);
    }

    var phone = String(r.phone || p.phone || "").trim();
    if (phone) {
      value *= RULES.phoneMultiplier;
      reasons.push("Téléphone renseigné : ×" + RULES.phoneMultiplier);
    }

    var step = Number(r.questionnaire_step || p.questionnaire_step || p.step || 0);
    var total = Number(r.questionnaire_total || p.questionnaire_total || p.step_total || 0);
    if (total > 0 && step > 0 && step / total < 0.6) {
      value *= RULES.incompleteMultiplier;
      reasons.push(
        "Questionnaire incomplet (" + step + "/" + total + ") : ×" + RULES.incompleteMultiplier
      );
    }

    var score = Number(r.lead_score != null ? r.lead_score : p.leadScore);
    if (isFinite(score)) {
      for (var i = 0; i < RULES.scoreMultipliers.length; i++) {
        if (score >= RULES.scoreMultipliers[i].min) {
          if (RULES.scoreMultipliers[i].x !== 1) {
            value *= RULES.scoreMultipliers[i].x;
            reasons.push("Score " + score + "/100 : ×" + RULES.scoreMultipliers[i].x);
          }
          break;
        }
      }
    }

    value = Math.max(0, Math.round(value));
    var band = value >= RULES.bands.high ? "high" : value >= RULES.bands.medium ? "medium" : "low";
    return { value: value, band: band, reasons: reasons, currency: RULES.currency };
  }

  function formatEuros(value) {
    var n = Math.round(Number(value) || 0);
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f") + " €";
  }

  var api = {
    RULES: RULES,
    computeLeadValue: computeLeadValue,
    formatEuros: formatEuros,
  };

  global.LeadValue = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : global);
