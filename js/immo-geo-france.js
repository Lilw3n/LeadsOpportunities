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

  function chip(label, attrs) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "immo-geo-chip";
    btn.textContent = label;
    Object.keys(attrs || {}).forEach(function (k) {
      btn.setAttribute(k, attrs[k]);
    });
    return btn;
  }

  function bindChip(btn, postal, city) {
    btn.addEventListener("click", function () {
      if (postal) setFieldValue("postalProject", postal);
      if (city) setFieldValue("searchCities", city);
      var group = btn.closest("[data-immo-geo-chips]");
      if (group) {
        group.querySelectorAll(".immo-geo-chip").forEach(function (c) {
          c.classList.remove("is-active");
        });
        btn.classList.add("is-active");
      }
    });
  }

  function renderFormChips(root, cfg) {
    var host = root.querySelector("[data-immo-geo-chips]");
    if (!host || !cfg) return;

    var nancy = cfg.nancyFocus || {};
    var dom = cfg.domTom || [];

    if (nancy.cities && nancy.cities.length) {
      var nBlock = document.createElement("div");
      nBlock.className = "immo-geo-field-block";
      nBlock.innerHTML = '<span class="immo-geo-field-label">Grand Nancy &amp; alentours (zone prioritaire)</span>';
      var nWrap = document.createElement("div");
      nWrap.className = "immo-geo-chips";
      nWrap.setAttribute("data-immo-geo-chips", "nancy");
      nancy.cities.forEach(function (c) {
        var b = chip(c.name + " (" + c.postal + ")", { "data-postal": c.postal });
        bindChip(b, c.postal, c.name);
        nWrap.appendChild(b);
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
      dWrap.className = "immo-geo-chips";
      dWrap.setAttribute("data-immo-geo-chips", "dom");
      dom.forEach(function (c) {
        var b = chip(c.name + " (" + c.postal + ")", { "data-postal": c.postal });
        bindChip(b, c.postal, c.city || c.name);
        dWrap.appendChild(b);
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

  function initHub() {
    var hub = document.querySelector("[data-immo-geo-hub]");
    if (!hub) return;
    loadConfig().then(function (cfg) {
      var nancy = cfg.nancyFocus || {};
      var chips = hub.querySelector("[data-immo-nancy-chips]");
      if (chips && nancy.cities) {
        nancy.cities.forEach(function (c, i) {
          var a = document.createElement("a");
          a.className = "immo-zone-chip" + (i === 0 ? " immo-zone-chip--primary" : "");
          a.href = acheteurUrl(c.postal, c.name);
          a.textContent = c.name;
          chips.appendChild(a);
        });
      }
      var domChips = hub.querySelector("[data-immo-dom-chips]");
      if (domChips && cfg.domTom) {
        cfg.domTom.forEach(function (c) {
          var a = document.createElement("a");
          a.className = "immo-zone-chip";
          a.href = acheteurUrl(c.postal, c.city || c.name);
          a.textContent = c.name;
          domChips.appendChild(a);
        });
      }
    });
  }

  function initForm() {
    var form = document.querySelector("form[data-acheteur-immo]");
    if (!form) return;
    applyUrlGeo();
    loadConfig().then(function (cfg) {
      renderFormChips(form, cfg);
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
  };
})();
