/**
 * Rétention visiteurs — ne pas partir sans devis / rappel.
 * Exit-intent, idle, abandon de formulaire : messages « opportunité perdue ».
 *
 * Usage : charger après attribution + callback-form.
 *   <link rel="stylesheet" href="../css/retention-opportunity.css" />
 *   <script src="../js/retention-opportunity.js"></script>
 *   <body data-retention-need="sante"> … </body>
 */
(function (global) {
  var STORAGE_KEY = "lo_retention_v1";
  var MAX_SHOWS = 2;
  var IDLE_MS = 55000;
  var MIN_ENGAGE_MS = 8000;

  var COPY_BY_NEED = {
    sante: {
      eyebrow: "Une seconde avant de partir",
      title: "Partir sans devis = laisser de l'argent sur la table",
      body:
        "Sans comparatif, vous gardez peut‑être une mutuelle trop chère (optique, dentaire, hospit). Le devis est gratuit — 2 minutes ou un rappel.",
      loss: "Opportunité manquée : économies mutuelle non chiffrées.",
      primary: "Continuer mon devis",
      secondary: "Rappel 15 min",
    },
    credit_immo: {
      eyebrow: "Ne partez pas les mains vides",
      title: "Sans simulation, vous achetez à l'aveugle",
      body:
        "Capacité réelle, taux, assurance emprunteur : sans dossier, les banques ne négocient pas pour vous. Étude gratuite, sans engagement.",
      loss: "Opportunité manquée : conditions de prêt non comparées.",
      primary: "Reprendre la simulation",
      secondary: "Être rappelé",
    },
    credit: {
      eyebrow: "Ne partez pas les mains vides",
      title: "Sans simulation, vous achetez à l'aveugle",
      body:
        "Capacité réelle, taux, assurance emprunteur : sans dossier, les banques ne négocient pas pour vous. Étude gratuite, sans engagement.",
      loss: "Opportunité manquée : conditions de prêt non comparées.",
      primary: "Reprendre la simulation",
      secondary: "Être rappelé",
    },
    auto: {
      eyebrow: "Attendez",
      title: "Sans devis, impossible de savoir si vous surpayez",
      body:
        "Bonus-malus, usage, franchises : un devis express compare en quelques minutes. Gratuit, sans engagement.",
      loss: "Opportunité manquée : prime auto non optimisée.",
      primary: "Continuer le devis",
      secondary: "Rappel conseil",
    },
    habitation: {
      eyebrow: "Avant de fermer",
      title: "Votre habitation mérite le bon contrat",
      body:
        "Sinistre, PNO, locataire ou propriétaire : partir sans devis, c'est rester sur un contrat peut‑être inadapté.",
      loss: "Opportunité manquée : garanties habitation non vérifiées.",
      primary: "Finir mon devis",
      secondary: "Me rappeler",
    },
    vtc: {
      eyebrow: "Stop",
      title: "Sans assurance pro valide, vous prenez un risque",
      body:
        "Uber / Bolt / Heetch exigent une couverture adaptée. Un devis VTC évite une mauvaise surprise avant la prochaine course.",
      loss: "Opportunité manquée : conformité VTC non vérifiée.",
      primary: "Continuer le devis VTC",
      secondary: "Rappel express",
    },
    vendeur: {
      eyebrow: "Votre bien attend",
      title: "Partir sans dépôt = laisser passer des acquéreurs",
      body:
        "Pendant que vous hésitez, d'autres vendeurs matchent des acheteurs financés. Déposer prend peu de temps — ou demandez un rappel.",
      loss: "Opportunité manquée : acquéreurs non contactés.",
      primary: "Déposer mon bien",
      secondary: "Rappel conseiller",
    },
    acheteur: {
      eyebrow: "Ne perdez pas votre enveloppe",
      title: "Sans critères, on ne peut pas vous trouver le bien",
      body:
        "Budget, ville, type : 2 minutes pour alerter sur les bonnes annonces. Sinon, les opportunités passent à côté.",
      loss: "Opportunité manquée : alertes bien non activées.",
      primary: "Continuer ma recherche",
      secondary: "Rappel immo",
    },
    rachat: {
      eyebrow: "Vos mensualités peuvent baisser",
      title: "Partir sans étude = garder des crédits trop lourds",
      body:
        "Un rachat / regroupement se chiffre. Sans dossier, impossible de savoir combien vous pourriez économiser chaque mois.",
      loss: "Opportunité manquée : baisse de mensualité non calculée.",
      primary: "Reprendre l'étude",
      secondary: "Rappel RAC",
    },
    default: {
      eyebrow: "Une dernière chose",
      title: "Quitter maintenant, c'est perdre une opportunité",
      body:
        "Devis, prêt ou rappel : c'est gratuit et sans engagement. Les visiteurs qui partent sans rien laisser passent à côté d'économies réelles.",
      loss: "Opportunité manquée : conseil ORIAS non démarré.",
      primary: "Continuer",
      secondary: "Rappel 15 min",
    },
  };

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function state() {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}") || {};
    } catch (e) {
      return {};
    }
  }

  function saveState(next) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      /* ignore */
    }
  }

  function detectNeed() {
    var body = document.body;
    var fromData = (body && body.getAttribute("data-retention-need")) || "";
    if (fromData) return fromData;
    var q = new URLSearchParams(location.search);
    var need = q.get("need") || q.get("role") || "";
    if (need === "vendeur" || need === "les_deux") return "vendeur";
    if (need === "acheteur" || need === "acquereur") return "acheteur";
    if (need) return need;
    var path = location.pathname || "";
    if (/credit-immo|pret|projection-achat/i.test(path)) return "credit_immo";
    if (/sante/i.test(path)) return "sante";
    if (/acheteur-immo/i.test(path)) {
      return /vendeur|role=vendeur/i.test(location.search) ? "vendeur" : "acheteur";
    }
    if (/rachat/i.test(path)) return "rachat";
    if (/vtc/i.test(path)) return "vtc";
    if (/habitation/i.test(path)) return "habitation";
    if (/auto|devis/i.test(path)) return "auto";
    return "default";
  }

  function copyFor(need) {
    return COPY_BY_NEED[need] || COPY_BY_NEED.default;
  }

  function alreadySubmitted() {
    if (document.body && document.body.getAttribute("data-lead-submitted") === "1") return true;
    if (global.QuoteIntelligence && global.QuoteIntelligence.isSubmitted) {
      try {
        if (global.QuoteIntelligence.isSubmitted()) return true;
      } catch (e) {
        /* ignore */
      }
    }
    try {
      if (sessionStorage.getItem("lo_lead_ok") === "1") return true;
    } catch (e) {
      /* ignore */
    }
    return false;
  }

  function canShow() {
    if (alreadySubmitted()) return false;
    if (document.getElementById("lo-retention-modal")) return false;
    var s = state();
    if ((s.shows || 0) >= MAX_SHOWS) return false;
    if (s.dismissedHard) return false;
    return true;
  }

  function track(eventName, extra) {
    try {
      if (typeof global.gtag === "function") {
        global.gtag("event", eventName, Object.assign({ event_category: "retention" }, extra || {}));
      }
    } catch (e) {
      /* ignore */
    }
    try {
      if (typeof global.trackJourneyEvent === "function") {
        global.trackJourneyEvent(eventName, extra || {});
      } else if (global.Attribution && typeof global.Attribution.track === "function") {
        global.Attribution.track(eventName, extra || {});
      }
    } catch (e2) {
      /* ignore */
    }
  }

  function rappelUrl(need) {
    var u = new URL("/landings/rappel.html", location.origin);
    if (need && need !== "default" && need !== "vendeur" && need !== "acheteur") {
      u.searchParams.set("need", need === "credit_immo" ? "credit-immo" : need);
    }
    u.searchParams.set("utm_source", "retention");
    u.searchParams.set("utm_medium", "exit_intent");
    u.searchParams.set("utm_content", need || "default");
    return u.pathname + u.search;
  }

  function focusFirstField() {
    var el =
      document.querySelector("[data-retention-focus]") ||
      document.querySelector("form input:not([type=hidden]):not([tabindex='-1'])") ||
      document.querySelector(".callback-form input") ||
      document.querySelector("main form input");
    if (el && typeof el.focus === "function") {
      try {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus();
      } catch (e) {
        /* ignore */
      }
    }
  }

  function closeModal(hard) {
    var root = document.getElementById("lo-retention-modal");
    if (root) root.remove();
    document.documentElement.classList.remove("lo-retention-open");
    var s = state();
    s.shows = (s.shows || 0) + 1;
    if (hard) s.dismissedHard = true;
    s.lastAt = Date.now();
    saveState(s);
  }

  function showModal(reason) {
    if (!canShow()) return false;
    var need = detectNeed();
    var copy = copyFor(need);
    track("retention_shown", { reason: reason, need: need });

    var root = document.createElement("div");
    root.id = "lo-retention-modal";
    root.className = "lo-retention";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-labelledby", "lo-retention-title");
    root.innerHTML =
      '<div class="lo-retention-backdrop" data-ret-close></div>' +
      '<div class="lo-retention-card">' +
      '<button type="button" class="lo-retention-x" data-ret-hard aria-label="Fermer">×</button>' +
      '<p class="lo-retention-eyebrow">' +
      esc(copy.eyebrow) +
      "</p>" +
      '<h2 id="lo-retention-title" class="lo-retention-title">' +
      esc(copy.title) +
      "</h2>" +
      '<p class="lo-retention-body">' +
      esc(copy.body) +
      "</p>" +
      '<p class="lo-retention-loss" role="status">' +
      esc(copy.loss) +
      "</p>" +
      '<ul class="lo-retention-bullets">' +
      "<li>Gratuit et sans engagement</li>" +
      "<li>Courtier ORIAS — un vrai interlocuteur</li>" +
      "<li>Rappel possible en journée (15 min)</li>" +
      "</ul>" +
      '<div class="lo-retention-actions">' +
      '<button type="button" class="lo-retention-btn lo-retention-btn--primary" data-ret-continue>' +
      esc(copy.primary) +
      "</button>" +
      '<a class="lo-retention-btn lo-retention-btn--secondary" href="' +
      esc(rappelUrl(need)) +
      '" data-ret-rappel>' +
      esc(copy.secondary) +
      "</a>" +
      "</div>" +
      '<button type="button" class="lo-retention-skip" data-ret-hard>Je préfère partir sans devis</button>' +
      "</div>";

    document.body.appendChild(root);
    document.documentElement.classList.add("lo-retention-open");

    root.querySelector("[data-ret-continue]").addEventListener("click", function () {
      track("retention_continue", { reason: reason, need: need });
      closeModal(false);
      focusFirstField();
    });
    root.querySelector("[data-ret-rappel]").addEventListener("click", function () {
      track("retention_rappel_click", { reason: reason, need: need });
    });
    root.querySelectorAll("[data-ret-hard]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        track("retention_dismiss", { reason: reason, need: need, hard: true });
        closeModal(true);
      });
    });
    root.querySelector("[data-ret-close]").addEventListener("click", function () {
      track("retention_dismiss", { reason: reason, need: need, hard: false });
      closeModal(false);
    });

    return true;
  }

  function engaged() {
    var s = state();
    return !!(s.engaged || s.formStarted || s.typed);
  }

  function markEngaged(kind) {
    var s = state();
    s.engaged = true;
    if (kind === "form") s.formStarted = true;
    if (kind === "type") s.typed = true;
    saveState(s);
  }

  function bind() {
    if (document.body && document.body.getAttribute("data-retention") === "off") return;
    if (/rappel\.html/i.test(location.pathname)) return;

    var startedAt = Date.now();
    var idleTimer = null;

    function resetIdle() {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(function () {
        if (Date.now() - startedAt < MIN_ENGAGE_MS) return;
        if (!engaged() && !document.querySelector("form input:focus")) {
          // soft nudge even without typing after long stare
          markEngaged("idle_view");
        }
        if (engaged()) showModal("idle");
      }, IDLE_MS);
    }

    document.addEventListener(
      "input",
      function () {
        markEngaged("type");
        resetIdle();
      },
      true
    );
    document.addEventListener(
      "change",
      function () {
        markEngaged("form");
        resetIdle();
      },
      true
    );
    document.addEventListener(
      "click",
      function (e) {
        var t = e.target;
        if (t && t.closest && t.closest("form, .btn-primary, [data-wizard-next], .callback-strip")) {
          markEngaged("form");
        }
        resetIdle();
      },
      true
    );

    // Exit intent desktop
    document.addEventListener("mouseout", function (e) {
      if (!e) return;
      if (e.clientY > 12) return;
      if (e.relatedTarget || e.toElement) return;
      if (Date.now() - startedAt < MIN_ENGAGE_MS) return;
      showModal("exit_intent");
    });

    // Mobile / tab switch after engagement
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState !== "hidden") return;
      if (Date.now() - startedAt < MIN_ENGAGE_MS) return;
      if (!engaged()) return;
      // cannot show modal while hidden; flag for return
      var s = state();
      s.pendingReturn = true;
      saveState(s);
    });
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState !== "visible") return;
      var s = state();
      if (s.pendingReturn) {
        s.pendingReturn = false;
        saveState(s);
        showModal("return_tab");
      }
    });

    // Soft banner after 25s if zero interaction
    setTimeout(function () {
      if (alreadySubmitted() || engaged()) return;
      if (state().bannerShown) return;
      showBanner();
    }, 25000);

    resetIdle();
  }

  function showBanner() {
    if (document.getElementById("lo-retention-banner")) return;
    var need = detectNeed();
    var copy = copyFor(need);
    var s = state();
    s.bannerShown = true;
    saveState(s);
    track("retention_banner_shown", { need: need });

    var bar = document.createElement("div");
    bar.id = "lo-retention-banner";
    bar.className = "lo-retention-banner";
    bar.innerHTML =
      '<p><strong>Conseil :</strong> ' +
      esc(copy.loss) +
      ' — <button type="button" data-ret-open>voir pourquoi</button></p>' +
      '<button type="button" class="lo-retention-banner-x" data-ret-banner-x aria-label="Fermer">×</button>';
    document.body.appendChild(bar);
    bar.querySelector("[data-ret-open]").addEventListener("click", function () {
      bar.remove();
      showModal("banner");
    });
    bar.querySelector("[data-ret-banner-x]").addEventListener("click", function () {
      bar.remove();
    });
  }

  global.RetentionOpportunity = {
    show: showModal,
    detectNeed: detectNeed,
    COPY_BY_NEED: COPY_BY_NEED,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})(typeof window !== "undefined" ? window : globalThis);
