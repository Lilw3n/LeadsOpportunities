/* Panneau « Campagnes Meta » du hub Gestion pubs (crm-pubs.html) */
(function () {
  var box = document.getElementById("metaCampaignsBody");
  var presetSel = document.getElementById("metaCampaignsPreset");
  if (!box) return;

  var PRESET_LABEL = {
    today: "aujourd'hui",
    last_7d: "7 derniers jours",
    last_30d: "30 derniers jours",
    this_month: "ce mois-ci",
    maximum: "depuis le début",
  };
  var STATUS_LABEL = {
    ACTIVE: "Active",
    PAUSED: "En pause",
    CAMPAIGN_PAUSED: "En pause",
    ADSET_PAUSED: "Ensemble en pause",
    IN_PROCESS: "En traitement",
    WITH_ISSUES: "Problème",
    ARCHIVED: "Archivée",
    DELETED: "Supprimée",
  };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function euro(n) {
    return Number(n || 0).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
  }

  function guide(account) {
    return (
      '<div style="border:1px solid #f5c2c0;background:#fff5f5;border-radius:10px;padding:12px 14px">' +
      "<p><strong>Il manque la clé Meta pour afficher vos campagnes ici.</strong></p>" +
      "<ol style=\"margin:.4rem 0 0 1.1rem;line-height:1.6\">" +
      '<li>Ouvrez <a href="https://business.facebook.com/settings/system-users" target="_blank" rel="noopener">Paramètres de l\'entreprise → Utilisateurs système</a> (compte « M Wendy Buchet »).</li>' +
      "<li>Créez un utilisateur système (rôle Admin), puis « Ajouter des éléments » : le compte publicitaire <code>" +
      esc(account) +
      "</code> avec le contrôle total.</li>" +
      "<li>« Générer un jeton » : cochez <code>ads_management</code> et <code>ads_read</code>, durée « Jamais ».</li>" +
      "<li>Sur Vercel (projet leads-opportunities) → Settings → Environment Variables : ajoutez <code>META_ADS_TOKEN</code> avec ce jeton, puis redéployez.</li>" +
      "</ol>" +
      '<p style="color:var(--muted);margin:.5rem 0 0">Si le compte pub n\'est pas dans l\'entreprise, ajoutez-le d\'abord dans « Comptes publicitaires ».</p>' +
      "</div>"
    );
  }

  function render(d) {
    if (!d.tokenConfigured) {
      box.innerHTML = guide(d.account);
      return;
    }
    var t = d.totals || {};
    var rows = (d.campaigns || [])
      .map(function (c) {
        var active = c.effectiveStatus === "ACTIVE";
        return (
          "<tr>" +
          "<td><strong>" + esc(c.name) + "</strong><br><span style=\"color:var(--muted);font-size:.8rem\">" +
          esc(c.objective || "") + (c.dailyBudget != null ? " · " + euro(c.dailyBudget) + "/jour" : "") + "</span></td>" +
          '<td><span class="badge" style="background:' + (active ? "#dcfce7;color:#166534" : "#f1f5f9;color:#475569") + '">' +
          esc(STATUS_LABEL[c.effectiveStatus] || c.effectiveStatus) + "</span></td>" +
          "<td>" + euro(c.spend) + "</td>" +
          "<td>" + c.clicks + "</td>" +
          "<td>" + c.visits + "</td>" +
          "<td><strong>" + c.leads + "</strong></td>" +
          "<td>" + (c.costPerLead != null ? euro(c.costPerLead) : "—") + "</td>" +
          '<td><button type="button" class="btn btn-ghost btn-sm" data-meta-toggle="' + esc(c.id) + '" data-meta-to="' +
          (active ? "PAUSED" : "ACTIVE") + '">' + (active ? "Mettre en pause" : "Relancer") + "</button></td>" +
          "</tr>"
        );
      })
      .join("");
    box.innerHTML =
      '<p style="margin:0 0 .6rem">Compte <code>' + esc(d.account) + "</code> · " + esc(PRESET_LABEL[d.datePreset] || d.datePreset) +
      " : <strong>" + euro(t.spend) + "</strong> dépensés, " + t.clicks + " clics, " + t.visits + " visites, <strong>" + t.leads +
      " lead(s)</strong> · " + t.active + " campagne(s) active(s).</p>" +
      (rows
        ? '<div style="overflow-x:auto"><table class="crm-table" style="width:100%"><thead><tr>' +
          "<th>Campagne</th><th>État</th><th>Dépense</th><th>Clics</th><th>Visites</th><th>Leads Meta</th><th>Coût / lead</th><th></th>" +
          "</tr></thead><tbody>" + rows + "</tbody></table></div>"
        : "<p>Aucune campagne sur ce compte.</p>") +
      '<p style="color:var(--muted);font-size:.8rem;margin:.6rem 0 0">« Leads Meta » = ce que Meta compte (formulaire Facebook ou pixel). ' +
      'Les leads réellement reçus sont dans <a href="./dashboard.html?section=leads">Leads</a>, filtre Canal → Pub.</p>';
  }

  function load() {
    box.textContent = "Chargement…";
    var preset = presetSel ? presetSel.value : "last_30d";
    fetch("/api/crm/meta-campaigns?preset=" + encodeURIComponent(preset), { credentials: "include" })
      .then(function (r) {
        return r.json();
      })
      .then(function (d) {
        if (d.ok) render(d);
        else box.textContent = d.error || "Erreur";
      })
      .catch(function () {
        box.textContent = "Impossible de charger les campagnes Meta.";
      });
  }

  box.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-meta-toggle]");
    if (!btn) return;
    var to = btn.getAttribute("data-meta-to");
    if (to === "ACTIVE" && !window.confirm("Relancer cette campagne ? Elle recommencera à dépenser son budget.")) return;
    btn.disabled = true;
    fetch("/api/crm/meta-campaigns", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: btn.getAttribute("data-meta-toggle"), status: to }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (d) {
        if (!d.ok) window.alert(d.error || "Action refusée par Meta");
        load();
      })
      .catch(function () {
        btn.disabled = false;
      });
  });

  if (presetSel) presetSel.addEventListener("change", load);
  var refresh = document.getElementById("btnPubRefresh");
  if (refresh) refresh.addEventListener("click", load);
  load();
})();
