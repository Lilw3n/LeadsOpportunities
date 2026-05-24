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

    const overdueEvents = await sql`
      SELECT e.id, e.title, e.event_date, e.contact_id,
        c.first_name, c.last_name, c.email
      FROM crm_events e
      INNER JOIN crm_contacts c ON c.id = e.contact_id
      WHERE e.status = 'pending'
        AND e.event_date IS NOT NULL
        AND e.event_date < CURRENT_DATE
        AND (${scope}::text IS NULL OR c.assigned_to = ${scope})
      ORDER BY e.event_date ASC
      LIMIT 15
    `;
    overdueEvents.forEach(function (e) {
      var name =
        ((e.first_name || "") + " " + (e.last_name || "")).trim() || e.email || "Contact";
      alerts.push({
        id: "ev-overdue-" + e.id,
        type: "event",
        priority: "high",
        title: "Evenement en retard",
        message: e.title + " — " + name,
        contactId: e.contact_id,
      });
    });

    const urgentEvents = await sql`
      SELECT e.id, e.title, e.contact_id, c.first_name, c.last_name, c.email
      FROM crm_events e
      INNER JOIN crm_contacts c ON c.id = e.contact_id
      WHERE e.status = 'pending' AND e.priority = 'urgent'
        AND (${scope}::text IS NULL OR c.assigned_to = ${scope})
      ORDER BY e.created_at DESC
      LIMIT 10
    `;
    urgentEvents.forEach(function (e) {
      var name =
        ((e.first_name || "") + " " + (e.last_name || "")).trim() || e.email || "Contact";
      alerts.push({
        id: "ev-urgent-" + e.id,
        type: "event",
        priority: "urgent",
        title: "Evenement urgent",
        message: e.title + " — " + name,
        contactId: e.contact_id,
      });
    });

    const oldClaims = await sql`
      SELECT cl.id, cl.claim_type, cl.contact_id, c.first_name, c.last_name
      FROM crm_claims cl
      INNER JOIN crm_contacts c ON c.id = cl.contact_id
      WHERE cl.status IN ('En attente', 'pending', 'open')
        AND cl.claim_date IS NOT NULL
        AND cl.claim_date < CURRENT_DATE - INTERVAL '90 days'
        AND (${scope}::text IS NULL OR c.assigned_to = ${scope})
      ORDER BY cl.claim_date ASC
      LIMIT 10
    `;
    oldClaims.forEach(function (cl) {
      alerts.push({
        id: "cl-old-" + cl.id,
        type: "claim",
        priority: "medium",
        title: "Sinistre ancien en attente",
        message: (cl.claim_type || "Sinistre") + " — " + (cl.first_name || "") + " " + (cl.last_name || ""),
        contactId: cl.contact_id,
      });
    });

    const pendingRequests = await sql`
      SELECT r.id, r.request_type, r.contact_id, c.first_name, c.last_name
      FROM crm_insurance_requests r
      INNER JOIN crm_contacts c ON c.id = r.contact_id
      WHERE r.status IN ('En attente', 'pending', 'nouveau')
        AND (${scope}::text IS NULL OR c.assigned_to = ${scope})
      ORDER BY r.created_at DESC
      LIMIT 10
    `;
    pendingRequests.forEach(function (r) {
      alerts.push({
        id: "req-" + r.id,
        type: "request",
        priority: "medium",
        title: "Demande en attente",
        message: (r.request_type || "Devis") + " — " + (r.first_name || "") + " " + (r.last_name || ""),
        contactId: r.contact_id,
      });
    });

    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    alerts.sort(function (a, b) {
      return (priorityOrder[a.priority] || 9) - (priorityOrder[b.priority] || 9);
    });

    return res.status(200).json({ ok: true, alerts: alerts.slice(0, 25) });
  } catch (e) {
    console.error("[crm/alerts]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
