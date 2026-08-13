/**
 * Page CRM — projection budget propriétaire.
 */
(function () {
  "use strict";

  var Own = window.CrmBuyerOwnership;
  var Fin = window.CrmBuyerFinance;
  if (!Own) return;
  if (!localStorage.getItem("lo_token")) {
    /* page utile aussi en démo locale : pas de hard redirect si token absent en preview */
  }

  function $(id) {
    return document.getElementById(id);
  }

  function num(id, fallback) {
    var el = $(id);
    if (!el) return fallback || 0;
    var v = String(el.value || "").trim();
    if (v === "") return fallback != null ? fallback : "";
    var n = Number(v);
    return isNaN(n) ? fallback || 0 : n;
  }

  function set(id, v) {
    var el = $(id);
    if (!el) return;
    el.value = v == null || v === "" ? "" : String(v);
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function readPrefsFromForm() {
    var price = num("bpPrice", 0);
    var agencyFee = num("bpAgencyFee", 0);
    var netRaw = num("bpNet", "");
    var net = netRaw !== "" ? netRaw : Math.max(0, price - agencyFee);
    return {
      monthlyIncome: num("bpIncome", 0),
      coBorrowerIncome: num("bpCoIncome", 0),
      existingLoansMonthly: num("bpExisting", 0),
      householdSize: num("bpHousehold", 2),
      currentRent: num("bpRent", 0),
      downPayment: num("bpDown", 0),
      epargneLiquid: num("bpEpargne", 0),
      patrimoineAutre: num("bpPatrimoine", 0),
      reserveCibleMois: num("bpReserve", 6),
      priceFai: price,
      surfaceM2: num("bpSurface", 70),
      propertyType: ($("bpType") && $("bpType").value) || "appartement",
      postalCode: ($("bpCp") && $("bpCp").value) || "",
      dpeLetter: ($("bpDpe") && $("bpDpe").value) || "D",
      taxeFonciereAnnuelle: num("bpTf", ""),
      chargesCoproMensuelles: num("bpCopro", 0),
      elecMonthly: num("bpElec", ""),
      gasMonthly: num("bpGas", ""),
      waterMonthly: num("bpWater", ""),
      mrhAnnual: num("bpMrh", ""),
      coutEnergieMin: num("bpEnerMin", ""),
      coutEnergieMax: num("bpEnerMax", ""),
      years: num("bpYears", 25),
      ratePct: num("bpRate", ""),
      insurancePctYear: num("bpInsur", 0.34),
      notaryPreset: ($("bpNotary") && $("bpNotary").value) || "ancien",
      financeNotary: ($("bpFinanceNotary") && $("bpFinanceNotary").value) !== "0",
      travauxTotal: num("bpTravaux", 0),
      travauxInLoan: ($("bpTravauxLoan") && $("bpTravauxLoan").value) === "1",
      travauxCashNow: num("bpTravauxCash", ""),
      travauxAmortYears: num("bpTravauxYears", 10),
      agencyFee: agencyFee,
      netVendeur: net,
      feePayer: agencyFee > 0 ? "acheteur" : "vendeur",
    };
  }

  function fillForm(p) {
    p = p || Own.defaultPrefs();
    set("bpIncome", p.monthlyIncome);
    set("bpCoIncome", p.coBorrowerIncome);
    set("bpExisting", p.existingLoansMonthly);
    set("bpHousehold", p.householdSize);
    set("bpRent", p.currentRent);
    set("bpDown", p.downPayment);
    set("bpEpargne", p.epargneLiquid);
    set("bpPatrimoine", p.patrimoineAutre);
    set("bpReserve", p.reserveCibleMois);
    set("bpPrice", p.priceFai);
    set("bpSurface", p.surfaceM2);
    if ($("bpType")) $("bpType").value = p.propertyType || "appartement";
    set("bpCp", p.postalCode || "");
    if ($("bpDpe")) $("bpDpe").value = p.dpeLetter || "D";
    set("bpTf", p.taxeFonciereAnnuelle === "" || p.taxeFonciereAnnuelle == null ? "" : p.taxeFonciereAnnuelle);
    set("bpCopro", p.chargesCoproMensuelles);
    set("bpElec", p.elecMonthly === "" || p.elecMonthly == null ? "" : p.elecMonthly);
    set("bpGas", p.gasMonthly === "" || p.gasMonthly == null ? "" : p.gasMonthly);
    set("bpWater", p.waterMonthly === "" || p.waterMonthly == null ? "" : p.waterMonthly);
    set("bpMrh", p.mrhAnnual === "" || p.mrhAnnual == null ? "" : p.mrhAnnual);
    set("bpEnerMin", p.coutEnergieMin === "" || p.coutEnergieMin == null ? "" : p.coutEnergieMin);
    set("bpEnerMax", p.coutEnergieMax === "" || p.coutEnergieMax == null ? "" : p.coutEnergieMax);
    set("bpYears", p.years);
    set("bpRate", p.ratePct === "" || p.ratePct == null ? "" : p.ratePct);
    set("bpInsur", p.insurancePctYear != null ? p.insurancePctYear : 0.34);
    if ($("bpNotary")) $("bpNotary").value = p.notaryPreset || "ancien";
    if ($("bpFinanceNotary")) $("bpFinanceNotary").value = p.financeNotary === false ? "0" : "1";
    set("bpTravaux", p.travauxTotal);
    if ($("bpTravauxLoan")) $("bpTravauxLoan").value = p.travauxInLoan ? "1" : "0";
    set("bpTravauxCash", p.travauxCashNow === "" || p.travauxCashNow == null ? "" : p.travauxCashNow);
    set("bpTravauxYears", p.travauxAmortYears || 10);
    set("bpAgencyFee", p.agencyFee || 0);
    set("bpNet", p.netVendeur || "");
  }

  function applyQuery() {
    var q = new URLSearchParams(location.search);
    var map = {
      price: "bpPrice",
      surface: "bpSurface",
      income: "bpIncome",
      apport: "bpDown",
      dpe: "bpDpe",
      tf: "bpTf",
      travaux: "bpTravaux",
      rent: "bpRent",
      epargne: "bpEpargne",
    };
    Object.keys(map).forEach(function (k) {
      if (q.has(k)) set(map[k], q.get(k));
    });
    if (q.get("type") && $("bpType")) $("bpType").value = q.get("type");
  }

  function render(bundle) {
    var own = bundle.ownership;
    var fin = bundle.finance;
    var verdict = $("bpVerdict");
    verdict.className = "bp-verdict " + (own.status || "ok");
    verdict.textContent = Own.statusLabel(own.status);

    var loanInfo =
      fin
        ? Own.formatEuro(fin.loanAmount) +
          " · " +
          Own.formatPct(fin.ratePct) +
          " · " +
          fin.years +
          " ans"
        : "—";

    $("bpKpis").innerHTML =
      '<div class="bp-kpi hl"><span>Coût de possession / mois</span><strong>' +
      Own.formatEuro(own.totalCostOfOwnership) +
      "</strong></div>" +
      '<div class="bp-kpi"><span>dont prêt + ADE</span><strong>' +
      Own.formatEuro(own.creditHousing) +
      "</strong></div>" +
      '<div class="bp-kpi"><span>Charges de vie (TF, énergie…)</span><strong>' +
      Own.formatEuro(own.ownershipOpex) +
      "</strong></div>" +
      '<div class="bp-kpi"><span>Reste à vivre</span><strong>' +
      Own.formatEuro(own.resteAVivre) +
      "</strong></div>" +
      '<div class="bp-kpi"><span>Effort réel</span><strong>' +
      Own.formatPct(own.effortRate) +
      "</strong></div>" +
      '<div class="bp-kpi"><span>DTI bancaire</span><strong>' +
      Own.formatPct(own.bankDti) +
      "</strong></div>" +
      '<div class="bp-kpi"><span>Emprunt estimé</span><strong style="font-size:.8rem">' +
      esc(loanInfo) +
      "</strong></div>" +
      (own.vsRent
        ? '<div class="bp-kpi"><span>vs loyer actuel</span><strong>' +
          (own.vsRent.delta >= 0 ? "+" : "−") +
          Own.formatEuro(Math.abs(own.vsRent.delta)) +
          "</strong></div>"
        : "");

    var maxBar = Math.max(
      own.chart.credit,
      own.chart.fiscal,
      own.chart.energie,
      own.chart.charges,
      own.chart.travaux,
      1
    );
    function bar(label, val, cls) {
      var pct = Math.round((val / maxBar) * 100);
      return (
        '<div class="bp-bar-row"><div class="lab"><span>' +
        esc(label) +
        "</span><strong>" +
        Own.formatEuro(val) +
        '</strong></div><div class="bp-bar"><i class="' +
        (cls || "") +
        '" style="width:' +
        pct +
        '%"></i></div></div>'
      );
    }
    $("bpBars").innerHTML =
      bar("Crédit (prêt+ADE)", own.chart.credit, "") +
      bar("Taxe foncière", own.chart.fiscal, "g-fiscal") +
      bar("Énergies + eau", own.chart.energie, "g-energie") +
      bar("Charges / MRH", own.chart.charges, "g-charges") +
      bar("Travaux amortis", own.chart.travaux, "g-travaux");

    $("bpRows").innerHTML = own.breakdown
      .map(function (r) {
        return (
          '<div class="row"><span>' +
          esc(r.label) +
          (r.source ? ' <em style="color:#94a3b8;font-size:.7rem">(' + esc(r.source) + ")</em>" : "") +
          "</span><strong>" +
          Own.formatEuro(r.monthly) +
          "/mois</strong></div>"
        );
      })
      .join("");

    $("bpPat").innerHTML =
      '<div class="row"><span>Cash à la signature (apport + travaux + notaire cash)</span><strong>' +
      Own.formatEuro(own.cashAtSigning) +
      "</strong></div>" +
      '<div class="row"><span>Épargne restante</span><strong>' +
      Own.formatEuro(own.liquidAfter) +
      "</strong></div>" +
      '<div class="row"><span>Réserve (mois de coût proprio)</span><strong>' +
      own.reserveMonthsLeft +
      " mois</strong></div>" +
      '<div class="row"><span>Écart vs cible (' +
      own.reserveCibleMois +
      " mois)</span><strong>" +
      (own.reserveGap > 0 ? "manque " + Own.formatEuro(own.reserveGap) : "OK") +
      "</strong></div>" +
      '<div class="row"><span>Patrimoine net après (liq. + autres)</span><strong>' +
      Own.formatEuro(own.patrimoineNetAfter) +
      "</strong></div>";

    $("bpStress").innerHTML = ["rateUp", "energyUp", "combo"]
      .map(function (k) {
        var s = own.stress[k];
        return (
          '<div class="row"><span>' +
          esc(s.label) +
          "</span><strong>" +
          Own.formatEuro(s.totalMonthly) +
          "/mois</strong></div>"
        );
      })
      .join("");

    $("bpMsgs").innerHTML = own.messages
      .map(function (m) {
        var cls =
          own.status === "block" ? "block" : own.status === "warn" || own.status === "vigilance" ? "warn" : "";
        return '<div class="bp-msg ' + cls + '">' + esc(m) + "</div>";
      })
      .join("");

    updateCta(bundle);
  }

  function creditLandingHref(params) {
    var path = location.pathname || "";
    var base =
      path.indexOf("/landings/") >= 0
        ? "./credit-immo.html"
        : "./landings/credit-immo.html";
    var qs = params && params.toString ? params.toString() : "";
    return base + (qs ? "?" + qs : "") + "#demande";
  }

  function updateCta(bundle) {
    var a = $("bpCtaCredit");
    if (!a) return;
    var own = bundle.ownership;
    var fin = bundle.finance;
    var params = new URLSearchParams({
      source: "budget_proprietaire",
      budget: String(Math.round(own.priceFai || 0)),
      apport: String(Math.round(own.cashAtSigning || 0)),
      revenus: String(Math.round(own.totalIncome || 0)),
    });
    if (fin) {
      params.set("mensualite", String(Math.round(fin.totalMonthlyHousing || 0)));
      params.set("duree", String(fin.years || 25));
    }
    a.href = creditLandingHref(params);
  }

  function run() {
    var prefs = readPrefsFromForm();
    var financeOpts = {
      netVendeur: prefs.netVendeur,
      agencyFee: prefs.agencyFee,
      feePayer: prefs.feePayer,
      downPayment: prefs.downPayment,
      monthlyIncome: prefs.monthlyIncome,
      coBorrowerIncome: prefs.coBorrowerIncome,
      existingLoansMonthly: prefs.existingLoansMonthly,
      years: prefs.years,
      ratePct: prefs.ratePct === "" ? "" : prefs.ratePct,
      notaryPreset: prefs.notaryPreset,
      financeNotary: prefs.financeNotary,
      insurancePctYear: prefs.insurancePctYear,
      loanType: "pret_amortissable",
      travaux: prefs.travauxTotal,
      financeTravaux: !!prefs.travauxInLoan,
    };
    var ownershipOpts = Object.assign({}, prefs);
    if (prefs.travauxInLoan) {
      ownershipOpts.travauxCashNow = 0;
    }
    var bundle = Own.projectWithFinance(financeOpts, ownershipOpts);
    render(bundle);
    return bundle;
  }

  function bind() {
    fillForm(Own.loadPrefs());
    applyQuery();
    ["bpForm"].forEach(function () {
      $("bpForm").addEventListener("input", function () {
        window.clearTimeout(bind._t);
        bind._t = window.setTimeout(run, 180);
      });
      $("bpForm").addEventListener("change", run);
    });
    $("bpRun").addEventListener("click", run);
    $("bpSave").addEventListener("click", function () {
      Own.savePrefs(readPrefsFromForm());
      $("bpSave").textContent = "Mémorisé ✓";
      setTimeout(function () {
        $("bpSave").textContent = "Mémoriser";
      }, 1500);
    });
    $("bpReset").addEventListener("click", function () {
      fillForm(Own.defaultPrefs());
      run();
    });
    run();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
