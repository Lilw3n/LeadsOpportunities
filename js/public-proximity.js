/**

 * Proximité humaine — assurance en ligne avec vrai conseiller

 * <section data-proximity-block data-proximity-context="default"></section>

 */

(function (global) {

  var SITE = {

    brand: "Leads Opportunities",

    email: "contact@leadsopportunities.fr",

    city: "Varangeville",

    region: "Grand Est",

    hours: "Lun–Ven, 9h–18h",

    response: "Rappel moyen : 15 min (journée ouvrée)",

    callbackLabel: "Demande de rappel",

    callbackCta: "Demander un rappel",

  };



  var TEAM = [

    {

      initials: "LO",

      name: "Conseiller dédié",

      role: "Équipe Leads Opportunities · ORIAS",

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

        "Mutuelle et prévoyance en langage clair. Un conseiller prend le temps pour détailler optique, dentaire et hospitalisation.",

    },

    credit: {

      badge: "Courtier crédit immo",

      title: "Un interlocuteur unique pour votre projet",

      lead:

        "Simulation en ligne, puis suivi humain jusqu’au notaire. Même conseiller, mêmes coordonnées — pas de plateforme impersonnelle.",

    },

    animaux: {

      badge: "Conseiller animaux",

      title: "Votre animal mérite un conseiller humain",

      lead:

        "Chien ou chat : on ne vous envoie pas un PDF incompréhensible. Un conseiller vous rappelle, compare Santévet / Bulle Bleue / Kozoo et vous aide à choisir.",

    },

    express: {

      badge: "Rappel prioritaire",

      title: "30 secondes en ligne, rappel par un conseiller",

      lead:

        "Vous laissez vos coordonnées : un conseiller vous rappelle rapidement pour faire le point, où que vous soyez en France.",

    },

  };



  var CALLBACK_ICON =

    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">' +

    '<path d="M4 4h16v16H4z"/><path d="M8 2v4M16 2v4M4 10h16"/><path d="M12 14v4M10 16h4"/></svg>';



  function esc(s) {

    return String(s)

      .replace(/&/g, "&amp;")

      .replace(/</g, "&lt;")

      .replace(/>/g, "&gt;")

      .replace(/"/g, "&quot;");

  }



  function getCallbackHref() {

    var contact = document.getElementById("contact");

    if (contact) return "#contact";



    var form = document.querySelector("[data-quick-devis], [data-track-form], #contactForm, .contact-form");

    if (form) {

      if (!form.id) form.id = "demande-rappel";

      return "#" + form.id;

    }



    var path = (window.location.pathname || "").toLowerCase();

    if (/\/landings\//.test(path)) return "./devis-rapide.html";



    var segments = path.split("/").filter(Boolean);

    var up = segments.length > 1 ? "../" : "./";

    return up + "index.html#contact";

  }



  function renderCallbackLink(className, label, withIcon) {

    className = className || "proximity-callback";

    label = label || SITE.callbackCta;

    return (

      '<a class="' +

      esc(className) +

      '" href="' +

      esc(getCallbackHref()) +

      '">' +

      (withIcon ? CALLBACK_ICON : "") +

      esc(label) +

      "</a>"

    );

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

      '<p class="proximity-contact-label">Être rappelé par un conseiller</p>' +

      renderCallbackLink("proximity-callback", SITE.callbackCta, true) +

      '<p class="proximity-callback-note">Laissez votre numéro dans le formulaire — rappel ' +

      esc(SITE.hours.toLowerCase()) +

      "</p>" +

      renderCallbackLink("proximity-callback proximity-callback--secondary", SITE.callbackLabel, false) +

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

      { icon: "🔔", title: "On vous rappelle", text: "Vous remplissez en ligne, on vous rappelle sur le créneau choisi." },

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

      '<a href="' +

      esc(getCallbackHref()) +

      '" class="proximity-bar-call" aria-label="Demander un rappel">' +

      "🔔 " +

      esc(SITE.callbackLabel) +

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

      var rappel = document.createElement("a");

      rappel.href = getCallbackHref();

      rappel.className = "mobile-cta-secondary";

      rappel.setAttribute("aria-label", "Demande de rappel");

      rappel.textContent = "Rappel";

      wrap.classList.remove("mobile-cta-single");

      wrap.appendChild(rappel);

    });

  }



  function enhanceContactSections() {

    var href = getCallbackHref();

    document.querySelectorAll("[data-proximity-contact-hint]").forEach(function (el) {

      el.innerHTML =

        '<div class="proximity-contact-hint">' +

        "<strong>Préférez être rappelé ?</strong> " +

        '<a href="' +

        esc(href) +

        '">' +

        esc(SITE.callbackLabel) +

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

  global.PublicProximity = { SITE: SITE, getCallbackHref: getCallbackHref, mountAll: mountAll };



  if (document.readyState === "loading") {

    document.addEventListener("DOMContentLoaded", mountAll);

  } else {

    mountAll();

  }

})(typeof window !== "undefined" ? window : globalThis);

