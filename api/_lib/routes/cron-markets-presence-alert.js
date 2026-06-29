/**
 * GET/POST /api/cron/markets-presence-alert — Slack si marché non assigné (48h)
 */
const { runMarketsPresenceAlert } = require("../markets-presence-alert");

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
    var result = await runMarketsPresenceAlert({});
    return res.status(200).json(result);
  } catch (e) {
    console.error("[cron/markets-presence-alert]", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
};
