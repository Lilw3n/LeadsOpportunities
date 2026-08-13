/**
 * Parcours acquereur : recherche de bien, contact rapide, puis pret / assurances.
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

  function setSkip(el, skip) {
    if (!el) return;
    if (skip) el.setAttribute("data-wizard-skip", "1");
    else el.removeAttribute("data-wizard-skip");
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
    window.QuoteIntelligence.saveProgress(form, 3, "contact", "contact_capture");
  }

  function needsOf(form) {
    return qsa(form, 'input[name="buyerNeeds"]:checked').map(function (el) {
      return el.value;
    });
  }

  function hasNeed(needs, id) {
    return needs.indexOf(id) >= 0;
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
    var checked = needsOf(form);
    if (checked.length) return;
    var pret = qs(form, 'input[name="buyerNeeds"][value="pret"]');
    var ade = qs(form, 'input[name="buyerNeeds"][value="emprunteur"]');
    if (pret) pret.checked = true;
    if (ade) ade.checked = true;
  }

  function autoLinkAdeWithPret(form) {
    var pret = qs(form, 'input[name="buyerNeeds"][value="pret"]:checked');
    var ade = qs(form, 'input[name="buyerNeeds"][value="emprunteur"]');
    if (pret && ade && !ade.checked) ade.checked = true;
  }

  function syncConditional(form) {
    autoLinkAdeWithPret(form);
    var needs = needsOf(form);
    var wantPret = hasNeed(needs, "pret") || hasNeed(needs, "rachat");
    var wantAde = wantPret || hasNeed(needs, "emprunteur");
    var wantHab = hasNeed(needs, "habitation");
    var wantPno = hasNeed(needs, "pno");
    var wantLoc = hasNeed(needs, "locataire");

    var typeSel = qs(form, "#propertyType");
    var typeId = qs(form, "#propertyTypeId");
    if (typeSel && typeId) typeId.value = typeSel.value || "";

    qsa(form, "[data-wizard-skip-pret]").forEach(function (step) {
      setSkip(step, !wantPret);
    });

    var tenantIns = qs(form, "#tenantInsurance");
    setFieldRequired(tenantIns, wantLoc);
    if (tenantIns && !wantLoc && !tenantIns.value) {
      tenantIns.value = "Non concerne (pas locataire)";
    }

    var hab = qs(form, "#insuranceHabitationNeed");
    var pno = qs(form, "#insurancePnoNeed");
    var loc = qs(form, "#insuranceTenantNeed");
    var adeField = qs(form, "#insuranceBorrower");
    var monthly = qs(form, "#monthlyTarget");

    setFieldRequired(hab, wantHab);
    setFieldRequired(pno, wantPno);
    setFieldRequired(loc, wantLoc);
    setFieldRequired(adeField, wantAde);
    if (monthly) {
      if (wantPret) monthly.removeAttribute("data-optional");
      else monthly.setAttribute("data-optional", "1");
    }

    if (hab && !wantHab && !hab.value) hab.value = "Non concerne";
    if (pno && !wantPno && !pno.value) pno.value = "Non concerne";
    if (loc && !wantLoc && !loc.value) loc.value = "Non, pas locataire";
    if (adeField && !wantAde && !adeField.value) adeField.value = "Non concerne (pas de pret)";
    if (adeField && wantAde && adeField.value === "Non concerne (pas de pret)") {
      adeField.value = "Oui, via le courtier (delegation Lemoine)";
    }

    var banner = qs(form, "[data-buyer-path-banner]");
    if (banner) {
      var bits = ["Contact", "Recherche de bien (matching / visites)"];
      if (wantPret) bits.push("Questionnaire pret / budget");
      if (wantAde) bits.push("Assurance emprunteur");
      if (wantHab) bits.push("Habitation");
      if (wantPno) bits.push("PNO");
      if (wantLoc) bits.push("Locataire");
      banner.innerHTML =
        "<strong>Parcours intelligent :</strong> " +
        bits
          .map(function (b, i) {
            return i + 1 + ". " + b;
          })
          .join(" -> ");
      banner.hidden = false;
    }
  }

  function syncModeFromUi(form) {
    var ui = form.querySelector('input[name="searchModeUi"]:checked');
    if (!ui) return;
    var hidden = form.querySelector('input[name="searchKind"][value="' + ui.value + '"]');
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

    /* Service seul : pas d'etape « precisions bien » */
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
    syncConditional(form);
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
    ensureSmartDefaults(form);
    syncConditional(form);
    var checked = needsOf(form);
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
    ensureSmartDefaults(form);

    qsa(form, "[data-search-mode]").forEach(function (r) {
      r.addEventListener("change", function () {
        syncAll(form);
      });
    });

    qsa(form, 'input[name="buyerNeeds"]').forEach(function (cb) {
      cb.addEventListener("change", function () {
        syncAll(form);
      });
    });

    var typeSel = qs(form, "#propertyType");
    if (typeSel) {
      typeSel.addEventListener("change", function () {
        syncAll(form);
      });
    }

    var budgetMax = qs(form, "#budgetMax");
    if (budgetMax) {
      budgetMax.addEventListener("change", function () {
        syncBudgetToPrice(form);
      });
    }

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
          return;
        }
        if (name === "contact") {
          var email = qs(form, '[name="email"]');
          var phone = qs(form, '[name="phone"]');
          var phoneHint = qs(form, "[data-phone-hint]");
          if (phone && phone.value && !isValidFrenchMobile(phone.value)) {
            if (phoneHint) phoneHint.hidden = false;
            phone.classList.add("input-invalid");
            e.preventDefault();
            e.stopImmediatePropagation();
            return;
          }
          if (phoneHint) phoneHint.hidden = true;
          if (email && phone && isValidEmail(email.value) && isValidFrenchMobile(phone.value)) {
            saveContactDraft(form);
          }
        }
      },
      true
    );

    window.addEventListener("lo:wizard_step", function () {
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
    syncConditional: syncConditional,
    syncAll: syncAll,
  };
})();
