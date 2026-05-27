(function () {
  var TOKEN_KEY = "lo_token";
  if (!localStorage.getItem(TOKEN_KEY)) {
    location.href = "./crm.html";
    return;
  }
  if (window.CrmAdminGuard && !window.CrmAdminGuard.ensureAdmin()) return;

  document.getElementById("migrateForm").onsubmit = function (e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    var rows = String(fd.get("rows") || "")
      .split(/\n/)
      .map(function (l) {
        return l.trim();
      })
      .filter(Boolean);
    var dryRun = !!e.target.dryRun.checked;
    var result = document.getElementById("migrateResult");
    result.style.display = "block";
    if (!rows.length) {
      result.innerHTML = "<p>Aucune ligne à migrer</p>";
      return;
    }
    result.innerHTML = "<p>Migration " + (dryRun ? "(simulation) " : "") + "— " + rows.length + " entrée(s)…</p>";
    fetch("/api/crm/contacts?limit=100", {
      headers: { Authorization: "Bearer " + localStorage.getItem(TOKEN_KEY) },
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        var existing = (res.contacts || []).map(function (c) {
          return (c.email || c.id || "").toLowerCase();
        });
        var matched = [];
        var missing = [];
        rows.forEach(function (row) {
          var key = row.toLowerCase();
          if (existing.indexOf(key) >= 0) matched.push(row);
          else missing.push(row);
        });
        var html =
          "<h3>Résultat " +
          (dryRun ? "simulation" : "") +
          "</h3><p><strong>Déjà présents :</strong> " +
          matched.length +
          "</p>";
        if (matched.length) html += "<ul>" + matched.map(function (m) { return "<li>" + m + "</li>"; }).join("") + "</ul>";
        html += "<p><strong>À créer manuellement :</strong> " + missing.length + "</p>";
        if (missing.length) {
          html += "<ul>" + missing.map(function (m) { return "<li>" + m + ' — <a href="./crm-create-complete.html">créer</a></li>'; }).join("") + "</ul>";
        }
        if (!dryRun && missing.length) {
          html += "<p style='color:var(--muted)'>Création bulk : utilisez Dossier complet pour chaque entrée manquante.</p>";
        }
        result.innerHTML = html;
      });
  };
})();
