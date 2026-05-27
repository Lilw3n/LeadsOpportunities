/**
 * Cron Vercel — sync IMAP contact@ toutes les 15 min
 * Definir CRON_SECRET sur Vercel (Vercel envoie Authorization: Bearer CRON_SECRET)
 */
const { runMailboxSync } = require("../_lib/mailbox-sync-service");

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
    const status = sync.ok ? 200 : sync.skipped ? 200 : 502;
    return res.status(status).json({ ok: sync.ok || !!sync.skipped, sync });
  } catch (e) {
    console.error("[cron/mailbox-sync]", e);
    return res.status(500).json({ ok: false, error: e.message || "Erreur cron sync" });
  }
};
