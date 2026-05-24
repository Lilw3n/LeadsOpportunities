/**
 * Modal import conducteur Gemini — inspire DriverImportModal + geminiImport.ts multisite.
 */
window.CrmDriverImportModal = {
  open: function (opts) {
    opts = opts || {};
    var overlay = document.createElement("div");
    overlay.className = "mrv-overlay";
    overlay.innerHTML =
      '<div class="mrv-modal panel" style="max-width:640px">' +
      "<h3>📄 Import conducteur (IA)</h3>" +
      '<p class="mrv-sub">Collez un relevé d\'information, permis ou extrait PDF — inspire geminiImport multisite.</p>' +
      '<textarea id="drvImportText" rows="10" style="width:100%;padding:10px;border:1px solid var(--line);border-radius:8px;box-sizing:border-box" placeholder="Texte du document…"></textarea>' +
      '<div id="drvImportResult" style="margin-top:12px;font-size:.9rem"></div>' +
      '<div class="mrv-actions" style="margin-top:14px">' +
      '<button type="button" class="btn btn-ghost" data-act="close">Fermer</button>' +
      '<button type="button" class="btn btn-primary" data-act="run">Analyser</button>' +
      (opts.contactId
        ? '<a href="./crm-driver-new.html?contactId=' +
          encodeURIComponent(opts.contactId) +
          '" class="btn btn-ghost">+ Conducteur manuel</a>'
        : "") +
      "</div></div>";
    document.body.appendChild(overlay);
    overlay.querySelector('[data-act="close"]').onclick = function () {
      overlay.remove();
    };
    overlay.querySelector('[data-act="run"]').onclick = function () {
      var text = document.getElementById("drvImportText").value.trim();
      var box = document.getElementById("drvImportResult");
      box.textContent = "Analyse en cours…";
      fetch("/api/crm/driver-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("lo_token"),
        },
        body: JSON.stringify({ text: text }),
      })
        .then(function (r) {
          return r.json();
        })
        .then(function (res) {
          if (!res.ok) {
            box.innerHTML = "<p style='color:#b91c1c'>" + (res.error || "Erreur") + "</p>";
            return;
          }
          var p = res.data.personalInfo || {};
          var periods = (res.data.insurancePeriods || []).length;
          var claims = (res.data.claims || []).length;
          box.innerHTML =
            "<p style='color:#166534'>✓ Extraction " +
            (res.provider || "IA") +
            (res.validation && res.validation.errors.length
              ? " — alertes : " + res.validation.errors.join(", ")
              : "") +
            "</p>" +
            "<dl style='display:grid;grid-template-columns:120px 1fr;gap:6px;margin-top:8px'>" +
            "<dt>Nom</dt><dd>" +
            esc((p.firstName || "") + " " + (p.lastName || "")) +
            "</dd><dt>Permis</dt><dd>" +
            esc(p.licenseNumber || "—") +
            "</dd><dt>Périodes</dt><dd>" +
            periods +
            "</dd><dt>Sinistres</dt><dd>" +
            claims +
            "</dd></dl>" +
            (opts.onExtracted
              ? '<button type="button" class="btn btn-primary btn-sm" id="drvApply" style="margin-top:10px">Appliquer à la fiche</button>'
              : "");
          var apply = document.getElementById("drvApply");
          if (apply) {
            apply.onclick = function () {
              opts.onExtracted(res.data);
              overlay.remove();
            };
          }
        });
    };
  },
};

function esc(s) {
  var d = document.createElement("div");
  d.textContent = s == null ? "" : s;
  return d.innerHTML;
}
