/**
 * Couverture geo immobilier : France + DOM-TOM, focus Grand Nancy.
 */
(function () {
  var CONFIG_URL = "/data/immo-geo-france.json";
  var configCache = null;

  function loadConfig() {
    if (configCache) return Promise.resolve(configCache);
    return fetch(CONFIG_URL)
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        configCache = data;
        return data;
      })
      .catch(function () {
        configCache = { nancyFocus: { cities: [] }, domTom: [] };
        return configCache;
      });
  }

  function cityImage(c) {
    if (c && c.image) return c.image;
    if (c && c.slug) return "/assets/immo/villes/" + c.slug + ".jpg";
    return "/assets/piliers/pilier-immobilier.jpg";
  }

  function cityLabel(c) {
    return c.name || c.city || "";
  }

  function cityTargetName(c) {
    return c.name || c.city || "";
  }

  function setFieldValue(id, value) {
    if (!value) return;
    var el = document.getElementById(id);
    if (!el) return;
    el.value = value;
    try {
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    } catch (e) {}
  }

  function readUrlGeo() {
    var q = new URLSearchParams(location.search);
    return {
      postalProject: q.get("postalProject") || q.get("cp") || "",
      searchCities: q.get("searchCities") || q.get("ville") || "",
      zone: q.get("zone") || "",
    };
  }

  function applyUrlGeo() {
    var geo = readUrlGeo();
    if (geo.postalProject) setFieldValue("postalProject", geo.postalProject);
    if (geo.searchCities) setFieldValue("searchCities", geo.searchCities);
    if (geo.zone === "nancy" && !geo.postalProject) setFieldValue("postalProject", "54000");
  }

  function bindCityPick(el, postal, city) {
    el.addEventListener("click", function (e) {
      if (el.tagName === "A") return;
      e.preventDefault();
      if (postal) setFieldValue("postalProject", postal);
      if (city) setFieldValue("searchCities", city);
      var group = el.closest("[data-immo-city-group]");
      if (group) {
        group.querySelectorAll(".immo-city-card, .immo-geo-chip").forEach(function (c) {
          c.classList.remove("is-active");
        });
        el.classList.add("is-active");
      }
    });
  }

  function createCityCard(c, opts) {
    opts = opts || {};
    var isLink = opts.mode === "link";
    var el = document.createElement(isLink ? "a" : "button");
    el.className =
      "immo-city-card" +
      (opts.primary ? " immo-city-card--primary" : "") +
      (opts.compact ? " immo-city-card--compact" : "");
    if (isLink) {
      el.href = acheteurUrl(c.postal, cityTargetName(c));
    } else {
      el.type = "button";
    }

    var media = document.createElement("span");
    media.className = "immo-city-card-media";
    media.setAttribute("aria-hidden", "true");
    media.style.backgroundImage = "url('" + cityImage(c) + "')";

    var body = document.createElement("span");
    body.className = "immo-city-card-body";
    var name = document.createElement("strong");
    name.textContent = cityLabel(c);
    var meta = document.createElement("span");
    meta.className = "immo-city-card-meta";
    meta.textContent = c.postal + (c.city && c.city !== c.name ? " · " + c.city : "");

    body.appendChild(name);
    body.appendChild(meta);
    el.appendChild(media);
    el.appendChild(body);

    if (!isLink) {
      bindCityPick(el, c.postal, cityTargetName(c));
    }

    return el;
  }

  function renderFormCities(root, cfg) {
    var host = root.querySelector("[data-immo-geo-chips]");
    if (!host || !cfg) return;

    var nancy = cfg.nancyFocus || {};
    var dom = cfg.domTom || [];

    if (nancy.cities && nancy.cities.length) {
      var nBlock = document.createElement("div");
      nBlock.className = "immo-geo-field-block";
      nBlock.innerHTML = '<span class="immo-geo-field-label">Grand Nancy &amp; alentours (zone prioritaire)</span>';
      var nWrap = document.createElement("div");
      nWrap.className = "immo-city-grid immo-city-grid--form";
      nWrap.setAttribute("data-immo-city-group", "nancy");
      nancy.cities.forEach(function (c) {
        nWrap.appendChild(createCityCard(c, { compact: true }));
      });
      nBlock.appendChild(nWrap);
      host.appendChild(nBlock);
    }

    if (dom.length) {
      var dBlock = document.createElement("div");
      dBlock.className = "immo-geo-field-block";
      dBlock.innerHTML =
        '<span class="immo-geo-field-label">DOM-TOM &amp; Corse</span>' +
        '<p class="immo-geo-note">Guadeloupe, Martinique, Reunion, Guyane, Mayotte, Corse — memes codes postaux (971xx, 972xx, 974xx…).</p>';
      var dWrap = document.createElement("div");
      dWrap.className = "immo-city-grid immo-city-grid--form";
      dWrap.setAttribute("data-immo-city-group", "dom");
      dom.forEach(function (c) {
        dWrap.appendChild(createCityCard(c, { compact: true }));
      });
      dBlock.appendChild(dWrap);
      host.appendChild(dBlock);
    }
  }

  function acheteurUrl(postal, city) {
    var base = "/landings/acheteur-immo.html";
    var q = new URLSearchParams();
    if (postal) q.set("postalProject", postal);
    if (city) q.set("searchCities", city);
    var qs = q.toString();
    return base + (qs ? "?" + qs : "") + "#demande";
  }

  function renderHubCities(container, cities, opts) {
    if (!container || !cities || !cities.length) return;
    container.innerHTML = "";
    container.className = "immo-city-grid";
    cities.forEach(function (c, i) {
      container.appendChild(
        createCityCard(c, {
          mode: "link",
          primary: opts && opts.primaryFirst && i === 0,
        })
      );
    });
  }

  function initHub() {
    var hub = document.querySelector("[data-immo-geo-hub]");
    if (!hub) return;
    loadConfig().then(function (cfg) {
      var nancy = cfg.nancyFocus || {};
      renderHubCities(hub.querySelector("[data-immo-nancy-cities]"), nancy.cities, {
        primaryFirst: true,
      });
      renderHubCities(hub.querySelector("[data-immo-dom-cities]"), cfg.domTom);
    });
  }

  function initForm() {
    var form = document.querySelector("form[data-acheteur-immo]");
    if (!form) return;
    applyUrlGeo();
    loadConfig().then(function (cfg) {
      renderFormCities(form, cfg);
    });
  }

  function init() {
    initHub();
    initForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.ImmoGeoFrance = {
    loadConfig: loadConfig,
    acheteurUrl: acheteurUrl,
    cityImage: cityImage,
  };
})();
