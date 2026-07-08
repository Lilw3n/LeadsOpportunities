/**
 * Construction des alertes CRM (intelligentes + opérationnelles).
 */
const PRIORITY_ORDER = { critical: 0, urgent: 1, high: 2, medium: 3, low: 4 };

function sortAlerts(list) {
  return list.slice().sort(function (a, b) {
    return (PRIORITY_ORDER[a.priority] || 9) - (PRIORITY_ORDER[b.priority] || 9);
  });
}

function dedupeById(list) {
  var seen = {};
  return list.filter(function (a) {
    if (!a.id || seen[a.id]) return false;
    seen[a.id] = true;
    return true;
  });
}

async function buildIntelligentAlerts(sql, scope) {
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
      message:
        (ct.policy_number || "Contrat") +
        " expire le " +
        new Date(ct.end_date).toLocaleDateString("fr-FR") +
        " — " +
        name,
      contactId: ct.contact_id,
      ruleId: "contract_renewal_30d",
      href: "./crm-contract-detail.html?id=" + encodeURIComponent(ct.id) + "&contactId=" + encodeURIComponent(ct.contact_id),
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
      href: "./crm-claim-detail.html?id=" + encodeURIComponent(cl.id) + "&contactId=" + encodeURIComponent(cl.contact_id),
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
        message:
          ((d.first_name || "") + " " + (d.last_name || "")).trim() +
          " — ~" +
          months +
          " mois — " +
          (d.cf || "") +
          " " +
          (d.cl || ""),
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

  return { alerts, reminders };
}

async function buildOperationalAlerts(sql, scope) {
  const ops = [];

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
    var name = ((e.first_name || "") + " " + (e.last_name || "")).trim() || e.email || "Contact";
    ops.push({
      id: "ev-overdue-" + e.id,
      category: "event",
      type: "event",
      priority: "high",
      title: "Événement en retard",
      message: e.title + " — " + name,
      contactId: e.contact_id,
      href: "./crm-events.html",
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
    var name = ((e.first_name || "") + " " + (e.last_name || "")).trim() || e.email || "Contact";
    ops.push({
      id: "ev-urgent-" + e.id,
      category: "event",
      type: "event",
      priority: "urgent",
      title: "Événement urgent",
      message: e.title + " — " + name,
      contactId: e.contact_id,
      href: "./crm-events.html",
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
    ops.push({
      id: "req-" + r.id,
      category: "reminder",
      type: "request",
      priority: "medium",
      title: "Demande en attente",
      message: (r.request_type || "Devis") + " — " + (r.first_name || "") + " " + (r.last_name || ""),
      contactId: r.contact_id,
      href: "./crm-insurance-requests.html",
    });
  });

  return ops;
}

async function buildInboundLeadAlerts(sql, limit) {
  const alerts = [];
  try {
    const rows = await sql`
      SELECT id, email, phone, vertical, lead_score, source, created_at, payload
      FROM site_leads
      WHERE created_at >= NOW() - INTERVAL '14 days'
      ORDER BY created_at DESC
      LIMIT ${Math.min(limit || 12, 20)}
    `;
    rows.forEach(function (row) {
      var payload = {};
      try {
        payload = row.payload ? JSON.parse(row.payload) : {};
      } catch (e) {}
      var name =
        ((payload.firstName || payload.first_name || "") + " " + (payload.lastName || payload.last_name || "")).trim();
      alerts.push({
        id: "lead-in-" + row.id,
        category: "reminder",
        priority: Number(row.lead_score || 0) >= 70 ? "high" : "medium",
        title: "Formulaire rempli",
        message:
          (name || row.email || row.phone || "Lead") +
          " — " +
          (row.vertical || row.source || "site") +
          " — " +
          new Date(row.created_at).toLocaleDateString("fr-FR"),
        href: "./crm-lead-detail.html?id=" + encodeURIComponent(row.id),
      });
    });
  } catch (e) {
    console.warn("[crm-alerts-build] inbound leads:", e.message);
  }
  return alerts;
}

async function buildAllAlerts(sql, scope, limit) {
  var intel = { alerts: [], reminders: [] };
  var ops = [];
  try {
    intel = await buildIntelligentAlerts(sql, scope);
  } catch (e) {
    console.warn("[crm-alerts-build] intelligent:", e.message);
  }
  try {
    ops = await buildOperationalAlerts(sql, scope);
  } catch (e) {
    console.warn("[crm-alerts-build] operational:", e.message);
  }
  var inbound = await buildInboundLeadAlerts(sql, limit);
  const combined = dedupeById(intel.alerts.concat(intel.reminders).concat(ops).concat(inbound));
  const sorted = sortAlerts(combined);
  const slice = sorted.slice(0, limit || 40);

  const counts = {
    eligibility: slice.filter(function (a) { return a.category === "eligibility"; }).length,
    claimAging: slice.filter(function (a) { return a.category === "claim_aging"; }).length,
    reminders: slice.filter(function (a) { return a.category === "reminder"; }).length,
    events: slice.filter(function (a) { return a.category === "event"; }).length,
    total: slice.length,
  };

  return { alerts: slice, counts };
}

module.exports = {
  buildIntelligentAlerts,
  buildOperationalAlerts,
  buildInboundLeadAlerts,
  buildAllAlerts,
  sortAlerts,
  dedupeById,
};
