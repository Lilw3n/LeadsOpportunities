/**
 * GET /api/crm/document-download — inspire admin/documents/download/[documentId] multisite
 * Export JSON sécurisé (devis, demande, pièce jointe événement) pour archivage / conformité.
 */
const { applyApiGuards } = require("../security");
const { requireCrm, contactScopeFilter } = require("../rbac");
const { getSql } = require("../db");

function safeFilename(s) {
  return String(s || "export").replace(/[^\w.-]+/g, "_").slice(0, 80);
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });
  const scope = contactScopeFilter(user);
  const url = new URL(req.url, "http://localhost");
  const type = (url.searchParams.get("type") || "").toLowerCase();
  const id = url.searchParams.get("id");
  const eventId = url.searchParams.get("eventId");
  const indexStr = url.searchParams.get("index");

  try {
    if (type === "quote" && id) {
      const rows = await sql`
        SELECT q.*, c.first_name, c.last_name, c.email AS contact_email, c.phone
        FROM crm_quotes q
        INNER JOIN crm_contacts c ON c.id = q.contact_id
        WHERE q.id = ${id}
          AND (${scope}::text IS NULL OR c.assigned_to = ${scope})
        LIMIT 1
      `;
      if (!rows.length) return res.status(404).json({ error: "Devis introuvable" });
      const payload = { exportedAt: new Date().toISOString(), kind: "quote", data: rows[0] };
      const body = JSON.stringify(payload, null, 2);
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Content-Disposition", 'attachment; filename="' + safeFilename("devis-" + id) + '.json"');
      return res.status(200).send(body);
    }

    if (type === "request" && id) {
      const rows = await sql`
        SELECT r.*, c.first_name, c.last_name, c.email AS contact_email
        FROM crm_insurance_requests r
        INNER JOIN crm_contacts c ON c.id = r.contact_id
        WHERE r.id = ${id}
          AND (${scope}::text IS NULL OR c.assigned_to = ${scope})
        LIMIT 1
      `;
      if (!rows.length) return res.status(404).json({ error: "Demande introuvable" });
      const payload = { exportedAt: new Date().toISOString(), kind: "insurance_request", data: rows[0] };
      const body = JSON.stringify(payload, null, 2);
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Content-Disposition", 'attachment; filename="' + safeFilename("demande-" + id) + '.json"');
      return res.status(200).send(body);
    }

    if (type === "event-attachment" && eventId && indexStr != null) {
      const idx = parseInt(indexStr, 10);
      if (Number.isNaN(idx) || idx < 0) return res.status(400).json({ error: "index invalide" });
      const rows = await sql`
        SELECT e.id, e.title, e.extra_data, e.contact_id, e.created_at,
          c.first_name, c.last_name, c.email AS contact_email
        FROM crm_events e
        INNER JOIN crm_contacts c ON c.id = e.contact_id
        WHERE e.id = ${eventId}
          AND (${scope}::text IS NULL OR c.assigned_to = ${scope})
        LIMIT 1
      `;
      if (!rows.length) return res.status(404).json({ error: "Evenement introuvable" });
      var extra = {};
      try {
        extra = JSON.parse(rows[0].extra_data || "{}");
      } catch (e) {}
      var atts = extra.attachments || [];
      if (!atts[idx]) return res.status(404).json({ error: "Piece jointe introuvable" });
      const payload = {
        exportedAt: new Date().toISOString(),
        kind: "event_attachment",
        eventId: rows[0].id,
        contactId: rows[0].contact_id,
        attachmentIndex: idx,
        attachment: atts[idx],
        eventTitle: rows[0].title,
      };
      const body = JSON.stringify(payload, null, 2);
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="' + safeFilename("piece-" + eventId + "-" + idx) + '.json"'
      );
      return res.status(200).send(body);
    }

    return res.status(400).json({
      error: "Parametres: type=quote&id= | type=request&id= | type=event-attachment&eventId=&index=",
    });
  } catch (e) {
    console.error("[crm/document-download]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
