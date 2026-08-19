/**
 * GET /api/crm/contact-documents?contactId=
 * Documents d'un contact pour visualisation CRM (Drive + événements + biens immo).
 */
const { applyApiGuards } = require("../security");
const { requireCrm, contactScopeFilter } = require("../rbac");
const { getSql } = require("../db");
const { resolveFolderWebLink, isValidDriveId, fallbackFolderUrl, isSimulatedDriveId } = require("../drive-share");
const { ensureClientDriveFolders } = require("../drive-folders");
const { ensurePropertyDriveFolders } = require("../immo-drive");
const { isDriveConfigured, isDriveUploadConfigured, getRootFolderId } = require("../google-drive-auth");

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
  return fallbackFolderUrl(folderId);
}

function driveFileUrl(fileId) {
  if (isSimulatedDriveId(fileId)) return null;
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
  var simulated = isSimulatedDriveId(fileId);
  return {
    id: "act_" + a.id,
    activityId: a.id,
    name: meta.name || meta.fileName || a.title || "Document",
    type: meta.type || meta.documentType || "document_upload",
    mimeType: meta.mimeType || null,
    driveFileId: simulated ? null : fileId,
    webViewLink: simulated ? null : meta.webViewLink || driveFileUrl(fileId),
    thumbnailLink: meta.thumbnailLink || null,
    uploadedAt: meta.uploadedAt || a.created_at,
    status: simulated ? "archivé CRM (Drive non configuré)" : "deposé",
    source: meta.source || "activite",
    propertyId: meta.propertyId || null,
    simulated: simulated,
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

      for (var pi = 0; pi < props.length; pi++) {
        var p = props[pi];
        propertyDocs = propertyDocs.concat(propertyDocsFromRow(p));
        var propFolderId = p.drive_folder_id || null;
        if (!isValidDriveId(propFolderId) && isDriveUploadConfigured()) {
          try {
            var ensuredProp = await ensurePropertyDriveFolders({
              id: p.id,
              title: p.title,
              city: p.city,
              postal_code: p.postal_code,
              drive_folder_id: p.drive_folder_id,
            });
            if (ensuredProp && ensuredProp.folderId) {
              propFolderId = ensuredProp.folderId;
              await sql`
                UPDATE crm_immo_properties
                SET drive_folder_id = ${propFolderId}, updated_at = NOW()
                WHERE id = ${p.id} AND drive_folder_id IS NULL
              `;
            }
          } catch (ensurePropErr) {
            console.warn("[crm/contact-documents] ensure property folder", ensurePropErr.message);
          }
        }
        if (isValidDriveId(propFolderId)) {
          var resolvedProp = await resolveFolderWebLink(propFolderId, { share: true });
          propertyFolders.push({
            propertyId: p.id,
            title: p.title || p.city || p.id,
            driveFolderId: propFolderId,
            webViewLink: resolvedProp.webViewLink || driveFolderUrl(propFolderId),
          });
        }
      }
    } catch (propErr) {
      console.warn("[crm/contact-documents] properties", propErr.message);
    }

    documents = dedupeDocs(documents.concat(propertyDocs));

    var contactFolderId = contacts[0].drive_folder_id || null;
    if (!isValidDriveId(contactFolderId)) {
      try {
        var ensuredContact = await ensureClientDriveFolders(contactId);
        if (ensuredContact && ensuredContact.folderId) {
          contactFolderId = ensuredContact.folderId;
        }
      } catch (ensureErr) {
        console.warn("[crm/contact-documents] ensure folder", ensureErr.message);
      }
    }

    var driveFolderWebViewLink = null;
    if (isValidDriveId(contactFolderId)) {
      var resolvedContact = await resolveFolderWebLink(contactFolderId, { share: true });
      driveFolderWebViewLink = resolvedContact.webViewLink || driveFolderUrl(contactFolderId);
    }

    var simulatedCount = documents.filter(function (d) {
      return d.simulated || isSimulatedDriveId(d.driveFileId);
    }).length;
    var rootId = getRootFolderId();
    var rootFolderLink = rootId ? driveFolderUrl(rootId) : null;

    return res.status(200).json({
      ok: true,
      contactId: contactId,
      driveFolderId: contactFolderId,
      driveFolderWebViewLink: driveFolderWebViewLink,
      propertyFolders: propertyFolders,
      documents: documents,
      driveConfigured: isDriveConfigured() && !!rootId,
      uploadConfigured: isDriveUploadConfigured(),
      rootFolderLink: rootFolderLink,
      simulatedDocumentCount: simulatedCount,
      setupUrl: "https://www.leadsopportunities.fr/test-drive.html",
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
