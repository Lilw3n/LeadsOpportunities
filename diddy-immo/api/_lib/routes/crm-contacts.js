const crypto = require("crypto");
const { applyApiGuards, parseJsonBody, sanitizeSearch } = require("../security");
const { requireCrm, CONTACT_TYPES, contactScopeFilter } = require("../rbac");
const { getSql } = require("../db");
const { ensureClientDriveFolders } = require("../drive-folders");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await requireCrm(req, res);
  if (!user) return;

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  const scope = contactScopeFilter(user);

  if (req.method === "GET") {
    const url = new URL(req.url, "http://localhost");
    const type = url.searchParams.get("type");
    const search = url.searchParams.get("search")
      ? sanitizeSearch(url.searchParams.get("search"))
      : null;
    const pattern = search ? "%" + search + "%" : null;
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "50", 10)));

    try {
      const rows = await sql`
        SELECT id, contact_type, first_name, last_name, email, phone, company,
               status, source, assigned_to, notes, created_at, updated_at, last_activity_at
        FROM crm_contacts
        WHERE (${scope}::text IS NULL OR assigned_to = ${scope})
          AND (${type}::text IS NULL OR contact_type = ${type})
          AND (${pattern}::text IS NULL OR (
            LOWER(COALESCE(email,'')) LIKE LOWER(${pattern})
            OR LOWER(COALESCE(phone,'')) LIKE LOWER(${pattern})
            OR LOWER(COALESCE(first_name,'') || ' ' || COALESCE(last_name,'')) LIKE LOWER(${pattern})
            OR LOWER(COALESCE(company,'')) LIKE LOWER(${pattern})
          ))
        ORDER BY COALESCE(last_activity_at, updated_at, created_at) DESC
        LIMIT ${limit}
      `;
      return res.status(200).json({ ok: true, contacts: rows });
    } catch (e) {
      console.error("[crm/contacts GET]", e);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  if (req.method === "POST") {
    const parsed = parseJsonBody(req);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const body = parsed.body || {};
    const contactType = String(body.contactType || body.contact_type || "prospect").toLowerCase();
    if (CONTACT_TYPES.indexOf(contactType) === -1) {
      return res.status(400).json({ error: "Type invalide (prospect, client, apporteur)" });
    }

    const id = "ct_" + crypto.randomUUID();
    const assignedTo = scope || body.assignedTo || body.assigned_to || user.id;

    try {
      await sql`
        INSERT INTO crm_contacts (
          id, contact_type, first_name, last_name, email, phone, company,
          status, source, assigned_to, notes, last_activity_at
        ) VALUES (
          ${id},
          ${contactType},
          ${body.firstName || body.first_name || null},
          ${body.lastName || body.last_name || null},
          ${body.email ? String(body.email).trim().toLowerCase() : null},
          ${body.phone || null},
          ${body.company || null},
          ${body.status || "active"},
          ${body.source || "crm"},
          ${assignedTo},
          ${body.notes || null},
          NOW()
        )
      `;

      ensureClientDriveFolders(id).catch(function (err) {
        console.error("[crm/contacts] drive folder:", err);
      });

      await sql`
        INSERT INTO crm_activities (id, contact_id, user_id, activity_type, title, body)
        VALUES (
          ${"act_" + crypto.randomUUID()},
          ${id},
          ${user.id},
          'created',
          'Contact cree',
          ${"Type: " + contactType}
        )
      `;

      return res.status(201).json({ ok: true, id });
    } catch (e) {
      console.error("[crm/contacts POST]", e);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
