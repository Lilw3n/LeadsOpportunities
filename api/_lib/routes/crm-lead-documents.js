/**
 * GET /api/crm/lead-documents — liste pieces dossier (pending par defaut)
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

  var sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });
  await ensureLeadDocumentsSchema(sql);

  var url = new URL(req.url, "http://localhost");
  var status = url.searchParams.get("status") || "pending";
  var leadId = url.searchParams.get("leadId");

  var rows;
  if (leadId) {
    rows = await sql`
      SELECT d.*, l.vertical AS lead_vertical
      FROM lead_documents d
      LEFT JOIN site_leads l ON l.id = d.lead_id
      WHERE d.lead_id = ${leadId}
      ORDER BY d.created_at DESC
      LIMIT 100
    `;
  } else if (status === "all") {
    rows = await sql`
      SELECT d.*, l.vertical AS lead_vertical
      FROM lead_documents d
      LEFT JOIN site_leads l ON l.id = d.lead_id
      ORDER BY d.created_at DESC
      LIMIT 200
    `;
  } else {
    rows = await sql`
      SELECT d.*, l.vertical AS lead_vertical
      FROM lead_documents d
      LEFT JOIN site_leads l ON l.id = d.lead_id
      WHERE d.status = ${status}
      ORDER BY d.created_at DESC
      LIMIT 200
    `;
  }

  return res.status(200).json({
    ok: true,
    documents: rows.map(function (r) {
      return {
        id: r.id,
        leadId: r.lead_id,
        contactId: r.contact_id,
        email: r.email,
        vertical: r.vertical,
        docType: r.doc_type,
        displayName: r.display_name,
        fileName: r.file_name,
        mimeType: r.mime_type,
        fileSize: r.file_size,
        status: r.status,
        rejectReason: r.reject_reason,
        reviewedBy: r.reviewed_by,
        reviewedAt: r.reviewed_at,
        createdAt: r.created_at,
        hasPreview: !!r.content_base64,
        driveFileId: r.drive_file_id,
      };
    }),
  });
};
