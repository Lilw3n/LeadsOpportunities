const crypto = require("crypto");
const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm, contactScopeFilter, CONTACT_TYPES } = require("../rbac");
const { getSql } = require("../db");
const { buildProfileMetadata, mergeMeta } = require("../crm-profile-meta");
const { newId } = require("../crm-modules-lib");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;

  const parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  const contactType = String(body.contactType || body.contact_type || "prospect").toLowerCase();
  if (CONTACT_TYPES.indexOf(contactType) === -1) {
    return res.status(400).json({ error: "Type contact invalide" });
  }

  const scope = contactScopeFilter(user);
  const contactId = "ct_" + crypto.randomUUID();
  const profileMeta = mergeMeta({}, buildProfileMetadata(body));
  if (body.bank || body.iban || body.accountHolder) {
    profileMeta.bank = {
      accountHolder: body.accountHolder || body.bank?.accountHolder || null,
      iban: body.iban || body.bank?.iban || null,
      bic: body.bic || body.bank?.bic || null,
      isDefault: true,
    };
  }

  try {
    await sql`
      INSERT INTO crm_contacts (
        id, contact_type, first_name, last_name, email, phone, company,
        status, source, assigned_to, notes, metadata, last_activity_at
      ) VALUES (
        ${contactId},
        ${contactType},
        ${body.firstName || body.first_name || null},
        ${body.lastName || body.last_name || null},
        ${body.email ? String(body.email).trim().toLowerCase() : null},
        ${body.phone || null},
        ${body.company || null},
        'active',
        ${body.source || "crm_create_complete"},
        ${scope || body.assignedTo || user.id},
        ${body.notes || null},
        ${JSON.stringify(profileMeta)},
        NOW()
      )
    `;

    const drivers = body.drivers || [];
    for (const d of drivers.slice(0, 10)) {
      if (!d.first_name && !d.last_name) continue;
      const id = newId("drv_");
      await sql`
        INSERT INTO crm_drivers (id, contact_id, first_name, last_name, license_number, license_type, status)
        VALUES (${id}, ${contactId}, ${d.first_name || null}, ${d.last_name || null},
          ${d.license_number || null}, ${d.license_type || "B"}, ${d.status || "Actif"})
      `;
    }

    const vehicles = body.vehicles || [];
    for (const v of vehicles.slice(0, 10)) {
      if (!v.registration && !v.brand) continue;
      const id = newId("veh_");
      await sql`
        INSERT INTO crm_vehicles (id, contact_id, registration, brand, model, year, vehicle_type, status)
        VALUES (${id}, ${contactId}, ${v.registration || null}, ${v.brand || null}, ${v.model || null},
          ${v.year != null ? parseInt(v.year, 10) : null}, ${v.vehicle_type || "VTC / Taxi"}, ${v.status || "En attente"})
      `;
    }

    const claims = body.claims || [];
    for (const c of claims.slice(0, 20)) {
      if (!c.claim_type && !c.claim_date) continue;
      const id = newId("clm_");
      await sql`
        INSERT INTO crm_claims (id, contact_id, claim_type, claim_date, amount, description, status, responsible)
        VALUES (${id}, ${contactId}, ${c.claim_type || null}, ${c.claim_date || null},
          ${c.amount != null ? Number(c.amount) : null}, ${c.description || null},
          ${c.status || "En attente"}, ${c.responsible === true || c.responsible === "true"})
      `;
    }

    await sql`
      INSERT INTO crm_activities (id, contact_id, user_id, activity_type, title, body)
      VALUES (${"act_" + crypto.randomUUID()}, ${contactId}, ${user.id}, 'created',
        'Dossier cree (complet)', ${"Profil: " + (profileMeta.profileKey || "generic")})
    `;

    return res.status(201).json({ ok: true, contactId });
  } catch (e) {
    console.error("[crm/create-complete]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
