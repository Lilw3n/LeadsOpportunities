/**
 * Snippet Microsoft Clarity + Consent V2 (obligatoire EEA/France depuis oct. 2025).
 * Sans consentv2 avant le tag, Clarity renvoie track:false et ne collecte rien.
 */
(function () {
  var CONSENT_KEY = "lo_cookie_consent_v1";

  function clarityConsentGranted() {
    try {
      var level = localStorage.getItem(CONSENT_KEY) || "";
      if (level === "essential") return false;
      return true;
    } catch (e) {
      return true;
    }
  }

  window.clarity =
    window.clarity ||
    function () {
      (window.clarity.q = window.clarity.q || []).push(arguments);
    };

  var granted = clarityConsentGranted();
  window.clarity("consentv2", {
    ad_Storage: granted ? "granted" : "denied",
    analytics_Storage: granted ? "granted" : "denied",
  });

  var id = "x7yqp46fj9";
  try {
    var cfg = window.GOOGLE_TRACKING || window.GOOGLE_TRACKING_FROM_ENV || {};
    if (cfg.clarityProjectId && String(cfg.clarityProjectId).indexOf("XXXX") === -1) {
      id = String(cfg.clarityProjectId).trim();
    }
  } catch (e) {}
  if (!id || document.getElementById("clarity-script")) return;

  (function (c, l, a, r, i, t, y) {
    t = l.createElement(r);
    t.async = 1;
    t.src = "https://www.clarity.ms/tag/" + i;
    t.id = "clarity-script";
    y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, "clarity", "script", id);
})();
