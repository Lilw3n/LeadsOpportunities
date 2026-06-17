import Clarity from "@microsoft/clarity";

var CONSENT_KEY = "lo_cookie_consent_v1";
var booted = false;

function getProjectId() {
  var cfg = typeof window !== "undefined" && window.GOOGLE_TRACKING ? window.GOOGLE_TRACKING : {};
  var id = cfg.clarityProjectId || "x7yqp46fj9";
  if (!id || String(id).indexOf("XXXX") !== -1) return null;
  return String(id);
}

function consentLevel() {
  try {
    return localStorage.getItem(CONSENT_KEY) || "";
  } catch (e) {
    return "";
  }
}

function analyticsAllowed() {
  var level = consentLevel();
  var needsConsent =
    location.pathname.indexOf("/landings/") !== -1 ||
    location.pathname === "/" ||
    location.pathname === "/index.html";
  if (!needsConsent) return true;
  if (level === "essential") return false;
  if (level === "all") return true;
  // Avant choix banniere : actif comme le snippet Microsoft par defaut.
  return true;
}

function applyConsent(granted) {
  if (!window.loClarity) return;
  try {
    if (granted) {
      window.loClarity.consentV2({ ad_Storage: "granted", analytics_Storage: "granted" });
    } else {
      window.loClarity.consentV2({ ad_Storage: "denied", analytics_Storage: "denied" });
    }
  } catch (e) {}
}

function utmTags() {
  var params = new URLSearchParams(location.search);
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "need"].forEach(function (key) {
    var val = params.get(key);
    if (val) Clarity.setTag(key, val);
  });
}

function articleSlug() {
  var m = location.pathname.match(/\/blog\/([^/]+?)(?:\.html)?\/?$/);
  if (m) return m[1];
  if (location.pathname.indexOf("/blog") !== -1 && location.pathname.indexOf(".html") === -1) {
    return "index";
  }
  return "";
}

function tagPageContext() {
  if (location.pathname.indexOf("/blog") !== -1) {
    var slug = articleSlug();
    Clarity.setTag("site_section", "blog");
    if (slug) Clarity.setTag("article_slug", slug);
    var body = document.body;
    if (body) {
      var section = body.getAttribute("data-blog-section");
      var tag = body.getAttribute("data-blog-tag");
      var pageType = body.getAttribute("data-blog-page");
      if (section) Clarity.setTag("article_niche", section);
      if (tag) Clarity.setTag("article_tag", tag);
      if (pageType) Clarity.setTag("blog_page_type", pageType);
    }
  } else if (location.pathname.indexOf("/landings/") !== -1) {
    Clarity.setTag("site_section", "landing");
    Clarity.setTag("landing_path", location.pathname);
  }
  utmTags();
}

function bootClarity() {
  if (booted) return;
  var projectId = getProjectId();
  if (!projectId) return;

  // Charge toujours le tag clarity.ms (comme le snippet Microsoft officiel).
  Clarity.init(projectId);
  window.loClarity = Clarity;
  booted = true;
}

function syncConsentAndTags() {
  if (!booted) return;
  var granted = analyticsAllowed();
  applyConsent(granted);
  if (granted) tagPageContext();
}

function bindListeners() {
  window.addEventListener("lo:cookie-consent", function (ev) {
    var level = ev && ev.detail ? ev.detail.level : "";
    bootClarity();
    if (level === "all") {
      syncConsentAndTags();
    } else if (level === "essential") {
      applyConsent(false);
    }
  });

  window.addEventListener("lo:wizard_step", function (ev) {
    if (!window.loClarity || !ev || !ev.detail) return;
    var d = ev.detail;
    try {
      window.loClarity.setTag("wizard_step", String(d.step || ""));
      if (d.stepName) window.loClarity.setTag("wizard_step_name", d.stepName);
      if (d.vertical) window.loClarity.setTag("vertical", d.vertical);
      window.loClarity.event("wizard_step_" + (d.step || "0"));
      if (Number(d.step) >= 3) window.loClarity.upgrade("wizard_deep");
    } catch (e) {}
  });

  window.addEventListener("lo:blog_analytics", function (ev) {
    if (!window.loClarity || !ev || !ev.detail) return;
    var name = ev.detail.event;
    var p = ev.detail.payload || {};
    try {
      if (name === "blog_cta_click") {
        window.loClarity.event("blog_cta_click");
        if (p.link_text) window.loClarity.setTag("last_cta", p.link_text);
        window.loClarity.upgrade("blog_cta");
      } else if (name === "blog_scroll_depth" && p.percent_scrolled >= 75) {
        window.loClarity.event("blog_scroll_" + p.percent_scrolled);
      }
    } catch (e) {}
  });

  window.addEventListener("lo:lead-sent", function () {
    if (!window.loClarity) return;
    try {
      window.loClarity.event("lead_submitted");
      window.loClarity.upgrade("lead_submitted");
    } catch (e) {}
  });
}

bootClarity();
syncConsentAndTags();
bindListeners();
