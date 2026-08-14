const { applyApiGuards } = require("../security");
const { requireCrm } = require("../rbac");
const {
  isGoogleConfigured,
  signOAuthState,
  buildGoogleCalendarAuthUrl,
} = require("../google-oauth");
const { getCalendarConnectionStatus, pushUnsyncedCrmEvents } = require("../google-calendar");
const { ensureCalendarSchema } = require("../ensure-schema");
const { getSql } = require("../db");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await requireCrm(req, res);
  if (!user) return;

  const sql = getSql();
  if (sql) await ensureCalendarSchema(sql);

  const url = new URL(req.url, "http://localhost");
  const action = url.searchParams.get("action") || "status";
  const configured = isGoogleConfigured();

  if (req.method === "GET" && action === "status") {
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

  if (req.method === "GET" && action === "sync") {
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

  if (req.method === "GET" && action === "pull") {
    const pull = require("./crm-calendar-pull");
    return pull(req, res);
  }

  if (req.method === "GET" && action === "connect") {
    if (!configured) {
      return res.status(500).json({
        error: "Google non configuré. Ajoutez GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET sur Vercel.",
      });
    }
    const returnTo = url.searchParams.get("returnTo") || "/crm-calendar.html";
    const state = signOAuthState({
      purpose: "google_calendar",
      userId: user.id,
      returnTo: returnTo,
    });
    const authUrl = buildGoogleCalendarAuthUrl(state, user.email || undefined);
    return res.status(200).json({ ok: true, url: authUrl });
  }

  if (req.method === "POST") {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    if (body.action === "connect") {
      if (!configured) {
        return res.status(500).json({ error: "Google non configuré." });
      }
      const returnTo = body.returnTo || "/crm-calendar.html";
      const state = signOAuthState({
        purpose: "google_calendar",
        userId: user.id,
        returnTo: returnTo,
      });
      const authUrl = buildGoogleCalendarAuthUrl(state, user.email);
      return res.status(200).json({ ok: true, url: authUrl });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
