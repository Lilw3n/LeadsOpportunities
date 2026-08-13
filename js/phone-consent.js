/**
 * Consentement prospection téléphonique (opt-in) — loi FR 11/08/2026.
 * Case dédiée, non précochée ; preuve stockée avec le lead.
 * Ne remplace pas un avis juridique.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.PhoneConsent = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  var VERSION = "phone_optin_v1_2026-08";
  var DURATION_MONTHS = 12;
  var ORG = "Leads Opportunities";

  var PRIVACY_DEFAULT = "./politique-confidentialite.html";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function serviceLabel(needOrLabel) {
    var s = String(needOrLabel || "").trim();
    if (!s) return "assurances, crédit immobilier et services associés proposés via nos formulaires";
    return s;
  }

  /** Texte exact affiché à la case (versionné). */
  function buildConsentText(opts) {
    opts = opts || {};
    var services = serviceLabel(opts.serviceLabel || opts.need || opts.vertical);
    return (
      "J'accepte d'être contacté(e) par téléphone par " +
      ORG +
      " (ou un conseiller partenaire) à des fins de prospection / conseil commercial concernant : " +
      services +
      ". Ce consentement est valable " +
      DURATION_MONTHS +
      " mois maximum (sans renouvellement tacite). Je peux le retirer à tout moment."
    );
  }

  function buildProcessingText(privacyHref) {
    return (
      'J\'accepte que mes données soient utilisées pour traiter ma demande (devis / rappel), conformément à la <a href="' +
      esc(privacyHref || PRIVACY_DEFAULT) +
      '" target="_blank" rel="noopener">politique de confidentialité</a>.'
    );
  }

  /**
   * @param {object} opts
   * @param {boolean} [opts.includeProcessing=true]
   * @param {boolean} [opts.phoneRequired=true]
   * @param {string} [opts.privacyHref]
   * @param {string} [opts.need]
   * @param {string} [opts.serviceLabel]
   */
  function buildCheckboxHtml(opts) {
    opts = opts || {};
    var privacy = opts.privacyHref || PRIVACY_DEFAULT;
    var phoneRequired = opts.phoneRequired !== false;
    var includeProcessing = opts.includeProcessing !== false;
    var text = buildConsentText(opts);
    var html = "";

    if (includeProcessing) {
      html +=
        '<label class="field-check lo-consent-processing">' +
        '<input type="checkbox" name="rgpd" value="1" required />' +
        "<span>" +
        buildProcessingText(privacy) +
        "</span></label>";
    }

    html +=
      '<label class="field-check lo-consent-phone">' +
      '<input type="checkbox" name="phone_consent" value="1"' +
      (phoneRequired ? " required" : "") +
      ' data-phone-consent="1" />' +
      "<span>" +
      esc(text) +
      ' <a href="' +
      esc(privacy) +
      '#prospection-telephonique" target="_blank" rel="noopener">En savoir plus</a>.</span>' +
      '<input type="hidden" name="phone_consent_version" value="' +
      esc(VERSION) +
      '" />' +
      '<input type="hidden" name="phone_consent_text" value="' +
      esc(text) +
      '" />' +
      "</label>";

    return html;
  }

  function isTruthy(v) {
    return v === true || v === 1 || v === "1" || v === "true" || v === "on" || v === "oui";
  }

  function expiresAtIso(fromDate) {
    var d = fromDate ? new Date(fromDate) : new Date();
    if (isNaN(d.getTime())) d = new Date();
    d.setMonth(d.getMonth() + DURATION_MONTHS);
    return d.toISOString();
  }

  /**
   * Enrichit le payload lead avec la preuve d'opt-in téléphone.
   * Mappe aussi l'ancien champ `consent` (formulaires rappel).
   */
  function enrichLeadPayload(payload, form) {
    payload = payload || {};
    var checked = false;
    if (form && form.querySelector) {
      var box = form.querySelector('[name="phone_consent"], [data-phone-consent]');
      if (box) checked = !!box.checked;
      var legacy = form.querySelector('[name="consent"]');
      if (!box && legacy) checked = !!legacy.checked;
    }
    if (!checked) {
      checked =
        isTruthy(payload.phone_consent) ||
        isTruthy(payload.consent) ||
        isTruthy(payload.phoneConsent);
    }

    var text =
      payload.phone_consent_text ||
      (form && form.querySelector && form.querySelector('[name="phone_consent_text"]')
        ? form.querySelector('[name="phone_consent_text"]').value
        : "") ||
      buildConsentText({
        need: payload.need || payload.serviceNeed,
        serviceLabel: payload.serviceLabel,
        vertical: payload.vertical,
      });

    var version =
      payload.phone_consent_version ||
      (form && form.querySelector && form.querySelector('[name="phone_consent_version"]')
        ? form.querySelector('[name="phone_consent_version"]').value
        : "") ||
      VERSION;

    var now = new Date().toISOString();
    var pageUrl = "";
    try {
      pageUrl = typeof location !== "undefined" ? location.href : "";
    } catch (e) {}

    payload.phone_consent = checked;
    payload.phone_consent_at = checked ? payload.phone_consent_at || now : null;
    payload.phone_consent_version = checked ? version : version;
    payload.phone_consent_text = checked ? text : text;
    payload.phone_consent_expires_at = checked ? expiresAtIso(payload.phone_consent_at || now) : null;
    payload.phone_consent_page_url = pageUrl || payload.phone_consent_page_url || payload.page || "";
    payload.phone_consent_org = ORG;
    // Ne pas supprimer la preuve ; garder rgpd si présent
    if (isTruthy(payload.rgpd)) payload.rgpd = true;
    return payload;
  }

  /** Normalisation côté serveur (Node). */
  function normalizeServer(body, meta) {
    meta = meta || {};
    body = body || {};
    var checked =
      isTruthy(body.phone_consent) ||
      isTruthy(body.consent) ||
      isTruthy(body.phoneConsent);
    var now = meta.serverReceivedAt || new Date().toISOString();
    var text =
      (body.phone_consent_text && String(body.phone_consent_text).slice(0, 2000)) ||
      buildConsentText({
        need: body.need || body.serviceNeed,
        serviceLabel: body.serviceLabel,
        vertical: body.vertical,
      });
    var version = String(body.phone_consent_version || VERSION).slice(0, 80);
    var pageUrl = String(
      body.phone_consent_page_url || body.page || body.landing_path || ""
    ).slice(0, 1000);

    return {
      phone_consent: checked,
      phone_consent_at: checked ? body.phone_consent_at || now : null,
      phone_consent_version: version,
      phone_consent_text: text,
      phone_consent_expires_at: checked
        ? body.phone_consent_expires_at || expiresAtIso(body.phone_consent_at || now)
        : null,
      phone_consent_page_url: pageUrl,
      phone_consent_ip: meta.clientIp || body.clientIp || null,
      phone_consent_org: ORG,
    };
  }

  function mountPlaceholders(root) {
    if (typeof document === "undefined") return;
    var scope = root || document;
    scope.querySelectorAll("[data-phone-consent-mount]").forEach(function (el) {
      if (el.getAttribute("data-mounted") === "1") return;
      var needSel = el.getAttribute("data-need-select");
      var need = el.getAttribute("data-need") || "";
      if (needSel && document.querySelector(needSel)) {
        need = document.querySelector(needSel).value || need;
      }
      el.innerHTML = buildCheckboxHtml({
        privacyHref: el.getAttribute("data-privacy") || PRIVACY_DEFAULT,
        need: need,
        serviceLabel: el.getAttribute("data-service-label") || need,
        phoneRequired: el.getAttribute("data-phone-required") !== "false",
        includeProcessing: el.getAttribute("data-include-processing") !== "false",
      });
      el.setAttribute("data-mounted", "1");
      if (needSel && document.querySelector(needSel) && !el._needBound) {
        el._needBound = true;
        document.querySelector(needSel).addEventListener("change", function () {
          el.removeAttribute("data-mounted");
          el.setAttribute("data-need", document.querySelector(needSel).value || "");
          mountPlaceholders(el.parentNode || document);
        });
      }
    });
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        mountPlaceholders();
      });
    } else {
      mountPlaceholders();
    }
  }

  return {
    VERSION: VERSION,
    DURATION_MONTHS: DURATION_MONTHS,
    buildConsentText: buildConsentText,
    buildProcessingText: buildProcessingText,
    buildCheckboxHtml: buildCheckboxHtml,
    enrichLeadPayload: enrichLeadPayload,
    normalizeServer: normalizeServer,
    expiresAtIso: expiresAtIso,
    isTruthy: isTruthy,
    mountPlaceholders: mountPlaceholders,
  };
});
