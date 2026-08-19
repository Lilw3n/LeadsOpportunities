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
    var form = expressForm();
    var p = panel();
    if (!form || !p) return;
    SYNC_MAP.forEach(function (m) {
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

  function syncSellToExpress() {
    var form = expressForm();
    var p = panel();
    if (!form || !p) return;
    SYNC_MAP.forEach(function (m) {
      var src = p.querySelector(m.sell);
      var dst = form.querySelector(m.express);
      if (!src || !dst || !String(src.value || "").trim()) return;
      if (!String(dst.value || "").trim()) dst.value = src.value;
    });
    var sellType = p.querySelector('[name="sellPropertyType"]:checked');
    var pt = form.querySelector("[name='property_type']");
    if (sellType && pt && !String(pt.value || "").trim()) pt.value = sellType.value;
    var sellDesc = p.querySelector("#sellDescription");
    var urlDesc = form.querySelector("#urlDescription");
    if (sellDesc && urlDesc && !String(urlDesc.value || "").trim() && String(sellDesc.value || "").trim()) {
      urlDesc.value = sellDesc.value;
    }
    var fb = document.querySelector("[data-city-fallback]");
    var fbPostal = document.querySelector("[data-postal-fallback]");
    var urlCity = form.querySelector("#urlCity");
    var urlPostal = form.querySelector("#urlPostal");
    if (fb && urlCity && String(urlCity.value || "").trim()) fb.value = urlCity.value;
    if (fbPostal && urlPostal && String(urlPostal.value || "").trim()) fbPostal.value = urlPostal.value;
  }

  function bindExpressSync() {
    var form = expressForm();
    if (!form || form.dataset.depositVenteSyncBound) return;
    form.dataset.depositVenteSyncBound = "1";
    ["input", "change"].forEach(function (ev) {
      form.addEventListener(ev, function (e) {
        if (!panelOpen(hat(), toggleEl() && toggleEl().checked)) return;
        var id = e.target && e.target.id;
        if (!id && !(e.target && e.target.name)) return;
        syncExpressToSell();
      });
    });
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
    if (ownersMount) {
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

    function firstVal() {
      var nodes = [urlCityEl(), sellCityEl(), fb];
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i] && String(nodes[i].value || "").trim()) return String(nodes[i].value).trim();
      }
      return "";
    }

    function firstPostal() {
      var nodes = [urlPostalEl(), sellPostalEl(), fbPostal];
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i] && String(nodes[i].value || "").trim()) return String(nodes[i].value).trim();
      }
      return "";
    }

    function refreshGuide() {
      var root = document.querySelector("[data-listing-url-capture]");
      if (root && window.AcheteurImmoDepositGuide && window.AcheteurImmoDepositGuide.refreshUi) {
        window.AcheteurImmoDepositGuide.refreshUi(root);
      }
    }

    function syncFromSources() {
      var city = firstVal();
      var postal = firstPostal();
      if (city && fb.value !== city) fb.value = city;
      if (fbPostal && postal && fbPostal.value !== postal) fbPostal.value = postal;
    }

    function pushCity(value) {
      var v = String(value || "").trim();
      var url = urlCityEl();
      var sell = sellCityEl();
      if (url) url.value = v;
      if (sell) sell.value = v;
    }

    function pushPostal(value) {
      var v = String(value || "").trim();
      var url = urlPostalEl();
      var sell = sellPostalEl();
      if (url) url.value = v;
      if (sell) sell.value = v;
    }

    fb.addEventListener("input", function () {
      pushCity(fb.value);
      refreshGuide();
    });
    if (fbPostal) {
      fbPostal.addEventListener("input", function () {
        pushPostal(fbPostal.value);
        refreshGuide();
      });
    }

    [urlCityEl(), sellCityEl()].forEach(function (el) {
      if (!el) return;
      el.addEventListener("input", syncFromSources);
      el.addEventListener("change", syncFromSources);
    });
    [urlPostalEl(), sellPostalEl()].forEach(function (el) {
      if (!el) return;
      el.addEventListener("input", syncFromSources);
      el.addEventListener("change", syncFromSources);
    });

    syncFromSources();
  }

  function boot() {
    bindToggle();
    bindExpressSync();
    bindCityFallback();
    syncVisibility();
    requestAnimationFrame(syncVisibility);
  }

  window.AcheteurImmoDepositVente = {
    sync: syncVisibility,
    collectSellDossier: collectSellDossier,
    syncExpressToSell: syncExpressToSell,
    syncSellToExpress: syncSellToExpress,
    syncCityFallback: bindCityFallback,
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
