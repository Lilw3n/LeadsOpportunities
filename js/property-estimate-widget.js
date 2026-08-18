/**
 * Widget estimation vente — DVF open data (local 54 + médiane nationale par commune).
 */
(function () {
  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  function fmt(n) {
    if (n == null || isNaN(n)) return "—";
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  }

  function methodLabel(m) {
    return (
      { street: "même rue", proximity: "quartier proche", commune: "commune entière" }[m] || m
    );
  }

  function renderResult(el, data) {
    if (!data.ok) {
      el.innerHTML =
        '<div class="property-estimate-result is-soft"><strong>' +
        esc(data.message || "Estimation impossible") +
        "</strong>" +
        (data.externalUrl
          ? ' <p style="margin:8px 0 0"><a href="' +
            esc(data.externalUrl) +
            '" target="_blank" rel="noopener">Voir les ventes DVF sur data.gouv.fr</a></p>'
          : "") +
        "</div>";
      return;
    }
    var est = data.estimate || {};
    var html =
      '<div class="property-estimate-result">' +
      '<div class="property-estimate-price">' +
      fmt(est.estimatedPrice) +
      "</div>" +
      '<div class="property-estimate-range">Fourchette indicative : ' +
      fmt(est.lowPrice) +
      " – " +
      fmt(est.highPrice) +
      "</div>" +
      '<span class="property-estimate-badge">Confiance ' +
      esc(data.confidence) +
      " · " +
      esc(methodLabel(data.method)) +
      " · " +
      esc(data.scope === "local_54" ? "Meurthe-et-Moselle" : "France") +
      "</span>" +
      '<div class="property-estimate-meta">' +
      esc(data.geo && data.geo.label ? data.geo.label : "") +
      (est.medianM2 ? " · ~" + esc(String(est.medianM2)) + " €/m²" : "") +
      (data.surface ? " · " + esc(String(data.surface)) + " m² saisis" : "") +
      "<br>Source : " +
      esc(data.source) +
      ". " +
      esc(data.disclaimer) +
      "</div>";

    if (data.comparables && data.comparables.length) {
      html += '<div class="property-estimate-comps"><h3>Ventes comparables (DVF)</h3><table><thead><tr><th>Date</th><th>Prix</th><th>Surface</th><th>€/m²</th><th>Distance</th></tr></thead><tbody>';
      data.comparables.forEach(function (c) {
        html +=
          "<tr><td>" +
          esc(c.year || (c.date || "").slice(0, 4)) +
          "</td><td>" +
          fmt(c.price) +
          "</td><td>" +
          esc(c.surface) +
          " m²</td><td>" +
          fmt(c.priceM2) +
          '</td><td>' +
          (c.distanceM != null ? esc(String(c.distanceM)) + " m" : "—") +
          "</td></tr>";
      });
      html += "</tbody></table></div>";
    }

    html +=
      '<div class="property-estimate-actions">' +
      '<a class="btn btn-primary" href="' +
      esc(data.sellerCta || "/landings/acheteur-immo.html?role=vendeur") +
      '">Affiner avec un conseiller</a>' +
      '<a class="btn btn-soft" href="/landings/estimation-vente.html">Nouvelle estimation</a>' +
      "</div></div>";
    el.innerHTML = html;

    if (typeof window.gtag === "function") {
      window.gtag("event", "property_estimate_done", {
        method: data.method,
        scope: data.scope,
        city: data.geo && data.geo.city,
        confidence: data.confidence,
      });
    }
  }

  async function runEstimate(form, resultEl) {
    var fd = new FormData(form);
    var params = new URLSearchParams();
    ["address", "postalCode", "city", "propertyType", "surface"].forEach(function (k) {
      var v = fd.get(k);
      if (v) params.set(k, v);
    });
    resultEl.innerHTML = '<p class="property-estimate-meta">Analyse des ventes notariées (DVF)…</p>";
    try {
      var res = await fetch("/api/property-estimate?" + params.toString());
      var data = await res.json();
      renderResult(resultEl, data);
      if (data.ok) {
        var priceInput = document.querySelector("#propertyPrice, [name='propertyPrice'], [name='price']");
        if (priceInput && !priceInput.value && data.estimate && data.estimate.estimatedPrice) {
          priceInput.value = String(data.estimate.estimatedPrice);
          try {
            priceInput.dispatchEvent(new Event("input", { bubbles: true }));
          } catch (e) {}
        }
      }
    } catch (e) {
      resultEl.innerHTML =
        '<div class="property-estimate-result is-soft">Service indisponible. Réessayez ou contactez-nous.</div>';
    }
  }

  function init(root) {
    root = root || document;
    root.querySelectorAll("[data-property-estimate]").forEach(function (wrap) {
      var form = wrap.querySelector("form");
      var resultEl = wrap.querySelector("[data-property-estimate-result]");
      if (!form || !resultEl || form.dataset.peBound) return;
      form.dataset.peBound = "1";
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        runEstimate(form, resultEl);
      });
      if (wrap.dataset.autoEstimate === "1") {
        setTimeout(function () {
          if (form.checkValidity()) runEstimate(form, resultEl);
        }, 300);
      }
    });
  }

  window.PropertyEstimate = { init: init, run: runEstimate, render: renderResult };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      init(document);
    });
  } else {
    init(document);
  }
})();
