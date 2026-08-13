/**
 * Menu unifié Immobilier / patrimoine :
 * Prêts · Assurance immo · Patrimoine · Banque & épargne
 *
 * Usage :
 *   <div id="immoFinanceNav" data-vertical="prets" data-active="dossiers"></div>
 */
(function () {
  "use strict";

  var VERTICALS = [
    { id: "prets", label: "Prêts", href: "./crm-pret-immo.html", cls: "on-prets" },
    { id: "assurance", label: "Assurance immo", href: "./crm-assurance-immo.html", cls: "on-assurance" },
    { id: "patrimoine", label: "Patrimoine", href: "./crm-patrimoine.html", cls: "on-patrimoine" },
    { id: "banque", label: "Banque & épargne", href: "./crm-banque-epargne.html", cls: "on-banque" }
  ];

  var LINKS = {
    prets: [
      { id: "dossiers", href: "./crm-pret-immo.html", label: "Mes dossiers" },
      { id: "sim", href: "./crm-pret-immo-sim.html", label: "Effectuer simulation", simMenu: true },
      { id: "transmit", href: "./crm-pret-immo.html?view=transmettre", label: "Transmettre dossier" },
      { id: "coord", href: "./crm-pret-immo-coord.html", label: "Transmettre coordonnées" },
      { id: "docs", href: "./crm-pret-immo-docs.html", label: "Documentation" },
      { id: "grilles", href: "./crm-pret-immo-grilles.html", label: "Grilles des taux" },
      { id: "fiches", href: "./crm-pret-immo-fiches.html", label: "Fiches produits" },
      { id: "pvh", href: "./crm-pret-immo-pvh.html", label: "PVH" },
      { id: "budget", href: "./crm-budget-proprietaire.html", label: "Budget propriétaire" },
      { id: "baremes", href: "./crm-agency-fees.html", label: "Barèmes / FAI" }
    ],
    assurance: [
      { id: "hub", href: "./crm-assurance-immo.html", label: "Hub assurance immo" },
      { id: "ade", href: "./crm-assurance-immo.html#ade", label: "Emprunteur (ADE)" },
      { id: "habitation", href: "./crm-assurance-immo.html#habitation", label: "Habitation / MRH" },
      { id: "demandes", href: "./crm-insurance-requests.html?scope=immo", label: "Demandes" },
      { id: "demande-new", href: "./crm-insurance-request-new.html?scope=immo", label: "Nouvelle demande" },
      { id: "wholesalers", href: "./crm-wholesalers.html?tag=emprunteur", label: "Grossistes" },
      { id: "docs-ade", href: "./crm-pret-immo-docs.html?q=assurance%20emprunteur%20ADE", label: "Docs ADE" },
      { id: "hub-metier", href: "./crm-insurance.html", label: "Hub assurance métier" }
    ],
    patrimoine: [
      { id: "hub", href: "./crm-patrimoine.html", label: "Hub patrimoine" },
      { id: "retraite", href: "./crm-patrimoine.html#retraite", label: "Retraite" },
      { id: "mutuelle", href: "./crm-patrimoine.html#mutuelle", label: "Mutuelle" },
      { id: "invalidite", href: "./crm-patrimoine.html#invalidite", label: "Invalidité" },
      { id: "famille", href: "./crm-patrimoine.html#famille", label: "Protection famille" },
      { id: "orient", href: "./crm-patrimoine.html#orientation", label: "Orientation intelligente" },
      { id: "ade-link", href: "./crm-assurance-immo.html#ade", label: "Croiser ADE" },
      { id: "prets-link", href: "./crm-pret-immo.html", label: "Dossiers prêt" }
    ],
    banque: [
      { id: "hub", href: "./crm-banque-epargne.html", label: "Hub banque" },
      { id: "epargne", href: "./crm-banque-epargne.html#epargne", label: "Épargne" },
      { id: "placements", href: "./crm-banque-epargne.html#placements", label: "Placements" },
      { id: "pro", href: "./crm-banque-epargne.html#pro", label: "Trésorerie pro" },
      { id: "iban", href: "./crm-bank-details.html", label: "Coordonnées bancaires" },
      { id: "financier", href: "./crm-financial.html", label: "Financier CRM" },
      { id: "baremes", href: "./crm-agency-fees.html", label: "Net commissions" }
    ]
  };

  var ARIA = {
    prets: "Prêts immobiliers",
    assurance: "Assurance immobilier",
    patrimoine: "Patrimoine & prévoyance",
    banque: "Banque & épargne"
  };

  function pageName() {
    return (location.pathname.split("/").pop() || "").split("?")[0];
  }

  function detectVertical() {
    var p = pageName();
    if (p.indexOf("patrimoine") >= 0) return "patrimoine";
    if (p.indexOf("banque-epargne") >= 0 || p === "crm-bank-details.html" || p.indexOf("crm-financial") === 0)
      return "banque";
    if (p.indexOf("assurance-immo") >= 0) return "assurance";
    if (p.indexOf("pret-immo") >= 0 || p === "crm-agency-fees.html" || p === "crm-budget-proprietaire.html") return "prets";
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
    var hash = (location.hash || "").replace("#", "");

    if (vertical === "patrimoine") {
      if (hash && ["retraite", "mutuelle", "invalidite", "famille", "orientation"].indexOf(hash) >= 0) return hash;
      return "hub";
    }
    if (vertical === "banque") {
      if (p === "crm-bank-details.html") return "iban";
      if (p.indexOf("crm-financial") === 0) return "financier";
      if (p === "crm-agency-fees.html") return "baremes";
      if (hash && ["epargne", "placements", "pro"].indexOf(hash) >= 0) return hash;
      return "hub";
    }
    if (vertical === "assurance") {
      if (p === "crm-assurance-immo.html") {
        if (hash === "habitation") return "habitation";
        if (hash === "ade") return "ade";
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
      '<div class="imf-switch" role="tablist" aria-label="Piliers Immobilier & patrimoine">' +
      VERTICALS.map(function (v) {
        var on = vertical === v.id;
        return (
          '<a href="' +
          esc(v.href) +
          '" class="' +
          (on ? v.cls : "") +
          '" role="tab" aria-selected="' +
          (on ? "true" : "false") +
          '"><span class="imf-dot" aria-hidden="true"></span>' +
          esc(v.label) +
          "</a>"
        );
      }).join("") +
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
    var links = LINKS[vertical] || LINKS.prets;
    var html = '<nav class="imf-bar ' + vertical + '" aria-label="' + esc(ARIA[vertical] || "") + '">';
    links.forEach(function (link) {
      if (vertical === "prets" && link.id === "baremes") {
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
    VERTICALS: VERTICALS,
    LINKS: LINKS,
    PRETS_LINKS: LINKS.prets,
    ASSURANCE_LINKS: LINKS.assurance
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoMount);
  } else {
    autoMount();
  }
})();
