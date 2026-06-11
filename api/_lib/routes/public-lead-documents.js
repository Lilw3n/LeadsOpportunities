/**
 * POST /api/lead-documents — depot pieces dossier (landing VTC)
 * GET  /api/lead-documents?leadId=&email= — liste pieces du dossier
 */
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");
const { getSql } = require("../db");
const { uploadTextFile } = require("../drive-upload-core");
const {
  ensureLeadDocumentsSchema,
  sanitizeFileName,
  extensionFromMime,
  defaultDisplayName,
  defaultFileStem,
  parseBase64Payload,
  verifyLeadAccess,
  newDocId,
  getDossierSlots,
  getDossierLabel,
  normalizeVertical,
} = require("../lead-documents-lib");
const { ensureLeadDriveFolder } = require("../drive-folders");

async function handleList(req, res) {
  var url = new URL(req.url, "http://localhost");
  var leadId = url.searchParams.get("leadId");
  var email = url.searchParams.get("email");
  var sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });
  await ensureLeadDocumentsSchema(sql);

  var access = await verifyLeadAccess(sql, leadId, email);
  if (!access.ok) return res.status(403).json({ error: access.error });

  var rows = await sql`
    SELECT id, doc_type, display_name, file_name, mime_type, file_size, status, created_at, reject_reason
    FROM lead_documents
    WHERE lead_id = ${leadId}
    ORDER BY created_at DESC
  `;

  var vertical = normalizeVertical(access.lead.vertical);
  return res.status(200).json({
    ok: true,
    leadId: leadId,
    vertical: vertical,
    dossierLabel: getDossierLabel(vertical),
    slots: getDossierSlots(vertical),
    driveLinked: !!(access.lead.drive_folder_id || access.lead.contact_id),
    documents: rows.map(function (r) {
      return {
        id: r.id,
        docType: r.doc_type,
        displayName: r.display_name,
        fileName: r.file_name,
        mimeType: r.mime_type,
        fileSize: r.file_size,
        status: r.status,
        createdAt: r.created_at,
        rejectReason: r.reject_reason,
      };
    }),
  });
}

async function handleUpload(req, res) {
  const ip = getClientIp(req);
  const rl = rateLimit("lead-doc:" + ip, 30, 3600000);
  if (!rl.allowed) return res.status(429).json({ error: "Trop de requetes" });

  const parsed = parseJsonBody(req, 12 * 1024 * 1024);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};

  var leadId = body.leadId;
  var email = body.email;
  var docType = String(body.docType || body.documentType || "autre").slice(0, 40);
  var vertical = String(body.vertical || "vtc").slice(0, 30);
  var displayName = String(body.displayName || body.display_name || defaultDisplayName(docType, vertical)).trim().slice(0, 160);
  var customFileName = body.fileName || body.file_name;
  var notes = String(body.notes || "").slice(0, 500);

  var fileParsed = parseBase64Payload(body.contentBase64 || body.content);
  if (fileParsed.error) return res.status(400).json({ error: fileParsed.error });

  var sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });
  await ensureLeadDocumentsSchema(sql);

  var access = await verifyLeadAccess(sql, leadId, email);
  if (!access.ok) return res.status(403).json({ error: access.error });

  var ext = extensionFromMime(fileParsed.mime, customFileName);
  var stem = sanitizeFileName(customFileName || defaultFileStem(docType, vertical));
  if (!/\.[a-z0-9]+$/i.test(stem)) stem += ext;
  var fileName = stem;

  var driveResult = null;
  try {
    if (!access.lead.contact_id) {
      await ensureLeadDriveFolder(leadId, email);
    }
    driveResult = await uploadTextFile({
      fileName: fileName,
      content: fileParsed.buffer.toString("base64"),
      mimeType: fileParsed.mime,
      contactId: access.lead.contact_id || null,
      leadId: leadId,
      email: email,
      docType: docType,
    });
  } catch (e) {
    console.warn("[lead-documents] drive", e.message);
  }

  var docId = newDocId();
  await sql`
    INSERT INTO lead_documents (
      id, lead_id, contact_id, email, vertical, doc_type, display_name, file_name,
      mime_type, file_size, content_base64, drive_file_id, status, notes
    ) VALUES (
      ${docId}, ${leadId}, ${access.lead.contact_id || null}, ${String(email).trim().toLowerCase()},
      ${vertical}, ${docType}, ${displayName}, ${fileName},
      ${fileParsed.mime}, ${fileParsed.buffer.length}, ${fileParsed.base64},
      ${driveResult && driveResult.fileId ? driveResult.fileId : null}, 'pending', ${notes || null}
    )
  `;

  if (access.lead.contact_id) {
    try {
      const crypto = require("crypto");
      await sql`
        INSERT INTO crm_events (
          id, contact_id, event_type, title, description, event_date, status, priority, extra_data
        ) VALUES (
          ${"evt_" + crypto.randomUUID()}, ${access.lead.contact_id}, 'document',
          ${"Piece dossier — " + displayName},
          ${"Depose via landing " + vertical},
          ${new Date().toISOString().slice(0, 10)}, 'pending', 'medium',
          ${JSON.stringify({
            leadDocumentId: docId,
            leadId: leadId,
            docType: docType,
            displayName: displayName,
            fileName: fileName,
            mimeType: fileParsed.mime,
            status: "pending",
          })}
        )
      `;
    } catch (crmErr) {
      console.warn("[lead-documents] crm event", crmErr.message);
    }
  }

  return res.status(201).json({
    ok: true,
    documentId: docId,
    fileName: fileName,
    displayName: displayName,
    status: "pending",
    drive: driveResult,
    message: "Document transmis au courtier pour validation",
  });
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method === "GET") return handleList(req, res);
  if (req.method === "POST") return handleUpload(req, res);
  return res.status(405).json({ error: "Method not allowed" });
};
