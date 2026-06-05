const { getAuthUser } = require("../auth");
const { applyApiGuards } = require("../security");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST" && req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await getAuthUser(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Accès refusé" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "JSON invalide" });
    }
  }

  const leadId = body && body.leadId ? String(body.leadId).trim().slice(0, 120) : "";
  if (!leadId) {
    return res.status(400).json({ error: "leadId requis" });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return res.status(500).json({ error: "Base de données non configurée" });

  try {
    const { neon } = require("@neondatabase/serverless");
    const sql = neon(dbUrl);

    const existing = await sql`SELECT id FROM site_leads WHERE id = ${leadId} LIMIT 1`;
    if (!existing.length) {
      return res.status(404).json({ error: "Lead introuvable" });
    }

    await sql`UPDATE site_leads SET parent_lead_id = NULL WHERE parent_lead_id = ${leadId}`;

    try {
      await sql`DELETE FROM lead_events WHERE lead_id = ${leadId}`;
    } catch (eventsErr) {
      /* table optionnelle */
    }

    await sql`DELETE FROM site_leads WHERE id = ${leadId}`;

    return res.status(200).json({ ok: true, message: "Lead supprimé", leadId });
  } catch (e) {
    console.error("[dashboard/lead-delete]", e);
    return res.status(500).json({ error: "Erreur serveur", detail: e.message });
  }
};
