const { getAuthUser } = require("../auth");
const { applyApiGuards, sanitizeEnum, sanitizeSearch } = require("../security");
const { parseLeadListFilters, applyViewFilter, applyPlatformFilter } = require("../leads-filters");

const VALID_STATUS = ["new", "contacted", "qualified", "converted", "lost"];
const VALID_VERTICAL = ["vtc", "sante", "credit-immo"];
const VALID_SORT = ["created_at", "lead_score", "vertical", "email", "status"];

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await getAuthUser(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Accès refusé" });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return res.status(500).json({ error: "Base de données non configurée" });

  const url = new URL(req.url, "http://localhost");
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10)));
  const offset = (page - 1) * limit;

  const statusVal = url.searchParams.get("status")
    ? sanitizeEnum(url.searchParams.get("status"), VALID_STATUS, null)
    : null;
  const verticalVal = url.searchParams.get("vertical")
    ? sanitizeEnum(url.searchParams.get("vertical"), VALID_VERTICAL, null)
    : null;
  const searchVal = url.searchParams.get("search")
    ? sanitizeSearch(url.searchParams.get("search"))
    : null;
  const searchPattern = searchVal ? "%" + searchVal + "%" : null;
  const sortCol = sanitizeEnum(url.searchParams.get("sort") || "created_at", VALID_SORT, "created_at");
  const orderAsc = String(url.searchParams.get("order") || "desc").toUpperCase() === "ASC";
  const listFilters = parseLeadListFilters(url);
  const viewVal = listFilters.view;
  const platformVal = listFilters.platform ? String(listFilters.platform).slice(0, 40) : null;

  try {
    const { neon } = require("@neondatabase/serverless");
    const sql = neon(dbUrl);

    let countRows;
    try {
      [countRows] = await sql`
        SELECT COUNT(*)::int AS total FROM site_leads
        WHERE (${statusVal}::text IS NULL OR COALESCE(status, 'new') = ${statusVal})
          AND (${verticalVal}::text IS NULL OR vertical = ${verticalVal})
          AND (${searchPattern}::text IS NULL OR (
            LOWER(COALESCE(email, '')) LIKE LOWER(${searchPattern})
            OR LOWER(COALESCE(phone, '')) LIKE LOWER(${searchPattern})
            OR LOWER(COALESCE(vertical, '')) LIKE LOWER(${searchPattern})
          ))
          ${applyViewFilter(sql, viewVal)}
          ${applyPlatformFilter(sql, platformVal)}
      `;
    } catch (filterErr) {
      [countRows] = await sql`
        SELECT COUNT(*)::int AS total FROM site_leads
        WHERE (${statusVal}::text IS NULL OR COALESCE(status, 'new') = ${statusVal})
          AND (${verticalVal}::text IS NULL OR vertical = ${verticalVal})
          AND (${searchPattern}::text IS NULL OR (
            LOWER(COALESCE(email, '')) LIKE LOWER(${searchPattern})
            OR LOWER(COALESCE(phone, '')) LIKE LOWER(${searchPattern})
            OR LOWER(COALESCE(vertical, '')) LIKE LOWER(${searchPattern})
          ))
      `;
    }

    const leads = await queryLeads(
      sql,
      statusVal,
      verticalVal,
      searchPattern,
      sortCol,
      orderAsc,
      limit,
      offset,
      viewVal,
      platformVal
    );

    const total = countRows.total;
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
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

async function queryLeads(
  sql,
  statusVal,
  verticalVal,
  searchPattern,
  sortCol,
  orderAsc,
  limit,
  offset,
  viewVal,
  platformVal
) {
  if (sortCol === "lead_score" && orderAsc) {
    return sql`
      SELECT id, source, vertical, lead_score, email, phone, utm_source, utm_medium,
             COALESCE(status, 'new') AS status, notes, created_at, updated_at
      FROM site_leads
      WHERE (${statusVal}::text IS NULL OR COALESCE(status, 'new') = ${statusVal})
        AND (${verticalVal}::text IS NULL OR vertical = ${verticalVal})
        AND (${searchPattern}::text IS NULL OR (
          LOWER(COALESCE(email, '')) LIKE LOWER(${searchPattern})
          OR LOWER(COALESCE(phone, '')) LIKE LOWER(${searchPattern})
          OR LOWER(COALESCE(vertical, '')) LIKE LOWER(${searchPattern})
        ))
      ORDER BY lead_score ASC NULLS LAST
      LIMIT ${limit} OFFSET ${offset}
    `;
  }
  if (sortCol === "lead_score") {
    return sql`
      SELECT id, source, vertical, lead_score, email, phone, utm_source, utm_medium,
             COALESCE(status, 'new') AS status, notes, created_at, updated_at
      FROM site_leads
      WHERE (${statusVal}::text IS NULL OR COALESCE(status, 'new') = ${statusVal})
        AND (${verticalVal}::text IS NULL OR vertical = ${verticalVal})
        AND (${searchPattern}::text IS NULL OR (
          LOWER(COALESCE(email, '')) LIKE LOWER(${searchPattern})
          OR LOWER(COALESCE(phone, '')) LIKE LOWER(${searchPattern})
          OR LOWER(COALESCE(vertical, '')) LIKE LOWER(${searchPattern})
        ))
      ORDER BY lead_score DESC NULLS LAST
      LIMIT ${limit} OFFSET ${offset}
    `;
  }
  if (sortCol === "vertical" && orderAsc) {
    return sql`
      SELECT id, source, vertical, lead_score, email, phone, utm_source, utm_medium,
             COALESCE(status, 'new') AS status, notes, created_at, updated_at
      FROM site_leads
      WHERE (${statusVal}::text IS NULL OR COALESCE(status, 'new') = ${statusVal})
        AND (${verticalVal}::text IS NULL OR vertical = ${verticalVal})
        AND (${searchPattern}::text IS NULL OR (
          LOWER(COALESCE(email, '')) LIKE LOWER(${searchPattern})
          OR LOWER(COALESCE(phone, '')) LIKE LOWER(${searchPattern})
          OR LOWER(COALESCE(vertical, '')) LIKE LOWER(${searchPattern})
        ))
      ORDER BY vertical ASC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }
  if (sortCol === "vertical") {
    return sql`
      SELECT id, source, vertical, lead_score, email, phone, utm_source, utm_medium,
             COALESCE(status, 'new') AS status, notes, created_at, updated_at
      FROM site_leads
      WHERE (${statusVal}::text IS NULL OR COALESCE(status, 'new') = ${statusVal})
        AND (${verticalVal}::text IS NULL OR vertical = ${verticalVal})
        AND (${searchPattern}::text IS NULL OR (
          LOWER(COALESCE(email, '')) LIKE LOWER(${searchPattern})
          OR LOWER(COALESCE(phone, '')) LIKE LOWER(${searchPattern})
          OR LOWER(COALESCE(vertical, '')) LIKE LOWER(${searchPattern})
        ))
      ORDER BY vertical DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }
  if (sortCol === "email" && orderAsc) {
    return sql`
      SELECT id, source, vertical, lead_score, email, phone, utm_source, utm_medium,
             COALESCE(status, 'new') AS status, notes, created_at, updated_at
      FROM site_leads
      WHERE (${statusVal}::text IS NULL OR COALESCE(status, 'new') = ${statusVal})
        AND (${verticalVal}::text IS NULL OR vertical = ${verticalVal})
        AND (${searchPattern}::text IS NULL OR (
          LOWER(COALESCE(email, '')) LIKE LOWER(${searchPattern})
          OR LOWER(COALESCE(phone, '')) LIKE LOWER(${searchPattern})
          OR LOWER(COALESCE(vertical, '')) LIKE LOWER(${searchPattern})
        ))
      ORDER BY email ASC NULLS LAST
      LIMIT ${limit} OFFSET ${offset}
    `;
  }
  if (sortCol === "email") {
    return sql`
      SELECT id, source, vertical, lead_score, email, phone, utm_source, utm_medium,
             COALESCE(status, 'new') AS status, notes, created_at, updated_at
      FROM site_leads
      WHERE (${statusVal}::text IS NULL OR COALESCE(status, 'new') = ${statusVal})
        AND (${verticalVal}::text IS NULL OR vertical = ${verticalVal})
        AND (${searchPattern}::text IS NULL OR (
          LOWER(COALESCE(email, '')) LIKE LOWER(${searchPattern})
          OR LOWER(COALESCE(phone, '')) LIKE LOWER(${searchPattern})
          OR LOWER(COALESCE(vertical, '')) LIKE LOWER(${searchPattern})
        ))
      ORDER BY email DESC NULLS LAST
      LIMIT ${limit} OFFSET ${offset}
    `;
  }
  if (sortCol === "status" && orderAsc) {
    return sql`
      SELECT id, source, vertical, lead_score, email, phone, utm_source, utm_medium,
             COALESCE(status, 'new') AS status, notes, created_at, updated_at
      FROM site_leads
      WHERE (${statusVal}::text IS NULL OR COALESCE(status, 'new') = ${statusVal})
        AND (${verticalVal}::text IS NULL OR vertical = ${verticalVal})
        AND (${searchPattern}::text IS NULL OR (
          LOWER(COALESCE(email, '')) LIKE LOWER(${searchPattern})
          OR LOWER(COALESCE(phone, '')) LIKE LOWER(${searchPattern})
          OR LOWER(COALESCE(vertical, '')) LIKE LOWER(${searchPattern})
        ))
      ORDER BY status ASC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }
  if (sortCol === "status") {
    return sql`
      SELECT id, source, vertical, lead_score, email, phone, utm_source, utm_medium,
             COALESCE(status, 'new') AS status, notes, created_at, updated_at
      FROM site_leads
      WHERE (${statusVal}::text IS NULL OR COALESCE(status, 'new') = ${statusVal})
        AND (${verticalVal}::text IS NULL OR vertical = ${verticalVal})
        AND (${searchPattern}::text IS NULL OR (
          LOWER(COALESCE(email, '')) LIKE LOWER(${searchPattern})
          OR LOWER(COALESCE(phone, '')) LIKE LOWER(${searchPattern})
          OR LOWER(COALESCE(vertical, '')) LIKE LOWER(${searchPattern})
        ))
      ORDER BY status DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }
  if (orderAsc) {
    return sql`
      SELECT id, source, vertical, lead_score, email, phone, utm_source, utm_medium,
             COALESCE(status, 'new') AS status, notes, created_at, updated_at
      FROM site_leads
      WHERE (${statusVal}::text IS NULL OR COALESCE(status, 'new') = ${statusVal})
        AND (${verticalVal}::text IS NULL OR vertical = ${verticalVal})
        AND (${searchPattern}::text IS NULL OR (
          LOWER(COALESCE(email, '')) LIKE LOWER(${searchPattern})
          OR LOWER(COALESCE(phone, '')) LIKE LOWER(${searchPattern})
          OR LOWER(COALESCE(vertical, '')) LIKE LOWER(${searchPattern})
        ))
      ORDER BY created_at ASC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }
  try {
    return sql`
      SELECT id, source, vertical, lead_score, email, phone, utm_source, utm_medium,
             COALESCE(status, 'new') AS status, notes, created_at, updated_at,
             platform, opened_at, relevance, competitor_monthly, our_offer_monthly
      FROM site_leads
      WHERE (${statusVal}::text IS NULL OR COALESCE(status, 'new') = ${statusVal})
        AND (${verticalVal}::text IS NULL OR vertical = ${verticalVal})
        AND (${searchPattern}::text IS NULL OR (
          LOWER(COALESCE(email, '')) LIKE LOWER(${searchPattern})
          OR LOWER(COALESCE(phone, '')) LIKE LOWER(${searchPattern})
          OR LOWER(COALESCE(vertical, '')) LIKE LOWER(${searchPattern})
        ))
        ${applyViewFilter(sql, viewVal)}
        ${applyPlatformFilter(sql, platformVal)}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } catch (e) {
    return sql`
      SELECT id, source, vertical, lead_score, email, phone, utm_source, utm_medium,
             COALESCE(status, 'new') AS status, notes, created_at, updated_at, platform
      FROM site_leads
      WHERE (${statusVal}::text IS NULL OR COALESCE(status, 'new') = ${statusVal})
        AND (${verticalVal}::text IS NULL OR vertical = ${verticalVal})
        AND (${searchPattern}::text IS NULL OR (
          LOWER(COALESCE(email, '')) LIKE LOWER(${searchPattern})
          OR LOWER(COALESCE(phone, '')) LIKE LOWER(${searchPattern})
          OR LOWER(COALESCE(vertical, '')) LIKE LOWER(${searchPattern})
        ))
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }
}
