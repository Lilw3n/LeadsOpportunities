(function () {
  "use strict";

  var Lib = window.AchatProjection;
  var LC = window.LivingCharges;
  if (!Lib) return;
  var livingApi = null;

  function $(id) {
    return document.getElementById(id);
  }

  function numVal(id) {
    var el = $(id);
    if (!el) return "";
    var raw = String(el.value || "").replace(/\s/g, "").replace(",", ".");
    if (raw === "") return "";
    var n = Number(raw);
    return isNaN(n) ? "" : n;
  }

  function strVal(id) {
    var el = $(id);
    return el ? String(el.value || "").trim() : "";
  }

  function checkedVal(name) {
    var el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : "";
  }

  function isChecked(id) {
    var el = $(id);
    return !!(el && el.checked);
  }

  function readInput() {
    var hasCo = checkedVal("hasCo") === "oui";
    return {
      prix: numVal("prix"),
      typeBien: checkedVal("typeBien") || "appartement",
      anciennete: checkedVal("anciennete") || "ancien",
      surface: numVal("surface"),
      pieces: numVal("pieces"),
      dpe: strVal("dpe") || "D",
      chauffage: strVal("chauffage") || "mixte",
      postal: strVal("postal"),
      occupants: numVal("occupants") || 1,
      coproAnnuelle: numVal("coproAnnuelle"),
      taxeFonciereAnnuelle: numVal("taxeFonciereAnnuelle"),
      travaux: numVal("travaux"),
      travauxMode: strVal("travauxMode") || "pret",
      travauxCash: numVal("travauxCash") || 0,
      apport: numVal("apport") || 0,
      epargne: numVal("epargne") || 0,
      patrimoineImmo: numVal("patrimoineImmo") || 0,
      dureeAns: numVal("dureeAns") || 25,
      taux: numVal("taux"),
      assuranceTaux: numVal("assuranceTaux"),
      hasCo: hasCo,
      salaire: numVal("salaire") || 0,
      salaireCo: hasCo ? numVal("salaireCo") || 0 : 0,
      autresRevenus: numVal("autresRevenus") || 0,
      creditsEnCours: numVal("creditsEnCours") || 0,
      pensionVersee: numVal("pensionVersee") || 0,
      loyerActuel: numVal("loyerActuel") || 0,
      enfants: numVal("enfants") || 0,
      ptzMontant: numVal("ptzMontant") || 0,
      financerFrais: isChecked("financerFrais"),
      mrhAnnuelle: numVal("mrhAnnuelle"),
      livingCharges: livingApi ? livingApi.get() : []
    };
  }

  function setVal(id, v) {
    var el = $(id);
    if (!el || v == null || v === "") return;
    el.value = String(v);
  }

  function prefillFromUrl() {
    var q = new URLSearchParams(location.search);
    function g(keys) {
      for (var i = 0; i < keys.length; i++) {
        var v = q.get(keys[i]);
        if (v != null && String(v).trim() !== "") return String(v).trim();
      }
      return "";
    }
    setVal("prix", g(["prix", "propertyPrice", "price"]));
    setVal("apport", g(["apport", "downPayment"]));
    setVal("salaire", g(["salaire", "income", "revenus"]));
    setVal("surface", g(["surface", "propertySurface"]));
    setVal("postal", g(["postal", "postalProject", "cp"]));
    var dur = g(["duree", "loanDuration", "dureeAns"]);
    if (dur) setVal("dureeAns", String(dur).replace(/\D/g, "") || dur);
    var dpe = g(["dpe"]);
    if (dpe) setVal("dpe", dpe.toUpperCase());
    var type = g(["typeBien", "propertyType"]);
    if (/maison/i.test(type)) {
      var m = document.querySelector('input[name="typeBien"][value="maison"]');
      if (m) m.checked = true;
    }
  }

  function creditUrl(input, p) {
    var qs = new URLSearchParams();
    if (input.prix) qs.set("propertyPrice", Math.round(input.prix));
    if (input.apport) qs.set("downPayment", Math.round(input.apport));
    if (input.dureeAns) qs.set("loanDuration", String(input.dureeAns));
    if (p.revenus) qs.set("income", Math.round(p.revenus));
    if (input.postal) qs.set("postalProject", input.postal);
    if (input.surface) qs.set("propertySurface", String(input.surface));
    qs.set("utm_source", "projection-achat");
    qs.set("utm_medium", "simulateur");
    qs.set("utm_campaign", "cout-reel-logement");
    qs.set("need", "credit-immo");
    return "./credit-immo.html?" + qs.toString() + "#demande";
  }

  function acheteurUrl(input) {
    var qs = new URLSearchParams();
    if (input.prix) qs.set("budgetMax", Math.round(input.prix));
    if (input.postal) qs.set("postalProject", input.postal);
    qs.set("utm_source", "projection-achat");
    qs.set("need", "acheteur-immo");
    return "./acheteur-immo.html?" + qs.toString() + "#demande";
  }

  function renderBars(breakdown, maxAn) {
    return breakdown
      .map(function (row) {
        var pctW = maxAn > 0 ? Math.max(4, Math.round((row.an / maxAn) * 100)) : 0;
        return (
          '<div class="proj-bar-row" data-id="' +
          row.id +
          '"><div class="meta"><span>' +
          row.label +
          "</span><span>" +
          Lib.euro(row.mois) +
          "/mois</span></div><div class=\"proj-bar-track\"><span style=\"width:" +
          pctW +
          '%"></span></div></div>'
        );
      })
      .join("");
  }

  function renderFlags(flags) {
    if (!flags.length) return "";
    return (
      '<ul class="proj-flags">' +
      flags
        .map(function (f) {
          return "<li class=\"" + (f.tone || "") + "\">" + f.text + "</li>";
        })
        .join("") +
      "</ul>"
    );
  }

  function renderScenarios(sc) {
    var rows = sc.durations
      .map(function (d) {
        return (
          "<tr><td>" +
          d.dureeAns +
          " ans</td><td>" +
          Lib.euro(d.mensAc) +
          "</td><td>" +
          Lib.euro(d.coutMensuelTotal) +
          "</td><td>" +
          Lib.pct(d.dti) +
          "</td><td class=\"tone-" +
          d.comfort.tone +
          "\">" +
          d.comfort.score +
          "/100</td></tr>"
        );
      })
      .join("");
    return (
      '<table class="proj-table"><thead><tr><th>Durée</th><th>Crédit+ADE</th><th>Coût réel</th><th>DTI</th><th>Score</th></tr></thead><tbody>' +
      rows +
      "</tbody></table>" +
      '<p class="proj-hint">Stress taux +1&nbsp;% (' +
      Lib.pct(sc.stress.taux) +
      ") → " +
      Lib.euro(sc.stress.coutMensuelTotal) +
      "/mois · DTI " +
      Lib.pct(sc.stress.dti) +
      " · " +
      sc.stress.comfort.verdict +
      "</p>"
    );
  }

  function updateCallbackMessage(text) {
    var form = document.querySelector("[data-callback-form] form");
    if (!form) return;
    var el = form.querySelector("#projectionMessage");
    if (!el) {
      el = document.createElement("input");
      el.type = "hidden";
      el.name = "message";
      el.id = "projectionMessage";
      form.appendChild(el);
    }
    el.value = text;
  }

  function toggleCo() {
    var wrap = $("coFields");
    if (!wrap) return;
    wrap.hidden = checkedVal("hasCo") !== "oui";
  }

  function toggleTravauxCash() {
    var wrap = $("travauxCashWrap");
    if (!wrap) return;
    wrap.hidden = strVal("travauxMode") !== "mixte";
  }

  function paint() {
    toggleCo();
    toggleTravauxCash();
    var input = readInput();
    var p = Lib.project(input);
    var sc = Lib.scenarios(input);
    var euro = Lib.euro;
    var pct = Lib.pct;

    $("kpiTotal").textContent = euro(p.coutMensuelTotal);
    $("kpiTotalSub").textContent =
      "dont crédit " + euro(p.loan.mensAc) + " + charges " + euro(p.chargesLogement);
    $("kpiDti").textContent = pct(p.dti);
    $("kpiDtiSub").textContent =
      "HCSF 35 %" +
      (p.effortPct != null ? " · effort " + pct(p.effortPct) : "");
    $("kpiRav").textContent = euro(p.rav);
    $("kpiRavSub").textContent = "plancher indicatif " + euro(p.minRav);
    $("kpiLoan").textContent = euro(p.loan.aFinancer);
    $("kpiLoanSub").textContent = p.loan.dureeAns + " ans à " + pct(p.loan.taux);

    var verdict = $("verdict");
    verdict.className = "proj-verdict proj-verdict--" + p.comfort.tone;
    verdict.innerHTML =
      "<strong>" +
      p.comfort.verdict +
      "</strong><p>Score " +
      p.comfort.score +
      "/100 — capacité d'emprunt indicative " +
      euro(p.capaciteEmprunt) +
      ", budget bien max " +
      euro(p.budgetMaxBien) +
      ".</p>" +
      '<div class="proj-score-row"><div class="proj-score-bar"><span style="width:' +
      p.comfort.score +
      '%"></span></div></div>';

    $("flags").innerHTML = renderFlags(p.flags);
    var maxAn = 0;
    p.breakdown.forEach(function (r) {
      if (r.an > maxAn) maxAn = r.an;
    });
    $("bars").innerHTML = renderBars(p.breakdown, maxAn);
    $("minis").innerHTML =
      '<div class="proj-mini"><span class="lbl">Frais d\'acquisition</span><span class="val">' +
      euro(p.loan.fraisAcq) +
      "</span></div>" +
      '<div class="proj-mini"><span class="lbl">Notaire</span><span class="val">' +
      euro(p.loan.notaire) +
      "</span></div>" +
      '<div class="proj-mini"><span class="lbl">Travaux</span><span class="val">' +
      euro(p.loan.travauxTotal) +
      "</span></div>" +
      '<div class="proj-mini"><span class="lbl">Épargne après apport</span><span class="val">' +
      euro(p.epargneApres) +
      "</span></div>" +
      '<div class="proj-mini"><span class="lbl">Coussin</span><span class="val">' +
      p.coussinMois.toLocaleString("fr-FR", { maximumFractionDigits: 1 }) +
      " mois</span></div>" +
      '<div class="proj-mini"><span class="lbl">LTV</span><span class="val">' +
      pct(p.ltv, 0) +
      "</span></div>";

    $("scenarios").innerHTML = renderScenarios(sc);

    var vs = $("vsLoyer");
    if (input.loyerActuel > 0) {
      var delta = p.vsLoyer;
      vs.hidden = false;
      vs.textContent =
        delta >= 0
          ? "Vs loyer actuel : +" + euro(delta) + " / mois une fois propriétaire."
          : "Vs loyer actuel : " + euro(delta) + " / mois (le logement coûterait moins que le loyer).";
    } else {
      vs.hidden = true;
    }

    var credit = $("ctaCredit");
    var ach = $("ctaAcheteur");
    if (credit) credit.href = creditUrl(input, p);
    if (ach) ach.href = acheteurUrl(input);

    updateCallbackMessage(Lib.summaryText(p));
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (LC && $("projLivingCharges")) {
      livingApi = LC.mount($("projLivingCharges"), [
        { id: "internet", label: "Internet", amount: 0 },
        { id: "abonnements", label: "Abonnements", amount: 0 },
        { id: "telephone", label: "Téléphone / mobile", amount: 0 },
        { id: "mutuelle", label: "Mutuelle", amount: 0 }
      ], { showDti: false });
    }
    prefillFromUrl();
    if (window.FinanceDeepLink && window.FinanceDeepLink.applyToForm) {
      window.FinanceDeepLink.applyToForm(document);
    }
    var root = $("projForm");
    if (root) {
      root.addEventListener("input", paint);
      root.addEventListener("change", paint);
    }
    paint();
  });
})();
