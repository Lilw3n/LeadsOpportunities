/**
 * Affichage structuré des réponses questionnaire / Meta Lead Ads dans le CRM.
 */
(function (global) {
  var FIELD_LABELS = {
    vtcPlatform: "Plateforme VTC",
    vtcStatus: "Statut VTC",
    postalCode: "Code postal",
    householdType: "Profil foyer",
    healthPriority: "Priorité santé",
    healthStatus: "Mutuelle actuelle",
    immoProjectStage: "Projet immo",
    financeProject: "Avancement projet",
    immoPropertyPrice: "Budget / montant",
    homeStatus: "Statut occupant",
    homeType: "Type logement",
    homeSurface: "Surface",
    autoDriverProfile: "Profil conducteur",
    autoFormula: "Formule auto",
    bonusMalus: "Bonus-malus",
    serviceNeed: "Produit demandé",
  };

  var DEVIS_KEYS = Object.keys(FIELD_LABELS);

  function parsePayload(lead) {
    if (!lead) return {};
    if (lead.payload_obj && typeof lead.payload_obj === "object") return lead.payload_obj;
    if (lead.payload && typeof lead.payload === "object") return lead.payload;
    try {
      return lead.payload ? JSON.parse(lead.payload) : {};
    } catch (e) {
      return {};
    }
  }

  function isMetaLead(lead) {
    if (!lead) return false;
    var payload = parsePayload(lead);
    return (
      lead.source === "meta_lead_ads" ||
      payload.source === "meta_lead_ads" ||
      !!payload.meta_leadgen_id ||
      lead.utm_source === "meta"
    );
  }

  function getDevisPreview(payload) {
    if (!payload) return [];
    if (Array.isArray(payload.devis_preview) && payload.devis_preview.length) {
      return payload.devis_preview;
    }
    var out = [];
    DEVIS_KEYS.forEach(function (k) {
      if (payload[k]) {
        out.push({ key: k, label: FIELD_LABELS[k] || k, value: String(payload[k]) });
      }
    });
    return out;
  }

  function getDevisSummary(lead) {
    var payload = parsePayload(lead);
    if (payload.devis_summary) return payload.devis_summary;
    var preview = getDevisPreview(payload);
    if (!preview.length) return "";
    return preview
      .map(function (p) {
        return p.label + ": " + p.value;
      })
      .join(" · ")
      .slice(0, 280);
  }

  function renderDevisTable(payload, esc) {
    esc =
      esc ||
      function (s) {
        var d = document.createElement("div");
        d.textContent = s == null ? "" : s;
        return d.innerHTML;
      };
    var rows = getDevisPreview(payload);
    if (!rows.length) return "";
    return (
      '<table class="crm-devis-table"><tbody>' +
      rows
        .map(function (r) {
          return (
            "<tr><th>" +
            esc(r.label) +
            "</th><td>" +
            esc(r.value) +
            "</td></tr>"
          );
        })
        .join("") +
      "</tbody></table>"
    );
  }

  function renderMetaPanel(lead, esc) {
    esc =
      esc ||
      function (s) {
        var d = document.createElement("div");
        d.textContent = s == null ? "" : s;
        return d.innerHTML;
      };
    if (!isMetaLead(lead)) return "";
    var payload = parsePayload(lead);
    var pct =
      payload.questionnaire_pct != null
        ? payload.questionnaire_pct
        : Math.min(
            100,
            Math.round(
              (Number(lead.questionnaire_step || payload.questionnaire_step || 0) /
                Math.max(1, Number(lead.questionnaire_total || payload.questionnaire_total || 10))) *
                100
            )
          );

    var items = [
      { label: "Formulaire Meta", value: payload.meta_form_name || payload.meta_form_template },
      { label: "Leadgen ID", value: payload.meta_leadgen_id },
      { label: "Campagne", value: lead.utm_campaign || payload.utm_campaign },
      { label: "Annonce", value: payload.meta_ad_id || payload.utm_content },
      { label: "Plateforme", value: lead.platform || payload.platform },
      { label: "Ville", value: lead.city || payload.city },
      { label: "Code postal", value: lead.postal_code || payload.postal_code || payload.postalCode },
      { label: "Landing cible", value: payload.landing_path },
      { label: "Parcours", value: payload.parcours_label || payload.parcours_id },
    ].filter(function (i) {
      return i.value;
    });

    var html =
      '<section class="crm-meta-panel panel">' +
      '<div class="crm-section-head"><div><p class="crm-eyebrow">Meta Lead Ads</p>' +
      '<h2 style="margin:0;font-size:1rem">Données formulaire instantané</h2></div>' +
      '<span class="acq-badge meta">📘 ' +
      pct +
      "% complété</span></div>";

    if (payload.devis_summary) {
      html +=
        '<p class="crm-devis-summary"><strong>Résumé devis :</strong> ' +
        esc(payload.devis_summary) +
        "</p>";
    }

    html += renderDevisTable(payload, esc);

    if (items.length) {
      html +=
        '<dl class="crm-meta-dl">' +
        items
          .map(function (i) {
            return "<dt>" + esc(i.label) + "</dt><dd>" + esc(String(i.value)) + "</dd>";
          })
          .join("") +
        "</dl>";
    }

    if (payload.custom_answers && Object.keys(payload.custom_answers).length) {
      html +=
        '<details class="crm-meta-raw"><summary>Réponses brutes Meta</summary><pre>' +
        esc(JSON.stringify(payload.custom_answers, null, 2)) +
        "</pre></details>";
    }

    html += "</section>";
    return html;
  }

  function renderDashboardBlock(lead, esc) {
    if (!isMetaLead(lead)) return "";
    var payload = parsePayload(lead);
    var summary = getDevisSummary(lead);
    var table = renderDevisTable(payload, esc);
    if (!summary && !table) return "";
    return (
      '<div class="detail-item detail-full crm-dash-meta">' +
      '<div class="dlabel">Meta Lead Ads — réponses devis</div>' +
      '<div class="dvalue">' +
      (summary ? "<p><strong>" + esc(summary) + "</strong></p>" : "") +
      table +
      "</div></div>"
    );
  }

  global.CrmLeadPayloadView = {
    FIELD_LABELS: FIELD_LABELS,
    parsePayload: parsePayload,
    isMetaLead: isMetaLead,
    getDevisPreview: getDevisPreview,
    getDevisSummary: getDevisSummary,
    renderDevisTable: renderDevisTable,
    renderMetaPanel: renderMetaPanel,
    renderDashboardBlock: renderDashboardBlock,
  };
})(typeof window !== "undefined" ? window : global);
