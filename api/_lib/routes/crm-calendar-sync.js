const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm } = require("../rbac");
const { resolveInnerOp } = require("../catch-all-action");
const {
  isGoogleConfigured,
  signOAuthState,
  buildGoogleCalendarAuthUrl,
} = require("../google-oauth");
const { getCalendarConnectionStatus, pushUnsyncedCrmEvents } = require("../google-calendar");
const { ensureCalendarSchema } = require("../ensure-schema");
const { getSql } = require("../db");

const OPS = { status: 1, sync: 1, pull: 1, connect: 1 };

function readBody(req) {
  if (req.method !== "POST" && req.method !== "PATCH") return {};
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  const parsed = parseJsonBody(req);
  return parsed.body && typeof parsed.body === "object" ? parsed.body : {};
}

async function handleStatus(res, user, configured) {
  try {
    const status = await getCalendarConnectionStatus(user.id);
    return res.status(200).json({
      ok: true,
      configured: configured,
      ...status,
      email: user.email,
    });
  } catch (e) {
    console.error("[crm/calendar-sync status]", e);
    return res.status(500).json({ error: "Erreur serveur", detail: e.message });
  }
}

async function handleConnect(req, res, user, configured, body) {
  if (!configured) {
    return res.status(500).json({
      error: "Google non configuré. Ajoutez GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET sur Vercel.",
    });
  }
  var returnTo = "/crm-calendar.html";
  try {
    var url = new URL(req.url, "http://localhost");
    returnTo = url.searchParams.get("returnTo") || body.returnTo || returnTo;
  } catch (e) {
    returnTo = body.returnTo || returnTo;
  }
  const state = signOAuthState({
    purpose: "google_calendar",
    userId: user.id,
    returnTo: returnTo,
  });
  const authUrl = buildGoogleCalendarAuthUrl(state, user.email || undefined);
  return res.status(200).json({ ok: true, url: authUrl });
}

async function handleSync(res, user) {
  try {
    const pushed = await pushUnsyncedCrmEvents(user.id);
    if (pushed.skipped) {
      return res.status(400).json({
        ok: false,
        error: pushed.error || "Agenda Google non connecté",
        pushed: 0,
        imported: 0,
      });
    }
    const pullMod = require("./crm-calendar-pull");
    const pulled = await pullMod.runCalendarPull(user);
    return res.status(pulled.status || (pulled.ok ? 200 : 500)).json({
      ok: !!(pushed.ok && pulled.ok),
      pushed: pushed.pushed || 0,
      pushErrors: pushed.errors || 0,
      pushScanned: pushed.scanned || 0,
      imported: pulled.imported || 0,
      scanned: pulled.scanned || 0,
      error: pulled.error || null,
    });
  } catch (e) {
    console.error("[crm/calendar-sync sync]", e);
    return res.status(500).json({ error: "Erreur sync agenda", detail: e.message });
  }
}

async function handlePull(res, user) {
  const pullMod = require("./crm-calendar-pull");
  try {
    const result = await pullMod.runCalendarPull(user);
    return res.status(result.status || (result.ok ? 200 : 500)).json(result);
  } catch (e) {
    console.error("[crm/calendar-sync pull]", e);
    return res.status(500).json({ error: "Erreur import agenda", detail: e.message });
  }
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Utilisez GET ou POST" });
  }

  const user = await requireCrm(req, res);
  if (!user) return;

  const sql = getSql();
  if (sql) await ensureCalendarSchema(sql);

  const body = readBody(req);
  const op = resolveInnerOp(req, OPS, "status", body);
  const configured = isGoogleConfigured();

  if (op === "status") return handleStatus(res, user, configured);
  if (op === "connect") return handleConnect(req, res, user, configured, body);
  if (op === "sync") return handleSync(res, user);
  if (op === "pull") return handlePull(res, user);

  return handleStatus(res, user, configured);
};
