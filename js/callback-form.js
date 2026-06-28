/**
 * Formulaire rappel express : email + téléphone → POST /api/lead (notification Resend).
 * Réconforte les utilisateurs qui n'aiment pas remplir les longs formulaires.
 */
(function (global) {
  var COPY = {
    title: "Pas envie de remplir tout le formulaire ?",
    lead:
      "Laissez simplement votre e-mail et votre numéro : un conseiller vous rappelle sous 15 minutes (lun–ven, 9h–18h). Gratuit, sans engagement.",
    submit: "Me rappeler",
    success:
      "C'est noté ! Un conseiller vous rappelle très vite. Vous recevrez aussi une notification par e-mail côté équipe.",
    error: "Envoi impossible pour le moment. Réessayez dans quelques instants.",
    stripTitle: "Formulaire trop long ? On vous rappelle.",
    stripLead:
      "Deux champs suffisent (e-mail + téléphone) : un humain reprend votre dossier à votre place.",
  };

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getUtmParams() {
    var params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_content: params.get("utm_content") || "",
      gclid: params.get("gclid") || "",
    };
  }

  function getAttr() {
    if (typeof global.getAttributionPayload === "function") {
      return global.getAttributionPayload();
    }
    return {};
  }

  function getNeedFromUrl() {
    return new URLSearchParams(window.location.search).get("need") || "";
  }

  function getService(need) {
    if (!need || !global.SERVICE_CATALOG || !global.SERVICE_CATALOG.getService) return null;
    return global.SERVICE_CATALOG.getService(need);
  }

  function buildNeedOptions(selectedNeed, includeEmpty) {
    var catalog = global.SERVICE_CATALOG;
    if (!catalog || !catalog.SERVICES) {
      return (
        '<option value="">Votre besoin (facultatif)</option>' +
        '<option value="habitation"' +
        (selectedNeed === "habitation" ? " selected" : "") +
        ">Assurance habitation</option>" +
        '<option value="sante"' +
        (selectedNeed === "sante" ? " selected" : "") +
        ">Mutuelle santé</option>" +
        '<option value="auto"' +
        (selectedNeed === "auto" ? " selected" : "") +
        ">Assurance auto</option>"
      );
    }
    var order = ["mobilite", "sante", "habitat", "finance", "pro", "patrimoine", "animaux", "niches"];
    var html = includeEmpty ? '<option value="">Votre besoin (facultatif)</option>' : "";
    order.forEach(function (catId) {
      var cat = catalog.CATEGORIES[catId];
      if (!cat) return;
      html += '<optgroup label="' + esc(cat.label) + '">';
      Object.keys(catalog.SERVICES).forEach(function (key) {
        var svc = catalog.SERVICES[key];
        if (svc.category !== catId) return;
        html +=
          '<option value="' +
          esc(svc.need) +
          '"' +
          (selectedNeed === svc.need ? " selected" : "") +
          ">" +
          esc(svc.label) +
          "</option>";
      });
      html += "</optgroup>";
    });
    return html;
  }

  function renderFormHtml(options) {
    options = options || {};
    var compact = !!options.compact;
    var showNeed = options.showNeed !== false;
    var need = options.need || getNeedFromUrl();
    var id = options.id || "callback-" + Math.random().toString(36).slice(2, 8);

    return (
      '<div class="callback-panel' +
      (compact ? " callback-panel--compact" : "") +
      '">' +
      (compact ? "" : '<div class="callback-panel-icon" aria-hidden="true">📞</div>') +
      '<h3 class="callback-panel-title">' +
      esc(options.title || COPY.title) +
      "</h3>" +
      '<p class="callback-panel-lead">' +
      esc(options.lead || COPY.lead) +
      "</p>" +
      '<form class="callback-form" id="' +
      esc(id) +
      '" data-callback-submit novalidate>' +
      '<div class="hp-field" aria-hidden="true"><label>Ne pas remplir<input type="text" name="_hp" tabindex="-1" autocomplete="off" /></label></div>' +
      '<div class="callback-form-row">' +
      '<input type="email" name="email" autocomplete="email" placeholder="Votre e-mail" required />' +
      '<input type="tel" name="phone" autocomplete="tel" placeholder="Votre téléphone" required />' +
      "</div>" +
      (showNeed
        ? '<select name="need" class="callback-need-select" aria-label="Votre besoin">' +
          buildNeedOptions(need, true) +
          "</select>"
        : need
          ? '<input type="hidden" name="need" value="' + esc(need) + '" />'
          : "") +
      '<label class="field-check">' +
      '<input type="checkbox" name="consent" value="1" required />' +
      '<span>J\'accepte d\'être rappelé(e) par un conseiller Leads Opportunities, conformément à la <a href="' +
      esc(options.privacyHref || "./politique-confidentialite.html") +
      '" target="_blank" rel="noopener">politique de confidentialité</a>.</span>' +
      "</label>" +
      '<button type="submit" class="btn btn-primary btn-callback" data-clarity-label="Demande rappel express">' +
      esc(options.submitLabel || COPY.submit) +
      "</button>" +
      '<p class="callback-error" data-callback-error hidden></p>' +
      '<div class="callback-trust">' +
      "<span>✓ Rappel ~15 min</span>" +
      "<span>✓ Gratuit</span>" +
      "<span>✓ Sans engagement</span>" +
      "</div>" +
      "</form>" +
      '<div class="callback-success" data-callback-success hidden></div>' +
      "</div>"
    );
  }

  function renderStripHtml(options) {
    options = options || {};
    var need = options.need || getNeedFromUrl();
    var rappelHref =
      "./rappel.html" +
      (need ? "?need=" + encodeURIComponent(need) : "") +
      (window.location.search ? (need ? "&" : "?") + window.location.search.replace(/^\?/, "") : "");

    return (
      '<div class="callback-strip" data-callback-strip-root>' +
      '<div class="callback-strip-inner">' +
      '<div class="callback-strip-text">' +
      "<strong>" +
      esc(COPY.stripTitle) +
      "</strong>" +
      "<p>" +
      esc(COPY.stripLead) +
      "</p>" +
      "</div>" +
      '<div class="callback-strip-actions">' +
      '<button type="button" class="btn btn-primary btn-sm callback-strip-open" data-callback-strip-open>Me rappeler (2 champs)</button>' +
      '<a class="btn btn-outline btn-sm" href="' +
      esc(rappelHref) +
      '">Page rappel dédiée</a>' +
      "</div>" +
      "</div>" +
      '<div class="callback-strip-form-wrap" data-callback-strip-form hidden></div>' +
      "</div>"
    );
  }

  function collectFormFields(form) {
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
          return null;
        });
      })
      .catch(function () {
        return null;
      });
  }

  function sendGtagEvents(fields, result) {
    if (typeof global.gtag !== "function") return;
    global.gtag("event", "generate_lead", {
      event_category: "lead_generation",
      event_label: "callback_rappel",
      value: 1,
    });
    if (global.GOOGLE_TRACKING && global.GOOGLE_TRACKING.adsLeadConversionId) {
      global.gtag("event", "conversion", {
        send_to: global.GOOGLE_TRACKING.adsLeadConversionId,
        value: 1,
        currency: "EUR",
      });
    }
    if (result && result.leadScore != null && global.GOOGLE_TRACKING) {
      var score = Number(result.leadScore);
      if (global.GOOGLE_TRACKING.ga4MeasurementId && score >= 50) {
        global.gtag("event", "qualified_lead", {
          send_to: global.GOOGLE_TRACKING.ga4MeasurementId,
          value: score,
          currency: "EUR",
        });
      }
    }
  }

  function wireForm(form, options) {
    if (!form || form._callbackWired) return;
    form._callbackWired = true;
    options = options || {};

    var panel = form.closest(".callback-panel");
    var successEl = panel ? panel.querySelector("[data-callback-success]") : null;
    var errorEl = panel ? panel.querySelector("[data-callback-error]") : null;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (errorEl) errorEl.hidden = true;

      var fields = collectFormFields(form);
      if (fields._hp) return;

      var need = fields.need || options.need || getNeedFromUrl() || "";
      var svc = getService(need);

      var leadPayload = Object.assign(
        {
          source: options.source || "callback_rappel",
          journey: "callback",
          callbackRequested: true,
          vertical: (svc && svc.vertical) || need || "general",
          serviceNeed: (svc && svc.need) || need,
          serviceLabel: (svc && svc.label) || "",
          serviceCategory: (svc && svc.category) || "",
          page: window.location.pathname + window.location.search,
          message:
            "Demande de rappel express — l'utilisateur préfère être contacté plutôt que de remplir le formulaire complet.",
        },
        getUtmParams(),
        getAttr(),
        fields
      );
      delete leadPayload.consent;

      if (typeof global.saveLeadRequest === "function") {
        global.saveLeadRequest(leadPayload);
      }

      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Envoi…";
      }

      postLeadApi(leadPayload).then(function (result) {
        sendGtagEvents(fields, result);
        global.dispatchEvent(
          new CustomEvent("lo:lead-sent", {
            detail: { payload: leadPayload, result: result || {} },
          })
        );

        if (result && result.error === "geo_out_of_scope") {
          if (errorEl) {
            errorEl.textContent =
              result.message || "Service réservé aux résidents en France.";
            errorEl.hidden = false;
          }
          if (btn) {
            btn.disabled = false;
            btn.textContent = options.submitLabel || COPY.submit;
          }
          return;
        }

        if (result && result.ok) {
          form.hidden = true;
          if (successEl) {
            successEl.textContent = COPY.success;
            successEl.hidden = false;
          }
          return;
        }

        if (errorEl) {
          errorEl.textContent = COPY.error;
          errorEl.hidden = false;
        }
        if (btn) {
          btn.disabled = false;
          btn.textContent = options.submitLabel || COPY.submit;
        }
      });
    });
  }

  function mountFormEl(el) {
    var need = el.getAttribute("data-callback-need") || getNeedFromUrl();
    var showNeed = el.getAttribute("data-callback-show-need") !== "false";
    var compact = el.hasAttribute("data-callback-compact");
    var source = el.getAttribute("data-callback-source") || "callback_rappel";
    var privacyHref = el.getAttribute("data-callback-privacy") || "../politique-confidentialite.html";
    if (window.location.pathname.indexOf("index.html") !== -1 || window.location.pathname === "/") {
      privacyHref = "./politique-confidentialite.html";
    }

    el.innerHTML = renderFormHtml({
      need: need,
      showNeed: showNeed,
      compact: compact,
      source: source,
      privacyHref: privacyHref,
      title: el.getAttribute("data-callback-title") || undefined,
      lead: el.getAttribute("data-callback-lead") || undefined,
    });

    var form = el.querySelector("form");
    wireForm(form, { source: source, need: need });
  }

  function mountStripEl(el) {
    var need = el.getAttribute("data-callback-need") || getNeedFromUrl();
    el.innerHTML = renderStripHtml({ need: need });

    var openBtn = el.querySelector("[data-callback-strip-open]");
    var formWrap = el.querySelector("[data-callback-strip-form]");
    if (!openBtn || !formWrap) return;

    openBtn.addEventListener("click", function () {
      if (formWrap.hidden) {
        formWrap.hidden = false;
        formWrap.innerHTML = renderFormHtml({
          need: need,
          showNeed: !need,
          compact: true,
          source: "landing_callback_strip",
          privacyHref: "../politique-confidentialite.html",
        });
        wireForm(formWrap.querySelector("form"), {
          source: "landing_callback_strip",
          need: need,
        });
        openBtn.textContent = "Masquer";
        formWrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } else {
        formWrap.hidden = true;
        openBtn.textContent = "Me rappeler (2 champs)";
      }
    });
  }

  function mountAll() {
    document.querySelectorAll("[data-callback-form]").forEach(mountFormEl);
    document.querySelectorAll("[data-callback-strip]").forEach(mountStripEl);
    document.querySelectorAll("form[data-callback-submit]").forEach(function (form) {
      wireForm(form, {
        source: form.getAttribute("data-callback-source") || "callback_rappel",
        need: getNeedFromUrl(),
      });
    });
  }

  global.CallbackForm = {
    COPY: COPY,
    renderFormHtml: renderFormHtml,
    renderStripHtml: renderStripHtml,
    wireForm: wireForm,
    mountAll: mountAll,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountAll);
  } else {
    mountAll();
  }
})(typeof window !== "undefined" ? window : globalThis);
