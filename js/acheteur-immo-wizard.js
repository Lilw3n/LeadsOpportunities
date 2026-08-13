/**
 * Parcours acquereur immobilier —
 * etape 1 recherche (bien / service), sauts pret, validation besoins.
 */
(function () {
  function qsa(root, sel) {
    return Array.prototype.slice.call(root.querySelectorAll(sel));
  }

  function qs(root, sel) {
    return root.querySelector(sel);
  }

  function searchKindOf(form) {
    var el = form.querySelector('input[name="searchKind"]:checked');
    return el ? el.value : "";
  }

  function wantsBien(kind) {
    return kind === "bien" || kind === "les_deux";
  }

  function wantsService(kind) {
    return kind === "service" || kind === "les_deux";
  }

  function needsPretSection(form) {
    var pret = form.querySelector('input[name="buyerNeeds"][value="pret"]:checked');
    var rachat = form.querySelector('input[name="buyerNeeds"][value="rachat"]:checked');
    return !!(pret || rachat);
  }

  function setSkip(el, skip) {
    if (!el) return;
    if (skip) el.setAttribute("data-wizard-skip", "1");
    else el.removeAttribute("data-wizard-skip");
  }

  function syncPretSteps(form) {
    var skip = !needsPretSection(form);
    qsa(form, "[data-wizard-skip-pret]").forEach(function (step) {
      setSkip(step, skip);
    });
  }

  function syncSearchPanels(form) {
    var kind = searchKindOf(form);
    var bienPanel = qs(form, "[data-search-bien-panel]");
    var servicePanel = qs(form, "[data-search-service-panel]");
    if (bienPanel) bienPanel.hidden = !wantsBien(kind);
    if (servicePanel) servicePanel.hidden = !wantsService(kind);

    /* Service seul : pas d'etape « precisions bien » */
    var projet = qs(form, '[data-step-name="projet"]');
    setSkip(projet, kind === "service");
  }

  function syncAll(form) {
    syncSearchPanels(form);
    syncPretSteps(form);
  }

  function validateSearch(form) {
    var kind = searchKindOf(form);
    var kindHint = qs(form, "[data-search-kind-hint]");
    var propHint = qs(form, "[data-property-sought-hint]");
    var sellerHint = qs(form, "[data-seller-type-hint]");
    var serviceHint = qs(form, "[data-service-sought-hint]");
    var ok = true;

    if (kindHint) kindHint.hidden = true;
    if (propHint) propHint.hidden = true;
    if (sellerHint) sellerHint.hidden = true;
    if (serviceHint) serviceHint.hidden = true;

    if (!kind) {
      if (kindHint) kindHint.hidden = false;
      return false;
    }

    if (wantsBien(kind)) {
      var props = form.querySelectorAll('input[name="propertySought"]:checked');
      if (!props.length) {
        if (propHint) propHint.hidden = false;
        ok = false;
      }
      var seller = form.querySelector('input[name="sellerType"]:checked');
      if (!seller) {
        if (sellerHint) sellerHint.hidden = false;
        ok = false;
      }
    }

    if (wantsService(kind)) {
      var services = form.querySelectorAll('input[name="serviceSought"]:checked');
      if (!services.length) {
        if (serviceHint) serviceHint.hidden = false;
        ok = false;
      }
    }

    return ok;
  }

  function validateBuyerNeeds(form) {
    var checked = form.querySelectorAll('input[name="buyerNeeds"]:checked');
    var hint = form.querySelector("[data-buyer-needs-hint]");
    if (!checked.length) {
      if (hint) hint.hidden = false;
      return false;
    }
    if (hint) hint.hidden = true;
    return true;
  }

  function visibleStep(form) {
    return qsa(form, ".wizard-step").find(function (s) {
      return !s.hidden;
    });
  }

  function bindForm(form) {
    if (!form || form.dataset.acheteurImmoBound) return;
    form.dataset.acheteurImmoBound = "1";

    qsa(form, 'input[name="searchKind"]').forEach(function (r) {
      r.addEventListener("change", function () {
        syncSearchPanels(form);
      });
    });

    qsa(form, 'input[name="buyerNeeds"]').forEach(function (cb) {
      cb.addEventListener("change", function () {
        syncPretSteps(form);
      });
    });

    syncAll(form);

    form.addEventListener(
      "click",
      function (e) {
        var btn = e.target.closest(".wizard-next");
        if (!btn) return;
        var step = visibleStep(form);
        var name = step && step.getAttribute("data-step-name");
        if (name === "recherche") {
          syncSearchPanels(form);
          if (!validateSearch(form)) {
            e.preventDefault();
            e.stopImmediatePropagation();
          }
          return;
        }
        if (name === "besoins") {
          if (!validateBuyerNeeds(form)) {
            e.preventDefault();
            e.stopImmediatePropagation();
          }
        }
      },
      true
    );

    form.addEventListener("lo:wizard_step", function () {
      syncAll(form);
    });
  }

  function init() {
    qsa(document, "form[data-acheteur-immo]").forEach(bindForm);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
