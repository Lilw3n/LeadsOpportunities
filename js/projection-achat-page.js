/**
 * UI simulateur projection achat — page publique & CRM.
 */
(function () {
  var PA = window.ProjectionAchat;
  var BF = window.CrmBuyerFinance;
  var Deep = window.FinanceDeepLink;

  if (!PA) return;

  function $(id) {
    return document.getElementById(id);
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  function num(id) {
    var el = $(id);
    if (!el) return null;
    var v = el.value;
    if (v === "" || v == null) return "";
    var n = Number(String(v).replace(/\s/g, "").replace(",", "."));
    return isNaN(n) ? "" : n;
  }

  function readForm() {
    return {
      fai: num("projFai") || num("projPrice") || 250000,
      netVendeur: num("projNet") || num("projFai") || 250000,
      agencyFee: num("projAgencyFee") || 0,
      surface: num("projSurface") || 65,
      dpe: ($("projDpe") && $("projDpe").value) || "D",
      heating: ($("projHeating") && $("projHeating").value) || "gaz",
      householdSize: num("projPersons") || 2,
      taxeFonciere: num("projTaxe"),
      taxeFoncierePct: num("projTaxePct") || 0.9,
      chargesCopro: num("projCopro") || 0,
      electricityMonthly: num("projElec"),
      gasMonthly: num("projGas"),
      waterMonthly: num("projWater"),
      travaux: num("projTravaux") || 0,
      financeTravaux: $("projFinanceTravaux") ? $("projFinanceTravaux").checked : true,
      maintenancePct: num("projMaintPct") || 0.6,
      monthlyIncome: num("projIncome") || 3200,
      coBorrowerIncome: num("projCoIncome") || 0,
      existingLoansMonthly: num("projExisting") || 0,
      downPayment: num("projApport") || 30000,
      liquidAssets: num("projPatrimoine") || 50000,
      years: num("projYears") || 25,
      ratePct: num("projRate"),
      dtiMax: num("projDti") || 35,
      notaryPreset: ($("projNotary") && $("projNotary").value) || "ancien",
      financeNotary: $("projFinanceNotary") ? $("projFinanceNotary").value !== "0" : true,
      feePayer: ($("projFeePayer") && $("projFeePayer").value) || "vendeur",
      insurancePctYear: num("projInsur") || 0.34,
      currentRent: num("projRent") || 0,
    };
  }

  function stressBadge(stress) {
    var labels = { ok: "Projet tenable", warn: "Points de vigilance", block: "Projet tendu" };
    return '<span class="proj-badge ' + esc(stress) + '">' + esc(labels[stress] || stress) + "</span>";
  }

  function renderBreakdown(breakdown, total) {
    if (!breakdown || !breakdown.length) return "";
    var max = Math.max.apply(null, breakdown.map(function (b) {
      return b.amount;
    }).concat([1]));
    return breakdown
      .filter(function (b) {
        return b.amount > 0;
      })
      .map(function (b) {
        var pct = Math.round((b.amount / max) * 100);
        var cls = b.group === "financement" ? "fin" : "pos";
        return (
          '<div class="proj-bar-row">' +
          '<span class="proj-bar-label" title="' +
          esc(b.label) +
          '">' +
          esc(b.label) +
          "</span>" +
          '<div class="proj-bar-track"><div class="proj-bar-fill ' +
          cls +
          '" style="width:' +
          pct +
          '%"></div></div>' +
          '<span class="proj-bar-amt">' +
          PA.formatEuro(b.amount) +
          "</span>" +
          "</div>"
        );
      })
      .join("");
  }

  function renderRollup(rollup) {
    if (!rollup || !rollup.length) return "";
    var rows = rollup
      .map(function (r) {
        return (
          "<tr>" +
          "<td>" +
          r.years +
          " ans</td>" +
          '<td class="num">' +
          PA.formatEuro(r.creditPaid) +
          "</td>" +
          '<td class="num">' +
          PA.formatEuro(r.ownershipCost) +
          "</td>" +
          '<td class="num"><strong>' +
          PA.formatEuro(r.totalOut) +
          "</strong></td>" +
          '<td class="num">' +
          (r.remainingDebt > 0 ? PA.formatEuro(r.remainingDebt) : "—") +
          "</td>" +
          "</tr>"
        );
      })
      .join("");
    return (
      '<div class="proj-table-wrap"><table class="proj-table"><thead><tr>' +
      "<th>Horizon</th><th>Crédit remboursé</th><th>Charges bien</th><th>Total sorti</th><th>CRD</th>" +
      "</tr></thead><tbody>" +
      rows +
      "</tbody></table></div>"
    );
  }

  function renderAmortization(schedule) {
    if (!schedule || !schedule.rows.length) return "";
    var preview = schedule.rows.slice(0, 12);
    var rows = preview
      .map(function (r) {
        return (
          "<tr>" +
          "<td>Mois " +
          r.month +
          "</td>" +
          '<td class="num">' +
          PA.formatEuro(r.payment) +
          "</td>" +
          '<td class="num">' +
          PA.formatEuro(r.capital) +
          "</td>" +
          '<td class="num">' +
          PA.formatEuro(r.interest) +
          "</td>" +
          '<td class="num">' +
          PA.formatEuro(r.balance) +
          "</td>" +
          "</tr>"
        );
      })
      .join("");
    return (
      '<div class="proj-table-wrap"><table class="proj-table"><thead><tr>' +
      "<th>Échéance</th><th>Mensualité</th><th>Capital</th><th>Intérêts</th><th>CRD</th>" +
      "</tr></thead><tbody>" +
      rows +
      "</tbody></table></div>" +
      (schedule.truncated
        ? '<p class="proj-hint">Aperçu 12 premiers mois — coût total intérêts : ' +
          PA.formatEuro(schedule.totalInterest) +
          "</p>"
        : "")
    );
  }

  function updateCtas(data, result) {
    if (!Deep) return;
    var payload = {
      propertyPrice: data.fai,
      prixFai: data.fai,
      prixNet: data.netVendeur,
      downPayment: data.downPayment,
      loanDuration: data.years,
      income: data.monthlyIncome,
      propertyId: data.propertyId || "",
    };
    var credit = Deep.creditUrl(payload);
    var acheteur = Deep.acheteurUrl(payload);
    [["projCtaCredit", credit], ["projCtaAcheteur", acheteur]].forEach(function (pair) {
      var el = $(pair[0]);
      if (el) el.href = pair[1];
    });
    var hint = $("projCtaHint");
    if (hint && result) {
      hint.textContent =
        "Prérempli : FAI " +
        PA.formatEuro(data.fai) +
        " · apport " +
        PA.formatEuro(data.downPayment) +
        " · mensualité totale ~" +
        PA.formatEuro(result.totalMonthly) +
        "/mois";
    }
  }

  function render() {
    var data = readForm();
    PA.savePrefs(data);
    var result = PA.analyze(data);

    var badgeEl = $("projStressBadge");
    if (badgeEl) badgeEl.innerHTML = stressBadge(result.stress);

    var kpis = $("projKpis");
    if (kpis) {
      var kpiClass = result.stress === "ok" ? "ok" : result.stress === "warn" ? "warn" : "block";
      kpis.innerHTML =
        '<div class="proj-kpi hero"><span>Coût mensuel total (crédit + charges)</span><strong>' +
        PA.formatEuro(result.totalMonthly) +
        "/mois</strong></div>" +
        '<div class="proj-kpi"><span>Crédit + assurance</span><strong>' +
        PA.formatEuro(result.housingMonthly) +
        "</strong></div>" +
        '<div class="proj-kpi"><span>Charges du bien</span><strong>' +
        PA.formatEuro(result.ownershipMonthly) +
        "</strong></div>" +
        '<div class="proj-kpi ' +
        kpiClass +
        '"><span>Endettement global</span><strong>' +
        PA.formatPct(result.debtRatio) +
        "</strong></div>" +
        '<div class="proj-kpi"><span>Reste à vivre</span><strong>' +
        PA.formatEuro(result.resteAVivre) +
        "</strong></div>" +
        '<div class="proj-kpi"><span>Apport / FAI</span><strong>' +
        PA.formatPct(result.patrimoine.apportPct) +
        "</strong></div>" +
        '<div class="proj-kpi"><span>Épargne après achat</span><strong>' +
        PA.formatEuro(result.patrimoine.remaining) +
        "</strong></div>" +
        '<div class="proj-kpi"><span>À emprunter</span><strong>' +
        PA.formatEuro(result.loanAmount) +
        "</strong></div>";
    }

    var breakdown = $("projBreakdown");
    if (breakdown) {
      breakdown.innerHTML = renderBreakdown(result.monthlyBreakdown, result.totalMonthly);
    }

    var rollup = $("projRollup");
    if (rollup) rollup.innerHTML = renderRollup(result.rollup);

    var amort = $("projAmort");
    if (amort) amort.innerHTML = renderAmortization(result.amortization);

    var msg = $("projMessages");
    if (msg) msg.textContent = result.messages.join(" · ");

    var energyHint = $("projEnergyHint");
    if (energyHint && result.energy) {
      energyHint.textContent =
        "DPE " +
        result.energy.dpe +
        " · ~" +
        result.energy.annualKwh +
        " kWh/an · chauffage " +
        result.energy.heating +
        " — estimations modifiables manuellement.";
    }

    var taxHint = $("projTaxHint");
    if (taxHint && result.taxeFonciere) {
      taxHint.textContent = result.taxeFonciere.detail + " → " + PA.formatEuro(result.taxeFonciere.annual) + "/an";
    }

    if (result.vsRent) {
      var rentEl = $("projVsRent");
      if (rentEl) {
        rentEl.hidden = false;
        rentEl.textContent =
          "Vs loyer actuel (" +
          PA.formatEuro(result.vsRent.currentRent) +
          ") : " +
          (result.vsRent.cheaper ? "moins cher" : "plus cher") +
          " de " +
          PA.formatEuro(Math.abs(result.vsRent.delta)) +
          "/mois en coût total.";
      }
    }

    updateCtas(data, result);
    return result;
  }

  function applyUrlParams() {
    if (!Deep) return;
    var p = Deep.readParams();
    function set(id, val) {
      if (val == null || val === "") return;
      var el = $(id);
      if (!el) return;
      el.value = String(val);
    }
    if (p.propertyPrice != null) {
      set("projFai", Math.round(p.propertyPrice));
      set("projPrice", Math.round(p.propertyPrice));
    }
    if (p.prixNet != null) set("projNet", Math.round(p.prixNet));
    if (p.downPayment != null) set("projApport", Math.round(p.downPayment));
    if (p.loanDuration != null) set("projYears", Math.round(p.loanDuration));
    if (p.income != null) set("projIncome", Math.round(p.income));
    var surf = new URLSearchParams(location.search).get("surface");
    if (surf) set("projSurface", surf);
    var dpe = new URLSearchParams(location.search).get("dpe");
    if (dpe) set("projDpe", dpe.toUpperCase());
    var taxe = new URLSearchParams(location.search).get("taxeFonciere");
    if (taxe) set("projTaxe", taxe);
    var copro = new URLSearchParams(location.search).get("chargesCopro");
    if (copro) set("projCopro", copro);
    var travaux = new URLSearchParams(location.search).get("travaux");
    if (travaux) set("projTravaux", travaux);
    var pat = new URLSearchParams(location.search).get("patrimoine");
    if (pat) set("projPatrimoine", pat);
  }

  function bind() {
    var root = $("projSimRoot");
    if (!root) return;

    applyUrlParams();
    var prefs = PA.loadPrefs();
    Object.keys(prefs).forEach(function (key) {
      var map = {
        fai: "projFai",
        netVendeur: "projNet",
        surface: "projSurface",
        dpe: "projDpe",
        heating: "projHeating",
        householdSize: "projPersons",
        chargesCopro: "projCopro",
        travaux: "projTravaux",
        monthlyIncome: "projIncome",
        coBorrowerIncome: "projCoIncome",
        existingLoansMonthly: "projExisting",
        downPayment: "projApport",
        liquidAssets: "projPatrimoine",
        years: "projYears",
        dtiMax: "projDti",
        currentRent: "projRent",
      };
      var id = map[key];
      if (!id) return;
      var el = $(id);
      if (el && el.value === "" && prefs[key] !== "" && prefs[key] != null) {
        el.value = String(prefs[key]);
      }
    });

    root.addEventListener("input", render);
    root.addEventListener("change", render);

    var coToggle = $("projShowCo");
    if (coToggle) {
      coToggle.addEventListener("change", function () {
        var wrap = $("projCoWrap");
        if (wrap) wrap.hidden = !coToggle.checked;
        render();
      });
    }

    var advToggle = $("projShowAdv");
    if (advToggle) {
      advToggle.addEventListener("change", function () {
        ["projAdvWrap", "projEnergyAdv"].forEach(function (id) {
          var el = $(id);
          if (el) el.hidden = !advToggle.checked;
        });
        render();
      });
    }

    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }

  window.ProjectionAchatPage = { render: render, readForm: readForm };
})();
