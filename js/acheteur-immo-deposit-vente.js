/**
 * Fusion intelligente dépôt express (#deposer-bien) + dossier vente (#demande).
 * Déplace le panneau [data-search-vente-panel] selon la casquette et la coche « vente de bien ».
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

  function qs(sel, root) {
    return (root || document).querySelector(sel);
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

  function wantsDepositPanel(h, checked) {
    if (h === "vendeur" || h === "les_deux") return true;
    if (h === "signalement") return !!checked;
    return !!checked;
  }

  function setChecked(checked) {
    var t = toggleEl();
    if (!t) return;
    t.checked = !!checked;
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

  function bindExpressSync() {
    var form = expressForm();
    if (!form || form.dataset.depositVenteSyncBound) return;
    form.dataset.depositVenteSyncBound = "1";
    ["input", "change"].forEach(function (ev) {
      form.addEventListener(ev, function (e) {
        if (!toggleEl() || !toggleEl().checked) return;
        var id = e.target && e.target.id;
        if (!id) return;
        var hit = SYNC_MAP.some(function (m) {
          return m.express === "#" + id || m.express === "[name='" + e.target.name + "']";
        });
        if (hit || id === "urlPropType" || e.target.name === "property_type") syncExpressToSell();
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
      p.removeAttribute("hidden");
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
    var checked = !!(t && t.checked);

    if (w) w.hidden = h === "acheteur";

    if (h === "vendeur" || h === "les_deux") {
      setChecked(true);
      checked = true;
    }

    var useDeposit = wantsDepositPanel(h, checked);
    movePanel(useDeposit);

    if (useDeposit) {
      syncExpressToSell();
      setWizardVenteMode(true);
      enablePanelFields(checked);
      if (mount) mount.hidden = !checked;
      var pEl = panel();
      if (pEl) pEl.hidden = !checked;
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
    var t = toggleEl();
    if (!p || !t || !t.checked) return null;

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
    if (ownersMount && window.AcheteurImmoOwners) {
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

    document.addEventListener("lo:listing-submitted", function () {
      if (hat() === "vendeur" || hat() === "les_deux") setChecked(true);
      syncVisibility();
    });

    window.addEventListener("hashchange", function () {
      if ((location.hash || "").indexOf("demande") >= 0 && hat() === "acheteur") {
        movePanel(false);
      }
    });
  }

  function boot() {
    bindToggle();
    bindExpressSync();
    syncVisibility();
  }

  window.AcheteurImmoDepositVente = {
    sync: syncVisibility,
    collectSellDossier: collectSellDossier,
    syncExpressToSell: syncExpressToSell,
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
