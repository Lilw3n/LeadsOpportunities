/**
 * Relations personnes ↔ personnes (famille, SCI, héritiers, parrainage).
 * Aucun montant, aucune promesse de rémunération.
 */
const crypto = require("crypto");
const Rel = require("../../js/crm-people-relations-lib.js");

let schemaReady = false;

async function ensureRelationsSchema(sql) {
  if (!sql) return false;
  if (schemaReady) return true;
  await sql`
    CREATE TABLE IF NOT EXISTS crm_contact_relationships (
      id TEXT PRIMARY KEY,
      from_contact_id TEXT NOT NULL,
      to_contact_id TEXT NOT NULL,
      rel_type TEXT NOT NULL,
      notes TEXT,
      created_by TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (from_contact_id, to_contact_id, rel_type)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_rel_from ON crm_contact_relationships(from_contact_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_rel_to ON crm_contact_relationships(to_contact_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_rel_type ON crm_contact_relationships(rel_type)`;
  schemaReady = true;
  return true;
}

function uid() {
  return "rel_" + crypto.randomBytes(8).toString("hex");
}

function rowToRel(r) {
  if (!r) return null;
  return Rel.stripPromises({
    id: r.id,
    from_contact_id: r.from_contact_id,
    to_contact_id: r.to_contact_id,
    rel_type: r.rel_type,
    notes: r.notes || "",
    from_name: r.from_name || "",
    to_name: r.to_name || "",
    from_type: r.from_type || "",
    to_type: r.to_type || "",
    created_by: r.created_by || null,
    created_at: r.created_at,
    updated_at: r.updated_at,
  });
}

async function listRelations(sql, opts) {
  await ensureRelationsSchema(sql);
  opts = opts || {};
  const contactId = opts.contactId || null;
  const relType = opts.relType || null;
  const limit = Math.min(500, Math.max(1, Number(opts.limit) || 200));
  const rows = await sql`
    SELECT r.id, r.from_contact_id, r.to_contact_id, r.rel_type, r.notes,
           r.created_by, r.created_at, r.updated_at,
           TRIM(COALESCE(a.first_name,'') || ' ' || COALESCE(a.last_name,'')) AS from_name,
           TRIM(COALESCE(b.first_name,'') || ' ' || COALESCE(b.last_name,'')) AS to_name,
           a.contact_type AS from_type,
           b.contact_type AS to_type
    FROM crm_contact_relationships r
    LEFT JOIN crm_contacts a ON a.id = r.from_contact_id
    LEFT JOIN crm_contacts b ON b.id = r.to_contact_id
    WHERE (${contactId}::text IS NULL OR r.from_contact_id = ${contactId} OR r.to_contact_id = ${contactId})
      AND (${relType}::text IS NULL OR r.rel_type = ${relType})
    ORDER BY r.updated_at DESC
    LIMIT ${limit}
  `;
  return rows.map(rowToRel);
}

async function upsertRelationship(sql, item, user) {
  await ensureRelationsSchema(sql);
  const norm = Rel.normalizeRelationship(item);
  if (Rel.hasForbiddenPromise(item)) {
    /* stripPromises already dropped forbidden keys; refuse leftover amounts */
  }
  const id = norm.id || uid();
  const createdBy = (user && user.id) || item.created_by || null;
  await sql`
    INSERT INTO crm_contact_relationships (
      id, from_contact_id, to_contact_id, rel_type, notes, created_by, updated_at
    ) VALUES (
      ${id}, ${norm.from_contact_id}, ${norm.to_contact_id}, ${norm.rel_type},
      ${norm.notes || null}, ${createdBy}, NOW()
    )
    ON CONFLICT (from_contact_id, to_contact_id, rel_type) DO UPDATE SET
      notes = EXCLUDED.notes,
      updated_at = NOW()
  `;
  const rows = await sql`
    SELECT r.id, r.from_contact_id, r.to_contact_id, r.rel_type, r.notes,
           r.created_by, r.created_at, r.updated_at
    FROM crm_contact_relationships r
    WHERE (r.id = ${id})
       OR (r.from_contact_id = ${norm.from_contact_id}
           AND r.to_contact_id = ${norm.to_contact_id}
           AND r.rel_type = ${norm.rel_type})
    LIMIT 1
  `;
  return rowToRel(rows[0]) || Object.assign({ id: id }, norm);
}

async function deleteRelationship(sql, id) {
  await ensureRelationsSchema(sql);
  await sql`DELETE FROM crm_contact_relationships WHERE id = ${id}`;
  return true;
}

module.exports = {
  ensureRelationsSchema,
  listRelations,
  upsertRelationship,
  deleteRelationship,
  Rel,
};
