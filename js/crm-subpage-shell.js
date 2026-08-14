/**
 * Coque CRM premium pour toutes les sous-pages.
 */
(function () {
  if (!document.body.classList.contains("crm-subpage")) return;

  function boot() {
    if (!localStorage.getItem("lo_token")) {
      location.href = "./crm.html";
      return;
    }
    buildShell();
  }

  function buildShell() {
    var page = location.pathname.split("/").pop() || "";
    var title = document.title.replace(/\s*\|.*$/i, "").trim();

    var PAGE_META = {
      "crm-acquisition.html": { subtitle: "Leads Google, Meta, TikTok, Instagram, Allo — tri, assignation, archivage" },
      "crm-sources.html": { subtitle: "Attribution UTM — plateforme, campagne, gclid, fbclid, ttclid" },
      "crm-pubs.html": { subtitle: "Liens Ads Manager Meta, Google, TikTok — campagne active et formulaires" },
      "crm-referrals.html": { subtitle: "Codes parrain, leads attribués et récompenses sur paiements Stripe" },
      "crm-meta-inbox.html": { subtitle: "Formulaires instantanés Facebook / Instagram — réponses devis" },
      "crm-private-offer-matching.html": { subtitle: "Matching privé VSP selon profil, source et critères partenaires" },
      "crm-leads-analysis.html": { subtitle: "Pré-analyse IA et qualification des demandes entrantes" },
      "crm-kanban.html": { subtitle: "Vue pipeline pour organiser les opportunités" },
      "crm-quote-payment.html": { subtitle: "Acompte devis et lien Stripe sécurisé" },
      "crm-bank-details.html": { subtitle: "IBAN clients — accès CRM authentifié" },
      "crm-driver-new.html": { subtitle: "Ajout conducteur rattaché à un contact" },
      "crm-search.html": { subtitle: "Recherche transversale contacts, dossiers et événements" },
      "crm-contact.html": { subtitle: "Fiche contact, contrats, événements et documents" },
      "crm-interlocutors.html": { subtitle: "Interlocuteurs, relations et points de contact" },
      "crm-projects.html": { subtitle: "Projets clients et suivi opérationnel" },
      "crm-documents.html": { subtitle: "Documents clients et pièces de dossiers" },
      "crm-pending-documents.html": { subtitle: "Pièces manquantes à réclamer ou valider" },
      "crm-quotes.html": { subtitle: "Devis en cours, acceptés et à relancer" },
      "crm-quote-new.html": { subtitle: "Création de devis à partir de données vérifiées" },
      "crm-quote-contract-wizard.html": { subtitle: "Transformation guidée du devis en contrat" },
      "crm-contracts.html": { subtitle: "Contrats, avenants et suivi de production" },
      "crm-contract-new.html": { subtitle: "Création de contrat et rattachement dossier" },
      "crm-insurance.html": { subtitle: "Hub assurance : produits, demandes, sinistres et partenaires" },
      "crm-products.html": { subtitle: "Catalogue interne à compléter uniquement avec des données vérifiées" },
      "crm-insurance-requests.html": { subtitle: "Demandes assurance et suivi de traitement" },
      "crm-tariff-grid.html": { subtitle: "Bordereaux et grilles tarifaires internes" },
      "crm-agency-fees.html": { subtitle: "Honoraires vendeur + financement acheteur (prêt / rachat)" },
      "crm-pret-immo.html": { subtitle: "Mes dossiers prêt — RAC, IMMO, simulations · switcher Assurance immo" },
      "crm-pret-immo-sim.html": { subtitle: "Simulateur prêt / RAC (propriétaire, locataire, hébergé)" },
      "crm-pret-immo-pvh.html": { subtitle: "PVH — calculette montant à rembourser (différé total)" },
      "crm-pret-immo-docs.html": { subtitle: "Documentation intelligente grilles + fiches" },
      "crm-pret-immo-grilles.html": { subtitle: "Catalogue grilles de taux partenaires" },
      "crm-pret-immo-fiches.html": { subtitle: "Catalogue fiches produits partenaires" },
      "crm-pret-immo-coord.html": { subtitle: "Transmission de coordonnées / indicateur d’affaires" },
      "crm-assurance-immo.html": { subtitle: "Assurance immobilier — ADE emprunteur & habitation MRH" },
      "crm-patrimoine.html": { subtitle: "Patrimoine — retraite, mutuelle, invalidité, protection famille" },
      "crm-banque-epargne.html": { subtitle: "Banque & épargne — trésorerie pro, précaution, placements" },
      "crm-immo-properties.html": { subtitle: "Piges — filtres RECHERCHE / OÙ / QUI / QUOI / QUAND + actions listing" },
      "crm-immo-suivi.html": { subtitle: "Suivi ventes / locations / offres / sorties de stock" },
      "crm-immo-property.html": { subtitle: "Fiche intelligente — composition, sections conditionnelles, diagnostics, pièces" },
      "crm-immo-matching.html": { subtitle: "Matching intelligent critères acquéreur ↔ biens" },
      "crm-immo-documents.html": { subtitle: "Édition mandats, offres, compromis et pièces immo" },
      "crm-eligibility-rules.html": { subtitle: "Règles d'éligibilité et critères de souscription" },
      "crm-eligibility-test.html": { subtitle: "Test de compatibilité avant proposition" },
      "crm-derogations.html": { subtitle: "Dérogations et cas à valider" },
      "crm-claims.html": { subtitle: "Sinistres, déclarations et suivi dossier" },
      "crm-vehicles.html": { subtitle: "Véhicules assurés, documents et historiques" },
      "crm-drivers.html": { subtitle: "Conducteurs et informations de risque" },
      "crm-partners.html": { subtitle: "Partenaires assureurs, grossistes et apporteurs" },
      "crm-wholesalers.html": { subtitle: "Grossistes, critères et contacts utiles" },
      "crm-financial.html": { subtitle: "Paiements, créances, débits et vision comptable" },
      "crm-financial-payments.html": { subtitle: "Encaissements et paiements clients" },
      "crm-financial-receivables.html": { subtitle: "Créances à suivre et relances" },
      "crm-financial-debits.html": { subtitle: "Débits, dépenses et sorties" },
      "crm-pro-accounting.html": { subtitle: "Comptabilité professionnelle et dépenses structurées" },
      "crm-periods.html": { subtitle: "Périodes comptables et clôtures" },
      "crm-calendar.html": { subtitle: "Agenda Google Calendar — timeline, jour, semaine, mois, export iCal" },
      "crm-event-create.html": { subtitle: "Créer un RDV (Estimation, Visite…) sync Google Agenda" },
      "crm-events.html": { subtitle: "Liste des événements CRM" },
      "crm-marches.html": { subtitle: "Marchés, permanences — présence équipe modifiable par tous" },
      "crm-events.html": { subtitle: "Événements CRM et historique d'activité" },
      "crm-event-create.html": { subtitle: "Planifier un appel, RDV ou tâche" },
      "crm-create-complete.html": { subtitle: "Onboarding contact, conducteur et véhicule" },
      "crm-external-content.html": { subtitle: "Textes du portail client externe" },
      "crm-test-modes.html": { subtitle: "Simulation des vues Admin, Interne et Externe" },
      "crm-financial-payment-new.html": { subtitle: "Saisie manuelle d'un encaissement" },
      "crm-financial-debit-new.html": { subtitle: "Saisie d'une sortie fournisseur" },
      "crm-period-new.html": { subtitle: "Créer une période comptable trimestrielle" },
      "crm-financial-detail.html": { subtitle: "Fiche paiement, créance ou débit" },
      "crm-projects-migrate.html": { subtitle: "Import JSON de projets" },
      "crm-interlocutors-migrate.html": { subtitle: "Reprise d'interlocuteurs depuis export" },
      "crm-intelligent-alerts.html": { subtitle: "Alertes utiles pour agir au bon moment" },
      "crm-statistics.html": { subtitle: "Indicateurs et performance commerciale" },
      "crm-statistics-reports.html": { subtitle: "Rapports détaillés et analyses" },
      "crm-ai-suggestions.html": { subtitle: "Suggestions IA pour prioriser les actions" },
      "crm-external-hub.html": { subtitle: "Portail externe et expérience client" },
      "crm-modules-beta.html": { subtitle: "Arbre hiérarchique des modules CRM" },
      "crm-modules-sandbox.html": { subtitle: "Espace de test des modules" },
      "crm-users-internal.html": { subtitle: "Utilisateurs internes et accès CRM" },
      "crm-roles.html": { subtitle: "Rôles et responsabilités" },
      "crm-permissions.html": { subtitle: "Permissions et droits d'accès" },
      "crm-settings.html": { subtitle: "Paramètres généraux CRM" },
      "crm-settings-sites.html": { subtitle: "Paramètres des sites et espaces liés" },
      "crm-mobile.html": { subtitle: "Vue mobile et accès terrain" },
      "crm-help.html": { subtitle: "Aide et repères d'utilisation" },
    };
    var meta = PAGE_META[page] || { subtitle: "Espace de travail CRM" };

    var user = {};
    try {
      user = JSON.parse(localStorage.getItem("lo_user") || "{}");
    } catch (e) {}

    var shell = document.createElement("div");
    shell.className = "crm-app";
    shell.innerHTML =
      '<aside class="crm-sidebar" id="crmSidebar">' +
      '<div class="crm-sidebar-header">' +
      '<a href="./crm.html" class="crm-logo"><span class="crm-logo-mark">LO</span><span class="crm-logo-text">Leads <em>CRM</em></span></a>' +
      '<div class="crm-links"><a href="./crm-acquisition.html">Leads</a><a href="./crm-search.html">Recherche</a><a href="./index.html">Site</a></div>' +
      "</div>" +
      '<nav class="crm-nav" id="crmNavMount"></nav>' +
      '<div class="crm-sidebar-footer">' +
      '<div class="crm-user-pill">' +
      '<span class="crm-user-avatar">' +
      (user.fullName ? user.fullName.charAt(0).toUpperCase() : "U") +
      "</span>" +
      '<div><div class="crm-user-name">' +
      (user.fullName || user.email || "Utilisateur") +
      "</div>" +
      '<div class="crm-user-role">' +
      (user.crmRole || user.role || "staff") +
      "</div></div></div>" +
      '<a href="./crm.html" class="crm-back">← Tableau de bord</a>' +
      "</div></aside>" +
      '<div class="crm-main-wrap">' +
      '<header class="crm-main-header">' +
      '<button type="button" class="crm-nav-toggle" id="crmNavToggle" aria-label="Menu">☰</button>' +
      '<div class="crm-page-hero">' +
      '<nav class="crm-breadcrumb"><a href="./crm.html">CRM</a><span>›</span><span id="crmBreadcrumbCurrent"></span></nav>' +
      "<h1 id=\"crmSubTitle\"></h1>" +
      '<p class="crm-page-subtitle" id="crmSubSubtitle"></p>' +
      "</div></header>" +
      '<div id="crmSubContent" class="crm-subpage-content"></div>' +
      "</div>";

    var fragment = document.createDocumentFragment();
    while (document.body.firstChild) fragment.appendChild(document.body.firstChild);

    document.body.className = "crm-body crm-subpage-body";
    document.body.appendChild(shell);

    var wrap = document.createElement("div");
    wrap.className = "crm-page-inner";
    while (fragment.firstChild) wrap.appendChild(fragment.firstChild);
    document.getElementById("crmSubContent").appendChild(wrap);

    document.getElementById("crmSubTitle").textContent = title;
    document.getElementById("crmBreadcrumbCurrent").textContent = title;
    document.getElementById("crmSubSubtitle").textContent = meta.subtitle;

    try {
      window.dispatchEvent(new CustomEvent("lo:crm-shell-ready"));
    } catch (e) {}

    if (window.CrmSidebar) {
      window.CrmSidebar.mount(document.getElementById("crmNavMount"), { activePath: page });
    }

    if (!document.querySelector('link[href*="crm-social-navigation"]')) {
      var css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = "./crm-social-navigation.css";
      document.head.appendChild(css);
    }
    if (!document.querySelector('script[src*="crm-social-navigation"]')) {
      var soc = document.createElement("script");
      soc.src = "./js/crm-social-navigation.js";
      document.body.appendChild(soc);
    }
    injectCss("./css/admin-nav.css");
    if (window.LoAdminNav) {
      window.LoAdminNav.refresh();
    } else if (!document.querySelector('script[src*="admin-nav.js"]')) {
      var adm = document.createElement("script");
      adm.src = "./js/admin-nav.js";
      adm.onload = function () {
        if (window.LoAdminNav) window.LoAdminNav.refresh();
      };
      document.body.appendChild(adm);
    }
  }

  function injectCss(href) {
    if (document.querySelector('link[href*="' + href.replace("./", "") + '"]')) return;
    var l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = href;
    document.head.appendChild(l);
  }

  injectCss("./crm-ui.css");

  if (window.CrmSidebar && window.CrmNavUi) {
    boot();
  } else {
    var chain = ["./js/crm-nav-ui.js", "./js/crm-sidebar.js"];
    var i = 0;
    function next() {
      if (i >= chain.length) {
        boot();
        return;
      }
      var s = document.createElement("script");
      s.src = chain[i++];
      s.onload = next;
      s.onerror = next;
      document.head.appendChild(s);
    }
    next();
  }
})();
