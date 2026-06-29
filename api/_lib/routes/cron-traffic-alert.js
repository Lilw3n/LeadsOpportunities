/**
 * GET/POST /api/cron/traffic-alert — vérifie baisse trafic et alerte Slack (CRON_SECRET)
 */
const { runTrafficAlertCheck } = require("../traffic-alert");

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
    var result = await runTrafficAlertCheck({});
    return res.status(200).json(result);
  } catch (e) {
    console.error("[cron/traffic-alert]", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
};
