/**
 * Page publique — barème des honoraires (grille publiée Portes Clés TG0422).
 */
(function () {
  var DATA_URL = "../data/bareme-honoraires-public.json";
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
        var mid =
          b.max == null
            ? Number(b.min) || 0
            : ((Number(b.min) || 0) + Number(b.max)) / 2;
        var fee =
          b.type === "fixed"
            ? Number(b.value) || 0
            : (mid * (Number(b.value) || 0)) / 100;
        var exampleNet = b.max == null ? Number(b.min) || 0 : Number(b.max);
        var exampleFee =
          b.type === "fixed"
            ? Number(b.value) || 0
            : ((exampleNet * (Number(b.value) || 0)) / 100);
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
        return (
          "<article><strong>" +
          escapeHtml(s.name) +
          "</strong><p>" +
          escapeHtml(summary || "Voir le détail au mandat.") +
          "</p></article>"
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
    el("bhKpiNet").textContent = formatEuro(net);
    el("bhKpiFee").textContent = formatEuro(fee);
    el("bhKpiFai").textContent = formatEuro(fai);
    el("bhKpiSched").textContent = sched.name || "Vente habitation";
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

  function bind() {
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
    bind();
    var price = el("bhPrice");
    if (price) state.price = Number(price.value) || 200000;
    renderCalc();
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
