/**
 * GET  /api/crm/ads-guard — état de la sécurité pubs (délai, date limite)
 * POST /api/crm/ads-guard — « Relancer » : repart pour ADS_GUARD_DAYS jours
 */
const { applyApiGuards } = require("../security");
const { requireCrm } = require("../rbac");
const { getSql } = require("../db");
const { getState, relaunch } = require("../ads-guard");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const auth = await requireCrm(req, res);
  if (!auth) return;

  const sql = getSql();
  if (!sql) return res.status(503).json({ ok: false, error: "Base de données indisponible" });

  try {
    if (req.method === "GET") {
      return res.status(200).json({ ok: true, guard: await getState(sql) });
    }
    if (req.method === "POST") {
      const who = (auth.user && (auth.user.email || auth.user.id)) || auth.email || "crm";
      return res.status(200).json({ ok: true, guard: await relaunch(sql, String(who)) });
    }
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    console.error("[crm/ads-guard]", e);
    return res.status(500).json({ ok: false, error: e.message || "Erreur sécurité pubs" });
  }
};
