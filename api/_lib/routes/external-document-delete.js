/**
 * POST /api/external/document-delete
 * Client : retire le doc du site + déplace le fichier Drive vers _corbeille/
 */
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");
const { getSql } = require("../db");
const {
  moveToContactTrash,
  markEventDocumentRemoved,
  markPropertyDocumentRemoved,
  drivePreviewUrl,
} = require("../drive-document-lifecycle");

function str(v, max) {
  return String(v == null ? "" : v).trim().slice(0, max || 200);
}

module.exports = async function externalDocumentDelete(req, res) {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  var ip = getClientIp(req);
  var rl = rateLimit("ext-doc-del:" + ip, 30, 60 * 60 * 1000);
  if (!rl.allowed) return res.status(429).json({ error: "Trop de requêtes" });

  var parsed = parseJsonBody(req, 64 * 1024);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  var body = parsed.body || {};

  var email = str(body.email, 320).toLowerCase();
  var contactId = str(body.contactId || body.contact_id, 80);
  var eventId = str(body.eventId || body.event_id, 80);
  var driveFileId = str(body.driveFileId || body.fileId, 120);
  var propertyId = str(body.propertyId || body.property_id, 80);

  if (!driveFileId && !eventId) {
    return res.status(400).json({ ok: false, error: "driveFileId ou eventId requis" });
  }
  if (!email && !contactId) {
    return res.status(400).json({ ok: false, error: "email ou contactId requis" });
  }

  var sql = getSql();
  if (!sql) return res.status(500).json({ ok: false, error: "Base indisponible" });

  try {
    var contact = null;
    if (contactId) {
      var byId = await sql`
        SELECT id, email, first_name, last_name FROM crm_contacts WHERE id = ${contactId} LIMIT 1
      `;
      contact = byId[0] || null;
    }
    if (!contact && email) {
      var byMail = await sql`
        SELECT id, email, first_name, last_name FROM crm_contacts WHERE LOWER(email) = ${email} LIMIT 1
      `;
      contact = byMail[0] || null;
    }
    if (!contact) return res.status(404).json({ ok: false, error: "Dossier introuvable" });

    if (eventId) {
      var ev = await sql`
        SELECT id, contact_id, extra_data FROM crm_events
        WHERE id = ${eventId} AND contact_id = ${contact.id} LIMIT 1
      `;
      if (!ev.length) return res.status(403).json({ ok: false, error: "Document non autorisé" });
      if (!driveFileId) {
        try {
          var extra = typeof ev[0].extra_data === "string"
            ? JSON.parse(ev[0].extra_data || "{}")
            : ev[0].extra_data || {};
          var att = (extra.attachments && extra.attachments[0]) || {};
          driveFileId = att.driveFileId || (extra.drive && extra.drive.fileId) || "";
        } catch (e) {}
      }
    }

    var driveResult = null;
    if (driveFileId) {
      driveResult = await moveToContactTrash(contact.id, driveFileId);
      if (driveResult && driveResult.ok === false) {
        return res.status(502).json({ ok: false, error: driveResult.error || "Corbeille Drive impossible" });
      }
    }

    if (eventId) {
      await markEventDocumentRemoved(sql, eventId, {
        permanent: false,
        by: "client",
        driveFileId: driveFileId || null,
      });
    }
    if (propertyId && driveFileId) {
      await markPropertyDocumentRemoved(sql, propertyId, driveFileId, { permanent: false });
    }

    return res.status(200).json({
      ok: true,
      softDeleted: true,
      contactId: contact.id,
      eventId: eventId || null,
      driveFileId: driveFileId || null,
      drive: driveResult,
      message: "Document retiré du dossier — déplacé dans la corbeille Drive (_corbeille).",
    });
  } catch (e) {
    console.error("[external/document-delete]", e);
    return res.status(500).json({ ok: false, error: e.message || "Erreur suppression" });
  }
};
