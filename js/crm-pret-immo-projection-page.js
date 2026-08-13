(function () {
  "use strict";

  var Lib = window.ImmoProjection;
  var Deep = window.FinanceDeepLink;
  if (!Lib) return;
  if (!localStorage.getItem("lo_token")) {
    location.href = "./crm.html";
    return;
  }

  function $(id) {
    return document.getElementById(id);
  }

  function num(id) {
    var el = $(id);
    if (!el || el.value === "" || el.value == null) return null;
    return Lib.toNum(el.value, null);
  }

  function readInput() {
    return {
      prix: num("prix") || 0,
      surface: num("surface") || 70,
      postalCode: ($("cp") && $("cp").value) || "",
      type: ($("type") && $("type").value) || "appartement",
      dpe: ($("dpe") && $("dpe").value) || "",
      chauffage: ($("chauffage") && $("chauffage").value) || "",
      neuf: !!( $("neuf") && $("neuf").checked ),
      travaux: num("travaux") || 0,
      taxeFonciereAn: num("taxeFonciere"),
      chargesMensuelles: num("charges"),
      electriciteMens: num("elec"),
      gazMens: num("gaz"),
      eauMens: num("eau"),
      mrhMens: num("mrh"),
      apport: num("apport") || 0,
      patrimoine: num("patrimoine") || 0,
      dureeAns: num("duree") || 25,
      taux: num("taux") || 3.5,
      assuranceTaux: num("assur") || 0.34,
      fraisNotaire: num("fraisNotaire"),
      salaire: num("salaire") || 0,
      salaireCo: num("salaireCo") || 0,
      autresRevenus: num("autresRev") || 0,
      creditsExistants: num("credits") || 0,
      loyerActuel: num("loyer") || 0,
      autresCharges: num("autresChg") || 0,
      personnes: num("personnes") || 1,
      hasCo: !!( $("hasCo") && $("hasCo").checked ),
      propertyId: ($("propertyId") && $("propertyId").value) || "",
    };
  }

  function render(result) {
    var v = result.verdict;
    var verd = $("ipVerdict");
    verd.className = "ip-verdict " + (v.id || "ok");
    verd.innerHTML =
      "<span>" +
      esc(v.label) +
      '</span><span class="detail">' +
      esc(v.detail) +
      "</span>";

    $("ipKpis").innerHTML = [
      kpi("Coût logement / mois", Lib.euro(result.possession.coutLogementMens)),
      kpi("Mensualité crédit", Lib.euro(result.credit.mensAc)),
      kpi("DTI banque", Lib.pct(result.budget.dtiBanque)),
      kpi("DTI réel", Lib.pct(result.budget.dtiReel)),
      kpi("Reste à vivre", Lib.euro(result.budget.rav)),
      kpi("Épargne après apport", Lib.euro(result.acquisition.liquiditeResiduelle)),
    ].join("");

    var bars = Lib.breakdownMensuel(result);
    var max = Math.max.apply(
      null,
      bars.map(function (b) {
        return b.value;
      }).concat([1])
    );
    $("ipBars").innerHTML = bars
      .map(function (b) {
        var w = Math.round((b.value / max) * 100);
        return (
          '<div class="ip-bar-row"><div><div style="margin-bottom:2px">' +
          esc(b.label) +
          '</div><div class="ip-bar-track"><i style="width:' +
          w +
          "%;background:" +
          b.color +
          '"></i></div></div><em>' +
          Lib.euro(b.value) +
          "</em></div>"
        );
      })
      .join("");

    $("ipRows").innerHTML = [
      row("Prix + travaux + frais", Lib.euro(result.acquisition.coutProjet)),
      row("Apport (" + Lib.pct(result.acquisition.apportPct) + ")", Lib.euro(result.acquisition.apport)),
      row("À financer", Lib.euro(result.acquisition.aFinancer)),
      row("Taxe foncière / an", Lib.euro(result.possession.taxeFonciereAn) + estimateTag(result.possession.estimates.taxeFonciere)),
      row("Énergie estimée / an", Lib.euro(result.possession.energieAn) + estimateTag(result.possession.estimates.energie)),
      row("Possession hors prêt / mois", Lib.euro(result.possession.coutPossessionMens)),
      row("Effort budgétaire", Lib.pct(result.budget.effortBudget)),
      row(
        "Vs loyer actuel",
        result.budget.deltaVsLoyer == null
          ? "—"
          : (result.budget.deltaVsLoyer >= 0 ? "+" : "") + Lib.euro(result.budget.deltaVsLoyer)
      ),
    ].join("");

    var st = result.stress.tauxPlus1;
    $("ipStress").innerHTML = [
      st
        ? row("Taux +1 % → mensualité", Lib.euro(st.mensAc) + " · DTI " + Lib.pct(st.dtiBanque))
        : "",
      st ? row("Taux +1 % → reste à vivre", Lib.euro(st.rav)) : "",
      result.stress.energiePlus25
        ? row("Énergie +25 % → logement / mois", Lib.euro(result.stress.energiePlus25.coutLogementMens))
        : "",
    ].join("");

    $("ipFlags").innerHTML = (result.flags || [])
      .map(function (f) {
        return '<div class="ip-flag ' + esc(f.level) + '">' + esc(f.text) + "</div>";
      })
      .join("");
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function kpi(label, value) {
    return (
      '<div class="ip-kpi"><span>' +
      esc(label) +
      "</span><strong>" +
      value +
      "</strong></div>"
    );
  }

  function row(label, value) {
    return (
      '<div class="row"><span>' +
      esc(label) +
      "</span><strong>" +
      value +
      "</strong></div>"
    );
  }

  function estimateTag(isEst) {
    return isEst ? ' <span style="color:#94a3b8;font-weight:600">(estim.)</span>' : "";
  }

  function run() {
    render(Lib.project(readInput()));
  }

  $("ipForm").addEventListener("submit", function (e) {
    e.preventDefault();
    run();
  });

  ["prix", "surface", "cp", "type", "dpe", "chauffage", "travaux", "apport", "patrimoine", "duree", "taux", "salaire", "salaireCo", "loyer", "personnes"].forEach(function (id) {
    var el = $(id);
    if (el) el.addEventListener("change", run);
  });

  $("btnToSim").addEventListener("click", function () {
    var i = readInput();
    var url =
      Deep && Deep.pretImmoUrl
        ? Deep.pretImmoUrl(
            {
              propertyPrice: i.prix,
              downPayment: i.apport,
              loanDuration: i.dureeAns,
              income: i.salaire + i.salaireCo,
              propertyId: i.propertyId,
              utmSource: "crm-projection",
            },
            { type: "immo", utmCampaign: "projection" }
          )
        : "./crm-pret-immo-sim.html?type=immo";
    if (Deep && Deep.pretImmoUrl) {
      /* enrich query manually for travaux / taux */
      url +=
        "&travaux=" +
        encodeURIComponent(i.travaux) +
        "&taux=" +
        encodeURIComponent(i.taux);
    }
    location.href = url;
  });

  $("btnLoadBien").addEventListener("click", function () {
    var id = ($("propertyId") && $("propertyId").value.trim()) || prompt("ID du bien CRM ?");
    if (!id) return;
    $("propertyId").value = id;
    var store = null;
    try {
      store = JSON.parse(localStorage.getItem("lo_crm_immo_v1") || "{}");
    } catch (e) {
      store = {};
    }
    var list = (store && store.properties) || [];
    var prop = list.find(function (p) {
      return p && p.id === id;
    });
    if (!prop) {
      alert("Bien introuvable en local. Ouvrez la fiche bien puis réessayez, ou saisissez les champs à la main.");
      return;
    }
    var base = Lib.fromProperty(prop);
    $("prix").value = base.prix || "";
    $("surface").value = base.surface || "";
    $("cp").value = base.postalCode || "";
    if (base.type) $("type").value = base.type;
    if (base.dpe) $("dpe").value = String(base.dpe).charAt(0).toUpperCase();
    if (base.chauffage) $("chauffage").value = base.chauffage;
    $("travaux").value = base.travaux || 0;
    if (base.taxeFonciereAn != null) $("taxeFonciere").value = base.taxeFonciereAn;
    if (base.chargesMensuelles != null) $("charges").value = base.chargesMensuelles;
    if (base.coutEnergieMin != null || base.coutEnergieMax != null) {
      var an = Lib.estimateEnergyAnnual(base);
      $("elec").value = Math.round(an / 12);
    }
    $("neuf").checked = !!base.neuf;
    run();
  });

  /* Prefill from query */
  var q = new URLSearchParams(location.search);
  function setIf(id, key) {
    var v = q.get(key);
    if (v != null && $(id)) $(id).value = v;
  }
  setIf("prix", "propertyPrice");
  setIf("prix", "prix");
  setIf("apport", "downPayment");
  setIf("apport", "apport");
  setIf("salaire", "income");
  setIf("propertyId", "propertyId");
  setIf("travaux", "travaux");
  setIf("surface", "surface");
  setIf("cp", "cp");
  setIf("dpe", "dpe");
  setIf("taxeFonciere", "taxeFonciere");
  if (q.get("patrimoine")) $("patrimoine").value = q.get("patrimoine");

  run();
})();
