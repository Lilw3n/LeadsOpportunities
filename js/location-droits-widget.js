/**
 * Aide-mémoire droits locataire / avis bailleur — [data-droits-widget]
 */
(function () {
  function list(items) {
    return (
      "<ul>" +
      (items || [])
        .map(function (t) {
          return "<li>" + t + "</li>";
        })
        .join("") +
      "</ul>"
    );
  }

  function boot(root) {
    var Lib = window.LocationDroits;
    if (!Lib || root._droitsWired) return;
    root._droitsWired = true;

    var sel = root.querySelector("[data-droits-kind]");
    var out = root.querySelector("[data-droits-out]");
    var src = root.querySelector("[data-droits-source]");
    if (src) src.textContent = Lib.SOURCE;
    if (sel && !sel.options.length) {
      var fromUrl = Lib.kindFromSujet(new URLSearchParams(window.location.search).get("sujet"));
      sel.innerHTML = Lib.optionsHtml(fromUrl || "travaux");
      if (fromUrl) sel.value = fromUrl;
    }

    function render() {
      var id = sel ? sel.value : "travaux";
      var d = Lib.explain(id);
      if (!out) return;
      out.innerHTML =
        '<p class="immo-droits-delay"><strong>Délai / forme</strong> — ' +
        d.delay +
        "</p>" +
        '<div class="immo-droits-cols">' +
        '<div class="immo-droits-col"><h3>Le locataire a droit à</h3>' +
        list(d.tenant) +
        "</div>" +
        '<div class="immo-droits-col"><h3>Le bailleur doit</h3>' +
        list(d.landlord) +
        "</div>" +
        "</div>" +
        '<div class="immo-ls-note"><strong>Points de vigilance</strong>' +
        list(d.watch) +
        "</div>";
      root.dispatchEvent(new CustomEvent("lo:droits-changed", { bubbles: true, detail: d }));
    }

    if (sel) sel.addEventListener("change", render);
    render();
  }

  function start() {
    document.querySelectorAll("[data-droits-widget]").forEach(boot);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
