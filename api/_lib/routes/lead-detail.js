const { getAuthUser } = require("../auth");
const { applyApiGuards } = require("../security");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await getAuthUser(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Accès refusé" });
  }

  const url = new URL(req.url, "http://localhost");
  const leadId = url.searchParams.get("id");
  if (!leadId) return res.status(400).json({ error: "id requis" });

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return res.status(500).json({ error: "Base de données non configurée" });

  try {
    const { neon } = require("@neondatabase/serverless");
    const sql = neon(dbUrl);

    let rows;
    try {
      rows = await sql`
        SELECT id, source, vertical, lead_score, email, phone,
               utm_source, utm_medium, utm_campaign, gclid, visitor_id,
               COALESCE(status, 'new') AS status, notes, assigned_to,
               payload, created_at, updated_at, opened_at, platform,
               competitor_monthly, our_offer_monthly, relevance
        FROM site_leads WHERE id = ${leadId}
      `;
    } catch (colErr) {
      rows = await sql`
        SELECT id, source, vertical, lead_score, email, phone,
               utm_source, utm_medium, utm_campaign, gclid, visitor_id,
               COALESCE(status, 'new') AS status, notes, assigned_to,
               payload, created_at, updated_at, platform
        FROM site_leads WHERE id = ${leadId}
      `;
    }
    if (rows.length === 0) {
      return res.status(404).json({ error: "Lead introuvable" });
    }

    const lead = rows[0];
    if (lead.payload && typeof lead.payload === "string") {
      try { lead.payload = JSON.parse(lead.payload); } catch {}
    }

    var openedIso = new Date().toISOString();
    var patch = Object.assign({}, lead.payload || {}, { openedAt: openedIso });
    try {
      await sql`
        UPDATE site_leads SET opened_at = COALESCE(opened_at, NOW()), payload = ${JSON.stringify(patch)}::jsonb, updated_at = NOW()
        WHERE id = ${leadId}
      `;
      lead.opened_at = lead.opened_at || openedIso;
      lead.payload = patch;
    } catch (openErr) {
      await sql`
        UPDATE site_leads SET payload = ${JSON.stringify(patch)}::jsonb, updated_at = NOW()
        WHERE id = ${leadId}
      `;
      lead.opened_at = openedIso;
      lead.payload = patch;
    }

    return res.status(200).json({ ok: true, lead });
  } catch (e) {
    console.error("[dashboard/lead-detail]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
