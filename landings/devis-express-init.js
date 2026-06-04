/**
 * Initialise devis-express.html selon ?need=
 */
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var catalog = window.SERVICE_CATALOG;
    var expressCfg = window.DEVIS_EXPRESS_CONFIG;
    if (!catalog) return;

    var params = new URLSearchParams(window.location.search);
    var need = (params.get("need") || "autre").trim().toLowerCase();
    var service = catalog.getService(need) || catalog.getService("autre");

    var dedicatedRapide = catalog.RAPIDE_LANDINGS && catalog.RAPIDE_LANDINGS[need];
    if (dedicatedRapide && dedicatedRapide.indexOf("devis-express") === -1) {
      var dest = dedicatedRapide.replace(/^\.\/landings\//, "./");
      var q = window.location.search || "";
      window.location.replace(dest + (q.indexOf("need=") >= 0 ? "" : q));
      return;
    }

    var needField = document.getElementById("expressNeed");
    var labelField = document.getElementById("expressServiceLabel");
    var catField = document.getElementById("expressServiceCategory");
    if (needField) needField.value = service.need;
    if (labelField) labelField.value = service.label;
    if (catField) catField.value = service.category;

    document.title = "Devis express " + service.label + " | Leads Opportunities";
    var title = document.getElementById("expressTitle");
    if (title) title.textContent = "Devis express : " + service.label;
    var sub = document.getElementById("expressSubtitle");
    if (sub) {
      sub.textContent =
        "Parcours rapide — champs essentiels pour " +
        service.label.toLowerCase() +
        ". Un conseiller affine le comparatif au telephone.";
    }
    var badge = document.getElementById("expressBadge");
    if (badge && catalog.CATEGORIES[service.category]) {
      badge.textContent = catalog.CATEGORIES[service.category].label;
    }

    var mount = document.getElementById("expressFieldsMount");
    if (mount && expressCfg && expressCfg.fieldsHtmlForService) {
      mount.innerHTML = expressCfg.fieldsHtmlForService(service);
    }

    var completUrl = catalog.getCompletUrl(service.need, { fromLandingsFolder: true });
    var rapideUrl = catalog.getRapideUrl(service.need, { fromLandingsFolder: true });
    var toggle = document.getElementById("expressJourneyToggle");
    var rapideLink = document.getElementById("expressRapideLink");
    var completLink = document.getElementById("expressCompletLink");
    if (toggle && rapideLink && completLink) {
      toggle.hidden = false;
      rapideLink.href = rapideUrl;
      completLink.href = completUrl;
    }
    var hint = document.getElementById("expressCompletHint");
    if (hint) {
      hint.innerHTML =
        'Besoin du detail (questionnaire complet) ? <a href="' +
        completUrl +
        '">Parcours complet — ' +
        service.label +
        "</a>";
    }

    var form = document.getElementById("expressForm");
    if (form) {
      form.dataset.vertical = service.vertical || service.need;
      form.dataset.serviceNeed = service.need;
    }

    if (window.LANDING_SEO && window.LANDING_SEO.applyForService) {
      window.LANDING_SEO.applyForService(service);
    }
    if (window.QuoteIntelligence && form) {
      window.QuoteIntelligence.setJourney("quick");
      window.QuoteIntelligence.bindAbandon(form);
    }
  });
})();
