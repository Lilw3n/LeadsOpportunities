/**
 * Avis officiels Trustpilot (+ Google optionnel).
 * AggregateRating SEO uniquement si verified === true et score renseigné.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.ReviewsOfficial = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var STORAGE_KEY = "lo_reviews_official_v1";
  var DATA_URL = "./data/reviews-official.json";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function num(v) {
    if (v == null || v === "") return null;
    var n = Number(v);
    return isFinite(n) ? n : null;
  }

  function env() {
    return (typeof window !== "undefined" && window.REVIEWS_OFFICIAL_FROM_ENV) || {};
  }

  function normalize(raw) {
    var d = raw && typeof raw === "object" ? raw : {};
    var tp = d.trustpilot || {};
    var g = d.google || {};
    var display = d.display || {};
    var invite = d.invite || {};
    var e = env();
    return {
      version: d.version || 1,
      updatedAt: d.updatedAt || "",
      enabled: d.enabled !== false,
      primaryProvider: d.primaryProvider === "google" ? "google" : "trustpilot",
      trustpilot: {
        businessUnitId: String(e.trustpilotBusinessUnitId || tp.businessUnitId || "").trim(),
        templateId: String(tp.templateId || "54ad5defc6454f11c34ba34d").trim(),
        microTemplateId: String(tp.microTemplateId || "5419b6ffb0d04a09e42d81af").trim(),
        locale: String(tp.locale || "fr-FR").trim(),
        profileUrl: String(e.trustpilotProfileUrl || tp.profileUrl || "").trim(),
        inviteUrl: String(e.trustpilotInviteUrl || tp.inviteUrl || tp.profileUrl || "").trim(),
        stars: String(tp.stars || "4,5").trim(),
        theme: tp.theme === "dark" ? "dark" : "light",
        score: num(tp.score),
        reviewCount: num(tp.reviewCount),
        verified: tp.verified === true,
      },
      google: {
        enabled: g.enabled !== false,
        placeId: String(e.googlePlaceId || g.placeId || "").trim(),
        mapsUrl: String(g.mapsUrl || "").trim(),
        reviewUrl: String(e.googleReviewUrl || g.reviewUrl || "").trim(),
        score: num(g.score),
        reviewCount: num(g.reviewCount),
        verified: g.verified === true,
      },
      display: {
        showTrustBox: display.showTrustBox !== false,
        showScoreStrip: display.showScoreStrip !== false,
        showGoogleBadge: display.showGoogleBadge !== false,
        keepHumanQuotes: display.keepHumanQuotes !== false,
      },
      invite: {
        smsTemplate: String(
          invite.smsTemplate ||
            "Merci pour votre confiance. Votre avis nous aide : {{trustpilot}}"
        ),
        emailSubject: String(invite.emailSubject || "Votre avis compte — Leads Opportunities"),
        emailBody: String(
          invite.emailBody ||
            "Bonjour,\n\nMerci pour votre confiance. Un avis officiel nous aide beaucoup :\n\nTrustpilot : {{trustpilot}}\nGoogle : {{google}}\n\nWendy Buchet — Leads Opportunities"
        ),
      },
    };
  }

  function hasTrustpilot(cfg) {
    return !!(cfg && cfg.trustpilot && cfg.trustpilot.businessUnitId);
  }

  function hasOfficialScore(p) {
    return !!(
      p &&
      p.verified === true &&
      p.score != null &&
      p.score > 0 &&
      p.reviewCount != null &&
      p.reviewCount > 0
    );
  }

  function primaryScore(cfg) {
    var c = normalize(cfg);
    if (c.primaryProvider === "google" && hasOfficialScore(c.google)) return c.google;
    if (hasOfficialScore(c.trustpilot)) return c.trustpilot;
    if (hasOfficialScore(c.google)) return c.google;
    return null;
  }

  function starsHtml(score) {
    var n = Math.max(0, Math.min(5, Math.round(Number(score) || 0)));
    var html = "";
    for (var i = 0; i < 5; i++) {
      html += '<span class="ro-star' + (i < n ? " is-on" : "") + '" aria-hidden="true">★</span>';
    }
    return html;
  }

  function fillInvite(template, cfg) {
    var c = normalize(cfg);
    return String(template || "")
      .replace(/\{\{trustpilot\}\}/g, c.trustpilot.inviteUrl || c.trustpilot.profileUrl || "https://fr.trustpilot.com/")
      .replace(/\{\{google\}\}/g, c.google.reviewUrl || c.google.mapsUrl || "https://www.google.com/maps");
  }

  function aggregateRatingLd(cfg) {
    var s = primaryScore(cfg);
    if (!s) return null;
    return {
      "@type": "AggregateRating",
      ratingValue: String(s.score),
      reviewCount: String(Math.round(s.reviewCount)),
      bestRating: "5",
      worstRating: "1",
    };
  }

  function loadLocal() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? normalize(JSON.parse(raw)) : null;
    } catch (e) {
      return null;
    }
  }

  function saveLocal(cfg) {
    var n = normalize(cfg);
    n.updatedAt = new Date().toISOString().slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(n));
    return n;
  }

  function clearLocal() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function fetchConfig(opts) {
    opts = opts || {};
    if (opts.preferLocal) {
      var local = loadLocal();
      if (local) return Promise.resolve(local);
    }
    return fetch(opts.dataUrl || DATA_URL, { credentials: "same-origin", cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (json) {
        var file = normalize(json);
        if (opts.preferLocal) {
          var overlay = loadLocal();
          if (overlay) return overlay;
        }
        return file;
      })
      .catch(function () {
        return loadLocal() || normalize({});
      });
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    DATA_URL: DATA_URL,
    esc: esc,
    normalize: normalize,
    hasTrustpilot: hasTrustpilot,
    hasOfficialScore: hasOfficialScore,
    primaryScore: primaryScore,
    starsHtml: starsHtml,
    fillInvite: fillInvite,
    aggregateRatingLd: aggregateRatingLd,
    loadLocal: loadLocal,
    saveLocal: saveLocal,
    clearLocal: clearLocal,
    fetchConfig: fetchConfig,
  };
});
