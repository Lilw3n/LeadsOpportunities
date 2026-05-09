/**
 * GET /api/leads-recent — Liste des derniers leads (Neon). Protege par LEADS_ADMIN_TOKEN.
 */
module.exports = async (req, res) => {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  var secret = process.env.LEADS_ADMIN_TOKEN;
  if (!secret) {
    return res.status(503).json({ ok: false, error: "LEADS_ADMIN_TOKEN non configure" });
  }

  var auth = req.headers.authorization || "";
  var token = auth.indexOf("Bearer ") === 0 ? auth.slice(7) : "";
  if (!token && req.query.token) token = String(req.query.token);
  if (token !== secret) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  var dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return res.json({
      ok: true,
      leads: [],
      message:
        "DATABASE_URL absent : les leads sont notifies par email / webhook et visibles dans GA4 — ajoute Neon pour l historique ici.",
    });
  }

  try {
    const { neon } = require("@neondatabase/serverless");
    const sql = neon(dbUrl);
    var rows = await sql`
      SELECT id, created_at, source, vertical, lead_score, email, phone,
             utm_source, utm_medium, utm_campaign, gclid, visitor_id, payload
      FROM site_leads
      ORDER BY created_at DESC
      LIMIT 100
    `;
    var normalized = rows.map(function (r) {
      var p = r.payload;
      if (typeof p === "string") {
        try {
          p = JSON.parse(p);
        } catch (e) {
          p = {};
        }
      }
      return Object.assign({}, r, { payload: p });
    });
    return res.json({ ok: true, leads: normalized });
  } catch (e) {
    console.error("[leads-recent]", e);
    return res.status(500).json({ ok: false, error: "Database error" });
  }
};
