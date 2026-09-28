/**
 * Bloc vente 3D (divorce, décès, déménagement) + situations complexes — [data-vente-3d-block].
 */
(function () {
  var Msg = window.Vente3DMessaging;
  if (!Msg) return;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function blogHref() {
    var p = window.location.pathname || "";
    if (p.indexOf("/landings/") !== -1) return "../blog/" + (Msg.BLOG_SLUG || "");
    return "./blog/" + (Msg.BLOG_SLUG || "");
  }

  function renderItems(items) {
    return items
      .map(function (it) {
        return (
          '<div class="vente-3d-item"><span class="vente-3d-letter" aria-hidden="true">' +
          esc(it.letter) +
          "</span><strong>" +
          esc(it.title) +
          "</strong><p>" +
          esc(it.text) +
          "</p></div>"
        );
      })
      .join("");
  }

  function renderComplex(cases, compact) {
    if (!cases || !cases.length) return "";
    var chips = cases
      .map(function (c) {
        return '<span class="vente-3d-chip">' + esc(c.label) + "</span>";
      })
      .join("");
    var cards = cases
      .map(function (c) {
        return (
          '<div class="vente-3d-complex-item"><strong>' +
          esc(c.label) +
          "</strong><p>" +
          esc(c.text) +
          "</p></div>"
        );
      })
      .join("");
    if (compact) {
      return (
        '<div class="vente-3d-complex vente-3d-complex--compact">' +
        "<strong>" +
        esc(Msg.COMPLEX_HEADLINE) +
        "</strong>" +
        '<div class="vente-3d-chips" aria-label="Autres situations fréquentes">' +
        chips +
        "</div></div>"
      );
    }
    return (
      '<div class="vente-3d-complex">' +
      "<h3>" +
      esc(Msg.COMPLEX_HEADLINE) +
      "</h3>" +
      '<p class="vente-3d-complex-lead">' +
      esc(Msg.COMPLEX_LEAD) +
      "</p>" +
      '<div class="vente-3d-chips vente-3d-chips--wrap" aria-hidden="true">' +
      chips +
      "</div>" +
      '<div class="vente-3d-complex-grid">' +
      cards +
      "</div></div>"
    );
  }

  function render(el) {
    var variant = (el.getAttribute("data-vente-3d-block") || "landing").toLowerCase();
    var compact = variant === "compact" || variant === "landing";
    var cls = "vente-3d-banner" + (compact ? " vente-3d-banner--compact" : "");
    var items = Msg.ITEMS || [];
    var complex = Msg.COMPLEX_CASES || [];
    el.innerHTML =
      '<div class="' +
      cls +
      '">' +
      '<span class="section-badge">Vente &amp; vie réelle</span>' +
      "<h2>" +
      esc(Msg.HEADLINE) +
      "</h2>" +
      '<p class="vente-3d-lead">' +
      esc(Msg.LEAD) +
      "</p>" +
      '<div class="vente-3d-grid">' +
      renderItems(items) +
      "</div>" +
      renderComplex(complex, compact) +
      '<div class="vente-3d-reassure">' +
      "<strong>" +
      esc(Msg.REASSURANCE_HEADLINE) +
      "</strong>" +
      "<p>" +
      esc(Msg.REASSURANCE_BODY) +
      "</p>" +
      "</div>" +
      '<div class="vente-3d-footer">' +
      '<p class="vente-3d-tagline">' +
      esc(Msg.TAGLINE) +
      "</p>" +
      '<a class="vente-3d-blog-link" href="' +
      esc(blogHref()) +
      '">Lire le guide complet →</a>' +
      "</div></div>";
  }

  function boot() {
    document.querySelectorAll("[data-vente-3d-block]").forEach(render);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
