/**
 * GET /api/crm/pubs-hub — liens gestion pubs + campagne active + formulaires Meta
 */
const { applyApiGuards } = require("../security");
const { requireCrm } = require("../rbac");
const { getSql } = require("../db");
const { buildPubsHub } = require("../ad-platform-hub");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const auth = await requireCrm(req, res);
  if (!auth) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    var sql = getSql();
    var hub = await buildPubsHub({ sql: sql });
    return res.status(200).json(hub);
  } catch (e) {
    console.error("[crm/pubs-hub]", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
};
