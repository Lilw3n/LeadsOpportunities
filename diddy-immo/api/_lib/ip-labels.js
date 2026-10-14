/**
 * Libellés manuels d’IP / préfixes (ex. 57.141.0.*) — identification CRM.
 * Permet de nommer une IP ou un bloc même si l’hypothèse est incertaine.
 */
const { normalizeClientIp } = require("./security");

async function ensureIpLabelsSchema(sql) {
  if (!sql) return false;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS site_ip_labels (
        ip_key TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        note TEXT,
        contact_id TEXT,
        created_by TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    return true;
  } catch (e) {
    console.warn("[ip-labels] schema", e.message);
    return false;
  }
}

function cleanIp(ip) {
  return normalizeClientIp(ip) || "";
}

/** Normalise une clé : IP exacte, ou préfixe se terminant par "." (ex. 57.141.0.) */
function cleanIpKey(raw) {
  var s = String(raw || "").trim().toLowerCase();
  if (!s) return "";
  if (s.indexOf("::ffff:") === 0) s = s.slice(7);
  s = s.replace(/\s+/g, "");
  if (/\*$/.test(s)) s = s.replace(/\*+$/, "");
  if (/\/24$/i.test(s)) {
    s = s.replace(/\/24$/i, "");
    var parts24 = s.split(".");
    if (parts24.length >= 3) s = parts24.slice(0, 3).join(".") + ".";
  }
  if (/\/16$/i.test(s)) {
    s = s.replace(/\/16$/i, "");
    var parts16 = s.split(".");
    if (parts16.length >= 2) s = parts16.slice(0, 2).join(".") + ".";
  }
  if (s.endsWith(".")) {
    var pref = s.replace(/\.+$/, "");
    var segs = pref.split(".").filter(Boolean);
    if (segs.length < 2 || segs.length > 3) return "";
    if (!segs.every(function (x) {
      return /^\d{1,3}$/.test(x) && Number(x) <= 255;
    }))
      return "";
    return segs.join(".") + ".";
  }
  var ip = cleanIp(s);
  return ip || "";
}

function prefix24(ip) {
  var n = cleanIp(ip);
  if (!n) return "";
  var parts = n.split(".");
  if (parts.length !== 4) return "";
  return parts[0] + "." + parts[1] + "." + parts[2] + ".";
}

function prefix16(ip) {
  var n = cleanIp(ip);
  if (!n) return "";
  var parts = n.split(".");
  if (parts.length !== 4) return "";
  return parts[0] + "." + parts[1] + ".";
}

/**
 * Résout le meilleur libellé pour une IP (exact > /24 > /16).
 */
function resolveLabel(ip, rows) {
  var n = cleanIp(ip);
  if (!n || !rows || !rows.length) return null;
  var map = {};
  rows.forEach(function (r) {
    if (r && r.ip_key) map[String(r.ip_key).toLowerCase()] = r;
  });
  if (map[n]) return map[n];
  var p24 = prefix24(n);
  if (p24 && map[p24]) return map[p24];
  var p16 = prefix16(n);
  if (p16 && map[p16]) return map[p16];
  return null;
}

async function listIpLabels(sql) {
  try {
    return await sql`
      SELECT ip_key, label, note, contact_id, created_by, created_at, updated_at
      FROM site_ip_labels
      ORDER BY updated_at DESC
      LIMIT 500
    `;
  } catch (e) {
    return [];
  }
}

async function getIpLabel(sql, ipOrKey) {
  var key = cleanIpKey(ipOrKey) || cleanIp(ipOrKey);
  if (!key) return null;
  try {
    const rows = await sql`
      SELECT ip_key, label, note, contact_id, created_by, created_at, updated_at
      FROM site_ip_labels
      WHERE ip_key = ${key}
      LIMIT 1
    `;
    return rows[0] || null;
  } catch (e) {
    return null;
  }
}

async function setIpLabel(sql, ipOrKey, opts) {
  opts = opts || {};
  var key = cleanIpKey(ipOrKey);
  if (!key) return { ok: false, error: "IP ou préfixe invalide" };
  var label = String(opts.label || "").trim().slice(0, 120);
  if (!label) return { ok: false, error: "Nom requis" };
  var note = opts.note != null ? String(opts.note).trim().slice(0, 500) : null;
  var contactId = opts.contactId || opts.contact_id || null;
  if (contactId) contactId = String(contactId).slice(0, 80);

  await sql`
    INSERT INTO site_ip_labels (ip_key, label, note, contact_id, created_by, updated_at)
    VALUES (
      ${key},
      ${label},
      ${note || null},
      ${contactId},
      ${opts.userId || null},
      NOW()
    )
    ON CONFLICT (ip_key) DO UPDATE SET
      label = EXCLUDED.label,
      note = COALESCE(EXCLUDED.note, site_ip_labels.note),
      contact_id = COALESCE(EXCLUDED.contact_id, site_ip_labels.contact_id),
      created_by = COALESCE(EXCLUDED.created_by, site_ip_labels.created_by),
      updated_at = NOW()
  `;
  return { ok: true, ip_key: key, label: label, note: note, contact_id: contactId };
}

async function deleteIpLabel(sql, ipOrKey) {
  var key = cleanIpKey(ipOrKey);
  if (!key) return { ok: false, error: "Clé invalide" };
  await sql`DELETE FROM site_ip_labels WHERE ip_key = ${key}`;
  return { ok: true, ip_key: key };
}

module.exports = {
  ensureIpLabelsSchema,
  cleanIp,
  cleanIpKey,
  prefix24,
  prefix16,
  resolveLabel,
  listIpLabels,
  getIpLabel,
  setIpLabel,
  deleteIpLabel,
};
