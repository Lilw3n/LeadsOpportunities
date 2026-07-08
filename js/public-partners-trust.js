/**
 * Bloc public : acteurs assurance / partenaires avec qui nous travaillons
 * Usage : <section data-partners-trust data-partners-context="default" data-partners-layout="showcase"></section>
 * Layouts : showcase (accueil) | featured (landings) | compact (bandeau seul)
 */
(function (global) {
  /** Partenaires actifs — aligne sur js/crm-wholesalers-data.js (status active + isVerified) */
  var PARTNERS = [
    {
      id: "sollyazar",
      name: "Solly Azar Pro",
      logo: "☀️",
      tier: "principal",
      active: true,
      tags: ["vtc", "auto", "habitation", "moto"],
      category: "vtc",
      tagline: "Référence VTC, taxi et risques aggravés",
      products: "VTC · Auto · Habitation · Santé",
    },
    {
      id: "zephir",
      name: "Zéphir",
      logo: "🌊",
      tier: "principal",
      active: true,
      tags: ["vtc", "auto", "flotte"],
      category: "vtc",
      tagline: "Spécialiste VTC, flotte et auto professionnel",
      products: "VTC · Flotte · Auto pro",
    },
    {
      id: "april",
      name: "April",
      logo: "🌿",
      tier: "principal",
      active: true,
      tags: ["sante", "prevoyance", "pro", "auto"],
      category: "sante",
      tagline: "Santé, prévoyance et protection des pros",
      products: "Mutuelle · Prévoyance · RC Pro",
    },
    {
      id: "allianz",
      name: "Allianz",
      logo: "🔵",
      tier: "principal",
      active: true,
      tags: ["auto", "habitation", "pro", "flotte"],
      category: "general",
      tagline: "Grand compte — auto, habitation, entreprises",
      products: "Auto · Habitation · Flotte · RC Pro",
    },
    {
      id: "axa",
      name: "AXA",
      logo: "🔷",
      tier: "principal",
      active: true,
      tags: ["auto", "habitation", "sante", "pro"],
      category: "general",
      tagline: "Particuliers, professionnels et santé",
      products: "Auto · Habitation · Santé · RC Pro",
    },
    {
      id: "generali",
      name: "Generali",
      logo: "🦁",
      tier: "principal",
      active: true,
      tags: ["auto", "habitation", "pro"],
      category: "general",
      tagline: "Auto, habitation, décennale et BTP",
      products: "Auto · Habitation · Décennale · RC Pro",
    },
    {
      id: "santevet",
      name: "Santévet",
      logo: "🐾",
      tier: "principal",
      active: true,
      tags: ["animaux", "sante"],
      category: "animaux",
      tagline: "Référence assurance animaux en France",
      products: "Chien · Chat · NAC",
    },
    {
      id: "bullebleue",
      name: "Bulle Bleue",
      logo: "💙",
      tier: "principal",
      active: true,
      tags: ["animaux"],
      category: "animaux",
      tagline: "Mutuelle animaux reconnue",
      products: "Chien · Chat",
    },
    {
      id: "kozoo",
      name: "Kozoo",
      logo: "🦴",
      tier: "principal",
      active: true,
      tags: ["animaux"],
      category: "animaux",
      tagline: "Formules digitales animaux",
      products: "Chien · Chat",
    },
    {
      id: "swisslife",
      name: "Swiss Life",
      logo: "🔴",
      tier: "reseau",
      active: true,
      tags: ["sante", "prevoyance"],
      category: "sante",
      tagline: "Prévoyance et épargne",
      products: "Prévoyance · Santé · Vie",
    },
  ];

  var LOGO_FILES = {
    sollyazar: "solly-azar.png",
    zephir: "zephir.png",
    april: "april.png",
    allianz: "allianz.png",
    axa: "axa.png",
    generali: "generali.png",
    santevet: "santevet.png",
    bullebleue: "bulle-bleue.png",
    kozoo: "kozoo.png",
    swisslife: "swiss-life.png",
  };

  var CATEGORIES = [
    { id: "vtc", label: "VTC & mobilité pro", icon: "🚕" },
    { id: "animaux", label: "Assurance animaux", icon: "🐾" },
    { id: "sante", label: "Santé & prévoyance", icon: "💊" },
    { id: "general", label: "Particuliers & professionnels", icon: "🏢" },
  ];

  var COPY = {
    default: {
      badge: "Nos partenaires assurance",
      title: "Les acteurs importants avec qui nous travaillons",
      lead:
        "Solly Azar, Zéphir, April, Allianz, AXA, Generali… : des noms que vos clients connaissent. Nous comparons leurs offres via notre réseau de courtage — pas un assureur obscur.",
      speed: "Devis en 2 min · Rappel sous 15 min · Courtier ORIAS",
      filter: null,
    },
    vtc: {
      badge: "Partenaires VTC",
      title: "Solly Azar Pro & Zéphir — nos références chauffeurs",
      lead:
        "Pour l’assurance VTC, nous passons en priorité par les grossistes reconnus du secteur, complétés par Allianz, AXA et Generali selon votre profil.",
      speed: "Express 30 sec ou questionnaire complet · rappel rapide",
      partnerCategories: ["vtc", "general"],
      categories: ["vtc", "general"],
    },
    sante: {
      badge: "Partenaires santé",
      title: "April, AXA, Swiss Life — mutuelles du marché",
      lead:
        "Comparatif parmi des acteurs santé et prévoyance que tout le monde connaît. Un conseiller vous explique les garanties sans jargon.",
      speed: "2 min pour démarrer · accompagnement humain",
      partnerCategories: ["sante", "general"],
      categories: ["sante", "general"],
    },
    credit: {
      badge: "Financement",
      title: "Banques et courtiers immo partenaires",
      lead:
        "Pour le crédit immobilier, orientation vers des établissements et courtiers habituels du marché français.",
      speed: "Simulation gratuite · réponse sous 24–48 h",
      filter: [],
      categories: [],
    },
    animaux: {
      badge: "Assurance animaux",
      title: "Santévet, Bulle Bleue, Kozoo… acteurs connus",
      lead:
        "Assurance chien et chat : nous comparons les specialistes que les propriétaires connaissent déjà, avec un conseiller qui explique plafonds et franchises.",
      speed: "Express 30 sec · ou questionnaire 3 min · rappel rapide",
      partnerCategories: ["animaux", "sante", "general"],
      categories: ["animaux"],
    },
    express: {
      badge: "Rappel prioritaire",
      title: "Comparaison via notre réseau d’assureurs",
      lead:
        "En 30 secondes, vous êtes rappelé : nous comparons Solly Azar, Zéphir, Allianz, AXA et le reste du réseau selon votre besoin.",
      speed: "30 secondes pour être rappelé",
      partnerCategories: ["vtc", "general"],
      categories: ["vtc", "general"],
    },
  };

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getBasePrefix(el) {
    var custom = el && el.getAttribute("data-partners-base");
    if (custom) return custom;
    var path = window.location.pathname || "";
    if (path.indexOf("/landings/") >= 0) return "../";
    if (path.indexOf("/assurances/") >= 0) return "../";
    return "./";
  }

  function partnerHref(p, el, ctxKey) {
    var base = getBasePrefix(el);
    var path = window.location.pathname || "";
    var onLanding = path.indexOf("/landings/") >= 0;

    if (onLanding) {
      if (p.category === "animaux" || p.tags.indexOf("animaux") >= 0) {
        return base + "assurance-animaux/";
      }
      return "#demande";
    }

    if (p.category === "animaux" || p.tags.indexOf("animaux") >= 0) {
      return base + "assurance-animaux/";
    }
    if (p.tags.indexOf("vtc") >= 0 || p.category === "vtc") {
      return base + "landings/vtc.html";
    }
    if (p.tags.indexOf("sante") >= 0 || p.category === "sante") {
      return base + "landings/sante.html";
    }
    if (ctxKey === "credit") {
      return base + "landings/credit-immo.html";
    }
    return base + "assurances/";
  }

  function logoBase(el) {
    var base = getBasePrefix(el);
    return base + "img/partners/";
  }

  function renderPartnerLogo(p, el) {
    var file = LOGO_FILES[p.id];
    if (file) {
      var tall = p.id === "swisslife" || p.id === "bullebleue" || p.id === "generali";
      return (
        '<img class="partner-card-logo-img' +
        (tall ? " partner-card-logo-img--tall" : "") +
        '" src="' +
        esc(logoBase(el) + file) +
        '" alt="' +
        esc(p.name) +
        '" width="148" height="40" loading="lazy" decoding="async">'
      );
    }
    return '<span class="partner-card-logo" aria-hidden="true">' + esc(p.logo) + "</span>";
  }

  function renderPartnerCard(p, compact, href, el) {
    var tierLabel =
      p.tier === "principal"
        ? '<span class="partner-card-badge partner-card-badge--active">Partenaire actif</span>'
        : '<span class="partner-card-badge">Réseau</span>';
    var actionHint = '<span class="card-action-hint">Voir les offres →</span>';
    var logoMarkup = renderPartnerLogo(p, el);
    if (compact) {
      return (
        '<a class="partner-card-link" href="' +
        esc(href) +
        '" aria-label="Offres ' +
        esc(p.name) +
        '">' +
        '<article class="partner-card partner-card--compact">' +
        logoMarkup +
        '<strong class="partner-card-name">' +
        esc(p.name) +
        "</strong>" +
        "</article></a>"
      );
    }
    return (
      '<a class="partner-card-link" href="' +
      esc(href) +
      '" aria-label="Comparer avec ' +
      esc(p.name) +
      '">' +
      '<article class="partner-card partner-card--' +
      esc(p.tier) +
      '">' +
      tierLabel +
      logoMarkup +
      '<h3 class="partner-card-name">' +
      esc(p.name) +
      "</h3>" +
      '<p class="partner-card-tagline">' +
      esc(p.tagline) +
      "</p>" +
      '<p class="partner-card-products">' +
      esc(p.products) +
      "</p>" +
      actionHint +
      "</article></a>"
    );
  }

  function partnerMatchesContext(p, ctx) {
    var cats = ctx.partnerCategories;
    if (!cats || !cats.length) return true;
    if (cats.indexOf(p.category) >= 0) return true;
    return p.tags.some(function (t) {
      return cats.indexOf(t) >= 0;
    });
  }

  function partnersForContext(ctxKey) {
    var ctx = COPY[ctxKey] || COPY.default;
    var list = PARTNERS.filter(function (p) {
      return partnerMatchesContext(p, ctx);
    });
    if (!list.length) return PARTNERS.filter(function (p) { return p.tier === "principal"; });
    return list;
  }

  function renderCategoryBlock(cat, partners, compact, el, ctxKey) {
    var inCat = partners.filter(function (p) {
      return p.category === cat.id;
    });
    if (!inCat.length) return "";
    var cards = inCat
      .map(function (p) {
        return renderPartnerCard(p, compact, partnerHref(p, el, ctxKey), el);
      })
      .join("");
    return (
      '<div class="partners-category-block">' +
      '<h3 class="partners-category-title"><span aria-hidden="true">' +
      esc(cat.icon) +
      "</span> " +
      esc(cat.label) +
      "</h3>" +
      '<div class="partners-featured-grid">' +
      cards +
      "</div></div>"
    );
  }

  function renderMarquee(partners) {
    var principals = partners.filter(function (p) {
      return p.tier === "principal";
    });
    var list = principals.length ? principals : partners;
    var chips = list
      .map(function (b) {
        return '<span class="partner-chip">' + esc(b.name) + "</span>";
      })
      .join("");
    var chipsDup = list
      .map(function (b) {
        return '<span class="partner-chip" aria-hidden="true">' + esc(b.name) + "</span>";
      })
      .join("");
    return (
      '<div class="partners-marquee" aria-label="Assureurs et partenaires">' +
      '<div class="partners-marquee-track">' +
      chips +
      chipsDup +
      "</div></div>"
    );
  }

  function renderFeaturedGrid(ctxKey, layout, el) {
    var ctx = COPY[ctxKey] || COPY.default;
    var partners = partnersForContext(ctxKey);
    var compact = layout === "featured" || layout === "compact";
    var cats = ctx.categories;
    var html = "";

    if (layout === "showcase" || layout === "featured") {
      var catIds = cats && cats.length ? cats : CATEGORIES.map(function (c) { return c.id; });
      catIds.forEach(function (cid) {
        var cat = CATEGORIES.find(function (c) {
          return c.id === cid;
        });
        if (cat) html += renderCategoryBlock(cat, partners, compact, el, ctxKey);
      });
      if (!html && partners.length) {
        html =
          '<div class="partners-featured-grid partners-featured-grid--flat">' +
          partners
            .map(function (p) {
              return renderPartnerCard(p, compact, partnerHref(p, el, ctxKey), el);
            })
            .join("") +
          "</div>";
      }
    }

    if (layout === "compact") {
      html =
        '<div class="partners-featured-grid partners-featured-grid--flat partners-featured-grid--compact">' +
        partners
          .filter(function (p) { return p.tier === "principal"; })
          .map(function (p) {
            return renderPartnerCard(p, true, partnerHref(p, el, ctxKey), el);
          })
          .join("") +
        "</div>";
    }

    return html + (layout !== "compact" ? renderMarquee(partners) : "");
  }

  function renderMarkup(ctxKey, layout, el) {
    var ctx = COPY[ctxKey] || COPY.default;
    layout = layout || "showcase";

    return (
      '<div class="partners-trust-inner partners-trust-inner--' +
      esc(layout) +
      '">' +
      '<div class="partners-trust-head">' +
      '<span class="section-badge">' +
      esc(ctx.badge) +
      "</span>" +
      "<h2>" +
      esc(ctx.title) +
      "</h2>" +
      '<p class="partners-trust-lead">' +
      esc(ctx.lead) +
      "</p>" +
      '<p class="partners-trust-speed"><strong>' +
      esc(ctx.speed) +
      "</strong></p>" +
      "</div>" +
      renderFeaturedGrid(ctxKey, layout, el) +
      '<p class="partners-trust-legal">Marques citées à titre indicatif selon notre réseau de courtage et grossistes. Courtier inscrit ORIAS — pas de lien capitalistique exclusif avec les compagnies nommées.</p>' +
      "</div>"
    );
  }

  function mountAll() {
    var nodes = document.querySelectorAll("[data-partners-trust]");
    nodes.forEach(function (el) {
      var ctx = el.getAttribute("data-partners-context") || "default";
      var layout = el.getAttribute("data-partners-layout") || "showcase";
      if (layout === "auto") {
        layout = ctx === "default" ? "showcase" : "featured";
      }
      el.classList.add("partners-trust-section", "partners-mounted");
      el.innerHTML = renderMarkup(ctx, layout, el);
    });
  }

  global.PublicPartnersTrust = {
    PARTNERS: PARTNERS,
    CATEGORIES: CATEGORIES,
    COPY: COPY,
    renderMarkup: renderMarkup,
    mountAll: mountAll,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountAll);
  } else {
    mountAll();
  }
})(typeof window !== "undefined" ? window : globalThis);
