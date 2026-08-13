/**
 * Persistences Neon pour le module immobilier CRM.
 */
const crypto = require("crypto");
const Matcher = require("../../js/crm-immo-matcher.js");

let schemaReady = false;

async function ensureImmoSchema(sql) {
  if (!sql || schemaReady) return !!sql;
  await sql`
    CREATE TABLE IF NOT EXISTS crm_immo_properties (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      property_type TEXT NOT NULL DEFAULT 'appartement',
      status TEXT NOT NULL DEFAULT 'active',
      listing_source TEXT DEFAULT 'manual',
      listing_url TEXT,
      address TEXT,
      city TEXT,
      postal_code TEXT,
      department TEXT,
      lat NUMERIC(10, 7),
      lng NUMERIC(10, 7),
      surface_m2 NUMERIC(10, 2),
      rooms NUMERIC(4, 1),
      bedrooms NUMERIC(4, 1),
      floor TEXT,
      has_elevator BOOLEAN DEFAULT FALSE,
      has_garage BOOLEAN DEFAULT FALSE,
      has_parking BOOLEAN DEFAULT FALSE,
      has_cave BOOLEAN DEFAULT FALSE,
      has_garden BOOLEAN DEFAULT FALSE,
      has_terrace BOOLEAN DEFAULT FALSE,
      has_balcony BOOLEAN DEFAULT FALSE,
      has_pool BOOLEAN DEFAULT FALSE,
      dependencies_json TEXT DEFAULT '{}',
      price_net NUMERIC(14, 2),
      price_fai NUMERIC(14, 2),
      honoraires NUMERIC(14, 2),
      dpe TEXT,
      ges TEXT,
      description TEXT,
      notes TEXT,
      photos_json TEXT DEFAULT '[]',
      metadata_json TEXT DEFAULT '{}',
      owner_contact_id TEXT,
      buyer_contact_id TEXT,
      lead_id TEXT,
      assigned_to TEXT,
      created_by TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS crm_immo_buyer_criteria (
      id TEXT PRIMARY KEY,
      contact_id TEXT,
      lead_id TEXT,
      label TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      property_types_json TEXT DEFAULT '[]',
      cities_json TEXT DEFAULT '[]',
      postal_codes_json TEXT DEFAULT '[]',
      departments_json TEXT DEFAULT '[]',
      radius_km NUMERIC(8, 2),
      center_lat NUMERIC(10, 7),
      center_lng NUMERIC(10, 7),
      surface_min NUMERIC(10, 2),
      surface_max NUMERIC(10, 2),
      rooms_min NUMERIC(4, 1),
      bedrooms_min NUMERIC(4, 1),
      budget_min NUMERIC(14, 2),
      budget_max NUMERIC(14, 2),
      price_mode TEXT DEFAULT 'fai',
      want_garage BOOLEAN DEFAULT FALSE,
      want_parking BOOLEAN DEFAULT FALSE,
      want_cave BOOLEAN DEFAULT FALSE,
      want_garden BOOLEAN DEFAULT FALSE,
      want_terrace BOOLEAN DEFAULT FALSE,
      want_balcony BOOLEAN DEFAULT FALSE,
      want_elevator BOOLEAN DEFAULT FALSE,
      want_pool BOOLEAN DEFAULT FALSE,
      must_haves_json TEXT DEFAULT '[]',
      notes TEXT,
      metadata_json TEXT DEFAULT '{}',
      created_by TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS crm_immo_parties (
      id TEXT PRIMARY KEY,
      property_id TEXT NOT NULL,
      contact_id TEXT,
      role TEXT NOT NULL DEFAULT 'prospect',
      name TEXT,
      email TEXT,
      phone TEXT,
      notes TEXT,
      share_pct NUMERIC(8, 4),
      share_label TEXT,
      is_primary BOOLEAN DEFAULT FALSE,
      capacity TEXT,
      address TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE crm_immo_parties ADD COLUMN IF NOT EXISTS share_pct NUMERIC(8, 4)`;
  await sql`ALTER TABLE crm_immo_parties ADD COLUMN IF NOT EXISTS share_label TEXT`;
  await sql`ALTER TABLE crm_immo_parties ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE`;
  await sql`ALTER TABLE crm_immo_parties ADD COLUMN IF NOT EXISTS capacity TEXT`;
  await sql`ALTER TABLE crm_immo_parties ADD COLUMN IF NOT EXISTS address TEXT`;
  await sql`
    CREATE TABLE IF NOT EXISTS crm_immo_documents (
      id TEXT PRIMARY KEY,
      property_id TEXT,
      contact_id TEXT,
      doc_type TEXT NOT NULL DEFAULT 'autre',
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      data_json TEXT DEFAULT '{}',
      notes TEXT,
      created_by TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  schemaReady = true;
  return true;
}

function uid(prefix) {
  return prefix + "_" + crypto.randomBytes(8).toString("hex");
}

function j(v, fallback) {
  if (v == null) return JSON.stringify(fallback);
  if (typeof v === "string") return v;
  return JSON.stringify(v);
}

function parseArr(v) {
  if (Array.isArray(v)) return v;
  if (typeof v === "string") {
    try {
      const p = JSON.parse(v);
      return Array.isArray(p) ? p : [];
    } catch (e) {
      return [];
    }
  }
  return [];
}

function rowToProperty(r) {
  if (!r) return null;
  return Object.assign({}, r, {
    surface_m2: r.surface_m2 != null ? Number(r.surface_m2) : null,
    rooms: r.rooms != null ? Number(r.rooms) : null,
    bedrooms: r.bedrooms != null ? Number(r.bedrooms) : null,
    price_net: r.price_net != null ? Number(r.price_net) : null,
    price_fai: r.price_fai != null ? Number(r.price_fai) : null,
    honoraires: r.honoraires != null ? Number(r.honoraires) : null,
    lat: r.lat != null ? Number(r.lat) : null,
    lng: r.lng != null ? Number(r.lng) : null,
  });
}

function rowToParty(r) {
  if (!r) return null;
  var mapped = Object.assign({}, r, {
    share_pct: r.share_pct != null ? Number(r.share_pct) : null,
    is_primary: !!r.is_primary,
  });
  return Matcher.normalizeParty ? Matcher.normalizeParty(mapped) : mapped;
}

function rowToCriteria(r) {
  if (!r) return null;
  return {
    id: r.id,
    contact_id: r.contact_id,
    lead_id: r.lead_id,
    label: r.label,
    status: r.status,
    property_types: parseArr(r.property_types_json),
    cities: parseArr(r.cities_json),
    postal_codes: parseArr(r.postal_codes_json),
    departments: parseArr(r.departments_json),
    radius_km: r.radius_km != null ? Number(r.radius_km) : null,
    center_lat: r.center_lat != null ? Number(r.center_lat) : null,
    center_lng: r.center_lng != null ? Number(r.center_lng) : null,
    surface_min: r.surface_min != null ? Number(r.surface_min) : null,
    surface_max: r.surface_max != null ? Number(r.surface_max) : null,
    rooms_min: r.rooms_min != null ? Number(r.rooms_min) : null,
    bedrooms_min: r.bedrooms_min != null ? Number(r.bedrooms_min) : null,
    budget_min: r.budget_min != null ? Number(r.budget_min) : null,
    budget_max: r.budget_max != null ? Number(r.budget_max) : null,
    price_mode: r.price_mode || "fai",
    want_garage: !!r.want_garage,
    want_parking: !!r.want_parking,
    want_cave: !!r.want_cave,
    want_garden: !!r.want_garden,
    want_terrace: !!r.want_terrace,
    want_balcony: !!r.want_balcony,
    want_elevator: !!r.want_elevator,
    want_pool: !!r.want_pool,
    must_haves: parseArr(r.must_haves_json),
    notes: r.notes || "",
    created_by: r.created_by,
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

async function loadAll(sql) {
  await ensureImmoSchema(sql);
  const [properties, criteria, parties, documents] = await Promise.all([
    sql`SELECT * FROM crm_immo_properties ORDER BY updated_at DESC`,
    sql`SELECT * FROM crm_immo_buyer_criteria ORDER BY updated_at DESC`,
    sql`SELECT * FROM crm_immo_parties ORDER BY updated_at DESC`,
    sql`SELECT * FROM crm_immo_documents ORDER BY updated_at DESC`,
  ]);
  return {
    version: 1,
    properties: properties.map(rowToProperty),
    criteria: criteria.map(rowToCriteria),
    parties: parties.map(rowToParty),
    documents: documents.map(function (d) {
      return Object.assign({}, d, {
        data: parseArr(d.data_json).length || typeof d.data_json === "string"
          ? (function () {
              try {
                return JSON.parse(d.data_json || "{}");
              } catch (e) {
                return {};
              }
            })()
          : {},
      });
    }),
    updatedAt: new Date().toISOString(),
  };
}

async function upsertProperty(sql, item, user) {
  await ensureImmoSchema(sql);
  const id = item.id || uid("prop");
  const createdBy = (user && user.id) || item.created_by || null;
  await sql`
    INSERT INTO crm_immo_properties (
      id, title, property_type, status, listing_source, listing_url,
      address, city, postal_code, department, lat, lng,
      surface_m2, rooms, bedrooms, floor,
      has_elevator, has_garage, has_parking, has_cave, has_garden, has_terrace, has_balcony, has_pool,
      dependencies_json, price_net, price_fai, honoraires, dpe, ges,
      description, notes, photos_json, metadata_json,
      owner_contact_id, buyer_contact_id, lead_id, assigned_to, created_by, updated_at
    ) VALUES (
      ${id}, ${item.title || "Bien"}, ${item.property_type || "appartement"}, ${item.status || "active"},
      ${item.listing_source || "manual"}, ${item.listing_url || null},
      ${item.address || null}, ${item.city || null}, ${item.postal_code || null}, ${item.department || null},
      ${item.lat != null ? item.lat : null}, ${item.lng != null ? item.lng : null},
      ${item.surface_m2 != null ? item.surface_m2 : null}, ${item.rooms != null ? item.rooms : null},
      ${item.bedrooms != null ? item.bedrooms : null}, ${item.floor || null},
      ${!!item.has_elevator}, ${!!item.has_garage}, ${!!item.has_parking}, ${!!item.has_cave},
      ${!!item.has_garden}, ${!!item.has_terrace}, ${!!item.has_balcony}, ${!!item.has_pool},
      ${j(item.dependencies_json || item.dependencies, {})},
      ${item.price_net != null ? item.price_net : null}, ${item.price_fai != null ? item.price_fai : null},
      ${item.honoraires != null ? item.honoraires : null}, ${item.dpe || null}, ${item.ges || null},
      ${item.description || null}, ${item.notes || null},
      ${j(item.photos_json || item.photos, [])}, ${j(item.metadata_json || item.metadata, {})},
      ${item.owner_contact_id || null}, ${item.buyer_contact_id || null}, ${item.lead_id || null},
      ${item.assigned_to || null}, ${createdBy}, NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      property_type = EXCLUDED.property_type,
      status = EXCLUDED.status,
      listing_source = EXCLUDED.listing_source,
      listing_url = EXCLUDED.listing_url,
      address = EXCLUDED.address,
      city = EXCLUDED.city,
      postal_code = EXCLUDED.postal_code,
      department = EXCLUDED.department,
      lat = EXCLUDED.lat,
      lng = EXCLUDED.lng,
      surface_m2 = EXCLUDED.surface_m2,
      rooms = EXCLUDED.rooms,
      bedrooms = EXCLUDED.bedrooms,
      floor = EXCLUDED.floor,
      has_elevator = EXCLUDED.has_elevator,
      has_garage = EXCLUDED.has_garage,
      has_parking = EXCLUDED.has_parking,
      has_cave = EXCLUDED.has_cave,
      has_garden = EXCLUDED.has_garden,
      has_terrace = EXCLUDED.has_terrace,
      has_balcony = EXCLUDED.has_balcony,
      has_pool = EXCLUDED.has_pool,
      dependencies_json = EXCLUDED.dependencies_json,
      price_net = EXCLUDED.price_net,
      price_fai = EXCLUDED.price_fai,
      honoraires = EXCLUDED.honoraires,
      dpe = EXCLUDED.dpe,
      ges = EXCLUDED.ges,
      description = EXCLUDED.description,
      notes = EXCLUDED.notes,
      photos_json = EXCLUDED.photos_json,
      metadata_json = EXCLUDED.metadata_json,
      owner_contact_id = EXCLUDED.owner_contact_id,
      buyer_contact_id = EXCLUDED.buyer_contact_id,
      lead_id = EXCLUDED.lead_id,
      assigned_to = EXCLUDED.assigned_to,
      updated_at = NOW()
  `;
  return id;
}

async function upsertCriteria(sql, item, user) {
  await ensureImmoSchema(sql);
  const id = item.id || uid("crit");
  await sql`
    INSERT INTO crm_immo_buyer_criteria (
      id, contact_id, lead_id, label, status,
      property_types_json, cities_json, postal_codes_json, departments_json,
      radius_km, center_lat, center_lng,
      surface_min, surface_max, rooms_min, bedrooms_min,
      budget_min, budget_max, price_mode,
      want_garage, want_parking, want_cave, want_garden, want_terrace, want_balcony, want_elevator, want_pool,
      must_haves_json, notes, metadata_json, created_by, updated_at
    ) VALUES (
      ${id}, ${item.contact_id || null}, ${item.lead_id || null}, ${item.label || "Recherche"}, ${item.status || "active"},
      ${j(item.property_types, [])}, ${j(item.cities, [])}, ${j(item.postal_codes, [])}, ${j(item.departments, [])},
      ${item.radius_km != null ? item.radius_km : null}, ${item.center_lat != null ? item.center_lat : null},
      ${item.center_lng != null ? item.center_lng : null},
      ${item.surface_min != null ? item.surface_min : null}, ${item.surface_max != null ? item.surface_max : null},
      ${item.rooms_min != null ? item.rooms_min : null}, ${item.bedrooms_min != null ? item.bedrooms_min : null},
      ${item.budget_min != null ? item.budget_min : null}, ${item.budget_max != null ? item.budget_max : null},
      ${item.price_mode || "fai"},
      ${!!item.want_garage}, ${!!item.want_parking}, ${!!item.want_cave}, ${!!item.want_garden},
      ${!!item.want_terrace}, ${!!item.want_balcony}, ${!!item.want_elevator}, ${!!item.want_pool},
      ${j(item.must_haves, [])}, ${item.notes || null}, ${j(item.metadata, {})},
      ${(user && user.id) || item.created_by || null}, NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      contact_id = EXCLUDED.contact_id,
      lead_id = EXCLUDED.lead_id,
      label = EXCLUDED.label,
      status = EXCLUDED.status,
      property_types_json = EXCLUDED.property_types_json,
      cities_json = EXCLUDED.cities_json,
      postal_codes_json = EXCLUDED.postal_codes_json,
      departments_json = EXCLUDED.departments_json,
      radius_km = EXCLUDED.radius_km,
      center_lat = EXCLUDED.center_lat,
      center_lng = EXCLUDED.center_lng,
      surface_min = EXCLUDED.surface_min,
      surface_max = EXCLUDED.surface_max,
      rooms_min = EXCLUDED.rooms_min,
      bedrooms_min = EXCLUDED.bedrooms_min,
      budget_min = EXCLUDED.budget_min,
      budget_max = EXCLUDED.budget_max,
      price_mode = EXCLUDED.price_mode,
      want_garage = EXCLUDED.want_garage,
      want_parking = EXCLUDED.want_parking,
      want_cave = EXCLUDED.want_cave,
      want_garden = EXCLUDED.want_garden,
      want_terrace = EXCLUDED.want_terrace,
      want_balcony = EXCLUDED.want_balcony,
      want_elevator = EXCLUDED.want_elevator,
      want_pool = EXCLUDED.want_pool,
      must_haves_json = EXCLUDED.must_haves_json,
      notes = EXCLUDED.notes,
      metadata_json = EXCLUDED.metadata_json,
      updated_at = NOW()
  `;
  return id;
}

async function upsertParty(sql, item) {
  await ensureImmoSchema(sql);
  const party = Matcher.normalizeParty ? Matcher.normalizeParty(item) : item || {};
  const id = party.id || item.id || uid("party");
  await sql`
    INSERT INTO crm_immo_parties (
      id, property_id, contact_id, role, name, email, phone, notes,
      share_pct, share_label, is_primary, capacity, address, updated_at
    )
    VALUES (
      ${id}, ${party.property_id || item.property_id}, ${party.contact_id || null},
      ${party.role || "prospect"}, ${party.name || null}, ${party.email || null},
      ${party.phone || null}, ${party.notes || null},
      ${party.share_pct != null ? party.share_pct : null}, ${party.share_label || null},
      ${!!party.is_primary}, ${party.capacity || null}, ${party.address || null}, NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      property_id = EXCLUDED.property_id,
      contact_id = EXCLUDED.contact_id,
      role = EXCLUDED.role,
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      notes = EXCLUDED.notes,
      share_pct = EXCLUDED.share_pct,
      share_label = EXCLUDED.share_label,
      is_primary = EXCLUDED.is_primary,
      capacity = EXCLUDED.capacity,
      address = EXCLUDED.address,
      updated_at = NOW()
  `;
  return id;
}

async function upsertDocument(sql, item, user) {
  await ensureImmoSchema(sql);
  const id = item.id || uid("idoc");
  await sql`
    INSERT INTO crm_immo_documents (
      id, property_id, contact_id, doc_type, title, status, data_json, notes, created_by, updated_at
    ) VALUES (
      ${id}, ${item.property_id || null}, ${item.contact_id || null},
      ${item.doc_type || "autre"}, ${item.title || "Document"}, ${item.status || "draft"},
      ${j(item.data || item.data_json, {})}, ${item.notes || null},
      ${(user && user.id) || item.created_by || null}, NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      property_id = EXCLUDED.property_id,
      contact_id = EXCLUDED.contact_id,
      doc_type = EXCLUDED.doc_type,
      title = EXCLUDED.title,
      status = EXCLUDED.status,
      data_json = EXCLUDED.data_json,
      notes = EXCLUDED.notes,
      updated_at = NOW()
  `;
  return id;
}

async function deleteEntity(sql, entity, id) {
  await ensureImmoSchema(sql);
  if (entity === "property") {
    await sql`DELETE FROM crm_immo_parties WHERE property_id = ${id}`;
    await sql`DELETE FROM crm_immo_documents WHERE property_id = ${id}`;
    await sql`DELETE FROM crm_immo_properties WHERE id = ${id}`;
  } else if (entity === "criteria") {
    await sql`DELETE FROM crm_immo_buyer_criteria WHERE id = ${id}`;
  } else if (entity === "party") {
    await sql`DELETE FROM crm_immo_parties WHERE id = ${id}`;
  } else if (entity === "document") {
    await sql`DELETE FROM crm_immo_documents WHERE id = ${id}`;
  } else {
    throw new Error("entity inconnue");
  }
}

module.exports = {
  ensureImmoSchema,
  loadAll,
  upsertProperty,
  upsertCriteria,
  upsertParty,
  upsertDocument,
  deleteEntity,
  Matcher,
};
