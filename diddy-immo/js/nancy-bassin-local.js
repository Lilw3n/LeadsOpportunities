/**
 * Bannière locale bassin Nancy — prêt immobilier 54.
 * Affiche un rappel si ?ville= contient une commune du bassin ou si géoloc proche.
 */
(function () {
  var COMMUNES = [
    "nancy",
    "jarville",
    "varangeville",
    "maxeville",
    "vandoeuvre",
    "laxou",
    "saint-nicolas",
    "essey",
    "tomblaine",
    "heillecourt",
    "malzeville",
    "villers",
    "laneuveville",
    "lay-saint",
    "art-sur",
    "seichamps",
    "fleville",
    "custines",
    "pompey",
    "richardmenil",
    "dombasle",
    "houdemont",
    "ludres",
    "saint-max",
    "pulnoy",
    "saulxures",
    "dommartemont",
    "rosieres",
    "champigneulles",
    "frouard",
    "liverdun",
    "neuves-maisons",
    "bouxieres",
    "gondreville",
    "mereville",
    "chavigny",
    "meurthe",
    "54000",
    "54140",
    "54130",
    "54520",
  ];

  function matchesBassin(text) {
    if (!text) return false;
    var t = String(text).toLowerCase();
    return COMMUNES.some(function (k) {
      return t.indexOf(k) !== -1;
    });
  }

  function villeFromUrl() {
    try {
      return new URLSearchParams(window.location.search).get("ville") || "";
    } catch (e) {
      return "";
    }
  }

  function injectBanner() {
    var ville = villeFromUrl();
    if (!matchesBassin(ville) && !document.body.hasAttribute("data-nancy-bassin-force")) return;

    var host = document.querySelector(".hero-surface") || document.querySelector(".container");
    if (!host || document.getElementById("nancyBassinPretBanner")) return;

    var label = ville ? ville : "Nancy metropole (54)";
    var el = document.createElement("div");
    el.id = "nancyBassinPretBanner";
    el.className = "nancy-bassin-pret-banner";
    el.innerHTML =
      '<p><strong>Pret immobilier ' +
      label +
      '</strong> — courtier sur <strong>Nancy et ses alentours</strong> (metropole / bassin nanceien). ' +
      'Jarville, Dombasle, Houdemont, Ludres, Saint-Max et communes du 54 : ' +
      '<a href="/pret-immobilier/nancy-metropole/">toutes nos pages locales</a>.</p>';
    host.insertBefore(el, host.firstChild);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectBanner);
  } else {
    injectBanner();
  }
})();
