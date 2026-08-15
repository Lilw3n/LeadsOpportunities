/**
 * POST /api/crm/test-slack — envoie un message test au webhook Slack (CRM auth)
 */
const { applyApiGuards } = require("../security");
const { requireCrm } = require("../rbac");
const { sendSlackTestMessage } = require("../lead-post-ingest");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const auth = await requireCrm(req, res);
  if (!auth) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    var result = await sendSlackTestMessage();
    if (!result.ok) {
      return res.status(result.error && result.error.indexOf("non défini") >= 0 ? 503 : 502).json({
        ok: false,
        error: result.error,
        hint:
          result.error && result.error.indexOf("Canal Slack") >= 0
            ? "Slack → canal → Intégrations → Ajouter « Leads Opportunities CRM », ou Vercel SLACK_CHANNEL=general"
            : "Vercel → SLACK_WEBHOOK_URL = https://hooks.slack.com/services/… ou SLACK_BOT_TOKEN = xoxb-… → Redeploy",
      });
    }
    return res.status(200).json({
      ok: true,
      message: "Message test envoyé sur Slack",
      channel: result.channel || null,
      via: result.via || null,
    });
  } catch (e) {
    console.error("[crm/test-slack]", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
};
