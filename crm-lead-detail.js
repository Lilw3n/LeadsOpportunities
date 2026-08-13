(function () {
  var token = localStorage.getItem("lo_token");
  if (!token) location.href = "./crm.html";
  var leadId = new URLSearchParams(location.search).get("id");
  if (!leadId) location.href = "./crm-acquisition.html";

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : s;
    return d.innerHTML;
  }

  function patch(body, cb) {
    fetch("/api/crm/lead-acquisition?id=" + encodeURIComponent(leadId), {
      method: "PATCH",
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then(function (r) {
        return r.json();
      })
      .then(cb);
  }

  function render(lead) {
    var l = lead;
    var payload = l.payload_obj || {};
    try {
      if (!l.payload_obj && l.payload) payload = JSON.parse(l.payload);
    } catch (e) {}
    var pm = window.CrmLeadPlatform.meta(window.CrmLeadPlatform.detect(l));
    var pct = window.CrmLeadPlatform.questionnairePct(l);
    document.title = (l.email || l.phone || "Lead") + " | Acquisition";

    var metaPanel =
      window.CrmLeadPayloadView && window.CrmLeadPayloadView.renderMetaPanel
        ? window.CrmLeadPayloadView.renderMetaPanel(Object.assign({}, l, { payload_obj: payload }), esc)
        : "";
    var attrPanel =
      window.CrmAttributionPanel && window.CrmAttributionPanel.render
        ? window.CrmAttributionPanel.render(Object.assign({}, l, { payload_obj: payload }))
        : "";

    document.getElementById("leadMount").innerHTML =
      '<p><a href="./crm-acquisition.html" class="btn btn-ghost">← Pipeline acquisition</a> ' +
      (window.CrmLeadPayloadView && window.CrmLeadPayloadView.isMetaLead(l)
        ? '<a href="./crm-meta-inbox.html" class="btn btn-ghost">Leads Meta</a>'
        : "") +
      "</p>" +
      "<h1>" +
      pm.icon +
      " " +
      esc(l.email || l.phone || l.id) +
      "</h1>" +
      '<p style="color:var(--muted)">' +
      esc(pm.label) +
      " · " +
      esc(l.vertical) +
      " · score " +
      (l.lead_score != null ? l.lead_score : "—") +
      "</p>" +
      '<div class="crm-kpis" style="margin:16px 0">' +
      '<div class="kpi-card panel"><div class="kpi-label">Questionnaire</div><div class="kpi-value">' +
      pct +
      '%</div><div class="kpi-sub">' +
      (l.questionnaire_step || 0) +
      "/" +
      (l.questionnaire_total || 10) +
      "</div></div>" +
      '<div class="kpi-card panel"><div class="kpi-label">Étape pipeline</div><div class="kpi-value" style="font-size:1rem">' +
      esc(l.pipeline_stage || l.status) +
      "</div></div>" +
      '<div class="kpi-card panel"><div class="kpi-label">Priorité</div><div class="kpi-value" style="font-size:1rem">' +
      esc(l.priority || "medium") +
      "</div></div></div>" +
      '<div class="panel" style="display:grid;gap:12px;max-width:520px">' +
      "<label>Étape questionnaire (numéro)<input type='number' id='qStep' min='0' max='50' value='" +
      (l.questionnaire_step || 0) +
      "' style='width:100%;padding:10px;margin-top:4px;border:1px solid var(--line);border-radius:8px' /></label>" +
      "<label>Total étapes<input type='number' id='qTotal' min='1' max='50' value='" +
      (l.questionnaire_total || 10) +
      "' style='width:100%;padding:10px;margin-top:4px;border:1px solid var(--line);border-radius:8px' /></label>" +
      "<label>Pipeline<select id='pipeline' style='width:100%;padding:10px;margin-top:4px;border:1px solid var(--line);border-radius:8px'>" +
      window.CrmLeadPlatform.STAGES.map(function (s) {
        return (
          "<option value='" +
          s.id +
          "'" +
          ((l.pipeline_stage || l.status) === s.id ? " selected" : "") +
          ">" +
          s.label +
          "</option>"
        );
      }).join("") +
      "</select></label>" +
      "<label>Priorité<select id='priority' style='width:100%;padding:10px;margin-top:4px;border:1px solid var(--line);border-radius:8px'><option value='low'>Faible</option><option value='medium'>Moyenne</option><option value='high'>Élevée</option></select></label>" +
      "<label>Prochaine relance<input type='datetime-local' id='followup' style='width:100%;padding:10px;margin-top:4px;border:1px solid var(--line);border-radius:8px' /></label>" +
      "<label>Notes<textarea id='notes' rows='4' style='width:100%;padding:10px;margin-top:4px;border:1px solid var(--line);border-radius:8px'>" +
      esc(l.notes || "") +
      "</textarea></label>" +
      '<button type="button" class="btn btn-primary" id="btnSave">Enregistrer</button></div>' +
      attrPanel +
      (window.CrmLeadPayloadView && window.CrmLeadPayloadView.renderQuestionnairePanel
        ? window.CrmLeadPayloadView.renderQuestionnairePanel(
            Object.assign({}, l, { payload_obj: payload }),
            esc
          )
        : "") +
      metaPanel +
      '<p style="margin-top:16px;display:flex;flex-wrap:wrap;gap:8px">' +
      '<a href="./crm-tariff-grid.html?leadId=' +
      encodeURIComponent(leadId) +
      '" class="btn btn-primary">Éditer bordereau tarifaire</a>' +
      '<a href="./crm-immo-matching.html?leadId=' +
      encodeURIComponent(leadId) +
      '" class="btn btn-ghost">Matching biens (import critères)</a>' +
      '<a href="./crm-quote-new.html?contactId=' +
      encodeURIComponent(l.contact_id || "") +
      "&leadId=" +
      encodeURIComponent(leadId) +
      '" class="btn btn-ghost">+ Devis</a>' +
      (l.contact_id
        ? '<a href="./crm-contact.html?id=' +
          encodeURIComponent(l.contact_id) +
          '" class="btn btn-ghost">Fiche contact</a>'
        : '<button type="button" class="btn btn-ghost" id="btnConvert">Convertir en contact</button>') +
      "</p>" +
      (l.tariff_snapshot
        ? '<section class="panel" style="margin-top:16px"><h2 style="margin-top:0;font-size:1rem">Dernier bordereau (' +
          esc(l.tariff_insurer || "") +
          ")</h2><pre style='font-size:.78rem;overflow:auto'>" +
          esc(JSON.stringify(l.tariff_snapshot_obj || {}, null, 2).slice(0, 2000)) +
          "</pre></section>"
        : "");

    document.getElementById("priority").value = l.priority || "medium";
    if (l.next_followup_at) {
      try {
        var d = new Date(l.next_followup_at);
        document.getElementById("followup").value = d.toISOString().slice(0, 16);
      } catch (e) {}
    }

    document.getElementById("btnSave").onclick = function () {
      patch(
        {
          questionnaire_step: Number(document.getElementById("qStep").value),
          questionnaire_total: Number(document.getElementById("qTotal").value),
          pipeline_stage: document.getElementById("pipeline").value,
          priority: document.getElementById("priority").value,
          next_followup_at: document.getElementById("followup").value
            ? new Date(document.getElementById("followup").value).toISOString()
            : null,
          notes: document.getElementById("notes").value,
        },
        function (res) {
          if (res.ok) load();
          else alert(res.error);
        }
      );
    };

    var bc = document.getElementById("btnConvert");
    if (bc) {
      bc.onclick = function () {
        fetch("/api/crm/convert-lead", {
          method: "POST",
          headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
          body: JSON.stringify({ leadId: leadId }),
        })
          .then(function (r) {
            return r.json();
          })
          .then(function (res) {
            if (res.ok) location.href = "./crm-contact.html?id=" + encodeURIComponent(res.contactId);
            else alert(res.error);
          });
      };
    }
  }

  function load() {
    fetch("/api/crm/lead-acquisition?id=" + encodeURIComponent(leadId), {
      headers: { Authorization: "Bearer " + token },
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!res.ok) {
          document.getElementById("leadMount").innerHTML = "<p>Lead introuvable</p>";
          return;
        }
        render(res.lead);
      });
  }

  load();
})();
