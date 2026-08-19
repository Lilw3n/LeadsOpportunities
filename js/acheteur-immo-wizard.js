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
    return el ? el.value : "";
  }

  function wantsBien(kind) {
    return kind === "bien" || kind === "les_deux";
  }

  function wantsVente(kind) {
    return kind === "service" || kind === "les_deux";
  }

  function wantsServiceExtras(kind) {
    return kind === "service";
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
    var ui = form.querySelector('input[name="searchModeUi"]:checked');
    if (!ui) return;
    var hidden = form.querySelector('input[name="searchKind"][value="' + ui.value + '"]');
    if (hidden) hidden.checked = true;
  }

  function syncStepTitle(form, kind) {
    var title = qs(form, "[data-wizard-recherche-title]");
    if (!title) return;
    if (kind === "les_deux") {
      title.textContent = "Projet de vente, puis bien recherché";
    } else if (kind === "service") {
      title.textContent = "Projet de vente — fiche complète";
    } else {
      title.textContent = "Quel bien recherchez-vous ?";
    }
  }

  function syncSearchPanels(form) {
    syncModeFromUi(form);
    var kind = searchKindOf(form) || "bien";
    var ventePanel = qs(form, "[data-search-vente-panel]");
    var bienPanel = qs(form, "[data-search-bien-panel]");
    var servicePanel = qs(form, "[data-search-service-panel]");
    var venteFirst = qs(form, "[data-search-vente-first]");

    if (ventePanel) ventePanel.hidden = !wantsVente(kind);
    if (bienPanel) bienPanel.hidden = !wantsBien(kind);
    if (servicePanel) servicePanel.hidden = !wantsServiceExtras(kind);

    if (venteFirst && ventePanel && bienPanel && venteFirst.parentNode) {
      if (wantsVente(kind) && wantsBien(kind)) {
        venteFirst.parentNode.insertBefore(ventePanel, bienPanel);
      } else if (wantsVente(kind)) {
        venteFirst.parentNode.insertBefore(ventePanel, venteFirst.nextSibling);
      }
    }

    qsa(form, "[data-search-bien-required]").forEach(function (el) {
      el.disabled = !wantsBien(kind);
      if (!wantsBien(kind)) el.classList.remove("input-invalid");
    });

    qsa(form, "[data-search-vente-required]").forEach(function (el) {
      el.disabled = !wantsVente(kind);
      if (!wantsVente(kind)) el.classList.remove("input-invalid");
    });

    var ownersMount = qs(form, "[data-owners-mount]");
    if (ownersMount) {
      qsa(ownersMount, "input, select, textarea").forEach(function (el) {
        el.disabled = !wantsVente(kind);
      });
    }

    syncStepTitle(form, kind);

    var bienHeading = qs(form, "[data-search-bien-heading]");
    if (bienHeading) {
      bienHeading.textContent = kind === "les_deux" ? "2. Bien recherché" : "Bien recherché";
    }

    var projet = qs(form, '[data-step-name="projet"]');
    setSkip(projet, kind === "service");
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

  function validateVente(form) {
    var kind = searchKindOf(form);
    if (!wantsVente(kind)) return true;
    var ok = true;
    var ownerHint = qs(form, "[data-owners-hint]");
    if (ownerHint) ownerHint.hidden = true;

    if (window.AcheteurImmoOwners) {
      var ownersMount = qs(form, "[data-owners-mount]");
      var ov = window.AcheteurImmoOwners.validate(ownersMount);
      if (!ov.ok) {
        ok = false;
        if (ownerHint) ownerHint.hidden = false;
      }
    }

    qsa(form, "[data-search-vente-required]").forEach(function (el) {
      el.classList.remove("input-invalid");
      var v = (el.value || "").trim();
      if (!v) {
        el.classList.add("input-invalid");
        ok = false;
        return;
      }
      if (el.name === "sellPostalCode" && !/^[0-9]{5}$/.test(v)) {
        el.classList.add("input-invalid");
        ok = false;
      }
    });

    var sellType = form.querySelector('input[name="sellPropertyType"]:checked');
    var typeHint = qs(form, "[data-sell-type-hint]");
    if (typeHint) typeHint.hidden = true;
    if (!sellType) {
      if (typeHint) typeHint.hidden = false;
      ok = false;
    }

    return ok;
  }

  function validateSearch(form) {
    syncSearchPanels(form);
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

    if (wantsVente(kind) && !validateVente(form)) ok = false;

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

    if (wantsServiceExtras(kind)) {
      var services = form.querySelectorAll('input[name="serviceSought"]:checked');
      if (!services.length) {
        var est = form.querySelector('input[name="serviceSought"][value="estimation_vente"]');
        if (est) est.checked = true;
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

    qsa(form, "[data-search-mode]").forEach(function (r) {
      r.addEventListener("change", function () {
        syncSearchPanels(form);
        if (searchKindOf(form) === "service") {
          var est = form.querySelector('input[name="serviceSought"][value="estimation_vente"]');
          if (est) est.checked = true;
        }
        if (window.VendeurVisitePretBlock) window.VendeurVisitePretBlock.syncVisibility();
      });
    });

    qsa(form, 'input[name="buyerNeeds"]').forEach(function (cb) {
      cb.addEventListener("change", function () {
        syncPretSteps(form);
      });
    });

    document.addEventListener("lo:listing-interest", function () {
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

  window.AcheteurImmoWizard = {
    sync: function (form) {
      if (!form) {
        qsa(document, "form[data-acheteur-immo]").forEach(syncAll);
        return;
      }
      syncAll(form);
    },
  };
})();
