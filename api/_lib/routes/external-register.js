/**
 * POST /api/external/register — inscription client externe
 */
const crypto = require("crypto");
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp, isHoneypotFilled } = require("../security");
const { getSql } = require("../db");
const { buildProfileMetadata } = require("../crm-profile-meta");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip = getClientIp(req);
  const rl = rateLimit("ext-register:" + ip, 10, 3600000);
  if (!rl.allowed) return res.status(429).json({ error: "Trop de requetes" });

  const parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};
  if (isHoneypotFilled(body)) return res.status(200).json({ ok: true });

  const email = body.email ? String(body.email).trim().toLowerCase() : "";
  const firstName = body.firstName || body.first_name || "";
  const lastName = body.lastName || body.last_name || "";
  if (!email || !firstName) return res.status(400).json({ error: "Email et prenom requis" });

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  try {
    const existing = await sql`
      SELECT id FROM crm_contacts WHERE LOWER(email) = ${email} LIMIT 1
    `;
    if (existing.length) {
      return res.status(200).json({ ok: true, id: existing[0].id, existing: true });
    }

    const id = "ct_" + crypto.randomUUID();
    const meta = buildProfileMetadata({
      primaryNeed: body.primaryNeed || body.need || "generic",
      source: "external_register",
    });

    await sql`
      INSERT INTO crm_contacts (
        id, contact_type, first_name, last_name, email, phone, company,
        status, source, notes, metadata, last_activity_at
      ) VALUES (
        ${id}, 'prospect',
        ${firstName}, ${lastName || null}, ${email},
        ${body.phone || null}, ${body.company || null},
        'active', 'external_register',
        ${body.notes || "Inscription portail client"},
        ${JSON.stringify(meta)},
        NOW()
      )
    `;

    await sql`
      INSERT INTO crm_activities (id, contact_id, activity_type, title, body)
      VALUES (
        ${"act_" + crypto.randomUUID()}, ${id},
        'created', 'Inscription portail externe', ${email}
      )
    `;

    return res.status(201).json({ ok: true, id: id, existing: false });
  } catch (e) {
    console.error("[external/register]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
