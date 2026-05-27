const { applyApiGuards, rateLimit, getClientIp } = require("../security");
const { requireDashboardAdmin } = require("../dashboard-admin");
const { syncImapInbox } = require("../mail-imap");
const { listMessages } = require("../mail-store");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!(await requireDashboardAdmin(req, res))) return;

  const rl = rateLimit("mailbox-sync:" + getClientIp(req), 12, 60 * 60 * 1000);
  if (!rl.allowed) {
    return res.status(429).json({ ok: false, error: "Synchronisation limitee. Reessayez plus tard." });
  }

  try {
    const sync = await syncImapInbox();
    const data = await listMessages(50, 0);
    return res.status(200).json({
      ok: true,
      sync,
      messages: data.messages,
      total: data.total,
    });
  } catch (e) {
    console.error("[mailbox-sync]", e);
    return res.status(500).json({ ok: false, error: e.message || "Erreur sync mail" });
  }
};
