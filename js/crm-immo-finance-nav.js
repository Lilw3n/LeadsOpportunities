/**
 * Menu unifié Immobilier financement :
 * switcher Prêts ↔ Assurance immo + sous-navigation.
 *
 * Usage HTML :
 *   <div id="immoFinanceNav" data-vertical="prets" data-active="dossiers"></div>
 *   <link rel="stylesheet" href="./css/crm-immo-finance-nav.css" />
 *   <script src="./js/crm-immo-finance-nav.js"></script>
 */
(function () {
  "use strict";

  var PRETS_LINKS = [
    { id: "dossiers", href: "./crm-pret-immo.html", label: "Mes dossiers" },
    { id: "sim", href: "./crm-pret-immo-sim.html", label: "Effectuer simulation", simMenu: true },
    { id: "transmit", href: "./crm-pret-immo.html?view=transmettre", label: "Transmettre dossier" },
    { id: "coord", href: "./crm-pret-immo-coord.html", label: "Transmettre coordonnées" },
    { id: "docs", href: "./crm-pret-immo-docs.html", label: "Documentation" },
    { id: "grilles", href: "./crm-pret-immo-grilles.html", label: "Grilles des taux" },
    { id: "fiches", href: "./crm-pret-immo-fiches.html", label: "Fiches produits" },
    { id: "pvh", href: "./crm-pret-immo-pvh.html", label: "PVH" },
    { id: "baremes", href: "./crm-agency-fees.html", label: "Barèmes / FAI" }
  ];

  var ASSURANCE_LINKS = [
    { id: "hub", href: "./crm-assurance-immo.html", label: "Hub assurance immo" },
    { id: "ade", href: "./crm-assurance-immo.html#ade", label: "Emprunteur (ADE)" },
    { id: "habitation", href: "./crm-assurance-immo.html#habitation", label: "Habitation / MRH" },
    { id: "demandes", href: "./crm-insurance-requests.html?scope=immo", label: "Demandes" },
    { id: "demande-new", href: "./crm-insurance-request-new.html?scope=immo", label: "Nouvelle demande" },
    { id: "wholesalers", href: "./crm-wholesalers.html?tag=emprunteur", label: "Grossistes" },
    { id: "docs-ade", href: "./crm-pret-immo-docs.html?q=assurance%20emprunteur%20ADE&project=", label: "Docs ADE" },
    { id: "hub-metier", href: "./crm-insurance.html", label: "Hub assurance métier" }
  ];

  function pageName() {
    return (location.pathname.split("/").pop() || "").split("?")[0];
  }

  function detectVertical() {
    var p = pageName();
    if (p.indexOf("assurance-immo") >= 0) return "assurance";
    if (p.indexOf("pret-immo") >= 0 || p === "crm-agency-fees.html") return "prets";
    if (p.indexOf("insurance") >= 0 || p.indexOf("wholesaler") >= 0) {
      var q = new URLSearchParams(location.search);
      if (q.get("scope") === "immo" || q.get("tag") === "emprunteur" || q.get("tag") === "habitation") {
        return "assurance";
      }
    }
    return "prets";
  }

  function detectActive(vertical) {
    var p = pageName();
    var params = new URLSearchParams(location.search);
    if (vertical === "assurance") {
      if (p === "crm-assurance-immo.html") {
        if (location.hash === "#habitation") return "habitation";
        if (location.hash === "#ade") return "ade";
        return "hub";
      }
      if (p === "crm-insurance-request-new.html") return "demande-new";
      if (p === "crm-insurance-requests.html") return "demandes";
      if (p === "crm-wholesalers.html") return "wholesalers";
      if (p === "crm-pret-immo-docs.html") return "docs-ade";
      if (p === "crm-insurance.html") return "hub-metier";
      return "hub";
    }
    if (p === "crm-pret-immo.html") return params.get("view") === "transmettre" ? "transmit" : "dossiers";
    if (p === "crm-pret-immo-sim.html") return "sim";
    if (p === "crm-pret-immo-coord.html") return "coord";
    if (p === "crm-pret-immo-docs.html") return "docs";
    if (p === "crm-pret-immo-grilles.html") return "grilles";
    if (p === "crm-pret-immo-fiches.html") return "fiches";
    if (p === "crm-pret-immo-pvh.html") return "pvh";
    if (p === "crm-agency-fees.html") return "baremes";
    return "";
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderSwitch(vertical) {
    return (
      '<div class="imf-switch" role="tablist" aria-label="Verticale Immobilier">' +
      '<a href="./crm-pret-immo.html" class="' +
      (vertical === "prets" ? "on-prets" : "") +
      '" role="tab" aria-selected="' +
      (vertical === "prets" ? "true" : "false") +
      '"><span class="imf-dot" aria-hidden="true"></span>Prêts</a>' +
      '<a href="./crm-assurance-immo.html" class="' +
      (vertical === "assurance" ? "on-assurance" : "") +
      '" role="tab" aria-selected="' +
      (vertical === "assurance" ? "true" : "false") +
      '"><span class="imf-dot" aria-hidden="true"></span>Assurance immo</a>' +
      "</div>"
    );
  }

  function renderSimDropdown() {
    var Lib = window.CrmPretImmo;
    if (!Lib || !Lib.SIM_TYPES) {
      return '<a href="./crm-pret-immo-sim.html">Effectuer simulation</a>';
    }
    var html =
      '<div class="imf-dd" id="simMenu">' +
      '<button type="button" id="btnSimMenu">Effectuer simulation ▾</button>' +
      '<div class="imf-dd-menu" id="simMenuPanel">';
    Lib.SIM_TYPES.forEach(function (t) {
      if (t.id === "rac") {
        html += '<div class="has-sub"><a href="./crm-pret-immo-sim.html?type=rac">RAC <span>›</span></a><div class="imf-sub">';
        (Lib.HOUSING_STATUSES || []).forEach(function (h) {
          html +=
            '<a href="./crm-pret-immo-sim.html?type=rac&housing=' +
            encodeURIComponent(h.id) +
            '">' +
            esc(h.label) +
            "</a>";
        });
        html += "</div></div>";
      } else if (t.id === "pvh") {
        html += '<a href="./crm-pret-immo-pvh.html">' + esc(t.label) + " : Calculette</a>";
      } else {
        html +=
          '<a href="./crm-pret-immo-sim.html?type=' +
          encodeURIComponent(t.id) +
          '">' +
          esc(t.label) +
          "</a>";
      }
    });
    html += "</div></div>";
    return html;
  }

  function renderBar(vertical, active) {
    var links = vertical === "assurance" ? ASSURANCE_LINKS : PRETS_LINKS;
    var html = '<nav class="imf-bar ' + vertical + '" aria-label="' + (vertical === "assurance" ? "Assurance immobilier" : "Prêts immobiliers") + '">';
    links.forEach(function (link, idx) {
      if (idx === 8 || (vertical === "prets" && link.id === "baremes")) {
        html += '<span class="imf-sep" aria-hidden="true"></span>';
      }
      if (link.simMenu && vertical === "prets") {
        html += renderSimDropdown();
        return;
      }
      html +=
        '<a href="' +
        esc(link.href) +
        '"' +
        (link.id === active ? ' class="active"' : "") +
        ">" +
        esc(link.label) +
        "</a>";
    });
    html += "</nav>";
    return html;
  }

  function bindInteractions(root) {
    var dd = root.querySelector("#simMenu");
    var btn = root.querySelector("#btnSimMenu");
    if (btn && dd) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        dd.classList.toggle("open");
      });
      document.addEventListener("click", function () {
        dd.classList.remove("open");
      });
    }
  }

  function mount(target) {
    var el =
      typeof target === "string"
        ? document.querySelector(target)
        : target || document.getElementById("immoFinanceNav");
    if (!el) return null;
    var vertical = el.getAttribute("data-vertical") || detectVertical();
    var active = el.getAttribute("data-active") || detectActive(vertical);
    el.classList.add("imf-nav");
    el.innerHTML = renderSwitch(vertical) + renderBar(vertical, active);
    bindInteractions(el);
    return { vertical: vertical, active: active };
  }

  function autoMount() {
    var nodes = document.querySelectorAll("#immoFinanceNav, [data-immo-finance-nav]");
    if (!nodes.length) return;
    nodes.forEach(function (node) {
      mount(node);
    });
  }

  window.CrmImmoFinanceNav = {
    mount: mount,
    detectVertical: detectVertical,
    detectActive: detectActive,
    PRETS_LINKS: PRETS_LINKS,
    ASSURANCE_LINKS: ASSURANCE_LINKS
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoMount);
  } else {
    autoMount();
  }
})();
