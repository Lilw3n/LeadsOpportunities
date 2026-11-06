/**
 * Injecte l'étape « documents » dans les wizards landings (VTC, santé, crédit…)
 * qui n'ont pas encore de data-step-name="documents".
 */
(function (global) {
  function resolveNeed(form) {
    var hidden = form.querySelector('input[name="need"], input[name="serviceNeed"]');
    if (hidden && hidden.value) return String(hidden.value);
    if (form.getAttribute("data-vertical")) return form.getAttribute("data-vertical");
    var path = (global.location && global.location.pathname) || "";
    if (path.indexOf("vtc") !== -1) return "vtc";
    if (path.indexOf("sante") !== -1) return "sante";
    if (path.indexOf("credit") !== -1 || path.indexOf("pret") !== -1) return "credit-immo";
    if (path.indexOf("animaux") !== -1) return "animaux";
    if (path.indexOf("chasse") !== -1) return "chasse";
    if (path.indexOf("equitation") !== -1) return "equitation";
    return "default";
  }

  function findInsertBefore(form) {
    var steps = form.querySelectorAll(".wizard-step");
    if (!steps.length) return null;
    var prefer = form.querySelector(
      '[data-step-name="coordonnees"], [data-step-name="contact"], [data-step-name="finalize"], [data-step-name="validation"]'
    );
    if (prefer) return prefer;
    return steps[steps.length - 1];
  }

  function refreshStepCounter(form) {
    var counter = form.querySelector(".wizard-step-counter");
    if (!counter) return;
    var total = form.querySelectorAll(".wizard-step:not([data-wizard-skip='1'])").length;
    var text = counter.textContent || "";
    var m = text.match(/(\d+)\s*\/\s*(\d+)/);
    if (m) {
      counter.textContent = text.replace(m[0], m[1] + " / " + total);
    } else {
      counter.textContent = "Étape 1 / " + total;
    }
  }

  function injectIntoForm(form) {
    if (!form || form._docsStepInjected) return null;
    if (form.querySelector('[data-step-name="documents"]')) {
      form._docsStepInjected = true;
      if (global.DevisDocumentUpload && global.DevisDocumentUpload.mountInForm) {
        var needExisting = resolveNeed(form);
        return global.DevisDocumentUpload.mountInForm(form, needExisting);
      }
      return null;
    }
    if (!global.DevisDocumentUpload || !global.DevisDocumentUpload.buildStepHtml) return null;

    var need = resolveNeed(form);
    var html = global.DevisDocumentUpload.buildStepHtml(need);
    if (!html) return null;

    var before = findInsertBefore(form);
    var wrap = document.createElement("div");
    wrap.innerHTML = html;
    var step = wrap.firstElementChild;
    if (!step) return null;

    if (before && before.parentNode) {
      before.parentNode.insertBefore(step, before);
    } else {
      form.appendChild(step);
    }

    form._docsStepInjected = true;
    refreshStepCounter(form);

    if (global.DevisDocumentUpload.mountInForm) {
      return global.DevisDocumentUpload.mountInForm(form, need);
    }
    return null;
  }

  function injectAll() {
    document.querySelectorAll("form[data-quote-wizard], form[data-track-form]").forEach(function (form) {
      if (!form.querySelector(".wizard-step")) return;
      try {
        injectIntoForm(form);
      } catch (e) {}
    });
  }

  global.DevisDocumentInject = {
    injectIntoForm: injectIntoForm,
    injectAll: injectAll,
    resolveNeed: resolveNeed,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectAll);
  } else {
    injectAll();
  }
})(typeof window !== "undefined" ? window : globalThis);
