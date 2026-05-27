const { applyApiGuards } = require("../security");
const { requireDashboardAdmin } = require("../dashboard-admin");
const { listMessages } = require("../mail-store");
const { imapConfig } = require("../mail-imap");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!(await requireDashboardAdmin(req, res))) return;

  try {
    const limit = req.query.limit;
    const offset = req.query.offset;
    const data = await listMessages(limit, offset);
    return res.status(200).json({
      ok: true,
      messages: data.messages,
      total: data.total,
      imapConfigured: !!imapConfig(),
      mailboxAddress: process.env.MAILBOX_ADDRESS || "contact@leadsopportunities.fr",
    });
  } catch (e) {
    console.error("[mailbox-list]", e);
    return res.status(500).json({ ok: false, error: e.message || "Erreur liste mail" });
  }
};
