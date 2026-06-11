/**
 * GET /api/crm/lead-document?id= — apercu document dossier
 */
const { applyApiGuards } = require("../security");
const { requireCrm } = require("../rbac");
const { getSql } = require("../db");
const { ensureLeadDocumentsSchema } = require("../lead-documents-lib");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;

  var url = new URL(req.url, "http://localhost");
  var id = url.searchParams.get("id");
  if (!id) return res.status(400).json({ error: "id requis" });

  var sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });
  await ensureLeadDocumentsSchema(sql);

  var rows = await sql`
    SELECT * FROM lead_documents WHERE id = ${id} LIMIT 1
  `;
  if (!rows.length) return res.status(404).json({ error: "Document introuvable" });
  var doc = rows[0];

  return res.status(200).json({
    ok: true,
    document: {
      id: doc.id,
      leadId: doc.lead_id,
      email: doc.email,
      vertical: doc.vertical,
      docType: doc.doc_type,
      displayName: doc.display_name,
      fileName: doc.file_name,
      mimeType: doc.mime_type,
      fileSize: doc.file_size,
      status: doc.status,
      rejectReason: doc.reject_reason,
      notes: doc.notes,
      createdAt: doc.created_at,
      contentBase64: doc.content_base64
        ? "data:" + (doc.mime_type || "application/octet-stream") + ";base64," + doc.content_base64
        : null,
      driveFileId: doc.drive_file_id,
    },
  });
};
