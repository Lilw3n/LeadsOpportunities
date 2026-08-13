/**
 * Sidebar : recherche, groupes repliables, menu mobile.
 */
window.CrmNavUi = {
  init: function (navRoot) {
    if (!navRoot) return;
    this._initSearch(navRoot);
    this._initGroups(navRoot);
    this._initMobile();
  },

  _initSearch: function (navRoot) {
    var input = document.getElementById("crmNavSearch");
    if (!input) return;
    input.addEventListener("input", function () {
      var q = input.value.toLowerCase().trim();
      navRoot.querySelectorAll(".crm-nav-group").forEach(function (g) {
        var visible = 0;
        g.querySelectorAll(".crm-nav-link, .crm-nav-btn, .crm-nav-favorite, .crm-nav-pillar").forEach(function (el) {
          var text = ((el.textContent || "") + " " + (el.getAttribute("data-keywords") || "")).toLowerCase();
          var show = !q || text.indexOf(q) >= 0;
          el.classList.toggle("crm-nav-hidden", !show);
          if (show) visible++;
        });
        g.classList.toggle("crm-nav-group-empty", visible === 0 && !!q);
        if (q && visible > 0) g.classList.remove("crm-nav-group-collapsed");
      });
    });
  },

  _initGroups: function (navRoot) {
    var key = "lo_crm_nav_collapsed";
    var saved = {};
    try {
      saved = JSON.parse(localStorage.getItem(key) || "{}");
    } catch (e) {}
    navRoot.querySelectorAll(".crm-nav-group").forEach(function (g) {
      var id = g.getAttribute("data-group");
      var hasActive = !!g.querySelector(".crm-nav-link.active");
      if (saved[id] && !hasActive) g.classList.add("crm-nav-group-collapsed");
      if (hasActive) g.classList.remove("crm-nav-group-collapsed");
      var btn = g.querySelector(".crm-nav-group-toggle");
      if (btn) btn.setAttribute("aria-expanded", g.classList.contains("crm-nav-group-collapsed") ? "false" : "true");
      if (btn) {
        btn.addEventListener("click", function () {
          g.classList.toggle("crm-nav-group-collapsed");
          btn.setAttribute("aria-expanded", g.classList.contains("crm-nav-group-collapsed") ? "false" : "true");
          saved[id] = g.classList.contains("crm-nav-group-collapsed");
          localStorage.setItem(key, JSON.stringify(saved));
        });
      }
    });
  },

  _initMobile: function () {
    var toggle = document.getElementById("crmNavToggle");
    var sidebar = document.querySelector(".crm-sidebar");
    if (!toggle || !sidebar) return;
    toggle.addEventListener("click", function () {
      document.body.classList.toggle("crm-nav-open");
    });
    document.addEventListener("click", function (e) {
      if (
        document.body.classList.contains("crm-nav-open") &&
        !sidebar.contains(e.target) &&
        e.target !== toggle &&
        !toggle.contains(e.target)
      ) {
        document.body.classList.remove("crm-nav-open");
      }
    });
  },
};
