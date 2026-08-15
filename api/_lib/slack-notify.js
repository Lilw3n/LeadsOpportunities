/**
 * Slack : Incoming Webhook OU token API (xoxb / xoxp / xoxe.xoxp).
 * Secrets uniquement via variables d’environnement — jamais dans le git.
 */
var INVALID_WEBHOOK_MSG =
  "SLACK_WEBHOOK_URL n'est pas une URL Slack. Collez l'URL complète https://hooks.slack.com/services/… (pas le signing secret) ou utilisez SLACK_BOT_TOKEN (xoxb-…).";

function getRawWebhookUrl() {
  return String(process.env.SLACK_WEBHOOK_URL || "")
    .trim()
    .replace(/^["']|["']$/g, "");
}

function normalizeWebhookUrl(raw) {
  var t = String(raw || "").trim().replace(/^["']|["']$/g, "");
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) {
    try {
      var parsed = new URL(t);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "";
      return t;
    } catch (e) {
      return "";
    }
  }
  if (/^hooks\.slack\.com\//i.test(t)) return "https://" + t;
  if (/^T[A-Z0-9]+\/B[A-Z0-9]+\/[A-Za-z0-9_-]+$/i.test(t)) {
    return "https://hooks.slack.com/services/" + t;
  }
  return "";
}

function getWebhookUrl() {
  return normalizeWebhookUrl(getRawWebhookUrl());
}

function webhookInvalid() {
  return !!(getRawWebhookUrl() && !getWebhookUrl());
}

function getRawToken() {
  return (
    process.env.SLACK_BOT_TOKEN ||
    process.env.SLACK_TOKEN ||
    process.env.SLACK_USER_TOKEN ||
    ""
  ).trim();
}

function decodeExportedToken(raw) {
  var t = String(raw || "").trim();
  if (!t) return "";
  if (t.indexOf("xoxe.xoxp-") !== 0 && t.indexOf("xoxe.xoxb-") !== 0) return t;
  var marker = t.indexOf("xoxe.xoxp-1-") === 0 ? "xoxe.xoxp-1-" : t.indexOf("xoxe.xoxb-1-") === 0 ? "xoxe.xoxb-1-" : "";
  if (!marker) return t;
  var b64 = t.slice(marker.length);
  try {
    var decoded = Buffer.from(b64, "base64").toString("utf8").trim();
    if (!decoded) return t;
    if (decoded.indexOf("xoxp-") === 0 || decoded.indexOf("xoxb-") === 0) return decoded;
    var prefix = t.indexOf("xoxe.xoxb-") === 0 ? "xoxb-" : "xoxp-";
    var rest = decoded.replace(/^(\d+-){1,2}/, "");
    return prefix + rest;
  } catch (e) {
    return t;
  }
}

function getToken() {
  var raw = getRawToken();
  if (!raw) return "";
  if (raw.indexOf("xoxe.") === 0 || raw.indexOf("xoxp-") === 0 || raw.indexOf("xoxb-") === 0) {
    return raw;
  }
  return decodeExportedToken(raw);
}

function slackConfigured() {
  return !!(getWebhookUrl() || getRawToken());
}

function slackStatus() {
  return {
    configured: slackConfigured(),
    webhook_ok: !!getWebhookUrl(),
    token_ok: !!getRawToken(),
    webhook_invalid: webhookInvalid(),
    channel: defaultChannel(),
  };
}

function defaultChannel() {
  var ch = (process.env.SLACK_CHANNEL || "leads").trim();
  if (!ch) return "leads";
  if (/^[CGD][A-Z0-9]+$/i.test(ch)) return ch;
  return ch.replace(/^#/, "");
}

function channelHelpError(channel, lastErr) {
  if (lastErr === "channel_not_found" || lastErr === "not_in_channel") {
    return (
      "Canal Slack introuvable (#" +
      channel +
      "). Dans Slack : ouvrez le canal → Intégrations → Ajouter des applications → « Leads Opportunities CRM ». Ou Vercel → SLACK_CHANNEL = nom d’un canal où le bot est déjà (ex. general)."
    );
  }
  return "Slack API: " + lastErr;
}

function sanitizeSlackError(msg) {
  var s = String(msg || "");
  if (/Failed to parse URL/i.test(s) || /Invalid URL/i.test(s) || /ERR_INVALID_URL/i.test(s)) {
    return INVALID_WEBHOOK_MSG;
  }
  return s;
}

async function slackApi(method, token, body) {
  var r = await fetch("https://slack.com/api/" + method, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(body || {}),
  });
  var data = await r.json().catch(function () {
    return { ok: false, error: "json" };
  });
  return data;
}

async function sendViaWebhook(text) {
  var url = getWebhookUrl();
  if (!url) return { ok: false, error: INVALID_WEBHOOK_MSG };
  var r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: String(text || "") }),
  });
  if (!r.ok) {
    var body = await r.text().catch(function () {
      return "";
    });
    return { ok: false, error: "Slack HTTP " + r.status + (body ? ": " + body.slice(0, 120) : "") };
  }
  return { ok: true, via: "webhook" };
}

function uniqueNames(list) {
  var seen = {};
  var out = [];
  list.forEach(function (n) {
    if (!n || seen[n]) return;
    seen[n] = true;
    out.push(n);
  });
  return out;
}

async function listChannels(token, method, types) {
  var data = await slackApi(method, token, {
    types: types,
    exclude_archived: true,
    limit: 200,
  });
  if (!data.ok) return [];
  return data.channels || [];
}

async function tryPost(token, channel, text) {
  return slackApi("chat.postMessage", token, { channel: channel, text: String(text || "") });
}

async function sendViaToken(text) {
  var raw = getRawToken();
  if (!raw) return { ok: false, error: "SLACK_BOT_TOKEN / SLACK_TOKEN non défini" };
  var tokens = [raw];
  var decoded = decodeExportedToken(raw);
  if (decoded && decoded !== raw) tokens.push(decoded);
  var preferred = defaultChannel();
  var names = uniqueNames([
    preferred,
    "leads",
    "alertes",
    "alertes-leads",
    "alertes-courtier",
    "notifications",
    "general",
    "slack-notifications",
    "random",
  ]);
  var lastErr = "échec";
  var i;
  for (i = 0; i < tokens.length; i++) {
    var token = tokens[i];
    var n;
    for (n = 0; n < names.length; n++) {
      var data = await tryPost(token, names[n], text);
      if (data.ok) return { ok: true, via: "token", channel: names[n] };
      lastErr = data.error || lastErr;
    }

    var member = await listChannels(token, "users.conversations", "public_channel,private_channel");
    var m;
    for (m = 0; m < member.length; m++) {
      if (member[m].is_archived) continue;
      data = await tryPost(token, member[m].id, text);
      if (data.ok) return { ok: true, via: "token", channel: member[m].name || member[m].id };
      lastErr = data.error || lastErr;
    }

    var pub = await listChannels(token, "conversations.list", "public_channel");
    var p;
    for (p = 0; p < pub.length; p++) {
      var ch = pub[p];
      if (ch.is_archived) continue;
      if (names.indexOf(ch.name) >= 0 || ch.name === preferred) {
        await slackApi("conversations.join", token, { channel: ch.id });
        data = await tryPost(token, ch.id, text);
        if (data.ok) return { ok: true, via: "token", channel: ch.name };
        lastErr = data.error || lastErr;
      }
    }
    for (p = 0; p < pub.length && p < 8; p++) {
      if (pub[p].is_archived) continue;
      await slackApi("conversations.join", token, { channel: pub[p].id });
      data = await tryPost(token, pub[p].id, text);
      if (data.ok) return { ok: true, via: "token", channel: pub[p].name };
      lastErr = data.error || lastErr;
    }
  }
  if (lastErr === "missing_scope") {
    return {
      ok: false,
      error:
        "Ce token Slack ne peut pas poster (jeton de configuration d’app). Installez l’app « Leads Opportunities CRM » puis copiez le token bot xoxb- ou l’Incoming Webhook dans Vercel.",
    };
  }
  return { ok: false, error: channelHelpError(preferred, lastErr) };
}

async function sendSlackText(text) {
  var webhookErr = null;
  if (getWebhookUrl()) {
    try {
      var viaWh = await sendViaWebhook(text);
      if (viaWh.ok) return viaWh;
      webhookErr = viaWh.error;
    } catch (e) {
      webhookErr = sanitizeSlackError(e.message);
    }
  } else if (webhookInvalid()) {
    webhookErr = INVALID_WEBHOOK_MSG;
  }
  if (getRawToken()) {
    try {
      return await sendViaToken(text);
    } catch (e) {
      return { ok: false, error: sanitizeSlackError(e.message) };
    }
  }
  if (webhookErr) return { ok: false, error: sanitizeSlackError(webhookErr) };
  return {
    ok: false,
    error: "Slack non configuré (SLACK_BOT_TOKEN ou SLACK_WEBHOOK_URL)",
  };
}

module.exports = {
  sendSlackText,
  slackConfigured,
  slackStatus,
  getToken,
  getWebhookUrl,
  getRawWebhookUrl,
  normalizeWebhookUrl,
  webhookInvalid,
  defaultChannel,
  channelHelpError,
  INVALID_WEBHOOK_MSG,
};
