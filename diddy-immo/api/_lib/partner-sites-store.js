const fs = require("fs");
const path = require("path");
const { getSql } = require("./db");

const SEED_PATH = path.join(process.cwd(), "data", "partner-sites.json");

let schemaReady = false;

function readSeed() {
  try {
    return JSON.parse(fs.readFileSync(SEED_PATH, "utf8"));
  } catch (e) {
    return {
      version: 1,
      updatedAt: "",
      title: "Sites partenaires",
      lead: "",
      categories: [],
      sites: [],
    };
  }
}

function isHttpUrl(u) {
  try {
    const x = new URL(String(u || "").trim());
    return x.protocol === "http:" || x.protocol === "https:";
  } catch (e) {
    return false;
  }
}

function normalizeSite(raw, i) {
  const s = raw || {};
  let url = String(s.url || "").trim();
  if (url && !/^https?:\/\//i.test(url)) url = "https://" + url;
  return {
    id: String(s.id || "site_" + (i + 1))
      .trim()
      .slice(0, 80),
    category: String(s.category || "services").trim(),
    name: String(s.name || "Partenaire").trim().slice(0, 120),
    url: url,
    preview_image_url: String(s.preview_image_url || s.previewImageUrl || "").trim(),
    tagline: String(s.tagline || "").trim().slice(0, 180),
    city: String(s.city || "").trim().slice(0, 80),
    active: s.active !== false,
    order: Number(s.order) || 100 + i,
    notes: String(s.notes || "").trim().slice(0, 400),
  };
}

function normalizeCatalog(raw) {
  const data = raw && typeof raw === "object" ? raw : {};
  const categories = (Array.isArray(data.categories) ? data.categories : [])
    .map(function (c, i) {
      return {
        id: String(c.id || "cat_" + i).trim(),
        label: String(c.label || c.id || "Catégorie").trim(),
        order: Number(c.order) || (i + 1) * 10,
        icon: String(c.icon || "").trim(),
      };
    })
    .sort(function (a, b) {
      return a.order - b.order;
    });
  const sites = (Array.isArray(data.sites) ? data.sites : [])
    .map(normalizeSite)
    .filter(function (s) {
      return !!s.name;
    })
    .sort(function (a, b) {
      return a.order - b.order;
    });
  return {
    version: data.version || 1,
    updatedAt: data.updatedAt || "",
    title: String(data.title || "Sites partenaires"),
    lead: String(data.lead || ""),
    categories: categories,
    sites: sites,
  };
}

function publicCatalog(catalog) {
  const n = normalizeCatalog(catalog);
  return {
    version: n.version,
    updatedAt: n.updatedAt,
    title: n.title,
    lead: n.lead,
    categories: n.categories,
    sites: n.sites
      .filter(function (s) {
        return s.active;
      })
      .map(function (s) {
        return {
          id: s.id,
          category: s.category,
          name: s.name,
          url: s.url,
          preview_image_url: s.preview_image_url,
          tagline: s.tagline,
          city: s.city,
          order: s.order,
        };
      }),
  };
}

async function ensurePartnerSitesSchema(sql) {
  if (!sql) return false;
  if (schemaReady) return true;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS partner_sites_settings (
        id TEXT PRIMARY KEY DEFAULT 'default',
        payload TEXT NOT NULL DEFAULT '{}',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_by TEXT
      )
    `;
    schemaReady = true;
    return true;
  } catch (e) {
    console.warn("[partner-sites] schema", e.message);
    return false;
  }
}

async function loadCatalogFromDb(sql) {
  if (!sql) return null;
  try {
    await ensurePartnerSitesSchema(sql);
    const rows = await sql`
      SELECT payload FROM partner_sites_settings WHERE id = 'default' LIMIT 1
    `;
    if (!rows.length) return null;
    let payload = rows[0].payload;
    if (typeof payload === "string") {
      try {
        payload = JSON.parse(payload);
      } catch (e) {
        return null;
      }
    }
    return payload;
  } catch (e) {
    console.warn("[partner-sites] load", e.message);
    return null;
  }
}

async function saveCatalogToDb(sql, catalog, userId) {
  if (!sql) throw new Error("Base de donnees non configuree");
  await ensurePartnerSitesSchema(sql);
  const normalized = normalizeCatalog(catalog);
  normalized.updatedAt = new Date().toISOString().slice(0, 10);
  const payload = JSON.stringify(normalized);
  await sql`
    INSERT INTO partner_sites_settings (id, payload, updated_at, updated_by)
    VALUES ('default', ${payload}, NOW(), ${userId || null})
    ON CONFLICT (id) DO UPDATE SET
      payload = EXCLUDED.payload,
      updated_at = NOW(),
      updated_by = EXCLUDED.updated_by
  `;
  return normalized;
}

async function getPartnerSitesCatalog(opts) {
  const options = opts || {};
  const sql = options.sql || getSql();
  const fromDb = await loadCatalogFromDb(sql);
  return normalizeCatalog(fromDb || readSeed());
}

async function getPublicPartnerSites() {
  return publicCatalog(await getPartnerSitesCatalog());
}

module.exports = {
  isHttpUrl,
  normalizeSite,
  normalizeCatalog,
  publicCatalog,
  readSeed,
  ensurePartnerSitesSchema,
  loadCatalogFromDb,
  saveCatalogToDb,
  getPartnerSitesCatalog,
  getPublicPartnerSites,
};
