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
      var sql = getSql();
      var state;
      if (refresh) {
        state = await buildAndPersist({ sql: sql });
      } else {
        state = readJson(ACTIVE_PATH);
        if (!state) {
          state = await buildRotationState({ sql: sql });
        } else if (sql) {
          var cached = state;
          try {
            state = await Promise.race([
              buildRotationState({ sql: sql }),
              new Promise(function (_, reject) {
                setTimeout(function () {
                  reject(new Error("timeout"));
                }, 4000);
              }),
            ]);
          } catch (raceErr) {
            state = cached;
            console.warn("[crm/meta-rotation] stats timeout, cache utilisé");
          }
        }
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
