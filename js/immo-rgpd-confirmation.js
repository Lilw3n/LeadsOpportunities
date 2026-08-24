/**
 * Confirmation RGPD — prospection commerciale (newsletter, SMS).
 * Mode client : consentement direct. Mode conseiller : attestation de collecte.
 */
(function (global) {
  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function isConseiller() {
    return (
      global.AcheteurImmoFillMode &&
      typeof global.AcheteurImmoFillMode.isConseiller === "function" &&
      global.AcheteurImmoFillMode.isConseiller()
    );
  }

  function syncQuestion(root) {
    root = root || document;
    var clientQ = qs("[data-rgpd-question-client]", root);
    var conseillerQ = qs("[data-rgpd-question-conseiller]", root);
    var conseiller = isConseiller();
    if (clientQ) clientQ.hidden = conseiller;
    if (conseillerQ) conseillerQ.hidden = !conseiller;
  }

  function hasAnswer(root) {
    return !!root.querySelector("[name='sellMarketingConsent']:checked");
  }

  function validate(root) {
    root = root || document;
    var block = qs("[data-rgpd-confirmation-block]", root);
    if (!block || block.hidden) {
      return { ok: true, blocking: [], recommended: [] };
    }
    var panel = block.closest("[data-search-vente-panel]");
    if (panel && panel.hidden) {
      return { ok: true, blocking: [], recommended: [] };
    }
    if (hasAnswer(root)) {
      return { ok: true, blocking: [], recommended: [] };
    }
    return {
      ok: false,
      blocking: [
        {
          id: "sellMarketingConsent",
          label: isConseiller()
            ? "Confirmation RGPD — indiquer si le consentement prospection a été collecté (Oui / Non)"
            : "Confirmation RGPD — choisir Oui ou Non pour la prospection commerciale (newsletter, SMS)",
          el: block.querySelector("[data-rgpd-confirm-actions]") || block,
          section: "Confirmation",
        },
      ],
      recommended: [],
    };
  }

  function bind(root) {
    root = root || document;
    var block = qs("[data-rgpd-confirmation-block]", root);
    if (!block || block.dataset.rgpdBound) return;
    block.dataset.rgpdBound = "1";
    syncQuestion(root);
    document.addEventListener("change", function (e) {
      if (e.target && e.target.matches('input[name="fillModeUi"]')) {
        syncQuestion(root);
      }
      if (e.target && e.target.matches("[name='sellMarketingConsent']")) {
        var wrap = e.target.closest(".immo-rgpd-confirm-btn");
        if (wrap && wrap.parentElement) {
          wrap.parentElement.querySelectorAll(".immo-rgpd-confirm-btn").forEach(function (btn) {
            btn.classList.toggle("is-selected", btn.contains(e.target));
          });
        }
      }
    });
  }

  function boot() {
    bind(document);
    syncQuestion(document);
  }

  global.ImmoRgpdConfirmation = {
    syncQuestion: syncQuestion,
    validate: validate,
    bind: bind,
    hasAnswer: hasAnswer,
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : global);
