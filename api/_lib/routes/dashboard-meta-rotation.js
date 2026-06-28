/**
 * GET /api/dashboard/meta-rotation — rotation Meta (admin dashboard)
 */
const { applyApiGuards } = require("../security");
const { requireDashboardAdmin } = require("../dashboard-admin");
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
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!(await requireDashboardAdmin(req, res))) return;

  try {
    var refresh = String(req.query.refresh || "") === "1";
    var sql = getSql();
    var state;
    if (refresh) {
      state = await buildAndPersist({ sql: sql });
    } else {
      state = readJson(ACTIVE_PATH);
      if (!state) state = await buildRotationState({ sql: sql });
      else if (sql) state = await buildRotationState({ sql: sql });
    }
    return res.status(200).json({ ok: true, rotation: toCrmPayload(state) });
  } catch (e) {
    console.error("[dashboard/meta-rotation]", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
};
