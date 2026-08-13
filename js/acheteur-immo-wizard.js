/**
 * Parcours acquéreur intelligent :
 * 1) besoins (conditionne la suite)
 * 2) recherche de bien (toujours — matching / visites)
 * 3) budget prêt (si pret/rachat)
 * 4) ADE (si pret ou emprunteur)
 * 5) habitation / PNO / locataire selon cases
 */
(function () {
  function qsa(root, sel) {
    return Array.prototype.slice.call(root.querySelectorAll(sel));
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
      if (field.tagName === "SELECT" && !field.value) {
        /* keep empty */
      }
    }
  }

  function ensureSmartDefaults(form) {
    var checked = needsOf(form);
    if (checked.length) return;
    var pret = form.querySelector('input[name="buyerNeeds"][value="pret"]');
    var ade = form.querySelector('input[name="buyerNeeds"][value="emprunteur"]');
    if (pret) pret.checked = true;
    if (ade) ade.checked = true;
  }

  function autoLinkAdeWithPret(form) {
    var pret = form.querySelector('input[name="buyerNeeds"][value="pret"]:checked');
    var ade = form.querySelector('input[name="buyerNeeds"][value="emprunteur"]');
    if (pret && ade && !ade.checked) {
      ade.checked = true;
    }
  }

  function syncConditional(form) {
    autoLinkAdeWithPret(form);
    var needs = needsOf(form);
    var wantPret = hasNeed(needs, "pret") || hasNeed(needs, "rachat");
    var wantAde = wantPret || hasNeed(needs, "emprunteur");
    var wantHab = hasNeed(needs, "habitation");
    var wantPno = hasNeed(needs, "pno");
    var wantLoc = hasNeed(needs, "locataire");

    var typeSel = form.querySelector("#propertyType");
    var typeId = form.querySelector("#propertyTypeId");
    if (typeSel && typeId) typeId.value = typeSel.value || "";

    var budgetMax = form.querySelector("#budgetMax");
    var propertyPrice = form.querySelector("#propertyPrice");
    if (budgetMax && propertyPrice && budgetMax.value && !propertyPrice.value) {
      propertyPrice.value = budgetMax.value;
    }

    qsa(form, "[data-wizard-skip-pret]").forEach(function (step) {
      setSkip(step, !wantPret);
    });

    /* Étape logement : alléger si pas locataire/PNO */
    var tenantIns = form.querySelector("#tenantInsurance");
    var pnoProps = form.querySelector("#pnoProperties");
    setFieldRequired(tenantIns, wantLoc);
    if (tenantIns && !wantLoc) {
      if (!tenantIns.value) tenantIns.value = "Non concerne (pas locataire)";
    }

    /* Finalisation assurances */
    var hab = form.querySelector("#insuranceHabitationNeed");
    var pno = form.querySelector("#insurancePnoNeed");
    var loc = form.querySelector("#insuranceTenantNeed");
    var adeField = form.querySelector("#insuranceBorrower");
    var monthly = form.querySelector("#monthlyTarget");

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

    var banner = form.querySelector("[data-buyer-path-banner]");
    if (banner) {
      var bits = ["Recherche de bien (matching / visites)"];
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
          .join(" → ");
      banner.hidden = false;
    }
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

  function bindForm(form) {
    if (!form || form.dataset.acheteurImmoBound) return;
    form.dataset.acheteurImmoBound = "1";

    ensureSmartDefaults(form);

    qsa(form, 'input[name="buyerNeeds"]').forEach(function (cb) {
      cb.addEventListener("change", function () {
        if (cb.value === "pret" && cb.checked) {
          var ade = form.querySelector('input[name="buyerNeeds"][value="emprunteur"]');
          if (ade) ade.checked = true;
        }
        syncConditional(form);
      });
    });
    var typeSel = form.querySelector("#propertyType");
    if (typeSel) {
      typeSel.addEventListener("change", function () {
        syncConditional(form);
      });
    }
    var budgetMax = form.querySelector("#budgetMax");
    if (budgetMax) {
      budgetMax.addEventListener("change", function () {
        var propertyPrice = form.querySelector("#propertyPrice");
        if (propertyPrice && budgetMax.value && !propertyPrice.value) propertyPrice.value = budgetMax.value;
      });
    }

    syncConditional(form);

    form.addEventListener(
      "click",
      function (e) {
        var btn = e.target.closest(".wizard-next");
        if (!btn) return;
        var steps = qsa(form, ".wizard-step");
        var visibleIdx = steps.findIndex(function (s) {
          return !s.hidden;
        });
        if (visibleIdx !== 0) return;
        if (!validateBuyerNeeds(form)) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      },
      true
    );

    form.addEventListener("lo:wizard_step", function () {
      syncConditional(form);
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
  };
})();
