/**
 * GET /api/crm/agent-payment-splits — historique répartition Stripe poche / charges
 */
const { requireCrm } = require("../rbac");
const { listAgentPaymentSplits } = require("../stripe-payment-store");

module.exports = async (req, res) => {
  const user = await requireCrm(req, res);
  if (!user) return;
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  const limit = Number(req.query.limit) || 30;
  const result = await listAgentPaymentSplits(limit);
  return res.status(200).json(result);
};
