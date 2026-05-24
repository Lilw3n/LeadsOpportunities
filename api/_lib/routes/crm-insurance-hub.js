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
    const [vehicles] = await sql`
      SELECT COUNT(*)::int AS c FROM crm_vehicles v
      INNER JOIN crm_contacts c ON c.id = v.contact_id
      WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
    `;
    const [drivers] = await sql`
      SELECT COUNT(*)::int AS c FROM crm_drivers d
      INNER JOIN crm_contacts c ON c.id = d.contact_id
      WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
    `;
    const [claims] = await sql`
      SELECT COUNT(*)::int AS c FROM crm_claims cl
      INNER JOIN crm_contacts c ON c.id = cl.contact_id
      WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
    `;
    const [claimsPending] = await sql`
      SELECT COUNT(*)::int AS c FROM crm_claims cl
      INNER JOIN crm_contacts c ON c.id = cl.contact_id
      WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
        AND cl.status IN ('En cours', 'En attente', 'pending', 'open')
    `;
    const [contracts] = await sql`
      SELECT COUNT(*)::int AS c FROM crm_contracts ct
      INNER JOIN crm_contacts c ON c.id = ct.contact_id
      WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
    `;
    const [contractsActive] = await sql`
      SELECT COUNT(*)::int AS c FROM crm_contracts ct
      INNER JOIN crm_contacts c ON c.id = ct.contact_id
      WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
        AND ct.status IN ('En cours', 'Actif', 'active')
    `;
    const [premium] = await sql`
      SELECT COALESCE(SUM(ct.premium), 0)::float AS s FROM crm_contracts ct
      INNER JOIN crm_contacts c ON c.id = ct.contact_id
      WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
        AND ct.status IN ('En cours', 'Actif', 'active')
    `;
    const [claimsMonth] = await sql`
      SELECT COUNT(*)::int AS c FROM crm_claims cl
      INNER JOIN crm_contacts c ON c.id = cl.contact_id
      WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
        AND cl.claim_date >= date_trunc('month', CURRENT_DATE)
    `;
    const [expiring] = await sql`
      SELECT COUNT(*)::int AS c FROM crm_contracts ct
      INNER JOIN crm_contacts c ON c.id = ct.contact_id
      WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
        AND ct.end_date IS NOT NULL
        AND ct.end_date >= CURRENT_DATE
        AND ct.end_date <= (CURRENT_DATE + INTERVAL '30 days')
    `;

    return res.status(200).json({
      ok: true,
      stats: {
        totalVehicles: vehicles.c,
        activeDrivers: drivers.c,
        totalClaims: claims.c,
        pendingClaims: claimsPending.c,
        totalContracts: contracts.c,
        activePolicies: contractsActive.c,
        monthlyPremium: Math.round(premium.s || 0),
        claimsThisMonth: claimsMonth.c,
        expiringThisMonth: expiring.c,
      },
    });
  } catch (e) {
    console.error("[crm/insurance-hub]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
