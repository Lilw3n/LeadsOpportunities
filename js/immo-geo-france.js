/**
 * Couverture geo immobilier : France + DOM-TOM, focus Dombasle / Varangéville / Meurthe.
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
        configCache = { localZones: [], domTom: [] };
        return configCache;
      });
  }

  function zonesOf(cfg) {
    return (cfg && cfg.localZones) || [];
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
      zone: (q.get("zone") || "").toLowerCase(),
    };
  }

  function applyUrlGeo(cfg) {
    cfg = cfg || {};
    var geo = readUrlGeo();
    var agency = cfg.agency || {};

    if (geo.postalProject) setFieldValue("postalProject", geo.postalProject);
    if (geo.searchCities) setFieldValue("searchCities", geo.searchCities);

    if (geo.postalProject || geo.searchCities) return;

    if (geo.zone === "dombasle" || geo.zone === "agence" || geo.zone === "meurthe") {
      setFieldValue("postalProject", agency.postal || "54110");
      setFieldValue("searchCities", agency.city || "Dombasle-sur-Meurthe");
      return;
    }
    if (geo.zone === "varangeville") {
      setFieldValue("postalProject", agency.homePostal || "54110");
      setFieldValue("searchCities", agency.homeCity || "Varangéville");
      return;
    }
    if (geo.zone === "nancy") {
      setFieldValue("postalProject", "54000");
      setFieldValue("searchCities", "Nancy");
    }
  }

  function chip(label, extraClass) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "immo-geo-chip" + (extraClass ? " " + extraClass : "");
    btn.textContent = label;
    return btn;
  }

  function bindChip(btn, postal, city) {
    btn.addEventListener("click", function () {
      if (postal) setFieldValue("postalProject", postal);
      if (city) setFieldValue("searchCities", city);
      var group = btn.closest(".immo-geo-chips");
      if (group) {
        group.querySelectorAll(".immo-geo-chip").forEach(function (c) {
          c.classList.remove("is-active");
        });
        btn.classList.add("is-active");
      }
    });
  }

  function renderZoneBlock(zone, opts) {
    opts = opts || {};
    if (!zone || !zone.cities || !zone.cities.length) return null;

    var block = document.createElement("div");
    block.className = "immo-geo-field-block" + (zone.priority ? " immo-geo-field-block--priority" : "");

    var label = document.createElement("span");
    label.className = "immo-geo-field-label";
    label.textContent = zone.title;
    block.appendChild(label);

    if (zone.summary && opts.showSummary) {
      var sum = document.createElement("p");
      sum.className = "immo-geo-note";
      sum.textContent = zone.summary;
      block.appendChild(sum);
    }

    var wrap = document.createElement("div");
    wrap.className = "immo-geo-chips";
    wrap.setAttribute("data-immo-geo-chips", zone.id || "zone");

    zone.cities.forEach(function (c) {
      var extra = c.highlight ? "immo-geo-chip--highlight" : "";
      var b = chip(c.name + " (" + c.postal + ")", extra);
      bindChip(b, c.postal, c.name);
      wrap.appendChild(b);
    });
    block.appendChild(wrap);
    return block;
  }

  function renderFormChips(root, cfg) {
    var host = root.querySelector("[data-immo-geo-chips]");
    if (!host || !cfg) return;

    zonesOf(cfg).forEach(function (zone) {
      var block = renderZoneBlock(zone, { showSummary: true });
      if (block) host.appendChild(block);
    });

    var dom = cfg.domTom || [];
    if (dom.length) {
      var dBlock = document.createElement("div");
      dBlock.className = "immo-geo-field-block";
      dBlock.innerHTML =
        '<span class="immo-geo-field-label">DOM-TOM &amp; Corse</span>' +
        '<p class="immo-geo-note">Guadeloupe, Martinique, Reunion, Guyane, Mayotte, Corse — codes postaux 971xx, 972xx, 974xx…</p>';
      var dWrap = document.createElement("div");
      dWrap.className = "immo-geo-chips";
      dom.forEach(function (c) {
        var b = chip(c.name + " (" + c.postal + ")");
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

  function renderHubZone(zone) {
    if (!zone || !zone.cities || !zone.cities.length) return null;

    var section = document.createElement("section");
    section.className = "immo-zone immo-zone--nancy" + (zone.priority ? " immo-zone--priority" : "");

    if (zone.badge) {
      var badge = document.createElement("span");
      badge.className = "immo-zone-badge";
      badge.textContent = zone.badge;
      section.appendChild(badge);
    }

    var h2 = document.createElement("h2");
    h2.textContent = zone.title;
    section.appendChild(h2);

    if (zone.summary) {
      var p = document.createElement("p");
      p.textContent = zone.summary;
      section.appendChild(p);
    }

    var chips = document.createElement("div");
    chips.className = "immo-zone-chips";
    zone.cities.forEach(function (c) {
      var a = document.createElement("a");
      a.className = "immo-zone-chip" + (c.highlight ? " immo-zone-chip--primary" : "");
      a.href = acheteurUrl(c.postal, c.name);
      a.textContent = c.name;
      chips.appendChild(a);
    });
    section.appendChild(chips);
    return section;
  }

  function initHub() {
    var hub = document.querySelector("[data-immo-geo-hub]");
    if (!hub) return;
    loadConfig().then(function (cfg) {
      var localHost = hub.querySelector("[data-immo-local-zones]");
      if (localHost) {
        zonesOf(cfg).forEach(function (zone) {
          var section = renderHubZone(zone);
          if (section) localHost.appendChild(section);
        });
      }

      var agency = cfg.agency || {};
      var cta = hub.querySelector("[data-immo-agency-cta]");
      if (cta && agency.city) {
        cta.href = acheteurUrl(agency.postal, agency.city);
        cta.textContent = "Démarrer un dossier à " + agency.city.replace(/-sur-Meurthe/i, "") + " →";
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
    loadConfig().then(function (cfg) {
      applyUrlGeo(cfg);
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
    zonesOf: zonesOf,
  };
})();
