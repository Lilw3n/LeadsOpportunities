/**
 * Panneau attribution lead — UTM, clics pub, liens CRM.
 */
(function (global) {
  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : s;
    return d.innerHTML;
  }

  function parsePayload(lead) {
    if (!lead) return {};
    if (lead.payload_obj) return lead.payload_obj;
    if (typeof lead.payload === "object") return lead.payload;
    try {
      return lead.payload ? JSON.parse(lead.payload) : {};
    } catch (e) {
      return {};
    }
  }

  function pick(lead, payload, keys) {
    for (var i = 0; i < keys.length; i++) {
      var v = lead[keys[i]];
      if (v != null && String(v).trim() !== "") return v;
      v = payload[keys[i]];
      if (v != null && String(v).trim() !== "") return v;
    }
    return null;
  }

  function renderAttributionPanel(lead, options) {
    options = options || {};
    if (!lead) return "";
    var payload = parsePayload(lead);
    var pm = global.CrmLeadPlatform
      ? global.CrmLeadPlatform.meta(global.CrmLeadPlatform.detect(lead))
      : { icon: "📋", label: lead.platform || "—" };

    var rows = [
      { label: "Plateforme détectée", value: pm.icon + " " + pm.label, highlight: true },
      { label: "Source brute", value: pick(lead, payload, ["source"]) },
      { label: "utm_source", value: pick(lead, payload, ["utm_source", "attr_last_utm_source"]) },
      { label: "utm_medium", value: pick(lead, payload, ["utm_medium", "attr_last_utm_medium"]) },
      { label: "utm_campaign", value: pick(lead, payload, ["utm_campaign", "attr_last_utm_campaign"]) },
      { label: "utm_content", value: pick(lead, payload, ["utm_content", "attr_last_utm_content"]) },
      { label: "Parcours", value: pick(lead, payload, ["parcours_label", "parcours_id"]) },
      { label: "visitor_id", value: pick(lead, payload, ["visitor_id"]) },
      { label: "gclid (Google)", value: pick(lead, payload, ["gclid", "attr_last_gclid"]) },
      { label: "fbclid (Meta)", value: pick(lead, payload, ["fbclid", "attr_last_fbclid"]) },
      { label: "ttclid (TikTok)", value: pick(lead, payload, ["ttclid", "attr_last_ttclid"]) },
      { label: "msclkid (Bing)", value: pick(lead, payload, ["msclkid"]) },
      { label: "Landing", value: pick(lead, payload, ["landing_path", "landing_slug"]) },
      { label: "Formulaire Meta", value: pick(lead, payload, ["meta_form_name", "form_id"]) },
    ].filter(function (r) {
      return r.value;
    });

    var campaign = pick(lead, payload, ["utm_campaign"]);
    var platform = global.CrmLeadPlatform ? global.CrmLeadPlatform.detect(lead) : lead.platform;

    var html =
      '<section class="panel crm-attribution-panel">' +
      '<div class="crm-section-head"><div><p class="crm-eyebrow">Origine du lead</p>' +
      '<h2 style="margin:0;font-size:1rem">Attribution & tracking</h2></div>' +
      '<a href="./crm-sources.html' +
      (platform ? "?platform=" + encodeURIComponent(platform) : "") +
      '" class="btn btn-ghost btn-sm">Voir toutes les sources</a></div>';

    if (!rows.length) {
      html += '<p style="color:var(--muted)">Aucune donnée UTM — lead direct ou ancien enregistrement.</p>';
    } else {
      html +=
        '<dl class="crm-meta-dl">' +
        rows
          .map(function (r) {
            return (
              "<dt>" +
              esc(r.label) +
              "</dt><dd" +
              (r.highlight ? ' class="crm-attrib-highlight"' : "") +
              ">" +
              esc(String(r.value)) +
              "</dd>"
            );
          })
          .join("") +
        "</dl>";
    }

    html += '<div class="crm-attrib-actions">';
    if (campaign) {
      html +=
        '<a href="./crm-acquisition.html" class="btn btn-ghost btn-sm">Pipeline acquisition</a>' +
        '<a href="./crm-sources.html?campaign=' +
        encodeURIComponent(campaign) +
        '" class="btn btn-ghost btn-sm">Stats campagne</a>';
    }
    html +=
      '<a href="./crm-pubs.html" class="btn btn-ghost btn-sm">Gestion pubs ↗</a>' +
      "</div></section>";
    return html;
  }

  global.CrmAttributionPanel = {
    render: renderAttributionPanel,
    parsePayload: parsePayload,
  };
})(window);
