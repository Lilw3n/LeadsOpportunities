/**
 * POST /api/crm/document-delete
 * Admin site (Wendy) : suppression totale Drive + CRM.
 * Staff CRM : même logique que client → corbeille (sauf permanent=true réservé admin).
 */
const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm, isSiteAdmin } = require("../rbac");
const { getSql } = require("../db");
const {
  moveToContactTrash,
  drivePermanentDelete,
  markEventDocumentRemoved,
  markPropertyDocumentRemoved,
} = require("../drive-document-lifecycle");

function str(v, max) {
  return String(v == null ? "" : v).trim().slice(0, max || 200);
}

module.exports = async function crmDocumentDelete(req, res) {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await requireCrm(req, res);
  if (!user) return;

  var parsed = parseJsonBody(req, 64 * 1024);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  var body = parsed.body || {};

  var contactId = str(body.contactId || body.contact_id, 80);
  var eventId = str(body.eventId || body.event_id, 80);
  var driveFileId = str(body.driveFileId || body.fileId, 120);
  var propertyId = str(body.propertyId || body.property_id, 80);
  var wantPermanent = body.permanent === true || body.mode === "permanent";

  if (!driveFileId && !eventId) {
    return res.status(400).json({ ok: false, error: "driveFileId ou eventId requis" });
  }

  var admin = isSiteAdmin(user);
  var permanent = wantPermanent && admin;
  if (wantPermanent && !admin) {
    return res.status(403).json({
      ok: false,
      error: "Suppression définitive réservée à l'administrateur site.",
      code: "admin_only",
    });
  }

  var sql = getSql();
  if (!sql) return res.status(500).json({ ok: false, error: "Base indisponible" });

  try {
    if (eventId && !contactId) {
      var evLookup = await sql`SELECT contact_id, extra_data FROM crm_events WHERE id = ${eventId} LIMIT 1`;
      if (evLookup.length) {
        contactId = evLookup[0].contact_id;
        if (!driveFileId) {
          try {
            var extra = typeof evLookup[0].extra_data === "string"
              ? JSON.parse(evLookup[0].extra_data || "{}")
              : evLookup[0].extra_data || {};
            var att = (extra.attachments && extra.attachments[0]) || {};
            driveFileId = att.driveFileId || (extra.drive && extra.drive.fileId) || "";
          } catch (e) {}
        }
      }
    }

    if (!contactId) {
      return res.status(400).json({ ok: false, error: "contactId requis" });
    }

    var driveResult = null;
    if (driveFileId) {
      if (permanent) {
        driveResult = await drivePermanentDelete(driveFileId);
      } else {
        driveResult = await moveToContactTrash(contactId, driveFileId);
      }
      if (driveResult && driveResult.ok === false) {
        return res.status(502).json({ ok: false, error: driveResult.error || "Action Drive impossible" });
      }
    }

    if (eventId) {
      await markEventDocumentRemoved(sql, eventId, {
        permanent: permanent,
        by: user.email || user.id || "crm",
        driveFileId: driveFileId || null,
      });
    }
    if (propertyId && driveFileId) {
      await markPropertyDocumentRemoved(sql, propertyId, driveFileId, { permanent: permanent });
    }

    /* Activités liées */
    if (driveFileId) {
      try {
        await sql`
          INSERT INTO crm_activities (id, contact_id, activity_type, title, body)
          VALUES (
            ${"act_" + require("crypto").randomUUID()},
            ${contactId},
            'document_delete',
            ${permanent ? "Document supprimé définitivement" : "Document déplacé en corbeille"},
            ${JSON.stringify({
              driveFileId: driveFileId,
              eventId: eventId || null,
              permanent: permanent,
              by: user.email || user.id,
              at: new Date().toISOString(),
            })}
          )
        `;
      } catch (actErr) {
        console.warn("[crm/document-delete] activity", actErr.message);
      }
    }

    return res.status(200).json({
      ok: true,
      permanent: permanent,
      softDeleted: !permanent,
      contactId: contactId,
      eventId: eventId || null,
      driveFileId: driveFileId || null,
      drive: driveResult,
      message: permanent
        ? "Document supprimé définitivement du site et de Drive."
        : "Document retiré du site et déplacé dans _corbeille sur Drive.",
    });
  } catch (e) {
    console.error("[crm/document-delete]", e);
    return res.status(500).json({ ok: false, error: e.message || "Erreur suppression" });
  }
};
