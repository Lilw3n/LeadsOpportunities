/**
 * GET/POST/PATCH/DELETE /api/crm/markets-presence
 * Marchés et horaires de présence — éditable par tous les utilisateurs CRM.
 */
const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm, ALL_CRM_ROLES } = require("../rbac");
const { getSql } = require("../db");
const {
  listMarketsPresence,
  upsertMarket,
  upsertPresenceSlot,
  deleteMarket,
  deletePresenceSlot,
} = require("../markets-presence-store");

function canEditPresence(user) {
  return user && ALL_CRM_ROLES.indexOf(user.crmRole) !== -1 || user.role === "admin";
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await requireCrm(req, res);
  if (!user) return;

  if (!canEditPresence(user) && req.method !== "GET") {
    return res.status(403).json({ error: "Accès refusé" });
  }

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de données non configurée" });

  try {
    if (req.method === "GET") {
      var days = req.query.days || 28;
      var data = await listMarketsPresence({
        days: days,
        seed: true,
        userId: user.id,
      });
      return res.status(200).json(data);
    }

    if (req.method === "DELETE") {
      var entity = req.query.entity || "slot";
      var delId = req.query.id;
      if (!delId) return res.status(400).json({ error: "id requis" });
      if (entity === "market") await deleteMarket(sql, delId);
      else await deletePresenceSlot(sql, delId);
      return res.status(200).json({ ok: true, deleted: delId });
    }

    const parsed = parseJsonBody(req);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const body = parsed.body || {};
    var entityType = body.entity || req.query.entity || "slot";

    if (req.method === "POST" || req.method === "PATCH") {
      var savedId;
      if (entityType === "market") {
        savedId = await upsertMarket(sql, body, user);
      } else {
        savedId = await upsertPresenceSlot(sql, body, user);
      }
      var refreshed = await listMarketsPresence({ days: body.days || 28, userId: user.id });
      return res.status(200).json({ ok: true, id: savedId, data: refreshed });
    }

    res.setHeader("Allow", "GET, POST, PATCH, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    console.error("[crm/markets-presence]", e);
    return res.status(500).json({ ok: false, error: e.message || "Erreur serveur" });
  }
};
