/**
 * Recherche leads dashboard / CRM — canaux visibles (mail, tél, réseau, IP…).
 */
const LEAD_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const SEARCH_SCOPES = [
  "email",
  "phone",
  "platform",
  "ip",
  "vertical",
  "status",
  "id",
  "name",
  "city",
];

const STATUS_ALIASES = {
  nouveau: "new",
  new: "new",
  contacte: "contacted",
  contacté: "contacted",
  contacted: "contacted",
  qualifie: "qualified",
  qualifié: "qualified",
  qualified: "qualified",
  converti: "converted",
  converted: "converted",
  perdu: "lost",
  lost: "lost",
};

function isLeadUuid(value) {
  return LEAD_UUID_RE.test(String(value || "").trim());
}

function normalizeLeadId(value) {
  return String(value || "").trim();
}

function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

/** Variantes FR pour matcher 06… et +33 6… */
function phoneDigitVariants(value) {
  var d = digitsOnly(value);
  if (!d) return [];
  var out = [d];
  if (d.indexOf("33") === 0 && d.length >= 11) out.push("0" + d.slice(2));
  if (d.charAt(0) === "0" && d.length >= 9) out.push("33" + d.slice(1));
  return out;
}

function phoneDigitsMatch(storedPhone, needle) {
  var needles = phoneDigitVariants(needle);
  var haystacks = phoneDigitVariants(storedPhone);
  if (!needles.length || !haystacks.length) return false;
  for (var i = 0; i < needles.length; i++) {
    var n = needles[i];
    if (n.length < 3) continue;
    for (var j = 0; j < haystacks.length; j++) {
      if (haystacks[j].indexOf(n) >= 0) return true;
    }
  }
  return false;
}

/** Parse searchIn=email,phone,platform — vide = tous les canaux. */
function parseSearchScopes(raw) {
  var rawStr = String(raw || "").trim().toLowerCase();
  if (rawStr === "__none__") return {};
  var list = rawStr
    .split(/[,;\s]+/)
    .map(function (s) {
      return s.trim().toLowerCase();
    })
    .filter(Boolean);
  if (!list.length) return null;
  var set = {};
  var any = false;
  list.forEach(function (s) {
    if (SEARCH_SCOPES.indexOf(s) >= 0) {
      set[s] = true;
      any = true;
    }
  });
  return any ? set : null;
}

function wantScope(scopes, key) {
  return !scopes || !!scopes[key];
}

function statusSearchValue(searchVal) {
  var key = String(searchVal || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return STATUS_ALIASES[key] || null;
}

/**
 * Clause SQL Neon : match sur les canaux visibles de la table leads.
 * @param {object} sql — tagged template neon
 * @param {string} searchPattern — déjà avec %…%
 * @param {{ scopes?: object|null, digitsPattern?: string|null, statusExact?: string|null }} [opts]
 */
function leadListSearchMatch(sql, searchPattern, opts) {
  opts = opts || {};
  var scopes = opts.scopes || null;
  var digitsPattern = opts.digitsPattern || null;
  var statusExact = opts.statusExact || null;
  var wEmail = wantScope(scopes, "email");
  var wPhone = wantScope(scopes, "phone");
  var wPlat = wantScope(scopes, "platform");
  var wIp = wantScope(scopes, "ip");
  var wVert = wantScope(scopes, "vertical");
  var wStatus = wantScope(scopes, "status");
  var wId = wantScope(scopes, "id");
  var wName = wantScope(scopes, "name");
  var wCity = wantScope(scopes, "city");

  return sql`(
    (${wEmail} = true AND (
      LOWER(COALESCE(email, '')) LIKE LOWER(${searchPattern})
      OR LOWER(COALESCE(
        CASE
          WHEN payload IS NULL OR trim(payload) = '' THEN NULL
          WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'email')
          ELSE NULL
        END, '')) LIKE LOWER(${searchPattern})
    ))
    OR (${wPhone} = true AND (
      LOWER(COALESCE(phone, '')) LIKE LOWER(${searchPattern})
      OR LOWER(COALESCE(
        CASE
          WHEN payload IS NULL OR trim(payload) = '' THEN NULL
          WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'phone')
          ELSE NULL
        END, '')) LIKE LOWER(${searchPattern})
      OR (
        ${digitsPattern}::text IS NOT NULL
        AND (
          regexp_replace(COALESCE(phone, ''), '[^0-9]', '', 'g') LIKE ${digitsPattern}
          OR (
            CASE
              WHEN regexp_replace(COALESCE(phone, ''), '[^0-9]', '', 'g') LIKE '33%'
              THEN ('0' || substr(regexp_replace(COALESCE(phone, ''), '[^0-9]', '', 'g'), 3))
              ELSE regexp_replace(COALESCE(phone, ''), '[^0-9]', '', 'g')
            END
          ) LIKE ${digitsPattern}
          OR (
            CASE
              WHEN regexp_replace(COALESCE(phone, ''), '[^0-9]', '', 'g') LIKE '0%'
              THEN ('33' || substr(regexp_replace(COALESCE(phone, ''), '[^0-9]', '', 'g'), 2))
              ELSE regexp_replace(COALESCE(phone, ''), '[^0-9]', '', 'g')
            END
          ) LIKE ${digitsPattern}
        )
      )
    ))
    OR (${wPlat} = true AND (
      LOWER(COALESCE(platform, '')) LIKE LOWER(${searchPattern})
      OR LOWER(COALESCE(source, '')) LIKE LOWER(${searchPattern})
      OR LOWER(COALESCE(utm_source, '')) LIKE LOWER(${searchPattern})
      OR LOWER(COALESCE(utm_medium, '')) LIKE LOWER(${searchPattern})
      OR LOWER(COALESCE(utm_campaign, '')) LIKE LOWER(${searchPattern})
      OR LOWER(COALESCE(landing_slug, '')) LIKE LOWER(${searchPattern})
      OR LOWER(COALESCE(gclid, '')) LIKE LOWER(${searchPattern})
      OR LOWER(COALESCE(fbclid, '')) LIKE LOWER(${searchPattern})
      OR LOWER(COALESCE(ttclid, '')) LIKE LOWER(${searchPattern})
    ))
    OR (${wIp} = true AND (
      LOWER(COALESCE(client_ip, '')) LIKE LOWER(${searchPattern})
      OR LOWER(COALESCE(
        CASE
          WHEN payload IS NULL OR trim(payload) = '' THEN NULL
          WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'clientIp')
          ELSE NULL
        END, '')) LIKE LOWER(${searchPattern})
    ))
    OR (${wVert} = true AND LOWER(COALESCE(vertical, '')) LIKE LOWER(${searchPattern}))
    OR (${wStatus} = true AND (
      LOWER(COALESCE(status, 'new')) LIKE LOWER(${searchPattern})
      OR (
        ${statusExact}::text IS NOT NULL
        AND LOWER(COALESCE(status, 'new')) = LOWER(${statusExact})
      )
    ))
    OR (${wId} = true AND (
      LOWER(id) LIKE LOWER(${searchPattern})
      OR LOWER(COALESCE(contact_id, '')) LIKE LOWER(${searchPattern})
      OR LOWER(COALESCE(visitor_id, '')) LIKE LOWER(${searchPattern})
      OR LOWER(COALESCE(notes, '')) LIKE LOWER(${searchPattern})
    ))
    OR (${wName} = true AND (
      LOWER(COALESCE(
        CASE
          WHEN payload IS NULL OR trim(payload) = '' THEN NULL
          WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'firstName')
          ELSE NULL
        END, '')) LIKE LOWER(${searchPattern})
      OR LOWER(COALESCE(
        CASE
          WHEN payload IS NULL OR trim(payload) = '' THEN NULL
          WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'lastName')
          ELSE NULL
        END, '')) LIKE LOWER(${searchPattern})
      OR LOWER(COALESCE(
        CASE
          WHEN payload IS NULL OR trim(payload) = '' THEN NULL
          WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'fullName')
          ELSE NULL
        END, '')) LIKE LOWER(${searchPattern})
    ))
    OR (${wCity} = true AND (
      LOWER(COALESCE(city, '')) LIKE LOWER(${searchPattern})
      OR LOWER(COALESCE(postal_code, '')) LIKE LOWER(${searchPattern})
      OR LOWER(COALESCE(seo_city, '')) LIKE LOWER(${searchPattern})
      OR LOWER(COALESCE(
        CASE
          WHEN payload IS NULL OR trim(payload) = '' THEN NULL
          WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'city')
          ELSE NULL
        END, '')) LIKE LOWER(${searchPattern})
    ))
  )`;
}

/** Variante colonnes minimales (fallback schéma réduit). */
function leadListSearchMatchMinimal(sql, searchPattern, opts) {
  opts = opts || {};
  var scopes = opts.scopes || null;
  var digitsPattern = opts.digitsPattern || null;
  var wEmail = wantScope(scopes, "email");
  var wPhone = wantScope(scopes, "phone");
  var wPlat = wantScope(scopes, "platform");
  var wIp = wantScope(scopes, "ip");
  var wVert = wantScope(scopes, "vertical");
  var wId = wantScope(scopes, "id");
  var wName = wantScope(scopes, "name");
  var wCity = wantScope(scopes, "city");

  return sql`(
    (${wEmail} = true AND LOWER(COALESCE(email, '')) LIKE LOWER(${searchPattern}))
    OR (${wPhone} = true AND (
      LOWER(COALESCE(phone, '')) LIKE LOWER(${searchPattern})
      OR (
        ${digitsPattern}::text IS NOT NULL
        AND regexp_replace(COALESCE(phone, ''), '[^0-9]', '', 'g') LIKE ${digitsPattern}
      )
    ))
    OR (${wPlat} = true AND (
      LOWER(COALESCE(source, '')) LIKE LOWER(${searchPattern})
    ))
    OR (${wIp} = true AND (
      LOWER(COALESCE(client_ip, '')) LIKE LOWER(${searchPattern})
      OR LOWER(COALESCE(
        CASE
          WHEN payload IS NULL OR trim(payload) = '' THEN NULL
          WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'clientIp')
          ELSE NULL
        END, '')) LIKE LOWER(${searchPattern})
    ))
    OR (${wVert} = true AND LOWER(COALESCE(vertical, '')) LIKE LOWER(${searchPattern}))
    OR (${wId} = true AND LOWER(id) LIKE LOWER(${searchPattern}))
    OR (${wName} = true AND (
      LOWER(COALESCE(
        CASE
          WHEN payload IS NULL OR trim(payload) = '' THEN NULL
          WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'fullName')
          ELSE NULL
        END, '')) LIKE LOWER(${searchPattern})
    ))
    OR (${wCity} = true AND LOWER(COALESCE(
      CASE
        WHEN payload IS NULL OR trim(payload) = '' THEN NULL
        WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'city')
        ELSE NULL
      END, '')) LIKE LOWER(${searchPattern})
  )`;
}

function leadHaystack(lead) {
  var l = lead || {};
  var payload = l.payload_obj || {};
  if (!l.payload_obj && l.payload) {
    try {
      payload = typeof l.payload === "object" ? l.payload : JSON.parse(l.payload);
    } catch (e) {
      payload = {};
    }
  }
  return [
    l.id,
    l.email,
    l.phone,
    l.vertical,
    l.source,
    l.platform,
    l.utm_source,
    l.utm_medium,
    l.utm_campaign,
    l.status,
    l.contact_id,
    l.visitor_id,
    l.notes,
    l.client_ip,
    l.landing_slug,
    l.city,
    l.seo_city,
    l.gclid,
    l.fbclid,
    l.ttclid,
    payload.firstName,
    payload.lastName,
    payload.fullName,
    payload.city,
    payload.phone,
    payload.email,
    payload.clientIp,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function leadMatchesQuery(lead, q) {
  var needle = String(q || "")
    .trim()
    .toLowerCase();
  if (!needle) return true;
  if (isLeadUuid(needle) && String(lead && lead.id ? lead.id : "").toLowerCase() === needle) {
    return true;
  }
  var hay = leadHaystack(lead);
  if (hay.indexOf(needle) >= 0) return true;
  var dig = digitsOnly(needle);
  if (dig.length >= 3 && phoneDigitsMatch(lead && lead.phone, dig)) return true;
  var payloadPhone =
    lead && lead.payload
      ? (function () {
          try {
            var p = typeof lead.payload === "object" ? lead.payload : JSON.parse(lead.payload);
            return p && p.phone;
          } catch (e) {
            return null;
          }
        })()
      : null;
  if (dig.length >= 3 && phoneDigitsMatch(payloadPhone, dig)) return true;
  var st = statusSearchValue(needle);
  if (st && String(lead && lead.status ? lead.status : "new").toLowerCase() === st) return true;
  return false;
}

module.exports = {
  LEAD_UUID_RE,
  SEARCH_SCOPES,
  isLeadUuid,
  normalizeLeadId,
  digitsOnly,
  phoneDigitVariants,
  phoneDigitsMatch,
  parseSearchScopes,
  statusSearchValue,
  leadListSearchMatch,
  leadListSearchMatchMinimal,
  leadHaystack,
  leadMatchesQuery,
};
