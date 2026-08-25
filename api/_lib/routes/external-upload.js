/**
 * POST /api/external/upload — dépôt document portail client / parcours devis
 */
const crypto = require("crypto");
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");
const { getSql } = require("../db");
const { uploadBase64File } = require("../drive-upload-core");
const { subfolderForDocumentType, resolveContactDocTypeFolderId } = require("../drive-folders");

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
  const leadId = body.leadId || body.lead_id || null;
  if (leadId) {
    try {
      const leads = await sql`
        SELECT id, contact_id, email, phone FROM site_leads WHERE id = ${leadId} LIMIT 1
      `;
      if (leads.length && leads[0].contact_id) {
        const linked = await sql`
          SELECT id, first_name, last_name, email FROM crm_contacts WHERE id = ${leads[0].contact_id} LIMIT 1
        `;
        if (linked.length) return linked[0];
      }
      if (leads.length && leads[0].email && !body.email) {
        body.email = leads[0].email;
      }
      if (leads.length && leads[0].phone && !body.phone) {
        body.phone = leads[0].phone;
      }
    } catch (e) {
      console.warn("[external/upload] lead lookup", e.message);
    }
  }
  const email = body.email ? String(body.email).trim().toLowerCase() : "";
  if (email) {
    const contacts = await sql`
      SELECT id, first_name, last_name, email FROM crm_contacts WHERE LOWER(email) = ${email} LIMIT 1
    `;
    if (contacts.length) return contacts[0];
  }
  const phone = body.phone || body.telephone || "";
  var digits = String(phone).replace(/\D/g, "");
  if (digits.length >= 10) {
    var tail = digits.slice(-10);
    const byPhone = await sql`
      SELECT id, first_name, last_name, email FROM crm_contacts
      WHERE phone IS NOT NULL
        AND REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '.', ''), '-', ''), '+33', '0') LIKE ${"%" + tail}
      LIMIT 1
    `;
    if (byPhone.length) return byPhone[0];
  }
  return null;
}

/** Si aucune fiche : crée / lie immédiatement pour permettre l’upload sans attendre le submit. */
async function resolveOrCreateContact(sql, body) {
  var contact = await resolveContact(sql, body);
  if (contact) return contact;
  try {
    const { ensureContactLinked } = require("../crm-ingest-from-lead");
    var contactId = await ensureContactLinked(sql, {
      leadId: body.leadId || body.lead_id || null,
      email: body.email || null,
      phone: body.phone || body.telephone || null,
      firstName: body.firstName || body.first_name || body.prenom || null,
      lastName: body.lastName || body.last_name || body.nom || null,
      vertical: body.vertical || body.need || null,
      source: body.source || "external_upload",
      autoFrom: "external_upload",
    });
    if (!contactId) return null;
    const rows = await sql`
      SELECT id, first_name, last_name, email FROM crm_contacts WHERE id = ${contactId} LIMIT 1
    `;
    return rows[0] || null;
  } catch (e) {
    console.warn("[external/upload] ensure contact", e.message);
    return null;
  }
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
  if (!body.email && !body.contactId && !body.contact_id && !body.phone && !body.telephone && !body.leadId && !body.lead_id) {
    return res.status(400).json({ error: "email, téléphone, contactId ou leadId requis" });
  }
  if (!body.fileBase64) {
    return res.status(400).json({ error: "fileBase64 requis (PDF ou image JPG/PNG)" });
  }

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  try {
    const { ensureContactsDriveSchema } = require("../drive-folders");
    await ensureContactsDriveSchema(sql);

    const contact = await resolveOrCreateContact(sql, body);
    if (!contact) {
      return res.status(404).json({
        error:
          "Impossible de créer le dossier — fournissez un e-mail, un téléphone ou un leadId.",
        code: "contact_missing",
        leadId: body.leadId || body.lead_id || null,
      });
    }

    const usePerType =
      body.perTypeFolder === true ||
      body.vertical === "vendeur-immo" ||
      body.need === "vendeur-immo";
    var uploadOpts = {
      fileName: fileName,
      base64: body.fileBase64,
      mimeType: body.mimeType || "application/octet-stream",
      contactId: contact.id,
      kind: "document",
    };
    if (usePerType) {
      uploadOpts.folderId = await resolveContactDocTypeFolderId(contact.id, documentType);
    } else {
      uploadOpts.subfolder = subfolderForDocumentType(documentType);
    }
    var driveResult = await uploadBase64File(uploadOpts);
    if (driveResult && driveResult.simulated) {
      return res.status(503).json({
        ok: false,
        error:
          "Upload Drive en mode simulation — configurez GOOGLE_DRIVE_REFRESH_TOKEN puis redeploy.",
        code: "drive_simulated",
        drive: driveResult,
      });
    }

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
    /* Fichier déjà sur Drive → statut completed (plus « en attente ») */
    await sql`
      INSERT INTO crm_events (
        id, contact_id, event_type, title, description, event_date, status, priority, extra_data
      ) VALUES (
        ${evtId}, ${contact.id}, 'document',
        ${"Pièce jointe — " + fileName},
        ${description || "Document déposé via parcours devis"},
        ${new Date().toISOString().slice(0, 10)}, 'completed', 'medium', ${extraData}
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
      driveWebViewLink: driveResult.webViewLink || null,
      message: "Document enregistré",
    });
  } catch (e) {
    console.error("[external/upload]", e);
    var msg = e.message || "Erreur serveur";
    var code = /non autorise|refuse|correspond pas|volumineux|vide/i.test(msg) ? 400 : 500;
    return res.status(code).json({ error: msg });
  }
};
