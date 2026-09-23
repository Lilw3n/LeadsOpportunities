/**
 * Analytics blog : profondeur de lecture, sections vues, clics CTA/liens.
 * Événements GA4 : blog_article_view, blog_scroll_depth, blog_section_view,
 * blog_cta_click, blog_link_click, blog_faq_open, blog_engagement.
 */
(function () {
  var SCROLL_THRESHOLDS = [25, 50, 75, 90, 100];
  var scrollFired = {};
  var sectionsFired = {};
  var startedAt = Date.now();
  var engagementSent = false;

  function throttle(fn, wait) {
    var t = 0;
    return function () {
      var now = Date.now();
      if (now - t < wait) return;
      t = now;
      fn();
    };
  }

  function articleSlug() {
    var m = location.pathname.match(/\/blog\/([^/]+?)(?:\.html)?\/?$/);
    if (m) return m[1];
    if (location.pathname.indexOf("/blog") !== -1 && location.pathname.indexOf(".html") === -1) {
      return "index";
    }
    return "";
  }

  function meta() {
    var body = document.body;
    return {
      article_slug: articleSlug(),
      article_section: body.getAttribute("data-blog-section") || "",
      article_tag: body.getAttribute("data-blog-tag") || "",
      page_type: body.getAttribute("data-blog-page") || (articleSlug() === "index" ? "blog_index" : "blog_article"),
    };
  }

  function gaId() {
    var cfg = window.GOOGLE_TRACKING || {};
    return cfg.ga4MeasurementId && cfg.ga4MeasurementId.indexOf("XXXX") === -1
      ? cfg.ga4MeasurementId
      : "G-JX8E35693F";
  }

  function mirrorClarity(eventName, params) {
    var C = window.loClarity;
    if (!C) return;
    params = params || {};
    try {
      if (eventName === "blog_scroll_depth") {
        C.setTag("max_scroll_percent", String(params.percent_scrolled || ""));
        C.event("blog_scroll_" + params.percent_scrolled);
        if (params.percent_scrolled >= 75) {
          C.upgrade("deep_read");
        }
      } else if (eventName === "blog_cta_click") {
        C.event("blog_cta_click");
        if (params.link_text) C.setTag("last_cta", params.link_text);
        if (params.link_zone) C.setTag("cta_zone", params.link_zone);
        C.upgrade("cta_click");
      } else if (eventName === "blog_read_complete") {
        C.event("blog_read_complete");
        C.upgrade("read_complete");
      } else if (eventName === "blog_faq_open") {
        C.event("blog_faq_open");
      } else if (eventName === "blog_section_view" && params.section_name) {
        C.setTag("section_seen", params.section_name);
        C.event("blog_section_" + params.section_name);
      } else if (eventName === "blog_engagement") {
        C.setTag("time_on_page_sec", String(params.time_on_page_sec || ""));
        if (params.max_scroll_percent) {
          C.setTag("session_max_scroll", String(params.max_scroll_percent));
        }
      }
    } catch (e) {}
  }

  function visitorId() {
    try {
      if (window.getAttributionPayload) {
        var a = window.getAttributionPayload() || {};
        if (a.visitor_id) return a.visitor_id;
      }
      var key = "lo_visitor_id";
      var id = localStorage.getItem(key);
      if (!id) {
        id = "v_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
        localStorage.setItem(key, id);
      }
      return id;
    } catch (e) {
      return null;
    }
  }

  function sessionId() {
    try {
      var key = "lo_session_id";
      var id = sessionStorage.getItem(key);
      if (!id) {
        id = "s_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
        sessionStorage.setItem(key, id);
      }
      return id;
    } catch (e) {
      return null;
    }
  }

  /** Miroir first-party → Neon (CRM Stats blog). Évite le flood scroll. */
  function mirrorJourney(eventName, params) {
    var allow =
      eventName === "blog_article_view" ||
      eventName === "blog_cta_click" ||
      eventName === "blog_card_click" ||
      eventName === "blog_link_click" ||
      eventName === "blog_read_complete" ||
      eventName === "blog_faq_open" ||
      (eventName === "blog_scroll_depth" &&
        (params.percent_scrolled === 50 || params.percent_scrolled === 100));
    if (!allow) return;
    var base = meta();
    var body = {
      event_type: eventName,
      visitor_id: visitorId(),
      session_id: sessionId(),
      page_path: location.pathname,
      step_name: (params && (params.link_zone || params.section_name)) || null,
      vertical: base.article_section || null,
      source: "blog",
      meta: Object.assign({}, base, params || {}),
    };
    try {
      fetch("/api/journey-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        keepalive: true,
      }).catch(function () {});
    } catch (e) {}
  }

  function track(eventName, params) {
    var base = meta();
    var payload = Object.assign(
      {
        send_to: gaId(),
        page_location: location.href,
        page_path: location.pathname,
        engagement_time_msec: Date.now() - startedAt,
      },
      base,
      params || {}
    );
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, payload);
    }
    mirrorClarity(eventName, params);
    mirrorJourney(eventName, params);
    try {
      window.dispatchEvent(new CustomEvent("lo:blog_analytics", { detail: { event: eventName, payload: payload } }));
    } catch (e) {}
  }

  function scrollPercent() {
    var doc = document.documentElement;
    var scrollTop = window.scrollY || doc.scrollTop || 0;
    var viewH = window.innerHeight || doc.clientHeight || 0;
    var fullH = Math.max(doc.scrollHeight, doc.offsetHeight, 1);
    return Math.min(100, Math.round(((scrollTop + viewH) / fullH) * 100));
  }

  function onScroll() {
    var pct = scrollPercent();
    SCROLL_THRESHOLDS.forEach(function (threshold) {
      if (pct >= threshold && !scrollFired[threshold]) {
        scrollFired[threshold] = true;
        track("blog_scroll_depth", {
          percent_scrolled: threshold,
          scroll_depth_threshold: threshold,
        });
        if (threshold === 100) {
          track("blog_read_complete", { read_complete: true });
        }
      }
    });
  }

  function observeSections() {
    if (!window.IntersectionObserver) return;
    var targets = [
      { sel: ".article-header", name: "intro" },
      { sel: ".article-bridge--mid", name: "bridge_mid" },
      { sel: ".article-bridge--footer", name: "bridge_footer" },
      { sel: ".article-faq", name: "faq" },
      { sel: ".article-links", name: "related_links" },
      { sel: ".blog-hero", name: "blog_index_hero" },
    ];
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.4) return;
          var name = entry.target.getAttribute("data-blog-section-name");
          if (!name || sectionsFired[name]) return;
          sectionsFired[name] = true;
          track("blog_section_view", {
            section_name: name,
            section_visible_ratio: Math.round(entry.intersectionRatio * 100),
          });
        });
      },
      { threshold: [0.4, 0.7] }
    );
    targets.forEach(function (t) {
      var el = document.querySelector(t.sel);
      if (!el) return;
      el.setAttribute("data-blog-section-name", t.name);
      io.observe(el);
    });
  }

  function bindClicks() {
    document.addEventListener(
      "click",
      function (ev) {
        var card = ev.target.closest(".blog-card");
        if (card) {
          track("blog_card_click", {
            link_url: card.href || "",
            link_text: (card.querySelector("h2") && card.querySelector("h2").textContent) || "",
            card_tag: (card.querySelector(".blog-card-tag") && card.querySelector(".blog-card-tag").textContent) || "",
          });
          return;
        }

        var link = ev.target.closest("a");
        if (!link) return;
        var inArticle = link.closest(".article-body");
        var inFooter = link.closest(".blog-footer");
        if (!inArticle && !inFooter) return;

        var bridge = link.closest(".article-bridge");
        var isCta = link.classList.contains("btn");
        var zone = bridge
          ? bridge.classList.contains("article-bridge--mid")
            ? "bridge_mid"
            : "bridge_footer"
          : inFooter
            ? "page_footer"
            : "article_body";

        track(isCta ? "blog_cta_click" : "blog_link_click", {
          link_url: link.href || "",
          link_text: String(link.textContent || "").trim().slice(0, 120),
          link_zone: zone,
          need: (bridge && bridge.getAttribute("data-need")) || "",
          is_outbound: link.hostname && link.hostname !== location.hostname,
        });
      },
      true
    );
  }

  function bindFaq() {
    document.querySelectorAll(".article-faq details").forEach(function (detail) {
      detail.addEventListener("toggle", function () {
        if (!detail.open) return;
        var summary = detail.querySelector("summary");
        track("blog_faq_open", {
          faq_question: summary ? String(summary.textContent || "").trim().slice(0, 200) : "",
        });
      });
    });
  }

  function sendEngagement() {
    if (engagementSent) return;
    engagementSent = true;
    var maxScroll = 0;
    Object.keys(scrollFired).forEach(function (k) {
      var n = Number(k);
      if (n > maxScroll) maxScroll = n;
    });
    track("blog_engagement", {
      time_on_page_sec: Math.round((Date.now() - startedAt) / 1000),
      max_scroll_percent: maxScroll,
    });
  }

  function init() {
    if (!location.pathname || location.pathname.indexOf("/blog") === -1) return;
    track("blog_article_view", { entry: true });
    bindClicks();
    bindFaq();
    observeSections();
    window.addEventListener("scroll", throttle(onScroll, 250), { passive: true });
    onScroll();
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") sendEngagement();
    });
    window.addEventListener("pagehide", sendEngagement);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
