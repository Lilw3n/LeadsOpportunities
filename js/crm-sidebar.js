/**
 * Navigation CRM — sidebar avec icônes, groupes repliables, recherche.
 */
window.CrmSidebar = {
  ICONS: {
    overview: "◆",
    contacts: "👤",
    leads: "📥",
    team: "👥",
    acquisition: "🎯",
    tariff: "📊",
    ai: "✨",
    insurance: "🛡️",
    financial: "💳",
    stats: "📈",
    calendar: "📅",
    tools: "⚡",
    admin: "⚙️",
    social: "🌐",
    contract: "✒",
    document: "▣",
    partner: "◇",
    alert: "!",
    mobile: "▣",
    search: "⌕",
    automation: "↻",
    immo: "⌂",
    default: "›",
  },

  FAVORITES: [
    { href: "./crm-pubs.html", label: "Gestion pubs", icon: "social", badge: "1€/j" },
    { href: "./crm-sources.html", label: "Origine leads", icon: "stats" },
    { href: "./crm-trafic.html", label: "Trafic & visites", icon: "stats" },
    { href: "./crm-marches.html", label: "Marchés & présence", icon: "calendar" },
    { href: "./crm-search.html", label: "Recherche", icon: "search" },
    { href: "./crm-quote-new.html", label: "Nouveau devis", icon: "contract" },
    { href: "./crm-catalog.html", label: "Tous nos produits", icon: "insurance" },
    { href: "./crm-products.html", label: "Catalogue vérifié", icon: "insurance" },
  ],

  GROUPS: [
    {
      id: "pilotage",
      label: "Pilotage",
      defaultOpen: true,
      items: [
        { type: "section", id: "overview", label: "Tableau de bord", icon: "overview", desc: "Vue d'ensemble CRM", keywords: "dashboard accueil cockpit" },
        { type: "link", href: "./crm-search.html", label: "Recherche universelle", icon: "search", desc: "Contacts, dossiers, événements", keywords: "global search transverse" },
        { type: "link", href: "./crm-statistics.html", label: "Statistiques", icon: "stats", desc: "Performance commerciale" },
        { type: "link", href: "./crm-statistics-reports.html", label: "Rapports", icon: "stats", desc: "Analyses détaillées" },
        { type: "link", href: "./crm-statistics-export.html", label: "Exports statistiques", icon: "stats" },
      ],
    },
    {
      id: "leads",
      label: "Leads & acquisition",
      defaultOpen: true,
      items: [
        { type: "link", href: "./crm-pubs.html", label: "Gestion pubs", icon: "social", badge: "Meta·Google·TikTok", highlight: true, desc: "Ads Manager, formulaires, textes campagne" },
        { type: "link", href: "./crm-sources.html", label: "Origine des leads", icon: "stats", badge: "UTM", desc: "Plateforme, campagne, gclid, ttclid" },
        { type: "link", href: "./crm-trafic.html", label: "Trafic & visites", icon: "stats", badge: "WoW", desc: "Comparaison semaine vs semaine précédente" },
        { type: "link", href: "./crm-acquisition.html", label: "Pipeline acquisition", icon: "acquisition", highlight: true, badge: "priorité", desc: "Google, Meta, TikTok, Allo" },
        { type: "link", href: "./crm-meta-inbox.html", label: "Leads Meta (Facebook)", icon: "social", badge: "Lead Ads", desc: "Formulaires instantanés Meta" },
        { type: "section", id: "leads", label: "Leads web", icon: "leads", desc: "Demandes site public" },
        { type: "link", href: "./crm-private-offer-matching.html", label: "Matching VSP privé", icon: "ai", badge: "privé", desc: "Orientation partenaires" },
        { type: "link", href: "./crm-leads-analysis.html", label: "Analyse leads IA", icon: "ai" },
        { type: "link", href: "./crm-kanban.html", label: "Kanban leads", icon: "acquisition" },
        { type: "link", href: "./crm-lead-detail.html", label: "Fiche lead", icon: "leads", muted: true },
      ],
    },
    {
      id: "clients",
      label: "Clients & dossiers",
      defaultOpen: true,
      items: [
        { type: "section", id: "contacts", label: "Contacts", icon: "contacts", desc: "Prospects, clients, apporteurs" },
        { type: "link", href: "./crm-contact.html", label: "Fiche contact", icon: "contacts", muted: true },
        { type: "link", href: "./crm-contact-modules.html", label: "Modules contact", icon: "tools" },
        { type: "link", href: "./crm-interlocutors.html", label: "Interlocuteurs", icon: "contacts" },
        { type: "link", href: "./crm-interlocutors-modules.html", label: "Modules interlocuteurs", icon: "tools" },
        { type: "link", href: "./crm-interlocutor-social.html", label: "Social interlocuteur", icon: "social" },
        { type: "link", href: "./crm-projects.html", label: "Projets", icon: "tools" },
        { type: "link", href: "./crm-projects-new.html", label: "Nouveau projet", icon: "tools" },
        { type: "link", href: "./crm-projects-detail.html", label: "Détail projet", icon: "tools", muted: true },
        { type: "link", href: "./crm-documents.html", label: "Documents", icon: "document" },
        { type: "link", href: "./crm-pending-documents.html", label: "Documents en attente", icon: "document", badge: "à traiter" },
        { type: "link", href: "./crm-bank-details.html", label: "Coordonnées bancaires", icon: "financial" },
      ],
    },
    {
      id: "commercial",
      label: "Devis & contrats",
      defaultOpen: true,
      items: [
        { type: "link", href: "./crm-quotes.html", label: "Devis", icon: "contract", desc: "Liste et suivi" },
        { type: "link", href: "./crm-quote-new.html", label: "Nouveau devis", icon: "contract", highlight: true },
        { type: "link", href: "./crm-quote-wizard.html", label: "Wizard devis", icon: "contract" },
        { type: "link", href: "./crm-quote-contract-wizard.html", label: "Devis vers contrat", icon: "contract" },
        { type: "link", href: "./crm-quote-detail.html", label: "Détail devis", icon: "contract", muted: true },
        { type: "link", href: "./crm-quote-payment.html", label: "Paiement devis", icon: "financial" },
        { type: "link", href: "./crm-contracts.html", label: "Contrats", icon: "contract" },
        { type: "link", href: "./crm-contract-new.html", label: "Nouveau contrat", icon: "contract" },
        { type: "link", href: "./crm-contract-detail.html", label: "Détail contrat", icon: "contract", muted: true },
        { type: "link", href: "./crm-contract-avenant.html", label: "Avenant contrat", icon: "contract" },
      ],
    },
    {
      id: "immobilier",
      label: "Immobilier",
      defaultOpen: true,
      items: [
        { type: "link", href: "./crm-agency-fees.html", label: "Barèmes / Financement", icon: "immo", highlight: true, desc: "Honoraires vendeur + capacité emprunt / rachat acheteur", keywords: "immo laforet honoraires commission bareme pret rachat financement acheteur" },
        { type: "link", href: "./negociateur-immobilier/", label: "Landing négociateur", icon: "immo", desc: "Parcours acquéreur prêt & assurances" },
      ],
    },
    {
      id: "assurance",
      label: "Assurance métier",
      defaultOpen: true,
      items: [
        { type: "link", href: "./crm-insurance.html", label: "Hub assurance", icon: "insurance", desc: "Portefeuille et modules" },
        { type: "link", href: "./crm-catalog.html", label: "Tous nos produits", icon: "insurance", badge: "devis" },
        { type: "link", href: "./crm-products.html", label: "Catalogue vérifié", icon: "insurance" },
        { type: "link", href: "./crm-insurance-requests.html", label: "Demandes assurance", icon: "insurance" },
        { type: "link", href: "./crm-insurance-request-new.html", label: "Nouvelle demande", icon: "insurance" },
        { type: "link", href: "./crm-tariff-grid.html", label: "Bordereau tarifaire", icon: "tariff" },
        { type: "link", href: "./crm-eligibility-rules.html", label: "Règles d'éligibilité", icon: "tariff" },
        { type: "link", href: "./crm-eligibility-test.html", label: "Test éligibilité", icon: "tariff" },
        { type: "link", href: "./crm-derogations.html", label: "Dérogations", icon: "alert" },
        { type: "link", href: "./crm-simulate.html", label: "Simulation", icon: "tariff" },
        { type: "link", href: "./crm-claims.html", label: "Sinistres", icon: "alert" },
        { type: "link", href: "./crm-claim-new.html", label: "Nouveau sinistre", icon: "alert" },
        { type: "link", href: "./crm-vehicles.html", label: "Véhicules", icon: "insurance" },
        { type: "link", href: "./crm-vehicle-new.html", label: "Nouveau véhicule", icon: "insurance" },
        { type: "link", href: "./crm-drivers.html", label: "Conducteurs", icon: "contacts" },
        { type: "link", href: "./crm-driver-new.html", label: "Nouveau conducteur", icon: "contacts" },
        { type: "link", href: "./crm-partners.html", label: "Partenaires", icon: "partner" },
        { type: "link", href: "./crm-wholesalers.html", label: "Memo grossistes", icon: "partner" },
        { type: "link", href: "./crm-partner-detail.html", label: "Détail partenaire", icon: "partner", muted: true },
      ],
    },
    {
      id: "financial",
      label: "Finance & compta",
      items: [
        { type: "link", href: "./crm-financial.html", label: "Vue d'ensemble", icon: "financial" },
        { type: "link", href: "./crm-financial-payments.html", label: "Paiements" },
        { type: "link", href: "./crm-financial-payment-new.html", label: "Nouveau paiement" },
        { type: "link", href: "./crm-financial-receivables.html", label: "Créances" },
        { type: "link", href: "./crm-financial-debits.html", label: "Débits" },
        { type: "link", href: "./crm-financial-debit-new.html", label: "Nouveau débit" },
        { type: "link", href: "./crm-financial-detail.html", label: "Détail financier", muted: true },
        { type: "link", href: "./crm-periods.html", label: "Périodes comptables" },
        { type: "link", href: "./crm-period-new.html", label: "Nouvelle période" },
        { type: "link", href: "./crm-pro-accounting.html", label: "Comptabilité pro", icon: "financial" },
      ],
    },
    {
      id: "agenda",
      label: "Agenda & activité",
      items: [
        { type: "link", href: "./crm-calendar.html", label: "Calendrier", icon: "calendar" },
        { type: "link", href: "./crm-marches.html", label: "Marchés & présence", icon: "calendar", badge: "terrain", highlight: true, desc: "Où être présent — horaires modifiables par tous" },
        { type: "link", href: "./crm-events.html", label: "Événements" },
        { type: "link", href: "./crm-event-create.html", label: "Créer événement" },
        { type: "link", href: "./crm-create-complete.html", label: "Création complète" },
        { type: "link", href: "./crm-intelligent-alerts.html", label: "Alertes intelligentes", icon: "alert" },
      ],
    },
    {
      id: "automations",
      label: "Automations & IA",
      items: [
        { type: "link", href: "./crm-ai-suggestions.html", label: "Suggestions IA", icon: "ai" },
        { type: "link", href: "./crm-external-hub.html", label: "Portail externe", icon: "tools" },
        { type: "link", href: "./crm-external-content.html", label: "Contenus externes", icon: "tools" },
        { type: "link", href: "./crm-external-profile.html", label: "Profil externe", icon: "tools" },
        { type: "link", href: "./crm-modules-beta.html", label: "Modules beta", icon: "automation" },
        { type: "link", href: "./crm-modules-sandbox.html", label: "Sandbox modules", icon: "automation" },
        { type: "link", href: "./crm-test-modes.html", label: "Modes test", icon: "tools" },
        { type: "link", href: "./crm-export.html", label: "Exports CRM", icon: "tools" },
      ],
    },
    {
      id: "team",
      label: "Équipe & admin",
      items: [
        { type: "section", id: "team", label: "Équipe CRM", icon: "team" },
        { type: "link", href: "./crm-users-internal.html", label: "Utilisateurs internes", icon: "team" },
        { type: "link", href: "./crm-roles.html", label: "Rôles", icon: "admin" },
        { type: "link", href: "./crm-permissions.html", label: "Permissions", icon: "admin" },
        { type: "link", href: "./crm-settings.html", label: "Paramètres CRM", icon: "admin" },
        { type: "link", href: "./crm-settings-sites.html", label: "Paramètres sites", icon: "admin" },
        { type: "link", href: "./crm-projects-templates.html", label: "Templates projets", icon: "tools" },
        { type: "link", href: "./crm-projects-migrate.html", label: "Migration projets", icon: "tools" },
        { type: "link", href: "./crm-interlocutors-migrate.html", label: "Migration interlocuteurs", icon: "tools" },
        { type: "link", href: "./crm-help.html", label: "Aide" },
      ],
    },
    {
      id: "social",
      label: "Social & mobile",
      items: [
        { type: "link", href: "./external/social/hub.html", label: "Social hub", external: true, icon: "social" },
        { type: "link", href: "./external/index.html", label: "Portail client", external: true },
        { type: "link", href: "./crm-mobile.html", label: "App mobile", icon: "mobile" },
      ],
    },
  ],

  esc: function (s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  },

  mount: function (container, options) {
    if (!container) return;
    options = options || {};
    var activeSection = options.activeSection || "";
    var activePath = options.activePath || location.pathname.split("/").pop() || "crm.html";
    var self = this;

    var html =
      '<div class="crm-nav-search-wrap">' +
      '<input type="search" id="crmNavSearch" class="crm-nav-search" placeholder="Rechercher dans le menu…" autocomplete="off" />' +
      "</div>" +
      '<div class="crm-nav-favorites" aria-label="Accès rapides">';

    this.FAVORITES.forEach(function (item) {
      var icon = self.ICONS[item.icon] || self.ICONS.default;
      var active = activePath === item.href.replace(/^\.\//, "") ? " active" : "";
      html +=
        '<a href="' +
        self.esc(item.href) +
        '" class="crm-nav-favorite' +
        active +
        '"><span>' +
        icon +
        "</span><strong>" +
        self.esc(item.label) +
        "</strong>" +
        (item.badge ? '<em>' + self.esc(item.badge) + "</em>" : "") +
        "</a>";
    });
    html += "</div>";

    this.GROUPS.forEach(function (g) {
      var hasActive = g.items.some(function (item) {
        if (item.type === "section") return activeSection === item.id;
        return activePath === item.href.replace(/^\.\//, "");
      });
      var collapsed = g.defaultOpen || hasActive ? "" : " crm-nav-group-collapsed";
      html +=
        '<div class="crm-nav-group' +
        collapsed +
        '" data-group="' +
        self.esc(g.id) +
        '">' +
        '<button type="button" class="crm-nav-group-toggle" aria-expanded="' +
        (collapsed ? "false" : "true") +
        '">' +
        '<span class="crm-nav-group-title">' +
        self.esc(g.label) +
        "</span>" +
        '<span class="crm-nav-chevron">▼</span></button>' +
        '<div class="crm-nav-group-items">';
      g.items.forEach(function (item) {
        var icon = self.ICONS[item.icon] || self.ICONS.default;
        var desc = item.desc ? '<small class="crm-nav-desc">' + self.esc(item.desc) + "</small>" : "";
        var badge = item.badge ? '<em class="crm-nav-badge">' + self.esc(item.badge) + "</em>" : "";
        var muted = item.muted ? " crm-nav-muted" : "";
        var keywords = self.esc([item.label, item.desc, item.keywords].filter(Boolean).join(" "));
        if (item.type === "section") {
          var on = activeSection === item.id ? " active" : "";
          html +=
            '<a href="./crm.html#' +
            self.esc(item.id) +
            '" class="crm-nav-link crm-nav-section' +
            on +
            muted +
            '" data-keywords="' +
            keywords +
            '"><span class="crm-nav-icon">' +
            icon +
            '</span><span class="crm-nav-main"><span class="crm-nav-row"><span class="crm-nav-text">' +
            self.esc(item.label) +
            "</span>" +
            badge +
            "</span>" +
            desc +
            "</span></a>";
        } else {
          var hrefFile = item.href.replace(/^\.\//, "");
          var on = activePath === hrefFile ? " active" : "";
          var ext = item.external ? ' target="_blank" rel="noopener"' : "";
          var hi = item.highlight ? " crm-nav-highlight" : "";
          html +=
            '<a href="' +
            self.esc(item.href) +
            '" class="crm-nav-link' +
            on +
            hi +
            muted +
            '"' +
            ext +
            ' data-keywords="' +
            keywords +
            '"><span class="crm-nav-icon">' +
            icon +
            '</span><span class="crm-nav-main"><span class="crm-nav-row"><span class="crm-nav-text">' +
            self.esc(item.label) +
            (item.external ? ' <span class="crm-nav-ext">↗</span>' : "") +
            "</span>" +
            badge +
            "</span>" +
            desc +
            "</span></a>";
        }
      });
      html += "</div></div>";
    });

    html +=
      '<div class="crm-nav-footer-hint">' +
      '<span class="crm-nav-dot"></span> Menu centralisé : tous les modules CRM sont regroupés par métier.' +
      "</div>";

    container.innerHTML = html;

    if (window.CrmNavUi) window.CrmNavUi.init(container);
  },
};
