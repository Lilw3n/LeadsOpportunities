/**
 * GET/PATCH /api/external/profile — profil portail sécurisé
 */
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");
const { getSql } = require("../db");
const {
  ensureExternalPortalSchema,
  requireExternalAccount,
  parseMeta,
  stringifyMeta,
  normalizePortalRole,
  createPortalActivity,
} = require("../external-portal");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET" && req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = getClientIp(req);
  const rl = rateLimit("ext-profile:" + ip, 15, 3600000);
  if (!rl.allowed) return res.status(429).json({ error: "Trop de requetes" });

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  try {
    await ensureExternalPortalSchema(sql);
    const account = await requireExternalAccount(req, res, sql);
    if (!account) return;
    const contactId = account.linked_contact_id;

    if (req.method === "PATCH") {
      const parsed = parseJsonBody(req);
      if (parsed.error) return res.status(400).json({ error: parsed.error });
      const body = parsed.body || {};
      const currentMeta = parseMeta(account.metadata);
      const portal = Object.assign({}, currentMeta.portal || {});
      if (body.portalRole) portal.portalRole = normalizePortalRole(body.portalRole);
      if (body.acquisitionStage != null) portal.acquisitionStage = String(body.acquisitionStage || "").trim().slice(0, 80) || null;
      if (body.preferredCity != null) portal.preferredCity = String(body.preferredCity || "").trim().slice(0, 120) || null;
      if (body.budget != null) portal.budget = String(body.budget || "").trim().slice(0, 120) || null;
      if (body.portalNotes != null) portal.notes = String(body.portalNotes || "").trim().slice(0, 1200) || null;
      const nextMeta = Object.assign({}, currentMeta, { portal: portal });

      const fullName = String(body.fullName || account.full_name || "").trim();
      await sql`
        UPDATE users
        SET full_name = ${fullName || null},
            phone = ${body.phone != null ? String(body.phone || "").trim() || null : account.phone || null},
            portal_role = ${portal.portalRole || account.portal_role || "visitor"},
            updated_at = NOW()
        WHERE id = ${account.id}
      `;
      await sql`
        UPDATE crm_contacts
        SET first_name = COALESCE(${String(body.firstName || "").trim() || null}, first_name),
            last_name = COALESCE(${String(body.lastName || "").trim() || null}, last_name),
            phone = ${body.phone != null ? String(body.phone || "").trim() || null : account.phone || null},
            company = ${body.company != null ? String(body.company || "").trim() || null : account.company || null},
            contact_type = COALESCE(${body.contactType ? String(body.contactType).trim().toLowerCase() : null}, contact_type),
            metadata = ${stringifyMeta(nextMeta)},
            updated_at = NOW(),
            last_activity_at = NOW()
        WHERE id = ${contactId}
      `;
      await createPortalActivity(sql, contactId, "Profil portail mis à jour", body.fullName || account.email);
    }

    const contacts = await sql`
      SELECT id, first_name, last_name, email, phone, company, contact_type, status, created_at, metadata
      FROM crm_contacts
      WHERE id = ${contactId}
      LIMIT 1
    `;
    const c = contacts[0];
    const meta = parseMeta(c.metadata);
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
    const visits = await sql`
      SELECT
        vf.id, vf.event_id, vf.property_ref, vf.visit_type, vf.rating, vf.interested,
        vf.would_offer, vf.budget_note, vf.comments, vf.visitor_contacts_json,
        vf.created_at, e.title, e.event_date, e.event_time
      FROM crm_visit_feedback vf
      LEFT JOIN crm_events e ON e.id = vf.event_id
      WHERE vf.contact_id = ${c.id}
      ORDER BY COALESCE(e.event_date::text, '') DESC, vf.created_at DESC
      LIMIT 20
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
        portalRole: normalizePortalRole(account.portal_role || (meta.portal || {}).portalRole),
        portalStatus: account.portal_status || "active",
        status: c.status,
        memberSince: c.created_at,
        portal: meta.portal || {},
      },
      stats: {
        contractsTotal: contracts.length,
        contractsActive: activeContracts.length,
        claimsTotal: claims.length,
        vehiclesTotal: vehicles.length,
        quotesTotal: quotes.length,
        requestsTotal: requests.length,
        visitsTotal: visits.length,
      },
      requests: requests,
      quotes: quotes,
      contracts: contracts,
      claims: claims,
      vehicles: vehicles,
      activities: activities,
      visits: visits.map(function (v) {
        var visitorContacts = [];
        try {
          visitorContacts = v.visitor_contacts_json ? JSON.parse(v.visitor_contacts_json) : [];
        } catch (e) {}
        return {
          id: v.id,
          eventId: v.event_id,
          title: v.title || v.property_ref || "Visite",
          eventDate: v.event_date,
          eventTime: v.event_time,
          propertyRef: v.property_ref || "",
          visitType: v.visit_type,
          rating: v.rating,
          interested: v.interested,
          wouldOffer: v.would_offer,
          budgetNote: v.budget_note || "",
          comments: v.comments || "",
          visitorContacts: visitorContacts,
          createdAt: v.created_at,
        };
      }),
    });
  } catch (e) {
    console.error("[external/profile]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
