const fs = require("fs");
const path = require("path");
const { readJson, buildRotationState } = require("./meta-campaign-rotation");
const { slackConfigured } = require("./slack-notify");

const HUB_PATH = path.join(process.cwd(), "config/ad-platform-hub.json");
const FORMS_PATH = path.join(process.cwd(), "config/meta-lead-forms.json");
const VSP_DISCRET_PATH = path.join(process.cwd(), "config/meta-campaign-vsp-discret.json");

function loadHubConfig() {
  return readJson(HUB_PATH) || { platforms: [], accounts: {} };
}

function loadMetaForms() {
  return readJson(FORMS_PATH) || { forms: {}, form_templates: {} };
}

function listMetaForms() {
  var cfg = loadMetaForms();
  return Object.keys(cfg.forms || {}).map(function (id) {
    var f = cfg.forms[id];
    return {
      form_id: id,
      name: f.name,
      template: f.template,
      vertical: f.vertical,
      campaign: f.campaign,
      landing: f.landing,
      landing_url: "https://www.leadsopportunities.fr" + (f.landing || ""),
    };
  });
}

async function buildPubsHub(options) {
  options = options || {};
  var hub = loadHubConfig();
  var origin = hub.site_origin || "https://www.leadsopportunities.fr";
  var rotation = null;
  try {
    rotation = await buildRotationState({ sql: options.sql || null });
  } catch (e) {
    rotation = null;
  }

  var active = rotation && rotation.active_slot ? rotation.active_slot : null;
  var actu = rotation && rotation.intelligence && rotation.intelligence.actu_override;
  var vspCfg = readJson(VSP_DISCRET_PATH);
  var vspCampaign = vspCfg && vspCfg.campaign ? vspCfg.campaign : null;
  var slackConfiguredFlag = slackConfigured();

  return {
    ok: true,
    accounts: hub.accounts,
    notifications: {
      slack: {
        configured: slackConfiguredFlag,
        env_var: "SLACK_BOT_TOKEN / SLACK_WEBHOOK_URL",
        doc: "./docs/SLACK-WITHALLO-NOTIFS.md",
      },
    },
    platforms: (hub.platforms || []).map(function (p) {
      return Object.assign({}, p, {
        links: (p.links || []).map(function (l) {
          return Object.assign({}, l);
        }),
      });
    }),
    meta_forms: listMetaForms(),
    rotation: rotation
      ? {
          calendar_week: rotation.calendar_week,
          active_slot: active,
          recommendation: rotation.recommendation,
          actu_override: actu,
          policy: rotation.policy,
        }
      : null,
    active_campaign: active
      ? {
          id: active.id,
          vertical: active.vertical,
          discrete: active.discrete,
          form_id: active.form_id,
          form_name: active.form_name,
          utm_campaign: active.utm_campaign,
          ad_copy: active.ad_copy,
          targeting: active.targeting,
          landing_url: active.landing_url || origin + (active.landing_path || ""),
          blog: active.blog,
          actu_override: !!active.actu_override,
        }
      : null,
    test_landings: (hub.site_landings_test || []).map(function (t) {
      return {
        label: t.label,
        url: t.path.indexOf("http") === 0 ? t.path : origin + t.path,
      };
    }),
    preset_campaigns: (hub.preset_campaigns || []).map(function (p) {
      var isActive = active && active.id === p.id;
      var isVsp = p.id === "vsp_citadine_discret" && vspCampaign;
      return Object.assign({}, p, {
        active: isActive,
        ad_copy: isVsp ? vspCampaign.ad_copy : isActive && active ? active.ad_copy : null,
        targeting: isVsp ? vspCampaign.targeting : isActive && active ? active.targeting : null,
        landing_url: isVsp
          ? vspCampaign.landing_follow_up
          : isActive && active
            ? active.landing_url || origin + (active.landing_path || "")
            : null,
      });
    }),
    vsp_discrete: vspCampaign
      ? {
          id: vspCampaign.id,
          form_id: vspCampaign.form_id,
          form_name: vspCampaign.form_name,
          utm_campaign: vspCampaign.utm_campaign,
          ad_copy: vspCampaign.ad_copy,
          targeting: vspCampaign.targeting,
          landing_url: vspCampaign.landing_follow_up,
          discrete_rules: vspCfg.discrete_rules,
          activation_checklist: vspCfg.activation_checklist,
        }
      : null,
    docs: [
      { label: "Rotation 4 semaines", href: "./docs/META-ROTATION-4-SEMAINES.md" },
      { label: "Canicule maintenant", href: "./ads/meta-canicule-maintenant.csv" },
      { label: "VSP discret", href: "./docs/META-VSP-PUB-DISCRETE.md" },
      { label: "Slack + WithAllo", href: "./docs/SLACK-WITHALLO-NOTIFS.md" },
      { label: "Tracking SEA", href: "./docs/SEA-TRACKING.md" },
    ],
  };
}

module.exports = {
  loadHubConfig,
  buildPubsHub,
  listMetaForms,
};
