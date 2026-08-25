const { applyApiGuards } = require("../security");
const { requireCrm, contactScopeFilter } = require("../rbac");
const { getSql } = require("../db");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });
  const scope = contactScopeFilter(user);

  try {
    const events = await sql`
      SELECT e.id, e.title, e.extra_data, e.created_at, e.contact_id,
        c.first_name, c.last_name, c.email AS contact_email
      FROM crm_events e
      INNER JOIN crm_contacts c ON c.id = e.contact_id
      WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
        AND e.extra_data IS NOT NULL
      ORDER BY e.created_at DESC
      LIMIT 100
    `;

    const requests = await sql`
      SELECT r.id, r.request_type, r.status, r.description, r.created_at, r.contact_id,
        c.first_name, c.last_name, c.email AS contact_email
      FROM crm_insurance_requests r
      INNER JOIN crm_contacts c ON c.id = r.contact_id
      WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
        AND r.status IN ('En attente', 'pending', 'A traiter')
      ORDER BY r.created_at DESC
      LIMIT 50
    `;

    const quotes = await sql`
      SELECT q.id, q.title, q.status, q.product_type, q.created_at, q.contact_id,
        c.first_name, c.last_name, c.email AS contact_email
      FROM crm_quotes q
      INNER JOIN crm_contacts c ON c.id = q.contact_id
      WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
        AND q.status IN ('brouillon', 'envoye')
      ORDER BY q.updated_at DESC
      LIMIT 50
    `;

    var documents = [];
    events.forEach(function (e) {
      var extra = {};
      try {
        extra = JSON.parse(e.extra_data || "{}");
      } catch (err) {}
      var eventDone =
        e.status === "completed" || e.status === "done" || e.status === "received" || e.status === "completed";
      function labelFor(a) {
        if (eventDone || (a && (a.driveFileId || a.webViewLink))) return "Déposé";
        if (e.status === "pending" || !e.status) return "En attente";
        return e.status;
      }
      var pushed = false;
      (extra.attachments || []).forEach(function (a, i) {
        pushed = true;
        var st = labelFor(a);
        /* Page « en attente » : ignorer les pièces déjà sur Drive */
        if (st === "Déposé") return;
        documents.push({
          id: e.id + "_att_" + i,
          name: a.name || a.label || "Pièce jointe",
          type: a.type || extra.documentType || "Document",
          status: st,
          source: extra.source || "evenement",
          sourceId: e.id,
          contactId: e.contact_id,
          contactName: ((e.first_name || "") + " " + (e.last_name || "")).trim() || e.contact_email,
          createdAt: e.created_at,
          driveFileId: a.driveFileId || null,
          webViewLink: a.webViewLink || null,
          thumbnailLink: a.thumbnailLink || null,
          mimeType: a.mimeType || null,
        });
      });
      if (!pushed && (extra.fileName || extra.drive)) {
        var legacyAtt = {
          driveFileId: (extra.drive && extra.drive.fileId) || null,
          webViewLink: (extra.drive && extra.drive.webViewLink) || null,
        };
        var legacySt = labelFor(legacyAtt);
        if (legacySt !== "Déposé") {
          documents.push({
            id: e.id + "_att_0",
            name: extra.fileName || e.title || "Document",
            type: extra.documentType || "Document",
            status: legacySt,
            source: "portal_upload",
            sourceId: e.id,
            contactId: e.contact_id,
            contactName: ((e.first_name || "") + " " + (e.last_name || "")).trim() || e.contact_email,
            createdAt: e.created_at,
            driveFileId: legacyAtt.driveFileId,
            webViewLink: legacyAtt.webViewLink,
            mimeType: extra.mimeType || null,
          });
        }
      }
    });

    var pendingQuotes = quotes.map(function (q) {
      return {
        id: q.id,
        reference: q.id,
        title: q.title || q.product_type,
        status: q.status,
        contactId: q.contact_id,
        contactName: ((q.first_name || "") + " " + (q.last_name || "")).trim() || q.contact_email,
        createdAt: q.created_at,
      };
    });

    var pendingRequests = requests.map(function (r) {
      return {
        id: r.id,
        name: r.description || r.request_type || "Demande",
        type: r.request_type,
        status: r.status,
        contactId: r.contact_id,
        contactName: ((r.first_name || "") + " " + (r.last_name || "")).trim() || r.contact_email,
        createdAt: r.created_at,
      };
    });

    return res.status(200).json({
      ok: true,
      documents: documents,
      quotes: pendingQuotes,
      requests: pendingRequests,
    });
  } catch (e) {
    console.error("[crm/pending-documents]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
