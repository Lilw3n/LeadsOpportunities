/**
 * Catalogue public — toutes les assurances et financements.
 */
(function () {
  var grid = document.getElementById("assurancesGrid");
  var filtersEl = document.getElementById("assurancesFilters");
  if (!grid || !window.SERVICE_CATALOG) return;

  var activeCat = "all";

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

  function renderGrid(meta) {
    window.__assurancesMeta = meta;
    var featured = meta.featured || [];
    var servicesMeta = meta.services || {};
    var catalog = window.SERVICE_CATALOG;
    var items = Object.keys(catalog.SERVICES).map(function (need) {
      var svc = catalog.SERVICES[need];
      var m = servicesMeta[need] || {};
      return {
        need: need,
        label: svc.label,
        category: svc.category,
        devisUrl: catalog.getDevisUrl(need),
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
          '<div class="assurance-card-actions">' +
          '<a class="btn btn-primary btn-sm" href="' +
          item.devisUrl.replace(/^\.\//, "../") +
          '">Devis</a>' +
          (item.need === "animaux"
            ? '<a class="btn btn-soft btn-sm" href="../landings/animaux-express.html">Rapide</a>' +
              '<a class="btn btn-soft btn-sm" href="../landings/animaux.html">Complet</a>'
            : "") +
          (item.seoUrl
            ? '<a class="btn btn-outline btn-sm" href="' + item.seoUrl + '">Guide</a>'
            : "") +
          (item.blogUrl
            ? '<a class="btn btn-soft btn-sm" href="' + item.blogUrl + '">Article</a>'
            : "") +
          "</div></article>"
        );
      })
      .join("");
  }

  loadMeta().then(function (meta) {
    renderFilters(window.SERVICE_CATALOG.CATEGORIES);
    renderGrid(meta);
  });
})();
