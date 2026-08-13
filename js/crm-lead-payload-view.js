/**
 * Affichage structuré des réponses questionnaire / Meta Lead Ads dans le CRM.
 */
(function (global) {
  var FIELD_LABELS = {
    vtcPlatform: "Plateforme VTC",
    vtcStatus: "Statut VTC",
    postalCode: "Code postal",
    postal_code: "Code postal",
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
    need: "Besoin",
    fullName: "Nom complet",
    firstName: "Prénom",
    first_name: "Prénom",
    lastName: "Nom",
    last_name: "Nom",
    email: "E-mail",
    phone: "Téléphone",
    city: "Ville",
    message: "Message",
    comment: "Commentaire",
    vertical: "Vertical",
    serviceLabel: "Produit",
    parcours_label: "Parcours",
    parcours_id: "Parcours ID",
  };

  var SKIP_PAYLOAD_KEYS = {
    utm_source: 1,
    utm_medium: 1,
    utm_campaign: 1,
    utm_content: 1,
    gclid: 1,
    fbclid: 1,
    ttclid: 1,
    msclkid: 1,
    visitor_id: 1,
    visitorId: 1,
    clientIp: 1,
    client_ip: 1,
    client_event_id: 1,
    event_id: 1,
    leadId: 1,
    lead_id: 1,
    source: 1,
    journey: 1,
    funnel: 1,
    eligibility: 1,
    tariffQuote: 1,
    crossSell: 1,
    portfolio: 1,
    relevance: 1,
    relevanceReasons: 1,
    questionnaire_step: 1,
    questionnaire_total: 1,
    questionnaire_pct: 1,
    questionnaireDraft: 1,
    event_category: 1,
    event_label: 1,
    page: 1,
    variant: 1,
    consent: 1,
    phone_consent: 1,
    phone_consent_at: 1,
    phone_consent_text: 1,
    phone_consent_version: 1,
    phone_consent_expires_at: 1,
    phone_consent_page_url: 1,
    phone_consent_ip: 1,
    phone_consent_org: 1,
    legacy_consent_mapped: 1,
    rgpd: 1,
    _hp: 1,
    website: 1,
    company_url: 1,
    attr_fbp: 1,
    attr_last_fbclid: 1,
    serverReceivedAt: 1,
    openedAt: 1,
    devis_preview: 1,
    devis_summary: 1,
    custom_answers: 1,
    meta_leadgen_id: 1,
    meta_form_name: 1,
    meta_form_template: 1,
    meta_ad_id: 1,
    payload: 1,
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

  function humanizeKey(key) {
    if (FIELD_LABELS[key]) return FIELD_LABELS[key];
    return String(key)
      .replace(/_/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^\w/, function (c) {
        return c.toUpperCase();
      });
  }

  function flattenValue(val) {
    if (val == null || val === "") return null;
    if (typeof val === "boolean") return val ? "Oui" : "Non";
    if (typeof val === "number") return String(val);
    if (typeof val === "string") return val.trim() || null;
    if (Array.isArray(val)) {
      var joined = val
        .map(function (x) {
          return typeof x === "object" ? JSON.stringify(x) : String(x);
        })
        .join(", ");
      return joined || null;
    }
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  }

  function getAllAnswerRows(payload) {
    if (!payload) return [];
    var seen = {};
    var rows = [];

    function pushRow(label, value, key) {
      var v = flattenValue(value);
      if (!v) return;
      var id = (key || label) + ":" + v;
      if (seen[id]) return;
      seen[id] = true;
      rows.push({ key: key || label, label: label, value: v });
    }

    getDevisPreview(payload).forEach(function (r) {
      pushRow(r.label, r.value, r.key);
    });

    if (payload.questionnaireDraft && typeof payload.questionnaireDraft === "object") {
      Object.keys(payload.questionnaireDraft).forEach(function (k) {
        pushRow("Brouillon · " + humanizeKey(k), payload.questionnaireDraft[k], "draft_" + k);
      });
    }

    if (payload.custom_answers && typeof payload.custom_answers === "object") {
      Object.keys(payload.custom_answers).forEach(function (k) {
        pushRow("Meta · " + humanizeKey(k), payload.custom_answers[k], "meta_" + k);
      });
    }

    Object.keys(payload).forEach(function (k) {
      if (SKIP_PAYLOAD_KEYS[k]) return;
      if (k.indexOf("utm_") === 0 || k.indexOf("attr_") === 0) return;
      pushRow(humanizeKey(k), payload[k], k);
    });

    return rows;
  }

  function renderAnswersTable(rows, esc) {
    esc =
      esc ||
      function (s) {
        var d = document.createElement("div");
        d.textContent = s == null ? "" : s;
        return d.innerHTML;
      };
    if (!rows.length) return "";
    return (
      '<table class="crm-devis-table mbx-answers-table"><tbody>' +
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

  function renderFunnelSteps(payload, esc) {
    esc =
      esc ||
      function (s) {
        var d = document.createElement("div");
        d.textContent = s == null ? "" : s;
        return d.innerHTML;
      };
    var funnel = payload.funnel;
    if (!funnel || !funnel.events || !funnel.events.length) return "";
    return (
      '<p class="mbx-funnel-steps"><strong>Étapes parcourues :</strong> ' +
      funnel.events
        .slice(-8)
        .map(function (e) {
          return esc((e.step_name || "Étape " + e.step) + (e.event ? " (" + e.event + ")" : ""));
        })
        .join(" → ") +
      "</p>"
    );
  }

  function renderPhoneConsentProof(lead, esc) {
    esc =
      esc ||
      function (s) {
        var d = document.createElement("div");
        d.textContent = s == null ? "" : s;
        return d.innerHTML;
      };
    var payload = parsePayload(lead);
    var ok =
      lead.phone_consent === true ||
      lead.phone_consent === "t" ||
      payload.phone_consent === true ||
      payload.phone_consent === 1 ||
      payload.phone_consent === "1";
    var at = lead.phone_consent_at || payload.phone_consent_at || "";
    var exp = lead.phone_consent_expires_at || payload.phone_consent_expires_at || "";
    var ver = lead.phone_consent_version || payload.phone_consent_version || "";
    var text = payload.phone_consent_text || "";
    var url = payload.phone_consent_page_url || payload.page || "";
    var ip = payload.phone_consent_ip || lead.client_ip || payload.clientIp || "";
    var badge = ok
      ? '<span class="acq-badge" style="background:#ecfdf5;color:#047857">Opt-in appel OK</span>'
      : '<span class="acq-badge" style="background:#fef2f2;color:#b91c1c">Pas d\'opt-in appel</span>';
    var html =
      '<section class="crm-meta-panel panel" style="margin-bottom:12px">' +
      '<div class="crm-section-head"><div><p class="crm-eyebrow">Preuve consentement téléphone</p>' +
      '<h2 style="margin:0;font-size:1rem">Prospection téléphonique (loi 11/08/2026)</h2></div>' +
      badge +
      "</div>";
    if (ok) {
      html +=
        "<ul style=\"margin:8px 0 0;padding-left:1.1rem;font-size:.88rem;line-height:1.45\">" +
        "<li><strong>Recueilli le :</strong> " +
        esc(at || "—") +
        "</li>" +
        "<li><strong>Expire le :</strong> " +
        esc(exp || "—") +
        " (max 12 mois)</li>" +
        "<li><strong>Version texte :</strong> " +
        esc(ver || "—") +
        "</li>" +
        "<li><strong>Page :</strong> " +
        esc(url || "—") +
        "</li>" +
        "<li><strong>IP :</strong> " +
        esc(ip || "—") +
        "</li>" +
        "</ul>";
      if (text) {
        html +=
          '<p style="margin:10px 0 0;padding:10px;background:#f8fafc;border-radius:8px;font-size:.82rem"><em>« ' +
          esc(text) +
          " »</em></p>";
      }
    } else {
      html +=
        '<p style="margin:8px 0 0;color:var(--muted);font-size:.88rem">Aucun consentement d\'appel enregistré — ne pas démarcher par téléphone à des fins commerciales.</p>';
    }
    html += "</section>";
    return html;
  }

  function renderQuestionnairePanel(lead, esc) {
    esc =
      esc ||
      function (s) {
        var d = document.createElement("div");
        d.textContent = s == null ? "" : s;
        return d.innerHTML;
      };
    var payload = parsePayload(lead);
    var rows = getAllAnswerRows(payload);
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

    if (!rows.length && !payload.devis_summary && !(payload.funnel && payload.funnel.events)) {
      return (
        '<section class="crm-meta-panel panel mbx-answers-panel">' +
        '<p class="alerts-empty">Aucune réponse structurée enregistrée pour ce lead.</p></section>'
      );
    }

    var html =
      '<section class="crm-meta-panel panel mbx-answers-panel">' +
      '<div class="crm-section-head"><div><p class="crm-eyebrow">Réponses questionnaire</p>' +
      '<h2 style="margin:0;font-size:1rem">Ce que le prospect a rempli</h2></div>' +
      '<span class="acq-badge">' +
      pct +
      "% · étape " +
      esc(String(lead.questionnaire_step || payload.questionnaire_step || 0)) +
      "/" +
      esc(String(lead.questionnaire_total || payload.questionnaire_total || 10)) +
      "</span></div>";

    if (payload.devis_summary) {
      html +=
        '<p class="crm-devis-summary"><strong>Résumé :</strong> ' +
        esc(payload.devis_summary) +
        "</p>";
    }

    html += renderFunnelSteps(payload, esc);
    html += renderAnswersTable(rows, esc);
    html += "</section>";
    return html;
  }

  function renderDashboardBlock(lead, esc) {
    esc =
      esc ||
      function (s) {
        var d = document.createElement("div");
        d.textContent = s == null ? "" : s;
        return d.innerHTML;
      };
    var payload = parsePayload(lead);
    var consentBlock = renderPhoneConsentProof(lead, esc);
    var questionnaireBlock = renderQuestionnairePanel(lead, esc);
    if (isMetaLead(lead)) {
      var metaExtra = renderMetaPanel(lead, esc);
      if (metaExtra) return consentBlock + metaExtra;
    }
    if (questionnaireBlock.indexOf("Aucune réponse") < 0) {
      return (
        '<div class="detail-item detail-full crm-dash-meta">' +
        '<div class="dlabel">Consentement & réponses</div>' +
        '<div class="dvalue">' +
        consentBlock +
        questionnaireBlock +
        "</div></div>"
      );
    }
    var summary = getDevisSummary(lead);
    var table = renderDevisTable(payload, esc);
    if (!summary && !table) {
      return (
        '<div class="detail-item detail-full crm-dash-meta">' +
        '<div class="dlabel">Consentement téléphone</div>' +
        '<div class="dvalue">' +
        consentBlock +
        "</div></div>"
      );
    }
    return (
      '<div class="detail-item detail-full crm-dash-meta">' +
      '<div class="dlabel">Consentement & réponses devis</div>' +
      '<div class="dvalue">' +
      consentBlock +
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
    getAllAnswerRows: getAllAnswerRows,
    renderDevisTable: renderDevisTable,
    renderAnswersTable: renderAnswersTable,
    renderQuestionnairePanel: renderQuestionnairePanel,
    renderPhoneConsentProof: renderPhoneConsentProof,
    renderMetaPanel: renderMetaPanel,
    renderDashboardBlock: renderDashboardBlock,
  };
})(typeof window !== "undefined" ? window : global);
