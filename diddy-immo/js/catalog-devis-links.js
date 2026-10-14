/**
 * Met a jour les liens « Demander un devis » du catalogue services.
 */
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var catalog = window.SERVICE_CATALOG;
    if (!catalog) return;

    document.querySelectorAll("a.catalog-link").forEach(function (link) {
      var href = link.getAttribute("href") || "";
      var match = href.match(/[?&]need=([^#&]+)/);
      if (!match) return;
      var need = decodeURIComponent(match[1]);
      link.setAttribute("href", catalog.getDevisUrl(need, { fromServicesPage: true }));
    });
  });
})();
