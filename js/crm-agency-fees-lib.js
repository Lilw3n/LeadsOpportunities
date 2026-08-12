/**
 * Barèmes d'honoraires immobiliers — multi-agences, tranches % / fixe, part agent.
 * Stockage local (navigateur).
 */
window.CrmAgencyFees = (function () {
  var STORAGE_KEY = "lo_agency_fee_schedules_v1";

  var DEFAULT_URSSAF_PCT = 21.2;
  var DEFAULT_IR_PCT = 2.2;

  function uid(prefix) {
    return (prefix || "id") + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
  }

  function laforetSaleBrackets() {
    return [
      { id: uid("br"), min: 0, max: 50000, type: "fixed", value: 5000 },
      { id: uid("br"), min: 50001, max: 120000, type: "percent", value: 11 },
      { id: uid("br"), min: 120001, max: 170000, type: "percent", value: 10 },
      { id: uid("br"), min: 170001, max: 220000, type: "percent", value: 9 },
      { id: uid("br"), min: 220001, max: 300000, type: "percent", value: 8 },
      { id: uid("br"), min: 300001, max: null, type: "percent", value: 7 },
    ];
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
            kind: "vente",
            brackets: laforetSaleBrackets(),
          },
          {
            id: "sched_laforet_garage",
            name: "Garage / Parking",
            kind: "garage",
            brackets: [{ id: uid("br"), min: 0, max: null, type: "fixed", value: 2500 }],
          },
        ],
        updatedAt: new Date().toISOString(),
      },
      {
        id: "agency_portes_cles",
        name: "Les Portes Clés de l'Immobilier",
        agentSharePct: 85,
        notes: "Exemple à adapter — remplacez les tranches par votre barème réel.",
        schedules: [
          {
            id: "sched_pc_vente",
            name: "Honoraires sur les ventes",
            kind: "vente",
            brackets: [
              { id: uid("br"), min: 0, max: 100000, type: "percent", value: 8 },
              { id: uid("br"), min: 100001, max: 200000, type: "percent", value: 6 },
              { id: uid("br"), min: 200001, max: 350000, type: "percent", value: 5 },
              { id: uid("br"), min: 350001, max: null, type: "percent", value: 4 },
            ],
          },
        ],
        updatedAt: new Date().toISOString(),
      },
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
    return {
      id: String(s.id || uid("sched")),
      name: String(s.name || "Barème").trim() || "Barème",
      kind: String(s.kind || "vente"),
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

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        var seed = { agencies: defaultAgencies(), version: 1 };
        save(seed);
        return seed;
      }
      var bag = JSON.parse(raw);
      if (!bag || typeof bag !== "object") bag = {};
      if (!Array.isArray(bag.agencies) || !bag.agencies.length) {
        bag.agencies = defaultAgencies();
        save(bag);
      } else {
        bag.agencies = bag.agencies.map(normalizeAgency);
      }
      bag.version = bag.version || 1;
      return bag;
    } catch (e) {
      return { agencies: defaultAgencies(), version: 1 };
    }
  }

  function save(bag) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: bag.version || 1,
        agencies: (bag.agencies || []).map(normalizeAgency),
        savedAt: new Date().toISOString(),
      })
    );
  }

  function listAgencies() {
    return load().agencies.slice();
  }

  function getAgency(id) {
    return listAgencies().find(function (a) {
      return a.id === id;
    }) || null;
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
    var bag = { agencies: defaultAgencies(), version: 1 };
    save(bag);
    return bag;
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

  /**
   * @param {object} opts
   * @param {object} opts.agency
   * @param {string} [opts.scheduleId]
   * @param {number} opts.price
   * @param {number} [opts.urssafPct]
   * @param {number} [opts.irPct]
   */
  function calculate(opts) {
    var agency = opts.agency;
    var price = Number(opts.price) || 0;
    var schedule =
      (agency.schedules || []).find(function (s) {
        return s.id === opts.scheduleId;
      }) ||
      (agency.schedules || [])[0] ||
      null;

    var bracket = schedule ? findBracket(schedule.brackets, price) : null;
    var agencyFee = agencyFeeFromBracket(price, bracket);
    var sharePct = Number(agency.agentSharePct) || 0;
    var agentGross = (agencyFee * sharePct) / 100;
    var urssafPct = opts.urssafPct != null ? Number(opts.urssafPct) : DEFAULT_URSSAF_PCT;
    var irPct = opts.irPct != null ? Number(opts.irPct) : DEFAULT_IR_PCT;
    var charges = (agentGross * (urssafPct + irPct)) / 100;
    var agentNet = Math.max(0, agentGross - charges);

    return {
      price: price,
      schedule: schedule,
      bracket: bracket,
      agencyFee: round2(agencyFee),
      agentSharePct: sharePct,
      agentGross: round2(agentGross),
      urssafPct: urssafPct,
      irPct: irPct,
      charges: round2(charges),
      agentNet: round2(agentNet),
    };
  }

  function round2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }

  function formatEuro(n) {
    return (Number(n) || 0).toLocaleString("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }) + " €";
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
          kind: "vente",
          brackets: [
            { id: uid("br"), min: 0, max: null, type: "percent", value: 5 },
          ],
        },
      ],
    });
  }

  function emptyBracket() {
    return normalizeBracket({ id: uid("br"), min: 0, max: null, type: "percent", value: 5 });
  }

  function emptySchedule() {
    return normalizeSchedule({
      id: uid("sched"),
      name: "Nouveau barème",
      kind: "vente",
      brackets: [emptyBracket()],
    });
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    DEFAULT_URSSAF_PCT: DEFAULT_URSSAF_PCT,
    DEFAULT_IR_PCT: DEFAULT_IR_PCT,
    load: load,
    save: save,
    listAgencies: listAgencies,
    getAgency: getAgency,
    upsertAgency: upsertAgency,
    deleteAgency: deleteAgency,
    resetDefaults: resetDefaults,
    calculate: calculate,
    findBracket: findBracket,
    formatEuro: formatEuro,
    formatBracketLabel: formatBracketLabel,
    emptyAgency: emptyAgency,
    emptyBracket: emptyBracket,
    emptySchedule: emptySchedule,
    normalizeAgency: normalizeAgency,
  };
})();
