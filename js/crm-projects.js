/**
 * Projets client — inspire dashboard/projects multisite
 */
window.CrmProjects = {
  KEY: "lo_crm_projects",

  load: function () {
    try {
      return JSON.parse(localStorage.getItem(this.KEY) || "[]");
    } catch (e) {
      return [];
    }
  },

  save: function (list) {
    localStorage.setItem(this.KEY, JSON.stringify(list));
  },

  seed: function () {
    if (this.load().length) return;
    this.save([
      { id: "proj-1", name: "Assurance VTC — Famille M.", type: "Assurance", status: "active", priority: "high", items: 4, updatedAt: new Date().toISOString() },
      { id: "proj-2", name: "Flotte pro — SARL Transport", type: "Commercial", status: "active", priority: "medium", items: 7, updatedAt: new Date().toISOString() },
      { id: "proj-3", name: "RC Pro BTP — Chantier Nord", type: "Juridique", status: "draft", priority: "urgent", items: 2, updatedAt: new Date().toISOString() },
    ]);
  },

  esc: function (s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  },

  renderList: function (mount, opts) {
    opts = opts || {};
    this.seed();
    var list = this.load();
    var q = (opts.query || "").toLowerCase();
    var status = opts.status || "";
    var sort = opts.sort || "updated-desc";

    if (q) list = list.filter(function (p) { return p.name.toLowerCase().indexOf(q) >= 0; });
    if (status) list = list.filter(function (p) { return p.status === status; });
    if (opts.type) list = list.filter(function (p) { return p.type === opts.type; });

    if (sort === "name-asc") list.sort(function (a, b) { return a.name.localeCompare(b.name); });
    else if (sort === "name-desc") list.sort(function (a, b) { return b.name.localeCompare(a.name); });
    else if (sort === "priority") list.sort(function (a, b) { return (b.priority || "").localeCompare(a.priority || ""); });
    else list.sort(function (a, b) { return new Date(b.updatedAt) - new Date(a.updatedAt); });

    var active = this.load().filter(function (p) { return p.status === "active"; }).length;
    var totalItems = this.load().reduce(function (s, p) { return s + (p.items || 0); }, 0);

    var stats =
      '<div class="crm-kpis" style="margin-bottom:16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px">' +
      '<div class="kpi-card panel"><div class="kpi-label">Total projets</div><div class="kpi-value">' +
      this.load().length +
      '</div></div><div class="kpi-card panel"><div class="kpi-label">Projets actifs</div><div class="kpi-value">' +
      active +
      '</div></div><div class="kpi-card panel"><div class="kpi-label">Items totaux</div><div class="kpi-value">' +
      totalItems +
      "</div></div></div>";

    if (!list.length) {
      mount.innerHTML =
        stats +
        "<p style='color:var(--muted)'>Aucun projet. Créez votre premier projet pour commencer à organiser vos devis et contrats.</p>";
      return;
    }

    var exportBtn =
      '<p style="margin-bottom:12px"><button type="button" id="projExport" class="btn btn-ghost btn-sm">Exporter CSV</button></p>';

    mount.innerHTML =
      stats +
      exportBtn +
      (opts.view === "list"
        ? "<table><thead><tr><th>Projet</th><th>Type</th><th>Statut</th><th>Priorité</th><th>Items</th></tr></thead><tbody>" +
          list
            .map(function (p) {
              return (
                "<tr><td><a href=\"./crm-projects-detail.html?id=" +
                encodeURIComponent(p.id) +
                '">' +
                window.CrmProjects.esc(p.name) +
                "</a></td><td>" +
                window.CrmProjects.esc(p.type) +
                "</td><td>" +
                window.CrmProjects.esc(p.status) +
                "</td><td>" +
                window.CrmProjects.esc(p.priority) +
                "</td><td>" +
                (p.items || 0) +
                "</td></tr>"
              );
            })
            .join("") +
          "</tbody></table>"
        : '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px">' +
          list
            .map(function (p) {
              return (
                '<a href="./crm-projects-detail.html?id=' +
                encodeURIComponent(p.id) +
                '" class="panel" style="padding:16px;text-decoration:none;color:inherit;display:block">' +
                "<strong>" +
                window.CrmProjects.esc(p.name) +
                "</strong><p style='margin:6px 0 0;font-size:.85rem;color:var(--muted)'>" +
                window.CrmProjects.esc(p.type) +
                " · " +
                window.CrmProjects.esc(p.status) +
                " · Priorité " +
                window.CrmProjects.esc(p.priority) +
                (p.items ? " · " + p.items + " items" : "") +
                "</p><span style='font-size:.8rem;color:#6366f1;margin-top:8px;display:inline-block'>Voir les détails →</span></a>"
              );
            })
            .join("") +
          "</div>");

    var btnEx = document.getElementById("projExport");
    if (btnEx) {
      btnEx.onclick = function () {
        var csv =
          "nom;type;statut;priorite;items\n" +
          list
            .map(function (p) {
              return [p.name, p.type, p.status, p.priority, p.items || 0].join(";");
            })
            .join("\n");
        var a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
        a.download = "projets-" + new Date().toISOString().slice(0, 10) + ".csv";
        a.click();
      };
    }
  },
};
