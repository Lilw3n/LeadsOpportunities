/**
 * Bannière locale bassin nancéien — acquéreurs autour de Saint-Nicolas-de-Port.
 * <div data-nancy-bassin-banner></div>
 * <div data-nancy-bassin-communes></div> — puces villes vers recherche bien
 */
(function (global) {
  var COMMUNES_ACQUEREUR = [
    { name: "Saint-Nicolas-de-Port", slug: "saint-nicolas-de-port" },
    { name: "Art-sur-Meurthe", slug: "art-sur-meurthe" },
    { name: "Haroué", slug: "haroue" },
    { name: "Laneuveville", slug: "laneuveville-devant-nancy" },
    { name: "Tomblaine", slug: "tomblaine" },
    { name: "Lenoncourt", slug: "lenoncourt" },
    { name: "Dieulouard", slug: "dieulouard" },
    { name: "Montauville", slug: "montauville" },
    { name: "Fléville", slug: "fleville-devant-nancy" },
    { name: "Dombasle", slug: "dombasle-sur-meurthe" },
    { name: "Varangeville", slug: "varangeville" },
    { name: "Blénod", slug: "blenod-les-pont-a-mousson" },
  ];

  var COPY = {
    title: "Acquéreur autour de Saint-Nicolas-de-Port — bassin nancéien (54)",
    text:
      "Vous cherchez à acheter à Saint-Nicolas-de-Port, Art-sur-Meurthe, Haroué ou dans le val de Meurthe ? Nous connaissons le territoire : mine de sel de Varangeville, Solvay à Dombasle, basilique Saint-Nicolas-de-Port, château d'Haroué. Bureau 15–17 rue Pierre Curie — alerte bien, projection budget et prêt.",
    pills: ["Saint-Nicolas", "Art-sur-Meurthe", "Haroué", "Val de Meurthe"],
    hub: "/immobilier/nancy-metropole/",
    search: "/landings/acheteur-immo.html",
    contact: "/index.html#contact",
  };

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function searchUrl(cityName) {
    return COPY.search + "?city=" + encodeURIComponent(cityName) + "#recherche";
  }

  function renderCommunes(root) {
    if (!root || root.dataset.nbCommunesBound) return;
    root.dataset.nbCommunesBound = "1";
    root.className = (root.className + " nancy-bassin-communes").trim();
    root.innerHTML =
      '<p class="nancy-bassin-communes-label">Acquéreur — communes autour de Saint-Nicolas-de-Port :</p>' +
      '<div class="nancy-bassin-pills">' +
      COMMUNES_ACQUEREUR.map(function (c) {
        return (
          '<a class="nancy-bassin-pill nancy-bassin-pill-link" href="' +
          esc(searchUrl(c.name)) +
          '">' +
          esc(c.name) +
          "</a>"
        );
      }).join("") +
      "</div>";
  }

  function render(root) {
    if (!root || root.dataset.nbBound) return;
    root.dataset.nbBound = "1";
    root.className = (root.className + " nancy-bassin-banner").trim();
    root.innerHTML =
      "<strong>" +
      esc(COPY.title) +
      "</strong><p>" +
      esc(COPY.text) +
      '</p><div class="nancy-bassin-pills">' +
      COPY.pills.map(function (p) {
        return '<span class="nancy-bassin-pill">' + esc(p) + "</span>";
      }).join("") +
      '</div><p style="margin:10px 0 0;font-size:.85rem"><a href="' +
      esc(COPY.hub) +
      '">Guide acquéreur 54</a> · <a href="' +
      esc(searchUrl("Saint-Nicolas-de-Port")) +
      '">Lancer une alerte</a> · <a href="' +
      esc(COPY.contact) +
      '">Nous contacter</a></p>';
  }

  function init() {
    document.querySelectorAll("[data-nancy-bassin-banner]").forEach(render);
    document.querySelectorAll("[data-nancy-bassin-communes]").forEach(renderCommunes);
  }

  global.NancyBassinLocal = {
    COPY: COPY,
    COMMUNES_ACQUEREUR: COMMUNES_ACQUEREUR,
    searchUrl: searchUrl,
    render: render,
    renderCommunes: renderCommunes,
    init: init,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(typeof window !== "undefined" ? window : globalThis);
