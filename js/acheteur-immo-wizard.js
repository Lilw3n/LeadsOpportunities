/**
 * Parcours immobilier — recherche et/ou questionnaire (l'un, l'autre, ou les deux).
 */
(function () {
  function qsa(root, sel) {
    return Array.prototype.slice.call(root.querySelectorAll(sel));
  }

  function qs(root, sel) {
    return root.querySelector(sel);
  }

  function journeyIntentOf(form) {
    var el = form.querySelector('input[name="journeyIntent"]:checked');
    return el ? el.value : "";
  }

  function wantsSearch(intent) {
    return intent === "recherche" || intent === "les_deux";
  }

  function wantsQuestionnaire(intent) {
    return intent === "questionnaire" || intent === "les_deux";
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
    if (!wantsQuestionnaire(journeyIntentOf(form))) return false;
    var pret = form.querySelector('input[name="buyerNeeds"][value="pret"]:checked');
    var rachat = form.querySelector('input[name="buyerNeeds"][value="rachat"]:checked');
    return !!(pret || rachat);
  }

  function setSkip(el, skip) {
    if (!el) return;
    if (skip) el.setAttribute("data-wizard-skip", "1");
    else el.removeAttribute("data-wizard-skip");
  }

  function syncJourneyFromUi(form) {
    var ui = form.querySelector('input[name="journeyModeUi"]:checked');
    if (!ui) return;
    var hidden = form.querySelector('input[name="journeyIntent"][value="' + ui.value + '"]');
    if (hidden) hidden.checked = true;
  }

  function syncSearchKindFromUi(form) {
    var ui = form.querySelector('input[name="searchModeUi"]:checked');
    if (!ui) return;
    var hidden = form.querySelector('input[name="searchKind"][value="' + ui.value + '"]');
    if (hidden) hidden.checked = true;
  }

  function syncMatchingNeed(form) {
    var matching = qs(form, "[data-matching-need]");
    if (!matching) return;
    var intent = journeyIntentOf(form);
    matching.checked = intent === "recherche";
  }

  function syncPretSteps(form) {
    var skip = !needsPretSection(form);
    qsa(form, "[data-wizard-skip-pret]").forEach(function (step) {
      setSkip(step, skip);
    });
  }

  function syncPathSkips(form) {
    var intent = journeyIntentOf(form) || "recherche";
    var wantQ = wantsQuestionnaire(intent);
    var wantS = wantsSearch(intent);

    qsa(form, "[data-wizard-skip-questionnaire]").forEach(function (step) {
      setSkip(step, !wantQ);
    });

    qsa(form, "[data-wizard-skip-search]").forEach(function (step) {
      /* questionnaire seul → skip precisions bien ; service seul aussi */
      var kind = searchKindOf(form);
      var skipProjet = !wantS || kind === "service";
      setSkip(step, skipProjet);
    });

    syncPretSteps(form);
  }

  function syncSearchPanels(form) {
    syncJourneyFromUi(form);
    syncSearchKindFromUi(form);
    syncMatchingNeed(form);

    var intent = journeyIntentOf(form) || "recherche";
    var wantS = wantsSearch(intent);
    var wantQ = wantsQuestionnaire(intent);
    var kind = searchKindOf(form) || "bien";

    var searchBlock = qs(form, "[data-search-block]");
    var qHint = qs(form, "[data-questionnaire-only-hint]");
    if (searchBlock) searchBlock.hidden = !wantS;
    if (qHint) qHint.hidden = !(intent === "questionnaire");

    var bienPanel = qs(form, "[data-search-bien-panel]");
    var servicePanel = qs(form, "[data-search-service-panel]");
    if (bienPanel) bienPanel.hidden = !(wantS && wantsBien(kind));
    if (servicePanel) servicePanel.hidden = !(wantS && wantsService(kind));

    qsa(form, "[data-search-bien-required]").forEach(function (el) {
      var on = wantS && wantsBien(kind);
      el.disabled = !on;
      if (!on) el.classList.remove("input-invalid");
    });

    qsa(form, "[data-search-block] input, [data-search-block] select, [data-search-block] textarea").forEach(
      function (el) {
        if (el.name === "searchKind" || el.name === "searchModeUi") {
          el.disabled = !wantS;
          return;
        }
        if (el.hasAttribute("data-search-bien-required")) return;
        if (el.name === "propertySought" || el.name === "sellerType" || el.name === "budgetMin" || el.name === "roomsMin" || el.name === "propertySurfaceSearch" || el.name === "searchCities") {
          el.disabled = !(wantS && wantsBien(kind));
          return;
        }
        if (el.name === "serviceSought") {
          el.disabled = !(wantS && wantsService(kind));
          return;
        }
        el.disabled = !wantS;
      }
    );

    syncPathSkips(form);
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

  function softFillFinalisation(form) {
    if (wantsQuestionnaire(journeyIntentOf(form))) return;
    var defaults = {
      insuranceHabitationNeed: "Non concerne",
      insurancePnoNeed: "Non concerne",
      insuranceTenantNeed: "Non, pas locataire",
      insuranceBorrower: "Non concerne (pas de pret)",
    };
    Object.keys(defaults).forEach(function (name) {
      var el = form.querySelector('[name="' + name + '"]');
      if (el && !el.value) el.value = defaults[name];
    });
  }

  function syncAll(form) {
    syncSearchPanels(form);
    syncBudgetToPrice(form);
    softFillFinalisation(form);
  }

  function validateSearch(form) {
    syncSearchPanels(form);
    var intent = journeyIntentOf(form);
    var intentHint = qs(form, "[data-journey-intent-hint]");
    var kindHint = qs(form, "[data-search-kind-hint]");
    var propHint = qs(form, "[data-property-sought-hint]");
    var sellerHint = qs(form, "[data-seller-type-hint]");
    var serviceHint = qs(form, "[data-service-sought-hint]");
    var ok = true;

    qsa(form, "[data-journey-intent-hint]").forEach(function (h) {
      h.hidden = true;
    });
    if (kindHint) kindHint.hidden = true;
    if (propHint) propHint.hidden = true;
    if (sellerHint) sellerHint.hidden = true;
    if (serviceHint) serviceHint.hidden = true;

    if (!intent) {
      qsa(form, "[data-journey-intent-hint]").forEach(function (h) {
        h.hidden = false;
      });
      return false;
    }

    /* Questionnaire seul : pas de criteres de recherche */
    if (!wantsSearch(intent)) return true;

    var kind = searchKindOf(form);
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
      qsa(form, "[data-search-bien-required]").forEach(function (el) {
        if (el.disabled) return;
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
    if (!wantsQuestionnaire(journeyIntentOf(form))) return true;
    var checked = form.querySelectorAll('input[name="buyerNeeds"]:checked');
    /* ignorer le flag matching auto */
    var real = Array.prototype.filter.call(checked, function (el) {
      return el.value !== "matching";
    });
    var hint = form.querySelector("[data-buyer-needs-hint]");
    if (!real.length) {
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

    qsa(form, "[data-journey-mode]").forEach(function (r) {
      r.addEventListener("change", function () {
        syncAll(form);
      });
    });

    qsa(form, "[data-search-mode]").forEach(function (r) {
      r.addEventListener("change", function () {
        syncSearchPanels(form);
      });
    });

    qsa(form, 'input[name="buyerNeeds"]').forEach(function (cb) {
      cb.addEventListener("change", function () {
        if (cb.hasAttribute("data-matching-need")) return;
        syncPretSteps(form);
      });
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
            softFillFinalisation(form);
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
