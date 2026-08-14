const crypto = require("crypto");
const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm, contactScopeFilter } = require("../rbac");
const { getSql } = require("../db");
const { loadAllModules } = require("../crm-modules-lib");
const { mergeMeta } = require("../crm-profile-meta");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await requireCrm(req, res);
  if (!user) return;

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  const url = new URL(req.url, "http://localhost");
  const contactId = url.searchParams.get("id");
  if (!contactId) return res.status(400).json({ error: "id requis" });

  const scope = contactScopeFilter(user);

  if (req.method === "GET") {
    try {
      const rows = await sql`
        SELECT * FROM crm_contacts
        WHERE id = ${contactId}
          AND (${scope}::text IS NULL OR assigned_to = ${scope})
        LIMIT 1
      `;
      if (!rows.length) return res.status(404).json({ error: "Contact introuvable" });

      const activities = await sql`
        SELECT id, activity_type, title, body, user_id, created_at
        FROM crm_activities
        WHERE contact_id = ${contactId}
        ORDER BY created_at DESC
        LIMIT 50
      `;

      const leads = await sql`
        SELECT id, vertical, lead_score, status, email, phone, created_at, payload, contact_id
        FROM site_leads
        WHERE contact_id = ${contactId}
        ORDER BY created_at DESC
        LIMIT 20
      `;

      let modules = {};
      try {
        modules = await loadAllModules(sql, contactId);
      } catch (modErr) {
        console.warn("[crm/contact GET] modules:", modErr.message);
      }

      return res.status(200).json({
        ok: true,
        contact: rows[0],
        activities,
        leads,
        ...modules,
      });
    } catch (e) {
      console.error("[crm/contact GET]", e);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  if (req.method === "DELETE") {
    if (user.role !== "admin" && user.crmRole !== "admin" && user.crmRole !== "staff") {
      return res.status(403).json({ error: "Suppression non autorisee" });
    }
    try {
      const existing = await sql`
        SELECT id FROM crm_contacts
        WHERE id = ${contactId}
          AND (${scope}::text IS NULL OR assigned_to = ${scope})
        LIMIT 1
      `;
      if (!existing.length) return res.status(404).json({ error: "Contact introuvable" });

      await sql`DELETE FROM crm_events WHERE contact_id = ${contactId}`;
      await sql`DELETE FROM crm_claims WHERE contact_id = ${contactId}`;
      await sql`DELETE FROM crm_vehicles WHERE contact_id = ${contactId}`;
      await sql`DELETE FROM crm_drivers WHERE contact_id = ${contactId}`;
      await sql`DELETE FROM crm_contracts WHERE contact_id = ${contactId}`;
      await sql`DELETE FROM crm_insurance_requests WHERE contact_id = ${contactId}`;
      await sql`DELETE FROM crm_activities WHERE contact_id = ${contactId}`;
      await sql`UPDATE site_leads SET contact_id = NULL WHERE contact_id = ${contactId}`;
      await sql`DELETE FROM crm_contacts WHERE id = ${contactId}`;
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error("[crm/contact DELETE]", e);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  if (req.method === "PATCH") {
    const parsed = parseJsonBody(req);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const body = parsed.body || {};

    try {
      const existing = await sql`
        SELECT id FROM crm_contacts
        WHERE id = ${contactId}
          AND (${scope}::text IS NULL OR assigned_to = ${scope})
        LIMIT 1
      `;
      if (!existing.length) return res.status(404).json({ error: "Contact introuvable" });

      let metadataPatch = null;
      if (body.metadata != null) {
        if (typeof body.metadata === "string") {
          metadataPatch = body.metadata;
        } else {
          const cur = await sql`SELECT metadata FROM crm_contacts WHERE id = ${contactId} LIMIT 1`;
          let meta = {};
          if (cur[0]?.metadata) {
            try {
              meta = JSON.parse(cur[0].metadata);
            } catch (e) {}
          }
          meta = mergeMeta(meta, body.metadata);
          metadataPatch = JSON.stringify(meta);
        }
      } else if (body.companyData || body.familyData) {
        const cur = await sql`SELECT metadata FROM crm_contacts WHERE id = ${contactId} LIMIT 1`;
        let meta = {};
        if (cur[0]?.metadata) {
          try {
            meta = JSON.parse(cur[0].metadata);
          } catch (e) {}
        }
        if (body.companyData) meta.company = body.companyData;
        if (body.familyData) meta.family = body.familyData;
        if (body.metadata && typeof body.metadata === "object") {
          meta = mergeMeta(meta, body.metadata);
        }
        if (body.profileKey || body.primaryNeed) {
          meta = mergeMeta(meta, {
            profileKey: body.profileKey,
            primaryNeed: body.primaryNeed,
            vertical: body.vertical,
          });
        }
        metadataPatch = JSON.stringify(meta);
      }

      await sql`
        UPDATE crm_contacts SET
          first_name = COALESCE(${body.firstName ?? body.first_name ?? null}, first_name),
          last_name = COALESCE(${body.lastName ?? body.last_name ?? null}, last_name),
          email = COALESCE(${body.email != null ? String(body.email).trim().toLowerCase() : null}, email),
          phone = COALESCE(${body.phone ?? null}, phone),
          company = COALESCE(${body.company ?? null}, company),
          status = COALESCE(${body.status ?? null}, status),
          contact_type = COALESCE(${body.contactType ?? body.contact_type ?? null}, contact_type),
          notes = COALESCE(${body.notes ?? null}, notes),
          assigned_to = COALESCE(${body.assignedTo ?? body.assigned_to ?? null}, assigned_to),
          metadata = COALESCE(${metadataPatch}, metadata),
          updated_at = NOW(),
          last_activity_at = NOW()
        WHERE id = ${contactId}
      `;

      if (body.activityNote || body.note) {
        await sql`
          INSERT INTO crm_activities (id, contact_id, user_id, activity_type, title, body)
          VALUES (
            ${"act_" + crypto.randomUUID()},
            ${contactId},
            ${user.id},
            'note',
            'Note',
            ${body.activityNote || body.note}
          )
        `;
      }

      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error("[crm/contact PATCH]", e);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
