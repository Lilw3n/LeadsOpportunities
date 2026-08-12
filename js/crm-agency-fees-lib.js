/**
 * Barèmes d'honoraires immobiliers — multi-agences, tranches % / fixe, part agent.
 * Stockage local (navigateur).
 */
window.CrmAgencyFees = (function () {
  var STORAGE_KEY = "lo_agency_fee_schedules_v1";
  /** v5 = guérir Portes Clés corrompu (4 lignes %) → 23 forfaits TG0422 à chaque load. */
  var DATA_VERSION = 5;
  var DEAL_SPLIT_KEY = "lo_agency_fee_deal_split_v1";

  /**
   * Rôles mandat (vocabulaire métier FR — pas une règle PDF).
   * sortant = mandat vendeur ; entrant = amène l'acquéreur ; both = les deux.
   */
  var DEAL_ROLES = [
    {
      id: "both",
      label: "Je suis entrant + sortant (solo)",
      desc: "Mandat vendeur et acquéreur amené par toi → 100 % de la masse négociateurs.",
    },
    {
      id: "sortant",
      label: "Je suis sortant (mandat vendeur)",
      desc: "Tu as le mandat ; un autre négociateur amène l'acheteur.",
    },
    {
      id: "entrant",
      label: "Je suis entrant (acquéreur)",
      desc: "Un autre a le mandat vendeur ; tu amènes l'acheteur.",
    },
  ];

  function defaultDealSplit() {
    return {
      myRole: "both",
      // Répartition de la masse agents — à caler selon mandat / usage réseau (pas figé dans TG0422).
      sortantPct: 50,
      entrantPct: 50,
      otherAgentName: "",
      apporteurEnabled: false,
      apporteurName: "",
      apporteurSide: "vendeur",
      apporteurPct: 0,
      apporteurBase: "my_share",
      apporteurPaidFrom: "my_share",
      otherCollabEnabled: false,
      otherCollabName: "",
      otherCollabPct: 0,
      otherCollabBase: "my_share",
      otherCollabPaidFrom: "my_share",
    };
  }

  function loadDealSplit() {
    try {
      var raw = localStorage.getItem(DEAL_SPLIT_KEY);
      var p = raw ? JSON.parse(raw) : {};
      return Object.assign(defaultDealSplit(), p && typeof p === "object" ? p : {});
    } catch (e) {
      return defaultDealSplit();
    }
  }

  function saveDealSplit(prefs) {
    localStorage.setItem(
      DEAL_SPLIT_KEY,
      JSON.stringify(Object.assign(defaultDealSplit(), prefs || {}, { savedAt: new Date().toISOString() }))
    );
  }

  /**
   * Cascade rémunération (sans inventer de % réseau) :
   * honoraires agence → part agence/réseau vs masse négo (agentSharePct)
   * → partage sortant/entrant sur la masse → éventuel apporteur → charges AE.
   *
   * @param {number} agencyFee
   * @param {number} agentSharePct — déjà paramétré par agence (ex. 85 Portes Clés, 40 Laforêt)
   * @param {object} deal — loadDealSplit() + overrides
   * @param {object} taxOpts — chargesPct, cfePct, accountingPct…
   */
  function splitDealRemuneration(agencyFee, agentSharePct, deal, taxOpts) {
    var fee = round2(Number(agencyFee) || 0);
    var sharePct = Math.max(0, Math.min(100, Number(agentSharePct) || 0));
    var d = Object.assign(defaultDealSplit(), deal || {});
    var myRole = d.myRole === "sortant" || d.myRole === "entrant" ? d.myRole : "both";

    var agencyKeep = round2((fee * (100 - sharePct)) / 100);
    var agentMass = round2((fee * sharePct) / 100);

    var sortantPct = Math.max(0, Math.min(100, Number(d.sortantPct) || 0));
    var entrantPct = Math.max(0, Math.min(100, Number(d.entrantPct) || 0));
    // Si partagé et sommes ≠ 100, on normalise pour rester cohérent
    if (myRole !== "both") {
      var sum = sortantPct + entrantPct;
      if (sum > 0 && Math.abs(sum - 100) > 0.05) {
        sortantPct = round2((sortantPct / sum) * 100);
        entrantPct = round2(100 - sortantPct);
      } else if (sum <= 0) {
        sortantPct = 50;
        entrantPct = 50;
      }
    }

    var sortantGross = myRole === "both" ? agentMass : round2((agentMass * sortantPct) / 100);
    var entrantGross = myRole === "both" ? 0 : round2((agentMass * entrantPct) / 100);
    if (myRole === "both") {
      entrantGross = 0;
      sortantGross = agentMass;
    }

    var myGrossBeforeApp =
      myRole === "both" ? agentMass : myRole === "sortant" ? sortantGross : entrantGross;
    var otherGross = myRole === "both" ? 0 : myRole === "sortant" ? entrantGross : sortantGross;

    // Apporteur / autre collab — % saisis (0 par défaut). Pas de % inventés.
    function buildSideFee(enabled, pctRaw, baseKey, paidFromKey, name, side) {
      if (!enabled || !(Number(pctRaw) > 0)) return null;
      var pct = Number(pctRaw) || 0;
      var baseAmt =
        baseKey === "agency_fee" ? fee : baseKey === "agent_mass" ? agentMass : myGrossBeforeApp;
      return {
        name: String(name || "Collaborateur"),
        side: side || "",
        pct: pct,
        base: baseKey || "my_share",
        baseAmount: round2(baseAmt),
        amount: round2((baseAmt * pct) / 100),
        paidFrom: paidFromKey || "my_share",
      };
    }

    function applySideCut(detail, state) {
      if (!detail || !(detail.amount > 0)) return state;
      var amt = detail.amount;
      if (detail.paidFrom === "agency") {
        state.agencyKeepAfter = round2(Math.max(0, state.agencyKeepAfter - amt));
      } else if (detail.paidFrom === "agent_mass") {
        if (agentMass > 0) {
          var myCut = round2(amt * (myGrossBeforeApp / agentMass));
          var otherCut = round2(amt - myCut);
          state.myGross = round2(Math.max(0, state.myGross - myCut));
          state.otherGrossAfter = round2(Math.max(0, state.otherGrossAfter - otherCut));
        }
      } else {
        state.myGross = round2(Math.max(0, state.myGross - amt));
      }
      return state;
    }

    var appDetail = buildSideFee(
      d.apporteurEnabled,
      d.apporteurPct,
      d.apporteurBase,
      d.apporteurPaidFrom,
      d.apporteurName || "Apporteur",
      d.apporteurSide || "vendeur"
    );
    var collabDetail = buildSideFee(
      d.otherCollabEnabled,
      d.otherCollabPct,
      d.otherCollabBase,
      d.otherCollabPaidFrom,
      d.otherCollabName || "Autre collaborateur",
      "collab"
    );

    var cutState = {
      myGross: myGrossBeforeApp,
      agencyKeepAfter: agencyKeep,
      otherGrossAfter: otherGross,
    };
    cutState = applySideCut(appDetail, cutState);
    cutState = applySideCut(collabDetail, cutState);
    var myGross = cutState.myGross;
    var agencyKeepAfter = cutState.agencyKeepAfter;
    var otherGrossAfter = cutState.otherGrossAfter;

    taxOpts = taxOpts || {};
    var chargesPct =
      taxOpts.chargesPct != null && taxOpts.chargesPct !== ""
        ? Number(taxOpts.chargesPct) || 0
        : (Number(taxOpts.urssafPct) || 0) + (Number(taxOpts.irPct) || 0);
    var cfePct = taxOpts.cfePct != null ? Number(taxOpts.cfePct) : 0.5;
    var accountingPct = taxOpts.accountingPct != null ? Number(taxOpts.accountingPct) : 1;
    var urssafReserve = round2((myGross * chargesPct) / 100);
    var cfeReserve = round2((myGross * cfePct) / 100);
    var accountingReserve = round2((myGross * accountingPct) / 100);
    var charges = round2(urssafReserve + cfeReserve + accountingReserve);
    var myNet = round2(Math.max(0, myGross - charges));

    var steps = [
      {
        id: "agency_fee",
        label: "Honoraires agence (barème)",
        value: fee,
        detail: "Issu du barème (ex. TG0422) — prix max. négociable au mandat.",
      },
      {
        id: "agency_keep",
        label: "Part agence / réseau (" + (100 - sharePct) + " %)",
        value: agencyKeepAfter,
        detail: "Complément de ta part négociateur paramétrée sur l'agence.",
      },
      {
        id: "agent_mass",
        label: "Masse négociateurs (" + sharePct + " %)",
        value: agentMass,
        detail: "À répartir entre sortant / entrant selon qui a fait quoi.",
      },
    ];
    if (myRole === "both") {
      steps.push({
        id: "solo",
        label: "Toi (entrant + sortant)",
        value: myGrossBeforeApp,
        detail: "100 % de la masse — mandat et acquéreur.",
      });
    } else {
      steps.push({
        id: "sortant",
        label: "Sortant (mandat vendeur) — " + sortantPct + " %",
        value: sortantGross,
        detail: myRole === "sortant" ? "Ta case." : d.otherAgentName || "Autre négociateur",
      });
      steps.push({
        id: "entrant",
        label: "Entrant (acquéreur) — " + entrantPct + " %",
        value: entrantGross,
        detail: myRole === "entrant" ? "Ta case." : d.otherAgentName || "Autre négociateur",
      });
    }
    if (appDetail) {
      steps.push({
        id: "apporteur",
        label: "Apporteur « " + appDetail.name + " » (" + appDetail.pct + " %)",
        value: appDetail.amount,
        detail:
          "Côté " +
          appDetail.side +
          " · base " +
          appDetail.base +
          " · prélevé sur " +
          appDetail.paidFrom +
          " (saisie manuelle type CRM apporteur).",
      });
    }
    if (collabDetail) {
      steps.push({
        id: "other_collab",
        label: "Collaborateur « " + collabDetail.name + " » (" + collabDetail.pct + " %)",
        value: collabDetail.amount,
        detail: "Notaire / partenaire / autre — % saisi, pas une règle barème.",
      });
    }
    steps.push({
      id: "my_gross",
      label: "Ta rémunération brute",
      value: myGross,
      detail: "Après partage et collabs éventuels — avant réserves URSSAF/CFE/compta.",
    });
    steps.push({
      id: "my_net",
      label: "Dans ta poche (estim.)",
      value: myNet,
      detail: "Après charges " + chargesPct + " % + CFE + compta.",
    });

    return {
      myRole: myRole,
      agencyFee: fee,
      agentSharePct: sharePct,
      agencyKeep: agencyKeepAfter,
      agentMass: agentMass,
      sortantPct: sortantPct,
      entrantPct: entrantPct,
      sortantGross: round2(sortantGross),
      entrantGross: round2(entrantGross),
      myGrossBeforeApporteur: round2(myGrossBeforeApp),
      otherGross: round2(otherGrossAfter),
      apporteur: appDetail,
      otherCollab: collabDetail,
      myGross: myGross,
      chargesPct: chargesPct,
      cfePct: cfePct,
      accountingPct: accountingPct,
      urssafReserve: urssafReserve,
      cfeReserve: cfeReserve,
      accountingReserve: accountingReserve,
      charges: charges,
      myNet: myNet,
      steps: steps,
    };
  }

  var DEFAULT_CHARGES_PCT = 22;
  var DEFAULT_URSSAF_PCT = 21.2;
  var DEFAULT_IR_PCT = 2.2;
  var VAT_RATE = 0.2;
  var TAX_PREFS_KEY = "lo_agency_fee_tax_prefs_v1";

  /** Presets micro-entreprise France (ordres de grandeur, ajustables). */
  var TAX_PRESETS = [
    { id: "custom_22", label: "Mon taux 22 % (perso)", chargesPct: 22, urssafPct: 22, irPct: 0 },
    { id: "services_urssaf", label: "Services BIC — URSSAF seul (~21,2 %)", chargesPct: 21.2, urssafPct: 21.2, irPct: 0 },
    { id: "services_vl", label: "Services BIC + versement libératoire (~23,4 %)", chargesPct: 23.4, urssafPct: 21.2, irPct: 2.2 },
    { id: "bnc_vl", label: "BNC libéral + VL (~25,2 %)", chargesPct: 25.2, urssafPct: 23.1, irPct: 2.1 },
    { id: "commerce", label: "Vente de marchandises (~12,3 %)", chargesPct: 12.3, urssafPct: 12.3, irPct: 0 },
    { id: "custom", label: "Personnalisé (saisie libre)", chargesPct: null, urssafPct: null, irPct: null },
  ];

  function uid(prefix) {
    return (prefix || "id") + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
  }

  function br(min, max, type, value) {
    return { id: uid("br"), min: min, max: max, type: type, value: value };
  }

  function laforetSaleBrackets() {
    return [
      br(0, 50000, "fixed", 5000),
      br(50001, 120000, "percent", 11),
      br(120001, 170000, "percent", 10),
      br(170001, 220000, "percent", 9),
      br(220001, 300000, "percent", 8),
      br(300001, null, "percent", 7),
    ];
  }

  /**
   * Barème TG0422 officiel — Immobilier Email SAS / Les Portes Clés
   * Source : data/bareme-portecles-TG0422.pdf
   * Vente habitation : forfait TTC sur prix hors honoraires (net vendeur).
   */
  function portesClesHabitationBrackets() {
    return [
      br(0, 20000, "fixed", 5000),
      br(20001, 40000, "fixed", 5000),
      br(40001, 70000, "fixed", 5000),
      br(70001, 100000, "fixed", 7000),
      br(100001, 150000, "fixed", 9000),
      br(150001, 200000, "fixed", 10000),
      br(200001, 250000, "fixed", 12000),
      br(250001, 300000, "fixed", 15000),
      br(300001, 350000, "fixed", 18000),
      br(350001, 400000, "fixed", 21000),
      br(400001, 450000, "fixed", 24000),
      br(450001, 500000, "fixed", 27000),
      br(500001, 550000, "fixed", 30000),
      br(550001, 600000, "fixed", 33000),
      br(600001, 650000, "fixed", 36000),
      br(650001, 700000, "fixed", 39000),
      br(700001, 750000, "fixed", 42000),
      br(750001, 800000, "fixed", 45000),
      br(800001, 850000, "fixed", 48000),
      br(850001, 900000, "fixed", 51000),
      br(900001, 950000, "fixed", 54000),
      br(950001, 1000000, "fixed", 57000),
      br(1000001, null, "percent", 6),
    ];
  }

  function portesClesAgency() {
    return {
      id: "agency_portes_cles",
      name: "Les Portes Clés de l'Immobilier",
      agentSharePct: 85,
      notes:
        "Barème des honoraires TTC TG0422 — Immobilier Email SAS (46 quai Jacoutot, 67000 Strasbourg). Honoraires = prix maximums sur prix hors honoraires ; négociables au mandat. PDF : data/bareme-portecles-TG0422.pdf",
      schedules: [
        {
          id: "sched_pc_habitation",
          name: "Vente habitation (forfait TTC)",
          kind: "vente_habitation",
          feeModel: "brackets",
          priceBasis: "net_vendeur",
          brackets: portesClesHabitationBrackets(),
        },
        {
          id: "sched_pc_pro",
          name: "Terrains / bureaux / commerces / immeubles",
          kind: "vente_pro",
          feeModel: "brackets",
          priceBasis: "net_vendeur",
          // PDF : « Pour toutes les tranches 10% TTC » — aucun minimum HT
          brackets: [br(0, null, "percent", 10)],
        },
        {
          id: "sched_pc_bail_com",
          name: "Bail commercial (30 % HT loyer annuel)",
          kind: "bail_commercial",
          feeModel: "annual_rent_percent",
          priceBasis: "loyer_annuel",
          percentValue: 30,
          percentTax: "ht",
          brackets: [],
        },
        {
          id: "sched_pc_loc_hab",
          name: "Location habitation (€ TTC / m²)",
          kind: "location_habitation",
          feeModel: "per_sqm_rental",
          priceBasis: "surface_habitable",
          perSqm: {
            negotiation: 6,
            edl: 3,
            dossier: { tres_tendue: 12, tendue: 10, hors_zone: 8 },
          },
          brackets: [],
        },
        {
          id: "sched_pc_loc_pro",
          name: "Location pro / commercial (18 % TTC)",
          kind: "location_pro",
          feeModel: "annual_rent_percent",
          priceBasis: "loyer_annuel",
          percentValue: 18,
          percentTax: "ttc",
          brackets: [],
        },
        {
          id: "sched_pc_avis",
          name: "Avis de valeur (360 € TTC ou devis)",
          kind: "avis_valeur",
          feeModel: "fixed_fee",
          priceBasis: "forfait",
          fixedFee: 360,
          notes: "Maison < 100 m² ou appart < 50 m² : 360 € TTC. Autres biens : sur devis.",
          brackets: [],
        },
      ],
      updatedAt: new Date().toISOString(),
    };
  }

  function defaultAgencies() {
    // Portes Clés (PDF TG0422) en premier — c'est le barème de référence à afficher.
    return [portesClesAgency(), {
      id: "agency_laforet",
      name: "Laforêt",
      agentSharePct: 40,
      notes: "Barème honoraires ventes TTC (réf. juillet 2023) — modifiable.",
      schedules: [
        {
          id: "sched_laforet_vente",
          name: "Honoraires sur les ventes",
          kind: "vente_habitation",
          priceBasis: "prix_vente",
          brackets: laforetSaleBrackets(),
        },
        {
          id: "sched_laforet_garage",
          name: "Garage / Parking",
          kind: "garage",
          priceBasis: "prix_vente",
          brackets: [br(0, null, "fixed", 2500)],
        },
      ],
      updatedAt: new Date().toISOString(),
    }];
  }

  function normalizeBracket(b) {
    var type = b.type === "fixed" ? "fixed" : "percent";
    var max = b.max;
    if (max === "" || max === undefined || max === null) max = null;
    else max = Number(max);
    return {
      id: String(b.id || uid("br")),
      min: Number(b.min) || 0,
      max: max != null && !isNaN(max) ? max : null,
      type: type,
      value: Number(b.value) || 0,
    };
  }

  function normalizePerSqm(ps) {
    if (!ps || typeof ps !== "object") {
      return {
        negotiation: 6,
        edl: 3,
        dossier: { tres_tendue: 12, tendue: 10, hors_zone: 8 },
      };
    }
    var d = ps.dossier || {};
    return {
      negotiation: Number(ps.negotiation) || 0,
      edl: Number(ps.edl) || 0,
      dossier: {
        tres_tendue: Number(d.tres_tendue) || 0,
        tendue: Number(d.tendue) || 0,
        hors_zone: Number(d.hors_zone) || 0,
      },
    };
  }

  function normalizeSchedule(s) {
    var minFeeHt = s.minFeeHt;
    if (minFeeHt === "" || minFeeHt == null) minFeeHt = null;
    else minFeeHt = Number(minFeeHt);
    var feeModel = s.feeModel || "brackets";
    if (
      feeModel !== "annual_rent_percent" &&
      feeModel !== "per_sqm_rental" &&
      feeModel !== "fixed_fee"
    ) {
      feeModel = "brackets";
    }
    var basis = s.priceBasis || "prix_vente";
    var allowedBasis = {
      net_vendeur: 1,
      prix_vente: 1,
      loyer_annuel: 1,
      surface_habitable: 1,
      forfait: 1,
    };
    if (!allowedBasis[basis]) basis = "prix_vente";
    var out = {
      id: String(s.id || uid("sched")),
      name: String(s.name || "Barème").trim() || "Barème",
      kind: String(s.kind || "vente_habitation"),
      feeModel: feeModel,
      priceBasis: basis,
      minFeeHt: minFeeHt != null && !isNaN(minFeeHt) ? minFeeHt : null,
      percentValue: s.percentValue != null ? Number(s.percentValue) : null,
      percentTax: s.percentTax === "ht" ? "ht" : s.percentTax === "ttc" ? "ttc" : null,
      fixedFee: s.fixedFee != null ? Number(s.fixedFee) : null,
      notes: String(s.notes || ""),
      brackets: Array.isArray(s.brackets) ? s.brackets.map(normalizeBracket) : [],
    };
    if (feeModel === "per_sqm_rental") out.perSqm = normalizePerSqm(s.perSqm);
    return out;
  }

  function normalizeAgency(a) {
    return {
      id: String(a.id || uid("agency")),
      name: String(a.name || "Agence").trim() || "Agence",
      agentSharePct: Math.max(0, Math.min(100, Number(a.agentSharePct) || 0)),
      notes: String(a.notes || ""),
      schedules: Array.isArray(a.schedules) ? a.schedules.map(normalizeSchedule) : [],
      updatedAt: a.updatedAt || new Date().toISOString(),
    };
  }

  function upsertPortesClesOfficialInBag(bag) {
    var pc = portesClesAgency();
    var idx = (bag.agencies || []).findIndex(function (a) {
      return a.id === "agency_portes_cles" || /portes?\s*cl[eé]s/i.test(a.name || "");
    });
    if (idx >= 0) {
      var keepShare = bag.agencies[idx].agentSharePct;
      bag.agencies[idx] = normalizeAgency(
        Object.assign({}, pc, {
          agentSharePct: keepShare != null ? keepShare : pc.agentSharePct,
        })
      );
    } else {
      bag.agencies.push(normalizeAgency(pc));
    }
  }

  /** True si l'agence Portes Clés a bien les 23 forfaits TG0422 (+ autres barèmes PDF). */
  function isPortesClesTg0422Complete(agency) {
    if (!agency) return false;
    var hab = (agency.schedules || []).find(function (s) {
      return s.kind === "vente_habitation";
    });
    if (!hab || !Array.isArray(hab.brackets) || hab.brackets.length < 23) return false;
    var fixed = hab.brackets.filter(function (b) {
      return b.type === "fixed";
    });
    if (fixed.length < 22) return false;
    // Spot-check PDF : 0–20k = 5000, 150001–200000 = 10000, dernière = 6 %
    var b0 = hab.brackets.slice().sort(function (a, b) {
      return (a.min || 0) - (b.min || 0);
    })[0];
    var mid = hab.brackets.find(function (b) {
      return Number(b.min) === 150001;
    });
    var last = hab.brackets.find(function (b) {
      return b.max == null;
    });
    if (!b0 || Number(b0.value) !== 5000 || b0.type !== "fixed") return false;
    if (!mid || Number(mid.value) !== 10000 || mid.type !== "fixed") return false;
    if (!last || last.type !== "percent" || Number(last.value) !== 6) return false;
    var kinds = {};
    (agency.schedules || []).forEach(function (s) {
      kinds[s.kind] = 1;
    });
    return !!(kinds.vente_pro && kinds.bail_commercial && kinds.location_habitation);
  }

  function healPortesClesIfNeeded(bag) {
    var idx = (bag.agencies || []).findIndex(function (a) {
      return a.id === "agency_portes_cles" || /portes?\s*cl[eé]s/i.test(a.name || "");
    });
    var pc = idx >= 0 ? bag.agencies[idx] : null;
    if (!isPortesClesTg0422Complete(pc)) {
      upsertPortesClesOfficialInBag(bag);
      bag.agencies = (bag.agencies || []).slice().sort(function (a, b) {
        var ap = a.id === "agency_portes_cles" || /portes?\s*cl[eé]s/i.test(a.name || "") ? 0 : 1;
        var bp = b.id === "agency_portes_cles" || /portes?\s*cl[eé]s/i.test(b.name || "") ? 0 : 1;
        return ap - bp;
      });
      bag.version = DATA_VERSION;
      save(bag);
      return true;
    }
    return false;
  }

  function migrate(bag) {
    var ver = Number(bag.version) || 1;
    if (ver < 2) {
      upsertPortesClesOfficialInBag(bag);
      bag.version = 2;
      save(bag);
      ver = 2;
    }
    if (ver < 3) {
      upsertPortesClesOfficialInBag(bag);
      bag.version = 3;
      save(bag);
      ver = 3;
    }
    if (ver < 4) {
      upsertPortesClesOfficialInBag(bag);
      bag.agencies = (bag.agencies || []).slice().sort(function (a, b) {
        var ap = a.id === "agency_portes_cles" || /portes?\s*cl[eé]s/i.test(a.name || "") ? 0 : 1;
        var bp = b.id === "agency_portes_cles" || /portes?\s*cl[eé]s/i.test(b.name || "") ? 0 : 1;
        return ap - bp;
      });
      bag.version = 4;
      save(bag);
      ver = 4;
    }
    if (ver < 5) {
      // Guérit les caches avec Portes Clés « exemple » 4 lignes % au lieu du PDF.
      upsertPortesClesOfficialInBag(bag);
      bag.agencies = (bag.agencies || []).slice().sort(function (a, b) {
        var ap = a.id === "agency_portes_cles" || /portes?\s*cl[eé]s/i.test(a.name || "") ? 0 : 1;
        var bp = b.id === "agency_portes_cles" || /portes?\s*cl[eé]s/i.test(b.name || "") ? 0 : 1;
        return ap - bp;
      });
      bag.version = 5;
      save(bag);
    }
    // Toujours vérifier le contenu (même si version déjà à jour).
    healPortesClesIfNeeded(bag);
    return bag;
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        var seed = { agencies: defaultAgencies(), version: DATA_VERSION };
        save(seed);
        return seed;
      }
      var bag = JSON.parse(raw);
      if (!bag || typeof bag !== "object") bag = {};
      if (!Array.isArray(bag.agencies) || !bag.agencies.length) {
        bag.agencies = defaultAgencies();
        bag.version = DATA_VERSION;
        save(bag);
      } else {
        bag.agencies = bag.agencies.map(normalizeAgency);
        bag = migrate(bag);
      }
      bag.version = bag.version || DATA_VERSION;
      return bag;
    } catch (e) {
      return { agencies: defaultAgencies(), version: DATA_VERSION };
    }
  }

  function save(bag) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: bag.version || DATA_VERSION,
        agencies: (bag.agencies || []).map(normalizeAgency),
        savedAt: new Date().toISOString(),
      })
    );
  }

  function listAgencies() {
    return load().agencies.slice();
  }

  function getAgency(id) {
    return (
      listAgencies().find(function (a) {
        return a.id === id;
      }) || null
    );
  }

  function upsertAgency(agency) {
    var bag = load();
    var next = normalizeAgency(Object.assign({}, agency, { updatedAt: new Date().toISOString() }));
    var idx = bag.agencies.findIndex(function (a) {
      return a.id === next.id;
    });
    if (idx >= 0) bag.agencies[idx] = next;
    else bag.agencies.push(next);
    save(bag);
    return next;
  }

  function deleteAgency(id) {
    var bag = load();
    bag.agencies = bag.agencies.filter(function (a) {
      return a.id !== id;
    });
    save(bag);
  }

  function resetDefaults() {
    var bag = { agencies: defaultAgencies(), version: DATA_VERSION };
    save(bag);
    return bag;
  }

  function applyPortesClesOfficial(keepSharePct) {
    var pc = portesClesAgency();
    if (keepSharePct != null) pc.agentSharePct = Number(keepSharePct) || pc.agentSharePct;
    return upsertAgency(pc);
  }

  function findBracket(brackets, price) {
    var p = Number(price) || 0;
    var list = (brackets || []).slice().sort(function (a, b) {
      return (a.min || 0) - (b.min || 0);
    });
    for (var i = 0; i < list.length; i++) {
      var b = list[i];
      var min = Number(b.min) || 0;
      var max = b.max == null ? Infinity : Number(b.max);
      if (p >= min && p <= max) return b;
    }
    return list.length ? list[list.length - 1] : null;
  }

  function agencyFeeFromBracket(price, bracket) {
    if (!bracket) return 0;
    var p = Number(price) || 0;
    if (bracket.type === "fixed") return Number(bracket.value) || 0;
    return (p * (Number(bracket.value) || 0)) / 100;
  }

  function pickSchedule(agency, opts) {
    var schedules = agency.schedules || [];
    if (opts.scheduleId) {
      var byId = schedules.find(function (s) {
        return s.id === opts.scheduleId;
      });
      if (byId) return byId;
    }
    if (opts.kind) {
      var byKind = schedules.find(function (s) {
        return s.kind === opts.kind;
      });
      if (byKind) return byKind;
    }
    return schedules[0] || null;
  }

  function dossierRateForZone(perSqm, zone) {
    var d = (perSqm && perSqm.dossier) || {};
    if (zone === "tres_tendue") return Number(d.tres_tendue) || 0;
    if (zone === "tendue") return Number(d.tendue) || 0;
    return Number(d.hors_zone) || 0;
  }

  /**
   * Honoraires location habitation TG0422 (€ TTC / m² habitable).
   * @param {"bailleur"|"locataire"|"total"} party
   */
  function rentalHabitationFee(perSqm, surface, zone, party) {
    var m2 = Number(surface) || 0;
    var neg = Number(perSqm.negotiation) || 0;
    var edl = Number(perSqm.edl) || 0;
    var dossier = dossierRateForZone(perSqm, zone || "hors_zone");
    var p = party || "total";
    if (p === "bailleur") return (neg + dossier + edl) * m2;
    if (p === "locataire") return (dossier + edl) * m2;
    // total agence = négociation (bailleur) + dossier×2 + EDL×2
    return (neg + dossier * 2 + edl * 2) * m2;
  }

  /**
   * @param {object} opts
   * @param {object} opts.agency
   * @param {string} [opts.scheduleId]
   * @param {string} [opts.kind]
   * @param {number} opts.price — net vendeur / prix / loyer annuel selon le barème
   * @param {number} [opts.surface] — m² habitables (location habitation)
   * @param {string} [opts.zone] — tres_tendue | tendue | hors_zone
   * @param {string} [opts.rentalParty] — bailleur | locataire | total
   * @param {number} [opts.chargesPct] — total URSSAF+impôts (prioritaire si fourni)
   * @param {number} [opts.urssafPct]
   * @param {number} [opts.irPct]
   */
  function calculate(opts) {
    var agency = opts.agency;
    var price = Number(opts.price) || 0;
    var schedule = pickSchedule(agency, opts);
    var feeModel = schedule ? schedule.feeModel || "brackets" : "brackets";
    var bracket = null;
    var agencyFee = 0;
    var feeDetail = null;

    if (schedule && feeModel === "annual_rent_percent") {
      var pct = Number(schedule.percentValue) || 0;
      var feeHtOrTtc = (price * pct) / 100;
      if (schedule.percentTax === "ht") {
        agencyFee = feeHtOrTtc * (1 + VAT_RATE);
        feeDetail = { feeHt: round2(feeHtOrTtc), feeTtc: round2(agencyFee), percent: pct };
      } else {
        agencyFee = feeHtOrTtc;
        feeDetail = { feeTtc: round2(agencyFee), percent: pct };
      }
    } else if (schedule && feeModel === "per_sqm_rental") {
      var surface = opts.surface != null ? Number(opts.surface) : price;
      var zone = opts.zone || "hors_zone";
      var party = opts.rentalParty || "total";
      agencyFee = rentalHabitationFee(schedule.perSqm || normalizePerSqm(null), surface, zone, party);
      feeDetail = {
        surface: surface,
        zone: zone,
        rentalParty: party,
        perSqm: schedule.perSqm,
      };
    } else if (schedule && feeModel === "fixed_fee") {
      agencyFee = Number(schedule.fixedFee) || 0;
      feeDetail = { fixedFee: agencyFee };
    } else {
      bracket = schedule ? findBracket(schedule.brackets, price) : null;
      agencyFee = agencyFeeFromBracket(price, bracket);
      // minFeeHt conservé pour barèmes custom historiques uniquement (absent du PDF TG0422)
      if (schedule && schedule.minFeeHt != null) {
        var minTtc = Number(schedule.minFeeHt) * (1 + VAT_RATE);
        if (agencyFee < minTtc) agencyFee = minTtc;
      }
    }

    var sharePct = Number(agency.agentSharePct) || 0;
    var deal = opts.deal != null ? opts.deal : null;
    var dealSplit = splitDealRemuneration(agencyFee, sharePct, deal || {}, {
      chargesPct: opts.chargesPct,
      urssafPct: opts.urssafPct,
      irPct: opts.irPct,
      cfePct: opts.cfePct,
      accountingPct: opts.accountingPct,
    });
    var agentGross = dealSplit.myGross;

    var chargesPct;
    var urssafPct;
    var irPct;
    if (opts.chargesPct != null && opts.chargesPct !== "") {
      chargesPct = Number(opts.chargesPct) || 0;
      urssafPct = chargesPct;
      irPct = 0;
    } else {
      urssafPct = opts.urssafPct != null ? Number(opts.urssafPct) : DEFAULT_URSSAF_PCT;
      irPct = opts.irPct != null ? Number(opts.irPct) : DEFAULT_IR_PCT;
      chargesPct = urssafPct + irPct;
    }

    var cfePct = opts.cfePct != null ? Number(opts.cfePct) : 0.5;
    var accountingPct = opts.accountingPct != null ? Number(opts.accountingPct) : 1;
    var urssafReserve = (agentGross * chargesPct) / 100;
    var cfeReserve = (agentGross * cfePct) / 100;
    var accountingReserve = (agentGross * accountingPct) / 100;
    var charges = urssafReserve + cfeReserve + accountingReserve;
    var agentNet = Math.max(0, agentGross - charges);
    var basis = schedule ? schedule.priceBasis : "prix_vente";
    var fai =
      basis === "net_vendeur" || basis === "prix_vente" ? price + agencyFee : null;

    return {
      price: price,
      priceBasis: basis,
      feeModel: feeModel,
      feeDetail: feeDetail,
      schedule: schedule,
      bracket: bracket,
      agencyFee: round2(agencyFee),
      fai: fai != null ? round2(fai) : null,
      agentSharePct: sharePct,
      agentGross: round2(agentGross),
      dealSplit: dealSplit,
      chargesPct: chargesPct,
      cfePct: cfePct,
      accountingPct: accountingPct,
      urssafPct: urssafPct,
      irPct: irPct,
      urssafReserve: round2(urssafReserve),
      cfeReserve: round2(cfeReserve),
      accountingReserve: round2(accountingReserve),
      charges: round2(charges),
      agentNet: round2(agentNet),
    };
  }

  /**
   * Compare toutes les agences sur le même prix (net vendeur).
   */
  function compareAgencies(opts) {
    var price = Number(opts.price) || 0;
    var kind = opts.kind || "vente_habitation";
    var chargesPct = opts.chargesPct;
    var urssafPct = opts.urssafPct;
    var irPct = opts.irPct;
    return listAgencies()
      .map(function (agency) {
        var schedule =
          (agency.schedules || []).find(function (s) {
            return s.kind === kind;
          }) ||
          (agency.schedules || []).find(function (s) {
            return String(s.kind || "").indexOf("vente") === 0;
          }) ||
          (agency.schedules || [])[0];
        var res = calculate({
          agency: agency,
          scheduleId: schedule ? schedule.id : null,
          kind: kind,
          price: price,
          surface: opts.surface,
          zone: opts.zone,
          rentalParty: opts.rentalParty,
          chargesPct: chargesPct,
          cfePct: opts.cfePct,
          accountingPct: opts.accountingPct,
          urssafPct: urssafPct,
          irPct: irPct,
        });
        return {
          agency: agency,
          schedule: schedule,
          result: res,
          hasMatchingKind: !!(agency.schedules || []).some(function (s) {
            return s.kind === kind;
          }),
        };
      })
      .sort(function (a, b) {
        return (b.result.agentGross || 0) - (a.result.agentGross || 0);
      });
  }

  function loadTaxPrefs() {
    try {
      var raw = localStorage.getItem(TAX_PREFS_KEY);
      var p = raw ? JSON.parse(raw) : {};
      if (!p || typeof p !== "object") p = {};
      return {
        presetId: p.presetId || "custom_22",
        chargesPct: p.chargesPct != null ? Number(p.chargesPct) : DEFAULT_CHARGES_PCT,
        cfePct: p.cfePct != null ? Number(p.cfePct) : 0.5,
        accountingPct: p.accountingPct != null ? Number(p.accountingPct) : 1,
        urssafPct: p.urssafPct != null ? Number(p.urssafPct) : DEFAULT_URSSAF_PCT,
        irPct: p.irPct != null ? Number(p.irPct) : 0,
        advanced: !!p.advanced,
        splitMode: p.splitMode || "agent_gross",
        agentSharePct: p.agentSharePct != null ? Number(p.agentSharePct) : 100,
      };
    } catch (e) {
      return {
        presetId: "custom_22",
        chargesPct: DEFAULT_CHARGES_PCT,
        cfePct: 0.5,
        accountingPct: 1,
        urssafPct: DEFAULT_URSSAF_PCT,
        irPct: 0,
        advanced: false,
        splitMode: "agent_gross",
        agentSharePct: 100,
      };
    }
  }

  function saveTaxPrefs(prefs) {
    localStorage.setItem(
      TAX_PREFS_KEY,
      JSON.stringify({
        presetId: prefs.presetId || "custom",
        chargesPct: Number(prefs.chargesPct) || 0,
        cfePct: Number(prefs.cfePct) || 0,
        accountingPct: Number(prefs.accountingPct) || 0,
        urssafPct: Number(prefs.urssafPct) || 0,
        irPct: Number(prefs.irPct) || 0,
        advanced: !!prefs.advanced,
        splitMode: prefs.splitMode || "agent_gross",
        agentSharePct: Number(prefs.agentSharePct) || 100,
        savedAt: new Date().toISOString(),
      })
    );
  }

  function getTaxPreset(id) {
    return (
      TAX_PRESETS.find(function (p) {
        return p.id === id;
      }) || TAX_PRESETS[TAX_PRESETS.length - 1]
    );
  }

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

  function formatBracketLabel(b) {
    if (!b) return "—";
    if (b.type === "fixed") return formatEuro(b.value) + " fixe";
    return (Number(b.value) || 0) + " %";
  }

  function emptyAgency() {
    return normalizeAgency({
      id: uid("agency"),
      name: "Nouvelle agence",
      agentSharePct: 50,
      notes: "",
      schedules: [
        {
          id: uid("sched"),
          name: "Honoraires sur les ventes",
          kind: "vente_habitation",
          priceBasis: "net_vendeur",
          brackets: [br(0, null, "percent", 5)],
        },
      ],
    });
  }

  function emptyBracket() {
    return normalizeBracket(br(0, null, "percent", 5));
  }

  function emptySchedule() {
    return normalizeSchedule({
      id: uid("sched"),
      name: "Nouveau barème",
      kind: "vente_habitation",
      priceBasis: "net_vendeur",
      brackets: [emptyBracket()],
    });
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    TAX_PREFS_KEY: TAX_PREFS_KEY,
    DATA_VERSION: DATA_VERSION,
    DEFAULT_CHARGES_PCT: DEFAULT_CHARGES_PCT,
    DEFAULT_URSSAF_PCT: DEFAULT_URSSAF_PCT,
    DEFAULT_IR_PCT: DEFAULT_IR_PCT,
    TAX_PRESETS: TAX_PRESETS,
    VAT_RATE: VAT_RATE,
    load: load,
    save: save,
    listAgencies: listAgencies,
    getAgency: getAgency,
    upsertAgency: upsertAgency,
    deleteAgency: deleteAgency,
    resetDefaults: resetDefaults,
    applyPortesClesOfficial: applyPortesClesOfficial,
    isPortesClesTg0422Complete: isPortesClesTg0422Complete,
    healPortesClesIfNeeded: healPortesClesIfNeeded,
    calculate: calculate,
    compareAgencies: compareAgencies,
    splitDealRemuneration: splitDealRemuneration,
    loadDealSplit: loadDealSplit,
    saveDealSplit: saveDealSplit,
    defaultDealSplit: defaultDealSplit,
    DEAL_ROLES: DEAL_ROLES,
    DEAL_SPLIT_KEY: DEAL_SPLIT_KEY,
    rentalHabitationFee: rentalHabitationFee,
    dossierRateForZone: dossierRateForZone,
    loadTaxPrefs: loadTaxPrefs,
    saveTaxPrefs: saveTaxPrefs,
    getTaxPreset: getTaxPreset,
    findBracket: findBracket,
    formatEuro: formatEuro,
    formatBracketLabel: formatBracketLabel,
    emptyAgency: emptyAgency,
    emptyBracket: emptyBracket,
    emptySchedule: emptySchedule,
    normalizeAgency: normalizeAgency,
  };
})();
