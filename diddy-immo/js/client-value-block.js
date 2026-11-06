/**
 * Bloc « valeur client / honoraires » — injecté sur [data-client-value-block].
 */
(function () {
  var Msg = window.ClientValueMessaging;
  if (!Msg) return;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function pillarsHtml(compact) {
    var items = Msg.VALUE_PILLARS || [];
    if (compact) {
      return (
        '<p class="client-value-lead">' +
        esc(Msg.VALUE_LEAD) +
        "</p>"
      );
    }
    return (
      '<p class="client-value-lead">' +
      esc(Msg.VALUE_LEAD) +
      '</p><div class="client-value-pillars">' +
      items
        .map(function (p) {
          return (
            '<div class="client-value-pillar"><strong>' +
            esc(p.title) +
            "</strong><p>" +
            esc(p.text) +
            "</p></div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function render(el) {
    var variant = (el.getAttribute("data-client-value-block") || "home").toLowerCase();
    var compact = variant === "compact" || variant === "landing";
    var cls = "client-value-banner" + (compact ? " client-value-banner--compact" : "");
    el.innerHTML =
      '<div class="' +
      cls +
      '">' +
      '<span class="section-badge">Notre engagement</span>' +
      "<h2>" +
      esc(Msg.VALUE_HEADLINE) +
      "</h2>" +
      pillarsHtml(compact) +
      '<div class="client-value-honoraires">' +
      "<strong>" +
      esc(Msg.HONORAIRES_HEADLINE) +
      "</strong>" +
      "<p>" +
      esc(Msg.HONORAIRES_BODY) +
      "</p>" +
      "</div>" +
      '<p class="client-value-tagline">' +
      esc(Msg.HONORAIRES_TAGLINE) +
      "</p>" +
      "</div>";
  }

  function boot() {
    document.querySelectorAll("[data-client-value-block]").forEach(render);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
