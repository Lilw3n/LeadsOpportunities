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

  function stepSkipped(step) {
    return step && step.getAttribute("data-wizard-skip") === "1";
  }

  function adjacentVisibleStep(steps, from, delta) {
    var i = from + delta;
    while (i >= 0 && i < steps.length && stepSkipped(steps[i])) {
      i += delta;
    }
    return Math.max(0, Math.min(i, steps.length - 1));
  }

  function validateStep(step) {
    if (stepSkipped(step)) return true;
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
      if ((el.name === "phone" || el.type === "tel") && el.value) {
        var digits = el.value.replace(/\D/g, "");
        if (digits.length < 10) {
          ok = false;
          el.classList.add("input-invalid");
        }
      }
      if (
        (el.name === "postalCode" || el.name === "postalProject") &&
        el.value &&
        !/^[0-9]{5}$/.test(el.value.trim())
      ) {
        ok = false;
        el.classList.add("input-invalid");
      }
      if (
        el.name === "companySiret" ||
        el.name === "collectiveSiret" ||
        el.name === "siret"
      ) {
        var siretDigits = (el.value || "").replace(/\s/g, "");
        if (siretDigits && !/^[0-9]{9}$/.test(siretDigits) && !/^[0-9]{14}$/.test(siretDigits)) {
          ok = false;
          el.classList.add("input-invalid");
        }
      }
      if (
        el.name === "autoPlate" ||
        el.name === "vtcVehiclePlate" ||
        el.name === "vehiclePlate" ||
        el.name === "motoPlate" ||
        el.name === "tempVehiclePlate" ||
        el.name === "fleetMainPlate" ||
        el.name === "rvPlate"
      ) {
        var plateCompact = (el.value || "").replace(/[\s-]/g, "");
        if (plateCompact && plateCompact.length < 4) {
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

  function auditSkip(form) {
    return window.FormAudit && window.FormAudit.skipValidation(form);
  }

  var BENEFIT_BY_VERTICAL = {
    sante: [
      "Telephone + e-mail suffisent pour un rappel gratuit — le reste affine le devis.",
      "Bonne nouvelle : on peut deja vous rappeler avec ce que vous avez saisi.",
      "Optique / dentaire / hopital : 1 minute de plus = devis vraiment utile.",
      "Presque la : votre profil sante aide a eviter une mutuelle trop chere.",
      "Etape facultative — vous pouvez passer si vous etes presse(e).",
      "Adresse complete facultative : prenom + nom suffisent pour le rappel.",
      "Derniere etape : envoyez pour recevoir votre comparatif personnalise.",
    ],
    credit_immo: [
      "Telephone + e-mail = un courtier peut deja vous rappeler.",
      "Votre projet est note : continuez ou demandez un rappel immediat.",
      "Apport et duree : 30 secondes pour une simulation plus juste.",
      "Revenus : confidentiel, utilise seulement pour le dossier banque.",
      "Charges actuelles : pour calculer votre vraie capacite d'emprunt.",
      "Co-emprunteur : passez si vous empruntez seul(e).",
      "Adresse facultative — prenom, nom et date de naissance suffisent.",
      "Envoyez : un courtier analyse et vous rappelle sous peu.",
    ],
    vtc: [
      "Telephone + e-mail : un conseiller VTC peut deja vous rappeler.",
      "Vehicule : marque + modele suffisent pour un premier devis.",
      "Activite : SIRET et plateforme aident a coller aux exigences Uber/Bolt.",
      "Permis / carte VTC : pour verifier la conformite rapidement.",
      "Antecedents : soyez honnete, ca evite un refus assureur plus tard.",
      "Adresse facultative — prenom + nom suffisent pour le rappel.",
      "Choisissez une couverture et envoyez : devis sans engagement.",
    ],
    acheteur_immo: [
      "Telephone + e-mail : on peut deja vous alerter sur les bons biens.",
      "Budget et zone : le minimum pour matcher des annonces.",
      "Plus vous precisez, plus les alertes sont pertinentes.",
      "Vous pouvez envoyer un rappel maintenant si vous etes presse(e).",
      "Continuez ou demandez un rappel — aucun engagement.",
      "Adresse facultative pour le rappel conseiller.",
      "Derniere etape : validez pour activer le suivi.",
    ],
    default: [
      "Telephone + e-mail suffisent pour un rappel gratuit.",
      "Vous pouvez continuer ou demander un rappel immediat.",
      "Chaque etape affine le devis — aucune n'engage.",
      "Presque termine : un conseiller finalise avec vous.",
      "Envoyez quand vous voulez : gratuit et sans engagement.",
    ],
  };

  function benefitText(vertical, stepIndex) {
    var list = BENEFIT_BY_VERTICAL[vertical] || BENEFIT_BY_VERTICAL.default;
    return list[Math.min(stepIndex, list.length - 1)] || BENEFIT_BY_VERTICAL.default[0];
  }

  function ensureContactFilled(form) {
    var phone = form.querySelector('[name="phone"]');
    var email = form.querySelector('[name="email"]');
    var ok = true;
    [phone, email].forEach(function (el) {
      if (!el) return;
      el.classList.remove("input-invalid");
      var v = (el.value || "").trim();
      if (!v) {
        ok = false;
        el.classList.add("input-invalid");
        return;
      }
      if (el.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        ok = false;
        el.classList.add("input-invalid");
      }
      if ((el.name === "phone" || el.type === "tel") && el.value.replace(/\D/g, "").length < 10) {
        ok = false;
        el.classList.add("input-invalid");
      }
    });
    return ok && !!(phone && email);
  }

  function relaxForEarlyFinish(form) {
    qsa(form, "input, select, textarea").forEach(function (el) {
      if (!el.name) return;
      if (el.name === "phone" || el.name === "email" || el.name === "rgpd") return;
      if (el.hasAttribute("required")) {
        el.removeAttribute("required");
        el.setAttribute("data-was-required", "1");
        el.setAttribute("data-optional", "");
      }
      if (el.getAttribute("aria-required") === "true" && el.name !== "rgpd") {
        el.setAttribute("aria-required", "false");
      }
    });
    var mode = form.querySelector('[name="journey_mode"]');
    if (!mode) {
      mode = document.createElement("input");
      mode.type = "hidden";
      mode.name = "journey_mode";
      form.appendChild(mode);
    }
    mode.value = "early_callback";
    var cb = form.querySelector('[name="callbackTime"]');
    if (cb && !(cb.value || "").trim()) {
      var opt = Array.prototype.find.call(cb.options || [], function (o) {
        return /peu importe/i.test(o.textContent || "");
      });
      if (opt) cb.value = opt.value || opt.textContent;
      else if (cb.options && cb.options.length) cb.selectedIndex = Math.min(1, cb.options.length - 1);
    }
    var rgpd = form.querySelector('[name="rgpd"]');
    if (rgpd && !rgdChecked(rgpd)) {
      /* leave for user — submit handler will surface it */
    }
  }

  function rgdChecked(el) {
    return !!(el && el.checked);
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
    var earlyFinish = false;

    bindCompanyToggle(form);

    function verticalFromPath() {
      var hidden = form.querySelector('[name="need"]');
      if (hidden && hidden.value) return hidden.value;
      if (form.dataset.vertical) return form.dataset.vertical;
      var path = window.location.pathname;
      if (path.indexOf("vtc") !== -1) return "vtc";
      if (path.indexOf("sante") !== -1) return "sante";
      if (path.indexOf("projection-achat") !== -1) return "credit_immo";
      if (path.indexOf("credit-immo") !== -1) return "credit_immo";
      if (path.indexOf("acheteur-immo") !== -1) return "acheteur_immo";
      if (path.indexOf("animaux") !== -1) return "animaux";
      return "unknown";
    }

    var benefitEl = qs(form, ".wizard-benefit-nudge");
    if (!benefitEl) {
      benefitEl = document.createElement("p");
      benefitEl.className = "wizard-benefit-nudge";
      benefitEl.setAttribute("role", "status");
      var head = qs(form, ".wizard-head");
      if (head && head.parentNode) head.parentNode.insertBefore(benefitEl, head.nextSibling);
      else form.insertBefore(benefitEl, form.firstChild);
    }

    var actions = qs(form, ".wizard-actions");
    var btnEarly = qs(form, ".wizard-early-finish");
    if (!btnEarly && actions) {
      btnEarly = document.createElement("button");
      btnEarly.type = "button";
      btnEarly.className = "btn btn-soft wizard-early-finish";
      btnEarly.textContent = "Etre rappele maintenant";
      btnEarly.title = "Envoyer telephone + e-mail sans finir toutes les etapes";
      btnEarly.hidden = true;
      if (btnNext && btnNext.parentNode === actions) {
        actions.insertBefore(btnEarly, btnNext);
      } else {
        actions.appendChild(btnEarly);
      }
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

    function stepFriendlyTitle(stepEl) {
      if (!stepEl) return "";
      return (
        stepEl.getAttribute("data-step-title") ||
        (stepEl.querySelector("h3") && stepEl.querySelector("h3").textContent) ||
        ""
      ).trim();
    }

    function updateStepChrome() {
      var current = steps[idx];
      var title = stepFriendlyTitle(current);
      var currentTitle = qs(form, ".wizard-current-title");
      if (currentTitle) {
        currentTitle.textContent =
          "Etape " +
          (idx + 1) +
          " sur " +
          steps.length +
          (title ? " — " + title : "");
      }
      qsa(form, ".wizard-steps-dots [data-wizard-dot]").forEach(function (dot, j) {
        dot.classList.toggle("is-done", j < idx);
        dot.classList.toggle("is-active", j === idx);
        dot.setAttribute("aria-current", j === idx ? "step" : "false");
        dot.disabled = j > idx;
      });
      qsa(form, ".wizard-steps-nav [data-wizard-nav]").forEach(function (item, j) {
        item.classList.toggle("is-done", j < idx);
        item.classList.toggle("is-active", j === idx);
        item.setAttribute("aria-current", j === idx ? "step" : "false");
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
      updateStepChrome();

      if (benefitEl) {
        benefitEl.textContent = benefitText(verticalFromPath(), idx);
        benefitEl.hidden = false;
      }
      if (btnEarly) {
        btnEarly.hidden = earlyFinish || idx < 1 || idx >= steps.length - 1;
      }

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

      var head = qs(form, ".wizard-head");
      if (head) {
        try {
          head.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch (e) {
          head.scrollIntoView(true);
        }
      }
      var firstFocus = steps[idx].querySelector(
        "input:not([type='hidden']):not([disabled]), select:not([disabled]), textarea:not([disabled])"
      );
      if (firstFocus && typeof firstFocus.focus === "function") {
        setTimeout(function () {
          firstFocus.focus({ preventScroll: true });
        }, 120);
      }
    }

    qsa(form, ".wizard-steps-dots [data-wizard-dot]").forEach(function (dot) {
      dot.addEventListener("click", function () {
        var target = parseInt(dot.getAttribute("data-wizard-dot"), 10) - 1;
        if (isNaN(target) || target === idx) return;
        if (target > idx) return;
        showStep(target);
      });
    });

    showStep(0);
    if (window.QuoteIntelligence) {
      window.QuoteIntelligence.bindAbandon(form);
      if (window.QuoteIntelligence.bindContactCapture) window.QuoteIntelligence.bindContactCapture(form);
    }

    form.addEventListener("lo-audit-goto", function (e) {
      if (e.detail && typeof e.detail.index === "number") showStep(e.detail.index);
    });

    var validationHint = qs(form, ".wizard-validation-hint");

    if (btnNext) {
      btnNext.addEventListener("click", function () {
        if (auditSkip(form)) {
          if (validationHint) validationHint.hidden = true;
          showStep(adjacentVisibleStep(steps, idx, 1));
          return;
        }
        if (!validateStep(steps[idx])) {
          if (validationHint) {
            validationHint.hidden = false;
            validationHint.textContent =
              "Il manque une information obligatoire. Remplissez les champs marques en rouge, puis cliquez sur « Etape suivante ».";
            validationHint.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
          return;
        }
        if (validationHint) validationHint.hidden = true;
        var nextIdx = adjacentVisibleStep(steps, idx, 1);
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
        showStep(adjacentVisibleStep(steps, idx, -1));
      });
    }

    if (btnEarly) {
      btnEarly.addEventListener("click", function () {
        if (auditSkip(form)) {
          showStep(steps.length - 1);
          return;
        }
        if (!ensureContactFilled(form)) {
          if (validationHint) {
            validationHint.hidden = false;
            validationHint.textContent =
              "Pour un rappel immediat, renseignez telephone et e-mail (etape 1), puis reessayez.";
            validationHint.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
          showStep(0);
          return;
        }
        earlyFinish = true;
        relaxForEarlyFinish(form);
        try {
          window.dispatchEvent(
            new CustomEvent("lo:wizard_early_finish", {
              detail: { vertical: verticalFromPath(), from_step: idx + 1 },
            })
          );
        } catch (e) {}
        if (window.QuoteIntelligence) {
          window.QuoteIntelligence.saveProgress(form, idx + 1, "early_callback", "wizard_early_finish");
        }
        showStep(steps.length - 1);
        if (validationHint) {
          validationHint.hidden = false;
          validationHint.textContent =
            "Rappel anticipe : cochez l'accord RGPD puis « Envoyer ». Le reste du questionnaire n'est plus obligatoire.";
        }
        if (btnEarly) btnEarly.hidden = true;
        var rgpd = form.querySelector('[name="rgpd"]');
        if (rgpd && typeof rgpd.focus === "function") {
          setTimeout(function () {
            rgpd.focus({ preventScroll: true });
          }, 150);
        }
      });
    }

    form.addEventListener(
      "submit",
      function (e) {
        if (auditSkip(form)) {
          e.preventDefault();
          e.stopImmediatePropagation();
          var msg = form.querySelector("[data-audit-submit-hint]");
          if (!msg) {
            msg = document.createElement("p");
            msg.setAttribute("data-audit-submit-hint", "");
            msg.className = "form-audit-step-panel";
            msg.style.borderColor = "#fca5a5";
            msg.style.background = "#fef2f2";
            msg.style.color = "#991b1b";
            var actionsEl = form.querySelector(".wizard-actions");
            if (actionsEl) actionsEl.parentNode.insertBefore(msg, actionsEl);
          }
          msg.textContent =
            "Mode contrôle actif : désactivez-le dans la barre en haut pour envoyer un vrai lead.";
          msg.scrollIntoView({ behavior: "smooth", block: "nearest" });
          return;
        }
        if (earlyFinish) {
          if (!ensureContactFilled(form)) {
            e.preventDefault();
            e.stopImmediatePropagation();
            showStep(0);
            return;
          }
          var rgpdEl = form.querySelector('[name="rgpd"]');
          if (rgpdEl && !rgpdEl.checked) {
            e.preventDefault();
            e.stopImmediatePropagation();
            rgpdEl.classList.add("input-invalid");
            if (validationHint) {
              validationHint.hidden = false;
              validationHint.textContent = "Cochez l'accord de contact (RGPD) pour envoyer le rappel.";
            }
            return;
          }
          return;
        }
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
