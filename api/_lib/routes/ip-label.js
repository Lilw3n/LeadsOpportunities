/**
 * GET/POST /api/dashboard/ip-label — nommer une IP ou un préfixe (ex. 57.141.0.*)
 */
const { getAuthUser } = require("../auth");
const { applyApiGuards, parseJsonBody } = require("../security");
const { getSql } = require("../db");
const {
  ensureIpLabelsSchema,
  listIpLabels,
  setIpLabel,
  deleteIpLabel,
  resolveLabel,
  cleanIp,
  cleanIpKey,
  prefix24,
  prefix16,
} = require("../ip-labels");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await getAuthUser(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Accès refusé" });
  }

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de données non configurée" });
  await ensureIpLabelsSchema(sql);

  if (req.method === "GET") {
    const url = new URL(req.url, "http://localhost");
    const check = url.searchParams.get("ip");
    const labels = await listIpLabels(sql);
    if (check) {
      const ip = cleanIp(check);
      const hit = resolveLabel(ip, labels);
      return res.status(200).json({
        ok: true,
        ip: ip,
        prefix24: prefix24(ip),
        prefix16: prefix16(ip),
        label: hit,
        labels: labels,
      });
    }
    return res.status(200).json({ ok: true, labels: labels });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};

  if (body.action === "delete" || body.delete === true) {
    const key = cleanIpKey(body.ip_key || body.ip || body.prefix);
    const result = await deleteIpLabel(sql, key);
    if (!result.ok) return res.status(400).json(result);
    return res.status(200).json(result);
  }

  var scope = String(body.scope || "exact").toLowerCase();
  var rawKey = body.ip_key || body.prefix || body.ip;
  if (scope === "24" || scope === "prefix24" || scope === "/24") {
    rawKey = prefix24(body.ip) || cleanIpKey(body.prefix) || rawKey;
  } else if (scope === "16" || scope === "prefix16" || scope === "/16") {
    rawKey = prefix16(body.ip) || cleanIpKey(body.prefix) || rawKey;
  }

  const result = await setIpLabel(sql, rawKey, {
    label: body.label || body.name,
    note: body.note,
    contactId: body.contactId || body.contact_id,
    userId: user.userId || user.id,
  });
  if (!result.ok) return res.status(400).json(result);

  /* Optionnel : renommer la fiche interlocuteur liée (même si hypothèse approximative) */
  var contactId = body.contactId || body.contact_id || result.contact_id;
  var renameContact = body.renameContact === true || body.applyToContact === true;
  if (renameContact && contactId && result.label) {
    try {
      var parts = String(result.label).trim().split(/\s+/);
      var firstName = parts[0] || result.label;
      var lastName = parts.length > 1 ? parts.slice(1).join(" ") : null;
      await sql`
        UPDATE crm_contacts SET
          first_name = COALESCE(${firstName}, first_name),
          last_name = COALESCE(${lastName}, last_name),
          updated_at = NOW()
        WHERE id = ${contactId}
      `;
      result.contactRenamed = true;
      result.contact_id = contactId;
    } catch (e) {
      result.contactRenameError = e.message;
    }
  }

  return res.status(200).json(result);
};
