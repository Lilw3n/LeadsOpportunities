/**
 * Hub /immobilier/ et /immobilier/location/ — aperçu barème + simulateurs.
 */
(function () {
  function jsonUrl() {
    var nodes = document.querySelectorAll("script[src*='immobilier-bareme-embed']");
    var last = nodes[nodes.length - 1];
    var attr = last && last.getAttribute("data-bareme-json");
    return attr || "../data/bareme-honoraires-public.json";
  }

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

  function bootLocation() {
    var Lib = window.BaremeHonorairesLib;
    var surfaceEl = el("immoLocSurface");
    if (!surfaceEl || !el("immoLocTotal")) return;

    function renderLoc() {
      var zoneEl = el("immoLocZone");
      if (Lib) {
        var r = Lib.computeLocationHabitation(
          surfaceEl.value,
          zoneEl ? zoneEl.value : "tendue"
        );
        var bEl = el("immoLocBailleur");
        var lEl = el("immoLocLocataire");
        var tEl = el("immoLocTotal");
        if (!r.ok) {
          if (bEl) bEl.textContent = "—";
          if (lEl) lEl.textContent = "—";
          if (tEl) tEl.textContent = "—";
          return;
        }
        if (bEl) bEl.textContent = formatEuro(r.bailleurTtc);
        if (lEl) lEl.textContent = formatEuro(r.locataireTtc);
        if (tEl) tEl.textContent = formatEuro(r.totalAgenceTtc);
        return;
      }
      /* Fallback si la lib n’est pas chargée : taux PDF TG0422. */
      var m2 = Number(surfaceEl.value) || 0;
      var zone = zoneEl ? zoneEl.value : "tendue";
      var dossier =
        zone === "tres-tendue" || zone === "tres_tendue"
          ? 12.1
          : zone === "hors" || zone === "hors_zone"
            ? 8.07
            : 10.09;
      var bailleur = (10 + dossier + 3.03) * m2;
      var locataire = (dossier + 3.03) * m2;
      var total = bailleur + locataire;
      if (el("immoLocBailleur")) el("immoLocBailleur").textContent = formatEuro(bailleur);
      if (el("immoLocLocataire")) el("immoLocLocataire").textContent = formatEuro(locataire);
      if (el("immoLocTotal")) el("immoLocTotal").textContent = formatEuro(total);
    }

    surfaceEl.oninput = renderLoc;
    var zoneEl = el("immoLocZone");
    if (zoneEl) zoneEl.onchange = renderLoc;
    renderLoc();
  }

  function bootLocationPro() {
    var Lib = window.BaremeHonorairesLib;
    var rentEl = el("immoLocProRent");
    if (!rentEl || !el("immoLocProFee")) return;
    function render() {
      var out = el("immoLocProFee");
      if (!Lib) return;
      var r = Lib.computeLocationPro(rentEl.value);
      out.textContent = r.ok ? formatEuro(r.honorairesTtc) : "—";
    }
    rentEl.oninput = render;
    render();
  }

  function bootBailCom() {
    var Lib = window.BaremeHonorairesLib;
    var rentEl = el("immoBailRent");
    if (!rentEl || !el("immoBailTtc")) return;
    function render() {
      if (!Lib) return;
      var r = Lib.computeBailCommercial(rentEl.value);
      if (el("immoBailHt")) el("immoBailHt").textContent = r.ok ? formatEuro(r.honorairesHt) : "—";
      if (el("immoBailTtc")) el("immoBailTtc").textContent = r.ok ? formatEuro(r.honorairesTtc) : "—";
    }
    rentEl.oninput = render;
    render();
  }

  var hasVente = !!el("immoBhPrice");
  var hasLoc = !!el("immoLocSurface");
  var hasLocPro = !!el("immoLocProRent");
  var hasBail = !!el("immoBailRent");
  if (!hasVente && !hasLoc && !hasLocPro && !hasBail) return;

  if (hasLoc) bootLocation();
  if (hasLocPro) bootLocationPro();
  if (hasBail) bootBailCom();

  if (!hasVente) return;

  fetch(jsonUrl(), { cache: "no-store" })
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
