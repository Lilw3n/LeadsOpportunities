/**
 * Parcours acquereur immobilier — sauts d'etapes pret et validation besoins.
 */
(function () {
  function qsa(root, sel) {
    return Array.prototype.slice.call(root.querySelectorAll(sel));
  }

  function needsPretSection(form) {
    var pret = form.querySelector('input[name="buyerNeeds"][value="pret"]:checked');
    var rachat = form.querySelector('input[name="buyerNeeds"][value="rachat"]:checked');
    return !!(pret || rachat);
  }

  function syncPretSteps(form) {
    var skip = !needsPretSection(form);
    qsa(form, "[data-wizard-skip-pret]").forEach(function (step) {
      if (skip) {
        step.setAttribute("data-wizard-skip", "1");
      } else {
        step.removeAttribute("data-wizard-skip");
      }
    });
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

  function bindForm(form) {
    if (!form || form.dataset.acheteurImmoBound) return;
    form.dataset.acheteurImmoBound = "1";

    qsa(form, 'input[name="buyerNeeds"]').forEach(function (cb) {
      cb.addEventListener("change", function () {
        syncPretSteps(form);
      });
    });

    syncPretSteps(form);

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
      syncPretSteps(form);
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
