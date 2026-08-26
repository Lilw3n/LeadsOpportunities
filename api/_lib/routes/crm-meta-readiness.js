/**
 * GET/POST /api/crm/meta-readiness — diagnostic pixel Meta + CAPI (admin CRM).
 * POST body optionnel : { "test_event_code": "TEST12345" } pour Events Manager → Test events.
 */
const { applyApiGuards } = require("../security");
const { requireCrm } = require("../rbac");
const { buildMetaReadiness, validateMetaCapiToken, sendMetaTestLead } = require("../meta-readiness");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await requireCrm(req, res);
  if (!user) return;
  if (user.role !== "admin" && user.crmRole !== "admin") {
    return res.status(403).json({ error: "Admin requis" });
  }

  if (req.method === "GET") {
    var readiness = buildMetaReadiness();
    var out = Object.assign({ ok: readiness.ok }, readiness);

    if (req.query.validate === "1" || req.query.validate === "true") {
      out.capi_validation = await validateMetaCapiToken();
      out.ok = out.ok && !!out.capi_validation.ok;
    }

    return res.status(200).json(out);
  }

  if (req.method === "POST") {
    var body = req.body || {};
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    var testCode = body.test_event_code || req.query.test_event_code || "";
    if (!testCode) {
      return res.status(400).json({
        ok: false,
        error: "test_event_code requis",
        hint: "Events Manager → Test events → copier le code, puis POST { test_event_code: \"TEST…\" }",
      });
    }

    var readiness = buildMetaReadiness();
    var capiTest = await sendMetaTestLead(testCode, req);
    return res.status(200).json({
      ok: !!capiTest.ok,
      readiness: readiness,
      capi_test: capiTest,
      hint: capiTest.ok
        ? "Vérifiez Events Manager → Test events : Lead serveur doit apparaître."
        : "Corriger META_CAPI_TOKEN sur Vercel puis Redeploy.",
    });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
};
