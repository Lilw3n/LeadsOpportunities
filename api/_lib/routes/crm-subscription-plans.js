const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm, isSiteAdmin, effectiveCrmRole } = require("../rbac");
const { getSql } = require("../db");
const {
  getSubscriptionPlansConfig,
  saveConfigToDb,
  ensureSubscriptionPlansSchema,
} = require("../subscription-plans-store");
const { normalizeConfig } = require("../subscription-plans");

function canEditPlans(user) {
  if (!user) return false;
  if (isSiteAdmin(user)) return true;
  return effectiveCrmRole(user) === "admin";
}

module.exports = async function crmSubscriptionPlans(req, res) {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await requireCrm(req, res);
  if (!user) return;

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });
  await ensureSubscriptionPlansSchema(sql);

  if (req.method === "GET") {
    const config = await getSubscriptionPlansConfig({ sql: sql });
    return res.status(200).json({
      ok: true,
      canEdit: canEditPlans(user),
      publicUrl: "/abonnements/",
      checkoutApi: "/api/stripe/create-subscription-checkout",
      config: config,
    });
  }

  if (req.method === "PUT" || req.method === "POST") {
    if (!canEditPlans(user)) {
      return res.status(403).json({
        error: "Seuls les administrateurs peuvent modifier les formules.",
      });
    }
    const parsed = parseJsonBody(req);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const body = parsed.body || {};
    const incoming = body.config || body;
    try {
      const saved = await saveConfigToDb(sql, normalizeConfig(incoming), user.id || user.email);
      return res.status(200).json({
        ok: true,
        config: saved,
        publicUrl: "/abonnements/",
      });
    } catch (e) {
      console.error("[crm-subscription-plans] save", e);
      return res.status(500).json({ error: "Enregistrement impossible." });
    }
  }

  res.setHeader("Allow", "GET, PUT, POST");
  return res.status(405).json({ error: "Method not allowed" });
};
