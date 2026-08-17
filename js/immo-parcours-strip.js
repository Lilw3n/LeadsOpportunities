/**
 * Bandeau parcours immo : Bien → Projection → Crédit → Emprunteur
 * Usage : <nav data-immo-parcours data-immo-step="bien|projection|credit|emprunteur"></nav>
 * Si hash #formules sur credit-immo, l’étape active devient emprunteur.
 */
(function () {
  var STEPS = [
    {
      id: "bien",
      label: "1. Bien",
      href: "./acheteur-immo.html",
      hint: "Chercher / alerte",
    },
    {
      id: "projection",
      label: "2. Projection",
      href: "./projection-achat.html",
      hint: "Prêt + charges",
    },
    {
      id: "credit",
      label: "3. Crédit",
      href: "./credit-immo.html#demande",
      hint: "Dossier banque",
    },
    {
      id: "emprunteur",
      label: "4. Emprunteur",
      href: "./credit-immo.html#formules",
      hint: "Loi Lemoine",
    },
  ];

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function resolveStep(el) {
    var current = (el.getAttribute("data-immo-step") || "").toLowerCase();
    var hash = (window.location.hash || "").toLowerCase();
    if (hash === "#formules" || hash.indexOf("#formules") === 0) {
      return "emprunteur";
    }
    return current;
  }

  function mount(el) {
    var current = resolveStep(el);
    var html =
      '<div class="immo-parcours-inner">' +
      '<p class="immo-parcours-kicker">Parcours acquéreur</p>' +
      '<ol class="immo-parcours-steps">';
    STEPS.forEach(function (step, i) {
      var active = step.id === current;
      var done =
        current === "projection" && step.id === "bien"
          ? true
          : current === "credit" && (step.id === "bien" || step.id === "projection")
            ? true
            : current === "emprunteur" && step.id !== "emprunteur";
      html +=
        '<li class="immo-parcours-step' +
        (active ? " is-active" : "") +
        (done ? " is-done" : "") +
        '">' +
        (active
          ? '<span class="immo-parcours-link" aria-current="step">'
          : '<a class="immo-parcours-link" href="' + esc(step.href) + '">') +
        '<span class="immo-parcours-label">' +
        esc(step.label) +
        "</span>" +
        '<span class="immo-parcours-hint">' +
        esc(step.hint) +
        "</span>" +
        (active ? "</span>" : "</a>") +
        (i < STEPS.length - 1 ? '<span class="immo-parcours-arrow" aria-hidden="true">→</span>' : "") +
        "</li>";
    });
    html +=
      "</ol>" +
      '<p class="immo-parcours-note">Un conseiller suit le dossier jusqu’à la signature — crédit + assurance emprunteur.</p>' +
      "</div>";
    el.classList.add("immo-parcours", "immo-parcours--mounted");
    el.setAttribute("data-immo-step-resolved", current);
    el.innerHTML = html;
  }

  function boot() {
    document.querySelectorAll("[data-immo-parcours]").forEach(mount);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  window.addEventListener("hashchange", boot);
})();
