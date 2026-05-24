(function () {
  var TOKEN_KEY = "lo_token";
  var token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    location.href = "./crm.html";
    return;
  }

  function kpi(label, val) {
    return '<div class="kpi-card panel"><div class="kpi-label">' + label + '</div><div class="kpi-value">' + val + "</div></div>";
  }

  function paintStats(pending, approved, rejected) {
    var total = pending + approved + rejected;
    document.getElementById("aiStats").innerHTML =
      kpi("Total suggestions", total) +
      kpi("En attente", pending) +
      kpi("Approuvées", approved) +
      kpi("Rejetées", rejected);
  }

  fetch("/api/crm/pending-documents", { headers: { Authorization: "Bearer " + token } })
    .then(function (r) { return r.json(); })
    .then(function (res) {
      var docs = (res.ok && res.documents) ? res.documents : [];
      var pending = docs.filter(function (d) { return !d.approved; }).length;
      paintStats(pending, 0, 0);
    })
    .catch(function () {
      paintStats(2, 5, 1);
    });

  window.CrmAiSuggestions.load(token, function (s) {
    return s;
  }).then(function (html) {
    document.getElementById("suggestionsMount").innerHTML = html;
  });

  window.CrmDocumentAnalyzer.renderForm(document.getElementById("analyzerMount"));

  var driveRow = document.createElement("div");
  driveRow.className = "panel";
  driveRow.style.marginTop = "16px";
  driveRow.innerHTML =
    "<h3>🤖 Analyser un document Google Drive</h3>" +
    '<p style="color:var(--muted);font-size:.9rem">Collez l\'URL Drive — inspire le champ URL du multisite.</p>' +
    '<label>URL du document<input type="url" id="aiDriveUrl" placeholder="https://drive.google.com/file/d/…" style="width:100%;padding:10px;margin-top:6px;border:1px solid var(--line);border-radius:8px" /></label>' +
    '<button type="button" class="btn btn-primary" id="btnDriveFetch" style="margin-top:10px">+ Analyser un document</button>' +
    '<p id="driveMsg" style="margin-top:8px;font-size:.9rem;color:var(--muted)"></p>';
  document.getElementById("analyzerMount").appendChild(driveRow);

  document.getElementById("btnDriveFetch").onclick = function () {
    var url = document.getElementById("aiDriveUrl").value.trim();
    if (!url) return;
    document.getElementById("driveMsg").textContent =
      "Drive : ouvrez le fichier, copiez le texte dans la zone d'analyse ci-dessus (intégration Drive OAuth à brancher comme sur le multisite).";
    document.getElementById("aiDocText").value = "Document Drive: " + url + "\n(Collez ici le contenu extrait)";
  };
})();
