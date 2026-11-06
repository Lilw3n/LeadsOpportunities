/**
 * Projection d'achat immobilier — coût réel du logement.
 * Prêt + assurance + taxe foncière + énergie + eau + copro + travaux
 * + salaire / apport / patrimoine / reste à vivre (indicatif HCSF 2026).
 *
 * Estimations pédagogiques, non contractuelles — pas une offre de crédit.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.AchatProjection = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var DPE_KWH = { A: 50, B: 90, C: 145, D: 215, E: 290, F: 375, G: 480 };
  var DPE_TRAVAUX_M2 = { A: 0, B: 20, C: 50, D: 140, E: 280, F: 450, G: 650 };
  var DPE_ORDER = ["A", "B", "C", "D", "E", "F", "G"];

  /** Taxe foncière indicative €/m²/an par département (ordres de grandeur 2024-2026). */
  var TF_EUR_M2 = {
    "75": 28,
    "92": 24,
    "93": 18,
    "94": 22,
    "91": 18,
    "77": 16,
    "78": 20,
    "95": 18,
    "69": 20,
    "13": 18,
    "06": 22,
    "33": 16,
    "31": 16,
    "44": 14,
    "59": 14,
    "67": 16,
    "68": 15,
    "34": 16,
    "35": 14,
    "38": 14,
    "76": 12,
    "42": 13,
    "21": 12,
    "51": 13,
    "54": 13,
    "57": 13,
    "63": 12,
    "14": 13,
    "29": 12,
    "56": 13,
    "85": 12,
    "17": 14,
    "64": 14,
    "40": 12,
    "83": 18,
    "84": 16,
    "30": 14,
    "11": 12,
    "66": 14,
    "81": 12,
    "12": 10,
    "48": 9,
    "15": 9,
    "19": 10,
    "23": 9,
    "03": 10,
    "58": 10,
    "71": 11,
    "89": 10,
    "10": 11,
    "08": 11,
    "02": 11,
    "80": 11,
    "60": 14,
    "27": 12,
    "76b": 12,
    "97": 8,
    "971": 8,
    "972": 8,
    "973": 7,
    "974": 9,
    "976": 7,
    "2A": 14,
    "2B": 13,
    "20": 14
  };

  var ENERGY_PRICE = {
    elec: 0.2516,
    gaz: 0.104,
    fioul: 0.12,
    pac: 0.2516
  };

  var WATER_EUR_M3 = 4.3;
  var WATER_M3_PERS = 50;
  var WATER_ABO = 120;
  var ELEC_SPECIFIC_BASE = 800;
  var ELEC_SPECIFIC_PERS = 400;
  var COPRO_EUR_M2 = 32;
  var MRH_BASE = 11;
  var MRH_M2 = 0.16;
  var DOSSIER_BANQUE = 800;
  var CAUTION_PCT = 1.25;
  var ASSURANCE_DEFAULT = 0.34;
  var TAUX_DEFAULT = 3.45;
  var HCSF_DTI = 35;
  var HCSF_DTI_SOFT = 33;
  var DUREE_MAX = 25;
  var DUREE_MAX_RENO = 27;

  function round2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }

  function round0(n) {
    return Math.round(Number(n) || 0);
  }

  function clamp(n, min, max) {
    n = Number(n) || 0;
    if (n < min) return min;
    if (n > max) return max;
    return n;
  }

  function euro(n, digits) {
    var d = digits == null ? 0 : digits;
    return (
      (Number(n) || 0).toLocaleString("fr-FR", {
        minimumFractionDigits: d,
        maximumFractionDigits: d
      }) + "\u00a0€"
    );
  }

  function pct(n, digits) {
    var d = digits == null ? 1 : digits;
    return (
      (Number(n) || 0).toLocaleString("fr-FR", {
        minimumFractionDigits: d,
        maximumFractionDigits: d
      }) + "\u00a0%"
    );
  }

  function monthlyPayment(principal, annualRatePct, months) {
    var P = Math.max(0, Number(principal) || 0);
    var n = Math.max(1, Math.round(Number(months) || 0));
    var r = (Number(annualRatePct) || 0) / 100 / 12;
    if (P <= 0) return 0;
    if (r <= 0) return round2(P / n);
    var f = Math.pow(1 + r, n);
    return round2((P * r * f) / (f - 1));
  }

  function maxPrincipal(monthly, annualRatePct, months) {
    var M = Math.max(0, Number(monthly) || 0);
    var n = Math.max(1, Math.round(Number(months) || 0));
    var r = (Number(annualRatePct) || 0) / 100 / 12;
    if (M <= 0) return 0;
    if (r <= 0) return round2(M * n);
    var f = Math.pow(1 + r, n);
    return round2((M * (f - 1)) / (r * f));
  }

  function totalInterest(principal, annualRatePct, months, mens) {
    var P = Math.max(0, Number(principal) || 0);
    var n = Math.max(1, Math.round(Number(months) || 0));
    var m = mens != null ? mens : monthlyPayment(P, annualRatePct, n);
    return round2(Math.max(0, m * n - P));
  }

  function deptFromPostal(postal) {
    var p = String(postal || "").replace(/\s/g, "");
    if (!/^\d{5}$/.test(p)) return "";
    if (p.indexOf("97") === 0 || p.indexOf("98") === 0) return p.slice(0, 3);
    if (p.indexOf("20") === 0) return "20";
    return p.slice(0, 2);
  }

  function tfEurM2(dept) {
    if (!dept) return 12;
    if (TF_EUR_M2[dept] != null) return TF_EUR_M2[dept];
    if (dept.length === 3) return TF_EUR_M2["97"] || 8;
    return 12;
  }

  function notairePct(prix, anciennete) {
    var p = Math.max(0, Number(prix) || 0);
    if (anciennete === "neuf") return p < 250000 ? 2.8 : 2.5;
    if (p < 100000) return 8.2;
    if (p < 250000) return 7.6;
    if (p < 500000) return 7.2;
    return 6.8;
  }

  function estimateNotaire(prix, anciennete) {
    return round0((Number(prix) || 0) * notairePct(prix, anciennete) / 100);
  }

  function estimateTaxeFonciere(input) {
    if (input.taxeFonciereAnnuelle != null && input.taxeFonciereAnnuelle !== "") {
      return round0(Number(input.taxeFonciereAnnuelle) || 0);
    }
    var surface = Math.max(20, Number(input.surface) || 70);
    var dept = deptFromPostal(input.postal);
    var m2 = tfEurM2(dept);
    var typeF = input.typeBien === "maison" ? 1.15 : 1;
    var raw = surface * m2 * typeF;
    var prix = Number(input.prix) || 0;
    if (prix > 0) {
      var cap = prix * 0.012;
      var floor = prix * 0.0025;
      raw = Math.min(cap, Math.max(floor, raw));
    }
    if (input.anciennete === "neuf") raw *= 0.15;
    return round0(raw);
  }

  function estimateTravaux(input) {
    if (input.travaux != null && input.travaux !== "") {
      return round0(Number(input.travaux) || 0);
    }
    var dpe = String(input.dpe || "D").toUpperCase();
    var perM2 = DPE_TRAVAUX_M2[dpe] != null ? DPE_TRAVAUX_M2[dpe] : 140;
    var surface = Math.max(20, Number(input.surface) || 70);
    return round0(surface * perM2);
  }

  function estimateCopro(input) {
    if (input.coproAnnuelle != null && input.coproAnnuelle !== "") {
      return round0(Number(input.coproAnnuelle) || 0);
    }
    if (input.typeBien === "maison") return 0;
    var surface = Math.max(20, Number(input.surface) || 70);
    return round0(surface * COPRO_EUR_M2);
  }

  function energySplit(chauffage) {
    var c = String(chauffage || "mixte").toLowerCase();
    if (c === "elec") return { elec: 1, gaz: 0, fioul: 0, pac: 0 };
    if (c === "gaz") return { elec: 0.22, gaz: 0.78, fioul: 0, pac: 0 };
    if (c === "fioul") return { elec: 0.2, gaz: 0, fioul: 0.8, pac: 0 };
    if (c === "pac") return { elec: 0.35, gaz: 0, fioul: 0, pac: 0.65 };
    return { elec: 0.45, gaz: 0.55, fioul: 0, pac: 0 };
  }

  function estimateUtilities(input) {
    var dpe = String(input.dpe || "D").toUpperCase();
    var kwhM2 = DPE_KWH[dpe] != null ? DPE_KWH[dpe] : 215;
    var surface = Math.max(20, Number(input.surface) || 70);
    var occupants = Math.max(1, Number(input.occupants) || 1);
    var kwhChauff = kwhM2 * surface * 0.55;
    var split = energySplit(input.chauffage);
    var chauffEur =
      kwhChauff * split.elec * ENERGY_PRICE.elec +
      kwhChauff * split.gaz * ENERGY_PRICE.gaz +
      kwhChauff * split.fioul * ENERGY_PRICE.fioul +
      kwhChauff * split.pac * ENERGY_PRICE.elec * 0.45;
    var elecSpecKwh = ELEC_SPECIFIC_BASE + ELEC_SPECIFIC_PERS * occupants;
    var elecSpecEur = elecSpecKwh * ENERGY_PRICE.elec;
    var waterEur = WATER_ABO + occupants * WATER_M3_PERS * WATER_EUR_M3;
    var elecTotal = round0(chauffEur * (split.elec + split.pac * 0.45) + elecSpecEur);
    if (String(input.chauffage || "mixte").toLowerCase() === "elec") {
      elecTotal = round0(chauffEur + elecSpecEur);
    }
    var gazTotal = round0(kwhChauff * split.gaz * ENERGY_PRICE.gaz);
    var fioulTotal = round0(kwhChauff * split.fioul * ENERGY_PRICE.fioul);
    return {
      kwhChauff: round0(kwhChauff),
      elecAn: elecTotal,
      gazAn: gazTotal,
      fioulAn: fioulTotal,
      eauAn: round0(waterEur),
      totalAn: round0(elecTotal + gazTotal + fioulTotal + waterEur)
    };
  }

  function estimateMrh(input) {
    if (input.mrhAnnuelle != null && input.mrhAnnuelle !== "") {
      return round0(Number(input.mrhAnnuelle) || 0);
    }
    var surface = Math.max(20, Number(input.surface) || 70);
    return round0((MRH_BASE + surface * MRH_M2) * 12);
  }

  function minResteAVivre(adultes, enfants) {
    var a = Math.max(1, Number(adultes) || 1);
    var e = Math.max(0, Number(enfants) || 0);
    return 850 * a + 320 * e;
  }

  function comfortResteAVivre(adultes, enfants) {
    var a = Math.max(1, Number(adultes) || 1);
    var e = Math.max(0, Number(enfants) || 0);
    return 1250 * a + 420 * e;
  }

  function normalize(raw) {
    raw = raw || {};
    var hasCo = !!raw.hasCo;
    return {
      prix: Math.max(0, Number(raw.prix) || 0),
      typeBien: raw.typeBien === "maison" ? "maison" : "appartement",
      anciennete: raw.anciennete === "neuf" ? "neuf" : "ancien",
      surface: Math.max(0, Number(raw.surface) || 0),
      pieces: Math.max(0, Number(raw.pieces) || 0),
      dpe: DPE_ORDER.indexOf(String(raw.dpe || "D").toUpperCase()) >= 0 ? String(raw.dpe).toUpperCase() : "D",
      chauffage: raw.chauffage || "mixte",
      postal: String(raw.postal || "").replace(/\s/g, ""),
      occupants: Math.max(1, Number(raw.occupants) || 1),
      coproAnnuelle: raw.coproAnnuelle,
      taxeFonciereAnnuelle: raw.taxeFonciereAnnuelle,
      travaux: raw.travaux,
      travauxMode: raw.travauxMode === "cash" ? "cash" : raw.travauxMode === "mixte" ? "mixte" : "pret",
      travauxCash: Math.max(0, Number(raw.travauxCash) || 0),
      apport: Math.max(0, Number(raw.apport) || 0),
      epargne: Math.max(0, Number(raw.epargne) || 0),
      patrimoineImmo: Math.max(0, Number(raw.patrimoineImmo) || 0),
      dureeAns: clamp(Number(raw.dureeAns) || 25, 5, 30),
      taux: clamp(raw.taux == null || raw.taux === "" ? TAUX_DEFAULT : Number(raw.taux), 0, 12),
      assuranceTaux: clamp(
        raw.assuranceTaux == null || raw.assuranceTaux === "" ? ASSURANCE_DEFAULT : Number(raw.assuranceTaux),
        0,
        3
      ),
      quotite: clamp(Number(raw.quotite) != null && raw.quotite !== "" ? Number(raw.quotite) : 100, 0, 100),
      hasCo: hasCo,
      assuranceCoTaux: clamp(Number(raw.assuranceCoTaux) || ASSURANCE_DEFAULT, 0, 3),
      quotiteCo: clamp(Number(raw.quotiteCo) || (hasCo ? 100 : 0), 0, 100),
      ptzMontant: Math.max(0, Number(raw.ptzMontant) || 0),
      salaire: Math.max(0, Number(raw.salaire) || 0),
      salaireCo: Math.max(0, Number(raw.salaireCo) || 0),
      autresRevenus: Math.max(0, Number(raw.autresRevenus) || 0),
      creditsEnCours: Math.max(0, Number(raw.creditsEnCours) || 0),
      pensionVersee: Math.max(0, Number(raw.pensionVersee) || 0),
      loyerActuel: Math.max(0, Number(raw.loyerActuel) || 0),
      enfants: Math.max(0, Math.round(Number(raw.enfants) || 0)),
      fraisNotaireOverride: raw.fraisNotaireOverride,
      guaranteeOverride: raw.guaranteeOverride,
      mrhAnnuelle: raw.mrhAnnuelle,
      financerFrais: !!raw.financerFrais
    };
  }

  function scoreComfort(ctx) {
    var pts = 0;
    var reasons = [];
    var dti = ctx.dti;
    if (dti <= HCSF_DTI_SOFT) {
      pts += 40;
      reasons.push("Endettement sous 33 % — zone de confort HCSF");
    } else if (dti <= HCSF_DTI) {
      pts += 26;
      reasons.push("Endettement entre 33 et 35 % — acceptable, peu de marge");
    } else if (dti <= 40) {
      pts += 10;
      reasons.push("Endettement au-dessus de 35 % — hors norme HCSF sauf exception");
    } else {
      reasons.push("Endettement trop élevé pour un dossier standard");
    }

    var ravRatio = ctx.minRav > 0 ? ctx.rav / ctx.minRav : 0;
    if (ravRatio >= 1.25) {
      pts += 25;
      reasons.push("Reste à vivre confortable pour le foyer");
    } else if (ravRatio >= 1) {
      pts += 16;
      reasons.push("Reste à vivre au-dessus du plancher bancaire");
    } else if (ravRatio >= 0.8) {
      pts += 6;
      reasons.push("Reste à vivre un peu juste pour le nombre de personnes");
    } else {
      reasons.push("Reste à vivre insuffisant — les banques refusent souvent");
    }

    var months = ctx.coussinMois;
    if (months >= 6) {
      pts += 20;
      reasons.push("Épargne de précaution ≥ 6 mois de coût logement");
    } else if (months >= 3) {
      pts += 12;
      reasons.push("Coussin de 3 à 6 mois — acceptable");
    } else if (months >= 1) {
      pts += 5;
      reasons.push("Peu d'épargne après apport — fragile en cas de coup dur");
    } else {
      reasons.push("L'apport vide trop le patrimoine liquide");
    }

    if (ctx.ltv <= 80) {
      pts += 15;
      reasons.push("Apport solide (LTV ≤ 80 %)");
    } else if (ctx.ltv <= 90) {
      pts += 10;
      reasons.push("Apport correct (LTV ≤ 90 %)");
    } else if (ctx.ltv <= 100) {
      pts += 4;
      reasons.push("Financement élevé — apport surtout sur les frais");
    } else {
      reasons.push("Financement > 100 % du prix — dossier plus difficile");
    }

    var score = clamp(pts, 0, 100);
    var verdict;
    var tone;
    if (score >= 75) {
      verdict = "Vous vous en sortez confortablement";
      tone = "ok";
    } else if (score >= 55) {
      verdict = "Jouable, avec un peu de vigilance";
      tone = "mid";
    } else if (score >= 40) {
      verdict = "Serré — à retravailler avant de visiter";
      tone = "tight";
    } else {
      verdict = "Trop tendu pour un dossier standard";
      tone = "no";
    }
    return { score: score, verdict: verdict, tone: tone, reasons: reasons };
  }

  function buildLoan(input, opts) {
    opts = opts || {};
    var dureeAns = opts.dureeAns != null ? opts.dureeAns : input.dureeAns;
    var taux = opts.taux != null ? opts.taux : input.taux;
    var travauxTotal = estimateTravaux(input);
    var travauxInLoan = 0;
    var travauxCash = 0;
    if (input.travauxMode === "cash") {
      travauxCash = travauxTotal;
    } else if (input.travauxMode === "mixte") {
      travauxCash = Math.min(travauxTotal, input.travauxCash);
      travauxInLoan = Math.max(0, travauxTotal - travauxCash);
    } else {
      travauxInLoan = travauxTotal;
    }

    var notaire =
      input.fraisNotaireOverride != null && input.fraisNotaireOverride !== ""
        ? round0(Number(input.fraisNotaireOverride) || 0)
        : estimateNotaire(input.prix, input.anciennete);
    var forcedGuarantee =
      input.guaranteeOverride != null && input.guaranteeOverride !== ""
        ? round0(Number(input.guaranteeOverride) || 0)
        : null;

    function loanAndCaution(guaranteeGuess) {
      var fraisAcqGuess = notaire + DOSSIER_BANQUE + guaranteeGuess;
      var aFinancer;
      if (input.financerFrais) {
        aFinancer = Math.max(
          0,
          input.prix + travauxInLoan + fraisAcqGuess - input.apport - input.ptzMontant
        );
      } else {
        var apportPourPrix = Math.max(0, input.apport - fraisAcqGuess);
        aFinancer = Math.max(0, input.prix + travauxInLoan - apportPourPrix - input.ptzMontant);
      }
      var caution =
        forcedGuarantee != null ? forcedGuarantee : round0((aFinancer * CAUTION_PCT) / 100);
      return { aFinancer: aFinancer, caution: caution, fraisAcq: notaire + DOSSIER_BANQUE + caution };
    }

    var pass1 = loanAndCaution(0);
    var pass2 = loanAndCaution(pass1.caution);
    var guarantee = pass2.caution;
    var fraisAcq = pass2.fraisAcq;
    var aFinancerBrut = pass2.aFinancer;

    var months = Math.round(dureeAns * 12);
    var mensHa = monthlyPayment(aFinancerBrut, taux, months);
    var assurE = round2((aFinancerBrut * input.assuranceTaux * input.quotite) / 100 / 100 / 12);
    var assurC = input.hasCo
      ? round2((aFinancerBrut * input.assuranceCoTaux * input.quotiteCo) / 100 / 100 / 12)
      : 0;
    var mensAc = round2(mensHa + assurE + assurC);
    var interets = totalInterest(aFinancerBrut, taux, months, mensHa);
    var coutAssurance = round0((assurE + assurC) * months);

    return {
      travauxTotal: travauxTotal,
      travauxInLoan: travauxInLoan,
      travauxCash: travauxCash,
      notaire: notaire,
      guarantee: guarantee,
      dossierBanque: DOSSIER_BANQUE,
      fraisAcq: fraisAcq,
      aFinancer: round0(aFinancerBrut),
      months: months,
      dureeAns: dureeAns,
      taux: taux,
      mensHa: mensHa,
      assurE: assurE,
      assurC: assurC,
      mensAc: mensAc,
      interets: interets,
      coutAssurance: coutAssurance,
      coutCredit: round0(interets + coutAssurance)
    };
  }

  function project(raw, opts) {
    var input = normalize(raw);
    var loan = buildLoan(input, opts);
    var tf = estimateTaxeFonciere(input);
    var utils = estimateUtilities(input);
    var copro = estimateCopro(input);
    var mrh = estimateMrh(input);

    var tfMois = round2(tf / 12);
    var elecMois = round2(utils.elecAn / 12);
    var gazMois = round2((utils.gazAn + utils.fioulAn) / 12);
    var eauMois = round2(utils.eauAn / 12);
    var coproMois = round2(copro / 12);
    var mrhMois = round2(mrh / 12);
    var chargesLogement = round2(tfMois + elecMois + gazMois + eauMois + coproMois + mrhMois);
    var coutMensuelTotal = round2(loan.mensAc + chargesLogement);

    var revenus = round2(input.salaire + input.salaireCo + input.autresRevenus);
    var chargesPerso = round2(input.creditsEnCours + input.pensionVersee);
    var dtiNum = revenus > 0 ? round2(((loan.mensAc + chargesPerso) / revenus) * 100) : 0;
    var rav = round2(revenus - loan.mensAc - chargesPerso - chargesLogement);
    var adultes = 1 + (input.hasCo ? 1 : 0);
    var minRav = minResteAVivre(adultes, input.enfants);
    var confRav = comfortResteAVivre(adultes, input.enfants);
    var ravPers = round2(rav / Math.max(1, adultes + input.enfants * 0.5));

    var epargneApres = round2(input.epargne - input.apport - loan.travauxCash);
    if (epargneApres < 0) epargneApres = 0;
    var apportVsEpargne = input.epargne > 0 ? round2((input.apport / input.epargne) * 100) : 0;
    var coussinMois = coutMensuelTotal > 0 ? round2(epargneApres / coutMensuelTotal) : 99;
    var ltv = input.prix > 0 ? round2((loan.aFinancer / input.prix) * 100) : 0;
    var apportPctPrix = input.prix > 0 ? round2((input.apport / input.prix) * 100) : 0;
    var fraisCouverts = input.apport >= loan.fraisAcq;
    var manqueFrais = Math.max(0, round0(loan.fraisAcq - input.apport));

    var maxMensHcsf = Math.max(0, round2(revenus * (HCSF_DTI / 100) - chargesPerso));
    var maxMensAssur = loan.aFinancer > 0 ? loan.mensAc - loan.mensHa : 0;
    var maxHa = Math.max(0, maxMensHcsf - maxMensAssur);
    var capaciteEmprunt = round0(maxPrincipal(maxHa, loan.taux, loan.months));
    var budgetMaxBien = round0(capaciteEmprunt + input.apport - loan.fraisAcq - loan.travauxInLoan);
    if (budgetMaxBien < 0) budgetMaxBien = 0;

    var vsLoyer = round2(coutMensuelTotal - input.loyerActuel);
    var dpeOkRenovation = ["E", "F", "G"].indexOf(input.dpe) >= 0 && loan.travauxTotal > 0;
    var dureeHcsfMax = dpeOkRenovation ? DUREE_MAX_RENO : DUREE_MAX;
    var dureeOk = loan.dureeAns <= dureeHcsfMax;

    var cashJour1 = round0(input.apport + loan.travauxCash);
    var coutProjet = round0(input.prix + loan.travauxTotal + loan.fraisAcq);

    var comfort = scoreComfort({
      dti: dtiNum,
      rav: rav,
      minRav: minRav,
      coussinMois: coussinMois,
      ltv: ltv
    });

    var flags = [];
    if (dtiNum > HCSF_DTI) {
      flags.push({
        tone: "no",
        text: "Taux d'endettement " + pct(dtiNum) + " > 35 % (norme HCSF, assurance comprise)."
      });
    }
    if (rav < minRav) {
      flags.push({
        tone: "no",
        text: "Reste à vivre " + euro(rav) + "/mois sous le plancher indicatif (" + euro(minRav) + ")."
      });
    } else if (rav < confRav) {
      flags.push({
        tone: "tight",
        text: "Reste à vivre correct mais sous le niveau confort (" + euro(confRav) + "/mois)."
      });
    }
    if (!fraisCouverts) {
      flags.push({
        tone: "tight",
        text:
          "L'apport ne couvre pas les frais d'acquisition (" +
          euro(loan.fraisAcq) +
          "). Manque " +
          euro(manqueFrais) +
          "."
      });
    }
    if (coussinMois < 3) {
      flags.push({
        tone: "tight",
        text: "Après apport, il resterait moins de 3 mois de coût logement en épargne de précaution."
      });
    }
    if (!dureeOk) {
      flags.push({
        tone: "tight",
        text:
          "Durée " +
          loan.dureeAns +
          " ans au-delà du plafond HCSF usuel (" +
          dureeHcsfMax +
          " ans" +
          (dpeOkRenovation ? " avec rénovation énergétique" : "") +
          ")."
      });
    }
    if (input.loyerActuel > 0 && vsLoyer > 0) {
      flags.push({
        tone: "mid",
        text: "Le coût mensuel réel dépasse le loyer actuel de " + euro(vsLoyer) + "."
      });
    } else if (input.loyerActuel > 0 && vsLoyer < 0) {
      flags.push({
        tone: "ok",
        text: "Le coût mensuel réel serait inférieur au loyer actuel de " + euro(Math.abs(vsLoyer)) + "."
      });
    }
    if (comfort.tone === "ok" && flags.length === 0) {
      flags.push({
        tone: "ok",
        text: "Le projet passe les filtres bancaires usuels (endettement, reste à vivre, apport)."
      });
    }

    var breakdown = [
      { id: "pret", label: "Mensualité crédit (hors ass.)", mois: loan.mensHa, an: round0(loan.mensHa * 12) },
      { id: "ade", label: "Assurance emprunteur", mois: round2(loan.assurE + loan.assurC), an: round0((loan.assurE + loan.assurC) * 12) },
      { id: "tf", label: "Taxe foncière", mois: tfMois, an: tf },
      { id: "elec", label: "Électricité", mois: elecMois, an: utils.elecAn },
      { id: "gaz", label: "Gaz / fioul", mois: gazMois, an: utils.gazAn + utils.fioulAn },
      { id: "eau", label: "Eau", mois: eauMois, an: utils.eauAn },
      { id: "copro", label: "Charges de copropriété", mois: coproMois, an: copro },
      { id: "mrh", label: "Assurance habitation", mois: mrhMois, an: mrh }
    ].filter(function (row) {
      return row.an > 0 || row.id === "pret" || row.id === "ade";
    });

    return {
      input: input,
      loan: loan,
      tf: tf,
      utils: utils,
      copro: copro,
      mrh: mrh,
      chargesLogement: chargesLogement,
      coutMensuelTotal: coutMensuelTotal,
      coutAnnuelTotal: round0(coutMensuelTotal * 12),
      revenus: revenus,
      chargesPerso: chargesPerso,
      dti: dtiNum,
      rav: rav,
      ravPers: ravPers,
      minRav: minRav,
      confRav: confRav,
      epargneApres: epargneApres,
      apportVsEpargne: apportVsEpargne,
      coussinMois: coussinMois,
      ltv: ltv,
      apportPctPrix: apportPctPrix,
      fraisCouverts: fraisCouverts,
      manqueFrais: manqueFrais,
      capaciteEmprunt: capaciteEmprunt,
      budgetMaxBien: budgetMaxBien,
      maxMensHcsf: maxMensHcsf,
      vsLoyer: vsLoyer,
      dureeHcsfMax: dureeHcsfMax,
      dureeOk: dureeOk,
      cashJour1: cashJour1,
      coutProjet: coutProjet,
      comfort: comfort,
      flags: flags,
      breakdown: breakdown,
      dept: deptFromPostal(input.postal)
    };
  }

  function scenarios(raw) {
    var base = normalize(raw);
    var years = [20, 25];
    if (["E", "F", "G"].indexOf(base.dpe) >= 0) years.push(27);
    var out = years.map(function (y) {
      var p = project(raw, { dureeAns: y });
      return {
        dureeAns: y,
        mensAc: p.loan.mensAc,
        coutMensuelTotal: p.coutMensuelTotal,
        dti: p.dti,
        rav: p.rav,
        interets: p.loan.interets,
        comfort: p.comfort,
        aFinancer: p.loan.aFinancer
      };
    });
    var stress = project(raw, { taux: base.taux + 1 });
    return {
      durations: out,
      stress: {
        taux: round2(base.taux + 1),
        mensAc: stress.loan.mensAc,
        coutMensuelTotal: stress.coutMensuelTotal,
        dti: stress.dti,
        rav: stress.rav,
        comfort: stress.comfort
      }
    };
  }

  function summaryText(p) {
    if (!p) return "";
    return [
      "Projection achat — " + euro(p.input.prix) + " (" + p.input.typeBien + " " + p.input.anciennete + ", " + p.input.surface + " m², DPE " + p.input.dpe + ")",
      "Apport " + euro(p.input.apport) + " · à financer " + euro(p.loan.aFinancer) + " · " + p.loan.dureeAns + " ans à " + pct(p.loan.taux),
      "Mensualité crédit+ADE " + euro(p.loan.mensAc) + " · coût réel logement " + euro(p.coutMensuelTotal) + "/mois",
      "TF " + euro(p.tf) + "/an · énergie+eau " + euro(p.utils.totalAn) + "/an · copro " + euro(p.copro) + "/an · travaux " + euro(p.loan.travauxTotal),
      "Revenus " + euro(p.revenus) + "/mois · DTI " + pct(p.dti) + " · RAV " + euro(p.rav) + " · coussin " + p.coussinMois.toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + " mois",
      "Verdict : " + p.comfort.verdict + " (" + p.comfort.score + "/100)"
    ].join("\n");
  }

  return {
    DPE_KWH: DPE_KWH,
    HCSF_DTI: HCSF_DTI,
    TAUX_DEFAULT: TAUX_DEFAULT,
    ASSURANCE_DEFAULT: ASSURANCE_DEFAULT,
    round2: round2,
    round0: round0,
    euro: euro,
    pct: pct,
    monthlyPayment: monthlyPayment,
    maxPrincipal: maxPrincipal,
    deptFromPostal: deptFromPostal,
    estimateNotaire: estimateNotaire,
    estimateTaxeFonciere: estimateTaxeFonciere,
    estimateTravaux: estimateTravaux,
    estimateUtilities: estimateUtilities,
    estimateCopro: estimateCopro,
    normalize: normalize,
    project: project,
    scenarios: scenarios,
    summaryText: summaryText,
    buildLoan: buildLoan
  };
});
