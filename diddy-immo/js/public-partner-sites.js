/**
 * Montage public : <section data-partner-sites data-layout="home|hub" data-limit="6">
 */
(function () {
  var Lib = window.PartnerSites;
  if (!Lib) return;

  function hostLabel(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch (e) {
      return "Voir le site";
    }
  }

  function cardHtml(site) {
    var manual = !!(site.preview_image_url && String(site.preview_image_url).trim());
    var img = Lib.previewUrl(site, { allowAuto: true, width: 900 });
    var previewInner = img
      ? '<img src="' +
        Lib.esc(img) +
        '" alt="Aperçu ' +
        Lib.esc(site.name) +
        '" loading="lazy" decoding="async" data-partner-preview />'
      : '<div class="partner-site-preview--empty">Aperçu à venir</div>';
    var badge = manual
      ? '<span class="partner-site-badge partner-site-badge--photo">Photo</span>'
      : img
        ? '<span class="partner-site-badge">Aperçu site</span>'
        : "";
    var href = site.url && Lib.isHttpUrl(site.url) ? site.url : "";
    var external = !!href;
    /* Pas de href="#" : Clarity compte ça en dead click (aucune navigation réelle). */
    var openTag = external
      ? '<a class="partner-site-card" href="' +
        Lib.esc(href) +
        '" target="_blank" rel="noopener noreferrer">'
      : '<a class="partner-site-card partner-site-card--hub" href="./sites-partenaires/" title="Voir le catalogue partenaires">';
    var closeTag = "</a>";
    return (
      openTag +
      '<div class="partner-site-preview">' +
      badge +
      previewInner +
      '</div><div class="partner-site-body"><strong>' +
      Lib.esc(site.name) +
      "</strong>" +
      (site.tagline ? '<p class="partner-site-tagline">' + Lib.esc(site.tagline) + "</p>" : "") +
      '<span class="partner-site-meta">' +
      (site.city ? Lib.esc(site.city) + " · " : "") +
      (external ? Lib.esc(hostLabel(site.url)) + " ↗" : "Voir le catalogue →") +
      "</span></div>" +
      closeTag
    );
  }

  function bindImgFallback(root) {
    root.querySelectorAll("[data-partner-preview]").forEach(function (img) {
      img.addEventListener("error", function () {
        var wrap = img.closest(".partner-site-preview");
        if (!wrap) return;
        wrap.innerHTML =
          '<div class="partner-site-preview--empty">Aperçu indisponible — ouvrez le site</div>';
      });
    });
  }

  function render(el, catalog, opts) {
    opts = opts || {};
    var limit = opts.limit > 0 ? opts.limit : 0;
    var layout = opts.layout || "hub";
    var blocks = Lib.sitesByCategory(catalog, true);
    if (limit) {
      var left = limit;
      blocks = blocks
        .map(function (b) {
          var slice = b.sites.slice(0, left);
          left -= slice.length;
          return { category: b.category, sites: slice };
        })
        .filter(function (b) {
          return b.sites.length;
        });
    }

    var filters =
      layout === "hub" && blocks.length > 1
        ? '<div class="partner-sites-filters" role="tablist">' +
          '<button type="button" class="partner-sites-filter is-active" data-cat="all">Tous</button>' +
          blocks
            .map(function (b) {
              return (
                '<button type="button" class="partner-sites-filter" data-cat="' +
                Lib.esc(b.category.id) +
                '">' +
                (b.category.icon ? b.category.icon + " " : "") +
                Lib.esc(b.category.label) +
                "</button>"
              );
            })
            .join("") +
          "</div>"
        : "";

    var body = blocks.length
      ? blocks
          .map(function (b) {
            return (
              '<div class="partner-sites-cat" data-cat-block="' +
              Lib.esc(b.category.id) +
              '"><h3 class="partner-sites-cat-title">' +
              (b.category.icon ? b.category.icon + " " : "") +
              Lib.esc(b.category.label) +
              '</h3><div class="partner-sites-grid">' +
              b.sites.map(cardHtml).join("") +
              "</div></div>"
            );
          })
          .join("")
      : '<p class="partner-sites-empty">Aucun site partenaire pour le moment.</p>';

    var foot =
      layout === "home"
        ? '<div class="partner-sites-foot"><a class="btn btn-ghost" href="./sites-partenaires/">Voir tous les sites partenaires</a></div>'
        : "";

    el.classList.add("partner-sites-mounted");
    el.innerHTML =
      '<div class="partner-sites-inner"><header class="partner-sites-head">' +
      '<p class="partner-sites-eyebrow">Réseau local</p><h2>' +
      Lib.esc(catalog.title || "Sites partenaires") +
      "</h2>" +
      (catalog.lead ? '<p class="partner-sites-lead">' + Lib.esc(catalog.lead) + "</p>" : "") +
      "</header>" +
      filters +
      body +
      foot +
      "</div>";

    bindImgFallback(el);
    el.querySelectorAll(".partner-sites-filter").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cat = btn.getAttribute("data-cat") || "all";
        el.querySelectorAll(".partner-sites-filter").forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
        });
        el.querySelectorAll("[data-cat-block]").forEach(function (block) {
          var id = block.getAttribute("data-cat-block");
          block.hidden = cat !== "all" && id !== cat;
        });
      });
    });
  }

  function mount(el) {
    if (!el || el.dataset.partnerSitesBound) return;
    el.dataset.partnerSitesBound = "1";
    var layout = el.getAttribute("data-layout") || "hub";
    var limit = Number(el.getAttribute("data-limit") || 0) || 0;
    var preferLocal = /[?&]preview=1(?:&|$)/.test(location.search);
    Lib.fetchCatalog({
      preferLocal: preferLocal,
      apiUrl: Lib.API_URL || "/api/partner-sites",
      dataUrl: el.getAttribute("data-src") || Lib.DATA_URL,
    }).then(function (catalog) {
      render(el, catalog, { layout: layout, limit: limit });
    });
  }

  function boot() {
    document.querySelectorAll("[data-partner-sites]").forEach(mount);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  window.PartnerSitesPublic = { mount: mount, boot: boot };
})();
