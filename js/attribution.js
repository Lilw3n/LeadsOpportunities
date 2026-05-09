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

  window.getAttributionPayload = function () {
    ensureVisitorId();
    captureAttribution();
    try {
      var bag = JSON.parse(localStorage.getItem(KEY_ATTR) || "{}");
      var ft = bag.first_touch || {};
      var lt = bag.last_touch || {};
      var cur = new URLSearchParams(window.location.search);
      return {
        visitor_id: localStorage.getItem(KEY_VISITOR) || "",
        landing_path: bag.landing_path || "",
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
})();
