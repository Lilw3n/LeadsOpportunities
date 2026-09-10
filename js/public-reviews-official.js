/**
 * Public — <section data-reviews-official></section>
 */
(function () {
  var Lib = window.ReviewsOfficial;
  if (!Lib) return;

  function loadTpScript() {
    if (document.getElementById("tp-bootstrap")) return;
    var s = document.createElement("script");
    s.id = "tp-bootstrap";
    s.async = true;
    s.src = "https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js";
    document.head.appendChild(s);
  }

  function injectLd(cfg) {
    var agg = Lib.aggregateRatingLd(cfg);
    if (!agg) return;
    var nodes = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < nodes.length; i++) {
      try {
        var data = JSON.parse(nodes[i].textContent || "{}");
        var t = data["@type"];
        var ok =
          t === "Organization" ||
          t === "LocalBusiness" ||
          (Array.isArray(t) && (t.indexOf("Organization") !== -1 || t.indexOf("LocalBusiness") !== -1));
        if (ok) {
          data.aggregateRating = agg;
          nodes[i].textContent = JSON.stringify(data);
          return;
        }
      } catch (e) {}
    }
  }

  function trustBox(cfg, templateId, height) {
    if (!Lib.hasTrustpilot(cfg) || !cfg.display.showTrustBox) return "";
    loadTpScript();
    var tp = cfg.trustpilot;
    return (
      '<div class="trustpilot-widget" data-locale="' +
      Lib.esc(tp.locale) +
      '" data-template-id="' +
      Lib.esc(templateId) +
      '" data-businessunit-id="' +
      Lib.esc(tp.businessUnitId) +
      '" data-style-height="' +
      Lib.esc(height) +
      '" data-style-width="100%" data-theme="' +
      Lib.esc(tp.theme) +
      '" data-stars="' +
      Lib.esc(tp.stars) +
      '" data-review-languages="fr"><a href="' +
      Lib.esc(tp.profileUrl || "https://fr.trustpilot.com/") +
      '" target="_blank" rel="noopener">Trustpilot</a></div>'
    );
  }

  function scoreStrip(cfg) {
    if (!cfg.display.showScoreStrip) return "";
    var html = [];
    var primary = Lib.primaryScore(cfg);
    if (primary) {
      html.push(
        '<div class="ro-score-card"><div class="ro-score-value">' +
          Lib.esc(String(primary.score)) +
          '<span>/5</span></div><div class="ro-score-stars">' +
          Lib.starsHtml(primary.score) +
          '</div><p class="ro-score-meta">' +
          Lib.esc(String(Math.round(primary.reviewCount))) +
          " avis officiels</p></div>"
      );
    }
    if (cfg.display.showGoogleBadge && Lib.hasOfficialScore(cfg.google)) {
      html.push(
        '<div class="ro-score-card ro-score-card--google"><div class="ro-score-value">' +
          Lib.esc(String(cfg.google.score)) +
          '<span>/5</span></div><p class="ro-score-meta">Google · ' +
          Lib.esc(String(Math.round(cfg.google.reviewCount))) +
          " avis</p>" +
          (cfg.google.reviewUrl
            ? '<a class="ro-link" href="' +
              Lib.esc(cfg.google.reviewUrl) +
              '" target="_blank" rel="noopener noreferrer">Voir sur Google</a>'
            : "") +
          "</div>"
      );
    }
    if (!html.length && !Lib.hasTrustpilot(cfg)) {
      return (
        '<div class="ro-setup-hint">Activez Trustpilot dans le CRM (Avis officiels) : Business Unit ID + lien profil. Aucune note n’est affichée tant qu’elle n’est pas vérifiée.</div>'
      );
    }
    return html.length ? '<div class="ro-score-strip">' + html.join("") + "</div>" : "";
  }

  function actions(cfg) {
    var out = [];
    if (cfg.trustpilot.profileUrl) {
      out.push(
        '<a class="ro-cta" href="' +
          Lib.esc(cfg.trustpilot.profileUrl) +
          '" target="_blank" rel="noopener noreferrer">Voir nos avis Trustpilot</a>'
      );
    }
    if (cfg.google.reviewUrl) {
      out.push(
        '<a class="ro-cta ro-cta--ghost" href="' +
          Lib.esc(cfg.google.reviewUrl) +
          '" target="_blank" rel="noopener noreferrer">Avis Google</a>'
      );
    } else if (cfg.trustpilot.inviteUrl) {
      out.push(
        '<a class="ro-cta ro-cta--ghost" href="' +
          Lib.esc(cfg.trustpilot.inviteUrl) +
          '" target="_blank" rel="noopener noreferrer">Donner mon avis</a>'
      );
    }
    return out.length ? '<div class="ro-actions">' + out.join("") + "</div>" : "";
  }

  function isConfigured(cfg) {
    return (
      Lib.hasTrustpilot(cfg) ||
      !!Lib.primaryScore(cfg) ||
      !!(cfg.google && (cfg.google.reviewUrl || Lib.hasOfficialScore(cfg.google)))
    );
  }

  function render(el, cfg) {
    var preview = /[?&]preview=1(?:&|$)/.test(location.search);
    if (!cfg.enabled) {
      el.hidden = true;
      el.innerHTML = "";
      return;
    }
    if (!isConfigured(cfg) && !preview) {
      el.hidden = true;
      el.innerHTML = "";
      return;
    }
    el.hidden = false;
    el.classList.add("ro-mounted");
    var micro = trustBox(cfg, cfg.trustpilot.microTemplateId, "24px");
    var box = trustBox(cfg, cfg.trustpilot.templateId, "280px");
    el.innerHTML =
      '<div class="ro-inner"><header class="ro-head">' +
      '<p class="ro-eyebrow">Avis officiels</p><h2>Notation vérifiée</h2>' +
      '<p class="ro-lead">Notes Trustpilot' +
      (cfg.google.enabled ? " et Google" : "") +
      " — aucune note inventée.</p>" +
      (micro ? '<div class="ro-micro">' + micro + "</div>" : "") +
      "</header>" +
      scoreStrip(cfg) +
      (box ? '<div class="ro-trustbox-wrap">' + box + "</div>" : "") +
      actions(cfg) +
      "</div>";
    injectLd(cfg);
  }

  function mount(el) {
    if (!el || el.dataset.bound) return;
    el.dataset.bound = "1";
    Lib.fetchConfig({
      preferLocal: /[?&]preview=1(?:&|$)/.test(location.search),
      dataUrl: el.getAttribute("data-src") || Lib.DATA_URL,
    }).then(function (cfg) {
      render(el, cfg);
    });
  }

  function boot() {
    document.querySelectorAll("[data-reviews-official]").forEach(mount);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  window.ReviewsOfficialPublic = { mount: mount, boot: boot };
})();
