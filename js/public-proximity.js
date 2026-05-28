/**
 * Proximité humaine — assurance en ligne avec vrai conseiller
 * <section data-proximity-block data-proximity-context="default"></section>
 * <div data-proximity-bar></div>
 */
(function (global) {
  var SITE = {
    brand: "Leads Opportunities",
    founder: "Wendy Buchet",
    founderRole: "Fondateur · Courtier ORIAS",
    phone: "+33695820866",
    phoneDisplay: "06 95 82 08 66",
    email: "contact@leadsopportunities.fr",
    city: "Varangeville",
    department: "Meurthe-et-Moselle",
    region: "Grand Est",
    country: "France",
    hours: "Lun–Ven, 9h–18h",
    response: "Rappel moyen : 15 min (journée ouvrée)",
  };

  var TEAM = [
    {
      initials: "WB",
      name: "Wendy Buchet",
      role: "Votre interlocuteur principal",
      tone: "founder",
    },
    {
      initials: "VC",
      name: "Conseillers VTC",
      role: "Chauffeurs & mobilité pro",
      tone: "teal",
    },
    {
      initials: "SC",
      name: "Conseillers santé & crédit",
      role: "Mutuelle, prévoyance, immo",
      tone: "blue",
    },
  ];

  var COPY = {
    default: {
      badge: "Proximité humaine",
      title: "Assurance en ligne, relation de proximité",
      lead:
        "Pas de chatbot qui tourne en rond : un conseiller dédié vous rappelle, vous explique et vous suit — du premier devis jusqu’après la signature. Comme en agence, sans vous déplacer.",
    },
    vtc: {
      badge: "Conseiller VTC dédié",
      title: "Un humain qui connaît les chauffeurs",
      lead:
        "VTC, taxi, flotte : vous échangez avec un conseiller spécialisé, pas une machine. Il connaît Solly Azar, Zéphir et les contraintes plateformes.",
    },
    sante: {
      badge: "Accompagnement santé",
      title: "On vous explique, on ne vous noie pas",
      lead:
        "Mutuelle et prévoyance en langage clair. Un conseiller prend le temps au téléphone — optique, dentaire, hospitalisation : on détaille ensemble.",
    },
    credit: {
      badge: "Courtier crédit immo",
      title: "Un interlocuteur unique pour votre projet",
      lead:
        "Simulation en ligne, puis suivi humain jusqu’au notaire. Même conseiller, mêmes coordonnées — pas de plateforme impersonnelle.",
    },
    express: {
      badge: "Rappel prioritaire",
      title: "30 secondes en ligne, un humain au téléphone",
      lead:
        "Vous laissez vos coordonnées : un conseiller vous rappelle rapidement pour faire le point, où que vous soyez en France.",
    },
  };

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderTeamCards(compact) {
    return TEAM.map(function (m) {
      if (compact) {
        return (
          '<div class="proximity-person proximity-person--compact">' +
          '<span class="proximity-avatar proximity-avatar--' +
          esc(m.tone) +
          '">' +
          esc(m.initials) +
          "</span>" +
          "<span>" +
          esc(m.name) +
          "</span></div>"
        );
      }
      return (
        '<article class="proximity-person">' +
        '<span class="proximity-avatar proximity-avatar--' +
        esc(m.tone) +
        '">' +
        esc(m.initials) +
        "</span>" +
        "<div><strong>" +
        esc(m.name) +
        "</strong><span>" +
        esc(m.role) +
        "</span></div></article>"
      );
    }).join("");
  }

  function renderContactCard(franceHref) {
    franceHref = franceHref || "./france/";
    return (
      '<div class="proximity-contact-card">' +
      '<p class="proximity-contact-label">Joindre un conseiller</p>' +
      '<a class="proximity-phone" href="tel:' +
      esc(SITE.phone) +
      '">' +
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>' +
      esc(SITE.phoneDisplay) +
      "</a>" +
      '<a class="proximity-email" href="mailto:' +
      esc(SITE.email) +
      '">' +
      esc(SITE.email) +
      "</a>" +
      '<ul class="proximity-meta">' +
      "<li><strong>Horaires</strong> " +
      esc(SITE.hours) +
      "</li>" +
      "<li><strong>Délai</strong> " +
      esc(SITE.response) +
      "</li>" +
      "<li><strong>Basé en</strong> " +
      esc(SITE.city) +
      ", " +
      esc(SITE.region) +
      " — présent dans toute la France</li>" +
      "</ul>" +
      '<a class="btn btn-outline btn-sm" href="' +
      esc(franceHref) +
      '">Voir la couverture près de chez vous</a>' +
      "</div>"
    );
  }

  function renderPillars() {
    var items = [
      { icon: "👤", title: "Un seul interlocuteur", text: "Même conseiller du devis au suivi — pas 5 numéros différents." },
      { icon: "📞", title: "On vous rappelle", text: "Vous remplissez en ligne, on prend le relais au téléphone." },
      { icon: "🇫🇷", title: "Partout en France", text: "180+ villes : pages locales + équipe à distance, proche de vous." },
      { icon: "🤝", title: "Sans pression", text: "Devis gratuit, vous décidez. On conseille, on ne force pas." },
    ];
    return (
      '<div class="proximity-pillars">' +
      items
        .map(function (it) {
          return (
            '<div class="proximity-pillar">' +
            '<span class="proximity-pillar-icon" aria-hidden="true">' +
            it.icon +
            "</span>" +
            "<strong>" +
            esc(it.title) +
            "</strong><p>" +
            esc(it.text) +
            "</p></div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function renderBlock(ctxKey, layout) {
    var ctx = COPY[ctxKey] || COPY.default;
    var compact = layout === "compact";
    var franceHref = compact ? "../france/" : "./france/";

    return (
      '<div class="proximity-inner proximity-inner--' +
      esc(layout) +
      '">' +
      '<div class="proximity-grid">' +
      '<div class="proximity-main">' +
      '<span class="section-badge">' +
      esc(ctx.badge) +
      "</span>" +
      "<h2>" +
      esc(ctx.title) +
      "</h2>" +
      '<p class="proximity-lead">' +
      esc(ctx.lead) +
      "</p>" +
      '<div class="proximity-team">' +
      renderTeamCards(compact) +
      "</div>" +
      (compact ? "" : renderPillars()) +
      "</div>" +
      '<div class="proximity-aside">' +
      renderContactCard(franceHref) +
      "</div></div></div>"
    );
  }

  function renderBar() {
    return (
      '<a href="tel:' +
      esc(SITE.phone) +
      '" class="proximity-bar-call" aria-label="Appeler un conseiller">' +
      "📞 " +
      esc(SITE.phoneDisplay) +
      "</a>"
    );
  }

  function mountBlocks() {
    document.querySelectorAll("[data-proximity-block]").forEach(function (el) {
      var ctx = el.getAttribute("data-proximity-context") || "default";
      var layout = el.getAttribute("data-proximity-layout") || "showcase";
      el.classList.add("proximity-section");
      el.innerHTML = renderBlock(ctx, layout);
    });
  }

  function mountBars() {
    document.querySelectorAll("[data-proximity-bar]").forEach(function (el) {
      el.innerHTML = renderBar();
    });
    document.querySelectorAll(".mobile-cta[data-proximity-enhance]").forEach(function (wrap) {
      if (wrap.querySelector(".mobile-cta-secondary")) return;
      var call = document.createElement("a");
      call.href = "tel:" + SITE.phone;
      call.className = "mobile-cta-secondary";
      call.setAttribute("aria-label", "Appeler");
      call.innerHTML =
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>';
      wrap.classList.remove("mobile-cta-single");
      wrap.appendChild(call);
    });
  }

  function enhanceContactSections() {
    document.querySelectorAll("[data-proximity-contact-hint]").forEach(function (el) {
      el.innerHTML =
        '<div class="proximity-contact-hint">' +
        '<strong>Préférez le téléphone ?</strong> ' +
        '<a href="tel:' +
        esc(SITE.phone) +
        '">' +
        esc(SITE.phoneDisplay) +
        "</a> · " +
        esc(SITE.hours) +
        "</div>";
    });
  }

  function mountAll() {
    mountBlocks();
    mountBars();
    enhanceContactSections();
  }

  global.SiteContact = SITE;
  global.PublicProximity = { SITE: SITE, mountAll: mountAll };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountAll);
  } else {
    mountAll();
  }
})(typeof window !== "undefined" ? window : globalThis);
