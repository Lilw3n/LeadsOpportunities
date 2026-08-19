/**
 * Fusion intelligente dépôt express (#deposer-bien) + dossier vente (#demande).
 * Casquette vendeur / les_deux : section 2 toujours visible (toutes les infos du bien).
 */
(function () {
  var SYNC_MAP = [
    { express: "#urlCity", sell: "#sellCity" },
    { express: "#urlPostal", sell: "#sellPostalCode" },
    { express: "#urlRooms", sell: "#sellRooms" },
    { express: "#urlSurf", sell: "#sellSurface" },
    { express: "#urlBedrooms", sell: "#sellBedrooms" },
    { express: "#urlDescription", sell: "#sellDescription" },
    { express: "#urlPrice", sell: "#sellPriceFai" },
    { express: "#urlDpe", sell: "#sellDpe" },
  ];

  function hat() {
    return document.documentElement.getAttribute("data-immo-hat") || "acheteur";
  }

  function isOwnerHat(h) {
    return h === "vendeur" || h === "les_deux";
  }

  function panel() {
    return document.querySelector("[data-search-vente-panel]");
  }

  function placeholder() {
    return document.querySelector("[data-search-vente-panel-placeholder]");
  }

  function depositMount() {
    return document.querySelector("[data-deposit-vente-mount]");
  }

  function toggleEl() {
    return document.querySelector("[data-deposit-vente-toggle]");
  }

  function wrapEl() {
    return document.querySelector("[data-deposit-vente-wrap]");
  }

  function expressForm() {
    return document.querySelector("[data-url-capture-form]");
  }

  function wizardForm() {
    return document.querySelector("#dossier form[data-acheteur-immo]");
  }

  function panelOpen(h, checked) {
    if (isOwnerHat(h)) return true;
    if (h === "signalement") return !!checked;
    return !!checked;
  }

  function setChecked(checked) {
    var t = toggleEl();
    if (t) t.checked = !!checked;
  }

  function syncExpressToSell() {
    syncAllLocations();
  }

  function syncSellToExpress() {
    syncAllLocations();
  }

  function syncAllLocations(preferredSource) {
    var urlCity = document.querySelector("#urlCity");
    var sellCity = document.querySelector("#sellCity");
    var urlPostal = document.querySelector("#urlPostal");
    var sellPostal = document.querySelector("#sellPostalCode");
    var fb = document.querySelector("[data-city-fallback]");
    var fbPostal = document.querySelector("[data-postal-fallback]");

    var city = "";
    var postal = "";

    if (preferredSource && preferredSource.id) {
      if (preferredSource.id === "urlCity" || preferredSource.id === "sellCity" || preferredSource.hasAttribute("data-city-fallback")) {
        city = String(preferredSource.value || "").trim();
      }
      if (
        preferredSource.id === "urlPostal" ||
        preferredSource.id === "sellPostalCode" ||
        preferredSource.hasAttribute("data-postal-fallback")
      ) {
        postal = String(preferredSource.value || "").trim();
      }
    }

    if (!city) {
      city =
        (sellCity && String(sellCity.value || "").trim()) ||
        (urlCity && String(urlCity.value || "").trim()) ||
        (fb && String(fb.value || "").trim()) ||
        "";
    }
    if (!postal) {
      postal =
        (sellPostal && String(sellPostal.value || "").trim()) ||
        (urlPostal && String(urlPostal.value || "").trim()) ||
        (fbPostal && String(fbPostal.value || "").trim()) ||
        "";
    }

    if (city) {
      if (urlCity) urlCity.value = city;
      if (sellCity) sellCity.value = city;
      if (fb) fb.value = city;
    }
    if (postal) {
      if (urlPostal) urlPostal.value = postal;
      if (sellPostal) sellPostal.value = postal;
      if (fbPostal) fbPostal.value = postal;
    }

    updateDuplicateLocationUi();
  }

  function bindExpressSync() {
    var form = expressForm();
    if (!form || form.dataset.depositVenteSyncBound) return;
    form.dataset.depositVenteSyncBound = "1";
    ["input", "change"].forEach(function (ev) {
      form.addEventListener(ev, function (e) {
        if (!panelOpen(hat(), toggleEl() && toggleEl().checked)) return;
        var id = e.target && e.target.id;
        if (id === "urlCity" || id === "urlPostal") {
          syncAllLocations(e.target);
          return;
        }
        if (!id && !(e.target && e.target.name)) return;
        syncExpressFields();
      });
    });
  }

  function syncExpressFields() {
    var form = expressForm();
    var p = panel();
    if (!form || !p) return;
    SYNC_MAP.forEach(function (m) {
      if (m.express === "#urlCity" || m.express === "#urlPostal") return;
      var src = form.querySelector(m.express);
      var dst = p.querySelector(m.sell);
      if (!src || !dst || !String(src.value || "").trim()) return;
      if (!String(dst.value || "").trim()) dst.value = src.value;
    });
    var pt = form.querySelector("[name='property_type']");
    if (pt && pt.value && !p.querySelector('[name="sellPropertyType"]:checked')) {
      var radio = p.querySelector('[name="sellPropertyType"][value="' + pt.value + '"]');
      if (radio) radio.checked = true;
    }
  }

  function enablePanelFields(on) {
    var p = panel();
    if (!p) return;
    p.querySelectorAll("input, select, textarea, button").forEach(function (el) {
      if (el.type === "hidden") return;
      el.disabled = !on;
    });
  }

  function movePanel(toDeposit) {
    var p = panel();
    var target = toDeposit ? depositMount() : placeholder();
    if (!p || !target || p.parentNode === target) return;
    target.appendChild(p);
    if (toDeposit) {
      p.classList.add("immo-deposit-vente-panel-inner");
    } else {
      p.classList.remove("immo-deposit-vente-panel-inner");
    }
  }

  function setWizardVenteMode(on) {
    var form = wizardForm();
    if (!form) return;
    var mode = on ? (hat() === "les_deux" ? "les_deux" : "service") : "bien";
    var ui = form.querySelector('[name="searchModeUi"][value="' + mode + '"]');
    var sk = form.querySelector('[name="searchKind"][value="' + mode + '"]');
    if (ui) ui.checked = true;
    if (sk) sk.checked = true;
    if (window.AcheteurImmoWizard && typeof window.AcheteurImmoWizard.sync === "function") {
      window.AcheteurImmoWizard.sync(form);
    }
  }

  function syncVisibility() {
    var h = hat();
    var t = toggleEl();
    var w = wrapEl();
    var mount = depositMount();
    var checked = t ? !!t.checked : false;

    if (w) w.hidden = h === "acheteur";

    if (isOwnerHat(h)) {
      setChecked(true);
      checked = true;
    }

    var open = panelOpen(h, checked);
    var useDeposit = isOwnerHat(h) || h === "signalement" || checked;

    movePanel(useDeposit);

    if (useDeposit && open) {
      syncExpressToSell();
      setWizardVenteMode(true);
      enablePanelFields(true);
      if (mount) mount.hidden = false;
      var pEl = panel();
      if (pEl) pEl.hidden = false;
    } else if (useDeposit) {
      enablePanelFields(false);
      if (mount) mount.hidden = true;
      var pHide = panel();
      if (pHide) pHide.hidden = true;
    } else {
      if (mount) mount.hidden = true;
      enablePanelFields(false);
      setWizardVenteMode(false);
      if (window.AcheteurImmoWizard && wizardForm()) {
        window.AcheteurImmoWizard.sync(wizardForm());
      }
    }
  }

  function collectSellDossier() {
    var p = panel();
    var h = hat();
    var t = toggleEl();
    if (!p) return null;
    if (!isOwnerHat(h) && (!t || !t.checked)) return null;

    var o = {};
    p.querySelectorAll("input, select, textarea").forEach(function (el) {
      if (el.disabled || !el.name) return;
      var n = el.name;
      if (el.type === "checkbox") {
        if (!el.checked) return;
        if (n.indexOf("[]") === n.length - 2) {
          var key = n.slice(0, -2);
          if (!o[key]) o[key] = [];
          o[key].push(el.value);
        } else if (!o[n]) o[n] = el.value;
        else if (!Array.isArray(o[n])) o[n] = [o[n], el.value];
        else o[n].push(el.value);
        return;
      }
      if (el.type === "radio") {
        if (!el.checked) return;
        o[n] = el.value;
        return;
      }
      o[n] = el.value;
    });

    var ownersMount = p.querySelector("[data-owners-mount]");
    if (ownersMount && window.AcheteurImmoOwners && window.AcheteurImmoOwners.collect) {
      o.owners = window.AcheteurImmoOwners.collect(ownersMount, expressForm());
    } else if (ownersMount) {
      var cards = ownersMount.querySelectorAll(".immo-owner-card");
      o.owners = Array.prototype.map.call(cards, function (card) {
        var row = {};
        card.querySelectorAll("[data-owner-field]").forEach(function (el) {
          row[el.getAttribute("data-owner-field")] = (el.value || "").trim();
        });
        row.mailRecipient = !!(card.querySelector("[data-owner-mail]") && card.querySelector("[data-owner-mail]").checked);
        return row;
      });
    }

    var coproMount = p.querySelector("[data-copro-works-mount]");
    if (coproMount && window.AcheteurImmoCoproWorks) {
      o.coproWorks = window.AcheteurImmoCoproWorks.collect(coproMount);
    }

    if (window.SellPhotosState && window.SellPhotosState.getPhotos) {
      var extra = window.SellPhotosState.getPhotos();
      if (extra.length) o.sellPhotos = extra;
    }

    return o;
  }

  function bindToggle() {
    document.addEventListener("change", function (e) {
      if (e.target && e.target.matches("[data-deposit-vente-toggle]")) {
        syncVisibility();
        if (e.target.checked) syncExpressToSell();
      }
      if (e.target && e.target.matches("[name='immoHat']")) {
        setTimeout(syncVisibility, 0);
      }
    });

    window.addEventListener("hashchange", function () {
      if ((location.hash || "").indexOf("deposer-bien") >= 0) {
        document.documentElement.setAttribute("data-immo-hat", "vendeur");
        var r = document.querySelector("[name='immoHat'][value='vendeur']");
        if (r) r.checked = true;
        if (window.AcheteurImmoDepositVente) syncVisibility();
      }
    });

    document.addEventListener("lo:listing-submitted", function () {
      if (isOwnerHat(hat())) setChecked(true);
      syncVisibility();
    });
  }

  function hasExpressLocation() {
    var urlCity = document.querySelector("#urlCity");
    var urlPostal = document.querySelector("#urlPostal");
    return (
      !!(urlCity && String(urlCity.value || "").trim()) ||
      !!(urlPostal && String(urlPostal.value || "").replace(/\D/g, "").length >= 5)
    );
  }

  function hasAnyBienLocation() {
    if (hasExpressLocation()) return true;
    var sellCity = document.querySelector("#sellCity");
    var sellPostal = document.querySelector("#sellPostalCode");
    return (
      !!(sellCity && String(sellCity.value || "").trim()) ||
      !!(sellPostal && String(sellPostal.value || "").replace(/\D/g, "").length >= 5)
    );
  }

  function updateDuplicateLocationUi() {
    var fbWrap = document.querySelector("[data-city-fallback-wrap]");
    if (fbWrap) fbWrap.hidden = hasAnyBienLocation();

    var p = panel();
    if (!p) return;
    var urlCity = document.querySelector("#urlCity");
    var urlPostal = document.querySelector("#urlPostal");
    var sellCity = p.querySelector("#sellCity");
    var sellPostal = p.querySelector("#sellPostalCode");
    var syncedNote = p.querySelector("[data-sell-location-synced]");
    var sellCityField = sellCity && sellCity.closest(".field");
    var sellPostalField = sellPostal && sellPostal.closest(".field");
    var expressFilled = hasExpressLocation();

    if (expressFilled && sellCityField && sellPostalField) {
      sellCityField.hidden = true;
      sellPostalField.hidden = true;
      if (syncedNote) {
        syncedNote.hidden = false;
        var cityTxt = urlCity && String(urlCity.value || "").trim() ? String(urlCity.value).trim() : "—";
        var postalTxt = urlPostal && String(urlPostal.value || "").trim() ? String(urlPostal.value).trim() : "";
        syncedNote.textContent =
          "Ville et code postal repris de la saisie rapide (section 1) : " +
          cityTxt +
          (postalTxt ? " (" + postalTxt + ")" : "") +
          ".";
      }
    } else {
      if (sellCityField) sellCityField.hidden = false;
      if (sellPostalField) sellPostalField.hidden = false;
      if (syncedNote) syncedNote.hidden = true;
    }

    if (window.AcheteurImmoOwners && window.AcheteurImmoOwners.syncAllCards) {
      document.querySelectorAll("[data-owners-mount]").forEach(function (m) {
        window.AcheteurImmoOwners.syncAllCards(m);
      });
    }
  }

  function bindCityFallback() {
    var fb = document.querySelector("[data-city-fallback]");
    var fbPostal = document.querySelector("[data-postal-fallback]");
    if (!fb || fb.dataset.cityFallbackBound) return;
    fb.dataset.cityFallbackBound = "1";

    function urlCityEl() {
      return document.querySelector("#urlCity");
    }
    function sellCityEl() {
      return document.querySelector("#sellCity");
    }
    function urlPostalEl() {
      return document.querySelector("#urlPostal");
    }
    function sellPostalEl() {
      return document.querySelector("#sellPostalCode");
    }

    function refreshGuide() {
      updateDuplicateLocationUi();
      var root = document.querySelector("[data-listing-url-capture]");
      if (root && window.AcheteurImmoDepositGuide && window.AcheteurImmoDepositGuide.refreshUi) {
        window.AcheteurImmoDepositGuide.refreshUi(root);
      }
    }

    fb.addEventListener("input", function () {
      syncAllLocations(fb);
      refreshGuide();
    });
    if (fbPostal) {
      fbPostal.addEventListener("input", function () {
        syncAllLocations(fbPostal);
        refreshGuide();
      });
    }

    [urlCityEl(), sellCityEl()].forEach(function (el) {
      if (!el) return;
      el.addEventListener("input", function () {
        syncAllLocations(el);
        refreshGuide();
      });
      el.addEventListener("change", function () {
        syncAllLocations(el);
        refreshGuide();
      });
    });
    [urlPostalEl(), sellPostalEl()].forEach(function (el) {
      if (!el) return;
      el.addEventListener("input", function () {
        syncAllLocations(el);
        refreshGuide();
      });
      el.addEventListener("change", function () {
        syncAllLocations(el);
        refreshGuide();
      });
    });

    syncAllLocations();
    updateDuplicateLocationUi();
  }

  function boot() {
    bindToggle();
    bindExpressSync();
    bindCityFallback();
    syncVisibility();
    requestAnimationFrame(function () {
      syncVisibility();
      updateDuplicateLocationUi();
    });
  }

  window.AcheteurImmoDepositVente = {
    sync: syncVisibility,
    collectSellDossier: collectSellDossier,
    syncExpressToSell: syncExpressToSell,
    syncSellToExpress: syncSellToExpress,
    syncAllLocations: syncAllLocations,
    syncCityFallback: bindCityFallback,
    updateDuplicateLocationUi: updateDuplicateLocationUi,
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
