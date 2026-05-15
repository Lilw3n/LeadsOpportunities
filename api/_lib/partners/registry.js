const fs = require("fs");
const path = require("path");

let cachedConfig = null;

function loadConfigFile() {
  if (cachedConfig) return cachedConfig;
  const configPath = path.join(process.cwd(), "config", "partners.json");
  try {
    const raw = fs.readFileSync(configPath, "utf8");
    cachedConfig = JSON.parse(raw);
    return cachedConfig;
  } catch (e) {
    console.warn("[partners] config/partners.json introuvable", e.message);
    cachedConfig = { version: 1, defaults: { minLeadScore: 35 }, partners: [] };
    return cachedConfig;
  }
}

function normalizeVertical(v) {
  const s = String(v || "").toLowerCase().trim();
  if (s === "immo" || s === "credit_immo" || s === "credit-immo") return "credit-immo";
  if (s === "mobilite" || s === "mobilité") return "vtc";
  return s;
}

function partnerFromRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    portalUrl: row.portal_url,
    status: row.status,
    priority: row.priority,
    verticals: Array.isArray(row.verticals) ? row.verticals : JSON.parse(row.verticals || "[]"),
    integration:
      typeof row.integration === "object"
        ? row.integration
        : JSON.parse(row.integration || "{}"),
    minLeadScore: row.min_lead_score != null ? row.min_lead_score : 35,
    notes: row.notes || "",
  };
}

async function getPartnersFromDb(sql) {
  const rows = await sql`SELECT * FROM partners ORDER BY priority ASC, name ASC`;
  return rows.map(partnerFromRow);
}

async function syncConfigToDb(sql) {
  const cfg = loadConfigFile();
  for (const p of cfg.partners || []) {
    await sql`
      INSERT INTO partners (id, name, portal_url, status, priority, verticals, integration, min_lead_score, notes, updated_at)
      VALUES (
        ${p.id},
        ${p.name},
        ${p.portalUrl || null},
        ${p.status || "pending"},
        ${p.priority != null ? p.priority : 100},
        ${JSON.stringify(p.verticals || [])},
        ${JSON.stringify(p.integration || {})},
        ${p.minLeadScore != null ? p.minLeadScore : cfg.defaults?.minLeadScore || 35},
        ${p.notes || null},
        now()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        portal_url = EXCLUDED.portal_url,
        priority = EXCLUDED.priority,
        verticals = EXCLUDED.verticals,
        integration = EXCLUDED.integration,
        notes = COALESCE(EXCLUDED.notes, partners.notes),
        updated_at = now()
    `;
  }
  return (cfg.partners || []).length;
}

async function listPartners(sql, options) {
  options = options || {};
  if (sql) {
    try {
      const rows = await getPartnersFromDb(sql);
      if (rows.length > 0) return rows;
    } catch (e) {
      if (e.code !== "42P01") console.warn("[partners] db list", e.message);
    }
  }
  return (loadConfigFile().partners || []).map(function (p) {
    return {
      id: p.id,
      name: p.name,
      portalUrl: p.portalUrl,
      status: p.status,
      priority: p.priority,
      verticals: p.verticals || [],
      integration: p.integration || {},
      minLeadScore: p.minLeadScore,
      notes: p.notes || "",
    };
  });
}

function matchesLead(partner, lead, score) {
  if (partner.status !== "active") return false;
  const minScore = partner.minLeadScore != null ? partner.minLeadScore : 35;
  if (score < minScore) return false;
  const vertical = normalizeVertical(lead.vertical || lead.need || "");
  const allowed = (partner.verticals || []).map(normalizeVertical);
  if (allowed.length && vertical && allowed.indexOf(vertical) === -1) return false;
  return true;
}

async function getPartnersForLead(sql, lead, score) {
  const all = await listPartners(sql);
  return all
    .filter(function (p) {
      return matchesLead(p, lead, score);
    })
    .sort(function (a, b) {
      return (a.priority || 100) - (b.priority || 100);
    });
}

module.exports = {
  loadConfigFile,
  listPartners,
  syncConfigToDb,
  getPartnersForLead,
  normalizeVertical,
  partnerFromRow,
};
