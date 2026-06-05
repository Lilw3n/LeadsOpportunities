/**
 * Suivi parcours questionnaire — étapes, blocages, abandons
 */
const { randomUUID } = require("crypto");
const { normalizeClientIp } = require("./security");

function mergePayload(existing, patch) {
  var base = {};
  if (existing) {
    try {
      base = typeof existing === "string" ? JSON.parse(existing) : Object.assign({}, existing);
    } catch (e) {
      base = {};
    }
  }
  var funnel = base.funnel || { events: [], blockages: [] };
  if (patch.event) {
    funnel.events = (funnel.events || []).slice(-49);
    funnel.events.push({
      event: patch.event,
      step: patch.step,
      stepName: patch.step_name || patch.stepName,
      journey: patch.journey,
      ts: new Date().toISOString(),
      meta: patch.meta || {},
    });
  }
  if (patch.blockage) {
    funnel.blockages = funnel.blockages || [];
    funnel.blockages.push(Object.assign({ ts: new Date().toISOString() }, patch.blockage));
  }
  if (patch.journey) funnel.journey = patch.journey;
  if (patch.last_step != null) funnel.lastStep = patch.last_step;
  if (patch.step_name) funnel.lastStepName = patch.step_name;
  if (patch.abandoned) funnel.abandonedAt = new Date().toISOString();

  base.funnel = funnel;
  if (patch.partial) base.questionnaireDraft = Object.assign(base.questionnaireDraft || {}, patch.partial);
  if (patch.clientIp) base.clientIp = patch.clientIp;
  return base;
}

async function recordFunnelEvent(sql, input) {
  var leadId = input.leadId || input.lead_id;
  if (!leadId) leadId = randomUUID();

  var qStep = Number(input.step || input.questionnaire_step || 0);
  var qTotal = Number(input.step_total || input.questionnaire_total || 6) || 6;
  var pipelineStage = "new";
  if (input.event === "wizard_abandon" || input.abandoned) pipelineStage = "abandoned";
  else if (qStep > 0 && qStep < qTotal) pipelineStage = "questionnaire";
  else if (qStep >= qTotal) pipelineStage = "quote_sent";

  var payloadPatch = {
    event: input.event || "wizard_step",
    step: qStep,
    step_name: input.step_name || input.stepName,
    journey: input.journey || "full",
    partial: input.partial_payload || input.partial || null,
    abandoned: input.event === "wizard_abandon",
    blockage: input.blockage || null,
    last_step: qStep,
  };

  var existingPayload = null;
  try {
    const rows = await sql`SELECT payload FROM site_leads WHERE id = ${leadId} LIMIT 1`;
    if (rows.length) existingPayload = rows[0].payload;
  } catch (e) {}

  var merged = mergePayload(existingPayload, payloadPatch);
  var clientIp = normalizeClientIp(input.clientIp || input.client_ip);
  if (clientIp) merged.clientIp = clientIp;

  try {
    await sql`
      INSERT INTO site_leads (
        id, source, vertical, lead_score, email, phone, payload,
        pipeline_stage, status, questionnaire_step, questionnaire_total,
        form_id, last_activity_at, platform
      ) VALUES (
        ${leadId},
        ${String(input.source || "wizard_progress").slice(0, 120)},
        ${String(input.vertical || "").slice(0, 80)},
        ${Number(input.lead_score || 0)},
        ${input.email ? String(input.email).slice(0, 320) : null},
        ${input.phone ? String(input.phone).slice(0, 40) : null},
        ${JSON.stringify(merged)},
        ${pipelineStage},
        ${pipelineStage},
        ${qStep},
        ${qTotal},
        ${input.form_id ? String(input.form_id).slice(0, 120) : null},
        NOW(),
        ${input.platform ? String(input.platform).slice(0, 40) : null}
      )
      ON CONFLICT (id) DO UPDATE SET
        questionnaire_step = EXCLUDED.questionnaire_step,
        questionnaire_total = EXCLUDED.questionnaire_total,
        pipeline_stage = EXCLUDED.pipeline_stage,
        status = EXCLUDED.status,
        last_activity_at = NOW(),
        payload = EXCLUDED.payload,
        vertical = COALESCE(EXCLUDED.vertical, site_leads.vertical),
        email = COALESCE(EXCLUDED.email, site_leads.email),
        phone = COALESCE(EXCLUDED.phone, site_leads.phone)
    `;
  } catch (e) {
    throw e;
  }

  if (clientIp) {
    try {
      await sql`UPDATE site_leads SET client_ip = ${clientIp} WHERE id = ${leadId} AND client_ip IS NULL`;
    } catch (ipErr) {}
  }

  try {
    await sql`
      INSERT INTO lead_funnel_events (lead_id, event, step, step_name, journey, meta)
      VALUES (
        ${leadId},
        ${String(input.event || "wizard_step").slice(0, 80)},
        ${qStep},
        ${input.step_name ? String(input.step_name).slice(0, 120) : null},
        ${input.journey ? String(input.journey).slice(0, 40) : null},
        ${JSON.stringify(input.meta || {})}::jsonb
      )
    `;
  } catch (funnelTableErr) {
    /* table optionnelle */
  }

  return { leadId: leadId, pipelineStage: pipelineStage, payload: merged };
}

module.exports = { recordFunnelEvent: recordFunnelEvent, mergePayload: mergePayload };
