/**
 * Parcours devis intelligent : progression, éligibilité, devis interne (courtier)
 */
(function () {
  var DRAFT_KEY = "lo_draft_lead_id";
  var JOURNEY_KEY = "lo_form_journey";

  function getDraftLeadId() {
    try {
      return localStorage.getItem(DRAFT_KEY);
    } catch (e) {
      return null;
    }
  }

  function setDraftLeadId(id) {
    try {
      if (id) localStorage.setItem(DRAFT_KEY, id);
    } catch (e) {}
  }

  function getJourney() {
    var params = new URLSearchParams(window.location.search);
    if (params.get("journey") === "quick") return "quick";
    if (params.get("quick") === "1") return "quick";
    try {
      return localStorage.getItem(JOURNEY_KEY) || "full";
    } catch (e) {
      return "full";
    }
  }

  function setJourney(j) {
    try {
      localStorage.setItem(JOURNEY_KEY, j);
    } catch (e) {}
  }

  function collectFormPartial(form) {
    var fd = new FormData(form);
    var o = {};
    fd.forEach(function (v, k) {
      if (Object.prototype.hasOwnProperty.call(o, k)) {
        if (!Array.isArray(o[k])) o[k] = [o[k]];
        o[k].push(v);
      } else {
        o[k] = v;
      }
    });
    ["buyerNeeds", "propertySought", "serviceSought", "ownerRole[]", "ownerFirstName[]", "ownerLastName[]", "ownerBirthName[]", "ownerProfession[]", "ownerMaritalDate[]", "ownerMaritalPlace[]", "ownerMarriageContract[]", "ownerNotary[]", "ownerAddedBy[]", "ownerBirthDate[]", "ownerBirthPlace[]", "ownerNationality[]", "ownerSocialSecurity[]", "ownerNationalId[]", "ownerComments[]", "ownerPhone[]", "ownerEmail[]", "ownerAddress[]", "ownerPostal[]", "ownerCity[]", "roomLevel[]", "roomName[]", "roomSurface[]", "roomDimensions[]", "roomFlooring[]", "roomExposure[]", "sellEquip[]", "sellCommit[]", "sellFurniture[]", "sellDoc[]", "coproWorkNature[]", "coproWorkStatus[]", "coproWorkAmount[]", "coproWorkDate[]", "coproWorkShare[]", "coproWorkNote[]"].forEach(function (key) {
      if (typeof o[key] === "string") o[key] = [o[key]];
    });
    return o;
  }

  function verticalFromForm(form) {
    var hidden = form.querySelector('[name="need"]');
    if (hidden && hidden.value) return hidden.value;
    if (form.dataset.vertical) return form.dataset.vertical;
    var path = window.location.pathname;
    if (path.indexOf("vtc") !== -1) return "vtc";
    if (path.indexOf("sante") !== -1) return "sante";
    if (path.indexOf("credit-immo") !== -1) return "credit-immo";
    if (path.indexOf("acheteur-immo") !== -1) return "acheteur-immo";
    if (path.indexOf("devis-rapide") !== -1) return "vtc";
    if (path.indexOf("animaux") !== -1) return "animaux";
    return "unknown";
  }

  function postJson(url, body) {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(function (r) {
      return r.json().catch(function () {
        return { ok: false };
      });
    });
  }

  function saveProgress(form, step, stepName, eventName, extra) {
    extra = extra || {};
    var partial = collectFormPartial(form);
    var vertical = verticalFromForm(form);
    var journey = getJourney();
    var payload = {
      leadId: getDraftLeadId(),
      event: eventName || "wizard_step",
      step: step,
      step_total: form.querySelectorAll(".wizard-step").length || 1,
      step_name: stepName,
      journey: journey,
      vertical: vertical,
      form_id: form.id || form.getAttribute("name") || "wizard",
      source: journey === "quick" ? "landing_quick" : "landing_wizard",
      partial_payload: partial,
      email: partial.email || null,
      phone: partial.phone || null,
      blockage: extra.blockage || null,
      meta: extra.meta || {},
    };
    return postJson("/api/lead-progress", payload).then(function (res) {
      if (res.ok && res.leadId) setDraftLeadId(res.leadId);
      return res;
    });
  }

  function checkEligibility(form) {
    var data = collectFormPartial(form);
    data.vertical = verticalFromForm(form);
    data.journey = getJourney();
    return postJson("/api/eligibility-check", data);
  }

  function fetchInternalQuote(form) {
    var data = collectFormPartial(form);
    data.vertical = verticalFromForm(form);
    data.journey = getJourney();
    return postJson("/api/tariff-quote", data);
  }

  function fetchCrossSell(form) {
    var data = collectFormPartial(form);
    data.vertical = verticalFromForm(form);
    data.primaryProduct = data.vertical;
    data.journey = getJourney();
    return postJson("/api/cross-sell", data);
  }

  function showCrossSellPanel(form, crossSell) {
    var panel = form.querySelector("[data-cross-sell-panel]");
    if (!panel || !crossSell) return;
    if (!isInternalPreview()) {
      panel.hidden = true;
      return;
    }
    var html =
      '<div class="qi-quote-internal qi-cross-sell"><p class="qi-quote-tag">Opportunités multi-contrats (interne)</p>';
    html += "<p><strong>" + (crossSell.summary || "") + "</strong></p>";
    if (crossSell.topQuestions && crossSell.topQuestions.length) {
      html += "<p><strong>Questions à poser :</strong></p><ul>";
      crossSell.topQuestions.forEach(function (q) {
        html += "<li>" + q + "</li>";
      });
      html += "</ul>";
    }
    if (crossSell.opportunities && crossSell.opportunities.length) {
      html += '<table class="qi-cross-table"><thead><tr><th>Produit</th><th>Priorité</th><th>Info</th></tr></thead><tbody>';
      crossSell.opportunities.slice(0, 5).forEach(function (o) {
        html +=
          "<tr><td>" +
          o.label +
          "</td><td>" +
          o.priority +
          "</td><td>" +
          (o.savingsHint || o.reason) +
          "</td></tr>";
      });
      html += "</tbody></table>";
    }
    html += "</div>";
    panel.innerHTML = html;
    panel.hidden = false;
  }

  function showEligibilityPanel(form, eligibility) {
    var panel = form.querySelector("[data-eligibility-panel]");
    if (!panel || !eligibility) return;
    var html = "";
    if (eligibility.blockers && eligibility.blockers.length) {
      html +=
        '<div class="qi-alert qi-alert-block"><strong>Point de blocage</strong><ul>' +
        eligibility.blockers
          .map(function (b) {
            return "<li>" + b.message + "</li>";
          })
          .join("") +
        "</ul></div>";
    }
    if (eligibility.warnings && eligibility.warnings.length) {
      html +=
        '<div class="qi-alert qi-alert-warn"><strong>À valider</strong><ul>' +
        eligibility.warnings
          .map(function (w) {
            return "<li>" + w.message + "</li>";
          })
          .join("") +
        "</ul></div>";
    }
    if (eligibility.insurerSummary) {
      html += '<p class="qi-summary">' + eligibility.insurerSummary + "</p>";
    }
    panel.innerHTML = html;
    panel.hidden = !html;
  }

  function showInternalQuote(panel, quote) {
    if (!panel || !quote) return;
    var html =
      '<div class="qi-quote-internal"><p class="qi-quote-tag">Analyse en cours</p>' +
      "<p><strong>Devis / simulation gratuite</strong></p>" +
      "<p>Un conseiller vous recontacte avec une proposition personnalisee — sans engagement.</p>";
    if (quote.note) {
      html += "<small>" + quote.note + "</small>";
    }
    html += "</div>";
    panel.innerHTML = html;
    panel.hidden = false;
  }

  function bindAbandon(form) {
    var sent = false;
    function onLeave() {
      if (sent) return;
      if (form.dataset.submitted === "1") return;
      sent = true;
      var step = parseInt(form.dataset.currentStep || "0", 10);
      var stepName = form.dataset.currentStepName || "";
      var body = {
        leadId: getDraftLeadId(),
        event: "wizard_abandon",
        step: step,
        step_name: stepName,
        journey: getJourney(),
        vertical: verticalFromForm(form),
        abandoned: true,
      };
      try {
        navigator.sendBeacon("/api/lead-progress", new Blob([JSON.stringify(body)], { type: "application/json" }));
      } catch (e) {
        postJson("/api/lead-progress", body);
      }
    }
    window.addEventListener("pagehide", onLeave);
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") onLeave();
    });
  }

  function isInternalPreview() {
    return (
      new URLSearchParams(window.location.search).get("preview") === "1" ||
      (function () {
        try {
          var u = JSON.parse(localStorage.getItem("lo_user") || "{}");
          return u.role === "admin";
        } catch (e) {
          return false;
        }
      })()
    );
  }

  var SKIP_AUTOSAVE_KEYS = {
    _hp: 1,
    website: 1,
    company_url: 1,
    need: 1,
    role: 1,
    csrf: 1,
    _csrf: 1,
  };

  function formHasMeaningfulInput(form) {
    if (!form) return false;
    var els = form.querySelectorAll("input, select, textarea");
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var name = el.name || "";
      if (!name || SKIP_AUTOSAVE_KEYS[name]) continue;
      if (el.type === "file" || el.type === "hidden" || el.type === "submit" || el.type === "button") continue;
      if (el.type === "checkbox" || el.type === "radio") {
        if (el.checked !== el.defaultChecked) return true;
        continue;
      }
      if (el.tagName === "SELECT") {
        var defOpt = null;
        for (var j = 0; j < el.options.length; j++) {
          if (el.options[j].defaultSelected) {
            defOpt = el.options[j];
            break;
          }
        }
        var defVal = defOpt ? defOpt.value : el.options.length ? el.options[0].value : "";
        if (String(el.value || "") !== String(defVal || "")) return true;
        continue;
      }
      var cur = String(el.value == null ? "" : el.value).trim();
      var def = String(el.defaultValue == null ? "" : el.defaultValue).trim();
      if (cur && cur !== def) return true;
    }
    return false;
  }

  function bindContactCapture(form) {
    if (!form || form._contactCaptureBound) return;
    form._contactCaptureBound = true;
    var timer = null;
    function maybeSave(reason) {
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (!formHasMeaningfulInput(form) && !getDraftLeadId()) return;
        saveProgress(
          form,
          parseInt(form.dataset.currentStep || "1", 10),
          reason || "autosave_partial",
          reason || "field_change"
        );
      }, 350);
    }
    function flushBeacon() {
      if (!formHasMeaningfulInput(form) && !getDraftLeadId()) return;
      var partial = collectFormPartial(form);
      var body = {
        leadId: getDraftLeadId(),
        event: "autosave_unload",
        step: parseInt(form.dataset.currentStep || "1", 10),
        step_total: form.querySelectorAll(".wizard-step").length || 1,
        step_name: "autosave_unload",
        journey: getJourney(),
        vertical: verticalFromForm(form),
        form_id: form.id || form.getAttribute("name") || "wizard",
        source: "landing_autosave_unload",
        partial_payload: partial,
        email: partial.email || null,
        phone: partial.phone || null,
      };
      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon(
            "/api/lead-progress",
            new Blob([JSON.stringify(body)], { type: "application/json" })
          );
        } else {
          postJson("/api/lead-progress", body);
        }
      } catch (e) {}
    }
    form.addEventListener(
      "blur",
      function (e) {
        if (!e.target || !e.target.name) return;
        maybeSave("field_blur");
      },
      true
    );
    form.addEventListener("change", function () {
      maybeSave("field_change");
    });
    form.addEventListener("input", function () {
      maybeSave("field_input");
    });
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") flushBeacon();
    });
    window.addEventListener("pagehide", flushBeacon);
  }

  function bindContactCaptureAll() {
    document.querySelectorAll("form").forEach(function (form) {
      if (
        form.querySelector('[name="email"], [name="phone"]') ||
        form.hasAttribute("data-quote-wizard") ||
        form.hasAttribute("data-acheteur-immo") ||
        form.hasAttribute("data-track-form")
      ) {
        bindContactCapture(form);
      }
    });
  }

  window.QuoteIntelligence = {
    getDraftLeadId: getDraftLeadId,
    setDraftLeadId: setDraftLeadId,
    getJourney: getJourney,
    setJourney: setJourney,
    saveProgress: saveProgress,
    checkEligibility: checkEligibility,
    fetchInternalQuote: fetchInternalQuote,
    fetchCrossSell: fetchCrossSell,
    showEligibilityPanel: showEligibilityPanel,
    showInternalQuote: showInternalQuote,
    showCrossSellPanel: showCrossSellPanel,
    bindAbandon: bindAbandon,
    bindContactCapture: bindContactCapture,
    isInternalPreview: isInternalPreview,
    attachLeadIdToPayload: function (payload) {
      var id = getDraftLeadId();
      if (id) payload.leadId = id;
      payload.journey = getJourney();
      return payload;
    },
  };

  document.addEventListener("lo:lead-sent", function () {
    var forms = document.querySelectorAll("form[data-quote-wizard], form[data-quick-devis]");
    forms.forEach(function (f) {
      f.dataset.submitted = "1";
    });
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindContactCaptureAll);
  } else {
    bindContactCaptureAll();
  }

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(bindContactCaptureAll, 200);
  });
})();
