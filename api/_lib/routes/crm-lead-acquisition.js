/**
 * GET/PATCH /api/crm/lead-acquisition?id= — fiche lead acquisition + bordereau
 */
const { applyApiGuards, parseJsonBody, sanitizeEnum } = require("../security");
const { requireCrm } = require("../rbac");
const { getSql } = require("../db");
const { archiveLead, assignLead, markLeadOpened, recordLeadEvent } = require("../lead-workflow");
const { ensureSiteLeadsSchema } = require("../ensure-schema");

const STAGES = ["new", "questionnaire", "tariff_editing", "quote_sent", "follow_up", "won", "lost"];
const PRIORITIES = ["low", "medium", "high"];

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await requireCrm(req, res);
  if (!user) return;

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  const url = new URL(req.url, "http://localhost");
  const leadId = url.searchParams.get("id");
  if (!leadId) return res.status(400).json({ error: "id requis" });

  if (req.method === "GET") {
    try {
      const rows = await sql`
        SELECT * FROM site_leads WHERE id = ${leadId} LIMIT 1
      `;
      if (!rows.length) return res.status(404).json({ error: "Lead introuvable" });
      await markLeadOpened(sql, leadId, user.id);
      var row = rows[0];
      var payload = {};
      try {
        payload = row.payload ? JSON.parse(row.payload) : {};
      } catch (e) {}
      return res.status(200).json({
        ok: true,
        lead: Object.assign({}, row, {
          payload_obj: payload,
          tariff_snapshot_obj: row.tariff_snapshot ? JSON.parse(row.tariff_snapshot) : null,
        }),
      });
    } catch (e) {
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  if (req.method === "PATCH") {
    const parsed = parseJsonBody(req, 65536);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const body = parsed.body || {};

    try {
      await ensureSiteLeadsSchema(sql);
      const existing = await sql`SELECT id FROM site_leads WHERE id = ${leadId}`;
      if (!existing.length) return res.status(404).json({ error: "Lead introuvable" });

        if (body.action === "open") {
          await markLeadOpened(sql, leadId, user.id);
          await recordLeadEvent(sql, {
            leadId,
            actorId: user.id,
            eventType: "lead_opened",
            source: "crm",
            title: "Lead ouvert",
            important: false,
          });
        }

        if (body.action === "archive") {
          await archiveLead(sql, leadId, user.id, body.archive_reason || body.reason || "Archive manuel");
        }

        if (body.action === "unarchive") {
          await sql`
            UPDATE site_leads
            SET archived_at = NULL, archived_by = NULL, archive_reason = NULL, updated_at = NOW()
            WHERE id = ${leadId}
          `;
          await recordLeadEvent(sql, {
            leadId,
            actorId: user.id,
            eventType: "lead_unarchived",
            source: "crm",
            title: "Lead desarchive",
            important: false,
          });
        }

        if (body.action === "assign" || body.assigned_to !== undefined || body.shared_with !== undefined) {
          await assignLead(sql, leadId, user.id, body.assigned_to || body.assignedTo || null, body.shared_with || body.sharedWith || []);
        }

      if (body.pipeline_stage) {
        var st = sanitizeEnum(body.pipeline_stage, STAGES, null);
        if (!st) return res.status(400).json({ error: "pipeline_stage invalide" });
        await sql`
          UPDATE site_leads SET pipeline_stage = ${st}, status = ${st}, updated_at = NOW(), last_activity_at = NOW()
          WHERE id = ${leadId}
        `;
      }
      if (body.questionnaire_step != null) {
        await sql`
          UPDATE site_leads SET questionnaire_step = ${Number(body.questionnaire_step) || 0},
            questionnaire_total = ${Number(body.questionnaire_total) || 10},
            pipeline_stage = COALESCE(pipeline_stage, 'questionnaire'),
            updated_at = NOW(), last_activity_at = NOW()
          WHERE id = ${leadId}
        `;
      }
      if (body.priority) {
        var pr = sanitizeEnum(body.priority, PRIORITIES, "medium");
        await sql`UPDATE site_leads SET priority = ${pr}, updated_at = NOW() WHERE id = ${leadId}`;
      }
      if (body.next_followup_at !== undefined) {
        await sql`
          UPDATE site_leads SET next_followup_at = ${body.next_followup_at || null},
            pipeline_stage = COALESCE(pipeline_stage, 'follow_up'), updated_at = NOW()
          WHERE id = ${leadId}
        `;
      }
      if (body.notes !== undefined) {
        await sql`UPDATE site_leads SET notes = ${String(body.notes).slice(0, 5000)}, updated_at = NOW() WHERE id = ${leadId}`;
      }
      if (body.tariff_insurer) {
        await sql`
          UPDATE site_leads SET tariff_insurer = ${String(body.tariff_insurer).slice(0, 80)},
            pipeline_stage = 'tariff_editing', updated_at = NOW(), last_activity_at = NOW()
          WHERE id = ${leadId}
        `;
      }
      if (body.tariff_snapshot) {
        await sql`
          UPDATE site_leads SET tariff_snapshot = ${JSON.stringify(body.tariff_snapshot)},
            updated_at = NOW(), last_activity_at = NOW()
          WHERE id = ${leadId}
        `;
      }

      return res.status(200).json({ ok: true, leadId: leadId, archived: body.action === "archive" });
    } catch (e) {
      console.error("[crm/lead-acquisition PATCH]", e);
      return res.status(500).json({
        error: "Erreur serveur",
        detail: /column .* does not exist/i.test(String(e.message || ""))
          ? "Colonnes site_leads manquantes — schéma CRM en cours de mise à jour, réessayez."
          : undefined,
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
