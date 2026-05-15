const { getAuthUser } = require("../auth");
const { applyApiGuards, parseJsonBody } = require("../security");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await getAuthUser(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Accès refusé" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: "JSON invalide" }); }
  }
  if (!body || !body.leadId) {
    return res.status(400).json({ error: "leadId requis" });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return res.status(500).json({ error: "Base de données non configurée" });

  try {
    const { neon } = require("@neondatabase/serverless");
    const sql = neon(dbUrl);

    const existing = await sql`SELECT id FROM site_leads WHERE id = ${body.leadId}`;
    if (existing.length === 0) {
      return res.status(404).json({ error: "Lead introuvable" });
    }

    const updates = {};
    if (body.status) {
      const validStatuses = ["new", "contacted", "qualified", "converted", "lost"];
      if (!validStatuses.includes(body.status)) {
        return res.status(400).json({ error: "Statut invalide" });
      }
      updates.status = body.status;
    }
    if (body.notes !== undefined) {
      updates.notes = String(body.notes).slice(0, 5000);
    }
    if (body.assignedTo !== undefined) {
      updates.assigned_to = body.assignedTo || null;
    }

    if (body.status && body.notes !== undefined) {
      await sql`
        UPDATE site_leads SET status = ${updates.status}, notes = ${updates.notes}, updated_at = now()
        WHERE id = ${body.leadId}
      `;
    } else if (body.status) {
      await sql`UPDATE site_leads SET status = ${updates.status}, updated_at = now() WHERE id = ${body.leadId}`;
    } else if (body.notes !== undefined) {
      await sql`UPDATE site_leads SET notes = ${updates.notes}, updated_at = now() WHERE id = ${body.leadId}`;
    }

    if (body.assignedTo !== undefined) {
      await sql`UPDATE site_leads SET assigned_to = ${updates.assigned_to} WHERE id = ${body.leadId}`;
    }

    return res.status(200).json({ ok: true, message: "Lead mis à jour" });
  } catch (e) {
    console.error("[dashboard/lead-update]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
