const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm, isSiteAdmin, effectiveCrmRole } = require("../rbac");
const { getSql } = require("../db");
const {
  getPartnerSitesCatalog,
  saveCatalogToDb,
  ensurePartnerSitesSchema,
  normalizeCatalog,
} = require("../partner-sites-store");

function canEdit(user) {
  if (!user) return false;
  if (isSiteAdmin(user)) return true;
  return effectiveCrmRole(user) === "admin";
}

module.exports = async function crmPartnerSites(req, res) {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await requireCrm(req, res);
  if (!user) return;

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });
  await ensurePartnerSitesSchema(sql);

  if (req.method === "GET") {
    const catalog = await getPartnerSitesCatalog({ sql: sql });
    return res.status(200).json({
      ok: true,
      canEdit: canEdit(user),
      publicUrl: "/sites-partenaires/",
      catalog: catalog,
    });
  }

  if (req.method === "PUT" || req.method === "POST") {
    if (!canEdit(user)) {
      return res.status(403).json({
        error: "Seuls les administrateurs peuvent publier les sites partenaires.",
      });
    }
    const parsed = parseJsonBody(req);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const body = parsed.body || {};
    const incoming = body.catalog || body;
    try {
      const saved = await saveCatalogToDb(sql, normalizeCatalog(incoming), user.id || user.email);
      return res.status(200).json({
        ok: true,
        catalog: saved,
        publicUrl: "/sites-partenaires/",
      });
    } catch (e) {
      console.error("[crm-partner-sites] save", e);
      return res.status(500).json({ error: "Publication impossible." });
    }
  }

  res.setHeader("Allow", "GET, PUT, POST");
  return res.status(405).json({ error: "Method not allowed" });
};
