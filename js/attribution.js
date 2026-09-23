(function () {
  var KEY_ATTR = "lo_attr_v1";
  var KEY_VISITOR = "lo_vid_v1";
  var KEY_PARCOURS_ACTIVE = "lo_parcours_active_v1";
  var KEY_PARCOURS_CUSTOM = "lo_parcours_custom_v1";
  var KEY_PARCOURS_ENTERED = "lo_parcours_entered_sid_v1";
  var DEFAULT_PARCOURS = [
    {
      id: "meta_lead_rapide",
      label: "Meta Lead Rapide",
      type: "source",
      sourceMatchers: ["facebook", "instagram", "meta", "fbads"],
      crmWorkflow: ["new", "questionnaire", "quote_sent", "follow_up"],
    },
    {
      id: "google_intention_chaude",
      label: "Google Intention Chaude",
      type: "source",
      sourceMatchers: ["google", "gclid", "bing", "msclkid"],
      crmWorkflow: ["new", "tariff_editing", "quote_sent", "follow_up"],
    },
    {
      id: "organique_confiance",
      label: "Organique Confiance",
      type: "public",
      sourceMatchers: ["seo", "organic", "direct"],
      crmWorkflow: ["new", "questionnaire", "follow_up"],
    },
  ];

  function uuid() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    return "v_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
  }

  function parseJsonSafe(raw, fallback) {
    try {
      return JSON.parse(raw || "");
    } catch (e) {
      return fallback;
    }
  }

  function sanitizeParcours(def) {
    if (!def || !def.id) return null;
    return {
      id: String(def.id).slice(0, 80),
      label: String(def.label || def.id).slice(0, 160),
      type: String(def.type || "public").slice(0, 30),
      sourceMatchers: Array.isArray(def.sourceMatchers)
        ? def.sourceMatchers
            .map(function (s) {
              return String(s || "").trim().toLowerCase();
            })
            .filter(Boolean)
            .slice(0, 20)
        : [],
      crmWorkflow: Array.isArray(def.crmWorkflow)
        ? def.crmWorkflow
            .map(function (s) {
              return String(s || "").trim();
            })
            .filter(Boolean)
            .slice(0, 12)
        : [],
    };
  }

  function getCustomParcours() {
    try {
      var list = parseJsonSafe(localStorage.getItem(KEY_PARCOURS_CUSTOM), []);
      if (!Array.isArray(list)) return [];
      return list.map(sanitizeParcours).filter(Boolean);
    } catch (e) {
      return [];
    }
  }

  function setCustomParcours(list) {
    try {
      localStorage.setItem(KEY_PARCOURS_CUSTOM, JSON.stringify(list || []));
    } catch (e) {}
  }

  function allParcours() {
    return DEFAULT_PARCOURS.concat(getCustomParcours());
  }

  function trafficFingerprint() {
    var p = new URLSearchParams(window.location.search);
    var attr = window.getAttributionPayload ? window.getAttributionPayload() : {};
    var sourceBag = [
      p.get("utm_source"),
      p.get("utm_medium"),
      p.get("gclid"),
      p.get("fbclid"),
      p.get("msclkid"),
      attr.attr_last_utm_source,
      attr.attr_first_utm_source,
      attr.attr_last_gclid,
      attr.attr_last_fbclid,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (sourceBag.indexOf("fbclid") >= 0) sourceBag += " facebook";
    if (sourceBag.indexOf("gclid") >= 0) sourceBag += " google";
    if (sourceBag.indexOf("msclkid") >= 0) sourceBag += " bing";
    return sourceBag;
  }

  function pickParcoursBySource() {
    var byQuery = new URLSearchParams(window.location.search).get("parcours");
    var list = allParcours();
    if (byQuery) {
      var picked = list.find(function (p) {
        return p.id === byQuery;
      });
      if (picked) return picked;
    }
    var source = trafficFingerprint();
    var matched = list.find(function (p) {
      return (p.sourceMatchers || []).some(function (k) {
        return source.indexOf(String(k || "").toLowerCase()) >= 0;
      });
    });
    return matched || list[0] || null;
  }

  function getActiveParcours() {
    var stored = parseJsonSafe(localStorage.getItem(KEY_PARCOURS_ACTIVE), null);
    if (stored && stored.id) return stored;
    var selected = pickParcoursBySource();
    if (selected) setActiveParcours(selected, "auto_source_match");
    return selected;
  }

  function setActiveParcours(p, reason) {
    var cleaned = sanitizeParcours(p);
    if (!cleaned) return null;
    var saved = Object.assign({}, cleaned, {
      activatedAt: new Date().toISOString(),
      activationReason: reason || "manual",
    });
    try {
      localStorage.setItem(KEY_PARCOURS_ACTIVE, JSON.stringify(saved));
    } catch (e) {}
    return saved;
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
      /* Sur un article blog : mémoriser la source pour les leads suivants */
      try {
        var blogMatch = (window.location.pathname || "").match(/\/blog\/([^/]+?)(?:\.html)?\/?$/i);
        if (blogMatch) {
          var slug = decodeURIComponent(blogMatch[1]);
          bag.blog_article = slug;
          localStorage.setItem("lo_blog_article", slug + ".html");
          if (!bag.last_touch.utm_content) bag.last_touch.utm_content = slug;
          if (!bag.first_touch.utm_content) bag.first_touch.utm_content = slug;
          if (!bag.last_touch.utm_source) bag.last_touch.utm_source = "blog";
        }
      } catch (blogErr) {}

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
    var silo = p.match(
      /^\/(assurance-vtc|assurance-sante|credit-immo|assurance-auto|assurance-habitation|assurance-emprunteur|assurance-prevoyance|assurance-animaux|assurance-chien|assurance-chat|assurance-chasse|assurance-equitation)\/([^/?#]+)/
    );
    if (silo) {
      var slug = silo[2];
      var skip = [
        "villes",
        "departements",
        "departement",
        "devis-rapide",
        "tarif",
        "simulation",
        "comparatif",
        "rc-pro",
        "uber-bolt",
        "creation-activite",
        "resiliation",
        "comparatif-assureurs",
        "pas-cher",
        "remboursement-optique",
      ];
      if (skip.indexOf(slug) === -1) {
        try {
          return decodeURIComponent(slug).replace(/-/g, " ");
        } catch (e) {
          return slug.replace(/-/g, " ");
        }
      }
    }
    return "";
  }

  function parseSeoProductFromPath(path) {
    var p = String(path || "");
    var m = p.match(
      /^\/(assurance-vtc|assurance-sante|credit-immo|assurance-auto|assurance-habitation|assurance-emprunteur|assurance-prevoyance|assurance-animaux|assurance-chien|assurance-chat)/
    );
    if (!m) return "";
    var map = {
      "assurance-vtc": "vtc",
      "assurance-sante": "sante",
      "credit-immo": "credit-immo",
      "assurance-auto": "auto",
      "assurance-habitation": "habitation",
      "assurance-emprunteur": "emprunteur",
      "assurance-prevoyance": "prevoyance",
      "assurance-animaux": "animaux",
      "assurance-chien": "chien",
      "assurance-chat": "chat",
    };
    return map[m[1]] || "";
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
          seo_product: parseSeoProductFromPath(window.location.pathname),
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
      return;
    }
  }

  function sendJourneyEvent(eventType, payload) {
    payload = payload || {};
    var attr = window.getAttributionPayload();
    var parcours = getActiveParcours();
    var body = {
      event_type: eventType,
      visitor_id: attr.visitor_id,
      session_id: sessionId(),
      lead_id: payload.lead_id || payload.leadId || null,
      page_path: window.location.pathname,
      step_name: payload.step_name || null,
      vertical: payload.vertical || verticalFromPath() || null,
      source: payload.source || "site",
      meta: Object.assign(
        {},
        attr,
        {
          parcours_id: parcours && parcours.id ? parcours.id : null,
          parcours_label: parcours && parcours.label ? parcours.label : null,
          parcours_workflow: parcours && parcours.crmWorkflow ? parcours.crmWorkflow : [],
        },
        payload.meta || {}
      ),
    };
    fetch("/api/journey-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(function () {});
    trackMetaClient(eventType, body);
    if (window.loTrackingCorrelation && window.loTrackingCorrelation.mirrorJourney) {
      window.loTrackingCorrelation.mirrorJourney(eventType, {
        vertical: body.vertical,
        step_name: body.step_name,
        lead_id: body.lead_id,
        lead_score: payload.meta && payload.meta.lead_score,
      });
    }
  }

  function bindJourneyTracking() {
    var activeParcours = getActiveParcours();
    var sid = sessionId();
    if (activeParcours && sid) {
      var enteredKey = KEY_PARCOURS_ENTERED + ":" + sid + ":" + activeParcours.id;
      if (!sessionStorage.getItem(enteredKey)) {
        sendJourneyEvent("parcours_enter", {
          source: "parcours",
          meta: {
            parcours_id: activeParcours.id,
            parcours_label: activeParcours.label,
          },
        });
        sessionStorage.setItem(enteredKey, "1");
      }
    }

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

    window.addEventListener("lo:wizard_early_finish", function (ev) {
      var d = (ev && ev.detail) || {};
      sendJourneyEvent("wizard_early_finish", {
        vertical: d.vertical || verticalFromPath(),
        step_name: "early_callback",
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

  function readCookie(name) {
    var match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : "";
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
        seo_product: parseSeoProductFromPath(path) || parseSeoProductFromPath(window.location.pathname),
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
        attr_last_utm_content: lt.utm_content || cur.get("utm_content") || "",
        attr_last_utm_term: lt.utm_term || cur.get("utm_term") || "",
        attr_last_gclid: lt.gclid || cur.get("gclid") || "",
        attr_last_fbclid: lt.fbclid || cur.get("fbclid") || "",
        utm_content: lt.utm_content || cur.get("utm_content") || ft.utm_content || "",
        blog_article:
          (function () {
            try {
              var fromBag = localStorage.getItem("lo_blog_article") || "";
              if (fromBag) return String(fromBag).replace(/\.html$/i, "");
            } catch (e) {}
            try {
              var m = (window.location.pathname || "").match(/\/blog\/([^/]+?)(?:\.html)?\/?$/i);
              if (m) return decodeURIComponent(m[1]);
            } catch (e2) {}
            return lt.utm_content || ft.utm_content || "";
          })(),
        fbp: readCookie("_fbp") || "",
        attr_fbp: readCookie("_fbp") || "",
      };
    } catch (e) {
      return { visitor_id: ensureVisitorId() };
    }
  };

  window.Parcours = {
    list: function () {
      return allParcours();
    },
    getActive: function () {
      return getActiveParcours();
    },
    setActive: function (parcoursId) {
      var target = allParcours().find(function (p) {
        return p.id === parcoursId;
      });
      if (!target) return null;
      return setActiveParcours(target, "manual_set");
    },
    create: function (definition) {
      var clean = sanitizeParcours(definition);
      if (!clean) return null;
      var list = getCustomParcours().filter(function (p) {
        return p.id !== clean.id;
      });
      list.push(clean);
      setCustomParcours(list);
      return clean;
    },
    remove: function (parcoursId) {
      var list = getCustomParcours().filter(function (p) {
        return p.id !== parcoursId;
      });
      setCustomParcours(list);
    },
  };

  captureAttribution();
  if (window.loTrackingCorrelation && window.loTrackingCorrelation.syncIdentity) {
    window.loTrackingCorrelation.syncIdentity();
  }
  try {
    window.dispatchEvent(new CustomEvent("lo:attribution-ready"));
  } catch (e) {}
  function bootTracking() {
    sendTouchpoint();
    bindJourneyTracking();
  }
  function scheduleBoot() {
    if (typeof window.scheduleIdle === "function") {
      window.scheduleIdle(bootTracking, 3000);
    } else {
      setTimeout(bootTracking, 1500);
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleBoot);
  } else {
    scheduleBoot();
  }
})();
