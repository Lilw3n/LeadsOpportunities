/**
 * Localisation Nancy métropole / Meurthe-et-Moselle (54).
 * Bannière acquéreur + vendeur, tags analytics, préremplissage ville.
 */
(function () {
  var SLUGS = {
    nancy: "Nancy",
    varangeville: "Varangeville",
    luneville: "Lunéville",
    "jarville-la-malgrange": "Jarville-la-Malgrange",
    "laneuveville-devant-nancy": "Laneuveville-devant-Nancy",
    "dombasle-sur-meurthe": "Dombasle-sur-Meurthe",
    "saint-nicolas-de-port": "Saint-Nicolas-de-Port",
    "vandoeuvre-les-nancy": "Vandœuvre-lès-Nancy",
    "saint-max": "Saint-Max",
    laxou: "Laxou",
    "villers-les-nancy": "Villers-lès-Nancy",
    maxeville: "Maxéville",
    toul: "Toul",
    "pont-a-mousson": "Pont-à-Mousson",
    "essey-les-nancy": "Essey-lès-Nancy",
    tomblaine: "Tomblaine",
    seichamps: "Seichamps",
    heillecourt: "Heillecourt",
    malzeville: "Malzéville",
    "saint-julien-les-vandoeuvre": "Saint-Julien-lès-Vandœuvre",
    pompey: "Pompey",
    custines: "Custines",
    richardmenil: "Richardménil",
    jarny: "Jarny",
    "pont-saint-vincent": "Pont-Saint-Vincent",
  };

  var DEPT_PATH = "meurthe-et-moselle";
  var HUB_PATH = "/immobilier/nancy-metropole/";

  function path() {
    return (window.location.pathname || "").toLowerCase();
  }

  function detectCityFromPath() {
    var p = path();
    if (p.indexOf(HUB_PATH) !== -1) return "Varangeville";
    if (p.indexOf("/departement/" + DEPT_PATH) !== -1) return "Nancy";
    var parts = p.split("/").filter(Boolean);
    for (var i = 0; i < parts.length; i++) {
      if (SLUGS[parts[i]]) return SLUGS[parts[i]];
    }
    return "";
  }

  function cityFromQuery() {
    try {
      var q = new URLSearchParams(window.location.search);
      return q.get("ville") || q.get("city") || "";
    } catch (e) {
      return "";
    }
  }

  function isNancyContext() {
    var p = path();
    if (p.indexOf("nancy-metropole") !== -1) return true;
    if (p.indexOf(DEPT_PATH) !== -1) return true;
    var parts = p.split("/");
    return parts.some(function (seg) {
      return !!SLUGS[seg];
    });
  }

  function trackLocal() {
    if (typeof window.clarity === "function") {
      window.clarity("set", "market_region", "FR-54");
      window.clarity("set", "market_intent", "FR-54-Nancy");
    }
    if (typeof window.gtag === "function") {
      window.gtag("set", "user_properties", {
        market_region: "FR-54",
        local_bassin: "nancy-metropole",
      });
      window.gtag("event", "local_bassin_view", {
        page_path: window.location.pathname,
        city_detected: detectCityFromPath() || cityFromQuery() || "hub",
      });
    }
  }

  function injectBanner() {
    if (!isNancyContext() || document.getElementById("nancy-bassin-banner")) return;
    var city = detectCityFromPath() || cityFromQuery() || "Nancy métropole";
    var wrap = document.createElement("div");
    wrap.id = "nancy-bassin-banner";
    wrap.className = "nancy-bassin-banner";
    wrap.setAttribute("role", "region");
    wrap.setAttribute("aria-label", "Zone Nancy métropole");
    wrap.innerHTML =
      '<div class="nancy-bassin-banner-inner">' +
      "<p><strong>Bureau Varangeville (54)</strong> — Accompagnement <strong>acquéreurs</strong> (prêt, recherche, projection) et <strong>vendeurs</strong> (estimation, annonce, vente + rachat)" +
      (city && city !== "Nancy métropole" ? " · " + city : "") +
      ".</p>" +
      '<div class="nancy-bassin-banner-actions">' +
      '<a class="nb-btn nb-btn-primary" href="/landings/acheteur-immo.html?ville=' +
      encodeURIComponent(city === "Nancy métropole" ? "Nancy" : city) +
      '">Je cherche un bien</a>' +
      '<a class="nb-btn nb-btn-ghost" href="/landings/acheteur-immo.html?role=vendeur&amp;ville=' +
      encodeURIComponent(city === "Nancy métropole" ? "Varangeville" : city) +
      '">Je vends</a>' +
      '<a class="nb-btn nb-btn-ghost" href="/landings/credit-immo.html">Prêt immo</a>' +
      "</div></div>";
    var topbar = document.querySelector(".seo-topbar, .landing-topbar, .topbar, header");
    if (topbar && topbar.parentNode) {
      topbar.parentNode.insertBefore(wrap, topbar);
    } else if (document.body) {
      document.body.insertBefore(wrap, document.body.firstChild);
    }
  }

  function prefillCity() {
    var city = cityFromQuery() || detectCityFromPath();
    if (!city || city === "Nancy métropole") return;
    ["ville", "city", "locality", "immoCity", "propertyCity"].forEach(function (name) {
      document.querySelectorAll('[name="' + name + '"], #' + name).forEach(function (el) {
        if (!el.value) {
          el.value = city;
          try {
            el.dispatchEvent(new Event("input", { bubbles: true }));
            el.dispatchEvent(new Event("change", { bubbles: true }));
          } catch (e) {}
        }
      });
    });
    var role = new URLSearchParams(window.location.search).get("role");
    if (role === "vendeur") {
      document.querySelectorAll('[name="immoHat"][value="vendeur"], #immoHatVendeur, [data-role="vendeur"]').forEach(function (el) {
        if (el.type === "radio" || el.type === "checkbox") el.checked = true;
        try {
          el.dispatchEvent(new Event("change", { bubbles: true }));
        } catch (e) {}
      });
    }
  }

  function ensureCss() {
    if (document.getElementById("nancy-bassin-banner-css")) return;
    var link = document.createElement("link");
    link.id = "nancy-bassin-banner-css";
    link.rel = "stylesheet";
    link.href = "/css/nancy-bassin-banner.css";
    document.head.appendChild(link);
  }

  function init() {
    if (!isNancyContext()) return;
    ensureCss();
    trackLocal();
    injectBanner();
    prefillCity();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.NancyBassinLocal = {
    isNancyContext: isNancyContext,
    detectCity: detectCityFromPath,
    SLUGS: SLUGS,
  };
})();
