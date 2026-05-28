/**
 * Parcours devis multi-etapes (inspire plateforme multisite).
 * Attendre: form[data-quote-wizard], .wizard-step, .wizard-next | .wizard-prev | submit final.
 */
(function () {
  function qs(form, sel) {
    return form.querySelector(sel);
  }

  function qsa(form, sel) {
    return Array.prototype.slice.call(form.querySelectorAll(sel));
  }

  function getSteps(form) {
    return qsa(form, ".wizard-step");
  }

  function stepInputs(step) {
    return qsa(step, "input, select, textarea").filter(function (el) {
      return !el.disabled && el.type !== "button" && el.type !== "submit";
    });
  }

  function validateStep(step) {
    var ok = true;
    var inputs = stepInputs(step);
    inputs.forEach(function (el) {
      el.classList.remove("input-invalid");
      if (el.hasAttribute("data-optional")) return;
      if (el.type === "checkbox") {
        if (el.hasAttribute("required") && !el.checked) {
          ok = false;
          el.classList.add("input-invalid");
        }
        return;
      }
      if (el.hasAttribute("required") || el.getAttribute("aria-required") === "true") {
        var v = (el.value || "").trim();
        if (!v) {
          ok = false;
          el.classList.add("input-invalid");
        }
      }
      if (el.type === "email" && el.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim())) {
        ok = false;
        el.classList.add("input-invalid");
      }
      if (
        (el.name === "postalCode" || el.name === "postalProject") &&
        el.value &&
        !/^[0-9]{5}$/.test(el.value.trim())
      ) {
        ok = false;
        el.classList.add("input-invalid");
      }
      if (el.name === "companySiret" && el.value) {
        var d = el.value.replace(/\s/g, "");
        if (d.length !== 14 || !/^[0-9]+$/.test(d)) {
          ok = false;
          el.classList.add("input-invalid");
        }
      }
    });

    var companyBlock = step.querySelector("[data-company-fields]");
    var frm = formOwner(step);
    if (companyBlock && frm && !companyBlock.hidden) {
      var cbCompany = frm.querySelector('[name="hasCompany"]');
      if (cbCompany && cbCompany.checked) {
        var cn = step.querySelector('[name="companyName"]');
        if (cn && !(cn.value || "").trim()) {
          ok = false;
          cn.classList.add("input-invalid");
        }
      }
    }
    return ok;
  }

  function formOwner(el) {
    var n = el;
    while (n && n.tagName !== "FORM") n = n.parentNode;
    return n;
  }

  function bindCompanyToggle(form) {
    var cb = qs(form, '[name="hasCompany"]');
    var block = qs(form, "[data-company-fields]");
    if (!cb || !block) return;
    function sync() {
      block.hidden = !cb.checked;
      qsa(block, "input").forEach(function (inp) {
        inp.disabled = !cb.checked;
      });
    }
    cb.addEventListener("change", sync);
    sync();
  }

  function initForm(form) {
    var steps = getSteps(form);
    if (!steps.length) return;

    var bar = qs(form, ".wizard-progress-fill");
    var stepLabel = qs(form, ".wizard-step-counter");
    var btnNext = qs(form, ".wizard-next");
    var btnPrev = qs(form, ".wizard-prev");
    var btnSubmit = qs(form, ".wizard-submit");
    var idx = 0;

    bindCompanyToggle(form);

    function verticalFromPath() {
      var hidden = form.querySelector('[name="need"]');
      if (hidden && hidden.value) return hidden.value;
      if (form.dataset.vertical) return form.dataset.vertical;
      var path = window.location.pathname;
      if (path.indexOf("vtc") !== -1) return "vtc";
      if (path.indexOf("sante") !== -1) return "sante";
      if (path.indexOf("credit-immo") !== -1) return "credit_immo";
      if (path.indexOf("animaux") !== -1) return "animaux";
      return "unknown";
    }

    function stepNameAt(i) {
      var s = steps[i];
      return (
        (s &&
          (s.getAttribute("data-step-name") ||
            s.getAttribute("data-step") ||
            s.getAttribute("data-wizard-step"))) ||
        String(i + 1)
      );
    }

    function emitStepEvent() {
      var stepNum = idx + 1;
      form.dataset.currentStep = String(stepNum);
      form.dataset.currentStepName = stepNameAt(idx);
      try {
        window.dispatchEvent(
          new CustomEvent("lo:wizard_step", {
            detail: {
              step_number: stepNum,
              step_total: steps.length,
              step_name: stepNameAt(idx),
              vertical: verticalFromPath(),
            },
          })
        );
      } catch (e) {}
      if (window.QuoteIntelligence) {
        window.QuoteIntelligence.saveProgress(form, stepNum, stepNameAt(idx), "wizard_step");
      }
    }

    function runEligibilityGate() {
      if (!window.QuoteIntelligence) return Promise.resolve(true);
      return window.QuoteIntelligence.checkEligibility(form).then(function (res) {
        if (!res.ok || !res.eligibility) return true;
        window.QuoteIntelligence.showEligibilityPanel(form, res.eligibility);
        var panel = form.querySelector("[data-eligibility-panel]");
        if (panel && panel.innerHTML) panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
        if (res.eligibility.blockers && res.eligibility.blockers.length) {
          res.eligibility.blockers.forEach(function (b) {
            window.QuoteIntelligence.saveProgress(form, idx + 1, stepNameAt(idx), "eligibility_block", {
              blockage: b,
            });
          });
        }
        if (window.QuoteIntelligence.isInternalPreview()) {
          return window.QuoteIntelligence.fetchInternalQuote(form).then(function (q) {
            if (q.ok && q.quote) {
              var qp = form.querySelector("[data-internal-quote]");
              window.QuoteIntelligence.showInternalQuote(qp, q.quote);
            }
            return true;
          });
        }
        return true;
      });
    }

    function showStep(i) {
      idx = Math.max(0, Math.min(i, steps.length - 1));
      steps.forEach(function (s, j) {
        s.hidden = j !== idx;
      });
      var pct = ((idx + 1) / steps.length) * 100;
      if (bar) bar.style.width = pct + "%";
      if (stepLabel) stepLabel.textContent = "Etape " + (idx + 1) + " / " + steps.length;

      if (btnPrev) btnPrev.hidden = idx === 0;
      if (btnNext) btnNext.hidden = idx >= steps.length - 1;
      if (btnSubmit) btnSubmit.hidden = idx < steps.length - 1;

      steps.forEach(function (s, j) {
        stepInputs(s).forEach(function (inp) {
          if (j !== idx) {
            inp.setAttribute("tabindex", "-1");
          } else {
            inp.removeAttribute("tabindex");
          }
        });
      });

      emitStepEvent();
    }

    showStep(0);
    if (window.QuoteIntelligence) window.QuoteIntelligence.bindAbandon(form);

    if (btnNext) {
      btnNext.addEventListener("click", function () {
        if (!validateStep(steps[idx])) return;
        var nextIdx = idx + 1;
        var gate =
          stepNameAt(idx) === "conducteur" || stepNameAt(idx) === "3" || steps[idx].querySelector('[name="driverDob"]');
        if (gate) {
          runEligibilityGate().then(function () {
            showStep(nextIdx);
          });
          return;
        }
        if (stepNameAt(idx) === "portefeuille" && window.QuoteIntelligence) {
          window.QuoteIntelligence.fetchCrossSell(form).then(function (res) {
            if (res.ok && res.crossSell) {
              window.QuoteIntelligence.showCrossSellPanel(form, res.crossSell);
            }
            showStep(nextIdx);
          });
          return;
        }
        showStep(nextIdx);
      });
    }
    if (btnPrev) {
      btnPrev.addEventListener("click", function () {
        showStep(idx - 1);
      });
    }

    form.addEventListener(
      "submit",
      function (e) {
        if (!validateStep(steps[steps.length - 1])) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      },
      true
    );
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("form[data-quote-wizard]").forEach(initForm);
  });
})();
