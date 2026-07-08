/**
 * GET /api/crm/meta-rotation — rotation Meta + CPL (CRM auth)
 */
const { applyApiGuards } = require("../security");
const { requireCrm } = require("../rbac");
const { getSql } = require("../db");
const {
  readJson,
  buildRotationState,
  toCrmPayload,
  ACTIVE_PATH,
  buildAndPersist,
} = require("../meta-campaign-rotation");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const auth = await requireCrm(req, res);
  if (!auth) return;

  if (req.method === "GET") {
    try {
      var refresh = String(req.query.refresh || "") === "1";
      var cached = readJson(ACTIVE_PATH);
      if (!refresh && cached) {
        return res.status(200).json({ ok: true, rotation: toCrmPayload(cached) });
      }

      var sql = getSql();
      var state;
      if (refresh) {
        state = await buildAndPersist({ sql: sql });
      } else {
        state = cached || (await buildRotationState({ sql: sql }));
      }
      if (!state) state = await buildRotationState({ sql: null });
      return res.status(200).json({ ok: true, rotation: toCrmPayload(state) });
    } catch (e) {
      console.error("[crm/meta-rotation]", e);
      try {
        var fallback = readJson(ACTIVE_PATH);
        if (fallback) {
          return res.status(200).json({ ok: true, partial: true, rotation: toCrmPayload(fallback) });
        }
      } catch (e2) {}
      return res.status(200).json({ ok: false, error: e.message });
    }
  }

  res.setHeader("Allow", "GET");
  return res.status(405).json({ error: "Method not allowed" });
};
