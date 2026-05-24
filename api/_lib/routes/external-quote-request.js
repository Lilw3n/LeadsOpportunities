/**
 * POST /api/external/quote-request
 * Ingestion devis site → contact CRM + demande + evenement (inspire multisite-platform)
 */
const crypto = require("crypto");
const {
  applyApiGuards,
  parseJsonBody,
  isHoneypotFilled,
  rateLimit,
  getClientIp,
} = require("../security");
const { getSql } = require("../db");
const { buildProfileMetadata, mergeMeta } = require("../crm-profile-meta");

function escMeta(obj) {
  return JSON.stringify(obj);
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip = getClientIp(req);
  const rl = rateLimit("ext-quote:" + ip, 20, 3600000);
  if (!rl.allowed) {
    return res.status(429).json({ error: "Trop de requetes" });
  }

  const parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};

  if (isHoneypotFilled(body)) {
    return res.status(200).json({ ok: true });
  }

  const firstName = body.firstName || body.first_name;
  const lastName = body.lastName || body.last_name;
  const email = body.email ? String(body.email).trim().toLowerCase() : null;
  const phone = body.phone || null;

  if (!firstName || !lastName || !email || !phone) {
    return res.status(400).json({ error: "Prenom, nom, email et telephone requis" });
  }

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  try {
    let contactId;
    const existing = await sql`
      SELECT id, metadata FROM crm_contacts
      WHERE LOWER(email) = ${email}
         OR (phone IS NOT NULL AND phone = ${phone})
      LIMIT 1
    `;

    const street = body.street || "";
    const city = body.city || "";
    const postalCode = body.postalCode || body.postal_code || "";
    const address = [street, postalCode, city].filter(Boolean).join(", ");
    const hasCompany = body.hasCompany || body.has_company;
    const companyName = body.companyName || body.company_name;
    const companySiret = body.companySiret || body.company_siret;

    if (existing.length) {
      contactId = existing[0].id;
      var meta = {};
      try {
        meta = existing[0].metadata ? JSON.parse(existing[0].metadata) : {};
      } catch (e) {}
      if (hasCompany && companyName) {
        meta.company = Object.assign(meta.company || {}, {
          name: companyName,
          siret: companySiret || meta.company?.siret,
          activity: body.companyActivity || body.company_activity,
        });
      }
      await sql`
        UPDATE crm_contacts SET
          first_name = COALESCE(${firstName}, first_name),
          last_name = COALESCE(${lastName}, last_name),
          phone = COALESCE(${phone}, phone),
          company = COALESCE(${companyName || null}, company),
          metadata = ${escMeta(meta)},
          last_activity_at = NOW(),
          updated_at = NOW()
        WHERE id = ${contactId}
      `;
    } else {
      contactId = "ct_" + crypto.randomUUID();
      var newMeta = buildProfileMetadata(body);
      newMeta.quoteDetails = {
        vehicleType: body.vehicleType || body.vehicle_type,
        activityType: body.activityType || body.activity_type,
        coverage: body.coverage,
        budget: body.budget,
        address: address,
      };
      if (hasCompany && companyName) {
        newMeta.company = {
          name: companyName,
          siret: companySiret || "",
          activity: body.companyActivity || body.company_activity || "",
        };
      }
      await sql`
        INSERT INTO crm_contacts (
          id, contact_type, first_name, last_name, email, phone, company,
          status, source, notes, metadata, last_activity_at
        ) VALUES (
          ${contactId}, 'prospect', ${firstName}, ${lastName}, ${email}, ${phone},
          ${companyName || null}, 'active',
          ${body.source || "external_website"},
          ${"Devis " + (body.insuranceType || body.vertical || "assurance")},
          ${escMeta(newMeta)},
          NOW()
        )
      `;
    }

    const reqId = "req_" + crypto.randomUUID();
    const description = [
      body.vehicleType && "Vehicule: " + body.vehicleType,
      body.activityType && "Activite: " + body.activityType,
      body.coverage && "Couverture: " + body.coverage,
      body.budget && "Budget: " + body.budget,
      body.page && "Page: " + body.page,
    ]
      .filter(Boolean)
      .join(" · ");

    await sql`
      INSERT INTO crm_insurance_requests (
        id, contact_id, request_type, status, requested_date, description, priority
      ) VALUES (
        ${reqId}, ${contactId}, 'devis', 'En attente',
        ${new Date().toISOString().slice(0, 10)},
        ${description || "Demande de devis externe"},
        ${body.urgency === "high" ? "Haute" : "Moyenne"}
      )
    `;

    const evtId = "evt_" + crypto.randomUUID();
    const extra = JSON.stringify({
      participants: [{ name: firstName + " " + lastName, role: "recipient" }],
      attachments: [],
      urls: [],
      source: body.source || "external",
    });
    await sql`
      INSERT INTO crm_events (
        id, contact_id, event_type, title, description, event_date, status, priority, extra_data
      ) VALUES (
        ${evtId}, ${contactId}, 'note',
        ${"Demande devis — " + (body.insuranceType || body.vertical || "assurance")},
        ${description || "Nouvelle demande depuis le site"},
        ${new Date().toISOString().slice(0, 10)},
        'pending', 'medium', ${extra}
      )
    `;

    await sql`
      INSERT INTO crm_activities (id, contact_id, activity_type, title, body)
      VALUES (
        ${"act_" + crypto.randomUUID()}, ${contactId},
        'quote_request', 'Demande devis externe',
        ${description || email}
      )
    `;

    return res.status(201).json({
      ok: true,
      contactId,
      requestId: reqId,
      eventId: evtId,
    });
  } catch (e) {
    console.error("[external/quote-request]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
