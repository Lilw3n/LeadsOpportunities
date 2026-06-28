(function () {
  var TOKEN_KEY = "lo_token";
  var token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    location.href = "./crm.html";
    return;
  }

  var allLeads = [];
  var filterVertical = "";
  var filterView = localStorage.getItem("lo_meta_view") || "active";
  var searchQ = "";

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : s;
    return d.innerHTML;
  }

  function authHeaders() {
    return { Authorization: "Bearer " + token, "Content-Type": "application/json" };
  }

  function filtered() {
    return allLeads.filter(function (l) {
      if (filterVertical && l.vertical !== filterVertical) return false;
      if (searchQ) {
        var q = searchQ.toLowerCase();
        var hay =
          String(l.email || "") +
          " " +
          String(l.phone || "") +
          " " +
          String(l.full_name || "") +
          " " +
          String(l.devis_summary || "");
        if (hay.toLowerCase().indexOf(q) < 0) return false;
      }
      return l.pipeline_stage !== "won" && l.pipeline_stage !== "lost";
    });
  }

  function cardHtml(l) {
    var pm = window.CrmLeadPlatform.meta(l.platform);
    var pct = l.questionnaire_pct || 0;
    var title = l.full_name || l.email || l.phone || l.id;
    var devisTable = window.CrmLeadPayloadView
      ? window.CrmLeadPayloadView.renderDevisTable(
          window.CrmLeadPayloadView.parsePayload(l),
          esc
        )
      : "";

    return (
      '<article class="meta-inbox-card' +
      (!l.is_opened ? " unopened" : "") +
      '">' +
      '<header class="meta-inbox-head">' +
      '<div><span class="acq-platform">' +
      pm.icon +
      "</span> <strong>" +
      esc(title) +
      "</strong>" +
      (l.meta_form_name
        ? '<br><span class="acq-meta">' + esc(l.meta_form_name) + "</span>"
        : "") +
      "</div>" +
      '<span class="acq-priority ' +
      esc(l.priority || "medium") +
      '"></span></header>' +
      '<div class="acq-progress" title="Questionnaire ' +
      pct +
      '%"><span style="width:' +
      pct +
      '%"></span></div>' +
      (l.devis_summary
        ? '<p class="crm-devis-summary">' + esc(l.devis_summary) + "</p>"
        : "") +
      devisTable +
      '<div class="meta-inbox-meta">' +
      esc(l.vertical || "—") +
      " · score " +
      (l.lead_score != null ? l.lead_score : "—") +
      (l.city || l.postal_code
        ? " · " + esc([l.postal_code, l.city].filter(Boolean).join(" "))
        : "") +
      " · " +
      new Date(l.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) +
      "</div>" +
      '<div class="meta-inbox-actions">' +
      '<a href="./crm-lead-detail.html?id=' +
      encodeURIComponent(l.id) +
      '" class="btn btn-primary btn-sm">Ouvrir fiche</a>' +
      '<a href="./crm-tariff-grid.html?leadId=' +
      encodeURIComponent(l.id) +
      '" class="btn btn-ghost btn-sm">Tarifs</a>' +
      (l.contact_id
        ? '<a href="./crm-contact.html?id=' +
          encodeURIComponent(l.contact_id) +
          '" class="btn btn-ghost btn-sm">Contact</a>'
        : "") +
      "</div></article>"
    );
  }

  function render() {
    var leads = filtered();
    document.getElementById("metaStats").innerHTML =
      '<span class="acq-stat">Leads Meta : <strong>' +
      leads.length +
      "</strong></span>" +
      '<span class="acq-stat">Non ouverts : <strong>' +
      leads.filter(function (l) {
        return !l.is_opened;
      }).length +
      "</strong></span>" +
      '<span class="acq-stat">Score moyen : <strong>' +
      (leads.length
        ? Math.round(
            leads.reduce(function (s, l) {
              return s + (l.lead_score || 0);
            }, 0) / leads.length
          )
        : "—") +
      "</strong></span>";

    var list = document.getElementById("metaInboxList");
    if (!leads.length) {
      list.innerHTML =
        '<div class="crm-empty-state"><h3>Aucun lead Meta</h3><p>Créez vos formulaires Lead Ads depuis <code>docs/META-LEAD-FORMS-SETUP.md</code> et liez le webhook.</p></div>';
      return;
    }
    list.innerHTML = leads.map(cardHtml).join("");
  }

  function load() {
    var url =
      "/api/crm/leads-acquisition?limit=150&view=" +
      encodeURIComponent(filterView) +
      "&source=meta_lead_ads";
    fetch(url, { headers: authHeaders() })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!res.ok) {
          document.getElementById("metaInboxList").innerHTML =
            '<div class="crm-empty-state"><h3>Indisponible</h3><p>' +
            esc(res.error || "Erreur") +
            "</p></div>";
          return;
        }
        allLeads = res.leads || [];
        render();
      });
  }

  document.getElementById("metaSearch").oninput = function () {
    searchQ = this.value.trim();
    render();
  };
  document.getElementById("metaVertical").onchange = function () {
    filterVertical = this.value;
    render();
  };
  document.getElementById("metaView").value = filterView;
  document.getElementById("metaView").onchange = function () {
    filterView = this.value;
    localStorage.setItem("lo_meta_view", filterView);
    load();
  };
  document.getElementById("btnMetaRefresh").onclick = load;

  load();
})();
