/**
 * Section estimation — champ prix + liens dépôt / rappel préremplis.
 */
(function () {
  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function formatEuro(n) {
    return (
      (Number(n) || 0).toLocaleString("fr-FR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
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
    if (!bracket) return 0;
    return bracket.type === "fixed"
      ? Number(bracket.value) || 0
      : Math.round((p * (Number(bracket.value) || 0)) / 100);
  }

  function wireBlock(root, brackets) {
    var priceInput = qs("[data-estim-price]", root);
    var modeSelect = qs("[data-estim-price-mode]", root);
    var deposit = qs("[data-estim-deposit]", root);
    var rappel = qs("[data-estim-rappel]", root);
    var hint = qs("[data-estim-fee-hint]", root);
    if (!priceInput) return;

    function sync() {
      var price = Math.max(0, Number(priceInput.value) || 0);
      var mode = modeSelect && modeSelect.value === "fai" ? "fai" : "net_vendeur";
      var net = price;
      var fee = 0;
      if (price > 0 && brackets && brackets.length) {
        if (mode === "fai") {
          // approx inverse: essayer fee from net≈price*0.95 then adjust once
          var guess = feeForNet(price * 0.95, brackets);
          net = Math.max(0, price - guess);
          fee = feeForNet(net, brackets);
          net = Math.max(0, price - fee);
        } else {
          fee = feeForNet(net, brackets);
        }
      }

      if (deposit) {
        var dep =
          "../landings/acheteur-immo.html?role=vendeur&need=estimation";
        if (price > 0) dep += "&prix=" + encodeURIComponent(String(Math.round(price)));
        if (mode === "fai") dep += "&prix_mode=fai";
        else dep += "&prix_mode=net";
        dep += "#deposer-bien";
        deposit.href = dep;
      }
      if (rappel) {
        var msg =
          "Demande d'estimation immobilière" +
          (price > 0
            ? " — prix indiqué : " +
              formatEuro(price) +
              (mode === "fai" ? " (FAI)" : " (net vendeur)")
            : "");
        var rap =
          "../landings/rappel.html?need=estimation&message=" +
          encodeURIComponent(msg);
        if (price > 0) rap += "&prix=" + encodeURIComponent(String(Math.round(price)));
        rappel.href = rap;
      }
      if (hint) {
        if (price > 0 && fee > 0) {
          hint.hidden = false;
          hint.textContent =
            "Selon le barème publié : honoraires ≈ " +
            formatEuro(fee) +
            " · FAI ≈ " +
            formatEuro(net + fee) +
            " (indicatif, négociable au mandat).";
        } else {
          hint.hidden = true;
          hint.textContent = "";
        }
      }
    }

    priceInput.addEventListener("input", sync);
    if (modeSelect) modeSelect.addEventListener("change", sync);
    sync();
  }

  function boot(brackets) {
    document.querySelectorAll("[data-estim-block]").forEach(function (root) {
      wireBlock(root, brackets);
    });
  }

  fetch("../data/bareme-honoraires-public.json", { cache: "no-store" })
    .then(function (res) {
      return res.ok ? res.json() : null;
    })
    .then(function (data) {
      var hab =
        data &&
        (data.schedules || []).find(function (s) {
          return s.kind === "vente_habitation";
        });
      boot(hab && hab.brackets ? hab.brackets : []);
    })
    .catch(function () {
      boot([]);
    });
})();
