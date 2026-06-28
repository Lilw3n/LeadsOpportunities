/**
 * GET /api/crm/leads-acquisition — pipeline acquisition multi-plateformes
 */
const { applyApiGuards, sanitizeSearch, sanitizeEnum } = require("../security");
const { requireCrm } = require("../rbac");
const { getSql } = require("../db");

const STAGES = ["new", "questionnaire", "tariff_editing", "quote_sent", "follow_up", "won", "lost"];
const PLATFORMS = [
  "facebook", "instagram", "google", "tiktok", "linkedin", "youtube",
  "snapchat", "bing", "pinterest", "withallo", "site_web", "email", "referral", "autre",
];

function detectPlatform(row) {
  var payload = parsePayloadSafe(row.payload);
  if (row.platform) return row.platform;
  var utm = String(row.utm_source || payload.utm_source || "").toLowerCase();
  var src = String(row.source || payload.source || "").toLowerCase();
  if (/withallo|allo/.test(src + " " + utm)) return "withallo";
  if (row.fbclid || payload.fbclid || /facebook|meta|fb/.test(utm)) return /instagram|ig/.test(utm) ? "instagram" : "facebook";
  if (row.ttclid || payload.ttclid || /tiktok/.test(utm)) return "tiktok";
  if (row.gclid || row.msclkid || payload.gclid || /google/.test(utm)) return "google";
  if (/linkedin/.test(utm)) return "linkedin";
  return row.source === "landing_form" ? "site_web" : "autre";
}

function parsePayloadSafe(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

async function fetchAcquisitionRows(sql, limit) {
  var cap = limit * 3;
  try {
    return await sql`
      SELECT id, source, vertical, lead_score, email, phone, utm_source, utm_medium, utm_campaign,
             gclid, visitor_id, payload, COALESCE(status, 'new') AS status, notes, created_at, updated_at,
             contact_id, platform, pipeline_stage, questionnaire_step, questionnaire_total, form_id,
             fbclid, ttclid, msclkid, priority, next_followup_at, last_activity_at, tariff_insurer,
             opened_at, opened_by, archived_at, archived_by, archive_reason, assigned_to, shared_with,
             last_event_at, last_event_type, city, postal_code
      FROM site_leads
      ORDER BY created_at DESC
      LIMIT ${cap}
    `;
  } catch (e1) {
    console.warn("[crm/leads-acquisition] extended select failed", e1.message);
  }
  try {
    return await sql`
      SELECT id, source, vertical, lead_score, email, phone, utm_source, utm_medium, utm_campaign,
             gclid, visitor_id, payload, COALESCE(status, 'new') AS status, notes, created_at, updated_at,
             contact_id, platform, pipeline_stage, questionnaire_step, questionnaire_total, form_id,
             fbclid, ttclid, msclkid, priority, next_followup_at, last_activity_at, tariff_insurer,
             NULL::timestamptz AS opened_at, NULL::text AS opened_by,
             NULL::timestamptz AS archived_at, NULL::text AS archived_by, NULL::text AS archive_reason,
             NULL::text AS assigned_to, '[]'::text AS shared_with,
             NULL::timestamptz AS last_event_at, NULL::text AS last_event_type,
             NULL::text AS city, NULL::text AS postal_code
      FROM site_leads
      ORDER BY created_at DESC
      LIMIT ${cap}
    `;
  } catch (e2) {
    console.warn("[crm/leads-acquisition] workflow select failed", e2.message);
  }
  return sql`
    SELECT id, source, vertical, lead_score, email, phone, utm_source, utm_medium, utm_campaign,
           gclid, visitor_id, payload, created_at, updated_at
    FROM site_leads
    ORDER BY created_at DESC
    LIMIT ${cap}
  `;
}

function safeEnrich(row) {
  try {
    return enrich(row);
  } catch (e) {
    console.warn("[crm/leads-acquisition] enrich row", row && row.id, e.message);
    return {
      id: row.id,
      email: row.email,
      phone: row.phone,
      vertical: row.vertical,
      lead_score: row.lead_score,
      source: row.source,
      platform: "autre",
      pipeline_stage: "new",
      status: "new",
      questionnaire_step: 0,
      questionnaire_total: 10,
      questionnaire_pct: 0,
      is_meta_lead: row.source === "meta_lead_ads",
      created_at: row.created_at,
      is_opened: false,
      is_archived: false,
      is_dormant: false,
      is_interesting: false,
    };
  }
}

function enrich(row) {
  var payload = parsePayloadSafe(row.payload);
  var step = Number(row.questionnaire_step || payload.questionnaire_step || 0);
  var total = Number(row.questionnaire_total || payload.questionnaire_total || 10) || 10;
  var pct =
    payload.questionnaire_pct != null
      ? Math.min(100, Number(payload.questionnaire_pct) || 0)
      : Math.min(100, Math.round((step / total) * 100));
  var stage = row.pipeline_stage || row.status || "new";
  var last = row.last_activity_at || row.updated_at || row.created_at;
  var dormant = last ? Date.now() - new Date(last).getTime() > 72 * 3600000 : false;
  var isMeta =
    row.source === "meta_lead_ads" ||
    payload.source === "meta_lead_ads" ||
    !!payload.meta_leadgen_id;
  return {
    id: row.id,
    email: row.email,
    phone: row.phone,
    vertical: row.vertical,
    lead_score: row.lead_score,
    source: row.source,
    platform: detectPlatform(row),
    pipeline_stage: stage,
    status: row.status || stage,
    questionnaire_step: step,
    questionnaire_total: total,
    questionnaire_pct: pct,
    form_id: row.form_id || payload.formId || payload.form_id || null,
    priority: row.priority || "medium",
    next_followup_at: row.next_followup_at,
    last_activity_at: last,
    is_dormant: dormant && stage !== "won" && stage !== "lost",
    utm_source: row.utm_source,
    utm_medium: row.utm_medium,
    utm_campaign: row.utm_campaign,
    contact_id: row.contact_id,
    notes: row.notes,
    tariff_insurer: row.tariff_insurer,
    opened_at: row.opened_at,
    opened_by: row.opened_by,
    is_opened: !!row.opened_at,
    archived_at: row.archived_at,
    archived_by: row.archived_by,
    archive_reason: row.archive_reason,
    is_archived: !!row.archived_at,
    assigned_to: row.assigned_to,
    shared_with: row.shared_with,
    last_event_at: row.last_event_at,
    last_event_type: row.last_event_type,
    is_interesting: (row.priority === "high" || Number(row.lead_score || 0) >= 70 || row.tariff_insurer),
    created_at: row.created_at,
    updated_at: row.updated_at,
    full_name: payload.firstName || payload.first_name
      ? String(payload.firstName || payload.first_name) + " " + String(payload.lastName || payload.last_name || "")
      : null,
    parcours_id: payload.parcours_id || payload.parcours || null,
    parcours_label: payload.parcours_label || null,
    parcours_workflow: Array.isArray(payload.parcours_workflow) ? payload.parcours_workflow : [],
    devis_summary: payload.devis_summary || null,
    devis_preview: Array.isArray(payload.devis_preview) ? payload.devis_preview : [],
    meta_form_name: payload.meta_form_name || payload.meta_form_template || null,
    meta_leadgen_id: payload.meta_leadgen_id || null,
    is_meta_lead: isMeta,
    city: row.city || payload.city || null,
    postal_code: row.postal_code || payload.postal_code || payload.postalCode || null,
  };
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
  const platform = url.searchParams.get("platform")
    ? sanitizeEnum(url.searchParams.get("platform"), PLATFORMS, null)
    : null;
  const stage = url.searchParams.get("stage")
    ? sanitizeEnum(url.searchParams.get("stage"), STAGES, null)
    : null;
  const dormantOnly = url.searchParams.get("dormant") === "1";
  const sourceFilter = url.searchParams.get("source")
    ? String(url.searchParams.get("source")).trim().slice(0, 80)
    : null;
  const view = url.searchParams.get("view") || "active";
  const q = url.searchParams.get("q") ? sanitizeSearch(url.searchParams.get("q")) : null;
  const pattern = q ? "%" + q + "%" : null;
  const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get("limit") || "120", 10)));

  try {
    var rows = await fetchAcquisitionRows(sql, limit);

    var leads = rows.map(safeEnrich);
    if (platform) leads = leads.filter(function (l) { return l.platform === platform; });
    if (sourceFilter === "meta_lead_ads") {
      leads = leads.filter(function (l) { return l.is_meta_lead; });
    } else if (sourceFilter) {
      leads = leads.filter(function (l) { return l.source === sourceFilter; });
    }
    if (stage) leads = leads.filter(function (l) { return l.pipeline_stage === stage; });
    if (dormantOnly) leads = leads.filter(function (l) { return l.is_dormant; });
    if (view === "active" || view === "unarchived") leads = leads.filter(function (l) { return !l.is_archived; });
    if (view === "archived") leads = leads.filter(function (l) { return l.is_archived; });
    if (view === "unopened") leads = leads.filter(function (l) { return !l.is_opened && !l.is_archived; });
    if (view === "interesting") leads = leads.filter(function (l) { return l.is_interesting && !l.is_archived; });
    if (pattern) {
      leads = leads.filter(function (l) {
        return (
          String(l.email || "").toLowerCase().includes(pattern.slice(1, -1).toLowerCase()) ||
          String(l.phone || "").includes(pattern.slice(1, -1)) ||
          String(l.full_name || "").toLowerCase().includes(pattern.slice(1, -1).toLowerCase())
        );
      });
    }
    leads = leads.slice(0, limit);

    var byPlatform = {};
    var byStage = {};
    PLATFORMS.forEach(function (p) { byPlatform[p] = 0; });
    STAGES.forEach(function (s) { byStage[s] = 0; });
    rows.map(safeEnrich).forEach(function (l) {
      byPlatform[l.platform] = (byPlatform[l.platform] || 0) + 1;
      byStage[l.pipeline_stage] = (byStage[l.pipeline_stage] || 0) + 1;
    });

    return res.status(200).json({
      ok: true,
      leads: leads,
      stats: {
        total: rows.length,
        dormant: rows.map(safeEnrich).filter(function (l) { return l.is_dormant; }).length,
        byPlatform: byPlatform,
        byStage: byStage,
        unopened: rows.map(safeEnrich).filter(function (l) { return !l.is_opened && !l.is_archived; }).length,
        archived: rows.map(safeEnrich).filter(function (l) { return l.is_archived; }).length,
        interesting: rows.map(safeEnrich).filter(function (l) { return l.is_interesting && !l.is_archived; }).length,
      },
    });
  } catch (e) {
    console.error("[crm/leads-acquisition]", e);
    return res.status(500).json({ ok: false, error: "Erreur serveur", detail: e.message });
  }
};
