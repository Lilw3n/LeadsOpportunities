/**
 * POST /api/crm/lead-document-review — approuver ou refuser un document dossier
 */
const crypto = require("crypto");
const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm } = require("../rbac");
const { getSql } = require("../db");
const { ensureLeadDocumentsSchema } = require("../lead-documents-lib");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;
  if (user.role !== "admin" && user.role !== "manager" && user.crmRole !== "admin") {
    return res.status(403).json({ error: "Permission validation documents requise" });
  }

  const parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};
  var id = body.id || body.documentId;
  var action = body.action;
  var reason = String(body.reason || body.rejectReason || "").slice(0, 500);
  var rename = body.displayName ? String(body.displayName).trim().slice(0, 160) : null;

  if (!id || !action) return res.status(400).json({ error: "id et action requis" });
  if (action !== "approve" && action !== "reject") {
    return res.status(400).json({ error: "action: approve ou reject" });
  }

  var sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });
  await ensureLeadDocumentsSchema(sql);

  var newStatus = action === "approve" ? "approved" : "rejected";
  var reviewer = user.email || user.id;

  var rows = await sql`
    UPDATE lead_documents
    SET status = ${newStatus},
        reviewed_by = ${reviewer},
        reviewed_at = NOW(),
        reject_reason = ${action === "reject" ? reason || "Document non conforme" : null},
        display_name = COALESCE(${rename}, display_name)
    WHERE id = ${id}
    RETURNING *
  `;
  if (!rows.length) return res.status(404).json({ error: "Document introuvable" });
  var doc = rows[0];

  if (doc.contact_id) {
    try {
      await sql`
        INSERT INTO crm_activities (id, contact_id, activity_type, title, body)
        VALUES (
          ${"act_" + crypto.randomUUID()}, ${doc.contact_id},
          'document_review',
          ${action === "approve" ? "Document valide" : "Document refuse"},
          ${JSON.stringify({
            leadDocumentId: doc.id,
            displayName: doc.display_name,
            action: action,
            reason: reason || null,
            reviewedBy: reviewer,
          })}
        )
      `;
    } catch (e) {
      console.warn("[crm/lead-document-review] activity", e.message);
    }
  }

  return res.status(200).json({
    ok: true,
    message: action === "approve" ? "Document approuve" : "Document refuse",
    document: {
      id: doc.id,
      status: doc.status,
      displayName: doc.display_name,
      rejectReason: doc.reject_reason,
    },
  });
};
