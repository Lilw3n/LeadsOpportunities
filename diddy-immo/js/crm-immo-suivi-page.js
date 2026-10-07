(function () {
  var Store = window.CrmImmoStore;
  var Matcher = window.CrmImmoMatcher;
  var Suivi = window.CrmImmoSuivi;
  if (!Store || !Matcher || !Suivi) return;
  if (!localStorage.getItem("lo_token")) {
    location.href = "./crm.html";
    return;
  }

  var params = new URLSearchParams(location.search);
  var viewId = params.get("view") || "ventes";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function euro(n) {
    if (n == null || n === "" || isNaN(Number(n))) return "—";
    return Number(n).toLocaleString("fr-FR") + " €";
  }

  function renderMenu() {
    var menu = document.getElementById("suMenu");
    var html = "<h1>Suivi</h1>";
    Suivi.VIEWS.forEach(function (v) {
      html +=
        '<a href="?view=' +
        encodeURIComponent(v.id) +
        '" class="' +
        (v.id === viewId ? "active" : "") +
        '" data-view="' +
        esc(v.id) +
        '">' +
        esc(v.label) +
        "</a>";
    });
    menu.innerHTML = html;
  }

  function render() {
    var view = Suivi.getView(viewId);
    viewId = view.id;
    document.getElementById("suTitle").textContent = view.label;
    document.getElementById("suHint").textContent = view.hint || "";

    var all = Store.listProperties({});
    var list = Suivi.filterProperties(all, view, Matcher);
    var kpi = Suivi.kpis(list, Matcher);

    document.getElementById("suKpis").innerHTML =
      '<div class="su-kpi"><strong>' +
      kpi.total +
      "</strong><span>Biens</span></div>" +
      '<div class="su-kpi"><strong>' +
      euro(kpi.sumFai || null) +
      "</strong><span>Σ FAI</span></div>" +
      '<div class="su-kpi"><strong>' +
      euro(kpi.sumNet || null) +
      "</strong><span>Σ net</span></div>" +
      '<div class="su-kpi"><strong>' +
      Object.keys(kpi.byStatus).length +
      "</strong><span>Statuts</span></div>";

    if (!list.length) {
      document.getElementById("suMount").innerHTML =
        '<p class="su-empty">Aucun bien dans cette vue. <a href="./crm-immo-properties.html">Ouvrir les piges</a></p>';
      return;
    }

    var order = view.statuses || [];
    var groups = Suivi.groupByStatus(list, Matcher);
    var html = "";
    order.forEach(function (sid) {
      var items = groups[sid] || [];
      if (!items.length) return;
      html +=
        '<div class="su-group"><h3>' +
        esc(Matcher.propertyStatusLabel(sid)) +
        " (" +
        items.length +
        ")</h3>";
      items
        .sort(function (a, b) {
          return String(b.updated_at || "").localeCompare(String(a.updated_at || ""));
        })
        .forEach(function (p) {
          html +=
            '<div class="su-card"><div><h4><a href="./crm-immo-property.html?id=' +
            encodeURIComponent(p.id) +
            '">' +
            esc(p.title || "Bien") +
            "</a></h4><div class=\"su-meta\">" +
            esc(p.city || "—") +
            " " +
            esc(p.postal_code || "") +
            " · " +
            (p.surface_m2 != null ? p.surface_m2 + " m²" : "—") +
            " · " +
            (p.rooms != null ? p.rooms + " p." : "") +
            " · " +
            euro(p.price_fai != null ? p.price_fai : p.price_net) +
            (p.transaction === "location" ? " · location" : " · vente") +
            "</div></div>" +
            '<div><a class="btn btn-ghost btn-sm" href="./crm-event-create.html?propertyId=' +
            encodeURIComponent(p.id) +
            "&title=" +
            encodeURIComponent((p.title || "Bien") + " — suivi") +
            '">RDV</a></div></div>';
        });
      html += "</div>";
    });

    document.getElementById("suMount").innerHTML = html || '<p class="su-empty">Liste vide.</p>';
  }

  renderMenu();
  render();
})();
