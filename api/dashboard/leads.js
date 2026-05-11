const { getAuthUser, setCors } = require("../_lib/auth");

module.exports = async (req, res) => {
  setCors(res);
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
  const status = url.searchParams.get("status") || null;
  const vertical = url.searchParams.get("vertical") || null;
  const search = url.searchParams.get("search") || null;
  const sort = url.searchParams.get("sort") || "created_at";
  const order = (url.searchParams.get("order") || "desc").toUpperCase() === "ASC" ? "ASC" : "DESC";

  try {
    const { neon } = require("@neondatabase/serverless");
    const sql = neon(dbUrl);

    let conditions = [];
    let params = {};
    let whereClause = "";

    if (status) {
      conditions.push(`COALESCE(status, 'new') = '${status.replace(/'/g, "")}'`);
    }
    if (vertical) {
      conditions.push(`vertical = '${vertical.replace(/'/g, "")}'`);
    }
    if (search) {
      const s = search.replace(/'/g, "").toLowerCase();
      conditions.push(`(LOWER(email) LIKE '%${s}%' OR LOWER(phone) LIKE '%${s}%' OR LOWER(vertical) LIKE '%${s}%')`);
    }

    if (conditions.length > 0) {
      whereClause = "WHERE " + conditions.join(" AND ");
    }

    const validSorts = ["created_at", "lead_score", "vertical", "email", "status"];
    const sortCol = validSorts.includes(sort) ? sort : "created_at";

    const countQuery = `SELECT COUNT(*)::int AS total FROM site_leads ${whereClause}`;
    const dataQuery = `
      SELECT id, source, vertical, lead_score, email, phone, utm_source, utm_medium,
             COALESCE(status, 'new') AS status, notes, created_at, updated_at
      FROM site_leads ${whereClause}
      ORDER BY ${sortCol} ${order}
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [countRows, leads] = await Promise.all([
      sql(countQuery),
      sql(dataQuery),
    ]);

    return res.status(200).json({
      ok: true,
      leads,
      pagination: {
        page,
        limit,
        total: countRows[0].total,
        totalPages: Math.ceil(countRows[0].total / limit),
      },
    });
  } catch (e) {
    console.error("[dashboard/leads]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
