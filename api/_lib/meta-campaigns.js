/**
 * Campagnes Meta du compte pub, lues et pilotées depuis le CRM.
 * Même jeton que la sécurité pubs (META_ADS_TOKEN, permission ads_management)
 * et même compte (META_AD_ACCOUNT_ID).
 */
const { config } = require("./ads-guard");

const GRAPH = "https://graph.facebook.com/v21.0";
const PRESETS = ["today", "yesterday", "last_7d", "last_30d", "this_month", "last_month", "maximum"];

async function graph(path, token, opts) {
  const sep = path.indexOf("?") >= 0 ? "&" : "?";
  const res = await fetch(GRAPH + path + sep + "access_token=" + encodeURIComponent(token), opts);
  const body = await res.json().catch(function () {
    return {};
  });
  if (!res.ok || body.error) {
    throw new Error((body.error && body.error.message) || "Meta API " + res.status);
  }
  return body;
}

function actionValue(actions, types) {
  var total = 0;
  (actions || []).forEach(function (a) {
    if (types.indexOf(a.action_type) >= 0) total += Number(a.value) || 0;
  });
  return total;
}

function toRow(c) {
  var ins = (c.insights && c.insights.data && c.insights.data[0]) || {};
  var spend = Number(ins.spend) || 0;
  var leads = actionValue(ins.actions, ["lead", "onsite_conversion.lead_grouped", "offsite_conversion.fb_pixel_lead"]);
  var visits = actionValue(ins.actions, ["landing_page_view", "omni_landing_page_view"]);
  return {
    id: c.id,
    name: c.name,
    status: c.status,
    effectiveStatus: c.effective_status,
    objective: c.objective,
    dailyBudget: c.daily_budget != null ? Number(c.daily_budget) / 100 : null,
    spend: spend,
    impressions: Number(ins.impressions) || 0,
    clicks: Number(ins.inline_link_clicks || ins.clicks) || 0,
    visits: visits,
    leads: leads,
    costPerLead: leads ? Math.round((spend / leads) * 100) / 100 : null,
  };
}

async function listCampaigns(preset) {
  const cfg = config();
  if (!cfg.token) return { tokenConfigured: false, account: cfg.account, campaigns: [] };
  const datePreset = PRESETS.indexOf(preset) >= 0 ? preset : "last_30d";
  const fields =
    "id,name,status,effective_status,objective,daily_budget," +
    "insights.date_preset(" + datePreset + "){spend,impressions,clicks,inline_link_clicks,actions}";
  const body = await graph("/act_" + cfg.account + "/campaigns?limit=100&fields=" + encodeURIComponent(fields), cfg.token);
  const campaigns = (body.data || []).map(toRow);
  const totals = campaigns.reduce(
    function (t, c) {
      t.spend += c.spend;
      t.clicks += c.clicks;
      t.visits += c.visits;
      t.leads += c.leads;
      if (c.effectiveStatus === "ACTIVE") t.active += 1;
      return t;
    },
    { spend: 0, clicks: 0, visits: 0, leads: 0, active: 0 }
  );
  totals.spend = Math.round(totals.spend * 100) / 100;
  return { tokenConfigured: true, account: cfg.account, datePreset: datePreset, campaigns: campaigns, totals: totals };
}

/** Pause ou relance une campagne du compte configuré (vérifie qu'elle en fait partie). */
async function setCampaignStatus(id, status) {
  const cfg = config();
  if (!cfg.token) throw new Error("META_ADS_TOKEN manquant");
  if (status !== "PAUSED" && status !== "ACTIVE") throw new Error("Statut invalide");
  const cleanId = String(id || "").replace(/\D/g, "");
  if (!cleanId) throw new Error("Campagne invalide");
  const info = await graph("/" + cleanId + "?fields=account_id,name", cfg.token);
  if (String(info.account_id) !== cfg.account) throw new Error("Cette campagne n'est pas sur le compte configuré");
  await graph("/" + cleanId, cfg.token, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "status=" + status,
  });
  return { id: cleanId, name: info.name, status: status };
}

module.exports = { listCampaigns, setCampaignStatus, toRow };
