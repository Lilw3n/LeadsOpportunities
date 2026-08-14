/**
 * Questionnaire universel : hub de selection ou wizard selon ?need=
 */
(function () {
  function qs(id) {
    return document.getElementById(id);
  }

  function renderHub(catalog, meta) {
    var filtersEl = qs("hubFilters");
    var gridEl = qs("hubGrid");
    if (!filtersEl || !gridEl) return;

    var activeCat = "all";
    var categories = catalog.CATEGORIES;
    var servicesMeta = (meta && meta.services) || {};
    var featured = (meta && meta.featured) || [];

    function renderFilters() {
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
          renderGrid();
        });
      });
    }

    function renderGrid() {
      var items = Object.keys(catalog.SERVICES).map(function (need) {
        var svc = catalog.SERVICES[need];
        var m = servicesMeta[need] || {};
        return {
          need: need,
          label: svc.label,
          category: svc.category,
          icon: m.icon || "📋",
          teaser: m.teaser || "Questionnaire adapte et devis gratuit.",
          featured: featured.indexOf(need) >= 0,
        };
      });
      items.sort(function (a, b) {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return a.label.localeCompare(b.label, "fr");
      });
      var filtered =
        activeCat === "all" ? items : items.filter(function (i) { return i.category === activeCat; });

      gridEl.innerHTML = filtered
        .map(function (item) {
          var rapide = catalog.getRapideUrl(item.need, { fromLandingsFolder: true });
          var complet = catalog.getCompletUrl(item.need, { fromLandingsFolder: true });
          return (
            '<article class="assurance-card">' +
            '<span class="assurance-card-icon" aria-hidden="true">' +
            item.icon +
            "</span>" +
            "<h2>" +
            item.label +
            "</h2>" +
            "<p>" +
            item.teaser +
            "</p>" +
            '<div class="assurance-card-actions">' +
            '<div class="assurance-card-actions-primary">' +
            '<a class="btn btn-primary btn-sm" href="' +
            rapide +
            '">Rapide</a>' +
            '<a class="btn btn-outline btn-sm" href="' +
            complet +
            '">Complet</a>' +
            "</div></div></article>"
          );
        })
        .join("");
    }

    renderFilters();
    renderGrid();
  }

  function applyServiceToUi(service, catalog) {
    var cat = catalog.CATEGORIES[service.category] || { label: "Assurance" };
    document.title = "Questionnaire " + service.label + " | Leads Opportunities";

    var badge = qs("devisBadge");
    if (badge) badge.textContent = cat.label;

    var title = qs("devisTitle");
    if (title) title.textContent = "Questionnaire : " + service.label;

    var subtitle = qs("devisSubtitle");
    if (subtitle) {
      subtitle.textContent =
        "Parcours " +
        cat.label.toLowerCase() +
        " — reponses detaillees pour preparer votre comparatif et votre rappel conseiller.";
    }

    var formTitle = qs("formTitle");
    if (formTitle) formTitle.textContent = service.label;

    var formLead = qs("formLead");
    if (formLead) {
      formLead.textContent =
        "Service : " +
        service.label +
        ". Environ 4 a 6 minutes — coordonnees, contexte metier, budget puis validation.";
    }

    var catLabel = document.getElementById("wizardCategoryLabel");
    if (catLabel) catLabel.textContent = cat.label;

    var needField = qs("needField");
    var labelField = qs("serviceLabelField");
    var catField = qs("serviceCategoryField");
    if (needField) needField.value = service.need;
    if (labelField) labelField.value = service.label;
    if (catField) catField.value = service.category;

    var form = document.getElementById("devisForm");
    if (form) {
      form.dataset.vertical = service.vertical || service.need;
      form.dataset.serviceNeed = service.need;
    }

    var changeLink = qs("changeProductLink");
    if (changeLink) changeLink.href = "./questionnaire.html";
  }

  function mountWizard(service) {
    var mount = qs("wizardStepsMount");
    var stepsBuilder = window.DEVIS_STEPS;
    if (!mount || !stepsBuilder) return;
    mount.innerHTML = stepsBuilder.buildWizardHtml(service, { includePicker: false });
    var form = qs("devisForm");
    if (form && window.DevisDocumentUpload && window.DevisDocumentUpload.mountInForm) {
      window.DevisDocumentUpload.mountInForm(form, service.need);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var catalog = window.SERVICE_CATALOG;
    var stepsBuilder = window.DEVIS_STEPS;
    if (!catalog || !stepsBuilder) return;

    var params = new URLSearchParams(window.location.search);
    var need = (params.get("need") || "").trim();
    var forceStandard = params.get("journey") === "standard" || params.get("wizard") === "1";
    var hub = qs("questionnaireHub");
    var wizard = qs("questionnaireWizard");

    /* Immobilier public : vitrine + dépôt vendeur (pas un devis assurance). */
    if (
      (need === "acheteur-immo" || need === "vendeur-immo" || need === "acheteur-vendeur-immo") &&
      params.get("wizard") !== "1"
    ) {
      var dest = new URL("./acheteur-immo.html", window.location.href);
      params.forEach(function (v, k) {
        if (k !== "need") dest.searchParams.set(k, v);
      });
      if (need === "vendeur-immo" && !dest.searchParams.get("role")) dest.searchParams.set("role", "vendeur");
      if (need === "acheteur-vendeur-immo" && !dest.searchParams.get("role")) dest.searchParams.set("role", "les_deux");
      window.location.replace(dest.pathname + dest.search + dest.hash);
      return;
    }

    if (!need) {
      if (hub) hub.hidden = false;
      if (wizard) wizard.hidden = true;
      fetch("../data/assurances-hub-meta.json")
        .then(function (r) {
          return r.json();
        })
        .catch(function () {
          return { services: {}, featured: [] };
        })
        .then(function (meta) {
          renderHub(catalog, meta);
        });
      return;
    }

    var service = catalog.getService(need) || catalog.getService("autre");

    var onUniversalQuestionnaire = /questionnaire\.html$/i.test(
      (window.location.pathname || "").split("/").pop() || ""
    );
    if (
      !forceStandard &&
      !onUniversalQuestionnaire &&
      service.landing &&
      service.landing.indexOf("devis.html") === -1 &&
      service.landing.indexOf("questionnaire.html") === -1
    ) {
      var dest = service.landing.replace(/^\.\/landings\//, "./");
      var q = window.location.search || "";
      if (q.indexOf("journey=") === -1) {
        q += (q ? "&" : "?") + "journey=standard";
      }
      window.location.replace(dest + q);
      return;
    }

    if (hub) hub.hidden = true;
    if (wizard) wizard.hidden = false;

    applyServiceToUi(service, catalog);
    mountWizard(service);

    if (window.LANDING_SEO && window.LANDING_SEO.applyForService) {
      window.LANDING_SEO.applyForService(service);
    }
  });
})();
