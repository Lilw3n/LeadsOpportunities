/**
 * Clarity — identification des clics et diagnostics UX (site entier).
 * Tags filtrables dans le dashboard + événements rage_click / dead_click.
 */

function clarityApi() {
  if (window.loClarity) return window.loClarity;
  return {
    setTag: function (k, v) {
      window.clarity("set", k, v);
    },
    event: function (e) {
      window.clarity("event", e);
    },
    upgrade: function (r) {
      window.clarity("upgrade", r);
    },
  };
}

function pageSection() {
  var p = location.pathname || "/";
  if (p.indexOf("/blog") !== -1) return "blog";
  if (p.indexOf("/landings/") !== -1) return "landing";
  if (p === "/" || p === "/index.html") return "home";
  if (
    p.indexOf("/assurance") !== -1 ||
    p.indexOf("/credit-immo") !== -1 ||
    p.indexOf("/france/") !== -1 ||
    document.body.classList.contains("seo-page")
  ) {
    return "seo";
  }
  return "other";
}

function normalizeText(s) {
  return String(s || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}

function clickLabel(el) {
  if (!el || !el.getAttribute) return "unknown";
  var explicit = el.getAttribute("data-clarity-label");
  if (explicit) return normalizeText(explicit);
  var aria = el.getAttribute("aria-label");
  if (aria) return normalizeText(aria);
  var named = el.getAttribute("name");
  if (named && el.tagName === "INPUT") return normalizeText(named);
  var text = normalizeText(el.textContent);
  if (text) return text;
  var href = el.getAttribute("href");
  if (href) return href.slice(0, 100);
  return (el.tagName || "element").toLowerCase();
}

function clickZone(el) {
  var marked = el.closest("[data-clarity-zone]");
  if (marked) return marked.getAttribute("data-clarity-zone");

  var idBlock = el.closest("[id]");
  if (idBlock) {
    var id = idBlock.getAttribute("id");
    if (id && id !== "top") return id;
  }

  var rules = [
    ["header, .topbar, .blog-topbar, .seo-topbar", "header"],
    ["nav, .nav, .mobile-menu", "navigation"],
    [".hero-section, .hero, .seo-hero, .blog-hero", "hero"],
    ["#contact, .section-contact", "contact_form"],
    ["form, .wizard, .questionnaire", "form"],
    [".article-bridge", "article_cta"],
    [".blog-card", "blog_card"],
    ["footer, .blog-footer", "footer"],
    [".mobile-cta", "mobile_cta"],
    ["#services, #tous-nos-services", "services"],
    ["#france", "france_coverage"],
    ["#guides-seo", "guides_seo"],
  ];

  for (var i = 0; i < rules.length; i++) {
    if (el.closest(rules[i][0])) return rules[i][1];
  }
  return "content";
}

function resolveClickTarget(target) {
  var el =
    target.closest(
      "a[href], button, input, select, textarea, summary, label, [role='button'], [data-clarity-label], .btn, .blog-card, .hero-floating-card"
    ) || target;
  return el;
}

function clickType(el) {
  if (el.matches('a[href^="tel:"]') || el.closest('a[href^="tel:"]')) return "phone";
  if (el.matches('a[href^="mailto:"]') || el.closest('a[href^="mailto:"]')) return "email";
  if (el.matches('button, [role="button"], input[type="submit"], input[type="button"], .btn')) return "button";
  if (el.matches("a[href]") || el.closest("a[href]")) return "link";
  if (el.matches("summary") || el.closest("details")) return "faq";
  if (el.matches("input, select, textarea") || el.closest("form")) return "form_field";
  return "other";
}

function isActionable(el) {
  return !!el.closest(
    "a[href], button, input, select, textarea, summary, label, [role='button'], [onclick], [data-clarity-label], .btn"
  );
}

function safeEventName(s) {
  return String(s || "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 48);
}

export function bindClickDiagnostics() {
  var rageMap = {};

  function trackClick(target) {
    if (!window.clarity && !window.loClarity) return;

    var el = resolveClickTarget(target);
    var C = clarityApi();
    var label = clickLabel(el);
    var zone = clickZone(el);
    var type = clickType(el);
    var section = pageSection();
    var linkEl = el.matches("a[href]") ? el : el.closest("a[href]");
    var href = linkEl ? linkEl.getAttribute("href") || "" : "";

    try {
      C.setTag("page_section", section);
      C.setTag("last_click_zone", zone);
      C.setTag("last_click_label", label);
      C.setTag("last_click_type", type);
      if (href) C.setTag("last_click_url", href.slice(0, 120));

      C.event("click_" + type);
      C.event("click_zone_" + safeEventName(zone));

      var isCta =
        type === "button" ||
        el.classList.contains("btn") ||
        zone === "contact_form" ||
        zone === "article_cta" ||
        zone === "mobile_cta" ||
        zone === "hero";

      if (isCta) {
        C.event("click_cta");
        C.upgrade("priority_click");
      }

      if (zone === "contact_form" || zone === "form") {
        C.upgrade("form_interaction");
      }

      if (!isActionable(el)) {
        C.event("dead_click");
        C.setTag("dead_click_zone", zone);
        C.setTag("dead_click_label", label);
        C.upgrade("dead_click");
      }

      var rageKey = zone + "|" + label;
      var now = Date.now();
      if (!rageMap[rageKey]) rageMap[rageKey] = [];
      rageMap[rageKey] = rageMap[rageKey].filter(function (t) {
        return now - t < 900;
      });
      rageMap[rageKey].push(now);
      if (rageMap[rageKey].length >= 3) {
        C.event("rage_click");
        C.setTag("rage_click_zone", zone);
        C.setTag("rage_click_label", label);
        C.upgrade("rage_click");
        rageMap[rageKey] = [];
      }
    } catch (e) {}
  }

  document.addEventListener(
    "click",
    function (ev) {
      trackClick(ev.target);
    },
    true
  );
}
