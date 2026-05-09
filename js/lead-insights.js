/**
 * Apres envoi lead : scoring affiche + comparatif simule (UX type plateforme).
 * Ecoute lo:lead-sent { detail: { payload, result } }
 */
(function () {
  function normalizeVertical(payload) {
    var v = String(payload.vertical || "");
    if (v === "immo") return "credit_immo";
    return v;
  }

  function verticalLabel(v) {
    var n = normalizeVertical({ vertical: v });
    if (n === "vtc" || String(v || "").indexOf("vtc") !== -1) return "Assurance VTC";
    if (n === "sante") return "Sante";
    if (n === "credit_immo") return "Credit immo";
    return "Demande";
  }

  function tier(score) {
    if (score >= 75) return { label: "Prospect chaud", className: "is-hot" };
    if (score >= 55) return { label: "Bon potentiel", className: "is-warm" };
    return { label: "A qualifier au rappel", className: "is-cold" };
  }

  function fakeOffers(vertical, score) {
    var v = normalizeVertical({ vertical: vertical });
    var base = v === "sante" ? 42 : v === "credit_immo" ? 890 : 160;
    var jitter = function (i) {
      return Math.round(base * (0.92 + i * 0.06 + score / 500));
    };
    var labels =
      v === "sante"
        ? [
            ["Harmonie", "Sante Confort", ["Hospitalisation", "Optique", "Dentaire"]],
            ["Zen", "Essentiel+", ["Hospitalisation", "Medecines douces"]],
            ["Blue", "Serenite", ["Hospitalisation", "Maternite", "Optique"]],
          ]
        : v === "credit_immo"
          ? [
              ["HomeBank", "Pret fixe 20 ans", ["Assurance emprunteur", "Frais dossier"]],
              ["MetroFinance", "Taux negocie", ["Modulation mensualite"]],
              ["CapCredit", "Pack jeune actif", ["Franchise assurance"]],
            ]
          : [
              ["RoutePro", "Pro Zen Auto", ["RC", "Vol", "Bris de glace"]],
              ["Atlas", "VTC Plus", ["Defense recours", "Assistance 0 km"]],
              ["CityCover", "Business Line", ["Garantie conducteur", "Materiel"]],
            ];
    return labels.map(function (row, i) {
      return { brand: row[0], product: row[1], premium: jitter(i), tags: row[2], highlight: i === 0 };
    });
  }

  function render(root, payload, result) {
    var vertical = normalizeVertical(payload);
    var score = (result && result.leadScore) || payload.leadScore || 55;
    var t = tier(score);
    var offers = fakeOffers(vertical, score);
    var leadId = (result && result.leadId) || "";

    root.hidden = false;
    root.className = "lead-insights";
    root.innerHTML =
      '<div class="lead-insights-inner">' +
      '<div class="lead-insights-head">' +
      "<h3>Merci — votre demande est transmise</h3>" +
      "<p class=\"lead-insights-sub\">Apercu pedagogique (simulation). Un conseiller valide les garanties et tarifs reels avec vous.</p>" +
      "</div>" +
      '<div class="lead-score-row">' +
      '<div class="lead-score-badge ' +
      t.className +
      '">' +
      "<span class=\"lead-score-num\">" +
      score +
      "</span>" +
      "<span class=\"lead-score-label\">/ 100 · " +
      t.label +
      "</span>" +
      "</div>" +
      (leadId
        ? '<p class="lead-id">Ref. technique : <code>' +
          leadId.slice(0, 8) +
          "</code></p>"
        : "") +
      "</div>" +
      '<div class="lead-offers">' +
      offers
        .map(function (o) {
          return (
            '<article class="lead-offer ' +
            (o.highlight ? "is-best" : "") +
            '">' +
            '<div class="lead-offer-top">' +
            "<strong>" +
            o.brand +
            "</strong>" +
            "<span>" +
            o.product +
            "</span>" +
            "</div>" +
            '<div class="lead-offer-price">' +
            "Des " +
            o.premium +
            " EUR / mois <small>(estimation indicative)</small>" +
            "</div>" +
            "<ul>" +
            o.tags
              .map(function (x) {
                return "<li>" + x + "</li>";
              })
              .join("") +
            "</ul>" +
            "</article>"
          );
        })
        .join("") +
      "</div>" +
      '<p class="lead-insights-foot">Priorite : rappel sous les heures ouvrables — ' +
      verticalLabel(vertical) +
      ".</p>" +
      "</div>";
  }

  document.addEventListener("lo:lead-sent", function (ev) {
    var d = ev.detail || {};
    var roots = document.querySelectorAll("[data-lead-insights]");
    if (!roots.length) return;
    roots.forEach(function (root) {
      render(root, d.payload || {}, d.result || {});
    });
  });
})();
