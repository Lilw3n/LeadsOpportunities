(function () {
  function canUseGtag() {
    return typeof window.gtag === "function" && window.GOOGLE_TRACKING;
  }

  function sendGoogleEvent(name, payload) {
    if (!canUseGtag()) return;
    var cfg = window.GOOGLE_TRACKING || {};

    if (name === "wizard_step") {
      if (!cfg.ga4MeasurementId || cfg.ga4MeasurementId.indexOf("XXXX") !== -1) return;
      window.gtag("event", "wizard_step", {
        send_to: cfg.ga4MeasurementId,
        step_number: payload.step_number,
        step_total: payload.step_total,
        vertical: (payload.vertical || "").toString(),
      });
      return;
    }

    if (name === "form_submit" || name === "generate_lead") {
      return;
    }

    if (name === "qualified_lead") {
      var qScore = payload.lead_score != null ? Number(payload.lead_score) : 1;
      if (cfg.ga4MeasurementId && cfg.ga4MeasurementId.indexOf("XXXX") === -1) {
        window.gtag("event", "qualified_lead", {
          send_to: cfg.ga4MeasurementId,
          value: qScore,
          currency: "EUR",
          vertical: (payload.vertical || "").toString(),
        });
      }
      if (
        cfg.adsQualifiedLeadConversionId &&
        cfg.adsQualifiedLeadConversionId.indexOf("XXXX") === -1 &&
        qScore >= 50
      ) {
        window.gtag("event", "conversion", {
          send_to: cfg.adsQualifiedLeadConversionId,
          value: qScore,
          currency: "EUR",
        });
      }
      return;
    }

    var vertical = (payload && payload.vertical) || getVerticalFromPath();

    window.gtag("event", name, {
      send_to: cfg.ga4MeasurementId,
      event_category: "lead_generation",
      event_label: vertical,
      value: 1,
      vertical: vertical,
      variant: (payload && payload.variant) || "",
    });

    if (name === "phone_click" && cfg.adsPhoneConversionId) {
      window.gtag("event", "conversion", {
        send_to: cfg.adsPhoneConversionId,
        value: 1,
        currency: "EUR",
      });
    }

    if (name === "whatsapp_click" && cfg.adsWhatsappConversionId) {
      window.gtag("event", "conversion", {
        send_to: cfg.adsWhatsappConversionId,
        value: 1,
        currency: "EUR",
      });
    }
  }

  function sendSocialEvent(name, payload) {
    var cfg = window.SOCIAL_TRACKING || {};
    var vertical = (payload && payload.vertical) || getVerticalFromPath();
    var value = payload && payload.lead_score != null ? Number(payload.lead_score) : 1;

    if (cfg.metaPixelId && typeof window.fbq === "function") {
      if (name === "qualified_lead") {
        return;
      } else if (name === "phone_click" || name === "whatsapp_click") {
        window.fbq("trackCustom", name, { content_name: vertical });
      }
    }

    if (cfg.tiktokPixelId && window.ttq && typeof window.ttq.track === "function") {
      if (name === "form_submit" || name === "qualified_lead") {
        window.ttq.track("SubmitForm", { content_name: vertical, value: value, currency: "EUR" });
      }
    }

    if (cfg.pinterestTagId && window.pintrk && typeof window.pintrk === "function") {
      if (name === "form_submit" || name === "qualified_lead") {
        window.pintrk("track", "lead", { lead_type: vertical, value: value });
      }
    }
  }

  function getVerticalFromForm() {
    var form = document.querySelector("form[data-track-form]");
    if (!form) return "";
    var hidden = form.querySelector('[name="need"]');
    if (hidden && hidden.value) return String(hidden.value);
    if (form.dataset.vertical) return form.dataset.vertical;
    return "";
  }

  function getVerticalFromPath() {
    var fromForm = getVerticalFromForm();
    if (fromForm) return fromForm;

    var params = new URLSearchParams(window.location.search);
    var need = params.get("need");
    if (need && window.SERVICE_CATALOG && window.SERVICE_CATALOG.getService) {
      var svc = window.SERVICE_CATALOG.getService(need);
      if (svc && svc.vertical) return svc.vertical;
      if (svc && svc.need) return svc.need;
    }
    if (need) return need;

    var path = window.location.pathname;
    if (path.indexOf("vtc") !== -1) return "vtc";
    if (path.indexOf("sante") !== -1) return "sante";
    if (path.indexOf("credit-immo") !== -1) return "credit_immo";
    if (path.indexOf("acheteur-immo") !== -1) return "acheteur_immo";
    if (path.indexOf("animaux") !== -1) return "animaux";
    if (path.indexOf("devis") !== -1) return need || "devis";
    return "unknown";
  }

  function getUtmPayload() {
    var params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_content: params.get("utm_content") || "",
      gclid: params.get("gclid") || "",
    };
  }

  function getAttributionMerge() {
    if (typeof window.getAttributionPayload === "function") {
      return window.getAttributionPayload();
    }
    return {};
  }

  function getParcoursPayload() {
    try {
      if (window.Parcours && typeof window.Parcours.getActive === "function") {
        var p = window.Parcours.getActive();
        if (p && p.id) {
          return {
            parcours_id: p.id,
            parcours_label: p.label || p.id,
            parcours_type: p.type || "public",
            parcours_workflow: p.crmWorkflow || [],
          };
        }
      }
    } catch (e) {}
    return {};
  }

  function collectFormData(form) {
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
    /* Checkboxes non cochées absentes — ok. buyerNeeds toujours en tableau si multi. */
    if (typeof o.buyerNeeds === "string") o.buyerNeeds = [o.buyerNeeds];
    return o;
  }

  function postLeadApi(body) {
    return fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then(function (r) {
        return r.json().catch(function () {
          return { ok: false, error: "invalid_json" };
        }).then(function (data) {
          if (!r.ok) {
            return Object.assign({ ok: false, httpStatus: r.status }, data || {});
          }
          return data;
        });
      })
      .catch(function () {
        return { ok: false, error: "network" };
      });
  }

  function getNeedFromPayload(leadPayload) {
    return (
      (leadPayload && (leadPayload.need || leadPayload.serviceNeed || leadPayload.vertical)) ||
      getVerticalFromForm() ||
      getVerticalFromPath() ||
      "default"
    );
  }

  function renderDocumentsCta(container, leadPayload, result) {
    if (!container) return;
    var email = (leadPayload && leadPayload.email ? String(leadPayload.email) : "").trim();
    var contactId = (result && result.contactId) || null;
    var leadId = (result && result.leadId) || null;
    var need = getNeedFromPayload(leadPayload);
    var href =
      "/external/upload-document.html?public=1&need=" +
      encodeURIComponent(need) +
      (email ? "&email=" + encodeURIComponent(email) : "") +
      (contactId ? "&contactId=" + encodeURIComponent(contactId) : "");

    var panel = document.getElementById("docsUploadPanel");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "docsUploadPanel";
      panel.className = "devis-docs-panel";
      panel.innerHTML =
        "<h3>Vos pièces justificatives</h3>" +
        '<p class="small">Complétez votre dossier pour accélérer le devis. Les fichiers sont archivés sur Drive courtier.</p>' +
        '<div data-devis-documents-root data-docs-visual-panel>' +
        '<div class="devis-docs-drop" data-docs-drop><strong>Ajouter un document</strong><p>PDF, JPG, PNG — max 12 Mo</p>' +
        '<input type="file" data-docs-input accept=".pdf,.jpg,.jpeg,.png" hidden /></div>' +
        '<label style="display:block;margin:10px 0 4px;font-weight:600;font-size:.85rem">Type</label>' +
        '<select data-docs-type data-optional></select>' +
        '<div data-docs-queue class="devis-docs-queue"></div>' +
        '<div data-docs-visual-grid class="devis-docs-grid"></div>' +
        "</div>" +
        '<p style="margin-top:10px"><a href="' +
        href +
        '">Page dépôt complète →</a></p>';
      container.insertAdjacentElement("afterend", panel);
      panel.hidden = false;

      if (window.DevisDocumentUpload && window.DEVIS_DOCUMENT_CONFIG) {
        var cfg = window.DEVIS_DOCUMENT_CONFIG.getConfig(need);
        var sel = panel.querySelector("[data-docs-type]");
        if (sel && cfg.items) {
          sel.innerHTML = cfg.items
            .map(function (it) {
              return '<option value="' + it.type + '">' + it.label + "</option>";
            })
            .join("");
        }
        var uploader = new window.DevisDocumentUpload.DevisDocumentUpload(
          panel.querySelector("[data-devis-documents-root]"),
          { need: need }
        );
        uploader.setSession({ email: email, contactId: contactId, leadId: leadId });
        panel._uploader = uploader;
        uploader.fetchRemoteList();
      }
    } else {
      if (panel._uploader) {
        panel._uploader.setSession({ email: email, contactId: contactId, leadId: leadId });
        panel._uploader.fetchRemoteList();
      }
    }
  }

  function uploadWizardDocuments(form, leadPayload, result) {
    var uploader = form && form._devisDocumentUpload;
    if (!uploader) return Promise.resolve();
    var email = (leadPayload && leadPayload.email) || "";
    uploader.setSession({
      email: email,
      contactId: (result && result.contactId) || null,
      leadId: (result && result.leadId) || null,
    });
    return uploader.uploadQueued().then(function (up) {
      var panel = document.getElementById("docsUploadPanel");
      if (panel && panel._uploader) {
        panel._uploader.uploaded = uploader.uploaded;
        panel._uploader.renderVisualPanel(panel.querySelector("[data-docs-visual-grid]"));
      }
      return up;
    });
  }

  function trackEvent(name, payload) {
    var data = {
      event: name,
      ts: new Date().toISOString(),
      page: window.location.pathname,
      payload: Object.assign(
        {
          vertical: getVerticalFromPath(),
        },
        getUtmPayload(),
        getAttributionMerge(),
        payload || {}
      ),
    };

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(data);
    sendGoogleEvent(name, data.payload);
    sendSocialEvent(name, data.payload);
    console.log("[tracking]", data);
  }

  function getVariant() {
    var params = new URLSearchParams(window.location.search);
    var v = params.get("variant");
    if (v === "price" || v === "speed") return v;
    return "speed";
  }

  function applyVariant() {
    var variant = getVariant();
    var hero = document.querySelector("[data-hero-title]");
    var subtitle = document.querySelector("[data-hero-subtitle]");

    if (!hero || !subtitle) return variant;

    if (document.body.classList.contains("parcours-focus")) {
      return variant;
    }

    if (variant === "price") {
      hero.textContent = hero.getAttribute("data-price-title");
      subtitle.textContent = subtitle.getAttribute("data-price-subtitle");
    } else {
      hero.textContent = hero.getAttribute("data-speed-title");
      subtitle.textContent = subtitle.getAttribute("data-speed-subtitle");
    }

    trackEvent("ab_variant_seen", { variant: variant });
    return variant;
  }

  function bindTracking() {
    var variant = applyVariant();
    var ctas = document.querySelectorAll("[data-track='cta_click']");
    var phoneLinks = document.querySelectorAll("[data-track='phone_click']");
    var whatsappLinks = document.querySelectorAll("[data-track='whatsapp_click']");
    var form = document.querySelector("form[data-track-form]");

    document.addEventListener("lo:wizard_step", function (ev) {
      var d = ev.detail || {};
      trackEvent("wizard_step", d);
    });

    ctas.forEach(function (btn) {
      btn.addEventListener("click", function () {
        trackEvent("cta_click", { variant: variant, label: btn.textContent.trim() });
      });
    });

    phoneLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        trackEvent("phone_click", { variant: variant });
      });
    });

    whatsappLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        trackEvent("whatsapp_click", { variant: variant });
      });
    });

    if (form) {
      var firstInput = form.querySelector("input,select,textarea");
      if (firstInput) {
        firstInput.addEventListener("focus", function onFirstFocus() {
          trackEvent("form_start", { variant: variant });
          firstInput.removeEventListener("focus", onFirstFocus);
        });
      }

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        trackEvent("form_submit", { variant: variant });
        var data = collectFormData(form);
        var needVal = (data.need || getVerticalFromForm() || getVerticalFromPath() || "").toString();
        var leadPayload = Object.assign(
          {
            source: data.source || (window.QuoteIntelligence && window.QuoteIntelligence.getJourney() === "quick" ? "landing_quick" : "landing_form"),
            vertical: needVal,
            serviceNeed: needVal,
            serviceLabel: data.serviceLabel || "",
            serviceCategory: data.serviceCategory || "",
            page: window.location.pathname,
            variant: variant,
            journey: window.QuoteIntelligence ? window.QuoteIntelligence.getJourney() : "full",
            questionnaire_step: data.questionnaire_step || (form.querySelectorAll(".wizard-step").length || 1),
            questionnaire_total: data.questionnaire_total || (form.querySelectorAll(".wizard-step").length || 1),
          },
          getUtmPayload(),
          getParcoursPayload(),
          getAttributionMerge(),
          data
        );
        if (window.QuoteIntelligence) {
          window.QuoteIntelligence.attachLeadIdToPayload(leadPayload);
        }
        leadPayload.client_event_id = leadPayload.leadId || null;
        if (typeof window.saveLeadRequest === "function") {
          window.saveLeadRequest(leadPayload);
        }
        var msgOk = document.querySelector("[data-form-success]");
        var msgErr = document.querySelector("[data-form-error]");
        if (msgOk) msgOk.hidden = true;
        if (msgErr) msgErr.hidden = true;

        postLeadApi(leadPayload).then(function (result) {
          if (result && result.ok && window.loTrackingCorrelation && window.loTrackingCorrelation.fireConversion) {
            window.loTrackingCorrelation.fireConversion(result, leadPayload);
          }
          window.dispatchEvent(
            new CustomEvent("lo:lead-sent", {
              detail: { payload: leadPayload, result: result || {} },
            })
          );

          if (result && result.error === "geo_out_of_scope") {
            if (msgErr) {
              msgErr.textContent =
                result.message ||
                "Ce service est reserve aux residents en France (assurance et credit immo).";
              msgErr.hidden = false;
            } else if (msgOk) {
              msgOk.textContent = result.message || "Service reserve a la France.";
              msgOk.hidden = false;
            }
          } else if (result && result.ok) {
            uploadWizardDocuments(form, leadPayload, result).finally(function () {
              if (msgOk) {
                if (result.emailSent === false && result.stored === false) {
                  msgOk.textContent =
                    "Merci, votre demande est enregistree. Un conseiller vous contacte rapidement. (Notification e-mail en cours de configuration cote serveur.)";
                }
                msgOk.hidden = false;
                renderDocumentsCta(msgOk, leadPayload, result);
              }
              form.reset();
            });
          } else if (msgErr) {
            msgErr.hidden = false;
          } else if (msgOk) {
            msgOk.textContent =
              "Envoi impossible pour le moment. Reessayez ou renvoyez le formulaire.";
            msgOk.hidden = false;
          }
        });
      });
    }
  }

  document.addEventListener("DOMContentLoaded", bindTracking);
})();
