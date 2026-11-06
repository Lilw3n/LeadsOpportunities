/**
 * GET /api/crm/universal-search?q= — inspire universalSearchService multisite
 */
const { applyApiGuards, sanitizeSearch } = require("../security");
const { requireCrm, contactScopeFilter } = require("../rbac");
const { getSql } = require("../db");

const ACCENTS = "àâäáãéèêëîïíôöóõùûüúçñ";
const PLAIN = "aaaaaeeeeiiioooouuuucn";

/** « Sébastien LAUZIS » → ["sebastien", "lauzis"] : ordre et accents indifférents */
function nameTokens(q) {
  return String(q)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[\s,;]+/)
    .filter(Boolean)
    .slice(0, 5);
}

function payloadObject(raw) {
  if (raw && typeof raw === "object") return raw;
  try {
    return JSON.parse(raw) || {};
  } catch (e) {
    return {};
  }
}

function leadName(p) {
  var name = [p.firstName || p.first_name || p.prenom, p.lastName || p.last_name || p.nom]
    .filter(Boolean)
    .join(" ")
    .trim();
  return String(name || p.fullName || p.full_name || p.name || "").slice(0, 120);
}

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
  const tokens = nameTokens(q);

  try {
    const results = { contacts: [], vehicles: [], contracts: [], claims: [], drivers: [], imported: [], leads: [] };

    if (entity === "all" || entity === "contacts") {
      results.contacts = await sql`
        SELECT id, first_name, last_name, email, phone, company, contact_type
        FROM crm_contacts
        WHERE (${scope}::text IS NULL OR assigned_to = ${scope})
          AND (
            LOWER(COALESCE(email,'')) LIKE LOWER(${pattern})
            OR LOWER(COALESCE(phone,'')) LIKE LOWER(${pattern})
            OR (${digitPattern}::text IS NOT NULL AND regexp_replace(COALESCE(phone,''), '[^0-9]', '', 'g') LIKE ${digitPattern})
            OR LOWER(COALESCE(first_name,'') || ' ' || COALESCE(last_name,'')) LIKE LOWER(${pattern})
            OR LOWER(COALESCE(company,'')) LIKE LOWER(${pattern})
            OR NOT EXISTS (
              SELECT 1 FROM unnest(${tokens}::text[]) t
              WHERE translate(LOWER(COALESCE(first_name,'') || ' ' || COALESCE(last_name,'') || ' ' || COALESCE(company,'')), ${ACCENTS}, ${PLAIN})
                NOT LIKE '%' || t || '%'
            )
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

    // Leads importés (fichiers de contrats / devis) : même accès que la page crm-leads-import
    if (entity === "all" || entity === "leads") {
      try {
        results.imported = await sql`
          SELECT id, full_name, email, phone, product, segment, batch, status
          FROM imported_leads
          WHERE (${digitPattern}::text IS NOT NULL AND regexp_replace(COALESCE(phone,''), '[^0-9]', '', 'g') LIKE ${digitPattern}) OR
            NOT EXISTS (
              SELECT 1 FROM unnest(${tokens}::text[]) t
              WHERE translate(LOWER(COALESCE(full_name,'') || ' ' || COALESCE(email,'') || ' ' || COALESCE(phone,'')), ${ACCENTS}, ${PLAIN})
                NOT LIKE '%' || t || '%'
            )
          ORDER BY full_name ASC
          LIMIT ${limit}
        `;
      } catch (importErr) {
        console.warn("[crm/universal-search] imported_leads", importErr.message);
      }

      // Leads du site : le nom est dans le formulaire (payload). Réservé à qui voit tout le CRM.
      if (scope == null) {
        try {
          const rows = await sql`
            SELECT id, created_at, email, phone, vertical, source, status, payload
            FROM site_leads
            WHERE (${digitPattern}::text IS NOT NULL AND regexp_replace(COALESCE(phone,''), '[^0-9]', '', 'g') LIKE ${digitPattern}) OR
              NOT EXISTS (
                SELECT 1 FROM unnest(${tokens}::text[]) t
                WHERE translate(LOWER(COALESCE(email,'') || ' ' || COALESCE(phone,'') || ' ' || COALESCE(payload::text,'')), ${ACCENTS}, ${PLAIN})
                  NOT LIKE '%' || t || '%'
              )
            ORDER BY created_at DESC
            LIMIT ${limit}
          `;
          results.leads = rows.map(function (r) {
            const p = payloadObject(r.payload);
            return {
              id: r.id,
              created_at: r.created_at,
              name: leadName(p),
              email: r.email || p.email || "",
              phone: r.phone || p.phone || p.telephone || "",
              vertical: r.vertical,
              source: r.source,
              status: r.status,
            };
          });
        } catch (leadErr) {
          console.warn("[crm/universal-search] site_leads", leadErr.message);
        }
      }
    }

    const total =
      results.imported.length +
      results.leads.length +
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
