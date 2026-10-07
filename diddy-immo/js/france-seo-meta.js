/**
 * Signaux SEO France : hreflang, og:locale, geo.region sur pages sans meta complètes.
 */
(function () {
  var ORIGIN = "https://www.leadsopportunities.fr";

  function ensureLink(rel, hreflang, href) {
    if (!href) return;
    var sel = 'link[rel="' + rel + '"]' + (hreflang ? '[hreflang="' + hreflang + '"]' : "");
    if (document.querySelector(sel)) return;
    var link = document.createElement("link");
    link.rel = rel;
    if (hreflang) link.hreflang = hreflang;
    link.href = href;
    document.head.appendChild(link);
  }

  function ensureMeta(name, content, isProperty) {
    if (!content) return;
    var sel = isProperty
      ? 'meta[property="' + name + '"]'
      : 'meta[name="' + name + '"]';
    var el = document.querySelector(sel);
    if (!el) {
      el = document.createElement("meta");
      if (isProperty) el.setAttribute("property", name);
      else el.name = name;
      document.head.appendChild(el);
    }
    el.content = content;
  }

  function pageUrl() {
    var c = document.querySelector('link[rel="canonical"]');
    if (c && c.href) return c.href;
    var path = window.location.pathname.replace(/index\.html$/, "");
    if (path.slice(-1) !== "/" && path.indexOf(".html") === -1) path += "/";
    return ORIGIN + path;
  }

  function loadSeoLandingBridge() {
    if (document.getElementById("seo-landing-bridge")) return;
    var scripts = document.getElementsByTagName("script");
    var base = "/js/seo-landing-bridge.js";
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].src || "";
      if (src.indexOf("france-seo-meta.js") >= 0) {
        base = src.replace(/france-seo-meta\.js.*$/, "seo-landing-bridge.js");
        break;
      }
    }
    var s = document.createElement("script");
    s.id = "seo-landing-bridge";
    s.src = base;
    s.defer = true;
    document.head.appendChild(s);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var url = pageUrl();
    ensureLink("alternate", "fr-FR", url);
    ensureLink("alternate", "x-default", url);
    ensureMeta("geo.region", "FR", false);
    ensureMeta("language", "fr-FR", false);
    ensureMeta("og:locale", "fr_FR", true);
    ensureMeta("content-language", "fr-FR", false);
    loadSeoLandingBridge();
  });
})();
