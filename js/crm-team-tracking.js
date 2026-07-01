/**
 * Tracking parcours équipe CRM / dashboard — journey_events + tags Clarity.
 * Les pages CRM n'avaient pas Clarity : les sessions contributeurs étaient invisibles.
 */
(function () {
  var VISITOR_KEY = "lo_vid_v1";
  var SESSION_KEY = "lo_crm_sid_v1";
  var CLARITY_ID = "x7yqp46fj9";

  function visitorId() {
    try {
      var v = localStorage.getItem(VISITOR_KEY);
      if (!v) {
        v = "v_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
        localStorage.setItem(VISITOR_KEY, v);
      }
      return v;
    } catch (e) {
      return "crm_anon";
    }
  }

  function sessionId() {
    try {
      var v = sessionStorage.getItem(SESSION_KEY);
      if (!v) {
        v = "cs_" + Date.now().toString(36);
        sessionStorage.setItem(SESSION_KEY, v);
      }
      return v;
    } catch (e) {
      return "crm_sess";
    }
  }

  function pageFile() {
    var p = location.pathname || "";
    var parts = p.split("/");
    return parts[parts.length - 1] || "index.html";
  }

  function zone() {
    if (/dashboard\.html/.test(location.pathname)) return "dashboard";
    if (/^\/crm/.test(location.pathname) || /crm-/.test(pageFile())) return "crm";
    return "internal";
  }

  function send(eventType, extra) {
    extra = extra || {};
    var body = {
      event_type: eventType,
      visitor_id: visitorId(),
      session_id: sessionId(),
      page_path: location.pathname,
      step_name: extra.step_name || null,
      source: "crm_team",
      meta: Object.assign(
        {
          crm_page: pageFile(),
          team_zone: zone(),
          label: extra.label || null,
        },
        extra.meta || {}
      ),
    };
    fetch("/api/journey-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(function () {});
  }

  function tagClarity() {
    if (!window.clarity) return;
    try {
      window.clarity("set", "page_section", zone());
      window.clarity("set", "crm_page", pageFile());
      window.clarity("set", "team_session", "yes");
      window.clarity("identify", visitorId(), null, null, "crm_team");
    } catch (e) {}
  }

  function bootClarity() {
    if (window.clarity) {
      tagClarity();
      return;
    }
    if (document.getElementById("clarity-script")) return;
    window.clarity =
      window.clarity ||
      function () {
        (window.clarity.q = window.clarity.q || []).push(arguments);
      };
    var s = document.createElement("script");
    s.async = true;
    s.id = "clarity-script";
    s.src = "https://www.clarity.ms/tag/" + CLARITY_ID;
    s.onload = tagClarity;
    document.head.appendChild(s);
  }

  function bindNavClicks() {
    document.addEventListener(
      "click",
      function (e) {
        var el = e.target.closest("a[href], button[data-href]");
        if (!el) return;
        var href = el.getAttribute("href") || el.getAttribute("data-href") || "";
        if (!href || href.charAt(0) === "#") return;
        var label = (el.getAttribute("data-clarity-label") || el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80);
        if (/crm-|dashboard\.html|auth\.html/.test(href)) {
          send("crm_nav_click", { step_name: href, label: label });
          if (window.clarity) window.clarity("event", "crm_nav_click");
        }
      },
      true
    );
  }

  bootClarity();
  send("page_view");
  bindNavClicks();
})();
