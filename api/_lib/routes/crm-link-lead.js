const crypto = require("crypto");
const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm, contactScopeFilter } = require("../rbac");
const { getSql } = require("../db");
const { ensureMailboxSchema } = require("../ensure-schema");

function extractEmailFromAddr(addr) {
  const m = String(addr || "").match(/<([^>]+)>/);
  return (m && m[1]) || String(addr || "").trim();
}

function normalizePhone(phone) {
  if (!phone) return null;
  const p = String(phone).replace(/\s+/g, " ").trim();
  return p || null;
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;

  const parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};

  const leadId = body.leadId || body.lead_id || null;
  const messageId = body.messageId || body.message_id || null;
  const contactId = body.contactId || body.contact_id;

  if (!contactId) return res.status(400).json({ error: "contactId requis" });
  if (!leadId && !messageId) {
    return res.status(400).json({ error: "leadId ou messageId requis" });
  }

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  const scope = contactScopeFilter(user);

  try {
    const contacts = await sql`
      SELECT id, email, phone, first_name, last_name
      FROM crm_contacts
      WHERE id = ${contactId}
        AND (${scope}::text IS NULL OR assigned_to = ${scope})
      LIMIT 1
    `;
    if (!contacts.length) return res.status(404).json({ error: "Contact introuvable" });
    const contact = contacts[0];

    let emailHint = body.email ? String(body.email).trim().toLowerCase() : null;
    let phoneHint = normalizePhone(body.phone);
    let linkTitle = "Message lie a la fiche client";
    let linkBody = "";

    if (leadId) {
      const leads = await sql`
        SELECT id, email, phone, vertical, contact_id, notes
        FROM site_leads WHERE id = ${leadId} LIMIT 1
      `;
      if (!leads.length) return res.status(404).json({ error: "Lead introuvable" });
      const lead = leads[0];
      if (lead.contact_id && lead.contact_id !== contactId) {
        return res.status(409).json({
          error: "Lead deja lie a une autre fiche",
          contactId: lead.contact_id,
        });
      }

      emailHint = emailHint || (lead.email ? String(lead.email).trim().toLowerCase() : null);
      phoneHint = phoneHint || normalizePhone(lead.phone);
      linkTitle = "Lead lie a la fiche client";
      linkBody = "Lead " + lead.id + (lead.vertical ? " · " + lead.vertical : "");

      await sql`
        UPDATE site_leads SET contact_id = ${contactId}, updated_at = NOW()
        WHERE id = ${leadId}
      `;

      if (messageId) {
        await ensureMailboxSchema(sql);
        await sql`
          UPDATE mailbox_messages SET contact_id = ${contactId}
          WHERE id = ${messageId}
        `;
      } else {
        await ensureMailboxSchema(sql);
        await sql`
          UPDATE mailbox_messages SET contact_id = ${contactId}
          WHERE lead_id = ${leadId} OR id = ${"lead_" + leadId}
        `;
      }
    } else if (messageId) {
      await ensureMailboxSchema(sql);
      const msgs = await sql`
        SELECT id, from_addr, to_addr, direction, subject, lead_id, contact_id
        FROM mailbox_messages WHERE id = ${messageId} LIMIT 1
      `;
      if (!msgs.length) return res.status(404).json({ error: "Message introuvable" });
      const msg = msgs[0];
      if (msg.contact_id && msg.contact_id !== contactId) {
        return res.status(409).json({
          error: "Message deja lie a une autre fiche",
          contactId: msg.contact_id,
        });
      }

      const addr = msg.direction === "inbound" ? msg.from_addr : msg.to_addr;
      emailHint = emailHint || extractEmailFromAddr(addr).toLowerCase();
      linkTitle = "E-mail lie a la fiche client";
      linkBody = (msg.subject || "Sans objet") + (emailHint ? " · " + emailHint : "");

      if (msg.lead_id) {
        await sql`
          UPDATE site_leads SET contact_id = ${contactId}, updated_at = NOW()
          WHERE id = ${msg.lead_id} AND (contact_id IS NULL OR contact_id = ${contactId})
        `;
      }

      await sql`
        UPDATE mailbox_messages SET contact_id = ${contactId}
        WHERE id = ${messageId}
      `;
    }

    const nextEmail = contact.email || emailHint;
    const nextPhone = contact.phone || phoneHint;
    if ((emailHint && !contact.email) || (phoneHint && !contact.phone)) {
      await sql`
        UPDATE crm_contacts SET
          email = COALESCE(email, ${emailHint}),
          phone = COALESCE(phone, ${phoneHint}),
          last_activity_at = NOW(),
          updated_at = NOW()
        WHERE id = ${contactId}
      `;
    } else {
      await sql`
        UPDATE crm_contacts SET last_activity_at = NOW(), updated_at = NOW()
        WHERE id = ${contactId}
      `;
    }

    await sql`
      INSERT INTO crm_activities (id, contact_id, lead_id, user_id, activity_type, title, body)
      VALUES (
        ${"act_" + crypto.randomUUID()},
        ${contactId},
        ${leadId || null},
        ${user.id},
        'link',
        ${linkTitle},
        ${linkBody}
      )
    `;

    const name = [contact.first_name, contact.last_name].filter(Boolean).join(" ").trim();
    return res.status(200).json({
      ok: true,
      contactId,
      contactName: name || null,
      email: nextEmail,
      phone: nextPhone,
    });
  } catch (e) {
    console.error("[crm/link-lead]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
