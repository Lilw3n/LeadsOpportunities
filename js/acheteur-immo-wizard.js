/**
 * Parcours acquereur — recherche de bien/service, contact precoce, puis pret / assurances.
 */
(function () {
  function qsa(root, sel) {
    return Array.prototype.slice.call(root.querySelectorAll(sel));
  }

  function qs(root, sel) {
    return root.querySelector(sel);
  }

  function isValidFrenchMobile(phone) {
    if (!phone) return false;
    var d = String(phone).replace(/\D/g, "");
    if (d.indexOf("33") === 0 && d.length === 11) d = "0" + d.slice(2);
    return d.length >= 10 && /^0[67]/.test(d);
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
  }

  function saveContactDraft(form) {
    if (!window.QuoteIntelligence) return;
    var email = qs(form, '[name="email"]');
    var phone = qs(form, '[name="phone"]');
    if (!email || !phone) return;
    if (!isValidEmail(email.value) || !isValidFrenchMobile(phone.value)) return;
    window.QuoteIntelligence.saveProgress(form, 2, "contact", "contact_capture");
  }

  function searchKindOf(form) {
    var el = qs(form, 'input[name="searchKind"]:checked');
    return el ? el.value : "";
  }

  function wantsBien(kind) {
    return kind === "bien" || kind === "les_deux";
  }

  function wantsService(kind) {
    return kind === "service" || kind === "les_deux";
  }

  function needsOf(form) {
    return qsa(form, 'input[name="buyerNeeds"]:checked').map(function (el) {
      return el.value;
    });
  }

  function hasNeed(needs, id) {
    return needs.indexOf(id) >= 0;
  }

  function setSkip(el, skip) {
    if (!el) return;
    if (skip) el.setAttribute("data-wizard-skip", "1");
    else el.removeAttribute("data-wizard-skip");
  }

  function setFieldRequired(field, on) {
    if (!field) return;
    if (on) {
      field.required = true;
      field.removeAttribute("data-optional");
    } else {
      field.required = false;
      field.setAttribute("data-optional", "1");
    }
  }

  function ensureSmartDefaults(form) {
    var kind = searchKindOf(form) || "bien";
    if (!wantsBien(kind) || needsOf(form).length || form.dataset.buyerNeedsTouched === "1") return;
    var pret = qs(form, 'input[name="buyerNeeds"][value="pret"]');
    var ade = qs(form, 'input[name="buyerNeeds"][value="emprunteur"]');
    if (pret) pret.checked = true;
    if (ade) ade.checked = true;
    form.dataset.buyerNeedsAuto = "1";
  }

  function clearAutoNeedsForServiceOnly(form) {
    var kind = searchKindOf(form) || "bien";
    if (wantsBien(kind) || form.dataset.buyerNeedsAuto !== "1" || form.dataset.buyerNeedsTouched === "1") return;
    qsa(form, 'input[name="buyerNeeds"]').forEach(function (el) {
      el.checked = false;
    });
    delete form.dataset.buyerNeedsAuto;
  }

  function autoLinkAdeWithPret(form) {
    var pret = qs(form, 'input[name="buyerNeeds"][value="pret"]:checked');
    var ade = qs(form, 'input[name="buyerNeeds"][value="emprunteur"]');
    if (pret && ade && !ade.checked) ade.checked = true;
  }

  function syncModeFromUi(form) {
    var ui = qs(form, 'input[name="searchModeUi"]:checked');
    if (!ui) return;
    var hidden = qs(form, 'input[name="searchKind"][value="' + ui.value + '"]');
    if (hidden) hidden.checked = true;
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

    setSkip(qs(form, '[data-step-name="projet"]'), kind === "service");
    clearAutoNeedsForServiceOnly(form);
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

  function syncNeedDependentFields(form) {
    autoLinkAdeWithPret(form);
    var needs = needsOf(form);
    var wantPret = hasNeed(needs, "pret") || hasNeed(needs, "rachat");
    var wantAde = wantPret || hasNeed(needs, "emprunteur");
    var wantHab = hasNeed(needs, "habitation");
    var wantPno = hasNeed(needs, "pno");
    var wantLoc = hasNeed(needs, "locataire");

    qsa(form, "[data-wizard-skip-pret]").forEach(function (step) {
      setSkip(step, !wantPret);
    });

    setFieldRequired(qs(form, "#tenantInsurance"), wantLoc);
    setFieldRequired(qs(form, "#insuranceHabitationNeed"), wantHab);
    setFieldRequired(qs(form, "#insurancePnoNeed"), wantPno);
    setFieldRequired(qs(form, "#insuranceTenantNeed"), wantLoc);
    setFieldRequired(qs(form, "#insuranceBorrower"), wantAde);

    var monthly = qs(form, "#monthlyTarget");
    if (monthly) {
      if (wantPret) monthly.removeAttribute("data-optional");
      else monthly.setAttribute("data-optional", "1");
    }

    var tenantIns = qs(form, "#tenantInsurance");
    var hab = qs(form, "#insuranceHabitationNeed");
    var pno = qs(form, "#insurancePnoNeed");
    var loc = qs(form, "#insuranceTenantNeed");
    var adeField = qs(form, "#insuranceBorrower");
    if (tenantIns && !wantLoc && !tenantIns.value) tenantIns.value = "Non concerne (pas locataire)";
    if (hab && !wantHab && !hab.value) hab.value = "Non concerne";
    if (pno && !wantPno && !pno.value) pno.value = "Non concerne";
    if (loc && !wantLoc && !loc.value) loc.value = "Non, pas locataire";
    if (adeField && !wantAde && !adeField.value) adeField.value = "Non concerne (pas de pret)";
    if (adeField && wantAde && adeField.value === "Non concerne (pas de pret)") {
      adeField.value = "Oui, via le courtier (delegation Lemoine)";
    }

    var banner = qs(form, "[data-buyer-path-banner]");
    if (banner) {
      var bits = ["Contact", "Recherche de bien / service"];
      if (wantPret) bits.push("Pret / budget");
      if (wantAde) bits.push("Assurance emprunteur");
      if (wantHab) bits.push("Habitation");
      if (wantPno) bits.push("PNO");
      if (wantLoc) bits.push("Locataire");
      banner.innerHTML = "<strong>Parcours intelligent :</strong> " + bits.join(" &rarr; ");
      banner.hidden = false;
    }
  }

  function syncAll(form) {
    syncSearchPanels(form);
    syncNeedDependentFields(form);
    syncBudgetToPrice(form);
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

    if (wantsBien(kind)) {
      if (!form.querySelectorAll('input[name="propertySought"]:checked').length) {
        if (propHint) propHint.hidden = false;
        ok = false;
      }
      if (!qs(form, 'input[name="sellerType"]:checked')) {
        if (sellerHint) sellerHint.hidden = false;
        ok = false;
      }
      qsa(form, "[data-search-bien-required]").forEach(function (el) {
        el.classList.remove("input-invalid");
        var v = (el.value || "").trim();
        if (!v || (el.name === "postalProject" && !/^[0-9]{5}$/.test(v))) {
          el.classList.add("input-invalid");
          ok = false;
        }
      });
    }

    if (wantsService(kind) && !form.querySelectorAll('input[name="serviceSought"]:checked').length) {
      if (serviceHint) serviceHint.hidden = false;
      ok = false;
    }

    return ok;
  }

  function validateBuyerNeeds(form) {
    ensureSmartDefaults(form);
    syncNeedDependentFields(form);
    var hint = qs(form, "[data-buyer-needs-hint]");
    if (!needsOf(form).length) {
      if (hint) hint.hidden = false;
      return false;
    }
    if (hint) hint.hidden = true;
    return true;
  }

  function validateContact(form) {
    var email = qs(form, '[name="email"]');
    var phone = qs(form, '[name="phone"]');
    var phoneHint = qs(form, "[data-phone-hint]");
    if (phone) phone.classList.remove("input-invalid");
    if (phone && phone.value && !isValidFrenchMobile(phone.value)) {
      if (phoneHint) phoneHint.hidden = false;
      phone.classList.add("input-invalid");
      return false;
    }
    if (phoneHint) phoneHint.hidden = true;
    if (email && phone && isValidEmail(email.value) && isValidFrenchMobile(phone.value)) {
      saveContactDraft(form);
    }
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

    ensureSmartDefaults(form);

    qsa(form, "[data-search-mode]").forEach(function (r) {
      r.addEventListener("change", function () {
        syncAll(form);
      });
    });

    qsa(form, 'input[name="propertySought"], input[name="sellerType"], input[name="serviceSought"], input[name="buyerNeeds"]').forEach(function (el) {
      el.addEventListener("change", function () {
        if (el.name === "buyerNeeds" && el.value === "pret" && el.checked) {
          form.dataset.buyerNeedsTouched = "1";
          var ade = qs(form, 'input[name="buyerNeeds"][value="emprunteur"]');
          if (ade) ade.checked = true;
        } else if (el.name === "buyerNeeds") {
          form.dataset.buyerNeedsTouched = "1";
        }
        syncAll(form);
      });
    });

    qsa(form, "#budgetMax, #propertySurfaceSearch, #propertyType").forEach(function (el) {
      el.addEventListener("change", function () {
        syncAll(form);
      });
    });

    qsa(form, "#email, #phone, #firstName, #lastName").forEach(function (el) {
      el.addEventListener("blur", function () {
        saveContactDraft(form);
      });
      if (el.id === "phone") {
        el.addEventListener("input", function () {
          var hint = qs(form, "[data-phone-hint]");
          if (hint) hint.hidden = isValidFrenchMobile(el.value) || !(el.value || "").trim();
        });
      }
    });

    syncAll(form);

    form.addEventListener(
      "click",
      function (e) {
        var btn = e.target.closest(".wizard-next");
        if (!btn) return;
        var step = visibleStep(form);
        var name = step && step.getAttribute("data-step-name");
        if (name === "recherche" && !validateSearch(form)) {
          e.preventDefault();
          e.stopImmediatePropagation();
          return;
        }
        if (name === "contact" && !validateContact(form)) {
          e.preventDefault();
          e.stopImmediatePropagation();
          return;
        }
        if (name === "besoins" && !validateBuyerNeeds(form)) {
          e.preventDefault();
          e.stopImmediatePropagation();
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
    needsOf: needsOf,
    syncConditional: syncAll,
  };
})();
