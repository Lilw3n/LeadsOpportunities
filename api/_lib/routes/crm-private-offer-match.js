/**
 * GET/POST /api/crm/private-offer-match — matching prive VSP, CRM only.
 */
const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm } = require("../rbac");
const { getSql } = require("../db");
const { matchVspPrivateOffers } = require("../private-offer-matcher");

async function findLead(sql, leadId) {
  if (!sql || !leadId) return null;
  const rows = await sql`
    SELECT *
    FROM site_leads
    WHERE id = ${leadId}
    LIMIT 1
  `;
  return rows[0] || null;
}

async function saveSnapshot(sql, leadId, result) {
  if (!sql || !leadId) return;
  try {
    await sql`
      UPDATE site_leads
      SET tariff_snapshot = ${JSON.stringify({
        type: "private_vsp_match",
        bestActor: result.bestActor,
        insights: result.insights,
        generatedAt: result.generatedAt,
      })},
      tariff_insurer = ${result.bestActor ? result.bestActor.partnerName : null},
      priority = ${result.insights && result.insights.priority ? result.insights.priority : "medium"},
      updated_at = NOW()
      WHERE id = ${leadId}
    `;
  } catch (e) {
    console.warn("[crm/private-offer-match] snapshot skipped", e.message);
  }
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await requireCrm(req, res);
  if (!user) return;

  const sql = getSql();

  if (req.method === "GET") {
    const url = new URL(req.url, "http://localhost");
    const leadId = url.searchParams.get("leadId") || url.searchParams.get("id");
    if (!leadId) return res.status(400).json({ error: "leadId requis" });

    try {
      const lead = await findLead(sql, leadId);
      if (!lead) return res.status(404).json({ error: "Lead introuvable" });
      const result = matchVspPrivateOffers(lead);
      await saveSnapshot(sql, leadId, result);
      return res.status(200).json({ ok: true, result });
    } catch (e) {
      console.error("[crm/private-offer-match GET]", e);
      return res.status(500).json({ error: "Matching prive impossible", detail: e.message });
    }
  }

  if (req.method === "POST") {
    const parsed = parseJsonBody(req, 131072);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const body = parsed.body || {};

    try {
      let input = body.payload || body;
      if (body.leadId && sql) {
        const lead = await findLead(sql, body.leadId);
        if (!lead) return res.status(404).json({ error: "Lead introuvable" });
        input = Object.assign({}, input, lead);
      }
      const result = matchVspPrivateOffers(input);
      if (body.leadId) await saveSnapshot(sql, body.leadId, result);
      return res.status(200).json({ ok: true, result });
    } catch (e) {
      console.error("[crm/private-offer-match POST]", e);
      return res.status(500).json({ error: "Matching prive impossible", detail: e.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
