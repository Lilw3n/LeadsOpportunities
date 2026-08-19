const crypto = require("crypto");
const { getAuthUser, hashPassword, verifyPassword, signToken } = require("./auth");
const { buildProfileMetadata } = require("./crm-profile-meta");

const PORTAL_ROLES = ["buyer", "seller", "visitor"];

async function ensureExternalPortalSchema(sql) {
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS portal_role TEXT DEFAULT 'visitor'`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS portal_status TEXT DEFAULT 'active'`;
  await sql`CREATE INDEX IF NOT EXISTS idx_users_portal_role ON users(portal_role)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_users_linked_contact_id ON users(linked_contact_id)`;
  await sql`
    CREATE TABLE IF NOT EXISTS crm_visit_feedback (
      id TEXT PRIMARY KEY,
      event_id TEXT,
      contact_id TEXT NOT NULL,
      created_by_user_id TEXT,
      property_ref TEXT,
      visit_type TEXT NOT NULL DEFAULT 'onsite',
      rating SMALLINT NOT NULL DEFAULT 3,
      interested BOOLEAN DEFAULT TRUE,
      would_offer BOOLEAN DEFAULT FALSE,
      budget_note TEXT,
      comments TEXT,
      visitor_contacts_json TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_visit_feedback_contact ON crm_visit_feedback(contact_id, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_visit_feedback_event ON crm_visit_feedback(event_id)`;
}

function normalizePortalRole(value) {
  const role = String(value || "").trim().toLowerCase();
  return PORTAL_ROLES.indexOf(role) >= 0 ? role : "visitor";
}

function parseMeta(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function stringifyMeta(meta) {
  try {
    return JSON.stringify(meta || {});
  } catch (e) {
    return "{}";
  }
}

function splitName(fullName) {
  const value = String(fullName || "").trim();
  if (!value) return { firstName: "", lastName: "" };
  const parts = value.split(/\s+/);
  return {
    firstName: parts.shift() || "",
    lastName: parts.join(" "),
  };
}

function displayName(row) {
  const name = String(row.full_name || "").trim();
  if (name) return name;
  return [row.first_name || "", row.last_name || ""].join(" ").trim() || row.email || "Client";
}

function buildPortalProfilePatch(body) {
  const role = normalizePortalRole(body.portalRole || body.role || body.profileType);
  return {
    portalRole: role,
    acquisitionStage: String(body.acquisitionStage || "").trim().slice(0, 80) || null,
    preferredCity: String(body.preferredCity || "").trim().slice(0, 120) || null,
    budget: String(body.budget || "").trim().slice(0, 120) || null,
    notes: String(body.notes || "").trim().slice(0, 1200) || null,
  };
}

function mergeContactMetadata(existingMeta, body) {
  const current = parseMeta(existingMeta);
  const portal = Object.assign({}, current.portal || {}, buildPortalProfilePatch(body));
  const profileMeta = buildProfileMetadata({
    primaryNeed: body.primaryNeed || body.need,
    vertical: body.vertical || body.primaryNeed || body.need,
    serviceLabel: body.serviceLabel || null,
  });
  return Object.assign({}, current, profileMeta, {
    portal: portal,
  });
}

async function loadPortalAccount(sql, userId) {
  const rows = await sql`
    SELECT
      u.id, u.email, u.password_hash, u.salt, u.role, u.crm_role, u.full_name, u.phone,
      u.status, u.linked_contact_id, u.portal_role, u.portal_status, u.created_at, u.last_login_at,
      c.first_name, c.last_name, c.company, c.contact_type, c.status AS contact_status, c.metadata
    FROM users u
    LEFT JOIN crm_contacts c ON c.id = u.linked_contact_id
    WHERE u.id = ${userId}
    LIMIT 1
  `;
  if (!rows.length) return null;
  const row = rows[0];
  row.contact_metadata = parseMeta(row.metadata);
  return row;
}

async function findPortalAccountByEmail(sql, email) {
  const rows = await sql`
    SELECT
      u.id, u.email, u.password_hash, u.salt, u.role, u.crm_role, u.full_name, u.phone,
      u.status, u.linked_contact_id, u.portal_role, u.portal_status, u.created_at, u.last_login_at,
      c.first_name, c.last_name, c.company, c.contact_type, c.status AS contact_status, c.metadata
    FROM users u
    LEFT JOIN crm_contacts c ON c.id = u.linked_contact_id
    WHERE LOWER(u.email) = ${email}
    LIMIT 1
  `;
  if (!rows.length) return null;
  const row = rows[0];
  row.contact_metadata = parseMeta(row.metadata);
  return row;
}

function serializePortalUser(row) {
  const portal = row.contact_metadata && row.contact_metadata.portal ? row.contact_metadata.portal : {};
  return {
    id: row.id,
    email: row.email,
    fullName: displayName(row),
    phone: row.phone || "",
    linkedContactId: row.linked_contact_id || null,
    crmRole: row.crm_role || null,
    portalRole: normalizePortalRole(row.portal_role || portal.portalRole),
    portalStatus: row.portal_status || "active",
    company: row.company || "",
    contactType: row.contact_type || "prospect",
    profile: portal,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
  };
}

async function requireExternalAccount(req, res, sql) {
  const decoded = await getAuthUser(req);
  if (!decoded || !decoded.userId) {
    res.status(401).json({ ok: false, error: "Connexion requise" });
    return null;
  }
  const account = await loadPortalAccount(sql, decoded.userId);
  if (!account) {
    res.status(401).json({ ok: false, error: "Compte introuvable" });
    return null;
  }
  if ((account.portal_status || "active") !== "active" || (account.status || "active") !== "active") {
    res.status(403).json({ ok: false, error: "Compte inactif" });
    return null;
  }
  if (!account.linked_contact_id) {
    res.status(409).json({ ok: false, error: "Compte non relié à un dossier CRM" });
    return null;
  }
  return account;
}

async function ensureContactForPortal(sql, body, email) {
  const existing = await sql`
    SELECT id, metadata, contact_type
    FROM crm_contacts
    WHERE LOWER(email) = ${email}
    ORDER BY updated_at DESC NULLS LAST, created_at DESC
    LIMIT 1
  `;
  const split = splitName(body.fullName);
  const firstName = String(body.firstName || split.firstName || "").trim().slice(0, 120);
  const lastName = String(body.lastName || split.lastName || "").trim().slice(0, 120);
  const meta = mergeContactMetadata(existing[0] && existing[0].metadata, body);

  if (existing.length) {
    const current = existing[0];
    await sql`
      UPDATE crm_contacts
      SET first_name = COALESCE(${firstName || null}, first_name),
          last_name = COALESCE(${lastName || null}, last_name),
          phone = COALESCE(${String(body.phone || "").trim() || null}, phone),
          company = COALESCE(${String(body.company || "").trim() || null}, company),
          metadata = ${stringifyMeta(meta)},
          updated_at = NOW(),
          last_activity_at = NOW()
      WHERE id = ${current.id}
    `;
    return current.id;
  }

  const contactId = "ct_" + crypto.randomUUID();
  await sql`
    INSERT INTO crm_contacts (
      id, contact_type, first_name, last_name, email, phone, company,
      status, source, notes, metadata, last_activity_at
    ) VALUES (
      ${contactId}, 'prospect', ${firstName || null}, ${lastName || null}, ${email},
      ${String(body.phone || "").trim() || null}, ${String(body.company || "").trim() || null},
      'active', 'portal_register',
      ${body.notes || "Inscription portail acquéreur / vendeur / visiteur"},
      ${stringifyMeta(meta)},
      NOW()
    )
  `;
  return contactId;
}

async function createPortalActivity(sql, contactId, title, body) {
  await sql`
    INSERT INTO crm_activities (id, contact_id, activity_type, title, body)
    VALUES (${ "act_" + crypto.randomUUID() }, ${contactId}, 'portal', ${title}, ${body || null})
  `;
}

async function registerPortalAccount(sql, body) {
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!email || !password) {
    throw new Error("Email et mot de passe requis");
  }
  if (password.length < 8) {
    throw new Error("Mot de passe trop court (min 8 caractères)");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Email invalide");
  }
  const existing = await findPortalAccountByEmail(sql, email);
  if (existing) {
    throw new Error("Un compte existe déjà avec cet email");
  }
  const contactId = await ensureContactForPortal(sql, body, email);
  const userId = crypto.randomUUID();
  const role = "user";
  const crmRole = "client";
  const fullName = String(
    body.fullName ||
      [body.firstName || "", body.lastName || ""].join(" ").trim()
  ).trim();
  const { hash, salt } = hashPassword(password);
  const portalRole = normalizePortalRole(body.portalRole || body.role);

  await sql`
    INSERT INTO users (
      id, email, password_hash, salt, role, crm_role, full_name, phone, status,
      linked_contact_id, portal_role, portal_status
    ) VALUES (
      ${userId}, ${email}, ${hash}, ${salt}, ${role}, ${crmRole}, ${fullName || null},
      ${String(body.phone || "").trim() || null}, 'active',
      ${contactId}, ${portalRole}, 'active'
    )
  `;

  await createPortalActivity(
    sql,
    contactId,
    "Inscription portail",
    "Compte " + portalRole + " créé pour " + email
  );

  const token = signToken({ userId, email, role, crmRole, linkedContactId: contactId, portalRole });
  const account = await loadPortalAccount(sql, userId);
  return { token, user: serializePortalUser(account) };
}

async function loginPortalAccount(sql, email, password) {
  const account = await findPortalAccountByEmail(sql, email);
  if (!account || !account.password_hash || !verifyPassword(password, account.password_hash, account.salt)) {
    throw new Error("Identifiants invalides");
  }
  if ((account.portal_status || "active") !== "active" || (account.status || "active") !== "active") {
    throw new Error("Compte inactif");
  }
  await sql`UPDATE users SET last_login_at = NOW() WHERE id = ${account.id}`;
  const token = signToken({
    userId: account.id,
    email: account.email,
    role: account.role,
    crmRole: account.crm_role || null,
    linkedContactId: account.linked_contact_id || null,
    portalRole: normalizePortalRole(account.portal_role),
  });
  const fresh = await loadPortalAccount(sql, account.id);
  return { token, user: serializePortalUser(fresh) };
}

module.exports = {
  ensureExternalPortalSchema,
  PORTAL_ROLES,
  normalizePortalRole,
  parseMeta,
  stringifyMeta,
  splitName,
  displayName,
  buildPortalProfilePatch,
  mergeContactMetadata,
  loadPortalAccount,
  findPortalAccountByEmail,
  serializePortalUser,
  requireExternalAccount,
  ensureContactForPortal,
  createPortalActivity,
  registerPortalAccount,
  loginPortalAccount,
};
