/**
 * POST /api/external/upload — dépôt document portail client
 */
const crypto = require("crypto");
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");
const { getSql } = require("../db");
const { uploadTextFile } = require("../drive-upload-core");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip = getClientIp(req);
  const rl = rateLimit("ext-upload:" + ip, 15, 3600000);
  if (!rl.allowed) return res.status(429).json({ error: "Trop de requetes" });

  const parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};
  const email = body.email ? String(body.email).trim().toLowerCase() : "";
  const fileName = body.fileName || body.name;
  const description = body.description || "";

  if (!email || !fileName) {
    return res.status(400).json({ error: "email et fileName requis" });
  }

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  try {
    const contacts = await sql`
      SELECT id, first_name, last_name FROM crm_contacts WHERE LOWER(email) = ${email} LIMIT 1
    `;
    if (!contacts.length) return res.status(404).json({ error: "Dossier client introuvable" });

    const c = contacts[0];
    var driveResult = null;
    if (body.content) {
      driveResult = await uploadTextFile({
        fileName: fileName,
        content: typeof body.content === "string" ? body.content : JSON.stringify(body.content),
        mimeType: body.mimeType || "text/plain",
      });
    }

    const docMeta = JSON.stringify({
      fileName: fileName,
      documentType: body.documentType || "generic",
      description: description,
      drive: driveResult,
      uploadedAt: new Date().toISOString(),
    });

    await sql`
      INSERT INTO crm_activities (id, contact_id, activity_type, title, body)
      VALUES (
        ${"act_" + crypto.randomUUID()}, ${c.id},
        'document_upload', ${"Document déposé — " + fileName}, ${docMeta}
      )
    `;

    const evtId = "evt_" + crypto.randomUUID();
    await sql`
      INSERT INTO crm_events (
        id, contact_id, event_type, title, description, event_date, status, priority, extra_data
      ) VALUES (
        ${evtId}, ${c.id}, 'document',
        ${"Pièce jointe — " + fileName},
        ${description || "Document déposé via portail client"},
        ${new Date().toISOString().slice(0, 10)}, 'pending', 'medium', ${docMeta}
      )
    `;

    return res.status(201).json({
      ok: true,
      eventId: evtId,
      drive: driveResult,
      message: "Document enregistré",
    });
  } catch (e) {
    console.error("[external/upload]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
