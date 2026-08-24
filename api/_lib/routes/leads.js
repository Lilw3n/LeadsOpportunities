const { getAuthUser } = require("../auth");
const { applyApiGuards, sanitizeEnum, sanitizeSearch } = require("../security");
const { parseLeadListFilters, enrichLeadRow, leadMatchesPlatforms } = require("../leads-filters");
const { ensureSiteLeadsSchema } = require("../ensure-schema");

const VALID_STATUS = ["new", "contacted", "qualified", "converted", "lost"];
const VALID_SORT = ["created_at", "lead_score", "vertical", "email", "status"];

function sanitizeVertical(v) {
  var s = String(v || "")
    .trim()
    .toLowerCase()
    .slice(0, 40);
  if (!s) return null;
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(s)) return null;
  return s;
}

function sanitizeIpQuery(v) {
  var s = String(v || "")
    .trim()
    .slice(0, 45);
  if (!s) return null;
  if (!/^[0-9a-fA-F.:]+$/.test(s)) return null;
  return s;
}

const ORDER_BY_CASE = `
    ORDER BY
      CASE WHEN \${sortCol} = 'lead_score' AND \${orderAsc} = true THEN lead_score END ASC NULLS LAST,
      CASE WHEN \${sortCol} = 'lead_score' AND \${orderAsc} = false THEN lead_score END DESC NULLS LAST,
      CASE WHEN \${sortCol} = 'vertical' AND \${orderAsc} = true THEN vertical END ASC,
      CASE WHEN \${sortCol} = 'vertical' AND \${orderAsc} = false THEN vertical END DESC,
      CASE WHEN \${sortCol} = 'email' AND \${orderAsc} = true THEN email END ASC NULLS LAST,
      CASE WHEN \${sortCol} = 'email' AND \${orderAsc} = false THEN email END DESC NULLS LAST,
      CASE WHEN \${sortCol} = 'status' AND \${orderAsc} = true THEN status END ASC NULLS LAST,
      CASE WHEN \${sortCol} = 'status' AND \${orderAsc} = false THEN status END DESC NULLS LAST,
      CASE WHEN \${sortCol} = 'created_at' AND \${orderAsc} = true THEN created_at END ASC,
      CASE WHEN \${sortCol} = 'created_at' AND \${orderAsc} = false THEN created_at END DESC,
      created_at DESC`;

async function fetchLeadsStandard(sql, opts) {
  const view = opts.viewVal || "";
  const views = opts.viewsList || null;
  const wantNew = !!(views && views.indexOf("new") >= 0) || view === "new";
  const wantUnopened = !!(views && views.indexOf("unopened") >= 0) || view === "unopened";
  const wantRelevant = !!(views && views.indexOf("relevant") >= 0) || view === "relevant";
  const anyView = wantNew || wantUnopened || wantRelevant;
  const plat = opts.platformVal || "";
  const statusList = opts.statusList || null;
  const verticalList = opts.verticalList || null;
  const sortCol = opts.sortCol;
  const orderAsc = opts.orderAsc;
  return sql`
    SELECT
      id, source, vertical, lead_score, email, phone, utm_source, utm_medium,
      COALESCE(status, 'new') AS status, notes, created_at, updated_at, payload,
      landing_slug, seo_city, seo_product, is_duplicate, parent_lead_id, client_ip, contact_id,
      platform, gclid
    FROM site_leads
    WHERE (${statusList}::text[] IS NULL OR COALESCE(status, 'new') = ANY(${statusList}))
      AND (${verticalList}::text[] IS NULL OR vertical = ANY(${verticalList}))
      AND (${opts.searchPattern}::text IS NULL OR (
        LOWER(COALESCE(email, '')) LIKE LOWER(${opts.searchPattern})
        OR LOWER(COALESCE(phone, '')) LIKE LOWER(${opts.searchPattern})
        OR LOWER(COALESCE(vertical, '')) LIKE LOWER(${opts.searchPattern})
        OR LOWER(COALESCE(source, '')) LIKE LOWER(${opts.searchPattern})
        OR LOWER(COALESCE(client_ip, '')) LIKE LOWER(${opts.searchPattern})
        OR LOWER(COALESCE(
          CASE
            WHEN payload IS NULL OR trim(payload) = '' THEN NULL
            WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'clientIp')
            ELSE NULL
          END, '')) LIKE LOWER(${opts.searchPattern})
      ))
      AND (${opts.ipPattern}::text IS NULL OR (
        LOWER(COALESCE(client_ip, '')) LIKE LOWER(${opts.ipPattern})
        OR LOWER(COALESCE(
          CASE
            WHEN payload IS NULL OR trim(payload) = '' THEN NULL
            WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'clientIp')
            ELSE NULL
          END, '')) LIKE LOWER(${opts.ipPattern})
      ))
      AND (${opts.scoreMin}::int IS NULL OR COALESCE(lead_score, 0) >= ${opts.scoreMin})
      AND (${anyView} = false OR (
        (${wantRelevant} = true AND COALESCE(
          CASE
            WHEN payload IS NULL OR trim(payload) = '' THEN NULL
            WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'relevance')
            ELSE NULL
          END, '') = 'high')
        OR (${wantUnopened} = true AND COALESCE(
          CASE
            WHEN payload IS NULL OR trim(payload) = '' THEN NULL
            WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'openedAt')
            ELSE NULL
          END, '') = '')
        OR (${wantNew} = true AND (
          COALESCE(status, 'new') = 'new'
          AND COALESCE(
            CASE
              WHEN payload IS NULL OR trim(payload) = '' THEN NULL
              WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'openedAt')
              ELSE NULL
            END, '') = '')
        )
      ))
      AND (${plat} = '' OR ${plat} != 'google' OR (
        LOWER(COALESCE(utm_source, '')) LIKE '%google%'
        OR COALESCE(gclid, '') <> ''))
      AND (${plat} = '' OR ${plat} NOT IN ('facebook', 'meta') OR (
        LOWER(COALESCE(utm_source, '')) LIKE '%facebook%'
        OR LOWER(COALESCE(utm_source, '')) LIKE '%meta%'
        OR LOWER(COALESCE(utm_source, '')) LIKE '%instagram%'))
      AND (${plat} = '' OR ${plat} IN ('google', 'facebook', 'meta') OR (
        COALESCE(source, '') = ${plat}
        OR LOWER(COALESCE(utm_source, '')) = LOWER(${plat})))
    ORDER BY
      CASE WHEN ${sortCol} = 'lead_score' AND ${orderAsc} = true THEN lead_score END ASC NULLS LAST,
      CASE WHEN ${sortCol} = 'lead_score' AND ${orderAsc} = false THEN lead_score END DESC NULLS LAST,
      CASE WHEN ${sortCol} = 'vertical' AND ${orderAsc} = true THEN vertical END ASC,
      CASE WHEN ${sortCol} = 'vertical' AND ${orderAsc} = false THEN vertical END DESC,
      CASE WHEN ${sortCol} = 'email' AND ${orderAsc} = true THEN email END ASC NULLS LAST,
      CASE WHEN ${sortCol} = 'email' AND ${orderAsc} = false THEN email END DESC NULLS LAST,
      CASE WHEN ${sortCol} = 'status' AND ${orderAsc} = true THEN status END ASC NULLS LAST,
      CASE WHEN ${sortCol} = 'status' AND ${orderAsc} = false THEN status END DESC NULLS LAST,
      CASE WHEN ${sortCol} = 'created_at' AND ${orderAsc} = true THEN created_at END ASC,
      CASE WHEN ${sortCol} = 'created_at' AND ${orderAsc} = false THEN created_at END DESC,
      created_at DESC
    LIMIT ${opts.limit} OFFSET ${opts.offset}
  `;
}

async function countLeadsStandard(sql, opts) {
  const view = opts.viewVal || "";
  const views = opts.viewsList || null;
  const wantNew = !!(views && views.indexOf("new") >= 0) || view === "new";
  const wantUnopened = !!(views && views.indexOf("unopened") >= 0) || view === "unopened";
  const wantRelevant = !!(views && views.indexOf("relevant") >= 0) || view === "relevant";
  const anyView = wantNew || wantUnopened || wantRelevant;
  const plat = opts.platformVal || "";
  const statusList = opts.statusList || null;
  const verticalList = opts.verticalList || null;
  const rows = await sql`
    SELECT COUNT(*)::int AS total FROM site_leads
    WHERE (${statusList}::text[] IS NULL OR COALESCE(status, 'new') = ANY(${statusList}))
      AND (${verticalList}::text[] IS NULL OR vertical = ANY(${verticalList}))
      AND (${opts.searchPattern}::text IS NULL OR (
        LOWER(COALESCE(email, '')) LIKE LOWER(${opts.searchPattern})
        OR LOWER(COALESCE(phone, '')) LIKE LOWER(${opts.searchPattern})
        OR LOWER(COALESCE(vertical, '')) LIKE LOWER(${opts.searchPattern})
        OR LOWER(COALESCE(source, '')) LIKE LOWER(${opts.searchPattern})
        OR LOWER(COALESCE(client_ip, '')) LIKE LOWER(${opts.searchPattern})
        OR LOWER(COALESCE(
          CASE
            WHEN payload IS NULL OR trim(payload) = '' THEN NULL
            WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'clientIp')
            ELSE NULL
          END, '')) LIKE LOWER(${opts.searchPattern})
      ))
      AND (${opts.ipPattern}::text IS NULL OR (
        LOWER(COALESCE(client_ip, '')) LIKE LOWER(${opts.ipPattern})
        OR LOWER(COALESCE(
          CASE
            WHEN payload IS NULL OR trim(payload) = '' THEN NULL
            WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'clientIp')
            ELSE NULL
          END, '')) LIKE LOWER(${opts.ipPattern})
      ))
      AND (${opts.scoreMin}::int IS NULL OR COALESCE(lead_score, 0) >= ${opts.scoreMin})
      AND (${anyView} = false OR (
        (${wantRelevant} = true AND COALESCE(
          CASE
            WHEN payload IS NULL OR trim(payload) = '' THEN NULL
            WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'relevance')
            ELSE NULL
          END, '') = 'high')
        OR (${wantUnopened} = true AND COALESCE(
          CASE
            WHEN payload IS NULL OR trim(payload) = '' THEN NULL
            WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'openedAt')
            ELSE NULL
          END, '') = '')
        OR (${wantNew} = true AND (
          COALESCE(status, 'new') = 'new'
          AND COALESCE(
            CASE
              WHEN payload IS NULL OR trim(payload) = '' THEN NULL
              WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'openedAt')
              ELSE NULL
            END, '') = '')
        )
      ))
      AND (${plat} = '' OR ${plat} != 'google' OR (
        LOWER(COALESCE(utm_source, '')) LIKE '%google%'
        OR COALESCE(gclid, '') <> ''))
      AND (${plat} = '' OR ${plat} NOT IN ('facebook', 'meta') OR (
        LOWER(COALESCE(utm_source, '')) LIKE '%facebook%'
        OR LOWER(COALESCE(utm_source, '')) LIKE '%meta%'
        OR LOWER(COALESCE(utm_source, '')) LIKE '%instagram%'))
      AND (${plat} = '' OR ${plat} IN ('google', 'facebook', 'meta') OR (
        COALESCE(source, '') = ${plat}
        OR LOWER(COALESCE(utm_source, '')) = LOWER(${plat})))
  `;
  return rows[0].total;
}

async function fetchLeadsMinimal(sql, opts) {
  const sortCol = opts.sortCol;
  const orderAsc = opts.orderAsc;
  const verticalList = opts.verticalList || null;
  return sql`
    SELECT
      id, source, vertical, lead_score, email, phone,
      created_at, updated_at, payload, contact_id
    FROM site_leads
    WHERE (${verticalList}::text[] IS NULL OR vertical = ANY(${verticalList}))
      AND (${opts.searchPattern}::text IS NULL OR (
        LOWER(COALESCE(email, '')) LIKE LOWER(${opts.searchPattern})
        OR LOWER(COALESCE(phone, '')) LIKE LOWER(${opts.searchPattern})
        OR LOWER(COALESCE(vertical, '')) LIKE LOWER(${opts.searchPattern})
        OR LOWER(COALESCE(source, '')) LIKE LOWER(${opts.searchPattern})
        OR LOWER(COALESCE(client_ip, '')) LIKE LOWER(${opts.searchPattern})
        OR LOWER(COALESCE(
          CASE
            WHEN payload IS NULL OR trim(payload) = '' THEN NULL
            WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'clientIp')
            ELSE NULL
          END, '')) LIKE LOWER(${opts.searchPattern})
      ))
      AND (${opts.ipPattern}::text IS NULL OR (
        LOWER(COALESCE(client_ip, '')) LIKE LOWER(${opts.ipPattern})
        OR LOWER(COALESCE(
          CASE
            WHEN payload IS NULL OR trim(payload) = '' THEN NULL
            WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'clientIp')
            ELSE NULL
          END, '')) LIKE LOWER(${opts.ipPattern})
      ))
      AND (${opts.scoreMin}::int IS NULL OR COALESCE(lead_score, 0) >= ${opts.scoreMin})
    ORDER BY
      CASE WHEN ${sortCol} = 'lead_score' AND ${orderAsc} = true THEN lead_score END ASC NULLS LAST,
      CASE WHEN ${sortCol} = 'lead_score' AND ${orderAsc} = false THEN lead_score END DESC NULLS LAST,
      CASE WHEN ${sortCol} = 'created_at' AND ${orderAsc} = true THEN created_at END ASC,
      CASE WHEN ${sortCol} = 'created_at' AND ${orderAsc} = false THEN created_at END DESC,
      created_at DESC
    LIMIT ${opts.limit} OFFSET ${opts.offset}
  `;
}

async function countLeadsMinimal(sql, opts) {
  const verticalList = opts.verticalList || null;
  const rows = await sql`
    SELECT COUNT(*)::int AS total FROM site_leads
    WHERE (${verticalList}::text[] IS NULL OR vertical = ANY(${verticalList}))
      AND (${opts.searchPattern}::text IS NULL OR (
        LOWER(COALESCE(email, '')) LIKE LOWER(${opts.searchPattern})
        OR LOWER(COALESCE(phone, '')) LIKE LOWER(${opts.searchPattern})
        OR LOWER(COALESCE(vertical, '')) LIKE LOWER(${opts.searchPattern})
        OR LOWER(COALESCE(source, '')) LIKE LOWER(${opts.searchPattern})
        OR LOWER(COALESCE(client_ip, '')) LIKE LOWER(${opts.searchPattern})
        OR LOWER(COALESCE(
          CASE
            WHEN payload IS NULL OR trim(payload) = '' THEN NULL
            WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'clientIp')
            ELSE NULL
          END, '')) LIKE LOWER(${opts.searchPattern})
      ))
      AND (${opts.ipPattern}::text IS NULL OR (
        LOWER(COALESCE(client_ip, '')) LIKE LOWER(${opts.ipPattern})
        OR LOWER(COALESCE(
          CASE
            WHEN payload IS NULL OR trim(payload) = '' THEN NULL
            WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'clientIp')
            ELSE NULL
          END, '')) LIKE LOWER(${opts.ipPattern})
      ))
      AND (${opts.scoreMin}::int IS NULL OR COALESCE(lead_score, 0) >= ${opts.scoreMin})
  `;
  return rows[0].total;
}

async function loadLeadsList(sql, opts) {
  try {
    const rows = await fetchLeadsStandard(sql, opts);
    const total = await countLeadsStandard(sql, opts);
    return { rows, total, tier: "standard" };
  } catch (e) {
    console.warn("[dashboard/leads] standard failed:", e.message);
  }
  try {
    const rows = await fetchLeadsMinimal(sql, opts);
    const total = await countLeadsMinimal(sql, opts);
    return { rows, total, tier: "minimal" };
  } catch (e) {
    console.warn("[dashboard/leads] minimal failed:", e.message);
    throw e;
  }
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await getAuthUser(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Acces refuse" });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return res.status(500).json({ error: "Base de donnees non configuree" });

  const url = new URL(req.url, "http://localhost");
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(250, Math.max(1, parseInt(url.searchParams.get("limit") || "100", 10)));
  const offset = (page - 1) * limit;

  const statusVal = null;
  const verticalVal = null;
  const searchVal = url.searchParams.get("search")
    ? sanitizeSearch(url.searchParams.get("search"))
    : null;
  const searchPattern = searchVal ? "%" + searchVal + "%" : null;
  const ipVal = sanitizeIpQuery(url.searchParams.get("ip"));
  const ipPattern = ipVal ? "%" + ipVal + "%" : null;
  var scoreMinRaw = parseInt(url.searchParams.get("scoreMin") || "", 10);
  const scoreMin = Number.isFinite(scoreMinRaw) ? scoreMinRaw : null;
  var sortCol = sanitizeEnum(url.searchParams.get("sort") || "created_at", VALID_SORT, "created_at");
  const orderAsc = String(url.searchParams.get("order") || "desc").toUpperCase() === "ASC";
  const listFilters = parseLeadListFilters(url);
  const viewVal = listFilters.view;
  const viewsList = listFilters.views || null;
  const statusList = listFilters.statuses || null;
  const verticalList = listFilters.verticals || null;
  const platformsList = listFilters.platforms || null;
  // Un seul réseau → filtre SQL historique ; plusieurs → filtre app après enrich
  const platformVal =
    platformsList && platformsList.length === 1
      ? platformsList[0]
      : listFilters.platform
        ? String(listFilters.platform).slice(0, 40)
        : null;

  const queryOpts = {
    statusVal,
    verticalVal,
    statusList,
    verticalList,
    searchPattern,
    ipPattern,
    scoreMin,
    sortCol,
    orderAsc,
    limit,
    offset,
    viewVal,
    viewsList,
    platformVal,
  };

  try {
    const { neon } = require("@neondatabase/serverless");
    const sql = neon(dbUrl);

    await ensureSiteLeadsSchema(sql);

    const result = await loadLeadsList(sql, queryOpts);
    var leads = result.rows.map(enrichLeadRow);
    var total = result.total;

    if (platformsList && platformsList.length > 1) {
      leads = leads.filter(function (l) {
        return leadMatchesPlatforms(l, platformsList);
      });
      total = leads.length;
    }

    return res.status(200).json({
      ok: true,
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (e) {
    console.error("[dashboard/leads]", e);
    return res.status(500).json({ error: "Erreur serveur", detail: e.message });
  }
};
