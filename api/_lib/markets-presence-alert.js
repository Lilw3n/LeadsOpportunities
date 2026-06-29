const { listMarketsPresence } = require("./markets-presence-store");
const { sendSlackText } = require("./slack-notify");

function getAlertConfig() {
  var horizon = Number(process.env.MARKETS_ALERT_DAYS_AHEAD);
  if (!Number.isFinite(horizon)) horizon = 2;
  var slack = !!(process.env.SLACK_WEBHOOK_URL || "").trim();
  return {
    enabled: slack,
    horizon_days: horizon,
    slack_configured: slack,
    cron_schedule: "0 7 * * *",
  };
}

function formatFrDate(iso) {
  try {
    return new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
  } catch (e) {
    return iso;
  }
}

function daysUntil(iso) {
  var d = new Date(iso + "T12:00:00");
  var t = new Date();
  t.setHours(12, 0, 0, 0);
  return Math.round((d - t) / 86400000);
}

function scheduleLine(item) {
  var parts = [];
  if (item.market_start_time && item.market_end_time) {
    parts.push("marché " + item.market_start_time + "–" + item.market_end_time);
  }
  var work =
    (item.work_prep_start ? "prépa " + item.work_prep_start + " → " : "") +
    "travail " +
    (item.work_start || item.presence_start || "?") +
    "–" +
    (item.work_end || item.presence_end || "?");
  parts.push(work);
  return parts.join(" · ");
}

async function runMarketsPresenceAlert(options) {
  options = options || {};
  var slack = !!(process.env.SLACK_WEBHOOK_URL || "").trim();
  var horizon = Number(process.env.MARKETS_ALERT_DAYS_AHEAD) || 2;

  var data = await listMarketsPresence({ days: 14, seed: false });
  if (!data.ok) return { ok: false, error: data.error };

  var urgent = (data.upcoming || []).filter(function (item) {
    var du = daysUntil(item.date);
    return du >= 0 && du <= horizon && !item.has_assignment && item.status !== "cancelled";
  });

  var result = {
    ok: true,
    slack_configured: slack,
    horizon_days: horizon,
    unassigned_count: urgent.length,
    items: urgent,
    alerted: false,
  };

  if (!urgent.length) {
    result.reason = "Toutes les présences proches sont assignées";
    return result;
  }

  if (!slack) {
    result.reason = "SLACK_WEBHOOK_URL manquant";
    return result;
  }

  var appUrl = (
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://www.leadsopportunities.fr"
  ).replace(/\/$/, "");

  var lines = [
    ":calendar: *Présence terrain — créneaux sans équipier*",
    urgent.length + " créneau(x) dans les " + horizon + " prochains jours :",
  ];

  urgent.slice(0, 8).forEach(function (item) {
    var when = daysUntil(item.date) === 0 ? "AUJOURD'HUI" : daysUntil(item.date) === 1 ? "DEMAIN" : formatFrDate(item.date);
    lines.push(
      "• *" +
        when +
        "* — " +
        item.market_name +
        " (" +
        scheduleLine(item) +
        ")"
    );
  });

  if (urgent.length > 8) lines.push("… et " + (urgent.length - 8) + " autre(s)");
  lines.push("<" + appUrl + "/crm-marches.html|Assigner sur Marchés & présence>");

  var slackRes = await sendSlackText(lines.join("\n"));
  result.alerted = !!slackRes.ok;
  result.slack_error = slackRes.ok ? null : slackRes.error;
  return result;
}

module.exports = { getAlertConfig, runMarketsPresenceAlert };
