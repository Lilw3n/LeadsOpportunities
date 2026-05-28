(function () {
  var KEY_ATTR = "lo_attr_v1";
  var KEY_VISITOR = "lo_vid_v1";

  function uuid() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    return "v_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
  }

  function ensureVisitorId() {
    try {
      var id = localStorage.getItem(KEY_VISITOR);
      if (!id) {
        id = uuid();
        localStorage.setItem(KEY_VISITOR, id);
      }
      return id;
    } catch (e) {
      return "";
    }
  }

  function captureAttribution() {
    try {
      var params = new URLSearchParams(window.location.search);
      var keys = [
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_content",
        "utm_term",
        "gclid",
        "fbclid",
        "msclkid",
      ];
      var raw = localStorage.getItem(KEY_ATTR);
      var bag = {};
      try {
        bag = JSON.parse(raw || "{}");
      } catch (e) {
        bag = {};
      }
      if (!bag.first_touch) bag.first_touch = {};
      if (!bag.last_touch) bag.last_touch = {};

      if (!bag.landing_path) {
        bag.landing_path = window.location.pathname;
        bag.landing_at = new Date().toISOString();
      }
      if (!bag.referrer && document.referrer) {
        bag.referrer_first = document.referrer;
      }

      keys.forEach(function (k) {
        var v = params.get(k);
        if (v) {
          bag.last_touch[k] = v;
          if (!bag.first_touch[k]) bag.first_touch[k] = v;
        }
      });

      localStorage.setItem(KEY_ATTR, JSON.stringify(bag));
    } catch (e) {}
  }

  function parseSeoCityFromPath(path) {
    var p = String(path || "");
    var m = p.match(/\/villes\/([^/]+)/) || p.match(/\/france\/villes\/([^/]+)/);
    if (m) {
      try {
        return decodeURIComponent(m[1]).replace(/-/g, " ");
      } catch (e) {
        return m[1];
      }
    }
    return "";
  }

  function sendTouchpoint() {
    try {
      var payload = window.getAttributionPayload();
      fetch("/api/lead-touchpoint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitor_id: payload.visitor_id,
          page_path: window.location.pathname,
          page_title: document.title,
          seo_city: parseSeoCityFromPath(window.location.pathname),
          utm_source: payload.attr_last_utm_source,
          utm_medium: payload.attr_last_utm_medium,
          utm_campaign: payload.attr_last_utm_campaign,
          referrer: document.referrer || "",
        }),
      }).catch(function () {});
    } catch (e) {}
  }

  function sessionId() {
    var key = "lo_sid_v1";
    try {
      var sid = sessionStorage.getItem(key);
      if (!sid) {
        sid = uuid();
        sessionStorage.setItem(key, sid);
      }
      return sid;
    } catch (e) {
      return "";
    }
  }

  function verticalFromPath() {
    var p = String(window.location.pathname || "");
    if (p.indexOf("vtc") >= 0) return "vtc";
    if (p.indexOf("sante") >= 0) return "sante";
    if (p.indexOf("credit") >= 0) return "credit_immo";
    if (p.indexOf("devis") >= 0) return "devis";
    return "";
  }

  function trackMetaClient(eventType, payload) {
    if (typeof window.fbq !== "function") return;
    var vertical = payload.vertical || verticalFromPath() || "lead";
    if (eventType === "form_start") {
      window.fbq("trackCustom", "JourneyFormStart", { content_name: vertical });
      return;
    }
    if (eventType === "wizard_step") {
      window.fbq("trackCustom", "JourneyStep", {
        content_name: vertical,
        step_name: payload.step_name || "",
        step: payload.step || 0,
      });
      return;
    }
    if (eventType === "lead_submit_success") {
      window.fbq("track", "Lead", {
        content_name: vertical,
        value: Number(payload.lead_score || 1),
        currency: "EUR",
      });
    }
  }

  function sendJourneyEvent(eventType, payload) {
    payload = payload || {};
    var attr = window.getAttributionPayload();
    var body = {
      event_type: eventType,
      visitor_id: attr.visitor_id,
      session_id: sessionId(),
      lead_id: payload.lead_id || payload.leadId || null,
      page_path: window.location.pathname,
      step_name: payload.step_name || null,
      vertical: payload.vertical || verticalFromPath() || null,
      source: payload.source || "site",
      meta: Object.assign({}, attr, payload.meta || {}),
    };
    fetch("/api/journey-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(function () {});
    trackMetaClient(eventType, body);
  }

  function bindJourneyTracking() {
    sendJourneyEvent("page_view", { source: "page" });

    var started = false;
    var submitted = false;
    var forms = document.querySelectorAll("form");
    forms.forEach(function (form) {
      var vertical = form.getAttribute("data-vertical") || verticalFromPath();
      var onStart = function () {
        if (started) return;
        started = true;
        sendJourneyEvent("form_start", {
          vertical: vertical,
          source: "form",
          meta: { form_id: form.id || form.getAttribute("name") || "form" },
        });
      };
      form.addEventListener("focusin", onStart, { once: true });
      form.addEventListener("submit", function () {
        onStart();
        sendJourneyEvent("form_submit_click", {
          vertical: vertical,
          source: "form",
          meta: { form_id: form.id || form.getAttribute("name") || "form" },
        });
      });
    });

    window.addEventListener("lo:lead-sent", function (ev) {
      submitted = true;
      var d = (ev && ev.detail) || {};
      var payload = d.payload || {};
      var result = d.result || {};
      sendJourneyEvent("lead_submit_success", {
        leadId: result.leadId || payload.leadId || null,
        vertical: payload.vertical || verticalFromPath(),
        source: payload.source || "site",
        meta: {
          lead_score: result.leadScore || null,
          page: window.location.pathname,
        },
      });
    });

    window.addEventListener("lo:wizard_step", function (ev) {
      var d = (ev && ev.detail) || {};
      sendJourneyEvent("wizard_step", {
        vertical: d.vertical || verticalFromPath(),
        step_name: d.step_name || "wizard_step",
        source: "wizard",
        meta: d,
      });
    });

    function onLeave() {
      if (!started || submitted) return;
      sendJourneyEvent("form_abandon", {
        vertical: verticalFromPath(),
        source: "form",
        meta: { page: window.location.pathname },
      });
      started = false;
    }
    window.addEventListener("pagehide", onLeave);
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") onLeave();
    });
  }

  window.getAttributionPayload = function () {
    ensureVisitorId();
    captureAttribution();
    try {
      var bag = JSON.parse(localStorage.getItem(KEY_ATTR) || "{}");
      var ft = bag.first_touch || {};
      var lt = bag.last_touch || {};
      var cur = new URLSearchParams(window.location.search);
      var path = bag.landing_path || window.location.pathname || "";
      return {
        visitor_id: localStorage.getItem(KEY_VISITOR) || "",
        landing_path: path,
        seo_city: parseSeoCityFromPath(path) || parseSeoCityFromPath(window.location.pathname),
        landing_at: bag.landing_at || "",
        referrer_first: bag.referrer_first || "",
        attr_first_utm_source: ft.utm_source || "",
        attr_first_utm_medium: ft.utm_medium || "",
        attr_first_utm_campaign: ft.utm_campaign || "",
        attr_first_utm_content: ft.utm_content || "",
        attr_first_utm_term: ft.utm_term || "",
        attr_first_gclid: ft.gclid || "",
        attr_first_fbclid: ft.fbclid || "",
        attr_last_utm_source: lt.utm_source || cur.get("utm_source") || "",
        attr_last_utm_medium: lt.utm_medium || cur.get("utm_medium") || "",
        attr_last_utm_campaign: lt.utm_campaign || cur.get("utm_campaign") || "",
        attr_last_gclid: lt.gclid || cur.get("gclid") || "",
        attr_last_fbclid: lt.fbclid || cur.get("fbclid") || "",
      };
    } catch (e) {
      return { visitor_id: ensureVisitorId() };
    }
  };

  captureAttribution();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      sendTouchpoint();
      bindJourneyTracking();
    });
  } else {
    sendTouchpoint();
    bindJourneyTracking();
  }
})();
