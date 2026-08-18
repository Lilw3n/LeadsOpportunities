/**
 * GET /api/external/documents-list?email=&contactId=
 * Liste des documents déposés pour affichage client (parcours devis).
 */
const { applyApiGuards, rateLimit, getClientIp } = require("../security");
const { getSql } = require("../db");
const { verifyUploadToken } = require("../upload-token");

function parseAttachments(extraRaw, event) {
  var extra = {};
  try {
    extra = JSON.parse(extraRaw || "{}");
  } catch (e) {}
  var out = [];
  if (Array.isArray(extra.attachments)) {
    extra.attachments.forEach(function (a) {
      out.push({
        name: a.name || a.label || event.title,
        type: a.type || extra.documentType || "generic",
        mimeType: a.mimeType || null,
        driveFileId: a.driveFileId || (a.drive && a.drive.fileId) || null,
        webViewLink: a.webViewLink || (a.drive && a.drive.webViewLink) || null,
        thumbnailLink: a.thumbnailLink || null,
        uploadedAt: a.uploadedAt || event.created_at,
        eventId: event.id,
        status: event.status || "pending",
      });
    });
  } else if (extra.fileName || extra.drive) {
    out.push({
      name: extra.fileName || event.title,
      type: extra.documentType || "generic",
      mimeType: extra.mimeType || null,
      driveFileId: (extra.drive && extra.drive.fileId) || null,
      webViewLink: (extra.drive && extra.drive.webViewLink) || null,
      uploadedAt: extra.uploadedAt || event.created_at,
      eventId: event.id,
      status: event.status || "pending",
    });
  }
  return out;
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const ip = getClientIp(req);
  const rl = rateLimit("ext-docs:" + ip, 60, 3600000);
  if (!rl.allowed) return res.status(429).json({ error: "Trop de requetes" });

  const url = new URL(req.url, "http://localhost");
  const email = (url.searchParams.get("email") || "").trim().toLowerCase();
  const contactId = url.searchParams.get("contactId") || url.searchParams.get("contact_id");
  const uploadToken =
    url.searchParams.get("uploadToken") ||
    url.searchParams.get("upload_token") ||
    (req.headers["x-upload-token"] ? String(req.headers["x-upload-token"]) : null);

  if (!email && !contactId) {
    return res.status(400).json({ error: "email ou contactId requis" });
  }

  const decoded = verifyUploadToken(uploadToken);
  if (!decoded) {
    return res.status(401).json({ error: "Token upload requis pour consulter les documents" });
  }

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  try {
    var contact = null;
    if (contactId) {
      const rows = await sql`SELECT id, email, first_name, last_name FROM crm_contacts WHERE id = ${contactId} LIMIT 1`;
      contact = rows[0] || null;
    } else {
      const rows = await sql`SELECT id, email, first_name, last_name FROM crm_contacts WHERE LOWER(email) = ${email} LIMIT 1`;
      contact = rows[0] || null;
    }
    if (!contact) return res.status(404).json({ error: "Dossier introuvable" });
    if (decoded.email !== String(contact.email).toLowerCase()) {
      return res.status(403).json({ error: "Acces refuse" });
    }

    const events = await sql`
      SELECT id, title, extra_data, status, created_at
      FROM crm_events
      WHERE contact_id = ${contact.id}
        AND event_type = 'document'
      ORDER BY created_at DESC
      LIMIT 50
    `;

    var documents = [];
    events.forEach(function (e) {
      documents = documents.concat(parseAttachments(e.extra_data, e));
    });

    return res.status(200).json({
      ok: true,
      contactId: contact.id,
      email: contact.email,
      documents: documents,
    });
  } catch (e) {
    console.error("[external/documents-list]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
