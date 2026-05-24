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
    default: "›",
  },

  GROUPS: [
    {
      id: "main",
      label: "Principal",
      defaultOpen: true,
      items: [
        { type: "section", id: "overview", label: "Dashboard", icon: "overview" },
        { type: "link", href: "./crm-acquisition.html", label: "Acquisition leads", icon: "acquisition", highlight: true },
        { type: "link", href: "./crm-ai-suggestions.html", label: "Suggestions IA", icon: "ai" },
        { type: "section", id: "contacts", label: "Contacts", icon: "contacts" },
        { type: "section", id: "leads", label: "Leads web", icon: "leads" },
        { type: "section", id: "team", label: "Équipe", icon: "team" },
      ],
    },
    {
      id: "sales",
      label: "Commercial",
      defaultOpen: true,
      items: [
        { type: "link", href: "./crm-tariff-grid.html", label: "Bordereau tarifaire", icon: "tariff" },
        { type: "link", href: "./crm-quotes.html", label: "Devis" },
        { type: "link", href: "./crm-contracts.html", label: "Contrats" },
        { type: "link", href: "./crm-kanban.html", label: "Kanban legacy" },
        { type: "link", href: "./crm-leads-analysis.html", label: "Leads IA" },
      ],
    },
    {
      id: "insurance",
      label: "Assurance",
      defaultOpen: true,
      items: [
        { type: "link", href: "./crm-insurance.html", label: "Hub assurance", icon: "insurance" },
        { type: "link", href: "./crm-products.html", label: "Catalogue produits" },
        { type: "link", href: "./crm-claims.html", label: "Sinistres" },
        { type: "link", href: "./crm-vehicles.html", label: "Véhicules" },
        { type: "link", href: "./crm-drivers.html", label: "Conducteurs" },
        { type: "link", href: "./crm-partners.html", label: "Partenaires" },
        { type: "link", href: "./crm-wholesalers.html", label: "Grossistes" },
      ],
    },
    {
      id: "financial",
      label: "Financier",
      items: [
        { type: "link", href: "./crm-financial.html", label: "Vue d'ensemble", icon: "financial" },
        { type: "link", href: "./crm-financial-payments.html", label: "Paiements" },
        { type: "link", href: "./crm-financial-receivables.html", label: "Créances" },
        { type: "link", href: "./crm-financial-debits.html", label: "Débits" },
        { type: "link", href: "./crm-pro-accounting.html", label: "Comptabilité pro", icon: "financial" },
      ],
    },
    {
      id: "agenda",
      label: "Agenda & stats",
      items: [
        { type: "link", href: "./crm-calendar.html", label: "Calendrier", icon: "calendar" },
        { type: "link", href: "./crm-events.html", label: "Événements" },
        { type: "link", href: "./crm-statistics.html", label: "Statistiques", icon: "stats" },
        { type: "link", href: "./crm-intelligent-alerts.html", label: "Alertes" },
      ],
    },
    {
      id: "tools",
      label: "Outils",
      items: [
        { type: "link", href: "./crm-search.html", label: "Recherche universelle", icon: "tools" },
        { type: "link", href: "./crm-interlocutors.html", label: "Interlocuteurs" },
        { type: "link", href: "./crm-projects.html", label: "Projets" },
        { type: "link", href: "./crm-external-hub.html", label: "Portail externe" },
      ],
    },
    {
      id: "admin",
      label: "Administration",
      items: [
        { type: "link", href: "./crm-settings.html", label: "Paramètres", icon: "admin" },
        { type: "link", href: "./crm-users-internal.html", label: "Utilisateurs" },
        { type: "link", href: "./crm-help.html", label: "Aide" },
      ],
    },
    {
      id: "social",
      label: "Social & mobile",
      items: [
        { type: "link", href: "./external/social/hub.html", label: "Social hub", external: true, icon: "social" },
        { type: "link", href: "./external/index.html", label: "Portail client", external: true },
        { type: "link", href: "./crm-mobile.html", label: "App mobile" },
      ],
    },
  ],

  mount: function (container, options) {
    if (!container) return;
    options = options || {};
    var activeSection = options.activeSection || "";
    var activePath = options.activePath || location.pathname.split("/").pop() || "crm.html";
    var self = this;

    var html =
      '<div class="crm-nav-search-wrap">' +
      '<input type="search" id="crmNavSearch" class="crm-nav-search" placeholder="Rechercher dans le menu…" autocomplete="off" />' +
      "</div>";

    this.GROUPS.forEach(function (g) {
      var collapsed = g.defaultOpen ? "" : " crm-nav-group-collapsed";
      html +=
        '<div class="crm-nav-group' +
        collapsed +
        '" data-group="' +
        g.id +
        '">' +
        '<button type="button" class="crm-nav-group-toggle" aria-expanded="' +
        (g.defaultOpen ? "true" : "false") +
        '">' +
        '<span class="crm-nav-group-title">' +
        g.label +
        "</span>" +
        '<span class="crm-nav-chevron">▼</span></button>' +
        '<div class="crm-nav-group-items">';
      g.items.forEach(function (item) {
        var icon = self.ICONS[item.icon] || self.ICONS.default;
        if (item.type === "section") {
          var on = activeSection === item.id ? " active" : "";
          html +=
            '<a href="./crm.html#' +
            item.id +
            '" class="crm-nav-link crm-nav-section' +
            on +
            '"><span class="crm-nav-icon">' +
            icon +
            "</span><span>" +
            item.label +
            "</span></a>";
        } else {
          var hrefFile = item.href.replace(/^\.\//, "");
          var on = activePath === hrefFile ? " active" : "";
          var ext = item.external ? ' target="_blank" rel="noopener"' : "";
          var hi = item.highlight ? " crm-nav-highlight" : "";
          html +=
            '<a href="' +
            item.href +
            '" class="crm-nav-link' +
            on +
            hi +
            '"' +
            ext +
            '><span class="crm-nav-icon">' +
            icon +
            '</span><span class="crm-nav-text">' +
            item.label +
            (item.external ? ' <span class="crm-nav-ext">↗</span>' : "") +
            "</span></a>";
        }
      });
      html += "</div></div>";
    });

    html +=
      '<div class="crm-nav-footer-hint">' +
      '<span class="crm-nav-dot"></span> Actions dossier depuis la <a href="./crm.html#contacts">fiche contact</a>.' +
      "</div>";

    container.innerHTML = html;

    if (window.CrmNavUi) window.CrmNavUi.init(container);
  },
};
