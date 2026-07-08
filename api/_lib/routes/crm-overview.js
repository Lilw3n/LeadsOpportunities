const { applyApiGuards } = require("../security");
const { requireCrm } = require("../rbac");
const { getSql } = require("../db");

async function safeQuery(label, fn, fallback) {
  try {
    return await fn();
  } catch (e) {
    console.warn("[crm/overview] " + label + ":", e.message);
    return fallback;
  }
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
  const user = await requireCrm(req, res);
  if (!user) return;

  const sql = getSql();
  if (!sql) {
    return res.status(200).json({
      ok: true,
      partial: true,
      databaseConfigured: false,
      diagnostics: {
        hint: "DATABASE_URL manquant sur Vercel — configurez Neon puis redéployez.",
      },
      contacts: { prospect: 0, client: 0, apporteur: 0 },
      contactsTotal: 0,
      leadsTotal: 0,
      leadsWeek: 0,
      staffCount: 0,
      quotesOpen: 0,
      contractsSigned: 0,
      claimsActive: 0,
      newClients: 0,
    });
  }

  const scope = user.crmRole === "apporteur" ? user.id : null;

  const contacts = await safeQuery(
    "contacts",
    function () {
      return sql`
        SELECT contact_type, COUNT(*)::int AS c
        FROM crm_contacts
        WHERE (${scope}::text IS NULL OR assigned_to = ${scope})
        GROUP BY contact_type
      `;
    },
    []
  );

  const leads = await safeQuery(
    "leads",
    async function () {
      const [row] = await sql`
        SELECT COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS week
        FROM site_leads
      `;
      return row || { total: 0, week: 0 };
    },
    { total: 0, week: 0 }
  );

  const users = await safeQuery(
    "users",
    async function () {
      const [row] = await sql`
        SELECT COUNT(*)::int AS staff
        FROM users
        WHERE status IS DISTINCT FROM 'inactive'
          AND (role = 'admin' OR crm_role IN ('admin', 'staff', 'commercial', 'apporteur'))
      `;
      return row || { staff: 0 };
    },
    { staff: 0 }
  );

  const quotesOpen = await safeQuery(
    "quotes",
    async function () {
      const [row] = await sql`
        SELECT COUNT(*)::int AS c FROM crm_quotes q
        INNER JOIN crm_contacts c ON c.id = q.contact_id
        WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
          AND q.status NOT IN ('signe', 'refuse', 'annule', 'accepte')
      `;
      return row || { c: 0 };
    },
    { c: 0 }
  );

  const contractsSigned = await safeQuery(
    "contracts",
    async function () {
      const [row] = await sql`
        SELECT COUNT(*)::int AS c FROM crm_contracts ct
        INNER JOIN crm_contacts c ON c.id = ct.contact_id
        WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
          AND ct.status IN ('Actif', 'actif', 'Signé', 'signe')
      `;
      return row || { c: 0 };
    },
    { c: 0 }
  );

  const claimsActive = await safeQuery(
    "claims",
    async function () {
      const [row] = await sql`
        SELECT COUNT(*)::int AS c FROM crm_claims cl
        INNER JOIN crm_contacts c ON c.id = cl.contact_id
        WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
          AND cl.status NOT IN ('Clôturé', 'cloture', 'Refusé', 'refuse', 'Résolu', 'resolu')
      `;
      return row || { c: 0 };
    },
    { c: 0 }
  );

  const newClients = await safeQuery(
    "newClients",
    async function () {
      const [row] = await sql`
        SELECT COUNT(*)::int AS c FROM crm_contacts
        WHERE (${scope}::text IS NULL OR assigned_to = ${scope})
          AND contact_type = 'client'
          AND created_at >= NOW() - INTERVAL '30 days'
      `;
      return row || { c: 0 };
    },
    { c: 0 }
  );

  const byType = { prospect: 0, client: 0, apporteur: 0 };
  contacts.forEach(function (row) {
    byType[row.contact_type] = row.c;
  });

  const partial =
    contacts.length === 0 &&
    leads.total === 0 &&
    quotesOpen.c === 0 &&
    contractsSigned.c === 0;

  return res.status(200).json({
    ok: true,
    partial: partial,
    databaseConfigured: true,
    contacts: byType,
    contactsTotal: byType.prospect + byType.client + byType.apporteur,
    leadsTotal: leads.total,
    leadsWeek: leads.week,
    staffCount: users.staff,
    quotesOpen: quotesOpen.c,
    contractsSigned: contractsSigned.c,
    claimsActive: claimsActive.c,
    newClients: newClients.c,
  });
  } catch (e) {
    console.error("[crm/overview]", e);
    return res.status(200).json({
      ok: true,
      partial: true,
      databaseConfigured: true,
      diagnostics: { hint: e.message, migration: "database/crm.sql" },
      contacts: { prospect: 0, client: 0, apporteur: 0 },
      contactsTotal: 0,
      leadsTotal: 0,
      leadsWeek: 0,
      staffCount: 0,
      quotesOpen: 0,
      contractsSigned: 0,
      claimsActive: 0,
      newClients: 0,
    });
  }
};
