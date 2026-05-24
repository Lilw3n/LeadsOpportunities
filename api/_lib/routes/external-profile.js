/**
 * POST /api/external/profile — profil client par email (inspire dashboard/external/profile)
 */
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");
const { getSql } = require("../db");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip = getClientIp(req);
  const rl = rateLimit("ext-profile:" + ip, 15, 3600000);
  if (!rl.allowed) return res.status(429).json({ error: "Trop de requetes" });

  const parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const email = parsed.body && parsed.body.email ? String(parsed.body.email).trim().toLowerCase() : "";
  if (!email || email.indexOf("@") < 1) return res.status(400).json({ error: "Email invalide" });

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  try {
    const contacts = await sql`
      SELECT id, first_name, last_name, email, phone, company, contact_type, status, created_at
      FROM crm_contacts
      WHERE LOWER(email) = ${email}
      ORDER BY updated_at DESC
      LIMIT 1
    `;
    if (!contacts.length) {
      return res.status(404).json({ error: "Aucun dossier trouvé pour cet email" });
    }
    const c = contacts[0];
    const requests = await sql`
      SELECT id, request_type, status, product_type, created_at
      FROM crm_insurance_requests
      WHERE contact_id = ${c.id}
      ORDER BY created_at DESC
      LIMIT 10
    `;
    const quotes = await sql`
      SELECT id, title, product_type, status, premium_estimate, created_at
      FROM crm_quotes
      WHERE contact_id = ${c.id}
      ORDER BY updated_at DESC
      LIMIT 10
    `;
    const contracts = await sql`
      SELECT id, policy_number, contract_type, insurer, status, premium, start_date, end_date
      FROM crm_contracts
      WHERE contact_id = ${c.id}
      ORDER BY end_date DESC NULLS LAST
      LIMIT 10
    `;
    const claims = await sql`
      SELECT id, claim_type, claim_date, amount, status
      FROM crm_claims
      WHERE contact_id = ${c.id}
      ORDER BY claim_date DESC NULLS LAST
      LIMIT 10
    `;
    const vehicles = await sql`
      SELECT id, registration, brand, model, year, vehicle_type, status
      FROM crm_vehicles
      WHERE contact_id = ${c.id}
      ORDER BY updated_at DESC
      LIMIT 10
    `;
    const activities = await sql`
      SELECT id, activity_type, title, body, created_at
      FROM crm_activities
      WHERE contact_id = ${c.id}
      ORDER BY created_at DESC
      LIMIT 8
    `;

    const activeContracts = contracts.filter(function (ct) {
      var s = String(ct.status || "").toLowerCase();
      return s.indexOf("actif") >= 0 || s.indexOf("active") >= 0 || s === "en cours";
    });

    return res.status(200).json({
      ok: true,
      profile: {
        id: c.id,
        firstName: c.first_name,
        lastName: c.last_name,
        email: c.email,
        phone: c.phone,
        company: c.company,
        contactType: c.contact_type,
        status: c.status,
        memberSince: c.created_at,
      },
      stats: {
        contractsTotal: contracts.length,
        contractsActive: activeContracts.length,
        claimsTotal: claims.length,
        vehiclesTotal: vehicles.length,
        quotesTotal: quotes.length,
        requestsTotal: requests.length,
      },
      requests: requests,
      quotes: quotes,
      contracts: contracts,
      claims: claims,
      vehicles: vehicles,
      activities: activities,
    });
  } catch (e) {
    console.error("[external/profile]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
