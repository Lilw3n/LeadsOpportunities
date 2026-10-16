/**
 * POST /api/crm/call-summary — résumé d'appel (CRM).
 * GET  /api/crm/call-summary — derniers résumés stockés.
 * Free ne transmet pas l'audio. Le journal Freebox est collé ou lu par le navigateur sur le LAN.
 */
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");
const { requireCrm } = require("../rbac");
const { getSql } = require("../db");
const { normalizePhone } = require("../lead-enrichment");
const { recordLeadEvent } = require("../lead-workflow");
const {
  hasConsent,
  normalizeFreeboxLog,
  pickFreeboxCall,
  phonesMatch,
  summarizeCall,
} = require("../call-summary");

async function findLead(sql, phone, leadId) {
  if (!sql) return null;
  if (leadId) {
    var byId = await sql`SELECT id, contact_id, phone, email, vertical FROM site_leads WHERE id = ${leadId} LIMIT 1`;
    if (byId.length) return byId[0];
  }
  var norm = normalizePhone(phone);
  if (!norm) return null;
  var tail = "%" + norm.slice(-9);
  var rows = await sql`
    SELECT id, contact_id, phone, email, vertical FROM site_leads
    WHERE phone LIKE ${tail}
    ORDER BY created_at DESC
    LIMIT 8
  `;
  for (var i = 0; i < rows.length; i++) {
    if (phonesMatch(rows[i].phone, norm)) return rows[i];
  }
  return null;
}

async function storeSummary(sql, lead, summary, meta) {
  if (!sql || !lead) return false;
  await recordLeadEvent(sql, {
    leadId: lead.id,
    contactId: lead.contact_id,
    eventType: "summary_ready",
    source: meta.source || "free",
    title: "Résumé d'appel",
    body: summary.summary,
    payload: {
      provider: summary.provider,
      metier: summary.metier,
      nextStep: summary.nextStep,
      audio: false,
      free: meta.free || null,
      consentSource: summary.consentSource,
    },
  });
  if (summary.metier && (!lead.vertical || lead.vertical === "general")) {
    try {
      await sql`UPDATE site_leads SET vertical = ${summary.metier.id}, updated_at = NOW() WHERE id = ${lead.id}`;
    } catch (e) {
      console.warn("[call-summary] vertical", e.message);
    }
  }
  return true;
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  var auth = await requireCrm(req, res);
  if (!auth) return;

  var sql = null;
  try {
    sql = getSql();
  } catch (e) {
    sql = null;
  }

  if (req.method === "GET") {
    if (!sql) return res.status(200).json({ ok: true, items: [], stored: false });
    try {
      var items = await sql`
        SELECT id, lead_id, title, body, payload, created_at, source
        FROM lead_events
        WHERE event_type = 'summary_ready' AND source IN ('free', 'crm', 'withallo')
        ORDER BY created_at DESC
        LIMIT 20
      `;
      return res.status(200).json({
        ok: true,
        items: items.map(function (row) {
          var payload = row.payload;
          if (typeof payload === "string") {
            try {
              payload = JSON.parse(payload);
            } catch (e) {
              payload = {};
            }
          }
          return {
            id: row.id,
            leadId: row.lead_id,
            title: row.title,
            summary: row.body,
            source: row.source,
            createdAt: row.created_at,
            metier: payload && payload.metier ? payload.metier : null,
            nextStep: payload && payload.nextStep ? payload.nextStep : "",
            audio: false,
          };
        }),
      });
    } catch (e) {
      return res.status(200).json({ ok: true, items: [], detail: e.message });
    }
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  var ip = getClientIp(req);
  var rl = rateLimit("call-summary:" + ip, 30, 60 * 1000);
  if (!rl.allowed) return res.status(429).json({ error: "Trop de requêtes" });

  var parsed = parseJsonBody(req, 120000);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  var body = parsed.body;
  if (!hasConsent(body)) {
    return res.status(400).json({
      ok: false,
      error: "Consentement requis : le correspondant doit avoir été informé que l'appel peut être transcrit.",
      audio: false,
    });
  }

  var calls = normalizeFreeboxLog(body.freebox || body.freeboxLog || null);
  var phone = body.phone || "";
  var free = pickFreeboxCall(calls, phone);
  if (!phone && free) phone = free.phone;

  var summary = await summarizeCall({
    consent: true,
    transcript: body.transcript || body.text || "",
    free: free,
    useAi: body.useAi !== false,
  });
  if (!summary.ok) return res.status(400).json(summary);

  var lead = null;
  var stored = false;
  if (sql) {
    try {
      lead = await findLead(sql, phone, body.leadId || body.lead_id || "");
      if (lead) stored = await storeSummary(sql, lead, summary, { source: "free", free: free });
    } catch (e) {
      console.warn("[call-summary] store", e.message);
    }
  }

  return res.status(200).json({
    ok: true,
    stored: stored,
    audio: false,
    note: summary.note,
    provider: summary.provider,
    summary: summary.summary,
    metier: summary.metier,
    nextStep: summary.nextStep,
    free: free,
    freeboxCount: calls.length,
    lead: lead ? { id: lead.id, phone: lead.phone, vertical: summary.metier ? summary.metier.id : lead.vertical } : null,
  });
};
