/**
 * Blocage d’IP (spam / robots) — table site_ip_blocks.
 */
const { normalizeClientIp } = require("./security");

async function ensureIpBlocksSchema(sql) {
  if (!sql) return false;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS site_ip_blocks (
        ip TEXT PRIMARY KEY,
        blocked BOOLEAN NOT NULL DEFAULT true,
        reason TEXT,
        created_by TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    return true;
  } catch (e) {
    console.warn("[ip-blocks] schema", e.message);
    return false;
  }
}

function cleanIp(ip) {
  return normalizeClientIp(ip) || "";
}

async function isIpBlocked(sql, ip) {
  var key = cleanIp(ip);
  if (!sql || !key) return false;
  try {
    const rows = await sql`
      SELECT ip FROM site_ip_blocks WHERE ip = ${key} AND blocked = true LIMIT 1
    `;
    return rows.length > 0;
  } catch (e) {
    return false;
  }
}

async function listBlockedIps(sql) {
  try {
    return await sql`
      SELECT ip, reason, created_by, created_at, updated_at
      FROM site_ip_blocks
      WHERE blocked = true
      ORDER BY updated_at DESC
      LIMIT 200
    `;
  } catch (e) {
    return [];
  }
}

async function setIpBlock(sql, ip, blocked, opts) {
  opts = opts || {};
  var key = cleanIp(ip);
  if (!key) return { ok: false, error: "IP invalide" };
  if (blocked) {
    await sql`
      INSERT INTO site_ip_blocks (ip, blocked, reason, created_by, updated_at)
      VALUES (${key}, true, ${opts.reason || null}, ${opts.userId || null}, NOW())
      ON CONFLICT (ip) DO UPDATE SET
        blocked = true,
        reason = COALESCE(${opts.reason || null}, site_ip_blocks.reason),
        created_by = COALESCE(${opts.userId || null}, site_ip_blocks.created_by),
        updated_at = NOW()
    `;
  } else {
    await sql`
      UPDATE site_ip_blocks
      SET blocked = false, updated_at = NOW(), created_by = ${opts.userId || null}
      WHERE ip = ${key}
    `;
  }
  return { ok: true, ip: key, blocked: !!blocked };
}

async function deleteLeadsByIp(sql, ip) {
  var key = cleanIp(ip);
  if (!key) return 0;
  const rows = await sql`
    SELECT id FROM site_leads
    WHERE client_ip = ${key}
       OR payload LIKE ${"%" + key + "%"}
    LIMIT 200
  `;
  var n = 0;
  for (var i = 0; i < rows.length; i++) {
    var id = rows[i].id;
    try {
      await sql`UPDATE site_leads SET parent_lead_id = NULL WHERE parent_lead_id = ${id}`;
      await sql`DELETE FROM site_leads WHERE id = ${id}`;
      n++;
    } catch (e) {}
  }
  return n;
}

module.exports = {
  ensureIpBlocksSchema,
  isIpBlocked,
  listBlockedIps,
  setIpBlock,
  deleteLeadsByIp,
  cleanIp,
};
