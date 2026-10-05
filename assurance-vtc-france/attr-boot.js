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

  try {
    var u = new URL(location.href);
    if (!u.searchParams.get("utm_source")) {
      u.searchParams.set("utm_source", "assurancevtcfrance");
    }
    if (!u.searchParams.get("utm_medium") && !u.searchParams.get("utm_campaign")) {
      u.searchParams.set("utm_medium", "site");
      u.searchParams.set("utm_campaign", "avf_organic");
    }
    if (u.href !== location.href) {
      history.replaceState(null, "", u.pathname + u.search + u.hash);
    }
  } catch (e) {}

  try {
    if (window.clarity) {
      window.clarity("set", "market_intent", "FR");
      window.clarity("set", "site_domain", "assurancevtcfrance.com");
      window.clarity("set", "vertical", "vtc");
    }
  } catch (e2) {}
})();
