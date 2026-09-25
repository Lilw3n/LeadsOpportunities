/**
 * Bloc conseil achat durable — injecté sur [data-achat-perennite-block].
 */
(function () {
  var Msg = window.AchatPerenniteMessaging;
  if (!Msg) return;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function render(el) {
    var variant = (el.getAttribute("data-achat-perennite-block") || "landing").toLowerCase();
    var compact = variant === "compact" || variant === "landing";
    var cls = "achat-perennite-banner" + (compact ? " achat-perennite-banner--compact" : "");
    var pillars = Msg.PILLARS || [];
    el.innerHTML =
      '<div class="' +
      cls +
      '">' +
      '<span class="section-badge">Bonne décision d\'achat</span>' +
      "<h2>" +
      esc(Msg.HEADLINE) +
      "</h2>" +
      '<p class="achat-perennite-lead">' +
      esc(Msg.LEAD) +
      "</p>" +
      '<div class="achat-perennite-pillars">' +
      pillars
        .map(function (p) {
          return (
            '<div class="achat-perennite-pillar"><strong>' +
            esc(p.title) +
            "</strong><p>" +
            esc(p.text) +
            "</p></div>"
          );
        })
        .join("") +
      "</div>" +
      '<div class="achat-perennite-reassure">' +
      "<strong>" +
      esc(Msg.REASSURANCE_HEADLINE) +
      "</strong>" +
      "<p>" +
      esc(Msg.REASSURANCE_BODY) +
      "</p>" +
      "</div>" +
      '<p class="achat-perennite-tagline">' +
      esc(Msg.TAGLINE) +
      "</p>" +
      "</div>";
  }

  function boot() {
    document.querySelectorAll("[data-achat-perennite-block]").forEach(render);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
