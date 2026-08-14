/**
 * GET /api/dashboard/referral-stats — tableau de bord parrainage (admin).
 */
const { applyApiGuards } = require("../security");
const { getAuthUser } = require("../auth");
const { getDashboardSummary } = require("../referral-store");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await getAuthUser(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Accès refusé" });
  }

  const summary = await getDashboardSummary();
  return res.status(200).json({ ok: true, ...summary });
};
