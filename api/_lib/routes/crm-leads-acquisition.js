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
  var payload = {};
  try {
    payload = row.payload ? JSON.parse(row.payload) : {};
  } catch (e) {}
  if (row.platform) return row.platform;
  var utm = String(row.utm_source || payload.utm_source || "").toLowerCase();
  var src = String(row.source || payload.source || "").toLowerCase();
  if (/withallo|allo/.test(src + " " + utm)) return "withallo";
  if (row.fbclid || payload.fbclid || /facebook|meta|fb/.test(utm)) return /instagram|ig/.test(utm) ? "instagram" : "facebook";
  if (row.ttclid || payload.ttclid || /tiktok/.test(utm)) return "tiktok";
  if (row.gclid || row.msclkid || /google/.test(utm)) return "google";
  if (/linkedin/.test(utm)) return "linkedin";
  return row.source === "landing_form" ? "site_web" : "autre";
}

function enrich(row) {
  var step = Number(row.questionnaire_step || 0);
  var total = Number(row.questionnaire_total || 10) || 10;
  var pct = Math.min(100, Math.round((step / total) * 100));
  var stage = row.pipeline_stage || row.status || "new";
  var last = row.last_activity_at || row.updated_at || row.created_at;
  var dormant = last ? Date.now() - new Date(last).getTime() > 72 * 3600000 : false;
  var payload = {};
  try {
    payload = row.payload ? JSON.parse(row.payload) : {};
  } catch (e) {}
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
  const view = url.searchParams.get("view") || "active";
  const q = url.searchParams.get("q") ? sanitizeSearch(url.searchParams.get("q")) : null;
  const pattern = q ? "%" + q + "%" : null;
  const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get("limit") || "120", 10)));

  try {
    let rows;
    try {
      rows = await sql`
        SELECT id, source, vertical, lead_score, email, phone, utm_source, utm_medium, utm_campaign,
               gclid, visitor_id, payload, COALESCE(status, 'new') AS status, notes, created_at, updated_at,
               contact_id, platform, pipeline_stage, questionnaire_step, questionnaire_total, form_id,
               fbclid, ttclid, msclkid, priority, next_followup_at, last_activity_at, tariff_insurer,
               opened_at, opened_by, archived_at, archived_by, archive_reason, assigned_to, shared_with,
               last_event_at, last_event_type
        FROM site_leads
        ORDER BY created_at DESC
        LIMIT ${limit * 3}
      `;
    } catch (selectErr) {
      console.warn("[crm/leads-acquisition] private workflow columns missing", selectErr.message);
      rows = await sql`
        SELECT id, source, vertical, lead_score, email, phone, utm_source, utm_medium, utm_campaign,
               gclid, visitor_id, payload, COALESCE(status, 'new') AS status, notes, created_at, updated_at,
               contact_id, platform, pipeline_stage, questionnaire_step, questionnaire_total, form_id,
               fbclid, ttclid, msclkid, priority, next_followup_at, last_activity_at, tariff_insurer,
               NULL::timestamptz AS opened_at, NULL::text AS opened_by,
               NULL::timestamptz AS archived_at, NULL::text AS archived_by, NULL::text AS archive_reason,
               NULL::text AS assigned_to, '[]'::text AS shared_with,
               NULL::timestamptz AS last_event_at, NULL::text AS last_event_type
        FROM site_leads
        ORDER BY created_at DESC
        LIMIT ${limit * 3}
      `;
    }

    var leads = rows.map(enrich);
    if (platform) leads = leads.filter(function (l) { return l.platform === platform; });
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
    rows.map(enrich).forEach(function (l) {
      byPlatform[l.platform] = (byPlatform[l.platform] || 0) + 1;
      byStage[l.pipeline_stage] = (byStage[l.pipeline_stage] || 0) + 1;
    });

    return res.status(200).json({
      ok: true,
      leads: leads,
      stats: {
        total: rows.length,
        dormant: rows.map(enrich).filter(function (l) { return l.is_dormant; }).length,
        byPlatform: byPlatform,
        byStage: byStage,
        unopened: rows.map(enrich).filter(function (l) { return !l.is_opened && !l.is_archived; }).length,
        archived: rows.map(enrich).filter(function (l) { return l.is_archived; }).length,
        interesting: rows.map(enrich).filter(function (l) { return l.is_interesting && !l.is_archived; }).length,
      },
    });
  } catch (e) {
    console.error("[crm/leads-acquisition]", e);
    return res.status(500).json({ error: "Erreur serveur", detail: e.message });
  }
};
