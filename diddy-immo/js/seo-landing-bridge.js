/**
 * Bridge conversion SEO → landings : conserve UTM ads + CTA express VTC.
 * Chargé via france-seo-meta.js (toutes pages SEO).
 */
(function () {
  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid", "ttclid"];

  function readStoredAttr() {
    try {
      var raw = localStorage.getItem("lo_attr_v1");
      if (!raw) return {};
      var o = JSON.parse(raw);
      return {
        utm_source: o.attr_last_utm_source || o.attr_first_utm_source || "",
        utm_medium: o.attr_last_utm_medium || o.attr_first_utm_medium || "",
        utm_campaign: o.attr_last_utm_campaign || o.attr_first_utm_campaign || "",
        utm_content: o.attr_last_utm_content || o.attr_first_utm_content || "",
        utm_term: o.attr_last_utm_term || o.attr_first_utm_term || "",
      };
    } catch (e) {
      return {};
    }
  }

  function collectUtm() {
    var out = {};
    var q = new URLSearchParams(window.location.search || "");
    var stored = readStoredAttr();
    UTM_KEYS.forEach(function (k) {
      var v = q.get(k) || stored[k] || "";
      if (v) out[k] = v;
    });
    return out;
  }

  function withUtm(href, utm) {
    if (!href || href.charAt(0) === "#" || href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) {
      return href;
    }
    try {
      var abs = new URL(href, window.location.href);
      if (abs.origin !== window.location.origin && abs.hostname.indexOf("leadsopportunities") < 0) {
        return href;
      }
      var path = abs.pathname || "";
      if (path.indexOf("/landings/") < 0 && path.indexOf("/assurance-") < 0) {
        /* still allow landings only for UTM carry */
      }
      if (path.indexOf("/landings/") < 0) return href;
      Object.keys(utm).forEach(function (k) {
        if (!abs.searchParams.get(k) && utm[k]) abs.searchParams.set(k, utm[k]);
      });
      return abs.pathname + abs.search + abs.hash;
    } catch (e) {
      return href;
    }
  }

  function deepenVtcHref(href) {
    try {
      var abs = new URL(href, window.location.href);
      if (abs.pathname.indexOf("/landings/vtc") < 0) return href;
      if (!abs.hash) abs.hash = "demande";
      return abs.pathname + abs.search + abs.hash;
    } catch (e) {
      return href;
    }
  }

  function isVtcSeoPage() {
    var path = (window.location.pathname || "").toLowerCase();
    return path.indexOf("/assurance-vtc") >= 0 || (document.body && document.body.classList.contains("seo-page--vtc"));
  }

  function prefixToRoot() {
    var path = window.location.pathname || "";
    var depth = path.split("/").filter(Boolean).length;
    if (/index\.html$/i.test(path) || /\/$/.test(path)) depth -= 1;
    if (depth < 0) depth = 0;
    return depth <= 0 ? "./" : new Array(depth + 1).join("../");
  }

  function injectVtcExpress(utm) {
    if (!isVtcSeoPage()) return;
    if (document.querySelector("[data-seo-vtc-express]")) return;
    var heroActions = document.querySelector(".seo-hero-actions");
    if (!heroActions) return;
    var prefix = prefixToRoot();
    var express = withUtm(prefix + "landings/devis-rapide.html?need=vtc", utm);
    var a = document.createElement("a");
    a.className = "btn btn-ghost btn-lg";
    a.setAttribute("data-seo-vtc-express", "1");
    a.href = express;
    a.textContent = "Devis express (30 sec)";
    heroActions.appendChild(a);

    var asidePrimary = document.querySelector(".seo-aside-card a.btn-primary");
    if (asidePrimary && asidePrimary.parentNode && !asidePrimary.parentNode.querySelector("[data-seo-vtc-express-aside]")) {
      var a2 = document.createElement("a");
      a2.className = "btn btn-ghost";
      a2.style.marginTop = "8px";
      a2.style.display = "inline-flex";
      a2.setAttribute("data-seo-vtc-express-aside", "1");
      a2.href = express;
      a2.textContent = "Devis express 30 sec";
      asidePrimary.parentNode.appendChild(a2);
    }
  }

  function rewriteLandingCtas(utm) {
    var sels = [
      "a.seo-cta",
      ".seo-hero-actions a.btn-primary",
      ".seo-aside-card a.btn-primary",
      ".seo-mobile-cta a.btn-primary",
      "a[href*='/landings/']",
      "a[href*='landings/']",
    ];
    var seen = {};
    sels.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (a) {
        if (seen[a]) return;
        seen[a] = true;
        var href = a.getAttribute("href") || "";
        if (href.indexOf("landings/") < 0) return;
        var next = withUtm(href, utm);
        if (isVtcSeoPage()) next = deepenVtcHref(next);
        if (next !== href) a.setAttribute("href", next);
      });
    });
  }

  function boot() {
    var utm = collectUtm();
    rewriteLandingCtas(utm);
    injectVtcExpress(utm);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
