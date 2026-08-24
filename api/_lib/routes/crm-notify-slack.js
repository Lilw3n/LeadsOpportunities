/**
 * GET/POST /api/crm/notify-slack
 * GET  → statut webhook
 * POST → test, ou notification d’une fiche interlocuteur
 */
const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm } = require("../rbac");
const { getSql } = require("../db");
const { sendSlackText, slackConfigured } = require("../slack-notify");
const { sendSlackTestMessage } = require("../lead-post-ingest");
const { notifyInterlocuteurSlack, parseMeta } = require("../hydrate-interlocuteur");
const Dossier = require("../../../js/interlocuteur-dossier-lib");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await requireCrm(req, res);
  if (!user) return;

  const configured = slackConfigured();

  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      configured: configured,
      hint: configured
        ? "Slack actif (token ou webhook)"
        : "Vercel → SLACK_BOT_TOKEN (ou SLACK_WEBHOOK_URL) → Redeploy",
    });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};

  try {
    if (body.contactId) {
      const sql = getSql();
      if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });
      const rows = await sql`SELECT * FROM crm_contacts WHERE id = ${body.contactId} LIMIT 1`;
      if (!rows.length) return res.status(404).json({ error: "Contact introuvable" });
      const c = rows[0];
      const meta = parseMeta(c.metadata);
      const leadRows = await sql`
        SELECT * FROM site_leads WHERE contact_id = ${c.id} ORDER BY created_at DESC LIMIT 1
      `;
      const lead = leadRows[0] || {
        email: c.email,
        phone: c.phone,
        payload: JSON.stringify((meta.dossier && meta.dossier.raw) || meta.dossier || {}),
      };
      const dossier = Dossier.buildDossier(lead);
      const result = await notifyInterlocuteurSlack(dossier, c.id, sql);
      if (!result.ok) {
        return res.status(result.error && String(result.error).indexOf("non défini") >= 0 ? 503 : 502).json({
          ok: false,
          error: result.error,
          hint: "Ajouter SLACK_BOT_TOKEN (ou SLACK_WEBHOOK_URL) sur Vercel puis Redeploy",
        });
      }
      return res.status(200).json({
        ok: true,
        message: "Fiche envoyée sur Slack",
        channel: result.channel || null,
        ts: result.ts || null,
        permalink: result.permalink || null,
        linked: !!(result.ts && result.channelId),
      });
    }

    if (body.text) {
      const result = await sendSlackText(body.text);
      if (!result.ok) {
        return res.status(502).json({ ok: false, error: result.error });
      }
      return res.status(200).json({ ok: true, message: "Message Slack envoyé" });
    }

    const result = await sendSlackTestMessage();
    if (!result.ok) {
      return res.status(result.error && result.error.indexOf("non défini") >= 0 ? 503 : 502).json({
        ok: false,
        error: result.error,
        hint: "Vercel → Settings → Environment Variables → SLACK_BOT_TOKEN ou SLACK_WEBHOOK_URL → Redeploy",
      });
    }
    return res.status(200).json({ ok: true, message: "Message test envoyé sur Slack" });
  } catch (e) {
    console.error("[crm/notify-slack]", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
};
