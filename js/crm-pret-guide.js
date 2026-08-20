/**
 * Guide CRM Prêts — à quoi sert chaque zone + comment faire.
 * Injecte un panneau repliable sous #immoFinanceNav sur les pages prêt.
 */
(function () {
  "use strict";

  var LOAN_TYPES = [
    {
      id: "immo",
      title: "Crédit immobilier (IMMO)",
      what: "Financer l’achat d’une résidence principale, secondaire ou un investissement locatif.",
      how: "Nouveau dossier → simulation IMMO → pièces → documentation liée → transmission banque / partenaire."
    },
    {
      id: "rac",
      title: "Rachat de crédits (RAC)",
      what: "Regrouper plusieurs crédits (conso, immo…) pour baisser la mensualité ou alléger le taux d’endettement.",
      how: "Simulation RAC (propriétaire / locataire / hébergé) → croiser fiches « avec / sans garantie » et grilles partenaires."
    },
    {
      id: "hypo",
      title: "Hypothécaire / trésorerie",
      what: "Obtenir de la trésorerie en prenant une garantie sur un bien déjà détenu (pas forcément un achat).",
      how: "Sim HYPO ou hypo trésorerie → ratio hypothécaire → fiches CFCAL / CGI / Creatis selon profil."
    },
    {
      id: "pvh",
      title: "Prêt viager hypothécaire (PVH)",
      what: "Capital versé aux seniors, remboursé au décès ou à la vente (intérêts souvent capitalisés).",
      how: "Calculette PVH pour projeter le capital dû, puis fiches PVH partenaires."
    },
    {
      id: "scpi",
      title: "SCPI / SCI",
      what: "Financer des parts SCPI ou un montage société (SCI) selon normes partenaires.",
      how: "Sim SCPI/SCI → fiches Investys / normes SCI → vérifier nantissement et revenus."
    },
    {
      id: "conso",
      title: "Conso / travaux / relais",
      what: "Besoin ponctuel (conso), rénovation, ou pont entre deux biens (relais).",
      how: "Cocher travaux / relais / PTZ dans le simulateur pour filtrer automatiquement la documentation."
    }
  ];

  var MENU = [
    { title: "Mes dossiers", what: "Liste de tous vos dossiers prêt (réf., emprunteur, banque, position).", how: "Filtrer par rubrique / position · icône 🔍 ouvrir · 📑 docs liées." },
    { title: "Effectuer simulation", what: "Chiffrage IMMO, RAC, SCI, SCPI, CONSO, HYPO, viager…", how: "Choisir le type → remplir projet / revenus → Simuler → Enregistrer." },
    { title: "Documentation", what: "Moteur unique grilles de taux + fiches produits, lié au dossier.", how: "Question métier en langage naturel (ex. « 62 ans, retraite, RAC avec garantie ») ou axe projet PTZ / relais / travaux." },
    { title: "Grilles des taux", what: "Barèmes partenaires (taux / critères) pour comparer rapidement.", how: "Filtrer partenaire / région · statut « en attente PDF » = fichier pas encore déposé." },
    { title: "Fiches produits", what: "Conditions d’éligibilité, pièces, gammes (BANK B, CFCAL, SYGMA…).", how: "Même recherche intelligente · types de prêt ≠ partenaires ≠ régions DOM-TOM." },
    { title: "Coordonnées / transmettre", what: "Fiche légère indicateur d’affaires ou envoi DDP.", how: "Depuis un dossier ou page dédiée, sans refaire toute la sim." }
  ];

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function css() {
    if (document.getElementById("crm-pret-guide-css")) return;
    var style = document.createElement("style");
    style.id = "crm-pret-guide-css";
    style.textContent =
      ".pi-guide{margin:0 0 16px;border:1px solid #c7d2fe;border-radius:14px;background:linear-gradient(180deg,#eef2ff,#fff);overflow:hidden}" +
      ".pi-guide summary{cursor:pointer;list-style:none;padding:12px 14px;font-weight:800;color:#1e3a8a;display:flex;gap:10px;align-items:center;justify-content:space-between}" +
      ".pi-guide summary::-webkit-details-marker{display:none}" +
      ".pi-guide summary .pi-guide-chev{font-size:.85rem;color:#64748b}" +
      ".pi-guide[open] summary .pi-guide-chev{transform:rotate(180deg)}" +
      ".pi-guide-body{padding:0 14px 14px;display:grid;gap:12px}" +
      ".pi-guide-status{font-size:.82rem;line-height:1.45;color:#334155;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:10px 12px}" +
      ".pi-guide-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}" +
      "@media(max-width:900px){.pi-guide-grid{grid-template-columns:1fr}}" +
      ".pi-guide-card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:10px 12px}" +
      ".pi-guide-card h3{margin:0 0 6px;font-size:.88rem;color:#1e3a8a}" +
      ".pi-guide-card p{margin:0 0 4px;font-size:.8rem;color:#475569;line-height:1.4}" +
      ".pi-guide-card p strong{color:#0f172a}" +
      ".pi-guide-note{font-size:.78rem;color:#64748b;margin:0}";
    document.head.appendChild(style);
  }

  function buildHtml(open) {
    var loans = LOAN_TYPES.map(function (t) {
      return (
        '<article class="pi-guide-card">' +
        "<h3>" +
        esc(t.title) +
        "</h3>" +
        "<p><strong>À quoi ça sert :</strong> " +
        esc(t.what) +
        "</p>" +
        "<p><strong>Comment faire :</strong> " +
        esc(t.how) +
        "</p>" +
        "</article>"
      );
    }).join("");

    var menus = MENU.map(function (t) {
      return (
        '<article class="pi-guide-card">' +
        "<h3>" +
        esc(t.title) +
        "</h3>" +
        "<p><strong>À quoi ça sert :</strong> " +
        esc(t.what) +
        "</p>" +
        "<p><strong>Comment faire :</strong> " +
        esc(t.how) +
        "</p>" +
        "</article>"
      );
    }).join("");

    return (
      '<details class="pi-guide"' +
      (open ? " open" : "") +
      ">" +
      "<summary><span>Guide Prêts — à quoi ça sert &amp; comment faire</span><span class=\"pi-guide-chev\" aria-hidden=\"true\">▾</span></summary>" +
      '<div class="pi-guide-body">' +
      '<div class="pi-guide-status">' +
      "<strong>PDF du dossier Bureau :</strong> le cloud agent ne lit pas <code>C:\\Users\\…\\Desktop\\pret</code>. " +
      "Catalogue indexé (~201 fiches + ~39 grilles) mais fichiers encore en <strong>attente d’upload</strong>. " +
      "Pour finaliser : copiez les PDF dans <code>docs/pret-fiches/_inbox/</code> (et grilles dans <code>docs/pret-grilles/_inbox/</code>), " +
      "puis <code>npm run pret:fiches:import</code> / <code>npm run pret:grilles:import</code>." +
      "</div>" +
      '<p class="pi-guide-note">Menu CRM — rôle de chaque écran</p>' +
      '<div class="pi-guide-grid">' +
      menus +
      "</div>" +
      '<p class="pi-guide-note">Types de prêt — usage métier</p>' +
      '<div class="pi-guide-grid">' +
      loans +
      "</div>" +
      "</div></details>"
    );
  }

  function mount() {
    var nav = document.getElementById("immoFinanceNav");
    if (!nav || document.getElementById("piPretGuide")) return;
    var page = (location.pathname.split("/").pop() || "").split("?")[0];
    if (page.indexOf("pret-immo") < 0 && page !== "crm-agency-fees.html") return;
    css();
    var wrap = document.createElement("div");
    wrap.id = "piPretGuide";
    var openByDefault = page === "crm-pret-immo.html" || page === "crm-pret-immo-docs.html";
    wrap.innerHTML = buildHtml(openByDefault);
    nav.insertAdjacentElement("afterend", wrap);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }

  window.CrmPretGuide = { mount: mount, LOAN_TYPES: LOAN_TYPES };
})();
