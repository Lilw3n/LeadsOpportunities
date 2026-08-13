const { applyApiGuards, rateLimit, getClientIp } = require("../security");
const { getSql } = require("../db");
const { hydrateProperty, buildPublicVitrine, parseObj } = require("../immo-vitrine");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = getClientIp(req);
  const rl = rateLimit("vitrine:" + ip, 60, 60 * 1000);
  if (!rl.allowed) {
    res.setHeader("Retry-After", String(Math.ceil(rl.retryAfterMs / 1000)));
    return res.status(429).json({ error: "Trop de requêtes" });
  }

  const url = new URL(req.url, "http://localhost");
  const id = url.searchParams.get("id");
  const token = url.searchParams.get("t") || url.searchParams.get("token");

  if (!id || !token) {
    return res.status(400).json({ error: "id et t requis" });
  }

  const sql = getSql();
  if (!sql) {
    return res.status(503).json({ error: "Vitrine indisponible (base non configurée)" });
  }

  try {
    const rows = await sql`
      SELECT * FROM crm_immo_properties WHERE id = ${id} LIMIT 1
    `;
    if (!rows.length) return res.status(404).json({ error: "Bien introuvable" });

    const prop = hydrateProperty(rows[0]);
    const meta = parseObj(rows[0].metadata_json);
    const vitrine = (meta.details && meta.details.vitrine) || (prop.details && prop.details.vitrine) || {};

    if (!vitrine.published) {
      return res.status(403).json({ error: "Vitrine non publiée" });
    }
    if (!vitrine.token || vitrine.token !== token) {
      return res.status(403).json({ error: "Lien invalide" });
    }

    const payload = buildPublicVitrine(prop);
    res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300");
    return res.status(200).json({ ok: true, vitrine: payload });
  } catch (e) {
    console.error("[public/immo-vitrine]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
