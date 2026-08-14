/**
 * Parcours acquereur — recherche de bien (style annonce) puis pret / assurances.
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
    if (el) return el.value;
    el = form.querySelector('input[name="searchKind"]');
    return el ? el.value : "";
  }

  function wantsBien(kind) {
    return kind === "bien" || kind === "les_deux" || kind === "";
  }

  function wantsService(kind) {
    return kind === "les_deux";
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

  function syncModeFromUi(form) {
    var searchKind = form.querySelector('input[name="searchKind"]');
    var toggle = form.querySelector("[data-search-services-toggle]");
    if (searchKind) searchKind.value = toggle && toggle.checked ? "les_deux" : "bien";
  }

  function syncSearchPanels(form) {
    syncModeFromUi(form);
    var kind = searchKindOf(form) || "bien";
    var bienPanel = qs(form, "[data-search-bien-panel]");
    var servicePanel = qs(form, "[data-search-service-panel]");
    if (bienPanel) bienPanel.hidden = !wantsBien(kind);
    if (servicePanel) servicePanel.hidden = !wantsService(kind);

    qsa(form, "[data-search-bien-required]").forEach(function (el) {
      el.disabled = !wantsBien(kind);
      if (!wantsBien(kind)) el.classList.remove("input-invalid");
    });

    qsa(form, 'input[name="serviceSought"]').forEach(function (el) {
      el.disabled = !wantsService(kind);
      if (!wantsService(kind)) el.checked = false;
    });

    /* La recherche du bien reste toujours le parcours principal. */
    var projet = qs(form, '[data-step-name="projet"]');
    setSkip(projet, false);
  }

  function syncBudgetToPrice(form) {
    var budgetMax = qs(form, "#budgetMax");
    var propertyPrice = qs(form, "#propertyPrice");
    if (budgetMax && propertyPrice && budgetMax.value && !propertyPrice.value) {
      propertyPrice.value = budgetMax.value;
    }
    var surfSearch = qs(form, "#propertySurfaceSearch");
    var surf = qs(form, "#propertySurface");
    if (surfSearch && surf && surfSearch.value && !surf.value) {
      surf.value = surfSearch.value;
    }
    var props = qsa(form, 'input[name="propertySought"]:checked');
    var typeSel = qs(form, "#propertyType");
    if (typeSel && props.length === 1 && !typeSel.value) {
      var map = {
        appartement: "Appartement ancien",
        maison: "Maison ancienne",
        terrain: "Terrain a batir",
        local: "Local commercial / Mixte",
        immeuble: "Local commercial / Mixte",
      };
      if (map[props[0].value]) typeSel.value = map[props[0].value];
    }
  }

  function syncAll(form) {
    syncSearchPanels(form);
    syncPretSteps(form);
    syncBudgetToPrice(form);
  }

  function validateSearch(form) {
    syncSearchPanels(form);
    var kind = searchKindOf(form);
    var propHint = qs(form, "[data-property-sought-hint]");
    var sellerHint = qs(form, "[data-seller-type-hint]");
    var serviceHint = qs(form, "[data-service-sought-hint]");
    var ok = true;

    if (propHint) propHint.hidden = true;
    if (sellerHint) sellerHint.hidden = true;
    if (serviceHint) serviceHint.hidden = true;

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
      qsa(form, "[data-search-bien-required]").forEach(function (el) {
        el.classList.remove("input-invalid");
        var v = (el.value || "").trim();
        if (!v) {
          el.classList.add("input-invalid");
          ok = false;
          return;
        }
        if (el.name === "postalProject" && !/^[0-9]{5}$/.test(v)) {
          el.classList.add("input-invalid");
          ok = false;
        }
      });
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

    qsa(form, "[data-search-services-toggle]").forEach(function (r) {
      r.addEventListener("change", function () {
        syncSearchPanels(form);
      });
    });

    qsa(form, 'input[name="buyerNeeds"]').forEach(function (cb) {
      cb.addEventListener("change", function () {
        syncPretSteps(form);
      });
    });

    document.addEventListener("lo:listing-interest", function (ev) {
      var visite = form.querySelector('input[name="buyerNeeds"][value="visite"]');
      if (visite) visite.checked = true;
      syncAll(form);
    });

    var budgetMax = qs(form, "#budgetMax");
    if (budgetMax) {
      budgetMax.addEventListener("change", function () {
        syncBudgetToPrice(form);
      });
    }

    syncAll(form);

    form.addEventListener(
      "click",
      function (e) {
        var btn = e.target.closest(".wizard-next");
        if (!btn) return;
        var step = visibleStep(form);
        var name = step && step.getAttribute("data-step-name");
        if (name === "recherche") {
          if (!validateSearch(form)) {
            e.preventDefault();
            e.stopImmediatePropagation();
          } else {
            syncBudgetToPrice(form);
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
