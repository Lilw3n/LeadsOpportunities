/**
 * Explorateur projets arborescent — inspire ProjectExplorer.tsx multisite.
 */
window.CrmProjectExplorer = {
  render: function (mount) {
    var projects = window.CrmProjects.load();
    if (!projects.length) {
      mount.innerHTML = "<p>Aucun projet — créez-en un pour afficher l'arbre.</p>";
      return;
    }
    var html = '<div class="pex-tree panel">';
    projects.forEach(function (p) {
      html += nodeHtml(p, 0);
    });
    html += "</div>";
    mount.innerHTML = html;
    mount.querySelectorAll(".pex-toggle").forEach(function (btn) {
      btn.onclick = function () {
        var ch = btn.parentElement.querySelector(".pex-children");
        if (!ch) return;
        var open = ch.style.display !== "none";
        ch.style.display = open ? "none" : "block";
        btn.textContent = open ? "▶" : "▼";
      };
    });
    mount.querySelectorAll(".pex-node[draggable]").forEach(function (el) {
      el.addEventListener("dragstart", function () {
        el.classList.add("pex-drag");
      });
      el.addEventListener("dragend", function () {
        el.classList.remove("pex-drag");
      });
      el.addEventListener("dragover", function (e) {
        e.preventDefault();
      });
      el.addEventListener("drop", function (e) {
        e.preventDefault();
        alert("Réorganisation enregistrée localement (aperçu multisite ProjectExplorer).");
      });
    });
  },
};

function nodeHtml(p, depth) {
  var pad = depth * 16;
  var children = p.children || [
    { id: p.id + "-q", name: "Devis liés", type: "folder", items: p.items || 0 },
    { id: p.id + "-c", name: "Contrats", type: "folder", items: 0 },
  ];
  var row =
    '<div class="pex-node" draggable="true" style="padding-left:' +
    pad +
    'px">' +
    (children.length ? '<button type="button" class="pex-toggle">▼</button>' : '<span class="pex-sp"></span>') +
    "📁 <strong>" +
    esc(p.name) +
    "</strong> <span class='pex-meta'>" +
    esc(p.type) +
    " · " +
    esc(p.status) +
    " · " +
    (p.items || 0) +
    " items</span> " +
    '<a href="./crm-projects-detail.html?id=' +
    encodeURIComponent(p.id) +
    '" class="btn btn-ghost btn-sm">Ouvrir</a>' +
    "</div>";
  if (children.length) {
    row += '<div class="pex-children">';
    children.forEach(function (c) {
      row +=
        '<div class="pex-node pex-leaf" style="padding-left:' +
        (pad + 16) +
        'px">📄 ' +
        esc(c.name) +
        " <span class='pex-meta'>" +
        (c.items != null ? c.items + " éléments" : "") +
        "</span></div>";
    });
    row += "</div>";
  }
  return row;
}

function esc(s) {
  var d = document.createElement("div");
  d.textContent = s == null ? "" : s;
  return d.innerHTML;
}
