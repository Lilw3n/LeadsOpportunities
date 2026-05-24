const { getAuthUser } = require("../auth");
const { applyApiGuards, parseJsonBody } = require("../security");
const { computeLeadRelevance } = require("../leadRelevance");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await getAuthUser(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Accès refusé" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: "JSON invalide" }); }
  }
  if (!body || !body.leadId) {
    return res.status(400).json({ error: "leadId requis" });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return res.status(500).json({ error: "Base de données non configurée" });

  try {
    const { neon } = require("@neondatabase/serverless");
    const sql = neon(dbUrl);

    const existing = await sql`SELECT id FROM site_leads WHERE id = ${body.leadId}`;
    if (existing.length === 0) {
      return res.status(404).json({ error: "Lead introuvable" });
    }

    const updates = {};
    if (body.status) {
      const validStatuses = [
        "new", "contacted", "qualified", "converted", "lost",
        "questionnaire", "tariff_editing", "quote_sent", "follow_up", "won",
      ];
      if (!validStatuses.includes(body.status)) {
        return res.status(400).json({ error: "Statut invalide" });
      }
      updates.status = body.status;
      updates.pipeline_stage = body.status;
    }
    if (body.notes !== undefined) {
      updates.notes = String(body.notes).slice(0, 5000);
    }
    if (body.assignedTo !== undefined) {
      updates.assigned_to = body.assignedTo || null;
    }

    if (body.pipeline_stage) {
      const stages = ["new", "questionnaire", "tariff_editing", "quote_sent", "follow_up", "won", "lost"];
      if (!stages.includes(body.pipeline_stage)) {
        return res.status(400).json({ error: "pipeline_stage invalide" });
      }
      await sql`
        UPDATE site_leads SET pipeline_stage = ${body.pipeline_stage}, status = ${body.pipeline_stage},
          updated_at = now(), last_activity_at = now()
        WHERE id = ${body.leadId}
      `;
    }

    if (body.status && body.notes !== undefined) {
      await sql`
        UPDATE site_leads SET status = ${updates.status}, pipeline_stage = ${updates.pipeline_stage || updates.status},
          notes = ${updates.notes}, updated_at = now(), last_activity_at = now()
        WHERE id = ${body.leadId}
      `;
    } else if (body.status) {
      await sql`
        UPDATE site_leads SET status = ${updates.status}, pipeline_stage = ${updates.pipeline_stage || updates.status},
          updated_at = now(), last_activity_at = now()
        WHERE id = ${body.leadId}
      `;
    } else if (body.notes !== undefined) {
      await sql`UPDATE site_leads SET notes = ${updates.notes}, updated_at = now() WHERE id = ${body.leadId}`;
    }

    if (body.assignedTo !== undefined) {
      await sql`UPDATE site_leads SET assigned_to = ${updates.assigned_to} WHERE id = ${body.leadId}`;
    }

    if (body.competitorMonthly !== undefined || body.ourOfferMonthly !== undefined) {
      const [row] = await sql`
        SELECT vertical, lead_score, payload, competitor_monthly, our_offer_monthly
        FROM site_leads WHERE id = ${body.leadId} LIMIT 1
      `;
      if (row) {
        var p = row.payload;
        if (typeof p === "string") {
          try { p = JSON.parse(p); } catch { p = {}; }
        }
        var comp = body.competitorMonthly != null ? Number(body.competitorMonthly) : row.competitor_monthly;
        var ours = body.ourOfferMonthly != null ? Number(body.ourOfferMonthly) : row.our_offer_monthly;
        var rel = computeLeadRelevance({
          vertical: row.vertical,
          leadScore: row.lead_score,
          competitorMonthly: comp,
          ourOfferMonthly: ours,
        });
        try {
          await sql`
            UPDATE site_leads SET
              competitor_monthly = ${comp},
              our_offer_monthly = ${ours},
              relevance = ${rel.relevance},
              updated_at = NOW()
            WHERE id = ${body.leadId}
          `;
        } catch (tariffErr) {
          var merged = Object.assign({}, p || {}, {
            competitorMonthly: comp,
            ourOfferMonthly: ours,
            relevance: rel.relevance,
            relevanceReasons: rel.relevanceReasons,
          });
          await sql`
            UPDATE site_leads SET payload = ${JSON.stringify(merged)}::jsonb, updated_at = NOW()
            WHERE id = ${body.leadId}
          `;
        }
      }
    }

    return res.status(200).json({ ok: true, message: "Lead mis à jour" });
  } catch (e) {
    console.error("[dashboard/lead-update]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
