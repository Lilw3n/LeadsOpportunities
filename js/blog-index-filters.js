/**
 * Filtres par thème sur blog/index.html — sélection multiple (OU logique).
 */
(function () {
  if (document.body.getAttribute("data-blog-page") !== "index") return;

  var grid = document.getElementById("blog-grid");
  var filterRoot = document.querySelector(".blog-filters");
  var countEl = document.getElementById("blog-filter-count");
  var emptyEl = document.getElementById("blog-filter-empty");
  if (!grid || !filterRoot) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll(".blog-card"));
  var active = new Set();

  function readUrlThemes() {
    var params = new URLSearchParams(window.location.search);
    var raw = params.get("theme") || params.get("themes") || "";
    if (!raw) return [];
    return raw.split(",").map(function (s) {
      return s.trim();
    }).filter(Boolean);
  }

  function syncUrl() {
    var url = new URL(window.location.href);
    if (active.size === 0) {
      url.searchParams.delete("theme");
    } else {
      url.searchParams.set("theme", Array.from(active).join(","));
    }
    history.replaceState(null, "", url.pathname + url.search + url.hash);
  }

  function syncChipStates() {
    filterRoot.querySelectorAll(".blog-filter-chip").forEach(function (btn) {
      var id = btn.getAttribute("data-theme");
      var on = id === "all" ? active.size === 0 : active.has(id);
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function applyFilter() {
    var visible = 0;
    cards.forEach(function (card) {
      var themes = (card.getAttribute("data-themes") || "").split(",");
      var show =
        active.size === 0 ||
        Array.from(active).some(function (t) {
          return themes.indexOf(t) !== -1;
        });
      card.hidden = !show;
      card.classList.toggle("is-filtered-out", !show);
      if (show) visible += 1;
    });

    if (countEl) {
      countEl.textContent =
        active.size === 0
          ? cards.length + " articles"
          : visible + " article" + (visible > 1 ? "s" : "") + " sur " + cards.length;
    }
    if (emptyEl) emptyEl.hidden = visible > 0;
    syncChipStates();
    syncUrl();
  }

  function toggleTheme(id) {
    if (id === "all") {
      active.clear();
    } else if (active.has(id)) {
      active.delete(id);
    } else {
      active.add(id);
    }
    applyFilter();
  }

  filterRoot.addEventListener("click", function (e) {
    var btn = e.target.closest(".blog-filter-chip");
    if (!btn) return;
    e.preventDefault();
    toggleTheme(btn.getAttribute("data-theme"));
  });

  if (emptyEl) {
    emptyEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".blog-filter-reset");
      if (!btn) return;
      e.preventDefault();
      toggleTheme("all");
    });
  }

  grid.addEventListener("click", function (e) {
    var chip = e.target.closest(".blog-theme-chip");
    if (!chip) return;
    e.preventDefault();
    e.stopPropagation();
    toggleTheme(chip.getAttribute("data-theme"));
  });

  readUrlThemes().forEach(function (id) {
    active.add(id);
  });
  applyFilter();
})();
