/**
 * Simulateur rendement / cash-flow investisseur (hub public).
 * Calculs indicatifs — pas un conseil en investissement.
 */
(function (global) {
  "use strict";

  function num(el) {
    if (!el) return 0;
    var v = parseFloat(String(el.value || "").replace(/\s/g, "").replace(",", "."));
    return isFinite(v) ? v : 0;
  }

  function fmtEuro(n) {
    var x = Math.round(n);
    return x.toLocaleString("fr-FR") + " €";
  }

  function fmtPct(n) {
    if (!isFinite(n)) return "—";
    return n.toFixed(2).replace(".", ",") + " %";
  }

  function compute(inputs) {
    var price = inputs.price || 0;
    var rentMonth = inputs.rentMonth || 0;
    var chargesYear = inputs.chargesYear || 0;
    var taxYear = inputs.taxYear || 0;
    var vacanceDays = inputs.vacanceDays || 0;
    var creditMonth = inputs.creditMonth || 0;

    var rentYearGross = rentMonth * 12;
    var vacanceRatio = Math.min(Math.max(vacanceDays, 0), 365) / 365;
    var rentYearEff = rentYearGross * (1 - vacanceRatio);
    var chargesTotal = chargesYear + taxYear;
    var netYear = rentYearEff - chargesTotal;
    var brut = price > 0 ? (rentYearGross / price) * 100 : 0;
    var net = price > 0 ? (netYear / price) * 100 : 0;
    var cashflow = rentMonth * (1 - vacanceRatio) - chargesTotal / 12 - creditMonth;

    return {
      rendementBrut: brut,
      rendementNet: net,
      cashflowMensuel: cashflow,
      loyerAnnuelEffectif: rentYearEff,
    };
  }

  function bind(root) {
    if (!root) return null;
    var els = {
      price: root.querySelector("[data-yield-price]"),
      rent: root.querySelector("[data-yield-rent]"),
      charges: root.querySelector("[data-yield-charges]"),
      tax: root.querySelector("[data-yield-tax]"),
      vacance: root.querySelector("[data-yield-vacance]"),
      credit: root.querySelector("[data-yield-credit]"),
      outBrut: root.querySelector("[data-yield-out-brut]"),
      outNet: root.querySelector("[data-yield-out-net]"),
      outCf: root.querySelector("[data-yield-out-cf]"),
    };

    function refresh() {
      var r = compute({
        price: num(els.price),
        rentMonth: num(els.rent),
        chargesYear: num(els.charges),
        taxYear: num(els.tax),
        vacanceDays: num(els.vacance),
        creditMonth: num(els.credit),
      });
      if (els.outBrut) els.outBrut.textContent = fmtPct(r.rendementBrut);
      if (els.outNet) els.outNet.textContent = fmtPct(r.rendementNet);
      if (els.outCf) els.outCf.textContent = fmtEuro(r.cashflowMensuel);
    }

    ["price", "rent", "charges", "tax", "vacance", "credit"].forEach(function (k) {
      if (els[k]) {
        els[k].addEventListener("input", refresh);
        els[k].addEventListener("change", refresh);
      }
    });
    refresh();
    return { refresh: refresh, compute: compute };
  }

  function autoInit() {
    var nodes = document.querySelectorAll("[data-immo-yield]");
    for (var i = 0; i < nodes.length; i++) bind(nodes[i]);
  }

  global.ImmoInvestisseurYield = { compute: compute, bind: bind, autoInit: autoInit };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInit);
  } else {
    autoInit();
  }
})(typeof window !== "undefined" ? window : globalThis);
