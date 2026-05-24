const { getAuthUser } = require("../auth");
const { applyApiGuards } = require("../security");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await getAuthUser(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Acces refuse" });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return res.status(500).json({ error: "Base de donnees non configuree" });

  const url = new URL(req.url, "http://localhost");
  const since = url.searchParams.get("since");
  const sinceDate = since ? new Date(since) : new Date(Date.now() - 60000);
  if (isNaN(sinceDate.getTime())) {
    return res.status(400).json({ error: "since invalide" });
  }

  try {
    const { neon } = require("@neondatabase/serverless");
    const sql = neon(dbUrl);
    const sinceIso = sinceDate.toISOString();

    const [newRows] = await sql`
      SELECT COUNT(*)::int AS count,
             MAX(created_at) AS latest_at
      FROM site_leads
      WHERE created_at > ${sinceIso}::timestamptz
    `;

    let unopened = 0;
    let relevant = 0;
    try {
      const [u] = await sql`
        SELECT COUNT(*)::int AS count FROM site_leads WHERE opened_at IS NULL
      `;
      unopened = u.count;
      const [r] = await sql`
        SELECT COUNT(*)::int AS count FROM site_leads WHERE relevance = 'high'
      `;
      relevant = r.count;
    } catch (colErr) {
      const [u2] = await sql`
        SELECT COUNT(*)::int AS count FROM site_leads
        WHERE COALESCE(payload->>'openedAt', '') = ''
      `;
      unopened = u2.count;
      const [r2] = await sql`
        SELECT COUNT(*)::int AS count FROM site_leads
        WHERE payload->>'relevance' = 'high'
      `;
      relevant = r2.count;
    }

    const [latest] = await sql`
      SELECT id, created_at FROM site_leads ORDER BY created_at DESC LIMIT 1
    `;

    return res.status(200).json({
      ok: true,
      newSince: newRows.count || 0,
      latestAt: newRows.latest_at || null,
      latestId: latest ? latest.id : null,
      unopenedCount: unopened,
      relevantCount: relevant,
      serverTime: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[dashboard/leads-notify]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
