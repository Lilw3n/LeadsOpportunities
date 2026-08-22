/**
 * Correlation ID partagé : GA4 + Clarity + Meta + CRM (visitor_id, leadId, UTMs).
 */
(function (global) {
  var synced = false;
  var lastLeadEventId = null;

  function attr() {
    if (typeof global.getAttributionPayload === "function") {
      return global.getAttributionPayload();
    }
    return {};
  }

  function parcoursId() {
    try {
      if (global.Parcours && global.Parcours.getActive) {
        var p = global.Parcours.getActive();
        return p && p.id ? p.id : "";
      }
    } catch (e) {}
    return "";
  }

  function gaId() {
    var cfg = global.GOOGLE_TRACKING || {};
    return cfg.ga4MeasurementId && cfg.ga4MeasurementId.indexOf("XXXX") === -1 ? cfg.ga4MeasurementId : null;
  }

  function buildParams(extra) {
    var a = attr();
    var params = {
      visitor_id: a.visitor_id || "",
      landing_path: a.landing_path || global.location.pathname || "",
      seo_city: a.seo_city || "",
      utm_source: a.attr_last_utm_source || a.attr_first_utm_source || "",
      utm_medium: a.attr_last_utm_medium || a.attr_first_utm_medium || "",
      utm_campaign: a.attr_last_utm_campaign || a.attr_first_utm_campaign || "",
      utm_content: a.attr_first_utm_content || "",
      gclid: a.attr_last_gclid || a.attr_first_gclid || "",
      fbclid: a.attr_last_fbclid || a.attr_first_fbclid || "",
      parcours_id: parcoursId(),
      page_section: (global.location.pathname || "").indexOf("/blog") >= 0 ? "blog" : "",
    };
    return Object.assign(params, extra || {});
  }

  function syncIdentity() {
    if (synced) return;
    var a = attr();
    var vid = a.visitor_id;
    if (!vid) return;

    var params = buildParams();

    if (typeof global.gtag === "function" && gaId()) {
      try {
        global.gtag("config", gaId(), { user_id: vid });
        global.gtag("set", "user_properties", {
          market_intent: "FR",
          parcours_id: params.parcours_id || "(none)",
        });
      } catch (e) {}
    }

    global.dispatchEvent(
      new CustomEvent("lo:tracking-sync", {
        detail: params,
      })
    );
    synced = true;
  }

  function trackMetaLead(eventId, payload) {
    var cfg = global.SOCIAL_TRACKING || {};
    if (!cfg.metaPixelId || typeof global.fbq !== "function") return;
    var vertical = (payload && payload.vertical) || "lead";
    var value = payload && payload.lead_score != null ? Number(payload.lead_score) : 1;
    try {
      global.fbq(
        "track",
        "Lead",
        { content_name: vertical, value: value, currency: "EUR" },
        { eventID: eventId }
      );
    } catch (e) {}
  }

  function fireConversion(result, payload) {
    payload = payload || {};
    result = result || {};
    if (!result.ok) return;

    var leadId = result.leadId || payload.leadId || "";
    if (!leadId) return;
    if (lastLeadEventId === leadId) return;
    lastLeadEventId = leadId;

    var vertical = payload.vertical || payload.serviceNeed || payload.need || "lead";
    var score = result.leadScore != null ? Number(result.leadScore) : null;
    var params = buildParams({
      vertical: vertical,
      lead_id: leadId,
      lead_score: score,
      source: payload.source || "site",
      transaction_id: leadId,
    });

    if (typeof global.gtag === "function" && gaId()) {
      global.gtag("event", "generate_lead", Object.assign({}, params, { send_to: gaId() }));
      var cfg = global.GOOGLE_TRACKING || {};
      if (cfg.adsLeadConversionId && cfg.adsLeadConversionId.indexOf("XXXX") === -1) {
        global.gtag("event", "conversion", {
          send_to: cfg.adsLeadConversionId,
          value: 1,
          currency: "EUR",
          transaction_id: leadId,
        });
      }
      if (score != null && score >= 50) {
        global.gtag("event", "qualified_lead", {
          send_to: gaId(),
          value: score,
          currency: "EUR",
          vertical: vertical,
          transaction_id: leadId,
          visitor_id: params.visitor_id,
        });
        if (cfg.adsQualifiedLeadConversionId && cfg.adsQualifiedLeadConversionId.indexOf("XXXX") === -1) {
          global.gtag("event", "conversion", {
            send_to: cfg.adsQualifiedLeadConversionId,
            value: score,
            currency: "EUR",
            transaction_id: leadId,
          });
        }
      }
    }

    trackMetaLead(leadId, { vertical: vertical, lead_score: score });

    global.dispatchEvent(
      new CustomEvent("lo:lead-converted", {
        detail: { leadId: leadId, leadScore: score, payload: payload, params: params },
      })
    );
  }

  function mirrorJourney(eventType, payload) {
    if (typeof global.gtag !== "function" || !gaId()) return;
    var map = {
      page_view: "page_view",
      form_start: "journey_form_start",
      form_abandon: "journey_form_abandon",
      lead_submit_success: "journey_lead_success",
      wizard_step: "wizard_step",
      wizard_early_finish: "journey_early_callback",
    };
    var gaName = map[eventType];
    if (!gaName) return;
    global.gtag("event", gaName, Object.assign({}, buildParams(payload || {}), { send_to: gaId() }));
  }

  global.loTrackingCorrelation = {
    buildParams: buildParams,
    syncIdentity: syncIdentity,
    fireConversion: fireConversion,
    mirrorJourney: mirrorJourney,
    trackMetaLead: trackMetaLead,
  };

  function trySync() {
    if (typeof global.getAttributionPayload === "function") {
      syncIdentity();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", trySync);
  } else {
    trySync();
  }
  global.addEventListener("lo:attribution-ready", trySync);
})(window);
