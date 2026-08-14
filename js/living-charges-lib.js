/**
 * Charges du foyer nommables + taux d'endettement / d'effort.
 * Gaz, électricité, internet, abonnements… chaque ligne a un libellé éditable.
 * Utilisable navigateur + Node.
 *
 * Banque (HCSF) : crédits + pension + lignes cochées « endettement ».
 * Effort / RAV : toutes les charges de vie en plus.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.LivingCharges = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var HCSF_DTI = 35;

  var PRESETS = [
    { id: "gaz", label: "Gaz", inDti: false },
    { id: "electricite", label: "Électricité", inDti: false },
    { id: "internet", label: "Internet", inDti: false },
    { id: "abonnements", label: "Abonnements", inDti: false },
    { id: "eau", label: "Eau", inDti: false },
    { id: "telephone", label: "Téléphone / mobile", inDti: false },
    { id: "mutuelle", label: "Mutuelle", inDti: false },
    { id: "assurance_auto", label: "Assurance auto", inDti: false },
    { id: "cantine", label: "Cantine / garderie", inDti: false },
    { id: "transport", label: "Transport / essence", inDti: false },
  ];

  function round2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }

  function uid() {
    return (
      "chg_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).slice(2, 7)
    );
  }

  function findPreset(id) {
    var key = String(id || "");
    for (var i = 0; i < PRESETS.length; i++) {
      if (PRESETS[i].id === key) return PRESETS[i];
    }
    return null;
  }

  function normalizeItem(raw) {
    raw = raw || {};
    var preset = findPreset(raw.id);
    var label = String(raw.label != null ? raw.label : (preset && preset.label) || "").trim();
    if (!label) label = "Charge";
    var amount = Number(raw.amount);
    if (!isFinite(amount) || amount < 0) amount = 0;
    amount = round2(amount);
    var inDti = raw.inDti === true || raw.inDti === "1" || raw.inDti === 1;
    return {
      id: String(raw.id || uid()),
      label: label.slice(0, 80),
      amount: amount,
      inDti: inDti,
    };
  }

  function normalizeList(list) {
    if (!Array.isArray(list)) return [];
    return list.map(normalizeItem);
  }

  function defaultList() {
    return ["gaz", "electricite", "internet", "abonnements"].map(function (id) {
      var p = findPreset(id);
      return normalizeItem({ id: p.id, label: p.label, amount: 0, inDti: false });
    });
  }

  function mergeWithDefaults(list) {
    var current = normalizeList(list);
    if (!current.length) return defaultList();
    return current;
  }

  function sumAll(list) {
    return round2(
      normalizeList(list).reduce(function (acc, x) {
        return acc + x.amount;
      }, 0)
    );
  }

  function sumInDti(list) {
    return round2(
      normalizeList(list).reduce(function (acc, x) {
        return acc + (x.inDti ? x.amount : 0);
      }, 0)
    );
  }

  /**
   * @param {object} o
   *   revenus, credits (mensualités crédits hors nouveau prêt),
   *   pension, loyer (si encore dû), newLoan (mensualité A.C. du projet),
   *   livingCharges[], dtiMax
   */
  function computeBudget(o) {
    o = o || {};
    var revenus = round2(Math.max(0, Number(o.revenus) || 0));
    var credits = round2(Math.max(0, Number(o.credits) || 0));
    var pension = round2(Math.max(0, Number(o.pension) || 0));
    var loyer = round2(Math.max(0, Number(o.loyer) || 0));
    var newLoan = round2(Math.max(0, Number(o.newLoan) || 0));
    var dtiMax = Number(o.dtiMax) || HCSF_DTI;
    var items = normalizeList(o.livingCharges);
    var livingAll = sumAll(items);
    var livingDti = sumInDti(items);

    var banqueAvant = round2(credits + pension + loyer + livingDti);
    var banqueApres = round2(credits + pension + loyer + livingDti + newLoan);
    var effortAvant = round2(banqueAvant - livingDti + livingAll);
    var effortApres = round2(banqueApres - livingDti + livingAll);

    var dtiAvant = revenus > 0 ? round2((banqueAvant / revenus) * 100) : 0;
    var dtiApres = revenus > 0 ? round2((banqueApres / revenus) * 100) : 0;
    var effortPct = revenus > 0 ? round2((effortApres / revenus) * 100) : 0;
    var rav = round2(revenus - effortApres);
    var roomBanque = round2(Math.max(0, (revenus * dtiMax) / 100 - banqueAvant));

    var tone = "ok";
    if (dtiApres > dtiMax) tone = "no";
    else if (dtiApres > dtiMax - 3 || effortPct > 55) tone = "tight";

    return {
      revenus: revenus,
      credits: credits,
      pension: pension,
      loyer: loyer,
      newLoan: newLoan,
      livingCharges: items,
      livingAll: livingAll,
      livingDti: livingDti,
      banqueAvant: banqueAvant,
      banqueApres: banqueApres,
      effortAvant: effortAvant,
      effortApres: effortApres,
      dtiAvant: dtiAvant,
      dtiApres: dtiApres,
      dtiMax: dtiMax,
      effortPct: effortPct,
      rav: rav,
      roomBanque: roomBanque,
      tone: tone,
      okHcsf: dtiApres <= dtiMax + 0.05,
    };
  }

  function dtiTone(pct, max) {
    max = Number(max) || HCSF_DTI;
    var n = Number(pct) || 0;
    if (n <= max - 5) return "ok";
    if (n <= max) return "tight";
    return "no";
  }

  function formatPct(n) {
    return (Number(n) || 0).toLocaleString("fr-FR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }) + " %";
  }

  function formatEuro(n) {
    return (
      (Number(n) || 0).toLocaleString("fr-FR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }) + " €"
    );
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function rowHtml(item, opts) {
    opts = opts || {};
    var showDti = opts.showDti !== false;
    var it = normalizeItem(item);
    return (
      '<div class="lc-row" data-id="' +
      esc(it.id) +
      '">' +
      '<input class="lc-label" type="text" maxlength="80" value="' +
      esc(it.label) +
      '" placeholder="Libellé (ex. Gaz)" aria-label="Libellé de la charge" />' +
      '<input class="lc-amount" type="number" min="0" step="1" inputmode="decimal" value="' +
      (it.amount || "") +
      '" placeholder="€ / mois" aria-label="Montant mensuel" />' +
      (showDti
        ? '<label class="lc-indti"><input type="checkbox" class="lc-indti-cb"' +
          (it.inDti ? " checked" : "") +
          " /> Endettement</label>"
        : "") +
      '<button type="button" class="lc-remove" aria-label="Retirer cette charge">×</button>' +
      "</div>"
    );
  }

  function listHtml(items, opts) {
    opts = opts || {};
    var showDti = opts.showDti !== false;
    var list = mergeWithDefaults(items);
    var chips = PRESETS.map(function (p) {
      return (
        '<button type="button" class="lc-chip" data-preset="' +
        esc(p.id) +
        '">+ ' +
        esc(p.label) +
        "</button>"
      );
    }).join("");
    return (
      '<div class="lc-widget">' +
      '<p class="lc-hint">' +
      (showDti
        ? "Libellés modifiables. Cochez « Endettement » seulement si la banque doit compter cette ligne dans le taux d’endettement (HCSF). Gaz, électricité, internet et abonnements baissent le reste à vivre, sans entrer dans le 35 % par défaut."
        : "Ajoutez gaz, électricité, internet, abonnements… Chaque ligne a un nom que vous pouvez modifier.") +
      "</p>" +
      '<div class="lc-chips">' +
      chips +
      "</div>" +
      '<div class="lc-rows">' +
      list.map(function (it) {
        return rowHtml(it, opts);
      }).join("") +
      "</div>" +
      '<button type="button" class="lc-add">+ Ajouter une charge (nom libre)</button>' +
      '<p class="lc-total">Charges de vie : <strong class="lc-total-val">0 €</strong></p>' +
      "</div>"
    );
  }

  function readFrom(root) {
    if (!root) return [];
    var rows = root.querySelectorAll(".lc-row");
    var out = [];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var labelEl = row.querySelector(".lc-label");
      var amtEl = row.querySelector(".lc-amount");
      var cb = row.querySelector(".lc-indti-cb");
      out.push(
        normalizeItem({
          id: row.getAttribute("data-id") || uid(),
          label: labelEl ? labelEl.value : "",
          amount: amtEl ? amtEl.value : 0,
          inDti: !!(cb && cb.checked),
        })
      );
    }
    return out;
  }

  function refreshTotal(root) {
    if (!root) return;
    var el = root.querySelector(".lc-total-val");
    if (el) el.textContent = formatEuro(sumAll(readFrom(root)));
  }

  function bind(root, opts) {
    opts = opts || {};
    if (!root) return { get: function () { return []; } };
    if (root.getAttribute("data-lc-bound") === "1") {
      return {
        get: function () {
          return readFrom(root);
        },
        set: function (items) {
          mount(root, items, opts);
        },
      };
    }
    root.setAttribute("data-lc-bound", "1");
    var showDti = opts.showDti !== false;

    function emit() {
      refreshTotal(root);
      if (typeof opts.onChange === "function") opts.onChange(readFrom(root));
    }

    root.addEventListener("input", function (e) {
      if (e.target && (e.target.classList.contains("lc-label") || e.target.classList.contains("lc-amount"))) {
        emit();
      }
    });
    root.addEventListener("change", function (e) {
      if (e.target && e.target.classList.contains("lc-indti-cb")) emit();
    });
    root.addEventListener("click", function (e) {
      var t = e.target;
      if (!t) return;
      if (t.classList.contains("lc-remove")) {
        var row = t.closest(".lc-row");
        var box = root.querySelector(".lc-rows");
        if (row && box && box.querySelectorAll(".lc-row").length > 1) {
          row.remove();
          emit();
        }
        return;
      }
      if (t.classList.contains("lc-add")) {
        var boxAdd = root.querySelector(".lc-rows");
        if (boxAdd) {
          boxAdd.insertAdjacentHTML("beforeend", rowHtml({ id: uid(), label: "", amount: 0, inDti: false }, opts));
          var last = boxAdd.querySelector(".lc-row:last-child .lc-label");
          if (last) last.focus();
          emit();
        }
        return;
      }
      var preset = t.getAttribute && t.getAttribute("data-preset");
      if (preset) {
        var p = findPreset(preset);
        if (!p) return;
        var existing = root.querySelector('.lc-row[data-id="' + p.id + '"]');
        if (existing) {
          var amt = existing.querySelector(".lc-amount");
          if (amt) amt.focus();
          return;
        }
        var boxP = root.querySelector(".lc-rows");
        if (boxP) {
          boxP.insertAdjacentHTML(
            "beforeend",
            rowHtml({ id: p.id, label: p.label, amount: 0, inDti: !!p.inDti }, opts)
          );
          emit();
        }
      }
    });
    refreshTotal(root);
    return {
      get: function () {
        return readFrom(root);
      },
      set: function (items) {
        mount(root, items, opts);
      },
    };
  }

  function mount(root, items, opts) {
    opts = opts || {};
    if (!root) return null;
    root.innerHTML = listHtml(items, opts);
    root.removeAttribute("data-lc-bound");
    var api = bind(root, opts);
    refreshTotal(root);
    return api;
  }

  function dtiBoxHtml(bud) {
    bud = bud || computeBudget({});
    var tone = dtiTone(bud.dtiApres, bud.dtiMax);
    function kpi(label, value, cls) {
      return (
        '<div class="lc-dti-kpi' +
        (cls ? " " + cls : "") +
        '"><span>' +
        esc(label) +
        "</span><strong>" +
        esc(value) +
        "</strong></div>"
      );
    }
    return (
      '<div class="lc-dti-box">' +
      kpi("Taux d'endettement", formatPct(bud.dtiApres), "is-" + tone) +
      kpi("Plafond HCSF", formatPct(bud.dtiMax), "") +
      kpi("Taux d'effort (avec charges de vie)", formatPct(bud.effortPct), "") +
      kpi("Reste à vivre", formatEuro(bud.rav), "") +
      kpi("Charges de vie", formatEuro(bud.livingAll), "") +
      "</div>"
    );
  }

  if (typeof document !== "undefined" && document.addEventListener) {
    document.addEventListener("DOMContentLoaded", function () {
      var nodes = document.querySelectorAll("[data-living-charges-auto]");
      for (var i = 0; i < nodes.length; i++) {
        (function (root) {
          var showDti = root.getAttribute("data-show-dti") !== "0";
          var hiddenId = root.getAttribute("data-hidden");
          var previewId = root.getAttribute("data-preview");
          function sync(items) {
            if (hiddenId) {
              var h = document.getElementById(hiddenId);
              if (h) h.value = JSON.stringify(items);
            }
            var preview = previewId ? document.getElementById(previewId) : null;
            if (!preview) return;
            var income =
              (Number((document.getElementById("netIncome") || {}).value) || 0) +
              (Number((document.getElementById("otherIncome") || {}).value) || 0) +
              (Number((document.getElementById("salary") || {}).value) || 0);
            var loans = Number((document.getElementById("currentLoans") || {}).value) || 0;
            var rent = Number((document.getElementById("currentRent") || {}).value) || 0;
            var alimony = Number((document.getElementById("alimony") || {}).value) || 0;
            preview.innerHTML = dtiBoxHtml(
              computeBudget({
                revenus: income,
                credits: loans,
                loyer: rent,
                pension: alimony,
                livingCharges: items,
              })
            );
          }
          var api = mount(root, defaultList(), {
            showDti: showDti,
            onChange: sync,
          });
          sync(api.get());
          ["netIncome", "otherIncome", "salary", "currentLoans", "currentRent", "alimony"].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) {
              el.addEventListener("input", function () {
                sync(api.get());
              });
            }
          });
        })(nodes[i]);
      }
    });
  }

  return {
    HCSF_DTI: HCSF_DTI,
    PRESETS: PRESETS,
    round2: round2,
    uid: uid,
    normalizeItem: normalizeItem,
    normalizeList: normalizeList,
    defaultList: defaultList,
    mergeWithDefaults: mergeWithDefaults,
    sumAll: sumAll,
    sumInDti: sumInDti,
    computeBudget: computeBudget,
    dtiTone: dtiTone,
    formatPct: formatPct,
    formatEuro: formatEuro,
    dtiBoxHtml: dtiBoxHtml,
    listHtml: listHtml,
    rowHtml: rowHtml,
    readFrom: readFrom,
    bind: bind,
    mount: mount,
  };
});
