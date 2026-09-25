/**
 * Barre de navigation portail externe — inspire external/layout multisite.
 */
(function () {
  if (document.getElementById("loExtNav")) return;
  if (!document.body.classList.contains("landing-page")) return;

  var path = location.pathname || "";
  if (path.indexOf("/external/") < 0 && path.indexOf("external\\") < 0) return;

  var logged = !!localStorage.getItem("lo_ext_token");
  var wrap = document.createElement("nav");
  wrap.id = "loExtNav";
  wrap.setAttribute("aria-label", "Navigation portail");
  wrap.style.cssText =
    "position:fixed;bottom:0;left:0;right:0;z-index:9998;background:#fff;border-top:1px solid #e2e8f0;display:flex;justify-content:center;gap:4px;padding:8px 12px calc(8px + env(safe-area-inset-bottom));box-shadow:0 -4px 20px rgba(15,23,42,.06);font-size:.75rem";

  function link(href, label, icon) {
    var active = path.replace(/\\/g, "/").indexOf(href.replace(/^\.\//, "").replace(/^\.\.\//, "")) >= 0;
    return (
      '<a href="' +
      href +
      '" style="flex:1;max-width:88px;text-align:center;text-decoration:none;color:' +
      (active ? "#4338ca" : "#64748b") +
      ';font-weight:' +
      (active ? "700" : "500") +
      ';padding:6px 4px"><span style="display:block;font-size:1.1rem">' +
      icon +
      "</span>" +
      label +
      "</a>"
    );
  }

  var normalized = path.replace(/\\/g, "/");
  var extIdx = normalized.indexOf("/external/");
  if (extIdx < 0) return;
  var rest = normalized.slice(extIdx + "/external/".length);
  var folderDepth = rest.indexOf("/") >= 0 ? rest.split("/").length - 1 : 0;
  var prefix = folderDepth === 0 ? "./" : "../".repeat(folderDepth);

  wrap.innerHTML =
    link(prefix + "index.html", "Portail", "🏠") +
    link(prefix + "assurance.html", "Assurance", "🛡️") +
    (logged
      ? link(prefix + "dashboard.html", "Espace", "👤")
      : link(prefix + "login.html", "Connexion", "🔑")) +
    link(prefix + "social/hub.html", "Social", "📱") +
    link(prefix + "devis-wizard.html", "Devis", "✨");

  document.body.appendChild(wrap);
  document.body.style.paddingBottom = "72px";
})();
