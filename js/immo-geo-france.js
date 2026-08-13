/**
 * Couverture geo immobilier : France + DOM-TOM, focus Dombasle / Varangéville / Meurthe,
 * avec visuels pour Grand Nancy et DOM-TOM.
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
        configCache = { localZones: [], nancyFocus: { cities: [] }, domTom: [] };
        return configCache;
      });
  }

  function zonesOf(cfg) {
    return (cfg && cfg.localZones) || [];
  }

  function cityImage(c) {
    if (c && c.image) return c.image;
    if (c && c.slug) return "/assets/immo/villes/" + c.slug + ".jpg";
    return "";
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

  function bindCityPick(el, postal, city) {
    el.addEventListener("click", function (e) {
      if (el.tagName === "A") return;
      e.preventDefault();
      if (postal) setFieldValue("postalProject", postal);
      if (city) setFieldValue("searchCities", city);
      var group = el.closest("[data-immo-city-group], .immo-geo-chips, .immo-zone-chips");
      if (group) {
        group.querySelectorAll(".immo-city-card, .immo-geo-chip, .immo-zone-chip").forEach(function (c) {
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
      (opts.compact ? " immo-city-card--compact" : "") +
      (c.highlight ? " immo-city-card--highlight" : "");
    if (isLink) {
      el.href = acheteurUrl(c.postal, cityTargetName(c));
    } else {
      el.type = "button";
    }

    var media = document.createElement("span");
    media.className = "immo-city-card-media";
    media.setAttribute("aria-hidden", "true");
    var img = cityImage(c);
    if (img) media.style.backgroundImage = "url('" + img + "')";

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

  function chip(label, extraClass) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "immo-geo-chip" + (extraClass ? " " + extraClass : "");
    btn.textContent = label;
    return btn;
  }

  function bindChip(btn, postal, city) {
    bindCityPick(btn, postal, city);
  }

  function zoneHasImages(zone) {
    return zone && zone.cities && zone.cities.some(function (c) {
      return !!cityImage(c);
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

    var useCards = opts.preferCards && zoneHasImages(zone);
    if (useCards) {
      var grid = document.createElement("div");
      grid.className = "immo-city-grid immo-city-grid--form";
      grid.setAttribute("data-immo-city-group", zone.id || "zone");
      zone.cities.forEach(function (c) {
        if (!cityImage(c) && opts.cardsOnlyWithImage) return;
        grid.appendChild(createCityCard(c, { compact: true }));
      });
      if (!grid.children.length) useCards = false;
      else block.appendChild(grid);
    }

    if (!useCards) {
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
    }

    return block;
  }

  function renderFormCities(root, cfg) {
    var host = root.querySelector("[data-immo-geo-chips]");
    if (!host || !cfg) return;
    host.innerHTML = "";

    zonesOf(cfg).forEach(function (zone) {
      var preferCards = zone.id === "grand-nancy";
      var block = renderZoneBlock(zone, {
        showSummary: true,
        preferCards: preferCards,
        cardsOnlyWithImage: preferCards,
      });
      if (block) host.appendChild(block);
    });

    var dom = cfg.domTom || [];
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

    var withImages = zone.cities.filter(function (c) {
      return !!cityImage(c);
    });

    if (withImages.length && (zone.id === "grand-nancy" || withImages.length === zone.cities.length)) {
      var grid = document.createElement("div");
      grid.className = "immo-city-grid";
      withImages.forEach(function (c, i) {
        grid.appendChild(
          createCityCard(c, {
            mode: "link",
            primary: zone.priority && i === 0,
          })
        );
      });
      section.appendChild(grid);

      var rest = zone.cities.filter(function (c) {
        return !cityImage(c);
      });
      if (rest.length) {
        var chips = document.createElement("div");
        chips.className = "immo-zone-chips";
        chips.style.marginTop = "12px";
        rest.forEach(function (c) {
          var a = document.createElement("a");
          a.className = "immo-zone-chip" + (c.highlight ? " immo-zone-chip--primary" : "");
          a.href = acheteurUrl(c.postal, c.name);
          a.textContent = c.name;
          chips.appendChild(a);
        });
        section.appendChild(chips);
      }
    } else {
      var chipsOnly = document.createElement("div");
      chipsOnly.className = "immo-zone-chips";
      zone.cities.forEach(function (c) {
        var a = document.createElement("a");
        a.className = "immo-zone-chip" + (c.highlight ? " immo-zone-chip--primary" : "");
        a.href = acheteurUrl(c.postal, c.name);
        a.textContent = c.name;
        chipsOnly.appendChild(a);
      });
      section.appendChild(chipsOnly);
    }

    return section;
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
      var localHost = hub.querySelector("[data-immo-local-zones]");
      if (localHost) {
        localHost.innerHTML = "";
        zonesOf(cfg).forEach(function (zone) {
          var section = renderHubZone(zone);
          if (section) localHost.appendChild(section);
        });
      } else {
        var nancy = cfg.nancyFocus || {};
        renderHubCities(hub.querySelector("[data-immo-nancy-cities]"), nancy.cities, {
          primaryFirst: true,
        });
      }

      var agency = cfg.agency || {};
      var cta = hub.querySelector("[data-immo-agency-cta]");
      if (cta && agency.city) {
        cta.href = acheteurUrl(agency.postal, agency.city);
        cta.textContent =
          "Démarrer un dossier à " + agency.city.replace(/-sur-Meurthe/i, "") + " →";
      }

      var domGrid = hub.querySelector("[data-immo-dom-cities]");
      if (domGrid) {
        renderHubCities(domGrid, cfg.domTom);
      }

      var domChips = hub.querySelector("[data-immo-dom-chips]");
      if (domChips && cfg.domTom) {
        domChips.innerHTML = "";
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
    zonesOf: zonesOf,
  };
})();
