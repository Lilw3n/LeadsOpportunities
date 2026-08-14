/**
 * Réseau d’acquisition (Meta, Google…) — distinct du type de formulaire
 * (landing_form / landing_quick).
 */
var LABELS = {
  facebook: "Meta",
  instagram: "Instagram",
  google: "Google",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  withallo: "WithAllo",
  site_web: "Site / organique",
  autre: "Autre",
};

function parsePayload(row) {
  var p = row && row.payload;
  if (p && typeof p === "object") return p;
  if (typeof p === "string") {
    try {
      return JSON.parse(p);
    } catch (e) {
      return {};
    }
  }
  return {};
}

function detectNetwork(row) {
  if (!row) return "autre";
  var p = parsePayload(row);
  var utm = String(
    row.utm_source || p.utm_source || p.attr_last_utm_source || p.attr_first_utm_source || ""
  ).toLowerCase();
  var src = String(row.source || p.source || "").toLowerCase();
  var parcours = String(p.parcours_id || row.parcours_id || "").toLowerCase();
  var stored = String(row.platform || p.platform || "").toLowerCase();
  if (stored === "landing_form" || stored === "landing_quick") stored = "";
  var fbclid = row.fbclid || p.fbclid || p.attr_last_fbclid || p.attr_first_fbclid || p.attr_fbclid;
  var gclid = row.gclid || p.gclid || p.attr_last_gclid || p.attr_first_gclid;
  var ttclid = row.ttclid || p.ttclid;
  var bag = [stored, utm, src, parcours, String(p.referrer_first || p.referrer || "")].join(" ").toLowerCase();

  if (stored === "instagram" || /(instagram|\big\b)/.test(utm + " " + src)) return "instagram";
  if (
    fbclid ||
    stored === "facebook" ||
    stored === "meta" ||
    parcours === "meta_lead_rapide" ||
    src === "meta_lead_ads" ||
    /facebook|meta|fbads/.test(bag)
  ) {
    return "facebook";
  }
  if (ttclid || stored === "tiktok" || /tiktok/.test(bag)) return "tiktok";
  if (
    gclid ||
    stored === "google" ||
    parcours === "google_intention_chaude" ||
    /google|adwords|gclid/.test(bag)
  ) {
    return "google";
  }
  if (stored === "linkedin" || /linkedin|lnkd/.test(bag)) return "linkedin";
  if (stored === "withallo" || /withallo|\ballo\b/.test(bag)) return "withallo";
  if (
    stored === "site_web" ||
    src === "landing_form" ||
    src === "landing_quick" ||
    /site|web|organic|direct|landing/.test(src)
  ) {
    return "site_web";
  }
  if (stored && LABELS[stored]) return stored;
  return "autre";
}

function networkLabel(rowOrId) {
  var id = typeof rowOrId === "string" ? rowOrId : detectNetwork(rowOrId);
  return LABELS[id] || id || "Autre";
}

function normalizeNetworkFilter(platform) {
  var p = String(platform || "")
    .trim()
    .toLowerCase()
    .slice(0, 40);
  if (p === "meta") return "facebook";
  if (p === "landing_form" || p === "landing_quick") return "site_web";
  return p;
}

/** Aligné sur le filtre SQL : Meta inclut Instagram ; Site web = tout ce qui n’est pas payant. */
function matchesNetworkFilter(row, platform) {
  var p = normalizeNetworkFilter(platform);
  if (!p || p === "all") return true;
  var net = detectNetwork(row);
  if (p === "facebook") return net === "facebook" || net === "instagram";
  if (p === "site_web") return net === "site_web" || net === "autre";
  return net === p;
}

function sqlPayloadJsonb(sql) {
  return sql`(CASE
    WHEN payload IS NULL OR trim(payload) = '' OR left(trim(payload), 1) <> '{' THEN '{}'::jsonb
    ELSE payload::jsonb
  END)`;
}

/**
 * Prédicat SQL : le lead a été apporté par ce réseau (clic ids + payload),
 * pas par le type de formulaire (landing_form / landing_quick).
 */
function sqlLeadNetworkFilter(sql, plat, useClickIdColumns) {
  var jp = sqlPayloadJsonb(sql);
  var colFb = useClickIdColumns ? sql`COALESCE(fbclid, '') <> ''` : sql`FALSE`;
  var colG = useClickIdColumns ? sql`COALESCE(gclid, '') <> ''` : sql`FALSE`;
  var colTt = useClickIdColumns ? sql`COALESCE(ttclid, '') <> ''` : sql`FALSE`;
  var isMeta = sql`(
    ${colFb}
    OR COALESCE(${jp}->>'fbclid', '') <> ''
    OR COALESCE(${jp}->>'attr_last_fbclid', '') <> ''
    OR COALESCE(${jp}->>'attr_first_fbclid', '') <> ''
    OR LOWER(COALESCE(utm_source, '')) LIKE '%facebook%'
    OR LOWER(COALESCE(utm_source, '')) LIKE '%meta%'
    OR LOWER(COALESCE(utm_source, '')) LIKE '%instagram%'
    OR LOWER(COALESCE(source, '')) LIKE '%facebook%'
    OR LOWER(COALESCE(source, '')) LIKE '%meta%'
    OR LOWER(COALESCE(source, '')) = 'meta_lead_ads'
    OR LOWER(COALESCE(${jp}->>'parcours_id', '')) LIKE 'meta%'
    OR LOWER(COALESCE(${jp}->>'utm_source', '')) LIKE '%facebook%'
    OR LOWER(COALESCE(${jp}->>'utm_source', '')) LIKE '%meta%'
    OR LOWER(COALESCE(${jp}->>'utm_source', '')) LIKE '%instagram%'
    OR LOWER(COALESCE(${jp}->>'platform', '')) IN ('facebook', 'meta', 'instagram')
  )`;
  var isInstagram = sql`(
    LOWER(COALESCE(utm_source, '')) LIKE '%instagram%'
    OR LOWER(COALESCE(${jp}->>'utm_source', '')) LIKE '%instagram%'
    OR LOWER(COALESCE(${jp}->>'platform', '')) = 'instagram'
  )`;
  var isGoogle = sql`(
    ${colG}
    OR COALESCE(${jp}->>'gclid', '') <> ''
    OR COALESCE(${jp}->>'attr_last_gclid', '') <> ''
    OR COALESCE(${jp}->>'attr_first_gclid', '') <> ''
    OR LOWER(COALESCE(utm_source, '')) LIKE '%google%'
    OR LOWER(COALESCE(utm_source, '')) LIKE '%adwords%'
    OR LOWER(COALESCE(${jp}->>'utm_source', '')) LIKE '%google%'
    OR LOWER(COALESCE(${jp}->>'parcours_id', '')) LIKE 'google%'
    OR LOWER(COALESCE(${jp}->>'platform', '')) = 'google'
  )`;
  var isTiktok = sql`(
    ${colTt}
    OR COALESCE(${jp}->>'ttclid', '') <> ''
    OR LOWER(COALESCE(utm_source, '')) LIKE '%tiktok%'
    OR LOWER(COALESCE(${jp}->>'utm_source', '')) LIKE '%tiktok%'
    OR LOWER(COALESCE(${jp}->>'platform', '')) = 'tiktok'
  )`;
  var isLinkedin = sql`(
    LOWER(COALESCE(utm_source, '')) LIKE '%linkedin%'
    OR LOWER(COALESCE(${jp}->>'utm_source', '')) LIKE '%linkedin%'
    OR LOWER(COALESCE(${jp}->>'platform', '')) = 'linkedin'
  )`;
  var isWithallo = sql`(
    LOWER(COALESCE(source, '')) LIKE '%withallo%'
    OR LOWER(COALESCE(utm_source, '')) LIKE '%withallo%'
    OR LOWER(COALESCE(${jp}->>'source', '')) LIKE '%withallo%'
    OR LOWER(COALESCE(${jp}->>'utm_source', '')) LIKE '%withallo%'
  )`;
  return sql`(
    COALESCE(${plat}::text, '') = ''
    OR (
      CASE
        WHEN ${plat} IN ('facebook', 'meta') THEN ${isMeta}
        WHEN ${plat} = 'instagram' THEN ${isInstagram}
        WHEN ${plat} = 'google' THEN ${isGoogle}
        WHEN ${plat} = 'tiktok' THEN ${isTiktok}
        WHEN ${plat} = 'linkedin' THEN ${isLinkedin}
        WHEN ${plat} = 'withallo' THEN ${isWithallo}
        WHEN ${plat} = 'site_web' THEN NOT (${isMeta} OR ${isGoogle} OR ${isTiktok} OR ${isLinkedin} OR ${isWithallo})
        ELSE LOWER(COALESCE(utm_source, source, '')) = ${plat}
          OR LOWER(COALESCE(source, '')) = ${plat}
      END
    )
  )`;
}

module.exports = {
  LABELS: LABELS,
  detectNetwork: detectNetwork,
  networkLabel: networkLabel,
  parsePayload: parsePayload,
  normalizeNetworkFilter: normalizeNetworkFilter,
  matchesNetworkFilter: matchesNetworkFilter,
  sqlLeadNetworkFilter: sqlLeadNetworkFilter,
};
