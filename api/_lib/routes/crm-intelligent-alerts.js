/**
 * GET /api/crm/intelligent-alerts — inspire intelligentAlertsService multisite
 */
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
    const alerts = [];
    const reminders = [];

    const expiring = await sql`
      SELECT ct.id, ct.policy_number, ct.end_date, ct.contact_id, c.first_name, c.last_name
      FROM crm_contracts ct
      INNER JOIN crm_contacts c ON c.id = ct.contact_id
      WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
        AND ct.end_date IS NOT NULL
        AND ct.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
      ORDER BY ct.end_date ASC
      LIMIT 15
    `;
    expiring.forEach(function (ct) {
      var name = ((ct.first_name || "") + " " + (ct.last_name || "")).trim();
      alerts.push({
        id: "exp-" + ct.id,
        category: "eligibility",
        priority: "high",
        title: "Renouvellement imminente",
        message: (ct.policy_number || "Contrat") + " expire le " + new Date(ct.end_date).toLocaleDateString("fr-FR") + " — " + name,
        contactId: ct.contact_id,
        ruleId: "contract_renewal_30d",
      });
    });

    const agingClaims = await sql`
      SELECT cl.id, cl.claim_type, cl.claim_date, cl.contact_id, c.first_name, c.last_name,
        (CURRENT_DATE - cl.claim_date::date) AS days_open
      FROM crm_claims cl
      INNER JOIN crm_contacts c ON c.id = cl.contact_id
      WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
        AND cl.status IN ('En attente', 'pending', 'open', 'Ouvert')
        AND cl.claim_date IS NOT NULL
        AND cl.claim_date < CURRENT_DATE - INTERVAL '30 days'
      ORDER BY cl.claim_date ASC
      LIMIT 15
    `;
    agingClaims.forEach(function (cl) {
      var days = Number(cl.days_open) || 0;
      var pri = days >= 90 ? "critical" : days >= 60 ? "high" : "medium";
      alerts.push({
        id: "claim-age-" + cl.id,
        category: "claim_aging",
        priority: pri,
        title: "Sinistre ouvert " + days + " j",
        message: (cl.claim_type || "Sinistre") + " — " + (cl.first_name || "") + " " + (cl.last_name || ""),
        contactId: cl.contact_id,
        ruleId: "claim_aging_" + (days >= 90 ? "90" : "30"),
      });
    });

    const vtcDrivers = await sql`
      SELECT d.id, d.first_name, d.last_name, d.license_date, d.contact_id, c.first_name AS cf, c.last_name AS cl
      FROM crm_drivers d
      INNER JOIN crm_contacts c ON c.id = d.contact_id
      WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
        AND d.license_date IS NOT NULL
        AND d.license_date > CURRENT_DATE - INTERVAL '5 years'
      LIMIT 20
    `;
    vtcDrivers.forEach(function (d) {
      var lic = new Date(d.license_date);
      var months = Math.floor((Date.now() - lic.getTime()) / (86400000 * 30));
      if (months < 60) {
        reminders.push({
          id: "vtc-lic-" + d.id,
          category: "eligibility",
          priority: "medium",
          title: "Permis VTC < 5 ans",
          message: ((d.first_name || "") + " " + (d.last_name || "")).trim() + " — ~" + months + " mois — " + (d.cf || "") + " " + (d.cl || ""),
          contactId: d.contact_id,
          ruleId: "vtc_license_5y",
        });
      }
    });

    const manyClaims = await sql`
      SELECT cl.contact_id, COUNT(*)::int AS cnt, c.first_name, c.last_name
      FROM crm_claims cl
      INNER JOIN crm_contacts c ON c.id = cl.contact_id
      WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
        AND cl.claim_date >= CURRENT_DATE - INTERVAL '36 months'
      GROUP BY cl.contact_id, c.first_name, c.last_name
      HAVING COUNT(*) > 3
      LIMIT 10
    `;
    manyClaims.forEach(function (row) {
      alerts.push({
        id: "claims-max-" + row.contact_id,
        category: "eligibility",
        priority: "critical",
        title: "Sinistres > 3 / 36 mois",
        message: row.cnt + " sinistres — " + (row.first_name || "") + " " + (row.last_name || ""),
        contactId: row.contact_id,
        ruleId: "auto_claims_max_3_in_36_months",
      });
    });

    const draftQuotes = await sql`
      SELECT q.id, q.title, q.updated_at, q.contact_id, c.first_name, c.last_name
      FROM crm_quotes q
      INNER JOIN crm_contacts c ON c.id = q.contact_id
      WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
        AND q.status IN ('brouillon', 'envoye')
        AND q.updated_at < NOW() - INTERVAL '7 days'
      ORDER BY q.updated_at ASC
      LIMIT 10
    `;
    draftQuotes.forEach(function (q) {
      reminders.push({
        id: "quote-stale-" + q.id,
        category: "reminder",
        priority: "medium",
        title: "Devis sans suite",
        message: (q.title || "Devis") + " — relancer " + (q.first_name || "") + " " + (q.last_name || ""),
        contactId: q.contact_id,
        href: "./crm-quote-detail.html?id=" + encodeURIComponent(q.id),
      });
    });

    const priorityOrder = { critical: 0, urgent: 1, high: 2, medium: 3, low: 4 };
    var combined = alerts.concat(reminders);
    combined.sort(function (a, b) {
      return (priorityOrder[a.priority] || 9) - (priorityOrder[b.priority] || 9);
    });

    return res.status(200).json({
      ok: true,
      alerts: combined.slice(0, 30),
      counts: {
        eligibility: alerts.filter(function (a) { return a.category === "eligibility"; }).length,
        claimAging: alerts.filter(function (a) { return a.category === "claim_aging"; }).length,
        reminders: reminders.length,
      },
    });
  } catch (e) {
    console.error("[crm/intelligent-alerts]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
