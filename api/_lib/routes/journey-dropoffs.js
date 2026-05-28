const { applyApiGuards } = require("../security");
const { requireDashboardAdmin } = require("../dashboard-admin");
const { getDropoffSummary } = require("../journey-store");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!(await requireDashboardAdmin(req, res))) return;

  try {
    const out = await getDropoffSummary(req.query.days);
    return res.status(200).json({ ok: true, days: out.days, kpis: out.kpis, rows: out.rows });
  } catch (e) {
    console.error("[journey-dropoffs]", e);
    return res.status(500).json({ ok: false, error: e.message || "Erreur stats parcours" });
  }
};
