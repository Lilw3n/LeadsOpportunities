const { applyApiGuards, rateLimit, getClientIp } = require("../security");
const { requireDashboardAdmin } = require("../dashboard-admin");
const { testImapSources } = require("../mail-imap");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST" && req.method !== "GET") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!(await requireDashboardAdmin(req, res))) return;

  const rl = rateLimit("mailbox-imap-test:" + getClientIp(req), 20, 60 * 60 * 1000);
  if (!rl.allowed) {
    return res.status(429).json({ ok: false, error: "Trop de tests. Reessayez plus tard." });
  }

  try {
    const result = await testImapSources();
    return res.status(200).json({ ok: true, test: result });
  } catch (e) {
    console.error("[mailbox-imap-test]", e);
    return res.status(500).json({ ok: false, error: e.message || "Erreur test IMAP" });
  }
};
