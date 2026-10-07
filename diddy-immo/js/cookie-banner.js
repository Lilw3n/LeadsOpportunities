(function () {
  var KEY = "lo_cookie_consent_v1";
  var PREFS_KEY = "lo_cookie_preferences";

  function hasConsentRecorded() {
    if (localStorage.getItem(KEY)) return true;
    try {
      if (localStorage.getItem(PREFS_KEY)) return true;
    } catch (e) {}
    return false;
  }

  function hideBanner(el) {
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  function pushClarityConsent(level) {
    var granted = level !== "essential";
    try {
      window.clarity =
        window.clarity ||
        function () {
          (window.clarity.q = window.clarity.q || []).push(arguments);
        };
      window.clarity("consentv2", {
        ad_Storage: granted ? "granted" : "denied",
        analytics_Storage: granted ? "granted" : "denied",
      });
    } catch (e) {}
    window.dispatchEvent(new CustomEvent("lo:cookie-consent", { detail: { level: level } }));
  }

  function updateMetaConsent(level) {
    if (typeof window.fbq !== "function") return;
    try {
      window.fbq("consent", level === "all" ? "grant" : "revoke");
    } catch (e) {}
  }

  function showBanner() {
    if (document.getElementById("cookie-banner-lo")) return;

    var wrap = document.createElement("div");
    wrap.id = "cookie-banner-lo";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-label", "Cookies");
    wrap.innerHTML =
      '<div class="cookie-banner-inner">' +
      "<p><strong>Cookies</strong> — Nous utilisons des cookies pour le fonctionnement du site et, avec votre accord, pour mesurer l'audience. " +
      '<a href="/politique-confidentialite.html">Politique de confidentialité</a> · ' +
      '<a href="/legal/cookies.html">Personnaliser</a>.</p>' +
      '<div class="cookie-banner-actions">' +
      '<button type="button" class="btn btn-ghost" id="cookie-essential">Essentiels uniquement</button>' +
      '<button type="button" class="btn btn-primary" id="cookie-accept">Tout accepter</button>' +
      "</div></div>";

    document.body.appendChild(wrap);

    function updateGtagConsent(level) {
      if (typeof window.gtag !== "function") return;
      if (level === "all") {
        window.gtag("consent", "update", {
          ad_storage: "granted",
          analytics_storage: "granted",
          ad_user_data: "granted",
          ad_personalization: "granted",
        });
      } else {
        window.gtag("consent", "update", {
          ad_storage: "denied",
          analytics_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
        });
      }
    }

    document.getElementById("cookie-accept").addEventListener("click", function () {
      localStorage.setItem(KEY, "all");
      try {
        localStorage.setItem(
          PREFS_KEY,
          JSON.stringify({ necessary: true, analytics: true, marketing: true, functional: true })
        );
      } catch (e) {}
      updateGtagConsent("all");
      updateMetaConsent("all");
      hideBanner(wrap);
      pushClarityConsent("all");
    });

    document.getElementById("cookie-essential").addEventListener("click", function () {
      localStorage.setItem(KEY, "essential");
      try {
        localStorage.setItem(
          PREFS_KEY,
          JSON.stringify({ necessary: true, analytics: false, marketing: false, functional: false })
        );
      } catch (e) {}
      updateGtagConsent("essential");
      updateMetaConsent("essential");
      hideBanner(wrap);
      pushClarityConsent("essential");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!hasConsentRecorded()) {
      showBanner();
      return;
    }
    var level = localStorage.getItem(KEY) || "all";
    var isAll = level === "all";
    pushClarityConsent(isAll ? "all" : "essential");
    if (isAll && typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        ad_storage: "granted",
        analytics_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
      });
    }
    updateMetaConsent(isAll ? "all" : "essential");
  });
})();
