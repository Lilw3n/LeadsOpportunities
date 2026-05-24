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
      "crm-acquisition.html": {
        subtitle: "Prospects Facebook, Google, TikTok, Instagram — questionnaire & relances",
      },
      "crm-tariff-grid.html": { subtitle: "Grilles FMA, Zéphir, Solly Azar — édition et export" },
      "crm-lead-detail.html": { subtitle: "Questionnaire, pipeline et bordereau" },
      "crm-financial.html": { subtitle: "Paiements, créances et débits" },
      "crm-insurance.html": { subtitle: "Portefeuille assurance" },
      "crm-statistics.html": { subtitle: "Indicateurs et performance" },
      "crm-search.html": { subtitle: "Recherche transversale dossiers" },
      "crm-products.html": { subtitle: "Catalogue produits commercial" },
      "crm-external-hub.html": { subtitle: "Espace client et portail" },
      "crm-partner-solly-azar.html": { subtitle: "Critères et templates partenaire" },
      "crm-modules-beta.html": { subtitle: "Arbre hiérarchique des modules" },
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
      '<div class="crm-links"><a href="./crm-acquisition.html">Acquisition</a><a href="./index.html">Site</a></div>' +
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

    if (window.CrmSidebar) {
      window.CrmSidebar.mount(document.getElementById("crmNavMount"), { activePath: page });
      if (window.CrmNavUi) window.CrmNavUi.init(document.getElementById("crmNavMount"));
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
