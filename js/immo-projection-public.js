(function () {
  "use strict";

  var Lib = window.ImmoProjection;
  if (!Lib) return;

  function $(id) {
    return document.getElementById(id);
  }

  function num(id) {
    var el = $(id);
    if (!el || el.value === "" || el.value == null) return null;
    return Lib.toNum(el.value, null);
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function readInput() {
    return {
      prix: num("prix") || 0,
      surface: num("surface") || 70,
      postalCode: ($("cp") && $("cp").value) || "",
      type: ($("type") && $("type").value) || "appartement",
      dpe: ($("dpe") && $("dpe").value) || "",
      travaux: num("travaux") || 0,
      taxeFonciereAn: num("taxeFonciere"),
      chargesMensuelles: num("charges"),
      apport: num("apport") || 0,
      patrimoine: num("patrimoine") || 0,
      salaire: num("salaire") || 0,
      salaireCo: num("salaireCo") || 0,
      loyerActuel: num("loyer") || 0,
      dureeAns: num("duree") || 25,
      taux: num("taux") || 3.5,
      personnes: num("personnes") || 1,
      hasCo: (num("salaireCo") || 0) > 0,
    };
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
      kpi("Logement / mois", Lib.euro(result.possession.coutLogementMens)),
      kpi("Dont crédit", Lib.euro(result.credit.mensAc)),
      kpi("DTI banque", Lib.pct(result.budget.dtiBanque)),
      kpi("Reste à vivre", Lib.euro(result.budget.rav)),
    ].join("");

    var bars = Lib.breakdownMensuel(result);
    var max = 1;
    bars.forEach(function (b) {
      if (b.value > max) max = b.value;
    });
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
      row("Coût total projet", Lib.euro(result.acquisition.coutProjet)),
      row("À emprunter", Lib.euro(result.acquisition.aFinancer)),
      row("Épargne après apport", Lib.euro(result.acquisition.liquiditeResiduelle)),
      row("DTI réel (avec charges)", Lib.pct(result.budget.dtiReel)),
      row(
        "Écart vs loyer",
        result.budget.deltaVsLoyer == null
          ? "—"
          : (result.budget.deltaVsLoyer >= 0 ? "+" : "") +
              Lib.euro(result.budget.deltaVsLoyer) +
              "/mois"
      ),
    ].join("");

    var st = result.stress.tauxPlus1;
    $("ipStress").innerHTML = [
      st
        ? row("Si taux +1 %", Lib.euro(st.coutLogementMens) + "/mois · RAV " + Lib.euro(st.rav))
        : "",
      result.stress.energiePlus25
        ? row("Si énergie +25 %", Lib.euro(result.stress.energiePlus25.coutLogementMens) + "/mois")
        : "",
    ].join("");

    $("ipFlags").innerHTML = (result.flags || [])
      .map(function (f) {
        return '<div class="ip-flag ' + esc(f.level) + '">' + esc(f.text) + "</div>";
      })
      .join("");
  }

  function run() {
    render(Lib.project(readInput()));
  }

  var form = $("ipForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      run();
    });
    form.querySelectorAll("input, select").forEach(function (el) {
      el.addEventListener("change", run);
      el.addEventListener("input", function () {
        clearTimeout(el._t);
        el._t = setTimeout(run, 180);
      });
    });
  }

  var q = new URLSearchParams(location.search);
  ["prix", "apport", "salaire", "surface", "cp", "travaux", "taux", "patrimoine", "dpe"].forEach(function (k) {
    if (q.get(k) && $(k)) $(k).value = q.get(k);
  });
  if (q.get("propertyPrice") && $("prix")) $("prix").value = q.get("propertyPrice");
  if (q.get("downPayment") && $("apport")) $("apport").value = q.get("downPayment");
  if (q.get("income") && $("salaire")) $("salaire").value = q.get("income");

  run();
})();
