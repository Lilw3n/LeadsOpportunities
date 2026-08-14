const { getAuthUser } = require("../auth");
const { applyApiGuards, parseJsonBody } = require("../security");

async function deleteOne(sql, leadId) {
  await sql`UPDATE site_leads SET parent_lead_id = NULL WHERE parent_lead_id = ${leadId}`;
  try {
    await sql`DELETE FROM lead_events WHERE lead_id = ${leadId}`;
  } catch (eventsErr) {
    /* table optionnelle */
  }
  await sql`DELETE FROM site_leads WHERE id = ${leadId}`;
}

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

  var body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "JSON invalide" });
    }
  }
  if (!body || typeof body !== "object") {
    const parsed = parseJsonBody(req);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    body = parsed.body || {};
  }

  var ids = [];
  if (body.leadId) ids.push(String(body.leadId).trim().slice(0, 120));
  if (Array.isArray(body.leadIds)) {
    body.leadIds.forEach(function (id) {
      var s = String(id || "")
        .trim()
        .slice(0, 120);
      if (s) ids.push(s);
    });
  }
  ids = ids
    .filter(function (id, i, arr) {
      return id && arr.indexOf(id) === i;
    })
    .slice(0, 80);

  if (!ids.length) {
    return res.status(400).json({ error: "leadId ou leadIds requis" });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return res.status(500).json({ error: "Base de données non configurée" });

  try {
    const { neon } = require("@neondatabase/serverless");
    const sql = neon(dbUrl);
    var deleted = [];
    var missing = [];
    for (var i = 0; i < ids.length; i++) {
      const existing = await sql`SELECT id FROM site_leads WHERE id = ${ids[i]} LIMIT 1`;
      if (!existing.length) {
        missing.push(ids[i]);
        continue;
      }
      await deleteOne(sql, ids[i]);
      deleted.push(ids[i]);
    }

    return res.status(200).json({
      ok: true,
      message: deleted.length > 1 ? deleted.length + " leads supprimés" : "Lead supprimé",
      leadId: deleted[0] || null,
      deleted: deleted,
      missing: missing,
    });
  } catch (e) {
    console.error("[dashboard/lead-delete]", e);
    return res.status(500).json({ error: "Erreur serveur", detail: e.message });
  }
};
