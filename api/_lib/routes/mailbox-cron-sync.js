/**
 * GET/POST /api/mailbox/cron-sync — declenchement cron Vercel (CRON_SECRET)
 */
const { runMailboxSync } = require("../mailbox-sync-service");
const { runSeoPing } = require("../seo-ping");

module.exports = async (req, res) => {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secret = process.env.CRON_SECRET;
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
    const status = sync.ok ? 200 : sync.skipped ? 200 : 502;
    return res.status(status).json({ ok: sync.ok || !!sync.skipped, sync, seo });
  } catch (e) {
    console.error("[mailbox/cron-sync]", e);
    return res.status(500).json({ ok: false, error: e.message || "Erreur cron sync" });
  }
};
