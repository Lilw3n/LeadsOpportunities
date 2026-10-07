/**
 * Focus acquisition intelligent — rotation 4 semaines (1 vertical / semaine).
 * Met en avant le parcours de la semaine sur la home et les CTA.
 */
(function () {
  var CACHE_KEY = "lo_acquisition_focus_v1";
  var CACHE_TTL_MS = 30 * 60 * 1000;

  function readCache() {
    try {
      var raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.at || Date.now() - parsed.at > CACHE_TTL_MS) return null;
      return parsed.data;
    } catch (e) {
      return null;
    }
  }

  function writeCache(data) {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data: data }));
    } catch (e) {
      /* ignore */
    }
  }

  function fetchFocus() {
    var cached = readCache();
    if (cached) return Promise.resolve(cached);
    return fetch("/api/acquisition-focus")
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (data && data.ok) writeCache(data);
        return data;
      })
      .catch(function () {
        return fetch("/data/meta-campaign-rotation-active.json")
          .then(function (r) {
            return r.json();
          })
          .then(function (state) {
            if (!state || !state.active_slot) return null;
            var slot = state.active_slot;
            var focus = slot.site_focus || {};
            return {
              ok: true,
              vertical: slot.vertical,
              label: focus.label,
              hero_title: focus.heroTitle,
              hero_subtitle: focus.heroSubtitle,
              cta: focus.cta,
              landing_path: focus.landing || slot.landing_path,
              landing_url: focus.landing_url || slot.landing_url,
              badge: "Focus semaine " + (slot.week || ""),
              schedule: state.schedule,
            };
          })
          .catch(function () {
            return null;
          });
      });
  }

  function applyHero(focus) {
    if (!focus || !focus.ok) return;

    var heroSub = document.querySelector(".hero-sub");
    if (heroSub && focus.hero_subtitle) {
      heroSub.textContent = focus.hero_subtitle;
    }

    var banner = document.getElementById("acqFocusBanner");
    if (banner) {
      banner.hidden = false;
      var titleEl = banner.querySelector("[data-acq-focus-title]");
      var linkEl = banner.querySelector("[data-acq-focus-link]");
      if (titleEl) titleEl.textContent = focus.hero_title || focus.label || "";
      if (linkEl) {
        linkEl.href = focus.landing_path || focus.landing_url || "#contact";
        linkEl.textContent = focus.cta || "Devis express";
      }
    }

    var cards = document.querySelectorAll(".hero-floating-card");
    cards.forEach(function (card) {
      card.classList.remove("hero-floating-card--focus");
    });

    var landing = focus.landing_path || "";
    cards.forEach(function (card) {
      var href = card.getAttribute("href") || "";
      if (landing && (href.indexOf(landing.split("?")[0]) >= 0 || landing.indexOf(href.split("?")[0]) >= 0)) {
        card.classList.add("hero-floating-card--focus");
        var stack = card.parentElement;
        if (stack && stack.firstElementChild !== card) {
          stack.insertBefore(card, stack.firstElementChild);
        }
        var badge = card.querySelector(".acq-focus-badge");
        if (!badge) {
          badge = document.createElement("span");
          badge.className = "acq-focus-badge";
          badge.textContent = focus.badge || "Focus semaine";
          card.insertBefore(badge, card.firstChild);
        }
      }
    });

    var mobileCta = document.querySelector(".mobile-cta-primary");
    if (mobileCta && focus.landing_path) {
      mobileCta.setAttribute("href", focus.landing_path);
      if (focus.cta) mobileCta.lastChild && (mobileCta.textContent = focus.cta);
    }

    if (window.loClarity && window.loClarity.setTag) {
      window.loClarity.setTag("acq_focus_vertical", focus.vertical || "");
      window.loClarity.setTag("acq_focus_week", String(focus.cycle_week || focus.week || ""));
    }
  }

  function init() {
    fetchFocus().then(applyHero);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.loAcquisitionFocus = { refresh: init, fetch: fetchFocus };
})();
