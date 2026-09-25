const { getSql } = require("./db");
const { buildTrafficStats } = require("./traffic-stats");
const { sendSlackText, slackConfigured } = require("./slack-notify");

function getAlertConfig() {
  var threshold = Number(process.env.TRAFFIC_ALERT_THRESHOLD_PCT);
  if (!Number.isFinite(threshold)) threshold = -20;
  var minVisitors = Number(process.env.TRAFFIC_ALERT_MIN_VISITORS);
  if (!Number.isFinite(minVisitors)) minVisitors = 5;
  var cooldownHours = Number(process.env.TRAFFIC_ALERT_COOLDOWN_HOURS);
  if (!Number.isFinite(cooldownHours)) cooldownHours = 24;
  var enabled = process.env.TRAFFIC_ALERT_ENABLED !== "false";
  var slack = slackConfigured();
  return {
    enabled: enabled && slack,
    threshold_pct: threshold,
    min_visitors_last_week: minVisitors,
    cooldown_hours: cooldownHours,
    slack_configured: slack,
  };
}

async function ensureAlertSchema(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS traffic_alert_state (
      id TEXT PRIMARY KEY DEFAULT 'default',
      last_alert_at TIMESTAMPTZ,
      last_growth_pct INT,
      last_visitors_this_week INT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

async function getLastAlert(sql) {
  await ensureAlertSchema(sql);
  var rows = await sql`
    SELECT last_alert_at, last_growth_pct, last_visitors_this_week
    FROM traffic_alert_state WHERE id = 'default'
  `;
  return rows[0] || null;
}

async function saveLastAlert(sql, growthPct, visitorsThisWeek) {
  await ensureAlertSchema(sql);
  await sql`
    INSERT INTO traffic_alert_state (id, last_alert_at, last_growth_pct, last_visitors_this_week, updated_at)
    VALUES ('default', NOW(), ${growthPct}, ${visitorsThisWeek}, NOW())
    ON CONFLICT (id) DO UPDATE SET
      last_alert_at = NOW(),
      last_growth_pct = EXCLUDED.last_growth_pct,
      last_visitors_this_week = EXCLUDED.last_visitors_this_week,
      updated_at = NOW()
  `;
}

function isCooldownActive(lastAlert, cooldownHours) {
  if (!lastAlert || !lastAlert.last_alert_at) return false;
  var ms = cooldownHours * 60 * 60 * 1000;
  return Date.now() - new Date(lastAlert.last_alert_at).getTime() < ms;
}

function buildSlackMessage(stats, cfg) {
  var v = stats.comparison.visitors;
  var pv = stats.comparison.page_views;
  var appUrl = (
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://www.leadsopportunities.fr"
  ).replace(/\/$/, "");
  return [
    ":warning: *Alerte trafic — baisse significative*",
    "Visiteurs : *" + v.this_week + "* cette semaine (était *" + v.last_week + "*) → *" + v.growth_pct + " %*",
    "Pages vues : " + pv.this_week + " (était " + pv.last_week + ") → " + pv.growth_pct + " %",
    "Seuil configuré : " + cfg.threshold_pct + " % · période : 7j vs 7j précédents",
    "<" + appUrl + "/crm-trafic.html|Voir le détail CRM>",
    "<https://analytics.google.com/|GA4> · <https://clarity.microsoft.com/|Clarity>",
  ].join("\n");
}

async function runTrafficAlertCheck(options) {
  options = options || {};
  var cfg = getAlertConfig();

  if (!cfg.enabled && !options.force) {
    return {
      ok: true,
      skipped: true,
      reason: cfg.slack_configured ? "TRAFFIC_ALERT_ENABLED=false" : "SLACK_WEBHOOK_URL manquant",
      config: cfg,
    };
  }

  var stats = await buildTrafficStats({ trendDays: 14 });
  if (!stats.ok) {
    return { ok: false, error: stats.error || "Stats indisponibles", config: cfg };
  }

  var visitors = stats.comparison.visitors;
  var growth = visitors.growth_pct;
  var shouldAlert =
    growth <= cfg.threshold_pct && visitors.last_week >= cfg.min_visitors_last_week;

  var sql = getSql();
  var lastAlert = sql ? await getLastAlert(sql) : null;
  var onCooldown = !options.force && isCooldownActive(lastAlert, cfg.cooldown_hours);

  var result = {
    ok: true,
    config: cfg,
    visitors: visitors,
    page_views: stats.comparison.page_views,
    should_alert: shouldAlert,
    alerted: false,
    on_cooldown: onCooldown,
    last_alert_at: lastAlert && lastAlert.last_alert_at ? lastAlert.last_alert_at : null,
  };

  if (!shouldAlert && !options.force) {
    result.reason = "Trafic au-dessus du seuil ou volume insuffisant pour alerter";
    return result;
  }

  if (onCooldown) {
    result.reason = "Cooldown actif (" + cfg.cooldown_hours + " h)";
    return result;
  }

  if (!cfg.slack_configured) {
    result.reason = "Slack non configuré";
    return result;
  }

  var text = buildSlackMessage(stats, cfg);
  if (options.force && !shouldAlert) {
    text =
      ":information_source: *Test alerte trafic* (pas de baisse réelle)\n" +
      "Visiteurs : " +
      visitors.this_week +
      " vs " +
      visitors.last_week +
      " (" +
      growth +
      " %)\n" +
      text.split("\n").slice(1).join("\n");
  }

  var slack = await sendSlackText(text);
  result.alerted = !!slack.ok;
  result.slack_error = slack.ok ? null : slack.error;

  if (slack.ok && sql && shouldAlert) {
    await saveLastAlert(sql, growth, visitors.this_week);
    result.last_alert_at = new Date().toISOString();
  }

  return result;
}

module.exports = {
  getAlertConfig,
  runTrafficAlertCheck,
  buildSlackMessage,
};
