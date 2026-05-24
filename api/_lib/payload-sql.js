/**
 * Expressions JSON sur site_leads.payload (TEXT ou JSONB).
 * IMPORTANT (@neondatabase/serverless) : ne pas imbriquer de fragments sql`...`
 * dans un autre sql`...` — inliner le CASE dans la requête complète.
 */

/** Expression CASE pour payload::jsonb->>'key' (key fixe, non utilisateur). */
function payloadJsonFieldSql(key) {
  return `CASE
      WHEN payload IS NULL OR trim(payload) = '' THEN NULL
      WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'${key}')
      ELSE NULL
    END`;
}

module.exports = {
  payloadJsonFieldSql,
};
