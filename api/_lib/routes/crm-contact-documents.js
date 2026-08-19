/**
 * GET /api/crm/contact-documents?contactId=
 * Documents d'un contact pour visualisation CRM (Drive + événements + biens immo).
 */
const { applyApiGuards } = require("../security");
const { requireCrm, contactScopeFilter } = require("../rbac");
const { getSql } = require("../db");

function parseJson(raw, fallback) {
  if (!raw) return fallback || {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return fallback || {};
  }
}

function parseArr(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      var p = JSON.parse(raw);
      return Array.isArray(p) ? p : [];
    } catch (e) {
      return [];
    }
  }
  return [];
}

function driveFolderUrl(folderId) {
  if (!folderId) return null;
  return "https://drive.google.com/drive/folders/" + encodeURIComponent(String(folderId));
}

function driveFileUrl(fileId) {
  if (!fileId) return null;
  return "https://drive.google.com/file/d/" + encodeURIComponent(String(fileId)) + "/view";
}

function parseEventDocs(e) {
  var extra = parseJson(e.extra_data, {});
  var docs = [];
  if (Array.isArray(extra.attachments)) {
    extra.attachments.forEach(function (a, i) {
      docs.push({
        id: e.id + "_att_" + i,
        eventId: e.id,
        name: a.name || a.label || "Document",
        type: a.type || extra.documentType || "generic",
        mimeType: a.mimeType || null,
        driveFileId: a.driveFileId || null,
        webViewLink: a.webViewLink || driveFileUrl(a.driveFileId),
        thumbnailLink: a.thumbnailLink || null,
        uploadedAt: a.uploadedAt || e.created_at,
        status: e.status || "pending",
        source: extra.source || "evenement",
      });
    });
  } else if (extra.fileName) {
    docs.push({
      id: e.id + "_att_0",
      eventId: e.id,
      name: extra.fileName,
      type: extra.documentType || "generic",
      driveFileId: (extra.drive && extra.drive.fileId) || null,
      webViewLink: (extra.drive && extra.drive.webViewLink) || driveFileUrl(extra.drive && extra.drive.fileId),
      uploadedAt: extra.uploadedAt || e.created_at,
      status: e.status || "pending",
      source: "portal_legacy",
    });
  }
  return docs;
}

function activityToDoc(a) {
  var meta = parseJson(a.body, {});
  var fileId = meta.driveFileId || null;
  return {
    id: "act_" + a.id,
    activityId: a.id,
    name: meta.name || meta.fileName || a.title || "Document",
    type: meta.type || meta.documentType || "document_upload",
    mimeType: meta.mimeType || null,
    driveFileId: fileId,
    webViewLink: meta.webViewLink || driveFileUrl(fileId),
    thumbnailLink: meta.thumbnailLink || null,
    uploadedAt: meta.uploadedAt || a.created_at,
    status: "deposé",
    source: meta.source || "activite",
    propertyId: meta.propertyId || null,
  };
}

function dedupeDocs(list) {
  var seen = {};
  var out = [];
  (list || []).forEach(function (d) {
    if (!d) return;
    var key = d.driveFileId || d.id;
    if (seen[key]) return;
    seen[key] = true;
    if (!d.webViewLink && d.driveFileId) d.webViewLink = driveFileUrl(d.driveFileId);
    out.push(d);
  });
  return out;
}

function propertyDocsFromRow(p) {
  var docs = [];
  var meta = parseJson(p.metadata_json || p.metadata, {});
  var title = p.title || p.city || p.id;

  if (Array.isArray(meta.documents)) {
    meta.documents.forEach(function (doc, idx) {
      docs.push({
        id: p.id + "_doc_" + idx,
        propertyId: p.id,
        name: doc.fileName || doc.type || "Document bien",
        type: doc.type || doc.group || "immo_property",
        driveFileId: doc.driveFileId || null,
        webViewLink: doc.webViewLink || driveFileUrl(doc.driveFileId),
        uploadedAt: doc.uploadedAt || null,
        status: "deposé",
        source: "immo_property",
        propertyTitle: title,
        driveFolderId: p.drive_folder_id || null,
      });
    });
  }

  if (meta.drive && meta.drive.folderId) {
    docs.push({
      id: p.id + "_drive_meta",
      propertyId: p.id,
      name: "Dossier Drive — " + title,
      type: "drive_folder",
      webViewLink: meta.drive.webViewLink || driveFolderUrl(meta.drive.folderId),
      driveFolderId: meta.drive.folderId,
      source: "immo_property_drive",
      propertyTitle: title,
    });
  }

  parseArr(p.photos_json).forEach(function (photo, idx) {
    if (!photo || (!photo.driveFileId && !photo.webViewLink)) return;
    docs.push({
      id: p.id + "_photo_" + idx,
      propertyId: p.id,
      name: photo.kind === "capture" ? "Capture annonce" : "Photo " + (idx + 1),
      type: photo.kind === "capture" ? "capture" : "photo",
      driveFileId: photo.driveFileId || null,
      webViewLink: photo.webViewLink || driveFileUrl(photo.driveFileId),
      thumbnailLink: photo.thumbnailLink || photo.url || null,
      uploadedAt: photo.uploadedAt || null,
      status: "deposé",
      source: "immo_photo",
      propertyTitle: title,
    });
  });

  if (p.drive_folder_id) {
    docs.push({
      id: p.id + "_drive_folder",
      propertyId: p.id,
      name: "Dossier bien — " + title,
      type: "drive_folder",
      webViewLink: driveFolderUrl(p.drive_folder_id),
      driveFolderId: p.drive_folder_id,
      source: "immo_property_drive",
      propertyTitle: title,
    });
  }

  return docs;
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
  const contactId = url.searchParams.get("contactId") || url.searchParams.get("id");
  if (!contactId) return res.status(400).json({ error: "contactId requis" });

  try {
    const contacts = await sql`
      SELECT id, first_name, last_name, email, drive_folder_id
      FROM crm_contacts
      WHERE id = ${contactId}
        AND (${scope}::text IS NULL OR assigned_to = ${scope})
      LIMIT 1
    `;
    if (!contacts.length) return res.status(404).json({ error: "Contact introuvable" });

    const events = await sql`
      SELECT id, title, extra_data, status, created_at, event_type
      FROM crm_events
      WHERE contact_id = ${contactId}
        AND (event_type = 'document' OR extra_data LIKE '%attachments%')
      ORDER BY created_at DESC
      LIMIT 100
    `;

    var documents = [];
    events.forEach(function (e) {
      documents = documents.concat(parseEventDocs(e));
    });

    const activities = await sql`
      SELECT id, title, body, created_at
      FROM crm_activities
      WHERE contact_id = ${contactId}
        AND activity_type = 'document_upload'
      ORDER BY created_at DESC
      LIMIT 50
    `;

    activities.forEach(function (a) {
      documents.push(activityToDoc(a));
    });

    var propertyDocs = [];
    var propertyFolders = [];
    try {
      const store = require("../immo-properties-store");
      await store.ensureImmoSchema(sql);

      const props = await sql`
        SELECT id, title, city, drive_folder_id, metadata_json, photos_json, lead_id,
               owner_contact_id, buyer_contact_id
        FROM crm_immo_properties
        WHERE owner_contact_id = ${contactId}
           OR buyer_contact_id = ${contactId}
           OR lead_id IN (
             SELECT id FROM site_leads WHERE contact_id = ${contactId}
           )
        ORDER BY updated_at DESC
        LIMIT 30
      `;

      props.forEach(function (p) {
        propertyDocs = propertyDocs.concat(propertyDocsFromRow(p));
        if (p.drive_folder_id) {
          propertyFolders.push({
            propertyId: p.id,
            title: p.title || p.city || p.id,
            driveFolderId: p.drive_folder_id,
            webViewLink: driveFolderUrl(p.drive_folder_id),
          });
        }
      });
    } catch (propErr) {
      console.warn("[crm/contact-documents] properties", propErr.message);
    }

    documents = dedupeDocs(documents.concat(propertyDocs));

    var contactFolderId = contacts[0].drive_folder_id || null;
    var driveFolderWebViewLink = driveFolderUrl(contactFolderId);

    return res.status(200).json({
      ok: true,
      contactId: contactId,
      driveFolderId: contactFolderId,
      driveFolderWebViewLink: driveFolderWebViewLink,
      propertyFolders: propertyFolders,
      documents: documents,
      activities: activities.map(function (a) {
        var meta = parseJson(a.body, {});
        return {
          id: a.id,
          title: a.title,
          createdAt: a.created_at,
          fileName: meta.name || meta.fileName || null,
          type: meta.type || null,
          driveFileId: meta.driveFileId || null,
          webViewLink: meta.webViewLink || driveFileUrl(meta.driveFileId),
        };
      }),
    });
  } catch (e) {
    console.error("[crm/contact-documents]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
