/**
 * GET /api/crm/contact-documents?contactId=
 * Documents d'un contact pour visualisation CRM (Drive + événements).
 */
const { applyApiGuards } = require("../security");
const { requireCrm, contactScopeFilter } = require("../rbac");
const { getSql } = require("../db");

function parseEventDocs(e) {
  var extra = {};
  try {
    extra = JSON.parse(e.extra_data || "{}");
  } catch (err) {}
  var docs = [];
  if (Array.isArray(extra.attachments)) {
    extra.attachments.forEach(function (a, i) {
      docs.push({
        id: e.id + "_att_" + i,
        eventId: e.id,
        attachmentIndex: i,
        name: a.name || a.label || "Document",
        type: a.type || extra.documentType || "generic",
        mimeType: a.mimeType || null,
        driveFileId: a.driveFileId || null,
        webViewLink: a.webViewLink || null,
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
      attachmentIndex: 0,
      name: extra.fileName,
      type: extra.documentType || "generic",
      driveFileId: (extra.drive && extra.drive.fileId) || null,
      webViewLink: (extra.drive && extra.drive.webViewLink) || null,
      uploadedAt: extra.uploadedAt || e.created_at,
      status: e.status || "pending",
      source: "portal_legacy",
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
      LIMIT 30
    `;

    return res.status(200).json({
      ok: true,
      contactId: contactId,
      driveFolderId: contacts[0].drive_folder_id || null,
      documents: documents,
      activities: activities.map(function (a) {
        var meta = {};
        try {
          meta = JSON.parse(a.body || "{}");
        } catch (e) {}
        return {
          id: a.id,
          title: a.title,
          createdAt: a.created_at,
          fileName: meta.name || meta.fileName || null,
          type: meta.type || null,
          driveFileId: meta.driveFileId || null,
          webViewLink: meta.webViewLink || null,
        };
      }),
    });
  } catch (e) {
    console.error("[crm/contact-documents]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
