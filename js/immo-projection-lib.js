/**
 * Projection financière immobilière — coût de possession complet.
 * Prêt + taxe foncière + énergie (élec/gaz) + eau + charges + MRH + travaux
 * croisés avec revenus, apport et patrimoine.
 *
 * Navigateur + Node (module.exports).
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.ImmoProjection = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  /** €/m²/an estimés selon lettre DPE (ordre de grandeur ADEME / annonces) */
  var DPE_ENERGY_EUR_M2 = {
    A: 8,
    B: 12,
    C: 18,
    D: 28,
    E: 42,
    F: 58,
    G: 78,
  };

  /** Multiplicateur taxe foncière indicative / valeur du bien (annuel) selon type de zone */
  var TF_RATE = {
    idf: 0.0045,
    metro: 0.006,
    medium: 0.008,
    rural: 0.01,
    default: 0.007,
  };

  function round2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }

  function euro(n) {
    var v = round2(n);
    return (
      v.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + "\u00a0€"
    );
  }

  function euroDec(n) {
    return (
      round2(n).toLocaleString("fr-FR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }) + "\u00a0€"
    );
  }

  function pct(n) {
    return round2(n).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + "\u00a0%";
  }

  function toNum(v, fallback) {
    if (v == null || v === "") {
      return arguments.length > 1 ? fallback : 0;
    }
    if (typeof v === "number") return isFinite(v) ? v : arguments.length > 1 ? fallback : 0;
    var n = Number(String(v).replace(/\s/g, "").replace(",", "."));
    return isFinite(n) ? n : arguments.length > 1 ? fallback : 0;
  }

  function monthlyPayment(principal, annualRatePct, months) {
    var P = Math.max(0, toNum(principal));
    var n = Math.max(0, Math.round(toNum(months)));
    var r = toNum(annualRatePct) / 100 / 12;
    if (P <= 0 || n <= 0) return 0;
    if (r <= 0) return round2(P / n);
    var factor = Math.pow(1 + r, n);
    return round2((P * r * factor) / (factor - 1));
  }

  function zoneFromPostal(cp) {
    var s = String(cp || "").replace(/\D/g, "");
    if (s.length < 2) return "default";
    var dept = s.slice(0, 2);
    if (dept === "75" || dept === "92" || dept === "93" || dept === "94") return "idf";
    if (
      ["69", "13", "31", "33", "44", "59", "67", "06", "34", "35"].indexOf(dept) >= 0
    )
      return "metro";
    if (Number(dept) >= 1 && Number(dept) <= 95) return "medium";
    return "rural";
  }

  function estimateNotaryFees(prix, isNew) {
    var p = toNum(prix);
    if (p <= 0) return 0;
    return round2(p * (isNew ? 0.025 : 0.075));
  }

  function estimateTaxeFonciere(prix, postalCode, override) {
    if (override != null && override !== "") return round2(toNum(override));
    var rate = TF_RATE[zoneFromPostal(postalCode)] || TF_RATE.default;
    return round2(toNum(prix) * rate);
  }

  function estimateEnergyAnnual(opts) {
    opts = opts || {};
    if (opts.coutEnergieMin != null || opts.coutEnergieMax != null) {
      var a = toNum(opts.coutEnergieMin, null);
      var b = toNum(opts.coutEnergieMax, null);
      if (a != null && b != null) return round2((a + b) / 2);
      if (a != null) return round2(a);
      if (b != null) return round2(b);
    }
    var surface = Math.max(20, toNum(opts.surface, 70));
    var letter = String(opts.dpe || opts.consoEnergie || "D")
      .trim()
      .toUpperCase()
      .charAt(0);
    var perM2 = DPE_ENERGY_EUR_M2[letter] || DPE_ENERGY_EUR_M2.D;
    var chauffage = String(opts.chauffage || "").toLowerCase();
    var factor = 1;
    if (chauffage.indexOf("gaz") >= 0) factor = 1.05;
    if (chauffage.indexOf("élec") >= 0 || chauffage.indexOf("elec") >= 0) factor = 1.12;
    if (chauffage.indexOf("pompe") >= 0) factor = 0.85;
    return round2(surface * perM2 * factor);
  }

  function splitEnergy(annual, chauffage) {
    var total = toNum(annual);
    var ch = String(chauffage || "").toLowerCase();
    var gazShare = 0.35;
    if (ch.indexOf("gaz") >= 0) gazShare = 0.55;
    if (ch.indexOf("élec") >= 0 || ch.indexOf("elec") >= 0) gazShare = 0.05;
    if (ch.indexOf("pompe") >= 0) gazShare = 0.1;
    var gaz = round2(total * gazShare);
    return { electricite: round2(total - gaz), gaz: gaz };
  }

  function estimateWaterMonthly(personnes) {
    var n = Math.max(1, toNum(personnes, 2));
    return round2(18 + n * 9);
  }

  function estimateMrhMonthly(prix, surface) {
    var p = toNum(prix);
    var s = Math.max(30, toNum(surface, 70));
    return round2(Math.max(12, p * 0.00012 + s * 0.08) / 1);
  }

  function estimateChargesCopro(surface, type, override) {
    if (override != null && override !== "") return round2(toNum(override));
    var t = String(type || "").toLowerCase();
    if (t === "maison" || t === "terrain") return 0;
    var s = Math.max(20, toNum(surface, 65));
    return round2(s * 2.4);
  }

  /**
   * Entrée normalisée depuis un bien CRM (attrs / price).
   */
  function fromProperty(prop, extras) {
    prop = prop || {};
    extras = extras || {};
    var attrs = prop.attrs || prop.attributes || {};
    if (typeof attrs === "string") {
      try {
        attrs = JSON.parse(attrs) || {};
      } catch (e) {
        attrs = {};
      }
    }
    var prix = toNum(
      extras.prix != null
        ? extras.prix
        : prop.price_fai || prop.price_net || attrs.prix || 0
    );
    var surface = toNum(
      attrs.surface_habitable || attrs.surface || prop.surface || extras.surface,
      70
    );
    return {
      prix: prix,
      surface: surface,
      postalCode: prop.postal_code || attrs.cp || extras.postalCode || "",
      type: prop.property_type || attrs.type || "appartement",
      neuf: String(attrs.etat || extras.neuf || "").toLowerCase().indexOf("neuf") >= 0,
      taxeFonciereAn: toNum(attrs.taxe_fonciere, null),
      chargesMensuelles: toNum(
        attrs.charges_mensuelles || attrs.charges_copro,
        null
      ),
      coutEnergieMin: toNum(attrs.cout_energie_min, null),
      coutEnergieMax: toNum(attrs.cout_energie_max, null),
      dpe: attrs.conso_energie_primaire || attrs.conso_energie_finale || extras.dpe || "",
      chauffage: attrs.chauffage || "",
      travaux: toNum(attrs.budget_travaux || extras.travaux, 0),
      propertyId: prop.id || "",
    };
  }

  /**
   * Projection complète.
   * @param {object} input
   */
  function project(input) {
    input = input || {};
    var prix = toNum(input.prix);
    var travaux = toNum(input.travaux);
    var surface = Math.max(1, toNum(input.surface, 70));
    var postalCode = input.postalCode || input.cp || "";
    var type = input.type || "appartement";
    var neuf = !!input.neuf;
    var personnes = Math.max(
      1,
      toNum(input.personnes, 1 + (toNum(input.hasCo) ? 1 : 0) + toNum(input.enfantsNb))
    );

    var fraisNotaire =
      input.fraisNotaire != null && input.fraisNotaire !== ""
        ? toNum(input.fraisNotaire)
        : estimateNotaryFees(prix, neuf);
    var fraisGarantie = toNum(input.fraisGarantie, round2(prix * 0.012));
    var fraisDivers = toNum(input.fraisDivers);
    var coutProjet = round2(prix + travaux + fraisNotaire + fraisGarantie + fraisDivers);

    var patrimoine = toNum(input.patrimoine != null ? input.patrimoine : input.epargne);
    var apportSouhaite = toNum(input.apport);
    var apport = apportSouhaite;
    if (apport <= 0 && patrimoine > 0) {
      apport = round2(Math.min(patrimoine * 0.7, coutProjet * 0.3));
    }
    apport = Math.min(apport, coutProjet);
    var liquiditeResiduelle = round2(Math.max(0, patrimoine - apport));
    var aFinancer = Math.max(0, round2(coutProjet - apport));

    var dureeMois = Math.max(12, toNum(input.dureeMois, toNum(input.dureeAns, 25) * 12));
    var taux = toNum(input.taux, 3.5);
    var assurTaux = toNum(input.assuranceTaux, 0.34);
    var assurQuotite = toNum(input.assuranceQuotite, 100);
    var mensHa = monthlyPayment(aFinancer, taux, dureeMois);
    var mensAssur = round2(
      (aFinancer * assurTaux * assurQuotite) / 100 / 100 / 12
    );
    if (input.hasCo) {
      mensAssur = round2(
        mensAssur +
          (aFinancer *
            toNum(input.assuranceTauxCo, assurTaux) *
            toNum(input.assuranceQuotiteCo, 100)) /
            100 /
            100 /
            12
      );
    }
    var mensAc = round2(mensHa + mensAssur);

    var taxeFonciereAn = estimateTaxeFonciere(prix, postalCode, input.taxeFonciereAn);
    var taxeFonciereMens = round2(taxeFonciereAn / 12);

    var energieAn = estimateEnergyAnnual({
      surface: surface,
      dpe: input.dpe,
      consoEnergie: input.consoEnergie,
      chauffage: input.chauffage,
      coutEnergieMin: input.coutEnergieMin,
      coutEnergieMax: input.coutEnergieMax,
    });
    if (input.electriciteAn != null || input.gazAn != null) {
      energieAn = round2(toNum(input.electriciteAn) + toNum(input.gazAn));
    }
    var energySplit = splitEnergy(energieAn, input.chauffage);
    var elecMens =
      input.electriciteMens != null
        ? toNum(input.electriciteMens)
        : round2(energySplit.electricite / 12);
    var gazMens =
      input.gazMens != null ? toNum(input.gazMens) : round2(energySplit.gaz / 12);
    var eauMens =
      input.eauMens != null
        ? toNum(input.eauMens)
        : estimateWaterMonthly(personnes);
    var chargesMens = estimateChargesCopro(surface, type, input.chargesMensuelles);
    var mrhMens =
      input.mrhMens != null
        ? toNum(input.mrhMens)
        : estimateMrhMonthly(prix, surface);

    var travauxMensProvision = 0;
    if (travaux > 0 && input.travauxFinancesDansPret !== false) {
      /* déjà dans le prêt — provision entretien courante */
      travauxMensProvision = round2(Math.max(25, surface * 0.6));
    } else if (travaux > 0) {
      var moisTravaux = Math.max(12, toNum(input.travauxDureeMois, 36));
      travauxMensProvision = round2(travaux / moisTravaux);
    } else {
      travauxMensProvision = round2(Math.max(25, surface * 0.6));
    }

    var coutPossessionMens = round2(
      taxeFonciereMens +
        elecMens +
        gazMens +
        eauMens +
        chargesMens +
        mrhMens +
        travauxMensProvision
    );
    var coutLogementMens = round2(mensAc + coutPossessionMens);

    var salaire = toNum(input.salaire != null ? input.salaire : input.revenus);
    var salaireCo = toNum(input.salaireCo);
    var autresRevenus = toNum(input.autresRevenus);
    var totalRevenus = round2(salaire + salaireCo + autresRevenus);

    var loyerActuel = toNum(input.loyerActuel);
    var autresCharges = toNum(input.autresCharges);
    var creditsExistants = toNum(input.creditsExistants);

    var chargesBanque = round2(mensAc + creditsExistants);
    var chargesReelles = round2(
      mensAc + coutPossessionMens + creditsExistants + autresCharges
    );
    /* Loyer disparaît souvent à l'achat RP — on ne le garde pas dans charges après */
    var dtiBanque =
      totalRevenus > 0 ? round2((chargesBanque / totalRevenus) * 100) : 0;
    var dtiReel =
      totalRevenus > 0 ? round2((chargesReelles / totalRevenus) * 100) : 0;
    var rav = round2(totalRevenus - chargesReelles);
    var ravPers = round2(rav / personnes);
    var effortBudget =
      totalRevenus > 0 ? round2((coutLogementMens / totalRevenus) * 100) : 0;

    var deltaVsLoyer =
      loyerActuel > 0 ? round2(coutLogementMens - loyerActuel) : null;

    var stressTaux = null;
    var stressEnergie = null;
    if (!input._stress) {
      stressTaux = projectStress(input, { taux: taux + 1 });
      stressEnergie = {
        coutLogementMens: round2(
          mensAc +
            taxeFonciereMens +
            elecMens * 1.25 +
            gazMens * 1.25 +
            eauMens +
            chargesMens +
            mrhMens +
            travauxMensProvision
        ),
      };
    }

    var verdict = verdictFrom({
      dtiBanque: dtiBanque,
      dtiReel: dtiReel,
      ravPers: ravPers,
      liquiditeResiduelle: liquiditeResiduelle,
      apport: apport,
      coutProjet: coutProjet,
    });

    var flags = [];
    if (apport < fraisNotaire + fraisGarantie) {
      flags.push({
        level: "warn",
        text: "Apport inférieur aux frais d'acquisition — banques souvent exigeantes.",
      });
    }
    if (liquiditeResiduelle < mensAc * 3) {
      flags.push({
        level: "warn",
        text: "Épargne de précaution faible après apport (< 3 mensualités).",
      });
    }
    if (dtiBanque > 35) {
      flags.push({
        level: "alert",
        text: "Endettement bancaire > 35 % (seuil HCSF fréquent).",
      });
    } else if (dtiReel > 45) {
      flags.push({
        level: "warn",
        text: "Charges réelles élevées une fois taxe foncière et énergie incluses.",
      });
    }
    if (deltaVsLoyer != null && deltaVsLoyer > 200) {
      flags.push({
        level: "info",
        text:
          "Le logement coûterait environ " +
          euro(deltaVsLoyer) +
          "/mois de plus que votre loyer actuel.",
      });
    } else if (deltaVsLoyer != null && deltaVsLoyer < -50) {
      flags.push({
        level: "ok",
        text:
          "Effort mensuel estimé inférieur au loyer actuel (~" +
          euro(Math.abs(deltaVsLoyer)) +
          ").",
      });
    }

    return {
      inputs: {
        prix: prix,
        travaux: travaux,
        surface: surface,
        postalCode: postalCode,
        type: type,
        neuf: neuf,
        personnes: personnes,
        dpe: input.dpe || "",
      },
      acquisition: {
        fraisNotaire: fraisNotaire,
        fraisGarantie: fraisGarantie,
        fraisDivers: fraisDivers,
        coutProjet: coutProjet,
        apport: apport,
        patrimoine: patrimoine,
        liquiditeResiduelle: liquiditeResiduelle,
        aFinancer: aFinancer,
        apportPct: coutProjet > 0 ? round2((apport / coutProjet) * 100) : 0,
      },
      credit: {
        dureeMois: dureeMois,
        taux: taux,
        mensHa: mensHa,
        mensAssur: mensAssur,
        mensAc: mensAc,
        coutCreditTotal: round2(mensAc * dureeMois),
        interetsEstimes: round2(mensHa * dureeMois - aFinancer),
      },
      possession: {
        taxeFonciereAn: taxeFonciereAn,
        taxeFonciereMens: taxeFonciereMens,
        electriciteMens: elecMens,
        gazMens: gazMens,
        eauMens: eauMens,
        chargesMens: chargesMens,
        mrhMens: mrhMens,
        travauxMensProvision: travauxMensProvision,
        energieAn: energieAn,
        coutPossessionMens: coutPossessionMens,
        coutLogementMens: coutLogementMens,
        estimates: {
          taxeFonciere:
            input.taxeFonciereAn == null || input.taxeFonciereAn === "",
          energie:
            input.electriciteMens == null &&
            input.gazMens == null &&
            input.coutEnergieMin == null &&
            input.coutEnergieMax == null,
          eau: input.eauMens == null || input.eauMens === "",
          charges:
            input.chargesMensuelles == null || input.chargesMensuelles === "",
          mrh: input.mrhMens == null || input.mrhMens === "",
        },
      },
      budget: {
        totalRevenus: totalRevenus,
        chargesBanque: chargesBanque,
        chargesReelles: chargesReelles,
        dtiBanque: dtiBanque,
        dtiReel: dtiReel,
        rav: rav,
        ravPers: ravPers,
        effortBudget: effortBudget,
        loyerActuel: loyerActuel,
        deltaVsLoyer: deltaVsLoyer,
        creditsExistants: creditsExistants,
      },
      stress: {
        tauxPlus1: stressTaux
          ? {
              mensAc: stressTaux.credit.mensAc,
              coutLogementMens: stressTaux.possession.coutLogementMens,
              dtiBanque: stressTaux.budget.dtiBanque,
              dtiReel: stressTaux.budget.dtiReel,
              rav: stressTaux.budget.rav,
            }
          : null,
        energiePlus25: stressEnergie,
      },
      verdict: verdict,
      flags: flags,
    };
  }

  function projectStress(base, overrides) {
    var copy = {};
    Object.keys(base || {}).forEach(function (k) {
      copy[k] = base[k];
    });
    Object.keys(overrides || {}).forEach(function (k) {
      copy[k] = overrides[k];
    });
    copy._stress = true;
    return project(copy);
  }

  function verdictFrom(o) {
    if (o.dtiBanque > 40 || o.ravPers < 200) {
      return {
        id: "hors",
        label: "Hors budget probable",
        detail:
          "Les ratios dépassent les seuils bancaires ou le reste à vivre par personne est trop bas.",
      };
    }
    if (o.dtiBanque > 35 || o.dtiReel > 48 || o.ravPers < 400) {
      return {
        id: "vigilance",
        label: "Budget tendu",
        detail:
          "Finançable sous conditions : optimiser apport, durée, ou cibler un bien moins cher / moins énergivore.",
      };
    }
    if (o.liquiditeResiduelle < o.apport * 0.1 && o.apport > 0) {
      return {
        id: "vigilance",
        label: "OK crédit, trésorerie serrée",
        detail:
          "Le prêt passe, mais gardez une réserve après apport (imprévus, déménagement).",
      };
    }
    return {
      id: "ok",
      label: "Projection confortable",
      detail:
        "Endettement et reste à vivre cohérents avec une acquisition durable (indicatif).",
    };
  }

  /** Breakdown pour graphiques / UI */
  function breakdownMensuel(result) {
    if (!result) return [];
    var c = result.credit;
    var p = result.possession;
    return [
      { id: "pret", label: "Mensualité prêt (H.A.)", value: c.mensHa, color: "#1e4f8a" },
      { id: "ade", label: "Assurance emprunteur", value: c.mensAssur, color: "#0891b2" },
      { id: "tf", label: "Taxe foncière", value: p.taxeFonciereMens, color: "#ea580c" },
      { id: "elec", label: "Électricité", value: p.electriciteMens, color: "#ca8a04" },
      { id: "gaz", label: "Gaz", value: p.gazMens, color: "#dc2626" },
      { id: "eau", label: "Eau", value: p.eauMens, color: "#2563eb" },
      { id: "copro", label: "Charges / copro", value: p.chargesMens, color: "#7c3aed" },
      { id: "mrh", label: "Assurance habitation", value: p.mrhMens, color: "#059669" },
      {
        id: "travaux",
        label: "Provision entretien / travaux",
        value: p.travauxMensProvision,
        color: "#64748b",
      },
    ].filter(function (x) {
      return x.value > 0;
    });
  }

  return {
    DPE_ENERGY_EUR_M2: DPE_ENERGY_EUR_M2,
    round2: round2,
    euro: euro,
    euroDec: euroDec,
    pct: pct,
    toNum: toNum,
    monthlyPayment: monthlyPayment,
    zoneFromPostal: zoneFromPostal,
    estimateNotaryFees: estimateNotaryFees,
    estimateTaxeFonciere: estimateTaxeFonciere,
    estimateEnergyAnnual: estimateEnergyAnnual,
    estimateWaterMonthly: estimateWaterMonthly,
    estimateMrhMonthly: estimateMrhMonthly,
    estimateChargesCopro: estimateChargesCopro,
    fromProperty: fromProperty,
    project: project,
    breakdownMensuel: breakdownMensuel,
  };
});
