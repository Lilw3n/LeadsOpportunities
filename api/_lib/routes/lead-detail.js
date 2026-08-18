const { requireDashboardAdmin } = require("../dashboard-admin");
const { applyApiGuards } = require("../security");
const { getSql } = require("../db");
const { enrichLeadRow } = require("../leads-filters");
const { markLeadOpened } = require("../lead-workflow");
const { ensureSiteLeadsSchema } = require("../ensure-schema");

function parsePayload(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function safePayloadString(obj) {
  try {
    return JSON.stringify(obj || {});
  } catch {
    return "{}";
  }
}

async function fetchLeadRow(sql, leadId) {
  var tiers = [
    function () {
      return sql`
        SELECT id, source, vertical, lead_score, email, phone,
               utm_source, utm_medium, utm_campaign, gclid, visitor_id,
               COALESCE(status, 'new') AS status, notes, assigned_to,
               payload, created_at, updated_at, opened_at, platform,
               competitor_monthly, our_offer_monthly, relevance, client_ip,
               landing_slug, seo_city, seo_product, pipeline_stage,
               questionnaire_step, questionnaire_total, contact_id
        FROM site_leads WHERE LOWER(id) = LOWER(${leadId})
      `;
    },
    function () {
      return sql`
        SELECT id, source, vertical, lead_score, email, phone,
               utm_source, utm_medium, utm_campaign, gclid, visitor_id,
               COALESCE(status, 'new') AS status, notes,
               payload, created_at, platform
        FROM site_leads WHERE LOWER(id) = LOWER(${leadId})
      `;
    },
    function () {
      return sql`
        SELECT id, source, vertical, lead_score, email, phone, payload, created_at
        FROM site_leads WHERE LOWER(id) = LOWER(${leadId})
      `;
    },
  ];

  var lastErr = null;
  for (var i = 0; i < tiers.length; i++) {
    try {
      return await tiers[i]();
    } catch (e) {
      lastErr = e;
      console.warn("[dashboard/lead-detail] tier " + (i + 1), e.message);
    }
  }
  throw lastErr || new Error("Lead illisible");
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const decoded = await requireDashboardAdmin(req, res);
  if (!decoded) return;

  const url = new URL(req.url, "http://localhost");
  const leadId = url.searchParams.get("id");
  if (!leadId) return res.status(400).json({ ok: false, error: "id requis" });

  const sql = getSql();
  if (!sql) {
    return res.status(503).json({
      ok: false,
      error: "Base de données non configurée",
      detail: "Ajoutez DATABASE_URL sur Vercel puis redéployez.",
    });
  }

  try {
    await ensureSiteLeadsSchema(sql);
    const rows = await fetchLeadRow(sql, leadId);

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: "Lead introuvable" });
    }

    const lead = enrichLeadRow(rows[0]);
    lead.payload = parsePayload(lead.payload);

    await markLeadOpened(sql, leadId, decoded.userId);

    var openedIso = new Date().toISOString();
    try {
      var patch = Object.assign({}, lead.payload, { openedAt: openedIso });
      await sql`
        UPDATE site_leads SET payload = ${safePayloadString(patch)}
        WHERE id = ${leadId}
      `;
      lead.opened_at = lead.opened_at || openedIso;
      lead.payload = patch;
    } catch (patchErr) {
      lead.payload.openedAt = lead.payload.openedAt || openedIso;
      console.warn("[dashboard/lead-detail] payload patch skipped", patchErr.message);
    }

    return res.status(200).json({ ok: true, lead });
  } catch (e) {
    console.error("[dashboard/lead-detail]", e);
    return res.status(200).json({
      ok: false,
      error: "Erreur serveur",
      detail: e.message,
      hint: "Vérifiez DATABASE_URL et database/site_leads.sql sur Neon.",
    });
  }
};
