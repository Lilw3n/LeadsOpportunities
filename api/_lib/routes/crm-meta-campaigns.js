/**
 * GET  /api/crm/meta-campaigns?preset=last_30d — campagnes Meta + dépense, clics, visites, leads
 * POST /api/crm/meta-campaigns { id, status: "PAUSED" | "ACTIVE" } — pause / relance
 * Une relance repousse aussi la sécurité pubs (sinon elle recoupe au prochain cron).
 */
const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm } = require("../rbac");
const { getSql } = require("../db");
const { listCampaigns, setCampaignStatus } = require("../meta-campaigns");
const { relaunch } = require("../ads-guard");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const auth = await requireCrm(req, res);
  if (!auth) return;

  try {
    if (req.method === "GET") {
      const url = new URL(req.url, "http://localhost");
      return res.status(200).json(Object.assign({ ok: true }, await listCampaigns(url.searchParams.get("preset"))));
    }
    if (req.method === "POST") {
      const parsed = parseJsonBody(req, 4096);
      if (parsed.error) return res.status(400).json({ ok: false, error: parsed.error });
      const body = parsed.body || {};
      const result = await setCampaignStatus(body.id, String(body.status || "").toUpperCase());
      if (result.status === "ACTIVE") {
        const sql = getSql();
        const who = (auth.user && (auth.user.email || auth.user.id)) || auth.email || "crm";
        if (sql) await relaunch(sql, String(who));
      }
      return res.status(200).json({ ok: true, campaign: result });
    }
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    console.error("[crm/meta-campaigns]", e);
    return res.status(502).json({ ok: false, error: e.message || "Erreur Meta" });
  }
};
