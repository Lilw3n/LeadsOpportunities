/**
 * Page légal cookies — préférences granulaires (inspire legal/cookies multisite).
 * Stockage : lo_cookie_preferences (JSON) + lo_cookie_consent_v1 (all | essential | custom).
 */
(function () {
  var PREFS_KEY = "lo_cookie_preferences";
  var CONSENT_KEY = "lo_cookie_consent_v1";

  function loadPrefs() {
    try {
      var s = localStorage.getItem(PREFS_KEY);
      if (s) return JSON.parse(s);
    } catch (e) {}
    return {
      necessary: true,
      analytics: localStorage.getItem(CONSENT_KEY) === "all",
      marketing: localStorage.getItem(CONSENT_KEY) === "all",
      functional: localStorage.getItem(CONSENT_KEY) === "all",
    };
  }

  function savePrefs(p) {
    localStorage.setItem(PREFS_KEY, JSON.stringify(p));
    var a = p.analytics,
      m = p.marketing,
      f = p.functional;
    if (a && m && f) localStorage.setItem(CONSENT_KEY, "all");
    else if (!a && !m && !f) localStorage.setItem(CONSENT_KEY, "essential");
    else localStorage.setItem(CONSENT_KEY, "custom");
    window.dispatchEvent(new CustomEvent("lo:cookie-preferences", { detail: p }));
    var ok = document.getElementById("cookiePrefsSaved");
    if (ok) {
      ok.style.display = "block";
      ok.textContent =
        "Préférences enregistrées. Le bandeau ne réapparaîtra pas tant que vous ne supprimez pas les données locales du site.";
    }
  }

  function row(id, title, desc, locked, checked) {
    return (
      '<div class="cookie-row" style="border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:12px;background:#fff">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">' +
      "<div><strong>" +
      title +
      "</strong><p style='margin:8px 0 0;font-size:.9rem;color:#64748b'>" +
      desc +
      "</p></div>" +
      (locked
        ? "<span style='font-size:.85rem;color:#059669'>Toujours actif</span>"
        : '<label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" data-cookie-id="' +
          id +
          '" ' +
          (checked ? "checked" : "") +
          " /></label>") +
      "</div></div>"
    );
  }

  function render() {
    var mount = document.getElementById("cookiePrefsMount");
    if (!mount) return;
    var p = loadPrefs();
    mount.innerHTML =
      "<h2>Paramétrer mes cookies</h2>" +
      "<p style='color:#64748b;font-size:.95rem'>Aligné sur la page cookies interactive du multisite — les traceurs d’audience (ex. Google Analytics) ne se chargent qu’avec votre accord via le bandeau ou ci-dessous.</p>" +
      row("nec", "Cookies nécessaires", "Session, sécurité, formulaires — indispensables au fonctionnement.", true, true) +
      row(
        "ana",
        "Mesure d’audience",
        "Statistiques de visite anonymisées pour améliorer le site.",
        false,
        !!p.analytics
      ) +
      row("mkt", "Marketing", "Publicité et remarketing (ex. Google Ads) si activés sur le domaine.", false, !!p.marketing) +
      row("fun", "Fonctionnels", "Mémorisation de préférences avancées, intégrations tierces optionnelles.", false, !!p.functional) +
      '<p id="cookiePrefsSaved" style="display:none;margin-top:12px;padding:12px 14px;background:#ecfdf5;border:1px solid #6ee7b7;border-radius:10px;color:#065f46;font-size:.9rem"></p>' +
      '<p style="margin-top:20px"><button type="button" id="btnSaveCookiePrefs" class="btn btn-primary" style="padding:12px 24px;border:none;border-radius:10px;background:#0d9488;color:#fff;font-weight:600;cursor:pointer">Enregistrer</button></p>';

    document.getElementById("btnSaveCookiePrefs").onclick = function () {
      var next = {
        necessary: true,
        analytics: !!mount.querySelector('[data-cookie-id="ana"]').checked,
        marketing: !!mount.querySelector('[data-cookie-id="mkt"]').checked,
        functional: !!mount.querySelector('[data-cookie-id="fun"]').checked,
      };
      savePrefs(next);
    };
  }

  document.addEventListener("DOMContentLoaded", render);
})();
