/**
 * GET/POST /api/dashboard/referral-partners — liste et création de codes parrain (admin).
 */
const { applyApiGuards, parseJsonBody } = require("../security");
const { getAuthUser } = require("../auth");
const { listPartners, upsertPartner } = require("../referral-store");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await getAuthUser(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Accès refusé" });
  }

  if (req.method === "GET") {
    const partners = await listPartners();
    return res.status(200).json({ ok: true, partners });
  }

  if (req.method === "POST") {
    const parsed = parseJsonBody(req);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const result = await upsertPartner(parsed.body || {});
    if (!result.ok) return res.status(400).json(result);
    return res.status(200).json({ ok: true, partner: result });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
};
