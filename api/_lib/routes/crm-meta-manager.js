/**
 * GET /api/crm/meta-manager — gestionnaire Meta unifié
 * POST — enregistrer une page / groupe (liens UTM, pas de scrape)
 */
const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm, isSiteAdmin } = require("../rbac");
const { getSql } = require("../db");
const { buildMetaManagerOverview, registerPage } = require("../meta-manager");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await requireCrm(req, res);
  if (!user) return;

  if (req.method === "GET") {
    try {
      var url = new URL(req.url, "http://localhost");
      var days = url.searchParams.get("days") || "7";
      var sql = getSql();
      var overview = await buildMetaManagerOverview(sql, { days: days });
      overview.is_admin = isSiteAdmin(user);
      return res.status(200).json(overview);
    } catch (e) {
      console.error("[crm/meta-manager]", e);
      return res.status(500).json({ ok: false, error: e.message });
    }
  }

  if (req.method === "POST") {
    const parsed = parseJsonBody(req, 8192);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    var body = parsed.body || {};
    if (body.action === "register_page") {
      try {
        var page = registerPage({
          name: body.name,
          url: body.url,
          notes: body.notes,
        });
        return res.status(200).json({ ok: true, page: page });
      } catch (e) {
        return res.status(400).json({ ok: false, error: e.message });
      }
    }
    return res.status(400).json({ error: "action inconnue" });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
};
