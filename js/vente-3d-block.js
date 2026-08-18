/**
 * Bloc vente 3D (divorce, décès, déménagement) — [data-vente-3d-block].
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

  function render(el) {
    var variant = (el.getAttribute("data-vente-3d-block") || "landing").toLowerCase();
    var compact = variant === "compact" || variant === "landing";
    var cls = "vente-3d-banner" + (compact ? " vente-3d-banner--compact" : "");
    var items = Msg.ITEMS || [];
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
      items
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
        .join("") +
      "</div>" +
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
      '">Lire le guide complet (3D) →</a>' +
      "</div></div>";
  }

  function boot() {
    document.querySelectorAll("[data-vente-3d-block]").forEach(render);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
