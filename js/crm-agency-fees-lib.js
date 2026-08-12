/**
 * Barèmes d'honoraires immobiliers — multi-agences, tranches % / fixe, part agent.
 * Stockage local (navigateur).
 */
window.CrmAgencyFees = (function () {
  var STORAGE_KEY = "lo_agency_fee_schedules_v1";
  var DATA_VERSION = 2;

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

  /** Barème TG0422 — Les Portes Clés / Immobilier Email — ventes habitation (forfait TTC sur net vendeur) */
  function portesClesHabitationBrackets() {
    return [
      br(0, 70000, "fixed", 5000),
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
        "Barème TG0422 TTC — Immobilier Email SAS (46 quai Jacoutot, Strasbourg). Honoraires sur prix net vendeur (hors honoraires). Prix maximums, négociables au mandat.",
      schedules: [
        {
          id: "sched_pc_habitation",
          name: "Vente habitation (forfait TTC)",
          kind: "vente_habitation",
          priceBasis: "net_vendeur",
          brackets: portesClesHabitationBrackets(),
        },
        {
          id: "sched_pc_pro",
          name: "Terrains / bureaux / commerces / immeubles",
          kind: "vente_pro",
          priceBasis: "net_vendeur",
          // 10 % TTC, minimum 7 000 € HT (= 8 400 € TTC à 20 %)
          minFeeHt: 7000,
          brackets: [br(0, null, "percent", 10)],
        },
      ],
      updatedAt: new Date().toISOString(),
    };
  }

  function defaultAgencies() {
    return [
      {
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
      },
      portesClesAgency(),
    ];
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

  function normalizeSchedule(s) {
    var minFeeHt = s.minFeeHt;
    if (minFeeHt === "" || minFeeHt == null) minFeeHt = null;
    else minFeeHt = Number(minFeeHt);
    return {
      id: String(s.id || uid("sched")),
      name: String(s.name || "Barème").trim() || "Barème",
      kind: String(s.kind || "vente_habitation"),
      priceBasis: s.priceBasis === "net_vendeur" ? "net_vendeur" : "prix_vente",
      minFeeHt: minFeeHt != null && !isNaN(minFeeHt) ? minFeeHt : null,
      brackets: Array.isArray(s.brackets) ? s.brackets.map(normalizeBracket) : [],
    };
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

  function migrate(bag) {
    var ver = Number(bag.version) || 1;
    if (ver < 2) {
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
      bag.version = 2;
      save(bag);
    }
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

  /**
   * @param {object} opts
   * @param {object} opts.agency
   * @param {string} [opts.scheduleId]
   * @param {string} [opts.kind]
   * @param {number} opts.price — net vendeur ou prix selon le barème
   * @param {number} [opts.chargesPct] — total URSSAF+impôts (prioritaire si fourni)
   * @param {number} [opts.urssafPct]
   * @param {number} [opts.irPct]
   */
  function calculate(opts) {
    var agency = opts.agency;
    var price = Number(opts.price) || 0;
    var schedule = pickSchedule(agency, opts);

    var bracket = schedule ? findBracket(schedule.brackets, price) : null;
    var agencyFee = agencyFeeFromBracket(price, bracket);

    if (schedule && schedule.minFeeHt != null) {
      var minTtc = Number(schedule.minFeeHt) * (1 + VAT_RATE);
      if (agencyFee < minTtc) agencyFee = minTtc;
    }

    var sharePct = Number(agency.agentSharePct) || 0;
    var agentGross = (agencyFee * sharePct) / 100;

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
    var fai = price + agencyFee;

    return {
      price: price,
      priceBasis: schedule ? schedule.priceBasis : "prix_vente",
      schedule: schedule,
      bracket: bracket,
      agencyFee: round2(agencyFee),
      fai: round2(fai),
      agentSharePct: sharePct,
      agentGross: round2(agentGross),
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
    calculate: calculate,
    compareAgencies: compareAgencies,
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
