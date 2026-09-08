/**
 * IRL INSEE — révision annuelle des loyers d'habitation (métropole).
 * Formule : loyer × (IRL nouveau / IRL de référence du bail).
 * Source : publications INSEE / JO — indicative, clause de révision requise.
 */
(function (global) {
  var SERIES = [
    { id: "2022-T1", label: "T1 2022", value: 133.93 },
    { id: "2022-T2", label: "T2 2022", value: 135.84 },
    { id: "2022-T3", label: "T3 2022", value: 136.27 },
    { id: "2022-T4", label: "T4 2022", value: 137.26 },
    { id: "2023-T1", label: "T1 2023", value: 138.61 },
    { id: "2023-T2", label: "T2 2023", value: 140.59 },
    { id: "2023-T3", label: "T3 2023", value: 141.03 },
    { id: "2023-T4", label: "T4 2023", value: 142.06 },
    { id: "2024-T1", label: "T1 2024", value: 143.46 },
    { id: "2024-T2", label: "T2 2024", value: 145.17 },
    { id: "2024-T3", label: "T3 2024", value: 144.51 },
    { id: "2024-T4", label: "T4 2024", value: 144.64 },
    { id: "2025-T1", label: "T1 2025", value: 145.47 },
    { id: "2025-T2", label: "T2 2025", value: 146.68 },
    { id: "2025-T3", label: "T3 2025", value: 145.77 },
    { id: "2025-T4", label: "T4 2025", value: 145.78 },
    { id: "2026-T1", label: "T1 2026", value: 146.6 },
    { id: "2026-T2", label: "T2 2026", value: 148.37 },
  ];

  var SOURCE =
    "INSEE — IRL métropole (dernier : T2 2026 = 148,37, +1,15 % sur un an). Corse et DOM : indices distincts, à traiter au dossier.";

  function find(id) {
    for (var i = 0; i < SERIES.length; i++) {
      if (SERIES[i].id === id) return SERIES[i];
    }
    return null;
  }

  function latest() {
    return SERIES[SERIES.length - 1];
  }

  function sameQuarterPreviousYear(id) {
    var m = String(id || "").match(/^(\d{4})-T([1-4])$/);
    if (!m) return null;
    return find(String(Number(m[1]) - 1) + "-T" + m[2]);
  }

  function round2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }

  /**
   * @param {number} rent
   * @param {string|number} oldIndex — id série ou valeur
   * @param {string|number} newIndex
   */
  function revise(rent, oldIndex, newIndex) {
    var oldVal = typeof oldIndex === "number" ? oldIndex : (find(oldIndex) || {}).value;
    var newVal = typeof newIndex === "number" ? newIndex : (find(newIndex) || {}).value;
    var loyer = Number(rent) || 0;
    if (!oldVal || !newVal || loyer <= 0) {
      return { ok: false, rent: loyer, newRent: loyer, delta: 0, pct: 0, oldVal: oldVal, newVal: newVal };
    }
    var newRent = round2(loyer * (newVal / oldVal));
    var delta = round2(newRent - loyer);
    var pct = round2(((newVal / oldVal) - 1) * 100);
    return { ok: true, rent: loyer, newRent: newRent, delta: delta, pct: pct, oldVal: oldVal, newVal: newVal };
  }

  function optionsHtml(selectedId) {
    return SERIES.map(function (s) {
      return (
        '<option value="' +
        s.id +
        '"' +
        (s.id === selectedId ? " selected" : "") +
        ">" +
        s.label +
        " — " +
        String(s.value).replace(".", ",") +
        "</option>"
      );
    }).join("");
  }

  global.IrlRevision = {
    SERIES: SERIES,
    SOURCE: SOURCE,
    find: find,
    latest: latest,
    sameQuarterPreviousYear: sameQuarterPreviousYear,
    revise: revise,
    optionsHtml: optionsHtml,
    round2: round2,
  };
})(typeof window !== "undefined" ? window : global);
