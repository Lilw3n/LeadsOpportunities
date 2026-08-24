/**
 * GET /api/crm/contact-slack?id=
 * Liste les fiches Slack liées au contact + réponses du thread.
 */
const { applyApiGuards } = require("../security");
const { requireCrm } = require("../rbac");
const { getSql } = require("../db");
const { fetchSlackThread, slackConfigured, getRawToken } = require("../slack-notify");
const { parseMeta } = require("../hydrate-interlocuteur");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await requireCrm(req, res);
  if (!user) return;

  const contactId = String(req.query.id || req.query.contactId || "").trim();
  if (!contactId) return res.status(400).json({ error: "id requis" });

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  try {
    const rows = await sql`SELECT id, metadata FROM crm_contacts WHERE id = ${contactId} LIMIT 1`;
    if (!rows.length) return res.status(404).json({ error: "Contact introuvable" });

    const meta = parseMeta(rows[0].metadata);
    const links = Array.isArray(meta.slackLinks) ? meta.slackLinks.slice().reverse() : [];
    const configured = slackConfigured();
    const canReadThreads = !!getRawToken();

    const threads = [];
    for (let i = 0; i < links.length && i < 12; i++) {
      const link = links[i] || {};
      const channel = link.channel || "";
      const ts = link.ts || "";
      const base = {
        channel: channel,
        channelName: link.channelName || null,
        ts: ts,
        permalink: link.permalink || null,
        postedAt: link.postedAt || null,
        via: link.via || null,
        messages: [],
        replyCount: 0,
        error: null,
      };
      if (!channel || !ts) {
        base.error = "Lien Slack incomplet";
        threads.push(base);
        continue;
      }
      if (!canReadThreads) {
        base.error =
          "Lecture des réponses nécessite SLACK_BOT_TOKEN (webhook seul = envoi sans thread).";
        threads.push(base);
        continue;
      }
      const thread = await fetchSlackThread(channel, ts);
      if (!thread.ok) {
        base.error = thread.error || "Impossible de lire le thread";
        threads.push(base);
        continue;
      }
      base.messages = thread.messages || [];
      base.replyCount = Math.max(0, base.messages.length - 1);
      threads.push(base);
    }

    return res.status(200).json({
      ok: true,
      configured: configured,
      canReadThreads: canReadThreads,
      linkCount: links.length,
      threads: threads,
      hint: links.length
        ? null
        : "Aucune fiche Slack liée pour l’instant. Cliquez « Envoyer sur Slack » (avec SLACK_BOT_TOKEN) pour créer un lien + lire les réponses.",
    });
  } catch (e) {
    console.error("[crm/contact-slack]", e);
    return res.status(500).json({ error: e.message || "Erreur serveur" });
  }
};
