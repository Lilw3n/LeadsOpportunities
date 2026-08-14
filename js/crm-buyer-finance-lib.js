/**
 * Financement acquéreur — capacité d'emprunt, prêt, rachat, règles HCSF.
 * Indicatif courtier (non contractuel). Aligné bandes de taux tariff-catalog 2026.
 */
window.CrmBuyerFinance = (function () {
  var STORAGE_KEY = "lo_buyer_finance_prefs_v1";
  var DTI_MAX_DEFAULT = 35;

  /** Bandes indicatives (catalogue crédit-immo 2026). */
  var RATE_BANDS = {
    excellent: { min: 3.15, max: 3.45, mid: 3.3 },
    good: { min: 3.45, max: 3.85, mid: 3.65 },
    standard: { min: 3.85, max: 4.35, mid: 4.1 },
    difficult: { min: 4.35, max: 5.2, mid: 4.775 },
  };

  var LOAN_TYPES = [
    {
      id: "pret_amortissable",
      label: "Prêt immobilier amortissable",
      desc: "Achat résidence / investissement — mensualité constante capital + intérêts.",
    },
    {
      id: "rachat",
      label: "Rachat / regroupement de crédits",
      desc: "Unifie prêts en cours (+ éventuel projet) pour baisser la mensualité ou allonger.",
    },
    {
      id: "renegociation",
      label: "Renégociation banque actuelle",
      desc: "Même capital restant dû, nouveau taux / durée chez le prêteur actuel.",
    },
    {
      id: "relais",
      label: "Prêt relais (ordre de grandeur)",
      desc: "Financement temporaire avant revente — intérêts seuls sur la période relais.",
    },
  ];

  var NOTARY_PRESETS = [
    { id: "ancien", label: "Ancien (~7,5 %)", pct: 7.5 },
    { id: "neuf", label: "Neuf / VEFA (~2,5 %)", pct: 2.5 },
    { id: "custom", label: "Personnalisé", pct: null },
  ];

  function round2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }

  function formatEuro(n) {
    return (
      (Number(n) || 0).toLocaleString("fr-FR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }) + " €"
    );
  }

  function formatPct(n, digits) {
    var d = digits == null ? 1 : digits;
    return (Number(n) || 0).toLocaleString("fr-FR", {
      minimumFractionDigits: d,
      maximumFractionDigits: d,
    }) + " %";
  }

  /** Mensualité crédit amortissable (PMT). */
  function monthlyPayment(principal, annualRatePct, years) {
    var P = Math.max(0, Number(principal) || 0);
    var n = Math.max(1, Math.round((Number(years) || 0) * 12));
    var r = (Number(annualRatePct) || 0) / 100 / 12;
    if (P <= 0) return 0;
    if (r <= 0) return round2(P / n);
    var factor = Math.pow(1 + r, n);
    return round2((P * r * factor) / (factor - 1));
  }

  /** Capital max finançable pour une mensualité cible. */
  function maxPrincipal(monthly, annualRatePct, years) {
    var M = Math.max(0, Number(monthly) || 0);
    var n = Math.max(1, Math.round((Number(years) || 0) * 12));
    var r = (Number(annualRatePct) || 0) / 100 / 12;
    if (M <= 0) return 0;
    if (r <= 0) return round2(M * n);
    var factor = Math.pow(1 + r, n);
    return round2((M * (factor - 1)) / (r * factor));
  }

  /** Intérêts seuls (relais). */
  function interestOnlyMonthly(principal, annualRatePct) {
    var P = Math.max(0, Number(principal) || 0);
    var r = (Number(annualRatePct) || 0) / 100 / 12;
    return round2(P * r);
  }

  function pickRateProfile(opts) {
    var income = Number(opts.monthlyIncome) || 0;
    var dti = Number(opts.debtRatio) || 0;
    var ltv = opts.ltv != null ? Number(opts.ltv) : null;
    if (dti > 33) return "difficult";
    if (income >= 5000 && ltv != null && ltv <= 80) return "excellent";
    if (income >= 3500 && (ltv == null || ltv <= 90)) return "good";
    return "standard";
  }

  function notaryFees(priceActe, presetId, customPct) {
    var p = Math.max(0, Number(priceActe) || 0);
    var preset = NOTARY_PRESETS.find(function (x) {
      return x.id === presetId;
    }) || NOTARY_PRESETS[0];
    var pct = preset.pct;
    if (preset.id === "custom" || pct == null) pct = Number(customPct) || 7.5;
    return { amount: round2((p * pct) / 100), pct: pct, presetId: preset.id };
  }

  /**
   * Coût projet acheteur à partir d'un résultat barème agence.
   * @param {object} o
   * @param {number} o.netVendeur
   * @param {number} o.agencyFee
   * @param {number} [o.fai]
   * @param {"vendeur"|"acheteur"} o.feePayer
   * @param {string} o.notaryPreset
   * @param {number} [o.notaryPct]
   * @param {boolean} [o.financeNotary]
   * @param {number} o.downPayment
   */
  function projectCost(o) {
    var net = Number(o.netVendeur) || 0;
    var fee = Number(o.agencyFee) || 0;
    var feePayer = o.feePayer === "acheteur" ? "acheteur" : "vendeur";
    // Prix acte (assiette notaire) = net vendeur. L'acquéreur paie toujours FAI (= net + honoraires).
    var priceActe = net;
    var acquisitionCash = net + fee;
    var notary = notaryFees(priceActe, o.notaryPreset || "ancien", o.notaryPct);
    var down = Math.max(0, Number(o.downPayment) || 0);
    var financeNotary = o.financeNotary !== false;
    var totalProject = acquisitionCash + notary.amount;
    var financedBase = acquisitionCash + (financeNotary ? notary.amount : 0);
    var loanNeeded = Math.max(0, financedBase - down);
    var ltv = acquisitionCash > 0 ? round2((loanNeeded / acquisitionCash) * 100) : 0;

    return {
      netVendeur: round2(net),
      agencyFee: round2(fee),
      fai: round2(acquisitionCash),
      feePayer: feePayer,
      buyerPaysAgency: round2(feePayer === "acheteur" ? fee : 0),
      priceActe: round2(priceActe),
      acquisitionCash: round2(acquisitionCash),
      notary: notary,
      downPayment: round2(down),
      financeNotary: !!financeNotary,
      totalProject: round2(totalProject),
      loanNeeded: round2(loanNeeded),
      cashFromBuyer: round2(down),
      ltv: ltv,
    };
  }

  /**
   * Capacité d'endettement HCSF (~35 %).
   */
  function borrowingCapacity(o) {
    var income = Math.max(0, Number(o.monthlyIncome) || 0);
    var coIncome = Math.max(0, Number(o.coBorrowerIncome) || 0);
    var totalIncome = income + coIncome;
    var existing = Math.max(0, Number(o.existingLoansMonthly) || 0);
    var LC = window.LivingCharges;
    var livingDti = LC ? LC.sumInDti(o.livingCharges) : 0;
    existing = existing + livingDti;
    var dtiMax = Number(o.dtiMax) || DTI_MAX_DEFAULT;
    var rate = Number(o.ratePct);
    if (rate == null || isNaN(rate)) rate = RATE_BANDS.standard.mid;
    var years = Number(o.years) || 25;
    var maxDebtService = round2((totalIncome * dtiMax) / 100);
    var roomForNewLoan = round2(Math.max(0, maxDebtService - existing));
    var maxLoan = maxPrincipal(roomForNewLoan, rate, years);
    var resteAVivre = round2(totalIncome - existing - roomForNewLoan);

    return {
      totalIncome: round2(totalIncome),
      existingLoansMonthly: round2(existing),
      dtiMax: dtiMax,
      maxDebtService: maxDebtService,
      roomForNewLoan: roomForNewLoan,
      maxLoan: maxLoan,
      ratePct: rate,
      years: years,
      resteAVivreAtCap: resteAVivre,
    };
  }

  function insuranceMonthly(loanAmount, ratePctOfCapitalYear) {
    var pct = ratePctOfCapitalYear != null ? Number(ratePctOfCapitalYear) : 0.34;
    return round2(((Number(loanAmount) || 0) * pct) / 100 / 12);
  }

  /**
   * Analyse complète projet + capacité + type de prêt.
   */
  function analyze(o) {
    var loanType = o.loanType || "pret_amortissable";
    var years = Number(o.years) || 25;
    var income = Number(o.monthlyIncome) || 0;
    var co = Number(o.coBorrowerIncome) || 0;
    var existing = Number(o.existingLoansMonthly) || 0;
    var LC = window.LivingCharges;
    var living = LC ? LC.normalizeList(o.livingCharges) : [];
    var livingAll = LC ? LC.sumAll(living) : 0;
    var livingDti = LC ? LC.sumInDti(living) : 0;
    var dtiMax = Number(o.dtiMax) || DTI_MAX_DEFAULT;

    var project = projectCost(o);
    var profile = pickRateProfile({
      monthlyIncome: income + co,
      debtRatio: 0,
      ltv: project.ltv,
    });
    // Première passe sans mensualité → profil ; taux manuel prioritaire
    var rate =
      o.ratePct != null && o.ratePct !== ""
        ? Number(o.ratePct)
        : (RATE_BANDS[profile] || RATE_BANDS.standard).mid;

    var capacity = borrowingCapacity({
      monthlyIncome: income,
      coBorrowerIncome: co,
      existingLoansMonthly: existing,
      dtiMax: dtiMax,
      ratePct: rate,
      years: years,
    });

    var loanAmount = project.loanNeeded;
    var currentBalance = Math.max(0, Number(o.currentLoanBalance) || 0);
    var currentMonthly = Math.max(0, Number(o.currentLoanMonthly) || existing);
    var cashOut = Math.max(0, Number(o.cashOut) || 0);

    if (loanType === "rachat") {
      // Regroupement : soldes + éventuel projet (loanNeeded) ou cash-out
      loanAmount = round2(currentBalance + (o.includeProjectInRachat ? project.loanNeeded : cashOut));
      if (!o.includeProjectInRachat && cashOut <= 0 && currentBalance <= 0) {
        loanAmount = project.loanNeeded;
      }
    } else if (loanType === "renegociation") {
      loanAmount = currentBalance > 0 ? currentBalance : project.loanNeeded;
    } else if (loanType === "relais") {
      // Relais souvent % de la valeur du bien à vendre ; ici = besoin projet si non fourni
      loanAmount = Number(o.bridgeAmount) > 0 ? Number(o.bridgeAmount) : project.loanNeeded;
    }

    var payment =
      loanType === "relais"
        ? interestOnlyMonthly(loanAmount, rate)
        : monthlyPayment(loanAmount, rate, years);

    var insur = insuranceMonthly(loanAmount, o.insurancePctYear);
    var totalMonthlyHousing = round2(payment + insur);
    var totalDebtAfter = round2(
      (loanType === "rachat" ? 0 : existing) + totalMonthlyHousing + livingDti
    );
    // En rachat, les mensualités regroupées disparaissent
    if (loanType === "rachat") {
      totalDebtAfter = round2(totalMonthlyHousing + Math.max(0, existing - currentMonthly) + livingDti);
    }

    var totalIncome = income + co;
    var debtRatio = totalIncome > 0 ? round2((totalDebtAfter / totalIncome) * 100) : 0;
    var effortOut = round2(totalDebtAfter - livingDti + livingAll);
    var effortPct = totalIncome > 0 ? round2((effortOut / totalIncome) * 100) : 0;
    var rav = round2(totalIncome - effortOut);
    profile = pickRateProfile({
      monthlyIncome: totalIncome,
      debtRatio: debtRatio,
      ltv: project.ltv,
    });

    var feasible = debtRatio <= dtiMax && loanAmount <= capacity.maxLoan + 1;
    var status = "ok";
    var messages = [];
    if (project.ltv > 110) {
      status = "block";
      messages.push("LTV > 110 % : financement improbable sans restructuration / apport.");
    } else if (debtRatio > dtiMax) {
      status = "warn";
      messages.push(
        "Endettement " +
          formatPct(debtRatio) +
          " > plafond " +
          formatPct(dtiMax, 0) +
          " (HCSF). Renforcer apport, durée ou revenus."
      );
    } else if (loanAmount > capacity.maxLoan) {
      status = "warn";
      messages.push(
        "Emprunt " +
          formatEuro(loanAmount) +
          " > capacité max ~" +
          formatEuro(capacity.maxLoan) +
          " à " +
          formatPct(rate) +
          " / " +
          years +
          " ans."
      );
    } else {
      messages.push("Dossier dans les clous indicatifs (endettement ≤ " + formatPct(dtiMax, 0) + ").");
    }
    if (totalIncome > 0 && totalIncome < 1800) {
      if (status === "ok") status = "warn";
      messages.push("Revenus modestes : capacité limitée, partenaires sélectifs.");
    }

    var savingsMonthly = null;
    if (loanType === "rachat" || loanType === "renegociation") {
      savingsMonthly = round2(currentMonthly - payment);
    }

    var rules = [
      {
        id: "hcsf_dti",
        label: "Taux d'endettement max",
        value: formatPct(dtiMax, 0),
        detail: "Recommandation HCSF — banques en général à " + formatPct(dtiMax, 0) + " des revenus nets.",
      },
      {
        id: "pmt",
        label: "Mensualité (amortissement)",
        value: "M = P × r × (1+r)^n / ((1+r)^n − 1)",
        detail: "r = taux annuel / 12, n = durée en mois. Hors assurance emprunteur.",
      },
      {
        id: "capacity",
        label: "Capacité d'emprunt",
        value: "max(0, revenus × DTI − crédits) → capital",
        detail: "On convertit la mensualité disponible en capital via la formule inverse du PMT.",
      },
      {
        id: "notary",
        label: "Frais de notaire (ordre de grandeur)",
        value: project.notary.pct + " % du prix acte",
        detail: "Ancien ~7,5 % · Neuf/VEFA ~2,5 %. Droits + émoluments — affiner au cas par cas.",
      },
      {
        id: "ltv",
        label: "LTV (loan-to-value)",
        value: formatPct(project.ltv),
        detail: "Emprunt / prix d'acquisition (FAI). > 110 % : blocage fréquent.",
      },
      {
        id: "insurance",
        label: "Assurance emprunteur (estim.)",
        value: formatEuro(insur) + "/mois",
        detail: "Ordre de grandeur ~0,25–0,40 % du capital / an (décès-invalidité). Loi Lemoine : résiliable à tout moment.",
      },
      {
        id: "living",
        label: "Charges de vie (libellés libres)",
        value: formatEuro(livingAll) + "/mois",
        detail:
          "Gaz, électricité, internet, abonnements… hors taux d'endettement HCSF sauf si coché. Elles baissent le reste à vivre (taux d'effort " +
          formatPct(effortPct) +
          ").",
      },
      {
        id: "fee_payer",
        label: "Charge des honoraires",
        value: project.feePayer === "vendeur" ? "Vendeur (FAI)" : "Acquéreur",
        detail:
          project.feePayer === "vendeur"
            ? "L'acheteur paie le prix FAI ; notaire calculé sur le net vendeur (acte)."
            : "Net vendeur + honoraires à la charge de l'acquéreur + notaire sur le net.",
      },
    ];

    if (loanType === "rachat") {
      rules.push({
        id: "rachat",
        label: "Rachat / regroupement",
        value: formatEuro(loanAmount),
        detail:
          "Nouveau prêt = soldes restants dus" +
          (o.includeProjectInRachat ? " + besoin projet" : cashOut ? " + trésorerie" : "") +
          ". Les anciennes mensualités rachetées sortent du taux d'endettement.",
      });
    }
    if (loanType === "relais") {
      rules.push({
        id: "relais",
        label: "Prêt relais",
        value: formatEuro(payment) + "/mois (intérêts)",
        detail: "Approximation intérêts seuls. Durée courte (souvent 12–24 mois) ; à croiser avec compromis de revente.",
      });
    }

    return {
      loanType: loanType,
      loanTypeLabel: (LOAN_TYPES.find(function (t) {
        return t.id === loanType;
      }) || LOAN_TYPES[0]).label,
      project: project,
      capacity: capacity,
      ratePct: rate,
      rateProfile: profile,
      rateBand: RATE_BANDS[profile] || RATE_BANDS.standard,
      years: years,
      loanAmount: round2(loanAmount),
      monthlyPayment: payment,
      insuranceMonthly: insur,
      totalMonthlyHousing: totalMonthlyHousing,
      totalDebtAfter: totalDebtAfter,
      debtRatio: debtRatio,
      effortPct: effortPct,
      rav: rav,
      livingAll: livingAll,
      livingDti: livingDti,
      feasible: feasible,
      status: status,
      messages: messages,
      savingsMonthly: savingsMonthly,
      currentMonthly: currentMonthly,
      rules: rules,
      headroom: round2(capacity.maxLoan - loanAmount),
      headroomMonthly: round2(capacity.roomForNewLoan - totalMonthlyHousing),
    };
  }

  /**
   * Compare le financement acheteur pour chaque ligne agence du comparateur honoraires.
   */
  function compareWithAgencies(agencyRows, financeOpts) {
    return (agencyRows || [])
      .map(function (row) {
        var r = row.result || {};
        var net = r.price != null ? r.price : Number(financeOpts.netVendeur) || 0;
        var fee = r.agencyFee || 0;
        var analysis = analyze(
          Object.assign({}, financeOpts, {
            netVendeur: net,
            agencyFee: fee,
            fai: r.fai != null ? r.fai : net + fee,
          })
        );
        return {
          agency: row.agency,
          schedule: row.schedule,
          feeResult: r,
          finance: analysis,
          hasMatchingKind: row.hasMatchingKind,
        };
      })
      .sort(function (a, b) {
        // Meilleur = endettement le plus bas puis mensualité
        var da = a.finance.debtRatio;
        var db = b.finance.debtRatio;
        if (da !== db) return da - db;
        return a.finance.totalMonthlyHousing - b.finance.totalMonthlyHousing;
      });
  }

  function defaultPrefs() {
    return {
      loanType: "pret_amortissable",
      monthlyIncome: 3200,
      coBorrowerIncome: 0,
      existingLoansMonthly: 0,
      downPayment: 30000,
      years: 25,
      ratePct: "",
      dtiMax: DTI_MAX_DEFAULT,
      feePayer: "vendeur",
      notaryPreset: "ancien",
      notaryPct: 7.5,
      financeNotary: true,
      insurancePctYear: 0.34,
      currentLoanBalance: 0,
      currentLoanMonthly: 0,
      cashOut: 0,
      includeProjectInRachat: true,
      bridgeAmount: 0,
      livingCharges: window.LivingCharges ? window.LivingCharges.defaultList() : [],
    };
  }

  function loadPrefs() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var p = raw ? JSON.parse(raw) : {};
      return Object.assign(defaultPrefs(), p && typeof p === "object" ? p : {});
    } catch (e) {
      return defaultPrefs();
    }
  }

  function savePrefs(prefs) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(Object.assign(defaultPrefs(), prefs || {}, { savedAt: new Date().toISOString() }))
    );
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    DTI_MAX_DEFAULT: DTI_MAX_DEFAULT,
    RATE_BANDS: RATE_BANDS,
    LOAN_TYPES: LOAN_TYPES,
    NOTARY_PRESETS: NOTARY_PRESETS,
    monthlyPayment: monthlyPayment,
    maxPrincipal: maxPrincipal,
    interestOnlyMonthly: interestOnlyMonthly,
    pickRateProfile: pickRateProfile,
    notaryFees: notaryFees,
    projectCost: projectCost,
    borrowingCapacity: borrowingCapacity,
    insuranceMonthly: insuranceMonthly,
    analyze: analyze,
    compareWithAgencies: compareWithAgencies,
    loadPrefs: loadPrefs,
    savePrefs: savePrefs,
    defaultPrefs: defaultPrefs,
    formatEuro: formatEuro,
    formatPct: formatPct,
    round2: round2,
  };
})();
