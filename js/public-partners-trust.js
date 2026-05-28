/**
 * Bloc public : rapidite + assureurs / partenaires connus (social proof)
 * Usage : <section data-partners-trust data-partners-context="vtc"></section>
 */
(function (global) {
  var BRANDS = [
    { name: "Allianz", tags: ["auto", "habitation", "pro"] },
    { name: "AXA", tags: ["auto", "habitation", "sante", "pro"] },
    { name: "Generali", tags: ["auto", "habitation", "pro"] },
    { name: "April", tags: ["sante", "prevoyance", "pro"] },
    { name: "Solly Azar Pro", tags: ["vtc", "auto", "habitation"] },
    { name: "Zéphir", tags: ["vtc", "auto", "flotte"] },
    { name: "Swiss Life", tags: ["sante", "prevoyance"] },
    { name: "Mila", tags: ["auto", "habitation"] },
    { name: "Assurmax", tags: ["pro", "auto"] },
  ];

  var COPY = {
    default: {
      badge: "Réseau partenaires",
      title: "Des assureurs que vous connaissez déjà",
      lead:
        "Les gens choisissent ce qui est rapide et reconnu. Nous comparons les offres via notre réseau de partenaires et compagnies du marché — pas un assureur inconnu au hasard.",
      speed: "Formulaire en 2 min · Rappel sous 15 min en journée",
    },
    vtc: {
      badge: "VTC — partenaires connus",
      title: "Allianz, Zéphir, Solly Azar… des noms rassurants",
      lead:
        "Spécialistes VTC et auto pro : nous passons par des partenaires reconnus des chauffeurs. Devis express ou questionnaire complet — vous choisissez la rapidité.",
      speed: "Express 30 sec · ou questionnaire détaillé · rappel rapide",
      filter: ["vtc", "auto", "flotte", "pro"],
    },
    sante: {
      badge: "Santé — réseau connu",
      title: "April, AXA, Swiss Life… mutuelles du marché",
      lead:
        "Pas de petite marque inconnue : comparaison parmi des acteurs que vos proches connaissent déjà. Un conseiller vous explique clairement les garanties.",
      speed: "2 min pour démarrer · accompagnement humain",
      filter: ["sante", "prevoyance"],
    },
    credit: {
      badge: "Crédit — réseau bancaire",
      title: "Banques et courtiers reconnus",
      lead:
        "Simulation rapide, puis orientation vers des partenaires financement habituels du marché immobilier. Simple, connu, sans jargon inutile.",
      speed: "Simulation gratuite · réponse sous 24–48 h",
      filter: [],
    },
    express: {
      badge: "Le plus rapide",
      title: "Rappel prioritaire — sans attendre",
      lead:
        "Nom + téléphone : un conseiller vous rappelle et compare les offres via Allianz, AXA, Zéphir, Solly Azar et le reste du réseau.",
      speed: "30 secondes pour être rappelé",
      filter: ["vtc", "auto"],
    },
  };

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function brandsForContext(ctxKey) {
    var ctx = COPY[ctxKey] || COPY.default;
    var tags = ctx.filter;
    if (!tags || !tags.length) return BRANDS;
    return BRANDS.filter(function (b) {
      return b.tags.some(function (t) {
        return tags.indexOf(t) >= 0;
      });
    });
  }

  function renderMarkup(ctxKey) {
    var ctx = COPY[ctxKey] || COPY.default;
    var brands = brandsForContext(ctxKey);
    if (!brands.length) brands = BRANDS;

    var chips = brands
      .map(function (b) {
        return '<span class="partner-chip">' + esc(b.name) + "</span>";
      })
      .join("");

    var chipsDup = brands
      .map(function (b) {
        return '<span class="partner-chip" aria-hidden="true">' + esc(b.name) + "</span>";
      })
      .join("");

    return (
      '<div class="partners-trust-inner">' +
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
      '<div class="partners-marquee" aria-label="Assureurs et partenaires du réseau">' +
      '<div class="partners-marquee-track">' +
      chips +
      chipsDup +
      "</div>" +
      "</div>" +
      '<p class="partners-trust-legal">Marques citées à titre indicatif. Courtier inscrit ORIAS — nous orientons vers les solutions adaptées via notre réseau de partenaires et grossistes (sans exclusivité).</p>' +
      "</div>"
    );
  }

  function mountAll() {
    var nodes = document.querySelectorAll("[data-partners-trust]");
    nodes.forEach(function (el) {
      var ctx = el.getAttribute("data-partners-context") || "default";
      el.classList.add("partners-trust-section");
      el.innerHTML = renderMarkup(ctx);
    });
  }

  global.PublicPartnersTrust = {
    BRANDS: BRANDS,
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
