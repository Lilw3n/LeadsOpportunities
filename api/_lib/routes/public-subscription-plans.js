const { applyApiGuards } = require("../security");
const { getPublicSubscriptionPlans } = require("../subscription-plans-store");

module.exports = async function publicSubscriptionPlans(req, res) {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const config = await getPublicSubscriptionPlans();
    res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=120");
    return res.status(200).json({ ok: true, ...config });
  } catch (e) {
    console.error("[subscription-plans public]", e);
    return res.status(500).json({ error: "Impossible de charger les formules." });
  }
};
