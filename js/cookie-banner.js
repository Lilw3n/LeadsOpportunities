(function () {
  var KEY = "lo_cookie_consent_v1";

  function hideBanner(el) {
    if (el && el.parentNode) el.parentNode.removeChild(el);
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
      '<a href="./politique-confidentialite.html">Politique de confidentialite</a>.</p>' +
      '<div class="cookie-banner-actions">' +
      '<button type="button" class="btn btn-ghost" id="cookie-essential">Essentiels uniquement</button>' +
      '<button type="button" class="btn btn-primary" id="cookie-accept">Tout accepter</button>' +
      "</div></div>";

    document.body.appendChild(wrap);

    document.getElementById("cookie-accept").addEventListener("click", function () {
      localStorage.setItem(KEY, "all");
      hideBanner(wrap);
      window.dispatchEvent(new CustomEvent("lo:cookie-consent", { detail: { level: "all" } }));
    });

    document.getElementById("cookie-essential").addEventListener("click", function () {
      localStorage.setItem(KEY, "essential");
      hideBanner(wrap);
      window.dispatchEvent(new CustomEvent("lo:cookie-consent", { detail: { level: "essential" } }));
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!localStorage.getItem(KEY)) {
      showBanner();
    }
  });
})();
