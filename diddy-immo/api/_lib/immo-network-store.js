/**
 * Store Neon — partenaires réseau immo, liens multi, accords d'honoraires.
 */
const crypto = require("crypto");
const { hashPassword, verifyPassword, signToken, verifyToken } = require("./auth");
const Links = require("../../js/immo-property-links-lib.js");
const MandateAcl = require("../../js/immo-mandate-acl-lib.js");
const FeeShare = require("../../js/immo-fee-share-legal-lib.js");

let networkReady = false;

const VALID_ROLES = ["negociateur", "avocat", "notaire", "apporteur"];

function uid(prefix) {
  return prefix + "_" + crypto.randomBytes(8).toString("hex");
}

function j(v, fallback) {
  if (v == null) return fallback;
  if (typeof v === "string") {
    try {
      return JSON.parse(v);
    } catch (e) {
      return fallback;
    }
  }
  return v;
}

async function ensureImmoNetworkSchema(sql) {
  if (!sql) return false;
  if (networkReady) return true;
  await sql`
    CREATE TABLE IF NOT EXISTS crm_immo_network_partners (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      company TEXT,
      first_name TEXT NOT NULL,
      last_name TEXT,
      email TEXT NOT NULL,
      phone TEXT,
      professional_id TEXT,
      city TEXT,
      postal_code TEXT,
      department TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      password_hash TEXT,
      salt TEXT,
      invite_token TEXT,
      notes TEXT,
      metadata_json TEXT DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_immo_network_partners_email ON crm_immo_network_partners (LOWER(email))`;
  await sql`
    CREATE TABLE IF NOT EXISTS crm_immo_property_links (
      id TEXT PRIMARY KEY,
      property_id TEXT NOT NULL,
      url TEXT NOT NULL,
      portal TEXT,
      label TEXT,
      is_primary BOOLEAN DEFAULT FALSE,
      sort_order INT DEFAULT 0,
      created_by TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_immo_property_links_property ON crm_immo_property_links (property_id)`;
  await sql`
    CREATE TABLE IF NOT EXISTS crm_immo_fee_agreements (
      id TEXT PRIMARY KEY,
      property_id TEXT NOT NULL,
      partner_id TEXT,
      party_id TEXT,
      participant_role TEXT NOT NULL,
      deal_side TEXT,
      share_pct NUMERIC(8, 4),
      share_amount NUMERIC(14, 2),
      base TEXT DEFAULT 'honoraires_ttc',
      label TEXT,
      legal_basis TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      notes TEXT,
      metadata_json TEXT DEFAULT '{}',
      created_by TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS crm_immo_partner_property_access (
      id TEXT PRIMARY KEY,
      partner_id TEXT NOT NULL,
      property_id TEXT NOT NULL,
      access_level TEXT NOT NULL DEFAULT 'contribute',
      invited_by TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (partner_id, property_id)
    )
  `;
  await sql`ALTER TABLE crm_immo_properties ADD COLUMN IF NOT EXISTS listing_urls_json TEXT DEFAULT '[]'`;
  await sql`ALTER TABLE crm_immo_properties ADD COLUMN IF NOT EXISTS mandate_started_at DATE`;
  await sql`ALTER TABLE crm_immo_properties ADD COLUMN IF NOT EXISTS mandate_ends_at DATE`;
  await sql`ALTER TABLE crm_immo_properties ADD COLUMN IF NOT EXISTS mandate_form TEXT`;
  await sql`ALTER TABLE crm_immo_properties ADD COLUMN IF NOT EXISTS mandate_ref TEXT`;
  await sql`ALTER TABLE crm_immo_properties ADD COLUMN IF NOT EXISTS seo_slug TEXT`;
  await sql`ALTER TABLE crm_immo_properties ADD COLUMN IF NOT EXISTS seo_published BOOLEAN DEFAULT FALSE`;
  networkReady = true;
  return true;
}

function publicPartner(row) {
  if (!row) return null;
  return {
    id: row.id,
    role: row.role,
    company: row.company,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    professionalId: row.professional_id,
    city: row.city,
    postalCode: row.postal_code,
    department: row.department,
    status: row.status,
  };
}

async function registerPartner(sql, body) {
  await ensureImmoNetworkSchema(sql);
  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const firstName = String(body.firstName || body.first_name || "").trim();
  const role = String(body.role || "").trim();
  if (!email || !firstName) throw new Error("Email et prénom requis");
  if (VALID_ROLES.indexOf(role) < 0) throw new Error("Rôle invalide (negociateur, avocat, notaire, apporteur)");
  const password = String(body.password || "");
  if (password.length < 8) throw new Error("Mot de passe : 8 caractères minimum");

  const existing = await sql`
    SELECT id, status FROM crm_immo_network_partners WHERE LOWER(email) = ${email} LIMIT 1
  `;
  if (existing.length) {
    return { ok: true, existing: true, id: existing[0].id, status: existing[0].status };
  }

  const id = uid("inp");
  const hp = hashPassword(password);
  await sql`
    INSERT INTO crm_immo_network_partners (
      id, role, company, first_name, last_name, email, phone, professional_id,
      city, postal_code, department, status, password_hash, salt, notes, metadata_json
    ) VALUES (
      ${id}, ${role}, ${body.company || null}, ${firstName}, ${body.lastName || body.last_name || null},
      ${email}, ${body.phone || null}, ${body.professionalId || body.professional_id || null},
      ${body.city || null}, ${body.postalCode || body.postal_code || null}, ${body.department || null},
      'pending', ${hp.hash}, ${hp.salt}, ${body.notes || null},
      ${JSON.stringify({ source: "partenaires-immo", at: new Date().toISOString() })}
    )
  `;
  return { ok: true, existing: false, id: id, status: "pending" };
}

async function loginPartner(sql, email, password) {
  await ensureImmoNetworkSchema(sql);
  const em = String(email || "")
    .trim()
    .toLowerCase();
  const rows = await sql`
    SELECT * FROM crm_immo_network_partners WHERE LOWER(email) = ${em} LIMIT 1
  `;
  if (!rows.length) return { ok: false, error: "Identifiants invalides" };
  const row = rows[0];
  if (!verifyPassword(password, row.password_hash, row.salt)) {
    return { ok: false, error: "Identifiants invalides" };
  }
  if (row.status === "suspended") return { ok: false, error: "Compte suspendu" };
  const token = signToken({
    partnerId: row.id,
    partnerRole: row.role,
    email: row.email,
    kind: "immo_network",
  });
  return { ok: true, token: token, partner: publicPartner(row) };
}

function partnerFromAuth(req) {
  const header = req.headers.authorization || req.headers.Authorization || "";
  const m = String(header).match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  try {
    const decoded = verifyToken(m[1]);
    if (!decoded || decoded.kind !== "immo_network" || !decoded.partnerId) return null;
    return decoded;
  } catch (e) {
    return null;
  }
}

async function getPartner(sql, id) {
  await ensureImmoNetworkSchema(sql);
  const rows = await sql`SELECT * FROM crm_immo_network_partners WHERE id = ${id} LIMIT 1`;
  return rows[0] || null;
}

async function listLinks(sql, propertyId) {
  await ensureImmoNetworkSchema(sql);
  const rows = await sql`
    SELECT * FROM crm_immo_property_links
    WHERE property_id = ${propertyId}
    ORDER BY is_primary DESC, sort_order ASC, created_at ASC
  `;
  return rows;
}

async function replaceLinks(sql, propertyId, links, createdBy) {
  await ensureImmoNetworkSchema(sql);
  const normalized = Links.normalizeList(links);
  await sql`DELETE FROM crm_immo_property_links WHERE property_id = ${propertyId}`;
  for (var i = 0; i < normalized.length; i++) {
    const L = normalized[i];
    await sql`
      INSERT INTO crm_immo_property_links (
        id, property_id, url, portal, label, is_primary, sort_order, created_by
      ) VALUES (
        ${uid("lnk")}, ${propertyId}, ${L.url}, ${L.portal}, ${L.label},
        ${!!L.is_primary}, ${L.sort_order || i}, ${createdBy || null}
      )
    `;
  }
  const primary = Links.primaryUrl(normalized);
  await sql`
    UPDATE crm_immo_properties
    SET listing_url = ${primary || null},
        listing_urls_json = ${JSON.stringify(normalized)},
        updated_at = NOW()
    WHERE id = ${propertyId}
  `;
  return normalized;
}

async function listFeeAgreements(sql, propertyId) {
  await ensureImmoNetworkSchema(sql);
  return sql`
    SELECT * FROM crm_immo_fee_agreements
    WHERE property_id = ${propertyId}
    ORDER BY created_at ASC
  `;
}

async function upsertFeeAgreement(sql, body, createdBy) {
  await ensureImmoNetworkSchema(sql);
  const id = body.id || uid("fee");
  await sql`
    INSERT INTO crm_immo_fee_agreements (
      id, property_id, partner_id, party_id, participant_role, deal_side,
      share_pct, share_amount, base, label, legal_basis, status, notes, metadata_json, created_by
    ) VALUES (
      ${id}, ${body.property_id}, ${body.partner_id || null}, ${body.party_id || null},
      ${body.participant_role}, ${body.deal_side || null},
      ${body.share_pct != null ? body.share_pct : null},
      ${body.share_amount != null ? body.share_amount : null},
      ${body.base || "honoraires_ttc"}, ${body.label || null}, ${body.legal_basis || null},
      ${body.status || "draft"}, ${body.notes || null},
      ${JSON.stringify(body.metadata || {})}, ${createdBy || null}
    )
    ON CONFLICT (id) DO UPDATE SET
      partner_id = EXCLUDED.partner_id,
      participant_role = EXCLUDED.participant_role,
      deal_side = EXCLUDED.deal_side,
      share_pct = EXCLUDED.share_pct,
      share_amount = EXCLUDED.share_amount,
      base = EXCLUDED.base,
      label = EXCLUDED.label,
      legal_basis = EXCLUDED.legal_basis,
      status = EXCLUDED.status,
      notes = EXCLUDED.notes,
      updated_at = NOW()
  `;
  return id;
}

async function grantAccess(sql, partnerId, propertyId, level, invitedBy) {
  await ensureImmoNetworkSchema(sql);
  const id = uid("acc");
  await sql`
    INSERT INTO crm_immo_partner_property_access (id, partner_id, property_id, access_level, invited_by)
    VALUES (${id}, ${partnerId}, ${propertyId}, ${level || "contribute"}, ${invitedBy || null})
    ON CONFLICT (partner_id, property_id) DO UPDATE SET access_level = EXCLUDED.access_level
  `;
  return id;
}

async function listPartnerProperties(sql, partnerId) {
  await ensureImmoNetworkSchema(sql);
  const rows = await sql`
    SELECT p.*, a.access_level
    FROM crm_immo_partner_property_access a
    JOIN crm_immo_properties p ON p.id = a.property_id
    WHERE a.partner_id = ${partnerId}
    ORDER BY p.updated_at DESC
    LIMIT 100
  `;
  return rows.map(function (r) {
    return MandateAcl.stripMandatePrivate(r);
  });
}

module.exports = {
  VALID_ROLES,
  ensureImmoNetworkSchema,
  publicPartner,
  registerPartner,
  loginPartner,
  partnerFromAuth,
  getPartner,
  listLinks,
  replaceLinks,
  listFeeAgreements,
  upsertFeeAgreement,
  grantAccess,
  listPartnerProperties,
  MandateAcl,
  FeeShare,
  Links,
  uid,
  j,
};
