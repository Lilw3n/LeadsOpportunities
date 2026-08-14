const { getAuthUser } = require("../auth");
const { applyApiGuards, parseJsonBody } = require("../security");
const { getSql } = require("../db");
const {
  ensureIpBlocksSchema,
  listBlockedIps,
  setIpBlock,
  deleteLeadsByIp,
  isIpBlocked,
  cleanIp,
} = require("../ip-blocks");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await getAuthUser(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Accès refusé" });
  }

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de données non configurée" });
  await ensureIpBlocksSchema(sql);

  if (req.method === "GET") {
    const url = new URL(req.url, "http://localhost");
    const check = url.searchParams.get("ip");
    if (check) {
      const ip = cleanIp(check);
      const blocked = await isIpBlocked(sql, ip);
      return res.status(200).json({ ok: true, ip: ip, blocked: blocked });
    }
    const rows = await listBlockedIps(sql);
    return res.status(200).json({ ok: true, blocks: rows });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};
  const ip = cleanIp(body.ip);
  if (!ip) return res.status(400).json({ error: "ip requise" });

  const blocked = body.blocked !== false && body.blocked !== "false" && body.action !== "unblock";
  const result = await setIpBlock(sql, ip, blocked, {
    reason: body.reason || (blocked ? "admin" : "unblock"),
    userId: user.userId || user.id,
  });
  if (!result.ok) return res.status(400).json(result);

  var deleted = 0;
  if (blocked && body.deleteLeads) {
    deleted = await deleteLeadsByIp(sql, ip);
  }

  return res.status(200).json({
    ok: true,
    ip: result.ip,
    blocked: result.blocked,
    deletedLeads: deleted,
  });
};
