/**
 * Catalogue public — toutes les assurances et financements.
 */
(function () {
  var grid = document.getElementById("assurancesGrid");
  var filtersEl = document.getElementById("assurancesFilters");
  if (!grid || !window.SERVICE_CATALOG) return;

  var activeCat = "all";
  var catalog = window.SERVICE_CATALOG;
  var pathOpts = { fromAssurancesFolder: true };

  function loadMeta() {
    return fetch("../data/assurances-hub-meta.json")
      .then(function (r) {
        return r.json();
      })
      .catch(function () {
        return { featured: [], services: {} };
      });
  }

  function renderFilters(categories) {
    if (!filtersEl) return;
    var cats = [{ id: "all", label: "Tout" }];
    Object.keys(categories).forEach(function (k) {
      cats.push({ id: k, label: categories[k].label });
    });
    filtersEl.innerHTML = cats
      .map(function (c) {
        return (
          '<button type="button" class="assurances-filter' +
          (c.id === activeCat ? " is-active" : "") +
          '" data-cat="' +
          c.id +
          '">' +
          c.label +
          "</button>"
        );
      })
      .join("");
    filtersEl.querySelectorAll(".assurances-filter").forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeCat = btn.getAttribute("data-cat");
        filtersEl.querySelectorAll(".assurances-filter").forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
        });
        renderGrid(window.__assurancesMeta);
      });
    });
  }

  function renderCardActions(item) {
    var rapide = catalog.getRapideUrl(item.need, pathOpts);
    var complet = catalog.getCompletUrl(item.need, pathOpts);
    var secondary = "";
    if (item.seoUrl) {
      secondary += '<a class="assurance-card-link" href="' + item.seoUrl + '">Guide</a>';
    }
    if (item.blogUrl) {
      secondary += '<a class="assurance-card-link" href="' + item.blogUrl + '">Article</a>';
    }
    return (
      '<div class="assurance-card-actions">' +
      '<div class="assurance-card-actions-primary">' +
      '<a class="btn btn-primary btn-sm" href="' +
      rapide +
      '">Rapide</a>' +
      '<a class="btn btn-outline btn-sm" href="' +
      complet +
      '">Complet</a>' +
      "</div>" +
      (secondary ? '<div class="assurance-card-actions-secondary">' + secondary + "</div>" : "") +
      "</div>"
    );
  }

  function renderGrid(meta) {
    window.__assurancesMeta = meta;
    var featured = meta.featured || [];
    var servicesMeta = meta.services || {};
    var items = Object.keys(catalog.SERVICES).map(function (need) {
      var svc = catalog.SERVICES[need];
      var m = servicesMeta[need] || {};
      return {
        need: need,
        label: svc.label,
        category: svc.category,
        icon: m.icon || "📋",
        teaser: m.teaser || "Devis gratuit et accompagnement courtier ORIAS.",
        seoUrl: m.seoUrl ? ".." + m.seoUrl : null,
        blogUrl: m.blogUrl ? ".." + m.blogUrl : null,
        keywords: m.keywords || [],
        featured: featured.indexOf(need) >= 0,
      };
    });
    items.sort(function (a, b) {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return a.label.localeCompare(b.label, "fr");
    });
    var filtered =
      activeCat === "all" ? items : items.filter(function (i) { return i.category === activeCat; });
    if (!filtered.length) {
      grid.innerHTML = '<p class="assurances-empty">Aucune prestation dans cette categorie.</p>';
      return;
    }
    grid.innerHTML = filtered
      .map(function (item) {
        var kw = (item.keywords || [])
          .slice(0, 3)
          .map(function (k) {
            return '<span class="assurance-kw">' + k + "</span>";
          })
          .join("");
        return (
          '<article class="assurance-card' +
          (item.featured ? " assurance-card--featured" : "") +
          '" data-need="' +
          item.need +
          '">' +
          '<span class="assurance-card-icon" aria-hidden="true">' +
          item.icon +
          "</span>" +
          "<h2>" +
          item.label +
          "</h2>" +
          "<p>" +
          item.teaser +
          "</p>" +
          (kw ? '<div class="assurance-card-kw">' + kw + "</div>" : "") +
          renderCardActions(item) +
          "</article>"
        );
      })
      .join("");
  }

  loadMeta().then(function (meta) {
    renderFilters(catalog.CATEGORIES);
    renderGrid(meta);
  });
})();
