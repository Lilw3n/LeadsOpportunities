const { applyApiGuards, rateLimit, getClientIp, parseJsonBody } = require("../security");
const { requireDashboardAdmin } = require("../dashboard-admin");
const { forceSyncNow, forceBackfillNow } = require("../mailbox-sync-service");
const { listMessages } = require("../mail-store");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!(await requireDashboardAdmin(req, res))) return;

  var mode = String(req.query.mode || "").toLowerCase();
  var source = "o2switch";
  if (!mode) {
    var rawBody = req.body;
    if (typeof rawBody === "string" && rawBody.trim()) {
      const parsed = parseJsonBody(req);
      if (parsed.error) {
        return res.status(400).json({ ok: false, error: parsed.error });
      }
      rawBody = parsed.body;
    }
    if (rawBody && typeof rawBody === "object") {
      if (rawBody.backfill || rawBody.mode === "backfill") mode = "backfill";
      if (rawBody.source) source = String(rawBody.source).toLowerCase();
    }
  }
  const isBackfill = mode === "backfill";

  const rlKey = isBackfill ? "mailbox-backfill:" : "mailbox-sync:";
  const rlMax = isBackfill ? 40 : 12;
  const rl = rateLimit(rlKey + getClientIp(req), rlMax, 60 * 60 * 1000);
  if (!rl.allowed) {
    return res.status(429).json({ ok: false, error: "Synchronisation limitee. Reessayez plus tard." });
  }

  try {
    const sync = isBackfill ? await forceBackfillNow(source) : await forceSyncNow();
    const data = await listMessages(100, 0);
    return res.status(200).json({
      ok: true,
      sync,
      messages: data.messages,
      total: data.total,
      stats: data.stats,
      imapConfigured: true,
      mailboxAddress: process.env.MAILBOX_ADDRESS || "contact@leadsopportunities.fr",
    });
  } catch (e) {
    console.error("[mailbox-sync]", e);
    return res.status(500).json({ ok: false, error: e.message || "Erreur sync mail" });
  }
};
