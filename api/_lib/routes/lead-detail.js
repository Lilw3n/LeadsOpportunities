const { getAuthUser } = require("../auth");
const { applyApiGuards } = require("../security");
const { enrichLeadRow } = require("../leads-filters");
const { markLeadOpened } = require("../lead-workflow");

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

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await getAuthUser(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Accès refusé" });
  }

  const url = new URL(req.url, "http://localhost");
  const leadId = url.searchParams.get("id");
  if (!leadId) return res.status(400).json({ error: "id requis" });

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return res.status(500).json({ error: "Base de données non configurée" });

  try {
    const { neon } = require("@neondatabase/serverless");
    const sql = neon(dbUrl);

    let rows;
    try {
      rows = await sql`
        SELECT id, source, vertical, lead_score, email, phone,
               utm_source, utm_medium, utm_campaign, gclid, visitor_id,
               COALESCE(status, 'new') AS status, notes, assigned_to,
               payload, created_at, updated_at, opened_at, platform,
               competitor_monthly, our_offer_monthly, relevance, client_ip,
               landing_slug, seo_city, seo_product, pipeline_stage,
               questionnaire_step, questionnaire_total
        FROM site_leads WHERE id = ${leadId}
      `;
    } catch (colErr) {
      rows = await sql`
        SELECT id, source, vertical, lead_score, email, phone,
               utm_source, utm_medium, utm_campaign, gclid, visitor_id,
               COALESCE(status, 'new') AS status, notes, assigned_to,
               payload, created_at, updated_at, platform
        FROM site_leads WHERE id = ${leadId}
      `;
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: "Lead introuvable" });
    }

    const lead = enrichLeadRow(rows[0]);
    lead.payload = parsePayload(lead.payload);

    var openedIso = new Date().toISOString();
    await markLeadOpened(sql, leadId, user.id);

    try {
      var patch = Object.assign({}, lead.payload, { openedAt: openedIso });
      var payloadStr = safePayloadString(patch);
      await sql`
        UPDATE site_leads SET payload = ${payloadStr}, updated_at = NOW()
        WHERE id = ${leadId}
      `;
      lead.opened_at = lead.opened_at || openedIso;
      lead.payload = patch;
    } catch (patchErr) {
      try {
        var patch2 = Object.assign({}, lead.payload, { openedAt: openedIso });
        await sql`
          UPDATE site_leads SET payload = ${safePayloadString(patch2)}
          WHERE id = ${leadId}
        `;
        lead.payload = patch2;
      } catch (patchErr2) {
        console.warn("[dashboard/lead-detail] payload patch skipped", patchErr2.message);
        lead.payload.openedAt = openedIso;
      }
    }

    return res.status(200).json({ ok: true, lead });
  } catch (e) {
    console.error("[dashboard/lead-detail]", e);
    return res.status(500).json({ error: "Erreur serveur", detail: e.message });
  }
};
