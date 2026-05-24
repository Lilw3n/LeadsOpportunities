/**
 * POST /api/external/claim — déclaration sinistre portail client
 */
const crypto = require("crypto");
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");
const { getSql } = require("../db");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip = getClientIp(req);
  const rl = rateLimit("ext-claim:" + ip, 10, 3600000);
  if (!rl.allowed) return res.status(429).json({ error: "Trop de requetes" });

  const parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};
  const email = body.email ? String(body.email).trim().toLowerCase() : "";
  const claimType = body.claimType || body.type || "Sinistre";
  const description = body.description || "";
  const claimDate = body.claimDate || new Date().toISOString().slice(0, 10);

  if (!email || !description) {
    return res.status(400).json({ error: "email et description requis" });
  }

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  try {
    const contacts = await sql`
      SELECT id FROM crm_contacts WHERE LOWER(email) = ${email} LIMIT 1
    `;
    if (!contacts.length) return res.status(404).json({ error: "Dossier client introuvable" });

    const contactId = contacts[0].id;
    const claimId = "clm_" + crypto.randomUUID();
    const amount = body.amount != null ? Number(body.amount) : null;

    await sql`
      INSERT INTO crm_claims (
        id, contact_id, claim_type, claim_date, amount, description, status
      ) VALUES (
        ${claimId}, ${contactId}, ${claimType}, ${claimDate},
        ${amount}, ${description}, ${"Déclaré client"}
      )
    `;

    const evtId = "evt_" + crypto.randomUUID();
    await sql`
      INSERT INTO crm_events (
        id, contact_id, event_type, title, description, event_date, status, priority, extra_data
      ) VALUES (
        ${evtId}, ${contactId}, 'note',
        ${"Sinistre déclaré — " + claimType},
        ${description},
        ${claimDate}, 'pending', 'high',
        ${JSON.stringify({ source: "external_portal", claimId: claimId })}
      )
    `;

    await sql`
      INSERT INTO crm_activities (id, contact_id, activity_type, title, body)
      VALUES (
        ${"act_" + crypto.randomUUID()}, ${contactId},
        'claim_declared', 'Sinistre déclaré en ligne', ${description.slice(0, 500)}
      )
    `;

    return res.status(201).json({ ok: true, claimId: claimId, eventId: evtId, message: "Sinistre enregistré" });
  } catch (e) {
    console.error("[external/claim]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
