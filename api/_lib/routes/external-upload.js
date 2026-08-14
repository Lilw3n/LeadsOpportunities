/**
 * POST /api/external/upload — dépôt document portail client / parcours devis
 */
const crypto = require("crypto");
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");
const { getSql } = require("../db");
const { uploadTextFile, uploadBase64File } = require("../drive-upload-core");
const { subfolderForDocumentType } = require("../drive-folders");
const { UPLOAD_JSON_MAX_BYTES } = require("../upload-limits");
const { resolveOrCreateContact } = require("../resolve-upload-contact");

function attachmentFromBody(body, driveResult) {
  return {
    name: body.fileName || body.name || "document",
    type: body.documentType || "generic",
    label: body.documentLabel || body.fileName || "Document",
    mimeType: body.mimeType || driveResult.mimeType || "application/octet-stream",
    driveFileId: driveResult.fileId || null,
    webViewLink: driveResult.webViewLink || null,
    thumbnailLink: driveResult.thumbnailLink || null,
    backupPath: driveResult.backup && (driveResult.backup.relativePath || driveResult.backup.path),
    backupOk: !!(driveResult.backup && driveResult.backup.ok),
    backupOnly: !!driveResult.backupOnly,
    uploadedAt: new Date().toISOString(),
    description: body.description || "",
    vertical: body.vertical || body.need || null,
    leadId: body.leadId || body.lead_id || null,
  };
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip = getClientIp(req);
  const rl = rateLimit("ext-upload:" + ip, 30, 3600000);
  if (!rl.allowed) return res.status(429).json({ error: "Trop de requetes" });

  const parsed = parseJsonBody(req, UPLOAD_JSON_MAX_BYTES);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};
  const fileName = body.fileName || body.name;
  const description = body.description || "";
  const documentType = body.documentType || "generic";

  if (!fileName) {
    return res.status(400).json({ error: "fileName requis" });
  }
  if (!body.email && !body.contactId && !body.contact_id) {
    return res.status(400).json({ error: "email ou contactId requis" });
  }
  if (!body.fileBase64 && !body.content) {
    return res.status(400).json({ error: "fileBase64 ou content requis" });
  }

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  try {
    const resolved = await resolveOrCreateContact(sql, body);
    const contact = resolved.contact;
    if (!contact) return res.status(400).json({ error: "email invalide — impossible de rattacher le document" });

    const subfolder = subfolderForDocumentType(documentType);
    var driveResult = null;
    var uploadOpts = {
      fileName: fileName,
      mimeType: body.mimeType,
      contactId: contact.id,
      subfolder: subfolder,
      documentType: documentType,
      source: body.source || "portal_upload",
    };
    if (body.fileBase64) {
      driveResult = await uploadBase64File(
        Object.assign({}, uploadOpts, {
          base64: body.fileBase64,
          mimeType: body.mimeType || "application/octet-stream",
        })
      );
    } else if (body.content) {
      driveResult = await uploadTextFile(
        Object.assign({}, uploadOpts, {
          content: typeof body.content === "string" ? body.content : JSON.stringify(body.content),
          mimeType: body.mimeType || "text/plain",
        })
      );
    }

    const attachment = attachmentFromBody(body, driveResult || {});
    const extraData = JSON.stringify({
      attachments: [attachment],
      documentType: documentType,
      source: body.source || "portal_upload",
      vertical: body.vertical || body.need || null,
      leadId: body.leadId || body.lead_id || null,
      contactCreated: resolved.created,
    });

    const actId = "act_" + crypto.randomUUID();
    await sql`
      INSERT INTO crm_activities (id, contact_id, activity_type, title, body)
      VALUES (
        ${actId}, ${contact.id},
        'document_upload', ${"Document déposé — " + fileName}, ${JSON.stringify(attachment)}
      )
    `;

    const evtId = "evt_" + crypto.randomUUID();
    await sql`
      INSERT INTO crm_events (
        id, contact_id, event_type, title, description, event_date, status, priority, extra_data
      ) VALUES (
        ${evtId}, ${contact.id}, 'document',
        ${"Pièce jointe — " + fileName},
        ${description || "Document déposé via parcours devis"},
        ${new Date().toISOString().slice(0, 10)}, 'pending', 'medium', ${extraData}
      )
    `;

    if (body.leadId || body.lead_id) {
      try {
        const { recordLeadEvent } = require("../lead-workflow");
        await recordLeadEvent(sql, {
          leadId: body.leadId || body.lead_id,
          contactId: contact.id,
          eventType: "document_uploaded",
          source: "site",
          title: "Document déposé — " + fileName,
          payload: attachment,
        });
      } catch (wfErr) {
        console.warn("[external/upload] lead event", wfErr.message);
      }
    }

    return res.status(201).json({
      ok: true,
      eventId: evtId,
      contactId: contact.id,
      contactCreated: resolved.created,
      attachment: attachment,
      drive: driveResult,
      message: driveResult && driveResult.backupOnly
        ? "Document enregistré (copie o2switch — Drive à reconnecter)"
        : "Document enregistré",
    });
  } catch (e) {
    console.error("[external/upload]", e);
    return res.status(500).json({ error: e.message || "Erreur serveur" });
  }
};
