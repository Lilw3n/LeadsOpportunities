const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm } = require("../rbac");
const { getSql } = require("../db");

function mergeText(a, b) {
  return a || b || null;
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await requireCrm(req, res);
  if (!user) return;
  if (user.role !== "admin" && user.crmRole !== "admin" && user.crmRole !== "staff") {
    return res.status(403).json({ error: "Fusion non autorisee" });
  }

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  const parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};
  const keepId = body.keepId || body.keep_id;
  const mergeId = body.mergeId || body.merge_id;
  if (!keepId || !mergeId || keepId === mergeId) {
    return res.status(400).json({ error: "keepId et mergeId requis (differents)" });
  }

  try {
    const rows = await sql`
      SELECT * FROM crm_contacts WHERE id IN (${keepId}, ${mergeId})
    `;
    const keep = rows.find(function (r) {
      return r.id === keepId;
    });
    const lose = rows.find(function (r) {
      return r.id === mergeId;
    });
    if (!keep || !lose) return res.status(404).json({ error: "Contacts introuvables" });

    const mergedNotes = [keep.notes, lose.notes].filter(Boolean).join("\n\n---\nFusion " + new Date().toISOString() + "\n");
    await sql`
      UPDATE crm_contacts SET
        first_name = ${mergeText(keep.first_name, lose.first_name)},
        last_name = ${mergeText(keep.last_name, lose.last_name)},
        email = ${mergeText(keep.email, lose.email)},
        phone = ${mergeText(keep.phone, lose.phone)},
        company = ${mergeText(keep.company, lose.company)},
        notes = ${mergedNotes || null},
        updated_at = NOW(),
        last_activity_at = NOW()
      WHERE id = ${keepId}
    `;

    await sql`UPDATE site_leads SET contact_id = ${keepId} WHERE contact_id = ${mergeId}`;
    await sql`UPDATE crm_activities SET contact_id = ${keepId} WHERE contact_id = ${mergeId}`;
    await sql`UPDATE crm_events SET contact_id = ${keepId} WHERE contact_id = ${mergeId}`;
    await sql`UPDATE crm_claims SET contact_id = ${keepId} WHERE contact_id = ${mergeId}`;
    await sql`UPDATE crm_vehicles SET contact_id = ${keepId} WHERE contact_id = ${mergeId}`;
    await sql`UPDATE crm_drivers SET contact_id = ${keepId} WHERE contact_id = ${mergeId}`;
    await sql`UPDATE crm_contracts SET contact_id = ${keepId} WHERE contact_id = ${mergeId}`;
    await sql`UPDATE crm_insurance_requests SET contact_id = ${keepId} WHERE contact_id = ${mergeId}`;
    await sql`UPDATE crm_quotes SET contact_id = ${keepId} WHERE contact_id = ${mergeId}`;

    await sql`DELETE FROM crm_contacts WHERE id = ${mergeId}`;
    return res.status(200).json({ ok: true, keepId: keepId, mergedId: mergeId });
  } catch (e) {
    console.error("[crm/merge-contacts]", e);
    return res.status(500).json({ ok: false, error: "Erreur fusion contacts" });
  }
};
