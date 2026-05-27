const { applyApiGuards } = require("../security");
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
  const scope = contactScopeFilter(user);

  try {
    const byType = await sql`
      SELECT contact_type, COUNT(*)::int AS c
      FROM crm_contacts
      WHERE (${scope}::text IS NULL OR assigned_to = ${scope})
      GROUP BY contact_type
    `;

    const [eventsMonth] = await sql`
      SELECT COUNT(*)::int AS c FROM crm_events e
      INNER JOIN crm_contacts c ON c.id = e.contact_id
      WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
        AND e.event_date >= date_trunc('month', CURRENT_DATE)
    `;

    const [quotesOpen] = await sql`
      SELECT COUNT(*)::int AS c FROM crm_quotes q
      INNER JOIN crm_contacts c ON c.id = q.contact_id
      WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
        AND q.status NOT IN ('signe', 'refuse', 'annule')
    `;

    const [vehicles] = await sql`
      SELECT COUNT(*)::int AS c FROM crm_vehicles v
      INNER JOIN crm_contacts c ON c.id = v.contact_id
      WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
    `;

    const [leadsWeek] = await sql`
      SELECT COUNT(*)::int AS c FROM site_leads
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `;

    const [contractsActive] = await sql`
      SELECT COUNT(*)::int AS c FROM crm_contracts ct
      INNER JOIN crm_contacts c ON c.id = ct.contact_id
      WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
        AND ct.status IN ('Actif', 'actif', 'En cours')
    `;

    const [contractsSigned] = await sql`
      SELECT COUNT(*)::int AS c FROM crm_contracts ct
      INNER JOIN crm_contacts c ON c.id = ct.contact_id
      WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
        AND ct.status IN ('Actif', 'actif', 'Signé', 'signe')
    `;

    const [claimsOpen] = await sql`
      SELECT COUNT(*)::int AS c FROM crm_claims cl
      INNER JOIN crm_contacts c ON c.id = cl.contact_id
      WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
        AND cl.status NOT IN ('Clôturé', 'cloture', 'Refusé', 'refuse')
    `;

    const [requestsPending] = await sql`
      SELECT COUNT(*)::int AS c FROM crm_insurance_requests r
      INNER JOIN crm_contacts c ON c.id = r.contact_id
      WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
        AND r.status IN ('En attente', 'pending', 'A traiter')
    `;

    const contacts = { prospect: 0, client: 0, apporteur: 0 };
    byType.forEach(function (r) {
      contacts[r.contact_type] = r.c;
    });

    return res.status(200).json({
      ok: true,
      contacts,
      contactsTotal: contacts.prospect + contacts.client + contacts.apporteur,
      eventsThisMonth: eventsMonth.c,
      quotesOpen: quotesOpen.c,
      vehiclesTotal: vehicles.c,
      leadsWeek: leadsWeek.c,
      contractsActive: contractsActive.c,
      contractsSigned: contractsSigned.c,
      claimsOpen: claimsOpen.c,
      documentsPending: requestsPending.c,
    });
  } catch (e) {
    console.error("[crm/statistics]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
