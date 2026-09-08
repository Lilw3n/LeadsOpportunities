/**
 * Hub /immobilier/ — aperçu barème public (grille choisie) + mini estimateur.
 */
(function () {
  var DATA_URL = "../data/bareme-honoraires-public.json";

  function el(id) {
    return document.getElementById(id);
  }

  function formatEuro(n) {
    return (
      (Number(n) || 0).toLocaleString("fr-FR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }) + " €"
    );
  }

  function feeForNet(net, brackets) {
    var p = Number(net) || 0;
    var list = (brackets || []).slice().sort(function (a, b) {
      return (a.min || 0) - (b.min || 0);
    });
    var bracket = null;
    for (var i = 0; i < list.length; i++) {
      var b = list[i];
      var min = Number(b.min) || 0;
      var max = b.max == null ? Infinity : Number(b.max);
      if (p >= min && p <= max) {
        bracket = b;
        break;
      }
    }
    if (!bracket && list.length) bracket = list[list.length - 1];
    if (!bracket) return { fee: 0, bracket: null };
    var fee =
      bracket.type === "fixed"
        ? Number(bracket.value) || 0
        : (p * (Number(bracket.value) || 0)) / 100;
    return { fee: Math.round(fee * 100) / 100, bracket: bracket };
  }

  function formatRange(b) {
    var min = Number(b.min) || 0;
    if (b.max == null) return "À partir de " + formatEuro(min);
    return formatEuro(min) + " → " + formatEuro(b.max);
  }

  function feeLabel(b) {
    if (b.type === "fixed") return formatEuro(b.value);
    return (Number(b.value) || 0) + " %";
  }

  function boot(data) {
    var nameEl = el("immoAgencyName");
    if (nameEl && data.agencyName) nameEl.textContent = data.agencyName;

    var hab = (data.schedules || []).find(function (s) {
      return s.kind === "vente_habitation";
    });
    if (!hab) return;

    var schedEl = el("immoBhSched");
    if (schedEl) schedEl.textContent = hab.name || "Vente habitation";

    var tbody = el("immoBhTableBody");
    if (tbody) {
      // Aperçu : paliers représentatifs + extrémités
      var preview = (hab.brackets || []).filter(function (b, idx, arr) {
        return (
          idx === 0 ||
          idx === arr.length - 1 ||
          b.min === 70001 ||
          b.min === 150001 ||
          b.min === 200001 ||
          b.min === 300001 ||
          b.min === 500001
        );
      });
      tbody.innerHTML = preview
        .map(function (b) {
          var exampleNet = b.max == null ? Number(b.min) || 0 : Number(b.max);
          var fee =
            b.type === "fixed"
              ? Number(b.value) || 0
              : (exampleNet * (Number(b.value) || 0)) / 100;
          return (
            "<tr><td>" +
            formatRange(b) +
            '</td><td class="bh-fee">' +
            feeLabel(b) +
            '</td><td class="bh-num">' +
            formatEuro(exampleNet + fee) +
            "</td></tr>"
          );
        })
        .join("");
    }

    function render() {
      var priceEl = el("immoBhPrice");
      var net = priceEl ? Number(priceEl.value) || 0 : 200000;
      var r = feeForNet(net, hab.brackets);
      var feeEl = el("immoBhFee");
      var faiEl = el("immoBhFai");
      if (feeEl) feeEl.textContent = formatEuro(r.fee);
      if (faiEl) faiEl.textContent = formatEuro(net + r.fee);
    }

    var priceEl = el("immoBhPrice");
    if (priceEl) priceEl.oninput = render;
    render();
  }

  var LOC_RATES = {
    negotiation: 6,
    edl: 3,
    dossier: { tres_tendue: 12, tendue: 10, hors_zone: 8 },
  };

  function bootLocation() {
    var surfaceEl = el("immoLocSurface");
    var zoneEl = el("immoLocZone");
    if (!surfaceEl || !el("immoLocTotal")) return;

    function renderLoc() {
      var m2 = Number(surfaceEl.value) || 0;
      var zone = zoneEl ? zoneEl.value : "hors_zone";
      var dossier = LOC_RATES.dossier[zone] || LOC_RATES.dossier.hors_zone;
      var bailleur = (LOC_RATES.negotiation + dossier + LOC_RATES.edl) * m2;
      var locataire = (dossier + LOC_RATES.edl) * m2;
      var total = (LOC_RATES.negotiation + dossier * 2 + LOC_RATES.edl * 2) * m2;
      var bEl = el("immoLocBailleur");
      var lEl = el("immoLocLocataire");
      var tEl = el("immoLocTotal");
      if (bEl) bEl.textContent = formatEuro(bailleur);
      if (lEl) lEl.textContent = formatEuro(locataire);
      if (tEl) tEl.textContent = formatEuro(total);
    }

    surfaceEl.oninput = renderLoc;
    if (zoneEl) zoneEl.onchange = renderLoc;
    renderLoc();
  }

  var hasVente = !!el("immoBhPrice");
  var hasLoc = !!el("immoLocSurface");
  if (!hasVente && !hasLoc) return;

  if (hasLoc) bootLocation();

  if (!hasVente) return;

  fetch(DATA_URL, { cache: "no-store" })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(boot)
    .catch(function () {
      var feeEl = el("immoBhFee");
      if (feeEl) feeEl.textContent = "—";
    });
})();
