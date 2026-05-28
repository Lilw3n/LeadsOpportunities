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

    if (name === "qualified_lead") {
      if (cfg.ga4MeasurementId && cfg.ga4MeasurementId.indexOf("XXXX") === -1) {
        window.gtag("event", "qualified_lead", {
          send_to: cfg.ga4MeasurementId,
          value: payload.lead_score != null ? Number(payload.lead_score) : 1,
          currency: "EUR",
          vertical: (payload.vertical || "").toString(),
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

    if (name === "form_submit" && cfg.adsLeadConversionId) {
      window.gtag("event", "conversion", {
        send_to: cfg.adsLeadConversionId,
        value: 1,
        currency: "EUR",
      });
    }

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
      if (name === "form_submit" || name === "qualified_lead") {
        window.fbq("track", "Lead", { content_name: vertical, value: value, currency: "EUR" });
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
      o[k] = v;
    });
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

  function renderDocumentsCta(container, leadPayload) {
    if (!container) return;
    var email = (leadPayload && leadPayload.email ? String(leadPayload.email) : "").trim();
    var href = "/external/upload-document.html?public=1";
    if (email) href += "&email=" + encodeURIComponent(email);
    var cta = document.getElementById("docsCtaInline");
    if (!cta) {
      cta = document.createElement("p");
      cta.id = "docsCtaInline";
      cta.style.marginTop = "10px";
      cta.innerHTML =
        'Etape suivante : <a href="' +
        href +
        '" style="font-weight:700;text-decoration:underline">envoyer vos pieces justificatives</a>.';
      container.insertAdjacentElement("afterend", cta);
    } else {
      cta.innerHTML =
        'Etape suivante : <a href="' +
        href +
        '" style="font-weight:700;text-decoration:underline">envoyer vos pieces justificatives</a>.';
    }
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
        if (typeof window.saveLeadRequest === "function") {
          window.saveLeadRequest(leadPayload);
        }
        var msgOk = document.querySelector("[data-form-success]");
        var msgErr = document.querySelector("[data-form-error]");
        if (msgOk) msgOk.hidden = true;
        if (msgErr) msgErr.hidden = true;

        postLeadApi(leadPayload).then(function (result) {
          if (result && result.ok && result.leadScore != null) {
            sendGoogleEvent("qualified_lead", {
              vertical: getVerticalFromPath(),
              lead_score: result.leadScore,
            });
          }
          window.dispatchEvent(
            new CustomEvent("lo:lead-sent", {
              detail: { payload: leadPayload, result: result || {} },
            })
          );

          if (result && result.ok) {
            if (msgOk) {
              if (result.emailSent === false && result.stored === false) {
                msgOk.textContent =
                  "Merci, votre demande est enregistree. Un conseiller vous contacte rapidement. (Notification e-mail en cours de configuration cote serveur.)";
              }
              msgOk.hidden = false;
              renderDocumentsCta(msgOk, leadPayload);
            }
            form.reset();
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
