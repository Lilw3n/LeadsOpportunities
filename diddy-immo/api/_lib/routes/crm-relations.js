/**
 * GET/POST/DELETE /api/crm/relations — liens famille, SCI, héritiers, parrainage.
 * Jamais de montant ni de promesse aux apporteurs.
 */
const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm } = require("../rbac");
const { getSql } = require("../db");
const store = require("../contact-relations-store");
const Rel = require("../../../js/crm-people-relations-lib.js");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await requireCrm(req, res);
  if (!user) return;

  const sql = getSql();
  if (!sql) {
    return res.status(200).json({
      ok: true,
      offline: true,
      relations: [],
      disclaimer: Rel.NO_PROMISE,
      message: "Base non configurée — utilisation locale navigateur",
    });
  }

  try {
    await store.ensureRelationsSchema(sql);

    if (req.method === "GET") {
      const contactId = req.query.contactId || req.query.contact_id || null;
      const relType = req.query.relType || req.query.rel_type || null;
      const relations = await store.listRelations(sql, {
        contactId,
        relType,
        limit: req.query.limit,
      });
      return res.status(200).json({
        ok: true,
        relations,
        disclaimer: Rel.NO_PROMISE,
      });
    }

    if (req.method === "DELETE") {
      const id = req.query.id;
      if (!id) return res.status(400).json({ error: "id requis" });
      await store.deleteRelationship(sql, id);
      return res.status(200).json({ ok: true, deleted: id });
    }

    if (req.method === "POST" || req.method === "PATCH") {
      const parsed = parseJsonBody(req);
      if (parsed.error) return res.status(400).json({ error: parsed.error });
      const body = parsed.body || {};
      const item = body.item || body;
      if (Rel.hasForbiddenPromise(item)) {
        return res.status(400).json({
          error: Rel.NO_PROMISE,
          code: "no_promise",
        });
      }
      const saved = await store.upsertRelationship(sql, item, user);
      return res.status(200).json({
        ok: true,
        relation: saved,
        id: saved && saved.id,
        disclaimer: Rel.NO_PROMISE,
      });
    }

    return res.status(405).json({ error: "Méthode non autorisée" });
  } catch (e) {
    console.error("[crm/relations]", e);
    return res.status(200).json({
      ok: false,
      error: e.message || "Erreur serveur",
    });
  }
};
