const { applyApiGuards } = require("../security");
const { requireCrm } = require("../rbac");
const { getSql } = require("../db");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  try {
    const scope = user.crmRole === "apporteur" ? user.id : null;

    const [contacts] = await sql`
      SELECT contact_type, COUNT(*)::int AS c
      FROM crm_contacts
      WHERE (${scope}::text IS NULL OR assigned_to = ${scope})
      GROUP BY contact_type
    `;

    const [leads] = await sql`
      SELECT COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS week
      FROM site_leads
    `;

    const [users] = await sql`
      SELECT COUNT(*)::int AS staff
      FROM users
      WHERE status IS DISTINCT FROM 'inactive'
        AND (role = 'admin' OR crm_role IN ('admin', 'staff', 'commercial', 'apporteur'))
    `;

    const [quotesOpen] = await sql`
      SELECT COUNT(*)::int AS c FROM crm_quotes q
      INNER JOIN crm_contacts c ON c.id = q.contact_id
      WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
        AND q.status NOT IN ('signe', 'refuse', 'annule', 'accepte')
    `;

    const [contractsSigned] = await sql`
      SELECT COUNT(*)::int AS c FROM crm_contracts ct
      INNER JOIN crm_contacts c ON c.id = ct.contact_id
      WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
        AND ct.status IN ('Actif', 'actif', 'Signé', 'signe')
    `;

    const [claimsActive] = await sql`
      SELECT COUNT(*)::int AS c FROM crm_claims cl
      INNER JOIN crm_contacts c ON c.id = cl.contact_id
      WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
        AND cl.status NOT IN ('Clôturé', 'cloture', 'Refusé', 'refuse', 'Résolu', 'resolu')
    `;

    const [newClients] = await sql`
      SELECT COUNT(*)::int AS c FROM crm_contacts
      WHERE (${scope}::text IS NULL OR assigned_to = ${scope})
        AND contact_type = 'client'
        AND created_at >= NOW() - INTERVAL '30 days'
    `;

    const byType = { prospect: 0, client: 0, apporteur: 0 };
    contacts.forEach(function (row) {
      byType[row.contact_type] = row.c;
    });

    return res.status(200).json({
      ok: true,
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
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
