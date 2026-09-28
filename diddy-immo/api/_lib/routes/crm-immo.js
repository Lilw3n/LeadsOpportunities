/**
 * GET/POST/DELETE /api/crm/immo — biens, critères, parties, docs, matching.
 */
const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm } = require("../rbac");
const { getSql } = require("../db");
const store = require("../immo-properties-store");

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
      message: "Base non configurée — utilisation locale navigateur",
    });
  }

  try {
    if (req.method === "GET") {
      const entity = req.query.entity || "all";
      if (entity === "match") {
        const criteriaId = req.query.criteriaId || req.query.id;
        const db = await store.loadAll(sql);
        const criteria = db.criteria.find((c) => c.id === criteriaId);
        if (!criteria) return res.status(404).json({ error: "Critères introuvables" });
        const result = store.Matcher.matchPropertiesToBuyer(criteria, db.properties, {
          minScore: Number(req.query.minScore || 0),
        });
        return res.status(200).json({ ok: true, result });
      }
      const db = await store.loadAll(sql);
      return res.status(200).json({ ok: true, db });
    }

    if (req.method === "DELETE") {
      const entity = req.query.entity;
      const id = req.query.id;
      if (!entity || !id) return res.status(400).json({ error: "entity et id requis" });
      await store.deleteEntity(sql, entity, id);
      return res.status(200).json({ ok: true, deleted: id });
    }

    if (req.method === "POST" || req.method === "PATCH") {
      const parsed = parseJsonBody(req, 262144);
      if (parsed.error) return res.status(400).json({ error: parsed.error });
      const body = parsed.body || {};
      const entity = body.entity || req.query.entity;
      const item = body.item || body;

      if (entity === "match") {
        const db = await store.loadAll(sql);
        let criteria = body.criteria;
        if (body.criteriaId) {
          criteria = db.criteria.find((c) => c.id === body.criteriaId) || criteria;
        }
        if (!criteria) return res.status(400).json({ error: "criteria requis" });
        const result = store.Matcher.matchPropertiesToBuyer(
          criteria,
          body.properties || db.properties,
          body.opts || {}
        );
        return res.status(200).json({ ok: true, result });
      }

      let id;
      if (entity === "property") id = await store.upsertProperty(sql, item, user);
      else if (entity === "criteria") id = await store.upsertCriteria(sql, item, user);
      else if (entity === "party") id = await store.upsertParty(sql, item);
      else if (entity === "document") id = await store.upsertDocument(sql, item, user);
      else return res.status(400).json({ error: "entity invalide" });

      return res.status(200).json({ ok: true, id });
    }

    res.setHeader("Allow", "GET, POST, PATCH, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    console.error("[crm/immo]", e);
    return res.status(500).json({ ok: false, error: e.message || "Erreur serveur" });
  }
};
