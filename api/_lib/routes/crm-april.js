/**
 * CRM — connexion API APRIL (statut + test firstCall).
 * GET  /api/crm/april?op=status
 * POST /api/crm/april  { action: "test" | "firstCall" | "token" }
 */
const { applyApiGuards } = require("../security");
const { requireCrm, effectiveCrmRole } = require("../rbac");
const April = require("../april-client");

function isAdmin(user) {
  var role = effectiveCrmRole(user);
  return role === "admin" || role === "owner";
}

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "object") return req.body;
  try {
    return JSON.parse(req.body);
  } catch (e) {
    return { error: "JSON invalide" };
  }
}

module.exports = async function crmApril(req, res) {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  var user = await requireCrm(req, res);
  if (!user) return;

  if (req.method === "GET") {
    var op = String(req.query.op || "status");
    if (op === "status") {
      return res.status(200).json({
        ok: true,
        april: April.configStatus(),
        docs: {
          store: "https://apistore.april.fr/",
          support: "api@april.com",
          guide: "/docs/APRIL-API.md",
        },
      });
    }
    return res.status(400).json({ error: "op inconnu" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!isAdmin(user)) {
    return res.status(403).json({ error: "Admin requis pour tester l’API APRIL" });
  }

  var body = parseBody(req);
  if (body.error) return res.status(400).json({ error: body.error });

  var action = String(body.action || "test");

  try {
    if (action === "status") {
      return res.status(200).json({ ok: true, april: April.configStatus() });
    }

    if (action === "token") {
      if (!April.isConfigured()) {
        return res.status(400).json({
          ok: false,
          error: "Variables PARTNER_APRIL_CLIENT_ID et PARTNER_APRIL_CLIENT_SECRET manquantes sur Vercel",
          april: April.configStatus(),
        });
      }
      await April.fetchAccessToken(true);
      return res.status(200).json({
        ok: true,
        step: "oauth_token",
        message: "Jeton OAuth2 obtenu (client_credentials)",
        april: April.configStatus(),
      });
    }

    if (action === "firstCall" || action === "test") {
      var result = await April.testConnection();
      return res.status(result.ok ? 200 : 502).json({
        ok: result.ok,
        result: result,
        april: April.configStatus(),
      });
    }

    return res.status(400).json({ error: "action inconnue (test | firstCall | token | status)" });
  } catch (e) {
    console.error("[crm/april]", e);
    return res.status(500).json({
      ok: false,
      error: e.message || "Erreur APRIL",
      code: e.code || null,
      april: April.configStatus(),
    });
  }
};
