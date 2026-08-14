/**
 * GET/POST /api/mailbox/cron-sync — cron Vercel unique (CRON_SECRET)
 * Enchaîne : sync mailbox → ping SEO → alerte trafic Slack
 * (évite un 2e cron /api/cron/* qui faisait échouer "Deploying outputs")
 */
const { runMailboxSync } = require("../mailbox-sync-service");
const { runSeoPing } = require("../seo-ping");
const { runTrafficAlertCheck } = require("../traffic-alert");

module.exports = async (req, res) => {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secret = process.env.CRON_SECRET;
  if (process.env.VERCEL === "1" && !secret) {
    return res.status(503).json({ ok: false, error: "CRON_SECRET requis en production" });
  }
  if (secret) {
    const auth = req.headers.authorization || "";
    const token = auth.replace(/^Bearer\s+/i, "").trim();
    if (token !== secret) {
      return res.status(401).json({ ok: false, error: "Non autorise" });
    }
  }

  try {
    const sync = await runMailboxSync();
    let seo = null;
    try {
      seo = await runSeoPing();
    } catch (seoErr) {
      console.error("[mailbox/cron-sync] seo ping", seoErr);
      seo = { ok: false, error: seoErr.message || "Erreur ping SEO" };
    }
    let trafficAlert = null;
    try {
      trafficAlert = await runTrafficAlertCheck({});
    } catch (alertErr) {
      console.error("[mailbox/cron-sync] traffic alert", alertErr);
      trafficAlert = { ok: false, error: alertErr.message || "Erreur alerte trafic" };
    }
    const status = sync.ok ? 200 : sync.skipped ? 200 : 502;
    return res.status(status).json({
      ok: sync.ok || !!sync.skipped,
      sync,
      seo,
      trafficAlert,
    });
  } catch (e) {
    console.error("[mailbox/cron-sync]", e);
    return res.status(500).json({ ok: false, error: e.message || "Erreur cron sync" });
  }
};
