/**
 * Projection « coût de vie propriétaire » — prêt + taxe foncière + énergies
 * + eau + charges + MRH + travaux, croisés avec revenus / apport / patrimoine.
 * Indicatif courtier (non contractuel).
 */
window.CrmBuyerOwnership = (function () {
  var STORAGE_KEY = "lo_buyer_ownership_prefs_v1";

  /** Ordres de grandeur dépenses énergétiques annuelles €/m² (chauffage + ECS + élec) selon DPE. */
  var DPE_EUR_PER_M2_YEAR = {
    A: 8,
    B: 12,
    C: 18,
    D: 26,
    E: 38,
    F: 55,
    G: 75,
  };

  /** Part chauffage / gaz dans le total énergie (reste = électricité spécifique). */
  var HEAT_SHARE = 0.62;

  /** Taxe foncière indicative % valeur FAI / an si montant inconnu. */
  var TF_PCT = {
    appartement: 0.55,
    maison: 0.85,
    local: 0.7,
    immeuble: 0.65,
    terrain: 0.35,
    default: 0.7,
  };

  function round2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }

  function formatEuro(n) {
    return (
      (Number(n) || 0).toLocaleString("fr-FR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }) + " €"
    );
  }

  function formatPct(n, digits) {
    var d = digits == null ? 1 : digits;
    return (
      (Number(n) || 0).toLocaleString("fr-FR", {
        minimumFractionDigits: d,
        maximumFractionDigits: d,
      }) + " %"
    );
  }

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, Number(n) || 0));
  }

  function normalizeDpe(letter) {
    var L = String(letter || "")
      .trim()
      .toUpperCase()
      .charAt(0);
    return DPE_EUR_PER_M2_YEAR[L] != null ? L : "";
  }

  /**
   * Estimation énergie annuelle à partir du DPE + surface,
   * ou des bornes DPE du diagnostic (cout_energie_min/max).
   */
  function estimateEnergyAnnual(o) {
    var knownMin = Number(o.coutEnergieMin) || 0;
    var knownMax = Number(o.coutEnergieMax) || 0;
    if (knownMin > 0 || knownMax > 0) {
      var mid =
        knownMin > 0 && knownMax > 0
          ? (knownMin + knownMax) / 2
          : knownMin || knownMax;
      return {
        annual: round2(mid),
        source: "dpe_facture",
        dpe: normalizeDpe(o.dpeLetter),
        range: { min: knownMin || mid, max: knownMax || mid },
      };
    }
    var dpe = normalizeDpe(o.dpeLetter) || "D";
    var surf = Math.max(15, Number(o.surfaceM2) || 70);
    var perM2 = DPE_EUR_PER_M2_YEAR[dpe];
    var annual = round2(surf * perM2);
    return {
      annual: annual,
      source: "dpe_grille",
      dpe: dpe,
      range: { min: round2(annual * 0.85), max: round2(annual * 1.2) },
      eurPerM2: perM2,
    };
  }

  function splitEnergyMonthly(annual, overrideElec, overrideGas) {
    var month = round2(annual / 12);
    var heat = round2(month * HEAT_SHARE);
    var elecSpec = round2(month - heat);
    var elec = overrideElec != null && overrideElec !== "" ? Number(overrideElec) : elecSpec;
    var gas = overrideGas != null && overrideGas !== "" ? Number(overrideGas) : heat;
    return {
      elecMonthly: round2(elec),
      gasMonthly: round2(gas),
      totalMonthly: round2((Number(elec) || 0) + (Number(gas) || 0)),
    };
  }

  /**
   * Eau + assainissement : ~120 L/j/pers × 4 €/m³ + abo.
   */
  function estimateWaterMonthly(householdSize, override) {
    if (override != null && override !== "") return round2(Number(override) || 0);
    var pers = clamp(householdSize || 2, 1, 8);
    var m3 = (pers * 0.12 * 30.4);
    var variable = m3 * 4.2;
    var abo = 11;
    return round2(variable + abo);
  }

  function estimateTaxeFonciereMonthly(o) {
    if (o.taxeFonciereAnnuelle != null && o.taxeFonciereAnnuelle !== "" && Number(o.taxeFonciereAnnuelle) > 0) {
      return {
        monthly: round2(Number(o.taxeFonciereAnnuelle) / 12),
        annual: round2(Number(o.taxeFonciereAnnuelle)),
        source: "saisie",
      };
    }
    var price = Math.max(0, Number(o.priceFai) || 0);
    var type = String(o.propertyType || "default").toLowerCase();
    var pct = TF_PCT[type] != null ? TF_PCT[type] : TF_PCT.default;
    // Ajustement départemental léger (IDF / métropoles un peu plus haut)
    var dept = String(o.postalCode || "").slice(0, 2);
    if (["75", "92", "93", "94", "69", "13", "06", "31", "33", "44"].indexOf(dept) >= 0) {
      pct *= 1.15;
    }
    var annual = round2((price * pct) / 100);
    return { monthly: round2(annual / 12), annual: annual, source: "estimation", pct: round2(pct) };
  }

  function estimateMrhMonthly(priceFai, overrideAnnual) {
    if (overrideAnnual != null && overrideAnnual !== "" && Number(overrideAnnual) >= 0) {
      return round2(Number(overrideAnnual) / 12);
    }
    var p = Math.max(0, Number(priceFai) || 0);
    // ~0,12 % de la valeur / an, plancher 180 €, plafond 650 € indicatif RP
    var annual = clamp(p * 0.0012, 180, 650);
    return round2(annual / 12);
  }

  /**
   * Travaux : cash immédiat + mensualité d'amortissement (si non inclus dans le prêt).
   */
  function worksPlan(o) {
    var total = Math.max(0, Number(o.travauxTotal) || 0);
    var inLoan = !!o.travauxInLoan;
    var years = clamp(o.travauxAmortYears || 10, 1, 30);
    var cashNow = inLoan ? 0 : Math.max(0, Number(o.travauxCashNow) != null ? o.travauxCashNow : total);
    var residual = Math.max(0, total - (inLoan ? total : cashNow));
    var monthly = residual > 0 ? round2(residual / (years * 12)) : 0;
    return {
      total: round2(total),
      inLoan: inLoan,
      cashNow: round2(cashNow),
      monthlyAmort: monthly,
      amortYears: years,
    };
  }

  /**
   * Projection complète du coût de possession + stress patrimoine.
   * @param {object} o
   * @param {object} [finance] — résultat CrmBuyerFinance.analyze (optionnel)
   */
  function project(o, finance) {
    o = o || {};
    finance = finance || null;

    var income = Math.max(0, Number(o.monthlyIncome) || 0);
    var co = Math.max(0, Number(o.coBorrowerIncome) || 0);
    var totalIncome = income + co;
    var existing = Math.max(0, Number(o.existingLoansMonthly) || 0);
    var apport = Math.max(0, Number(o.downPayment != null ? o.downPayment : o.apport) || 0);
    var epargne = Math.max(0, Number(o.epargneLiquid) || 0);
    var patrimoine = Math.max(0, Number(o.patrimoineAutre) || 0);
    var reserveMois = clamp(o.reserveCibleMois != null ? o.reserveCibleMois : 6, 0, 24);
    var household = clamp(o.householdSize || 2, 1, 10);
    var currentRent = Math.max(0, Number(o.currentRent) || 0);
    var price =
      Number(o.priceFai) ||
      (finance && finance.project && finance.project.fai) ||
      0;

    var loanMonthly =
      finance && finance.monthlyPayment != null
        ? Number(finance.monthlyPayment)
        : Number(o.loanMonthly) || 0;
    var insurMonthly =
      finance && finance.insuranceMonthly != null
        ? Number(finance.insuranceMonthly)
        : Number(o.insuranceMonthly) || 0;
    var debtRatioBank =
      finance && finance.debtRatio != null ? Number(finance.debtRatio) : null;

    var energy = estimateEnergyAnnual(o);
    var energySplit = splitEnergyMonthly(energy.annual, o.elecMonthly, o.gasMonthly);
    var water = estimateWaterMonthly(household, o.waterMonthly);
    var tf = estimateTaxeFonciereMonthly(
      Object.assign({}, o, { priceFai: price })
    );
    var copro = round2(Number(o.chargesCoproMensuelles) || 0);
    var mrh = estimateMrhMonthly(price, o.mrhAnnual);
    var works = worksPlan(o);
    var otherMonthly = round2(Number(o.autresChargesMensuelles) || 0);

    var creditHousing = round2(loanMonthly + insurMonthly);
    var ownershipOpex = round2(
      tf.monthly +
        energySplit.totalMonthly +
        water +
        copro +
        mrh +
        works.monthlyAmort +
        otherMonthly
    );
    var totalCostOfOwnership = round2(creditHousing + ownershipOpex);
    // Effort réel = TCO + crédits hors logement (déjà hors mensualité immo si rachat)
    var totalOutflow = round2(totalCostOfOwnership + existing);
    var resteAVivre = round2(totalIncome - totalOutflow);
    var effortRate = totalIncome > 0 ? round2((totalCostOfOwnership / totalIncome) * 100) : 0;
    var bankDti =
      debtRatioBank != null
        ? debtRatioBank
        : totalIncome > 0
          ? round2(((creditHousing + existing) / totalIncome) * 100)
          : 0;

    var cashAtSigning = round2(
      apport +
        works.cashNow +
        (o.notaryCash != null ? Number(o.notaryCash) : 0) +
        (Number(o.fraisAgenceCash) || 0)
    );
    var liquidAfter = round2(epargne - cashAtSigning);
    var patrimoineNetAfter = round2(liquidAfter + patrimoine);
    var monthlyBurnForReserve = Math.max(totalCostOfOwnership, 1);
    var reserveMonthsLeft =
      liquidAfter > 0 ? round2(liquidAfter / monthlyBurnForReserve) : liquidAfter < 0 ? 0 : 0;
    var reserveTarget = round2(monthlyBurnForReserve * reserveMois);
    var reserveGap = round2(Math.max(0, reserveTarget - Math.max(0, liquidAfter)));

    var vsRent = null;
    if (currentRent > 0) {
      vsRent = {
        rent: round2(currentRent),
        ownership: totalCostOfOwnership,
        delta: round2(totalCostOfOwnership - currentRent),
        message:
          totalCostOfOwnership <= currentRent
            ? "Le coût de possession estimé est inférieur ou égal à votre loyer actuel."
            : "Surcoût vs loyer actuel : +" +
              formatEuro(totalCostOfOwnership - currentRent) +
              "/mois — en contrepartie vous constituez du capital.",
      };
    }

    var status = "ok";
    var messages = [];
    if (liquidAfter < 0) {
      status = "block";
      messages.push(
        "Apport + cash travaux dépassent l'épargne liquide (" +
          formatEuro(Math.abs(liquidAfter)) +
          " de trou). Réduire apport affiché, différer travaux ou mobiliser patrimoine."
      );
    } else if (reserveMonthsLeft < Math.min(3, reserveMois)) {
      status = "warn";
      messages.push(
        "Réserve post-achat trop faible (~" +
          reserveMonthsLeft +
          " mois de coût propriétaire). Cible indicative : " +
          reserveMois +
          " mois (" +
          formatEuro(reserveTarget) +
          ")."
      );
    }
    if (effortRate > 45) {
      status = status === "block" ? "block" : "warn";
      messages.push(
        "Effort immobilier réel " +
          formatPct(effortRate) +
          " des revenus (prêt + charges de vie). Confortable souvent < 40 %."
      );
    } else if (effortRate > 35 && status === "ok") {
      status = "vigilance";
      messages.push(
        "Effort réel " +
          formatPct(effortRate) +
          " : tenable si revenus stables, mais marge faible pour imprévus."
      );
    }
    if (bankDti > 35) {
      if (status === "ok") status = "warn";
      messages.push(
        "Endettement bancaire (DTI) " +
          formatPct(bankDti) +
          " > 35 % HCSF — le dossier prêt sera scruté même si le reste à vivre paraît correct."
      );
    }
    if (resteAVivre < 800 * household) {
      if (status === "ok") status = "warn";
      messages.push(
        "Reste à vivre " +
          formatEuro(resteAVivre) +
          " pour " +
          household +
          " personne(s) — sous le seuil de confort indicatif (~" +
          formatEuro(800 * household) +
          ")."
      );
    }
    if (!messages.length) {
      messages.push(
        "Projection confortable : DTI bancaire " +
          formatPct(bankDti) +
          ", effort réel " +
          formatPct(effortRate) +
          ", réserve ~" +
          reserveMonthsLeft +
          " mois."
      );
    }

    /** Stress : +1 pt de taux ≈ +~7–9 % mensualité (approx linéaire courte). */
    var stressRatePct = round2(loanMonthly * 1.08 + insurMonthly + ownershipOpex);
    var stressEnergy = round2(
      creditHousing +
        tf.monthly +
        energySplit.totalMonthly * 1.25 +
        water +
        copro +
        mrh +
        works.monthlyAmort +
        otherMonthly
    );
    var stressCombo = round2(
      loanMonthly * 1.08 +
        insurMonthly +
        tf.monthly +
        energySplit.totalMonthly * 1.25 +
        water +
        copro +
        mrh +
        works.monthlyAmort +
        otherMonthly
    );

    var breakdown = [
      { id: "pret", label: "Mensualité prêt (hors assur.)", monthly: round2(loanMonthly), group: "credit" },
      { id: "ade", label: "Assurance emprunteur", monthly: round2(insurMonthly), group: "credit" },
      { id: "tf", label: "Taxe foncière", monthly: tf.monthly, annual: tf.annual, group: "fiscal", source: tf.source },
      { id: "elec", label: "Électricité (estim.)", monthly: energySplit.elecMonthly, group: "energie", source: energy.source },
      { id: "gaz", label: "Gaz / chauffage (estim.)", monthly: energySplit.gasMonthly, group: "energie", source: energy.source },
      { id: "eau", label: "Eau / assainissement", monthly: water, group: "energie" },
      { id: "copro", label: "Charges copropriété", monthly: copro, group: "charges" },
      { id: "mrh", label: "Assurance habitation (MRH)", monthly: mrh, group: "charges" },
      { id: "travaux", label: "Travaux (amort. mensuel)", monthly: works.monthlyAmort, group: "travaux" },
      { id: "autres", label: "Autres charges", monthly: otherMonthly, group: "charges" },
    ].filter(function (row) {
      return row.monthly > 0 || row.id === "pret" || row.id === "tf";
    });

    return {
      priceFai: round2(price),
      totalIncome: round2(totalIncome),
      householdSize: household,
      creditHousing: creditHousing,
      ownershipOpex: ownershipOpex,
      totalCostOfOwnership: totalCostOfOwnership,
      totalOutflow: totalOutflow,
      resteAVivre: resteAVivre,
      effortRate: effortRate,
      bankDti: bankDti,
      breakdown: breakdown,
      energy: Object.assign({}, energy, energySplit),
      taxeFonciere: tf,
      waterMonthly: water,
      mrhMonthly: mrh,
      works: works,
      cashAtSigning: cashAtSigning,
      epargneLiquid: round2(epargne),
      patrimoineAutre: round2(patrimoine),
      liquidAfter: liquidAfter,
      patrimoineNetAfter: patrimoineNetAfter,
      reserveMonthsLeft: reserveMonthsLeft,
      reserveTarget: reserveTarget,
      reserveGap: reserveGap,
      reserveCibleMois: reserveMois,
      vsRent: vsRent,
      status: status,
      messages: messages,
      stress: {
        rateUp: { totalMonthly: stressRatePct, label: "Taux +~1 pt (mensualité +8 %)" },
        energyUp: { totalMonthly: stressEnergy, label: "Énergie +25 %" },
        combo: { totalMonthly: stressCombo, label: "Taux + énergie" },
      },
      chart: {
        credit: creditHousing,
        fiscal: tf.monthly,
        energie: round2(energySplit.totalMonthly + water),
        charges: round2(copro + mrh + otherMonthly),
        travaux: works.monthlyAmort,
      },
    };
  }

  /**
   * Alimente la projection depuis une fiche bien CRM (schema piges).
   */
  function fromProperty(prop, extras) {
    prop = prop || {};
    var f = prop.fields || prop;
    var dpe =
      f.conso_energie_primaire ||
      f.conso_energie_finale ||
      f.dpe ||
      f.dpe_lettre ||
      "";
    var price =
      Number(f.prix_fai || f.prix || f.price_fai || prop.price) || 0;
    var surface =
      Number(f.surface_habitable || f.surface_m2 || f.surface || prop.surface_m2) || 0;
    return Object.assign(
      {
        priceFai: price,
        surfaceM2: surface,
        dpeLetter: dpe,
        taxeFonciereAnnuelle: f.taxe_fonciere || "",
        chargesCoproMensuelles: f.charges_copro || f.charges_mensuelles || 0,
        coutEnergieMin: f.cout_energie_min || "",
        coutEnergieMax: f.cout_energie_max || "",
        propertyType: prop.property_type || f.property_type || "appartement",
        postalCode: f.code_postal || f.cp || prop.postal_code || "",
        travauxTotal: f.travaux_budget || f.travaux || 0,
      },
      extras || {}
    );
  }

  /**
   * Compose avec CrmBuyerFinance.analyze si dispo.
   */
  function projectWithFinance(financeOpts, ownershipOpts) {
    var Fin = window.CrmBuyerFinance;
    var finance = null;
    if (Fin && typeof Fin.analyze === "function") {
      finance = Fin.analyze(
        Object.assign({}, financeOpts || {}, {
          monthlyIncome: (ownershipOpts && ownershipOpts.monthlyIncome) || (financeOpts && financeOpts.monthlyIncome),
          coBorrowerIncome: (ownershipOpts && ownershipOpts.coBorrowerIncome) || (financeOpts && financeOpts.coBorrowerIncome),
          downPayment: (ownershipOpts && (ownershipOpts.downPayment != null ? ownershipOpts.downPayment : ownershipOpts.apport)) || (financeOpts && financeOpts.downPayment),
          existingLoansMonthly: (ownershipOpts && ownershipOpts.existingLoansMonthly) || (financeOpts && financeOpts.existingLoansMonthly),
          travaux:
            (financeOpts && financeOpts.travaux) != null
              ? financeOpts.travaux
              : (ownershipOpts && ownershipOpts.travauxTotal) || 0,
          financeTravaux:
            financeOpts && financeOpts.financeTravaux != null
              ? financeOpts.financeTravaux
              : !!(ownershipOpts && ownershipOpts.travauxInLoan),
        })
      );
    }
    var merged = Object.assign({}, ownershipOpts || {}, {
      priceFai:
        (ownershipOpts && ownershipOpts.priceFai) ||
        (finance && finance.project && finance.project.fai) ||
        (financeOpts && ((Number(financeOpts.netVendeur) || 0) + (Number(financeOpts.agencyFee) || 0))) ||
        0,
      downPayment:
        (ownershipOpts && (ownershipOpts.downPayment != null ? ownershipOpts.downPayment : ownershipOpts.apport)) ||
        (financeOpts && financeOpts.downPayment) ||
        0,
      monthlyIncome: (ownershipOpts && ownershipOpts.monthlyIncome) || (financeOpts && financeOpts.monthlyIncome) || 0,
      coBorrowerIncome: (ownershipOpts && ownershipOpts.coBorrowerIncome) || (financeOpts && financeOpts.coBorrowerIncome) || 0,
      existingLoansMonthly: (ownershipOpts && ownershipOpts.existingLoansMonthly) || (financeOpts && financeOpts.existingLoansMonthly) || 0,
      travauxTotal:
        (ownershipOpts && ownershipOpts.travauxTotal) ||
        (financeOpts && financeOpts.travaux) ||
        0,
      travauxInLoan:
        ownershipOpts && ownershipOpts.travauxInLoan != null
          ? !!ownershipOpts.travauxInLoan
          : !!(financeOpts && financeOpts.financeTravaux),
      notaryCash:
        finance && finance.project && !finance.project.financeNotary
          ? finance.project.notary.amount
          : (ownershipOpts && ownershipOpts.notaryCash) || 0,
    });
    var own = project(merged, finance);
    return { finance: finance, ownership: own };
  }

  function defaultPrefs() {
    return {
      monthlyIncome: 3200,
      coBorrowerIncome: 0,
      existingLoansMonthly: 0,
      downPayment: 40000,
      epargneLiquid: 55000,
      patrimoineAutre: 0,
      reserveCibleMois: 6,
      householdSize: 2,
      currentRent: 900,
      priceFai: 280000,
      surfaceM2: 75,
      dpeLetter: "D",
      propertyType: "appartement",
      postalCode: "",
      taxeFonciereAnnuelle: "",
      chargesCoproMensuelles: 120,
      elecMonthly: "",
      gasMonthly: "",
      waterMonthly: "",
      mrhAnnual: "",
      travauxTotal: 15000,
      travauxInLoan: false,
      travauxCashNow: "",
      travauxAmortYears: 10,
      autresChargesMensuelles: 0,
      loanMonthly: 0,
      insuranceMonthly: 0,
      years: 25,
      ratePct: "",
      netVendeur: 265000,
      agencyFee: 15000,
      notaryPreset: "ancien",
      financeNotary: true,
      insurancePctYear: 0.34,
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

  function statusLabel(status) {
    if (status === "ok") return "Projection confortable";
    if (status === "vigilance") return "Vigilance";
    if (status === "warn") return "Serré";
    if (status === "block") return "Non tenable en l'état";
    return status;
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    DPE_EUR_PER_M2_YEAR: DPE_EUR_PER_M2_YEAR,
    estimateEnergyAnnual: estimateEnergyAnnual,
    estimateWaterMonthly: estimateWaterMonthly,
    estimateTaxeFonciereMonthly: estimateTaxeFonciereMonthly,
    estimateMrhMonthly: estimateMrhMonthly,
    worksPlan: worksPlan,
    project: project,
    fromProperty: fromProperty,
    projectWithFinance: projectWithFinance,
    defaultPrefs: defaultPrefs,
    loadPrefs: loadPrefs,
    savePrefs: savePrefs,
    formatEuro: formatEuro,
    formatPct: formatPct,
    round2: round2,
    statusLabel: statusLabel,
  };
})();
