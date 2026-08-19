/**
 * POST /api/external/upload — dépôt document portail client / parcours devis
 */
const crypto = require("crypto");
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");
const { getSql } = require("../db");
const { uploadBase64File } = require("../drive-upload-core");
const { subfolderForDocumentType } = require("../drive-folders");

function attachmentFromBody(body, driveResult) {
  return {
    name: body.fileName || body.name || "document",
    type: body.documentType || "generic",
    label: body.documentLabel || body.fileName || "Document",
    mimeType: body.mimeType || driveResult.mimeType || "application/octet-stream",
    driveFileId: driveResult.fileId || null,
    webViewLink: driveResult.webViewLink || null,
    thumbnailLink: driveResult.thumbnailLink || null,
    uploadedAt: new Date().toISOString(),
    description: body.description || "",
    vertical: body.vertical || body.need || null,
    leadId: body.leadId || body.lead_id || null,
  };
}

async function resolveContact(sql, body) {
  const contactId = body.contactId || body.contact_id || null;
  if (contactId) {
    const rows = await sql`SELECT id, first_name, last_name, email FROM crm_contacts WHERE id = ${contactId} LIMIT 1`;
    if (rows.length) return rows[0];
  }
  const email = body.email ? String(body.email).trim().toLowerCase() : "";
  if (!email) return null;
  const contacts = await sql`
    SELECT id, first_name, last_name, email FROM crm_contacts WHERE LOWER(email) = ${email} LIMIT 1
  `;
  return contacts.length ? contacts[0] : null;
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip = getClientIp(req);
  const rl = rateLimit("ext-upload:" + ip, 30, 3600000);
  if (!rl.allowed) return res.status(429).json({ error: "Trop de requetes" });

  const parsed = parseJsonBody(req);
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
  if (!body.fileBase64) {
    return res.status(400).json({ error: "fileBase64 requis (PDF ou image JPG/PNG)" });
  }

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  try {
    const contact = await resolveContact(sql, body);
    if (!contact) return res.status(404).json({ error: "Dossier client introuvable" });

    const subfolder = subfolderForDocumentType(documentType);
    var driveResult = await uploadBase64File({
      fileName: fileName,
      base64: body.fileBase64,
      mimeType: body.mimeType || "application/octet-stream",
      contactId: contact.id,
      subfolder: subfolder,
      kind: "document",
    });

    const attachment = attachmentFromBody(body, driveResult || {});
    const extraData = JSON.stringify({
      attachments: [attachment],
      documentType: documentType,
      source: body.source || "portal_upload",
      vertical: body.vertical || body.need || null,
      leadId: body.leadId || body.lead_id || null,
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
      attachment: attachment,
      drive: driveResult,
      message: "Document enregistré",
    });
  } catch (e) {
    console.error("[external/upload]", e);
    var msg = e.message || "Erreur serveur";
    var code = /non autorise|refuse|correspond pas|volumineux|vide/i.test(msg) ? 400 : 500;
    return res.status(code).json({ error: msg });
  }
};
