/**
 * Bloc information risques crédit — injecté sur [data-pret-risks-block].
 */
(function () {
  var Msg = window.PretRisksMessaging;
  if (!Msg) return;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function render(el) {
    var variant = (el.getAttribute("data-pret-risks-block") || "landing").toLowerCase();
    var compact = variant === "compact" || variant === "landing";
    var cls = "pret-risks-banner" + (compact ? " pret-risks-banner--compact" : "");
    var points = Msg.RISK_POINTS || [];
    var pointsHtml = compact
      ? ""
      : '<div class="pret-risks-points">' +
        points
          .map(function (p) {
            return (
              '<div class="pret-risks-point"><strong>' +
              esc(p.title) +
              "</strong><p>" +
              esc(p.text) +
              "</p></div>"
            );
          })
          .join("") +
        "</div>";
    el.innerHTML =
      '<div class="' +
      cls +
      '">' +
      '<span class="section-badge">Emprunter en connaissance de cause</span>' +
      "<h2>" +
      esc(Msg.RISK_HEADLINE) +
      "</h2>" +
      '<p class="pret-risks-lead">' +
      esc(Msg.RISK_LEAD) +
      "</p>" +
      pointsHtml +
      '<div class="pret-risks-reassure">' +
      "<strong>" +
      esc(Msg.REASSURANCE_HEADLINE) +
      "</strong>" +
      "<p>" +
      esc(Msg.REASSURANCE_BODY) +
      "</p>" +
      "</div>" +
      '<p class="pret-risks-tagline">' +
      esc(Msg.RISK_TAGLINE) +
      "</p>" +
      "</div>";
  }

  function boot() {
    document.querySelectorAll("[data-pret-risks-block]").forEach(render);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
