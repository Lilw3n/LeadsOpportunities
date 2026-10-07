/**
 * GET /api/crm/universal-search?q= — inspire universalSearchService multisite
 */
const { applyApiGuards, sanitizeSearch } = require("../security");
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

  const url = new URL(req.url, "http://localhost");
  const q = url.searchParams.get("q") ? sanitizeSearch(url.searchParams.get("q")) : null;
  const entity = url.searchParams.get("entity") || "all";
  if (!q || q.length < 2) {
    return res.status(400).json({ error: "Requête min 2 caractères" });
  }
  const pattern = "%" + q + "%";
  const digits = q.replace(/[^\d]/g, "");
  const digitPattern = digits.length >= 6 ? "%" + digits + "%" : null;
  const scope = contactScopeFilter(user);
  const limit = 15;

  try {
    const results = { contacts: [], vehicles: [], contracts: [], claims: [], drivers: [] };

    if (entity === "all" || entity === "contacts") {
      results.contacts = await sql`
        SELECT id, first_name, last_name, email, phone, company, contact_type
        FROM crm_contacts
        WHERE (${scope}::text IS NULL OR assigned_to = ${scope})
          AND (
            LOWER(COALESCE(email,'')) LIKE LOWER(${pattern})
            OR LOWER(COALESCE(phone,'')) LIKE LOWER(${pattern})
            ${digitPattern ? sql`OR regexp_replace(COALESCE(phone,''), '[^0-9]', '', 'g') LIKE ${digitPattern}` : sql``}
            OR LOWER(COALESCE(first_name,'') || ' ' || COALESCE(last_name,'')) LIKE LOWER(${pattern})
            OR LOWER(COALESCE(company,'')) LIKE LOWER(${pattern})
          )
        ORDER BY updated_at DESC
        LIMIT ${limit}
      `;
    }

    if (entity === "all" || entity === "vehicles") {
      results.vehicles = await sql`
        SELECT v.id, v.registration, v.brand, v.model, v.status, v.contact_id,
          c.first_name, c.last_name, c.email
        FROM crm_vehicles v
        INNER JOIN crm_contacts c ON c.id = v.contact_id
        WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
          AND (
            LOWER(COALESCE(v.registration,'')) LIKE LOWER(${pattern})
            OR LOWER(COALESCE(v.brand,'') || ' ' || COALESCE(v.model,'')) LIKE LOWER(${pattern})
          )
        ORDER BY v.updated_at DESC NULLS LAST
        LIMIT ${limit}
      `;
    }

    if (entity === "all" || entity === "contracts") {
      results.contracts = await sql`
        SELECT ct.id, ct.policy_number, ct.contract_type, ct.insurer, ct.status, ct.contact_id,
          c.first_name, c.last_name
        FROM crm_contracts ct
        INNER JOIN crm_contacts c ON c.id = ct.contact_id
        WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
          AND (
            LOWER(COALESCE(ct.policy_number,'')) LIKE LOWER(${pattern})
            OR LOWER(COALESCE(ct.insurer,'')) LIKE LOWER(${pattern})
            OR LOWER(COALESCE(ct.contract_type,'')) LIKE LOWER(${pattern})
          )
        ORDER BY ct.updated_at DESC NULLS LAST
        LIMIT ${limit}
      `;
    }

    if (entity === "all" || entity === "claims") {
      results.claims = await sql`
        SELECT cl.id, cl.claim_type, cl.claim_date, cl.amount, cl.status, cl.contact_id,
          c.first_name, c.last_name
        FROM crm_claims cl
        INNER JOIN crm_contacts c ON c.id = cl.contact_id
        WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
          AND LOWER(COALESCE(cl.claim_type,'')) LIKE LOWER(${pattern})
        ORDER BY cl.claim_date DESC NULLS LAST
        LIMIT ${limit}
      `;
    }

    if (entity === "all" || entity === "drivers") {
      results.drivers = await sql`
        SELECT d.id, d.first_name, d.last_name, d.license_number, d.license_type, d.status, d.contact_id,
          c.first_name AS c_first, c.last_name AS c_last
        FROM crm_drivers d
        INNER JOIN crm_contacts c ON c.id = d.contact_id
        WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
          AND (
            LOWER(COALESCE(d.license_number,'')) LIKE LOWER(${pattern})
            OR LOWER(COALESCE(d.first_name,'') || ' ' || COALESCE(d.last_name,'')) LIKE LOWER(${pattern})
          )
        ORDER BY d.updated_at DESC NULLS LAST
        LIMIT ${limit}
      `;
    }

    const total =
      results.contacts.length +
      results.vehicles.length +
      results.contracts.length +
      results.claims.length +
      results.drivers.length;

    return res.status(200).json({ ok: true, query: q, total: total, results: results });
  } catch (e) {
    console.error("[crm/universal-search]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
