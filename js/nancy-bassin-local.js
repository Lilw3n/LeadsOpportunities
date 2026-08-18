/**
 * Bannière locale bassin nancéien (mine de sel, Solvay, basilique Saint-Nicolas-de-Port).
 * <div data-nancy-bassin-banner></div>
 */
(function (global) {
  var COPY = {
    title: "Courtier à Varangeville — bassin nancéien (54)",
    text:
      "Nous connaissons votre territoire : la mine de sel de Varangeville, le site Solvay à Dombasle-sur-Meurthe et la basilique Saint-Nicolas-de-Port. Bureau 15–17 rue Pierre Curie — prêt, assurance et immo avec un conseiller local.",
    pills: ["Mine de sel", "Solvay Dombasle", "Basilique St-Nicolas", "Nancy métropole"],
    hub: "/immobilier/nancy-metropole/",
    contact: "/index.html#contact",
  };

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
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
      '">Guide Nancy métropole &amp; 54</a> · <a href="' +
      esc(COPY.contact) +
      '">Nous contacter</a></p>';
  }

  function init() {
    document.querySelectorAll("[data-nancy-bassin-banner]").forEach(render);
  }

  global.NancyBassinLocal = { COPY: COPY, render: render, init: init };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(typeof window !== "undefined" ? window : globalThis);
