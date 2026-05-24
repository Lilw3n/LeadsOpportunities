const crypto = require("crypto");
const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm, contactScopeFilter } = require("../rbac");
const { getSql } = require("../db");

const MODULE_TYPES = ["vehicles", "drivers", "contracts", "claims", "events", "insurance-requests"];

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await requireCrm(req, res);
  if (!user) return;

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });
  const scope = contactScopeFilter(user);
  const url = new URL(req.url, "http://localhost");
  const contactId = url.searchParams.get("contactId");
  const linkId = url.searchParams.get("id");

  async function ownsContact(cid) {
    const rows = await sql`
      SELECT id FROM crm_contacts
      WHERE id = ${cid} AND (${scope}::text IS NULL OR assigned_to = ${scope})
      LIMIT 1
    `;
    return rows.length > 0;
  }

  if (req.method === "GET") {
    if (!contactId) return res.status(400).json({ error: "contactId requis" });
    try {
      if (!(await ownsContact(contactId))) {
        return res.status(404).json({ error: "Contact introuvable" });
      }
      const rows = await sql`
        SELECT l.*, c.first_name AS target_first_name, c.last_name AS target_last_name, c.email AS target_email
        FROM crm_module_links l
        LEFT JOIN crm_contacts c ON c.id = l.target_contact_id
        WHERE l.source_contact_id = ${contactId}
        ORDER BY l.created_at DESC
      `;
      return res.status(200).json({ ok: true, links: rows });
    } catch (e) {
      if (String(e.message || e).includes("crm_module_links")) {
        return res.status(200).json({ ok: true, links: [], migration: "crm-module-links.sql" });
      }
      console.error("[crm/module-link GET]", e);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  if (req.method === "POST") {
    const parsed = parseJsonBody(req);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const body = parsed.body || {};
    const src = body.sourceContactId || body.source_contact_id || contactId;
    const target = body.targetContactId || body.target_contact_id;
    const moduleType = String(body.moduleType || body.module_type || "").toLowerCase();
    const moduleId = body.moduleId || body.module_id;
    if (!src || !target || !moduleId) {
      return res.status(400).json({ error: "sourceContactId, targetContactId, moduleId requis" });
    }
    if (MODULE_TYPES.indexOf(moduleType) === -1) {
      return res.status(400).json({ error: "moduleType invalide" });
    }
    try {
      if (!(await ownsContact(src)) || !(await ownsContact(target))) {
        return res.status(404).json({ error: "Contact introuvable" });
      }
      const id = "lnk_" + crypto.randomUUID();
      await sql`
        INSERT INTO crm_module_links (id, source_contact_id, module_type, module_id, target_contact_id, label)
        VALUES (${id}, ${src}, ${moduleType}, ${moduleId}, ${target}, ${body.label || null})
      `;
      return res.status(201).json({ ok: true, id });
    } catch (e) {
      console.error("[crm/module-link POST]", e);
      return res.status(500).json({ error: "Erreur serveur (table crm_module_links ?)" });
    }
  }

  if (req.method === "DELETE" && linkId) {
    try {
      const rows = await sql`
        SELECT l.id FROM crm_module_links l
        INNER JOIN crm_contacts c ON c.id = l.source_contact_id
        WHERE l.id = ${linkId}
          AND (${scope}::text IS NULL OR c.assigned_to = ${scope})
        LIMIT 1
      `;
      if (!rows.length) return res.status(404).json({ error: "Lien introuvable" });
      await sql`DELETE FROM crm_module_links WHERE id = ${linkId}`;
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error("[crm/module-link DELETE]", e);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
