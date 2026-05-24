/**
 * Accès JSON dans site_leads.payload (TEXT ou JSONB sur Neon)
 */
function payloadJsonField(sql, key) {
  return sql`
    CASE
      WHEN payload IS NULL OR trim(payload) = '' THEN NULL
      WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>${key})
      ELSE NULL
    END
  `;
}

function payloadJsonEquals(sql, key, value) {
  return sql`COALESCE(${payloadJsonField(sql, key)}, '') = ${value}`;
}

function payloadJsonIsEmpty(sql, key) {
  return payloadJsonEquals(sql, key, "");
}

module.exports = {
  payloadJsonField,
  payloadJsonEquals,
  payloadJsonIsEmpty,
};
