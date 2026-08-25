/**
 * POST /api/immo-listing-document — dépôt public document bien → Drive immo
 */
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");
const { getSql } = require("../db");
const crypto = require("crypto");
const { uploadBase64File } = require("../drive-upload-core");
const { resolveVendeurDocumentFolder, ensurePropertyDriveFolders } = require("../immo-drive");
const { isDriveUploadConfigured } = require("../google-drive-auth");

function str(v, max) {
  return String(v == null ? "" : v).trim().slice(0, max || 200);
}

function parseJson(raw, fallback) {
  if (!raw) return fallback || {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return fallback || {};
  }
}

module.exports = async function publicImmoListingDocument(req, res) {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  var ip = getClientIp(req);
  var rl = rateLimit("immo-listing-doc:" + ip, 40, 60 * 1000);
  if (!rl.allowed) {
    res.setHeader("Retry-After", String(Math.ceil(rl.retryAfterMs / 1000)));
    return res.status(429).json({ error: "Trop de requêtes" });
  }

  var parsed = parseJsonBody(req, 14 * 1024 * 1024);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  var body = parsed.body || {};

  var propertyId = str(body.propertyId, 80);
  var email = str(body.email, 320).toLowerCase();
  var fileName = str(body.fileName, 180);
  var documentType = str(body.documentType, 80) || "autre_doc";
  var documentGroup = str(body.documentGroup, 80);
  var bodyLeadId = str(body.leadId || body.lead_id, 80);
  var bodyContactId = str(body.contactId || body.contact_id, 80);

  if (!propertyId || !fileName || !body.fileBase64) {
    return res.status(400).json({
      ok: false,
      error: "propertyId, fileName et fileBase64 requis",
    });
  }
  if (!email && !bodyLeadId && !bodyContactId) {
    return res.status(400).json({
      ok: false,
      error: "email, leadId ou contactId requis",
    });
  }

  var sql = getSql();
  if (!sql) return res.status(500).json({ ok: false, error: "Base indisponible" });

  try {
    var store = require("../immo-properties-store");
    await store.ensureImmoSchema(sql);
    var rows = await sql`
      SELECT id, title, city, postal_code, surface_m2, drive_folder_id, lead_id, owner_contact_id, metadata_json
      FROM crm_immo_properties WHERE id = ${propertyId} LIMIT 1
    `;
    if (!rows.length) {
      return res.status(404).json({ ok: false, error: "Bien introuvable" });
    }
    var prop = rows[0];

    var leadOk = false;
    var leadFirst = "";
    var leadLast = "";
    if (bodyLeadId && prop.lead_id && bodyLeadId === prop.lead_id) {
      leadOk = true;
    }
    if (bodyContactId && prop.owner_contact_id && bodyContactId === prop.owner_contact_id) {
      leadOk = true;
    }
    if (prop.lead_id) {
      var leads = await sql`
        SELECT email, phone, payload, contact_id FROM site_leads WHERE id = ${prop.lead_id} LIMIT 1
      `;
      if (leads.length) {
        var le = String(leads[0].email || "").toLowerCase();
        if (email && le && le === email) leadOk = true;
        if (bodyLeadId && bodyLeadId === prop.lead_id) leadOk = true;
        if (bodyContactId && leads[0].contact_id && bodyContactId === leads[0].contact_id) leadOk = true;
        if (!email && leads[0].email) email = String(leads[0].email).toLowerCase();
        try {
          var lp = typeof leads[0].payload === "string" ? JSON.parse(leads[0].payload || "{}") : leads[0].payload || {};
          leadFirst = lp.firstName || lp.first_name || "";
          leadLast = lp.lastName || lp.last_name || "";
        } catch (e) {}
      }
    }
    if (!leadOk && email && bodyLeadId) {
      var leads2 = await sql`
        SELECT email FROM site_leads WHERE id = ${bodyLeadId} AND LOWER(email) = ${email} LIMIT 1
      `;
      leadOk = leads2.length > 0;
    }
    if (!leadOk && bodyContactId) {
      var cRows = await sql`
        SELECT id FROM crm_contacts WHERE id = ${bodyContactId} LIMIT 1
      `;
      leadOk = cRows.length > 0;
    }
    if (!leadOk) {
      return res.status(403).json({ ok: false, error: "Non autorisé pour ce bien" });
    }

    var classified = resolveVendeurDocumentFolder({
      documentGroup: documentGroup,
      documentType: documentType,
      fileName: fileName,
      mimeType: body.mimeType,
    });

    var ensured = await ensurePropertyDriveFolders(
      {
        id: prop.id,
        title: prop.title,
        city: prop.city,
        postal_code: prop.postal_code,
        surface_m2: prop.surface_m2,
        firstName: leadFirst || body.firstName || "",
        lastName: leadLast || body.lastName || "",
        drive_folder_id: prop.drive_folder_id,
      },
      { subfolder: classified }
    );

    var targetFolder =
      (ensured.subfolderIds && ensured.subfolderIds[classified] && ensured.subfolderIds[classified].id) ||
      ensured.folderId ||
      prop.drive_folder_id;

    var uploaded = await uploadBase64File({
      fileName: documentType + "_" + fileName,
      base64: body.fileBase64,
      mimeType: body.mimeType || "application/octet-stream",
      folderId: targetFolder,
      kind: "document",
    });

    var meta = parseJson(prop.metadata_json, {});
    meta.documents = meta.documents || [];
    meta.documents.push({
      type: documentType,
      group: documentGroup,
      fileName: fileName,
      uploadedAt: new Date().toISOString(),
      driveFileId: uploaded.fileId || null,
      webViewLink: uploaded.webViewLink || null,
      simulated: !!uploaded.simulated,
    });

    await sql`
      UPDATE crm_immo_properties
      SET metadata_json = ${JSON.stringify(meta)},
          drive_folder_id = COALESCE(drive_folder_id, ${ensured.folderId || null}),
          updated_at = NOW()
      WHERE id = ${propertyId}
    `;

    var contactId = body.contactId || null;
    if (!contactId && prop.lead_id) {
      var leadContact = await sql`
        SELECT contact_id FROM site_leads WHERE id = ${prop.lead_id} LIMIT 1
      `;
      if (leadContact.length && leadContact[0].contact_id) {
        contactId = leadContact[0].contact_id;
      }
    }
    if (contactId) {
      try {
        var attachment = {
          name: fileName,
          type: documentType,
          driveFileId: uploaded.fileId || null,
          webViewLink: uploaded.webViewLink || null,
          uploadedAt: new Date().toISOString(),
          propertyId: propertyId,
          source: "immo_listing_document",
        };
        var actId = "act_" + crypto.randomUUID();
        await sql`
          INSERT INTO crm_activities (id, contact_id, activity_type, title, body)
          VALUES (
            ${actId}, ${contactId},
            'document_upload', ${"Document bien — " + fileName}, ${JSON.stringify(attachment)}
          )
        `;
        await sql`
          UPDATE crm_immo_properties SET
            owner_contact_id = COALESCE(owner_contact_id, ${contactId}),
            updated_at = NOW()
          WHERE id = ${propertyId}
        `;
      } catch (syncErr) {
        console.warn("[immo-listing-document] contact sync", syncErr.message);
      }
    }

    if (uploaded.simulated) {
      return res.status(503).json({
        ok: false,
        error:
          "Upload Drive echoue (mode simulation). Regenerer GOOGLE_DRIVE_REFRESH_TOKEN sur Vercel puis redeploy.",
        code: "drive_simulated",
        drive: uploaded,
      });
    }

    var folderLink = null;
    if (ensured.folderId) {
      try {
        const { resolveFolderWebLink } = require("../drive-share");
        var fl = await resolveFolderWebLink(ensured.folderId, { share: false });
        folderLink = (fl && fl.webViewLink) || null;
      } catch (e) {}
    }

    return res.status(201).json({
      ok: true,
      propertyId: propertyId,
      contactId: contactId,
      documentType: documentType,
      classifiedAs: classified,
      drive: uploaded,
      driveFolderId: ensured.folderId || prop.drive_folder_id || null,
      driveWebViewLink: folderLink || uploaded.webViewLink || null,
      attachment: {
        name: fileName,
        type: documentType,
        driveFileId: uploaded.fileId || null,
        webViewLink: uploaded.webViewLink || null,
      },
    });
  } catch (e) {
    console.error("[immo-listing-document]", e);
    var msg = e.message || "Erreur upload";
    var code = /non autorise|refuse|correspond pas|volumineux|vide/i.test(msg) ? 400 : 502;
    return res.status(code).json({ ok: false, error: msg });
  }
};
