/**
 * Page publique — barème des honoraires (grille publiée Portes Clés TG0422).
 * Vente habitation + location + bail commercial + avis de valeur.
 */
(function () {
  var DATA_URL = "../data/bareme-honoraires-public.json";
  var Lib = window.BaremeHonorairesLib;
  var state = {
    data: null,
    priceMode: "net_vendeur",
    price: 200000,
  };

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

  function formatRange(b) {
    var min = Number(b.min) || 0;
    if (b.max == null) {
      return "À partir de " + formatEuro(min);
    }
    return formatEuro(min) + " → " + formatEuro(b.max);
  }

  function feeLabel(b) {
    if (b.type === "fixed") return formatEuro(b.value) + " TTC";
    return (Number(b.value) || 0) + " % TTC";
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

  function netFromFai(fai, brackets) {
    var f = Math.max(0, Number(fai) || 0);
    var list = (brackets || []).slice().sort(function (a, b) {
      return (a.min || 0) - (b.min || 0);
    });
    for (var i = 0; i < list.length; i++) {
      var b = list[i];
      var net;
      var fee;
      if (b.type === "fixed") {
        fee = Number(b.value) || 0;
        net = Math.round((f - fee) * 100) / 100;
      } else {
        var pct = Number(b.value) || 0;
        net = Math.round((f / (1 + pct / 100)) * 100) / 100;
        fee = Math.round((f - net) * 100) / 100;
      }
      var min = Number(b.min) || 0;
      var max = b.max == null ? Infinity : Number(b.max);
      if (net >= min && net <= max && net >= 0) {
        return { ok: true, net: net, fee: fee, bracket: b };
      }
    }
    var guess = feeForNet(f * 0.95, brackets);
    return {
      ok: true,
      approximate: true,
      net: Math.max(0, f - guess.fee),
      fee: guess.fee,
      bracket: guess.bracket,
    };
  }

  function habitationSchedule() {
    if (!state.data || !state.data.schedules) return null;
    return (
      state.data.schedules.find(function (s) {
        return s.kind === "vente_habitation";
      }) || state.data.schedules[0]
    );
  }

  function renderMeta() {
    var chip = el("bhAgencyChip");
    var source = el("bhSource");
    if (chip && state.data) {
      chip.innerHTML =
        "<strong>" +
        escapeHtml(state.data.agencyName) +
        '</strong> <em>grille choisie</em>';
    }
    if (source && state.data) {
      source.textContent = state.data.source || "";
    }
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderTable(activeMin) {
    var wrap = el("bhTableBody");
    var sched = habitationSchedule();
    if (!wrap || !sched) return;
    var brackets = sched.brackets || [];
    wrap.innerHTML = brackets
      .map(function (b) {
        var exampleNet = b.max == null ? Number(b.min) || 0 : Number(b.max);
        var exampleFee =
          b.type === "fixed"
            ? Number(b.value) || 0
            : (exampleNet * (Number(b.value) || 0)) / 100;
        var fai = exampleNet + exampleFee;
        var isActive =
          activeMin != null && Number(b.min) === Number(activeMin);
        return (
          '<tr class="' +
          (isActive ? "is-active" : "") +
          '">' +
          "<td>" +
          formatRange(b) +
          "</td>" +
          '<td class="bh-fee">' +
          feeLabel(b) +
          "</td>" +
          '<td class="bh-num">' +
          formatEuro(fai) +
          "</td>" +
          "</tr>"
        );
      })
      .join("");
  }

  var OTHER_HREF = {
    vente_pro: "#vente-autres",
    location_habitation: "#location",
    location_pro: "#location-pro",
    bail_commercial: "#bail-commercial",
    avis_valeur: "#avis-valeur",
  };

  function renderOther() {
    var root = el("bhOther");
    if (!root || !state.data) return;
    var others = (state.data.schedules || []).filter(function (s) {
      return s.kind !== "vente_habitation";
    });
    root.innerHTML = others
      .map(function (s) {
        var summary = s.summary;
        if (!summary && s.brackets && s.brackets[0]) {
          summary = feeLabel(s.brackets[0]);
        }
        var href = OTHER_HREF[s.kind] || "#location";
        return (
          '<a class="bh-other-card" href="' +
          href +
          '"><strong>' +
          escapeHtml(s.name) +
          "</strong><p>" +
          escapeHtml(summary || "Voir le détail au mandat.") +
          "</p><span>Simuler →</span></a>"
        );
      })
      .join("");
  }

  function renderCalc() {
    var sched = habitationSchedule();
    if (!sched) return;
    var input = Number(state.price) || 0;
    var net;
    var fee;
    var bracket;
    var approx = false;

    if (state.priceMode === "fai") {
      var inv = netFromFai(input, sched.brackets);
      net = inv.net;
      fee = inv.fee;
      bracket = inv.bracket;
      approx = !!inv.approximate;
    } else {
      var r = feeForNet(input, sched.brackets);
      net = input;
      fee = r.fee;
      bracket = r.bracket;
    }

    var fai = Math.round((net + fee) * 100) / 100;
    if (el("bhKpiNet")) el("bhKpiNet").textContent = formatEuro(net);
    if (el("bhKpiFee")) el("bhKpiFee").textContent = formatEuro(fee);
    if (el("bhKpiFai")) el("bhKpiFai").textContent = formatEuro(fai);
    if (el("bhKpiSched")) el("bhKpiSched").textContent = sched.name || "Vente habitation";
    var hint = el("bhCalcHint");
    if (hint) {
      hint.textContent = approx
        ? "Approximation : FAI hors plage exacte — palier le plus proche."
        : bracket
          ? "Palier appliqué : " + formatRange(bracket) + " → " + feeLabel(bracket)
          : "";
    }
    renderTable(bracket ? bracket.min : null);
  }

  function setText(id, text) {
    var node = el(id);
    if (node) node.textContent = text;
  }

  function renderLocationHab() {
    if (!Lib || !el("bhLocSurface")) return;
    var r = Lib.computeLocationHabitation(
      el("bhLocSurface").value,
      el("bhLocZone") ? el("bhLocZone").value : "tendue"
    );
    if (!r.ok) {
      setText("bhLocBailleur", "—");
      setText("bhLocLocataire", "—");
      setText("bhLocTotal", "—");
      setText("bhLocHint", "Indiquez une surface habitable.");
      return;
    }
    setText("bhLocBailleur", formatEuro(r.bailleurTtc));
    setText("bhLocLocataire", formatEuro(r.locataireTtc));
    setText("bhLocTotal", formatEuro(r.totalAgenceTtc));
    setText(
      "bhLocNego",
      formatEuro(r.lines.negotiationBailleur)
    );
    setText("bhLocDossier", formatEuro(r.lines.dossierBailleur) + " / partie");
    setText("bhLocEdl", formatEuro(r.lines.edlBailleur) + " / partie");
    setText(
      "bhLocHint",
      r.zone.label +
        " · " +
        r.zone.dossierTtcPerM2.toLocaleString("fr-FR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) +
        " € TTC/m² (dossier) · décret 2014-890 : part locataire ≤ part bailleur."
    );
  }

  function renderLocationPro() {
    if (!Lib || !el("bhLocProRent")) return;
    var r = Lib.computeLocationPro(el("bhLocProRent").value);
    if (!r.ok) {
      setText("bhLocProFee", "—");
      setText("bhLocProHint", "Indiquez le loyer TTC annuel.");
      return;
    }
    setText("bhLocProFee", formatEuro(r.honorairesTtc));
    setText(
      "bhLocProHint",
      "18 % TTC de " +
        formatEuro(r.annualRentTtc) +
        " — à la charge du preneur sauf convention."
    );
  }

  function renderBailCom() {
    if (!Lib || !el("bhBailRent")) return;
    var r = Lib.computeBailCommercial(el("bhBailRent").value);
    if (!r.ok) {
      setText("bhBailHt", "—");
      setText("bhBailTtc", "—");
      setText("bhBailHint", "Indiquez le loyer annuel HT (principal).");
      return;
    }
    setText("bhBailHt", formatEuro(r.honorairesHt));
    setText("bhBailTtc", formatEuro(r.honorairesTtc));
    setText(
      "bhBailRaw",
      formatEuro(r.rawHt)
    );
    setText(
      "bhBailHint",
      r.appliedMinimum
        ? "30 % de " +
            formatEuro(r.annualRentHt) +
            " = " +
            formatEuro(r.rawHt) +
            " HT, inférieur au minimum : application de 7 000 € HT."
        : "30 % HT de " +
            formatEuro(r.annualRentHt) +
            " — à la charge du preneur. TTC = HT × 1,20."
    );
  }

  function renderVenteAutres() {
    if (!Lib || !el("bhProPrice")) return;
    var r = Lib.computeVenteAutres(el("bhProPrice").value);
    if (!r.ok) {
      setText("bhProFee", "—");
      setText("bhProFai", "—");
      setText("bhProHint", "Indiquez le prix (hors honoraires).");
      return;
    }
    setText("bhProFee", formatEuro(r.honorairesTtc));
    setText("bhProFai", formatEuro(r.fai));
    setText(
      "bhProHint",
      "10 % TTC de " +
        formatEuro(r.price) +
        " — charge vendeur sauf convention contraire."
    );
  }

  function renderAvis() {
    if (!Lib || !el("bhAvisSurface")) return;
    var kind = el("bhAvisKind") ? el("bhAvisKind").value : "appartement";
    var r = Lib.computeAvisValeur(kind, el("bhAvisSurface").value);
    if (!r.ok) {
      setText("bhAvisFee", "—");
      setText("bhAvisHint", "Indiquez la surface.");
      return;
    }
    if (r.eligibleForfait) {
      setText("bhAvisFee", formatEuro(r.honorairesTtc));
      setText(
        "bhAvisHint",
        "Forfait 360 € TTC — " +
          (r.kind === "maison" ? "maison < 100 m²" : "appartement < 50 m²") +
          ". Charge propriétaire."
      );
    } else {
      setText("bhAvisFee", "Sur devis");
      setText(
        "bhAvisHint",
        r.kind === "maison"
          ? "Maison ≥ 100 m² : tarif sur devis (hors forfait 360 €)."
          : "Appartement ≥ 50 m² : tarif sur devis (hors forfait 360 €)."
      );
    }
  }

  function bindSims() {
    [
      ["bhLocSurface", "input", renderLocationHab],
      ["bhLocZone", "change", renderLocationHab],
      ["bhLocProRent", "input", renderLocationPro],
      ["bhBailRent", "input", renderBailCom],
      ["bhProPrice", "input", renderVenteAutres],
      ["bhAvisSurface", "input", renderAvis],
      ["bhAvisKind", "change", renderAvis],
    ].forEach(function (row) {
      var node = el(row[0]);
      if (node) node.addEventListener(row[1], row[2]);
    });
  }

  function bindVente() {
    var mode = el("bhPriceMode");
    var price = el("bhPrice");
    var label = el("bhPriceLabel");
    if (mode) {
      mode.onchange = function () {
        state.priceMode = mode.value === "fai" ? "fai" : "net_vendeur";
        if (label) {
          label.textContent =
            state.priceMode === "fai"
              ? "Prix FAI (€)"
              : "Prix net vendeur (€)";
        }
        renderCalc();
      };
    }
    if (price) {
      price.oninput = function () {
        state.price = Number(price.value) || 0;
        renderCalc();
      };
    }
  }

  function boot(data) {
    state.data = data;
    renderMeta();
    renderOther();
    bindVente();
    bindSims();
    var price = el("bhPrice");
    if (price) state.price = Number(price.value) || 200000;
    renderCalc();
    renderLocationHab();
    renderLocationPro();
    renderBailCom();
    renderVenteAutres();
    renderAvis();
  }

  fetch(DATA_URL, { cache: "no-store" })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(boot)
    .catch(function (err) {
      var hint = el("bhCalcHint");
      if (hint) {
        hint.textContent =
          "Impossible de charger la grille publiée (" +
          (err.message || err) +
          ").";
      }
    });
})();
