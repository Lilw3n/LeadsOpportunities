const crypto = require("crypto");
const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm, canManageAllContacts } = require("../rbac");
const { getSql } = require("../db");
const { buildProfileMetadata } = require("../crm-profile-meta");
const { ensureClientDriveFolders } = require("../drive-folders");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;

  const parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const leadId = parsed.body?.leadId || parsed.body?.lead_id;
  const contactType = String(parsed.body?.contactType || "prospect").toLowerCase();

  if (!leadId) return res.status(400).json({ error: "leadId requis" });

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  try {
    const leads = await sql`
      SELECT id, email, phone, payload, contact_id, vertical
      FROM site_leads WHERE id = ${leadId} LIMIT 1
    `;
    if (!leads.length) return res.status(404).json({ error: "Lead introuvable" });
    const lead = leads[0];
    if (lead.contact_id) {
      return res.status(200).json({ ok: true, contactId: lead.contact_id, alreadyLinked: true });
    }

    let payload = {};
    try {
      payload = JSON.parse(lead.payload || "{}");
    } catch (e) {}

    const contactId = "ct_" + crypto.randomUUID();
    const firstName = payload.firstName || payload.first_name || payload.fullName || null;
    const lastName = payload.lastName || payload.last_name || null;

    const profileMeta = buildProfileMetadata(
      Object.assign({}, payload, { vertical: lead.vertical, need: payload.need || payload.serviceNeed })
    );
    await sql`
      INSERT INTO crm_contacts (
        id, contact_type, first_name, last_name, email, phone,
        status, source, assigned_to, notes, metadata, last_activity_at
      ) VALUES (
        ${contactId},
        ${contactType},
        ${firstName},
        ${lastName},
        ${lead.email},
        ${lead.phone},
        'active',
        ${"lead:" + (lead.vertical || "web")},
        ${canManageAllContacts(user) ? user.id : user.id},
        ${"Converti depuis lead " + lead.id},
        ${JSON.stringify(profileMeta)},
        NOW()
      )
    `;

    await sql`
      UPDATE site_leads SET contact_id = ${contactId}, updated_at = NOW()
      WHERE id = ${leadId}
    `;

    await sql`
      INSERT INTO crm_activities (id, contact_id, lead_id, user_id, activity_type, title, body)
      VALUES (
        ${"act_" + crypto.randomUUID()},
        ${contactId},
        ${leadId},
        ${user.id},
        'conversion',
        'Lead converti en contact',
        ${"Vertical: " + (lead.vertical || "")}
      )
    `;

    var driveSetup = null;
    try {
      driveSetup = await ensureClientDriveFolders(contactId);
    } catch (driveErr) {
      console.warn("[crm/convert-lead] drive", driveErr.message);
    }

    return res.status(201).json({ ok: true, contactId, drive: driveSetup });
  } catch (e) {
    console.error("[crm/convert-lead]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
