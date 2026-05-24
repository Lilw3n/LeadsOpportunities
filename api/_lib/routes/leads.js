const { getAuthUser } = require("../auth");
const { applyApiGuards, sanitizeEnum, sanitizeSearch } = require("../security");
const {
  parseLeadListFilters,
  applyViewFilterPayload,
  applyPlatformFilter,
  enrichLeadRow,
} = require("../leads-filters");

const VALID_STATUS = ["new", "contacted", "qualified", "converted", "lost"];
const VALID_VERTICAL = ["vtc", "sante", "credit-immo"];
const VALID_SORT = ["created_at", "lead_score", "vertical", "email", "status"];

function orderClause(sql, sortCol, orderAsc) {
  if (sortCol === "lead_score") {
    return orderAsc
      ? sql`ORDER BY lead_score ASC NULLS LAST`
      : sql`ORDER BY lead_score DESC NULLS LAST`;
  }
  if (sortCol === "vertical") {
    return orderAsc ? sql`ORDER BY vertical ASC` : sql`ORDER BY vertical DESC`;
  }
  if (sortCol === "email") {
    return orderAsc
      ? sql`ORDER BY email ASC NULLS LAST`
      : sql`ORDER BY email DESC NULLS LAST`;
  }
  if (sortCol === "status") {
    return orderAsc
      ? sql`ORDER BY status ASC NULLS LAST`
      : sql`ORDER BY status DESC NULLS LAST`;
  }
  return orderAsc ? sql`ORDER BY created_at ASC` : sql`ORDER BY created_at DESC`;
}

function buildWhereMinimal(sql, verticalVal, searchPattern) {
  return sql`
    WHERE (${verticalVal}::text IS NULL OR vertical = ${verticalVal})
      AND (${searchPattern}::text IS NULL OR (
        LOWER(COALESCE(email, '')) LIKE LOWER(${searchPattern})
        OR LOWER(COALESCE(phone, '')) LIKE LOWER(${searchPattern})
        OR LOWER(COALESCE(vertical, '')) LIKE LOWER(${searchPattern})
        OR LOWER(COALESCE(source, '')) LIKE LOWER(${searchPattern})
      ))
  `;
}

function buildWhereWithStatus(sql, statusVal, verticalVal, searchPattern) {
  return sql`
    WHERE (${statusVal}::text IS NULL OR COALESCE(status, 'new') = ${statusVal})
      AND (${verticalVal}::text IS NULL OR vertical = ${verticalVal})
      AND (${searchPattern}::text IS NULL OR (
        LOWER(COALESCE(email, '')) LIKE LOWER(${searchPattern})
        OR LOWER(COALESCE(phone, '')) LIKE LOWER(${searchPattern})
        OR LOWER(COALESCE(vertical, '')) LIKE LOWER(${searchPattern})
        OR LOWER(COALESCE(source, '')) LIKE LOWER(${searchPattern})
      ))
  `;
}

function buildWhereFull(sql, statusVal, verticalVal, searchPattern, viewVal, platformVal) {
  return sql`
    WHERE (${statusVal}::text IS NULL OR COALESCE(status, 'new') = ${statusVal})
      AND (${verticalVal}::text IS NULL OR vertical = ${verticalVal})
      AND (${searchPattern}::text IS NULL OR (
        LOWER(COALESCE(email, '')) LIKE LOWER(${searchPattern})
        OR LOWER(COALESCE(phone, '')) LIKE LOWER(${searchPattern})
        OR LOWER(COALESCE(vertical, '')) LIKE LOWER(${searchPattern})
        OR LOWER(COALESCE(source, '')) LIKE LOWER(${searchPattern})
      ))
      ${applyViewFilterPayload(sql, viewVal)}
      ${applyPlatformFilter(sql, platformVal)}
  `;
}

async function fetchLeads(sql, opts, tier) {
  const orderSql = orderClause(sql, opts.sortCol, opts.orderAsc);
  var where;
  if (tier === "full") {
    where = buildWhereFull(
      sql,
      opts.statusVal,
      opts.verticalVal,
      opts.searchPattern,
      opts.viewVal,
      opts.platformVal
    );
  } else if (tier === "status") {
    where = buildWhereWithStatus(sql, opts.statusVal, opts.verticalVal, opts.searchPattern);
  } else {
    where = buildWhereMinimal(sql, opts.verticalVal, opts.searchPattern);
  }

  if (tier === "extended") {
    return sql`
      SELECT
        id, source, vertical, lead_score, email, phone, utm_source, utm_medium,
        COALESCE(status, 'new') AS status, notes, created_at, updated_at,
        platform, payload, opened_at, relevance, competitor_monthly, our_offer_monthly
      FROM site_leads
      ${where}
      ${orderSql}
      LIMIT ${opts.limit} OFFSET ${opts.offset}
    `;
  }

  if (tier === "full" || tier === "status") {
    return sql`
      SELECT
        id, source, vertical, lead_score, email, phone, utm_source, utm_medium,
        COALESCE(status, 'new') AS status, notes, created_at, updated_at,
        platform, payload
      FROM site_leads
      ${where}
      ${orderSql}
      LIMIT ${opts.limit} OFFSET ${opts.offset}
    `;
  }

  return sql`
    SELECT
      id, source, vertical, lead_score, email, phone,
      created_at, updated_at, payload
    FROM site_leads
    ${where}
    ${orderSql}
    LIMIT ${opts.limit} OFFSET ${opts.offset}
  `;
}

async function countLeads(sql, opts, tier) {
  var where;
  if (tier === "full") {
    where = buildWhereFull(
      sql,
      opts.statusVal,
      opts.verticalVal,
      opts.searchPattern,
      opts.viewVal,
      opts.platformVal
    );
  } else if (tier === "status") {
    where = buildWhereWithStatus(sql, opts.statusVal, opts.verticalVal, opts.searchPattern);
  } else {
    where = buildWhereMinimal(sql, opts.verticalVal, opts.searchPattern);
  }
  const [countRows] = await sql`
    SELECT COUNT(*)::int AS total FROM site_leads
    ${where}
  `;
  return countRows.total;
}

async function loadLeadsList(sql, opts) {
  const attempts = [
    { fetch: "extended", count: "full" },
    { fetch: "full", count: "full" },
    { fetch: "status", count: "status" },
    { fetch: "minimal", count: "minimal" },
  ];
  var lastErr;
  for (var i = 0; i < attempts.length; i++) {
    var t = attempts[i];
    try {
      const rows = await fetchLeads(sql, opts, t.fetch);
      const total = await countLeads(sql, opts, t.count);
      return { rows, total, tier: t.fetch };
    } catch (e) {
      lastErr = e;
      console.warn("[dashboard/leads] attempt " + t.fetch + " failed:", e.message);
    }
  }
  throw lastErr || new Error("Impossible de charger les leads");
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
  var sortCol = sanitizeEnum(url.searchParams.get("sort") || "created_at", VALID_SORT, "created_at");
  const orderAsc = String(url.searchParams.get("order") || "desc").toUpperCase() === "ASC";
  const listFilters = parseLeadListFilters(url);
  const viewVal = listFilters.view;
  const platformVal = listFilters.platform ? String(listFilters.platform).slice(0, 40) : null;

  const queryOpts = {
    statusVal,
    verticalVal,
    searchPattern,
    sortCol,
    orderAsc,
    limit,
    offset,
    viewVal,
    platformVal,
  };

  try {
    const { neon } = require("@neondatabase/serverless");
    const sql = neon(dbUrl);

    const result = await loadLeadsList(sql, queryOpts);
    const leads = result.rows.map(enrichLeadRow);
    const total = result.total;

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
