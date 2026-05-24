/**
 * POST /api/crm/document-approve — inspire admin/documents/approve multisite
 */
const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm, contactScopeFilter } = require("../rbac");
const { getSql } = require("../db");
const { uploadTextFile } = require("../drive-upload-core");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;
  if (user.role !== "admin" && user.role !== "manager") {
    return res.status(403).json({ error: "Permission documents.approve requise" });
  }

  const parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};
  const documentId = body.documentId || body.id;
  const action = body.action;
  const docType = body.type || body.docType || "quote";

  if (!documentId || !action) {
    return res.status(400).json({ error: "documentId et action requis" });
  }
  if (action !== "approve" && action !== "reject") {
    return res.status(400).json({ error: "action: approve ou reject" });
  }

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });
  const scope = contactScopeFilter(user);
  const newStatus = action === "approve" ? "valide" : "refuse";

  try {
    if (docType === "quote") {
      const rows = await sql`
        UPDATE crm_quotes q SET status = ${newStatus === "valide" ? "signe" : "refuse"}, updated_at = NOW()
        FROM crm_contacts c
        WHERE q.id = ${documentId} AND c.id = q.contact_id
          AND (${scope}::text IS NULL OR c.assigned_to = ${scope})
        RETURNING q.id, q.title, q.product_type, q.contact_id
      `;
      if (!rows.length) return res.status(404).json({ error: "Devis introuvable" });

      var driveResult = null;
      if (action === "approve") {
        var q = rows[0];
        var archive = JSON.stringify(
          {
            type: "quote_approval",
            documentId: documentId,
            title: q.title,
            productType: q.product_type,
            contactId: q.contact_id,
            approvedBy: user.email || user.id,
            approvedAt: new Date().toISOString(),
          },
          null,
          2
        );
        driveResult = await uploadTextFile({
          fileName: "devis-" + documentId + "-approuve.json",
          content: archive,
          mimeType: "application/json",
        });
      }
      return res.status(200).json({
        ok: true,
        message: action === "approve" ? "Document approuvé" : "Document rejeté",
        drive: driveResult,
      });
    }

    if (docType === "request") {
      const st = action === "approve" ? "Traité" : "Refusé";
      const rows = await sql`
        UPDATE crm_insurance_requests r SET status = ${st}
        FROM crm_contacts c
        WHERE r.id = ${documentId} AND c.id = r.contact_id
          AND (${scope}::text IS NULL OR c.assigned_to = ${scope})
        RETURNING r.id, r.name, r.contact_id
      `;
      if (!rows.length) return res.status(404).json({ error: "Demande introuvable" });

      var reqDrive = null;
      if (action === "approve") {
        var r0 = rows[0];
        reqDrive = await uploadTextFile({
          fileName: "demande-" + documentId + "-approuvee.json",
          content: JSON.stringify(
            {
              type: "request_approval",
              documentId: documentId,
              name: r0.name,
              contactId: r0.contact_id,
              approvedBy: user.email || user.id,
              approvedAt: new Date().toISOString(),
            },
            null,
            2
          ),
          mimeType: "application/json",
        });
      }
      return res.status(200).json({
        ok: true,
        message: action === "approve" ? "Document approuvé" : "Document rejeté",
        drive: reqDrive,
      });
    }

    return res.status(400).json({ error: "type: quote ou request" });
  } catch (e) {
    console.error("[crm/document-approve]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
