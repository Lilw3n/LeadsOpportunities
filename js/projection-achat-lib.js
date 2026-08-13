/**
 * Projection achat immobilier — coût total de possession.
 * Corrèle prêt, taxe foncière, énergie, charges, travaux, revenus & patrimoine.
 * Indicatif courtier (non contractuel). Réutilise CrmBuyerFinance si disponible.
 */
window.ProjectionAchat = (function () {
  var STORAGE_KEY = "lo_projection_achat_v1";

  /** kWh énergie primaire / m² / an (milieu de classe DPE). */
  var DPE_KWH_M2 = {
    A: 50,
    B: 90,
    C: 145,
    D: 215,
    E: 290,
    F: 380,
    G: 450,
    "": 215,
  };

  var HEATING_PROFILES = {
    gaz: { label: "Gaz", elec: 0.22, gas: 0.68, other: 0.1 },
    electrique: { label: "Électrique", elec: 0.88, gas: 0, other: 0.12 },
    fioul: { label: "Fioul / GPL", elec: 0.18, gas: 0.72, other: 0.1 },
    pac: { label: "Pompe à chaleur", elec: 0.62, gas: 0, other: 0.38 },
    urbain: { label: "Chauffage urbain", elec: 0.2, gas: 0.65, other: 0.15 },
    mixte: { label: "Mixte", elec: 0.45, gas: 0.45, other: 0.1 },
    inconnu: { label: "Non renseigné", elec: 0.4, gas: 0.45, other: 0.15 },
  };

  var ENERGY_PRICES = {
    elecKwh: 0.2516,
    gasKwh: 0.11,
    waterMonthlyBase: 18,
    waterPerPerson: 12,
  };

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
    return (
      (Number(n) || 0).toLocaleString("fr-FR", {
        minimumFractionDigits: d,
        maximumFractionDigits: d,
      }) + " %"
    );
  }

  function buyerFinance() {
    return typeof window !== "undefined" ? window.CrmBuyerFinance : null;
  }

  function monthlyPayment(principal, annualRatePct, years) {
    var BF = buyerFinance();
    if (BF) return BF.monthlyPayment(principal, annualRatePct, years);
    var P = Math.max(0, Number(principal) || 0);
    var n = Math.max(1, Math.round((Number(years) || 0) * 12));
    var r = (Number(annualRatePct) || 0) / 100 / 12;
    if (P <= 0) return 0;
    if (r <= 0) return round2(P / n);
    var factor = Math.pow(1 + r, n);
    return round2((P * r * factor) / (factor - 1));
  }

  function insuranceMonthly(loanAmount, ratePctOfCapitalYear) {
    var BF = buyerFinance();
    if (BF) return BF.insuranceMonthly(loanAmount, ratePctOfCapitalYear);
    var pct = ratePctOfCapitalYear != null ? Number(ratePctOfCapitalYear) : 0.34;
    return round2(((Number(loanAmount) || 0) * pct) / 100 / 12);
  }

  /**
   * Estimation taxe foncière annuelle.
   * Priorité : saisie manuelle > ratio prix > surface.
   */
  function estimateTaxeFonciere(o) {
    var manual = Number(o.taxeFonciere);
    if (!isNaN(manual) && manual > 0) {
      return {
        annual: round2(manual),
        monthly: round2(manual / 12),
        source: "manual",
        detail: "Montant saisi",
      };
    }
    var price = Math.max(0, Number(o.purchasePrice) || Number(o.fai) || 0);
    var surface = Math.max(0, Number(o.surface) || 0);
    var pct = Number(o.taxeFoncierePct);
    if (isNaN(pct) || pct <= 0) pct = 0.9;
    var fromPrice = price > 0 ? round2((price * pct) / 100) : 0;
    var fromSurface = surface > 0 ? round2(surface * 14 * 0.28) : 0;
    var annual = fromPrice;
    var source = "price";
    if (fromSurface > fromPrice * 1.15) {
      annual = fromSurface;
      source = "surface";
    }
    return {
      annual: annual,
      monthly: round2(annual / 12),
      source: source,
      pctUsed: pct,
      detail:
        source === "surface"
          ? "Ordre de grandeur surface × base cadastrale indicative"
          : "~" + pct + " % du prix d'achat (moyenne nationale)",
    };
  }

  /**
   * Estimation coûts énergie / eau.
   */
  function estimateEnergyCosts(o) {
    var surface = Math.max(1, Number(o.surface) || 60);
    var dpe = String(o.dpe || "").toUpperCase();
    var kwhM2 = DPE_KWH_M2[dpe] != null ? DPE_KWH_M2[dpe] : DPE_KWH_M2[""];
    var heating = HEATING_PROFILES[o.heating] || HEATING_PROFILES.inconnu;
    var annualKwh = surface * kwhM2;

    var manualElec = Number(o.electricityMonthly);
    var manualGas = Number(o.gasMonthly);
    var manualWater = Number(o.waterMonthly);

    var elecAnnual =
      !isNaN(manualElec) && manualElec > 0
        ? manualElec * 12
        : annualKwh * heating.elec * ENERGY_PRICES.elecKwh;
    var gasAnnual =
      !isNaN(manualGas) && manualGas > 0
        ? manualGas * 12
        : annualKwh * heating.gas * ENERGY_PRICES.gasKwh;
    var otherAnnual = annualKwh * heating.other * 0.08;

    var persons = Math.max(1, Number(o.householdSize) || 2);
    var waterAnnual =
      !isNaN(manualWater) && manualWater > 0
        ? manualWater * 12
        : (ENERGY_PRICES.waterMonthlyBase + ENERGY_PRICES.waterPerPerson * persons) * 12;

    var totalAnnual = round2(elecAnnual + gasAnnual + otherAnnual + waterAnnual);

    return {
      dpe: dpe || "D",
      kwhM2: kwhM2,
      annualKwh: round2(annualKwh),
      heating: heating.label,
      electricity: {
        annual: round2(elecAnnual),
        monthly: round2(elecAnnual / 12),
        manual: !isNaN(manualElec) && manualElec > 0,
      },
      gas: {
        annual: round2(gasAnnual),
        monthly: round2(gasAnnual / 12),
        manual: !isNaN(manualGas) && manualGas > 0,
      },
      water: {
        annual: round2(waterAnnual),
        monthly: round2(waterAnnual / 12),
        manual: !isNaN(manualWater) && manualWater > 0,
      },
      other: {
        annual: round2(otherAnnual),
        monthly: round2(otherAnnual / 12),
      },
      total: {
        annual: totalAnnual,
        monthly: round2(totalAnnual / 12),
      },
    };
  }

  /** Tableau d'amortissement (mensuel). */
  function amortizationSchedule(principal, annualRatePct, years, maxRows) {
    var P = Math.max(0, Number(principal) || 0);
    var n = Math.max(1, Math.round((Number(years) || 0) * 12));
    var r = (Number(annualRatePct) || 0) / 100 / 12;
    var payment = monthlyPayment(P, annualRatePct, years);
    var balance = P;
    var rows = [];
    var totalInterest = 0;
    var totalCapital = 0;
    var limit = maxRows == null ? n : Math.min(n, maxRows);

    for (var i = 1; i <= n; i++) {
      var interest = r > 0 ? round2(balance * r) : 0;
      var capital = round2(Math.min(balance, payment - interest));
      if (r <= 0) capital = round2(P / n);
      var rowPayment = round2(capital + interest);
      balance = round2(Math.max(0, balance - capital));
      totalInterest += interest;
      totalCapital += capital;
      if (i <= limit) {
        rows.push({
          month: i,
          payment: rowPayment,
          capital: capital,
          interest: interest,
          balance: balance,
        });
      }
    }

    return {
      rows: rows,
      totalMonths: n,
      monthlyPayment: payment,
      totalInterest: round2(totalInterest),
      totalPaid: round2(totalCapital + totalInterest),
      truncated: limit < n,
    };
  }

  /** Projection cumulée sur N années (coût possession + crédit). */
  function multiYearRollup(base, yearsList) {
    yearsList = yearsList || [5, 10, 15, 20];
    var loanYears = base.years || 25;
    var full = amortizationSchedule(base.loanAmount, base.ratePct, loanYears);
    var ownershipAnnual = base.ownership.monthlyTotal * 12;
    var travauxAnnual = base.travaux.annualMaintenance;

    return yearsList.map(function (y) {
      var months = Math.min(y * 12, full.totalMonths);
      var creditPaid = 0;
      var interestPaid = 0;
      var capitalPaid = 0;
      for (var m = 0; m < months; m++) {
        var row = full.rows[m];
        if (row) {
          creditPaid += row.payment;
          interestPaid += row.interest;
          capitalPaid += row.capital;
        }
      }
      var ownershipCost = round2((ownershipAnnual + travauxAnnual) * y);
      return {
        years: y,
        creditPaid: round2(creditPaid),
        interestPaid: round2(interestPaid),
        capitalPaid: round2(capitalPaid),
        ownershipCost: ownershipCost,
        totalOut: round2(creditPaid + ownershipCost),
        remainingDebt:
          months >= full.totalMonths ? 0 : round2(Math.max(0, base.loanAmount - capitalPaid)),
      };
    });
  }

  /**
   * Analyse complète projection achat.
   * @param {object} o — voir defaultInput()
   */
  function analyze(o) {
    o = Object.assign(defaultInput(), o || {});
    var BF = buyerFinance();

    var netVendeur = Number(o.netVendeur) || Number(o.purchasePrice) || 0;
    var agencyFee = Number(o.agencyFee) || 0;
    var fai = Number(o.fai) > 0 ? Number(o.fai) : netVendeur + agencyFee;
    var travaux = Math.max(0, Number(o.travaux) || 0);
    var financeTravaux = o.financeTravaux !== false;

    var financeOpts = Object.assign({}, o, {
      netVendeur: netVendeur,
      agencyFee: agencyFee,
      fai: fai,
    });

    var finance = BF
      ? BF.analyze(financeOpts)
      : analyzeFinanceFallback(financeOpts);

    var loanAmount = finance.loanAmount;
    if (financeTravaux && travaux > 0) {
      loanAmount = round2(loanAmount + travaux);
    }

    var rate = finance.ratePct;
    var years = finance.years;
    var payment = monthlyPayment(loanAmount, rate, years);
    var insur = insuranceMonthly(loanAmount, o.insurancePctYear);
    var schedule = amortizationSchedule(loanAmount, rate, years, 360);

    var taxe = estimateTaxeFonciere(
      Object.assign({}, o, { purchasePrice: fai, fai: fai })
    );
    var energy = estimateEnergyCosts(o);
    var chargesCopro = Math.max(0, Number(o.chargesCopro) || 0);
    var maintenancePct = Number(o.maintenancePct);
    if (isNaN(maintenancePct) || maintenancePct < 0) maintenancePct = 0.6;
    var maintenanceAnnual = round2((fai * maintenancePct) / 100);
    var maintenanceMonthly = round2(maintenanceAnnual / 12);

    var housingMonthly = round2(payment + insur);
    var ownershipMonthly = round2(
      taxe.monthly +
        chargesCopro +
        energy.total.monthly +
        maintenanceMonthly
    );
    var totalMonthly = round2(housingMonthly + ownershipMonthly);

    var income = Math.max(0, Number(o.monthlyIncome) || 0);
    var coIncome = Math.max(0, Number(o.coBorrowerIncome) || 0);
    var existing = Math.max(0, Number(o.existingLoansMonthly) || 0);
    var totalIncome = round2(income + coIncome);
    var totalDebtAfter = round2(existing + totalMonthly);
    var debtRatio = totalIncome > 0 ? round2((totalDebtAfter / totalIncome) * 100) : 0;
    var dtiMax = Number(o.dtiMax) || 35;
    var resteAVivre = round2(totalIncome - totalDebtAfter);
    var resteApresLoyer = Number(o.currentRent) || 0;

    var liquidAssets = Math.max(0, Number(o.liquidAssets) || 0);
    var down = finance.project ? finance.project.downPayment : Math.max(0, Number(o.downPayment) || 0);
    var cashNeeded = round2(
      down +
        (finance.project && !finance.project.financeNotary ? finance.project.notary.amount : 0) +
        (!financeTravaux ? travaux : 0)
    );
    var patrimoineRestant = round2(liquidAssets - cashNeeded);
    var apportPct = fai > 0 ? round2((down / fai) * 100) : 0;

    var stress = "ok";
    var messages = [];
    if (debtRatio > dtiMax) {
      stress = "warn";
      messages.push(
        "Endettement global " +
          formatPct(debtRatio) +
          " > " +
          formatPct(dtiMax, 0) +
          " (crédit + charges du bien)."
      );
    }
    if (resteAVivre < 800) {
      stress = resteAVivre < 500 ? "block" : "warn";
      messages.push("Reste à vivre très serré (~" + formatEuro(resteAVivre) + "/mois).");
    }
    if (patrimoineRestant < 0) {
      stress = "block";
      messages.push("Apport + frais > patrimoine liquide déclaré.");
    } else if (patrimoineRestant < 5000) {
      if (stress === "ok") stress = "warn";
      messages.push("Peu d'épargne de secours après l'achat.");
    }
    if (finance.status === "block" || finance.status === "warn") {
      if (stress === "ok") stress = finance.status;
      messages = messages.concat(finance.messages || []);
    }
    if (!messages.length) {
      messages.push("Projection dans les clous indicatifs — affinez avec un courtier.");
    }

    var monthlyBreakdown = [
      { id: "credit", label: "Mensualité crédit", amount: payment, group: "financement" },
      { id: "insurance", label: "Assurance emprunteur", amount: insur, group: "financement" },
      { id: "taxe", label: "Taxe foncière", amount: taxe.monthly, group: "possession" },
      { id: "copro", label: "Charges copropriété", amount: chargesCopro, group: "possession" },
      { id: "elec", label: "Électricité", amount: energy.electricity.monthly, group: "possession" },
      { id: "gas", label: "Gaz / chauffage", amount: energy.gas.monthly, group: "possession" },
      { id: "water", label: "Eau", amount: energy.water.monthly, group: "possession" },
      { id: "maintenance", label: "Entretien / petits travaux", amount: maintenanceMonthly, group: "possession" },
    ];

    var base = {
      loanAmount: loanAmount,
      ratePct: rate,
      years: years,
      ownership: { monthlyTotal: ownershipMonthly },
      travaux: { annualMaintenance: maintenanceAnnual },
      amortization: schedule,
    };
    var rollup = multiYearRollup(base, o.projectionYears || [5, 10, 15, 20]);

    var vsRent =
      resteApresLoyer > 0
        ? {
            currentRent: resteApresLoyer,
            delta: round2(totalMonthly - resteApresLoyer),
            cheaper: totalMonthly <= resteApresLoyer,
          }
        : null;

    return {
      finance: finance,
      project: finance.project,
      travaux: {
        oneShot: round2(travaux),
        financed: financeTravaux && travaux > 0,
        annualMaintenance: maintenanceAnnual,
        maintenancePct: maintenancePct,
      },
      loanAmount: loanAmount,
      ratePct: rate,
      years: years,
      monthlyPayment: payment,
      insuranceMonthly: insur,
      housingMonthly: housingMonthly,
      taxeFonciere: taxe,
      energy: energy,
      chargesCopro: round2(chargesCopro),
      maintenanceMonthly: maintenanceMonthly,
      ownershipMonthly: ownershipMonthly,
      totalMonthly: totalMonthly,
      monthlyBreakdown: monthlyBreakdown,
      income: {
        monthly: round2(income),
        coBorrower: round2(coIncome),
        total: totalIncome,
        existingLoans: round2(existing),
      },
      debtRatio: debtRatio,
      dtiMax: dtiMax,
      resteAVivre: resteAVivre,
      patrimoine: {
        liquidAssets: round2(liquidAssets),
        downPayment: round2(down),
        apportPct: apportPct,
        cashNeeded: cashNeeded,
        remaining: patrimoineRestant,
      },
      amortization: schedule,
      rollup: rollup,
      vsRent: vsRent,
      stress: stress,
      messages: messages,
      feasible: stress !== "block" && finance.feasible !== false,
    };
  }

  function analyzeFinanceFallback(o) {
    var net = Number(o.netVendeur) || Number(o.purchasePrice) || 0;
    var fee = Number(o.agencyFee) || 0;
    var fai = net + fee;
    var notaryPct = o.notaryPreset === "neuf" ? 2.5 : 7.5;
    var notaryAmt = round2((net * notaryPct) / 100);
    var down = Math.max(0, Number(o.downPayment) || 0);
    var loanNeeded = Math.max(0, fai + notaryAmt - down);
    var years = Number(o.years) || 25;
    var rate = Number(o.ratePct) || 4.1;
    var payment = monthlyPayment(loanNeeded, rate, years);
    var insur = insuranceMonthly(loanNeeded, o.insurancePctYear);
    return {
      loanType: "pret_amortissable",
      project: {
        fai: round2(fai),
        netVendeur: round2(net),
        agencyFee: round2(fee),
        notary: { amount: notaryAmt, pct: notaryPct },
        downPayment: round2(down),
        loanNeeded: round2(loanNeeded),
        financeNotary: o.financeNotary !== false,
        ltv: fai > 0 ? round2((loanNeeded / fai) * 100) : 0,
        totalProject: round2(fai + notaryAmt),
      },
      capacity: { maxLoan: 0, roomForNewLoan: 0 },
      ratePct: rate,
      years: years,
      loanAmount: round2(loanNeeded),
      monthlyPayment: payment,
      insuranceMonthly: insur,
      totalMonthlyHousing: round2(payment + insur),
      debtRatio: 0,
      feasible: true,
      status: "ok",
      messages: [],
    };
  }

  function defaultInput() {
    return {
      netVendeur: 250000,
      agencyFee: 0,
      fai: 250000,
      purchasePrice: 250000,
      surface: 65,
      dpe: "D",
      heating: "gaz",
      householdSize: 2,
      taxeFonciere: "",
      taxeFoncierePct: 0.9,
      chargesCopro: 120,
      electricityMonthly: "",
      gasMonthly: "",
      waterMonthly: "",
      travaux: 15000,
      financeTravaux: true,
      maintenancePct: 0.6,
      monthlyIncome: 3200,
      coBorrowerIncome: 0,
      existingLoansMonthly: 0,
      downPayment: 35000,
      liquidAssets: 50000,
      years: 25,
      ratePct: "",
      dtiMax: 35,
      notaryPreset: "ancien",
      notaryPct: 7.5,
      financeNotary: true,
      feePayer: "vendeur",
      insurancePctYear: 0.34,
      currentRent: 0,
      projectionYears: [5, 10, 15, 20],
    };
  }

  function loadPrefs() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var p = raw ? JSON.parse(raw) : {};
      return Object.assign(defaultInput(), p && typeof p === "object" ? p : {});
    } catch (e) {
      return defaultInput();
    }
  }

  function savePrefs(prefs) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(Object.assign(defaultInput(), prefs || {}, { savedAt: new Date().toISOString() }))
      );
    } catch (e) {}
  }

  function fromProperty(property) {
    if (!property || typeof property !== "object") return {};
    var p = property;
    return {
      netVendeur: Number(p.prix_net_vendeur || p.prix_net || p.net_vendeur) || Number(p.prix_fai) || 0,
      fai: Number(p.prix_fai || p.prix) || 0,
      surface: Number(p.surface_habitable || p.surface) || 0,
      dpe: p.conso_energie_finale || p.dpe || "",
      heating: mapHeating(p.chauffage),
      taxeFonciere: Number(p.taxe_fonciere) || "",
      chargesCopro: Number(p.charges_mensuelles) || 0,
      electricityMonthly: p.cout_energie_min ? round2(Number(p.cout_energie_min) / 12) : "",
      travaux: Number(p.budget_travaux || p.travaux_prevus) || 0,
      propertyId: p.id || p.property_id || "",
    };
  }

  function mapHeating(raw) {
    if (!raw) return "inconnu";
    var s = String(raw).toLowerCase();
    if (s.indexOf("gaz") !== -1) return "gaz";
    if (s.indexOf("élect") !== -1 || s.indexOf("elect") !== -1) return "electrique";
    if (s.indexOf("fioul") !== -1 || s.indexOf("gpl") !== -1) return "fioul";
    if (s.indexOf("pompe") !== -1 || s.indexOf("pac") !== -1) return "pac";
    if (s.indexOf("urbain") !== -1 || s.indexOf("collectif") !== -1) return "urbain";
    return "mixte";
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    DPE_KWH_M2: DPE_KWH_M2,
    HEATING_PROFILES: HEATING_PROFILES,
    round2: round2,
    formatEuro: formatEuro,
    formatPct: formatPct,
    estimateTaxeFonciere: estimateTaxeFonciere,
    estimateEnergyCosts: estimateEnergyCosts,
    amortizationSchedule: amortizationSchedule,
    multiYearRollup: multiYearRollup,
    analyze: analyze,
    defaultInput: defaultInput,
    loadPrefs: loadPrefs,
    savePrefs: savePrefs,
    fromProperty: fromProperty,
    monthlyPayment: monthlyPayment,
    insuranceMonthly: insuranceMonthly,
  };
})();
