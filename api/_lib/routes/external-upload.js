/**
 * POST /api/external/upload — dépôt document sécurisé (portail / devis / CRM)
 */
const crypto = require("crypto");
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");
const { getAuthUser } = require("../auth");
const { getSql } = require("../db");
const { uploadBase64File } = require("../drive-upload-core");
const { subfolderForDocumentType, resolveContactDocTypeFolderId } = require("../drive-folders");
const {
  verifyUploadToken,
  tokenMatchesBody,
  extractUploadToken,
  createUploadToken,
} = require("../upload-token");
const { isDriveUploadConfigured, uploadConfigHint } = require("../google-drive-auth");

/** JSON body max — aligné Vercel (~4,5 Mo) + base64 */
const UPLOAD_JSON_MAX = 5 * 1024 * 1024;

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

async function authorizeUpload(req, body, contact, sql) {
  const user = await getAuthUser(req);
  if (user && user.userId) {
    return { ok: true, via: "crm", user: user };
  }

  const token = extractUploadToken(req, body);
  const decoded = verifyUploadToken(token);
  if (decoded && tokenMatchesBody(decoded, Object.assign({}, body, { email: contact.email, contactId: contact.id }))) {
    return { ok: true, via: "upload_token", decoded: decoded };
  }

  // Preuve d'ownership : lead existant avec le même e-mail (après formulaire)
  const leadId = body.leadId || body.lead_id || null;
  const email = body.email
    ? String(body.email).trim().toLowerCase()
    : String(contact.email || "")
        .trim()
        .toLowerCase();
  if (leadId && email) {
    const leads = await sql`
      SELECT id FROM site_leads
      WHERE id = ${leadId}
        AND LOWER(COALESCE(email, '')) = ${email}
      LIMIT 1
    `;
    if (leads.length) {
      return { ok: true, via: "lead_proof" };
    }
  }

  return {
    ok: false,
    status: 401,
    error:
      "Upload non autorisé — reconnectez-vous au CRM, ou renvoyez le formulaire pour obtenir un jeton de dépôt sécurisé.",
  };
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip = getClientIp(req);
  const rl = rateLimit("ext-upload:" + ip, 40, 3600000);
  if (!rl.allowed) return res.status(429).json({ error: "Trop de requetes" });

  const parsed = parseJsonBody(req, UPLOAD_JSON_MAX);
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
    if (!isDriveUploadConfigured()) {
      return res.status(503).json({
        ok: false,
        error: "Google Drive non configuré pour l'upload. " + uploadConfigHint(),
        code: "drive_not_configured",
      });
    }

    const contact = await resolveContact(sql, body);
    if (!contact) {
      return res.status(404).json({
        error:
          "Dossier client introuvable — créez d’abord la fiche interlocuteur (ou utilisez « Enregistrer les pièces » depuis le détail lead).",
        code: "contact_missing",
        leadId: body.leadId || body.lead_id || null,
      });
    }

    const auth = await authorizeUpload(req, body, contact, sql);
    if (!auth.ok) return res.status(auth.status).json({ ok: false, error: auth.error, code: "upload_unauthorized" });

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
      allowSimulated: false,
    };
    if (usePerType) {
      uploadOpts.folderId = await resolveContactDocTypeFolderId(contact.id, documentType);
    } else {
      uploadOpts.subfolder = subfolderForDocumentType(documentType);
    }
    var driveResult = await uploadBase64File(uploadOpts);

    if (!driveResult || driveResult.simulated || !driveResult.fileId || String(driveResult.fileId).indexOf("sim_") === 0) {
      return res.status(503).json({
        ok: false,
        error: "Échec dépôt Drive — le fichier n'a pas été enregistré. " + (driveResult && driveResult.message ? driveResult.message : uploadConfigHint()),
        code: "drive_upload_failed",
        drive: driveResult || null,
      });
    }

    const attachment = attachmentFromBody(body, driveResult || {});
    const extraData = JSON.stringify({
      attachments: [attachment],
      documentType: documentType,
      source: body.source || "portal_upload",
      vertical: body.vertical || body.need || null,
      leadId: body.leadId || body.lead_id || null,
      authVia: auth.via || null,
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

    var refreshToken = null;
    try {
      if (contact.email) {
        refreshToken = createUploadToken({
          email: contact.email,
          contactId: contact.id,
          leadId: body.leadId || body.lead_id || null,
          need: body.vertical || body.need,
        });
      }
    } catch (tokErr) {
      console.warn("[external/upload] token refresh", tokErr.message);
    }

    return res.status(201).json({
      ok: true,
      eventId: evtId,
      contactId: contact.id,
      attachment: attachment,
      drive: driveResult,
      uploadToken: refreshToken,
      message: "Document enregistré sur Drive",
    });
  } catch (e) {
    console.error("[external/upload]", e);
    var msg = e.message || "Erreur serveur";
    var code = /non autorise|refuse|correspond pas|volumineux|vide|Extension|Format/i.test(msg) ? 400 : 500;
    return res.status(code).json({ ok: false, error: msg });
  }
};
