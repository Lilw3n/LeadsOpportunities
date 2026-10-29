/**
 * Attribution défaut sur assurancevtcfrance.com (pub + SEO + leads).
 */
(function () {
  function isAvf() {
    try {
      return /assurancevtcfrance\.com$/i.test(location.hostname);
    } catch (e) {
      return false;
    }
  }

  if (!isAvf()) return;

  // Plus de réécriture d'URL (utm_source=assurancevtcfrance…) : elle remplaçait la vraie
  // provenance (Google, Facebook…) dans GA4. Le site est reconnu par son nom de domaine
  // dans landings/tracking.js, qui marque déjà les leads « assurancevtcfrance ».

  try {
    if (window.clarity) {
      window.clarity("set", "market_intent", "FR");
      window.clarity("set", "site_domain", "assurancevtcfrance.com");
      window.clarity("set", "vertical", "vtc");
    }
  } catch (e2) {}
})();
