/**
 * Branche questionnaire acheteur/vendeur → fiche descriptive PDF éditable.
 */
(function () {
  function form() {
    return document.querySelector("form[data-acheteur-immo]");
  }

  function collect() {
    var Lib = window.FicheDescriptiveBien;
    if (!Lib) return null;
    return Lib.fromSellForm(form());
  }

  function printFiche() {
    var Lib = window.FicheDescriptiveBien;
    var fiche = collect();
    if (!Lib || !fiche) {
      alert("Fiche descriptive indisponible — rechargez la page.");
      return;
    }
    Lib.print(fiche, {
      subtitle: "Issu du questionnaire immobilier — vérifiez avant envoi client",
    });
  }

  function openEditor(e) {
    var Lib = window.FicheDescriptiveBien;
    var fiche = collect();
    if (!Lib || !fiche) return;
    if (e) e.preventDefault();
    Lib.setTransfer(fiche);
    var href =
      (document.querySelector("[data-fiche-descriptive-edit]") &&
        document.querySelector("[data-fiche-descriptive-edit]").getAttribute("href")) ||
      "./fiche-descriptive-bien.html";
    window.location.href = href + (href.indexOf("?") >= 0 ? "&" : "?") + "from=questionnaire";
  }

  function bind() {
    var printBtn = document.querySelector("[data-fiche-descriptive-print]");
    var editLink = document.querySelector("[data-fiche-descriptive-edit]");
    if (printBtn) printBtn.addEventListener("click", printFiche);
    if (editLink) editLink.addEventListener("click", openEditor);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
