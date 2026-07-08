/**
 * POST /api?action=blog-actu-ingest
 * Ajoute un article Cafeyn/Edge/Firefox/Google/Bing/Yahoo à la file (Neon).
 * Header: Authorization: Bearer <BLOG_ACTU_INGEST_SECRET>
 */
const { getSql } = require("../db");
const { parseJsonBody } = require("../security");

function cleanToken(req) {
  var auth = String(req.headers.authorization || "");
  return auth.replace(/^Bearer\s+/i, "").trim();
}

module.exports = async function blogActuIngest(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  var secret = String(process.env.BLOG_ACTU_INGEST_SECRET || "").trim();
  if (!secret) {
    return res.status(503).json({ error: "BLOG_ACTU_INGEST_SECRET non configuré" });
  }
  if (cleanToken(req) !== secret) {
    return res.status(401).json({ error: "Non autorisé" });
  }

  var sql = getSql();
  if (!sql) {
    return res.status(503).json({ error: "DATABASE_URL requis pour la file actu" });
  }

  var body = (await parseJsonBody(req)) || {};
  var title = String(body.title || "").trim();
  if (!title) {
    return res.status(400).json({ error: "title requis" });
  }

  var id = "ingest-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  var url = String(body.url || "").trim();
  var source = String(body.source || "cafeyn").trim().slice(0, 32);
  var note = String(body.note || "").trim().slice(0, 500);

  try {
    await sql`
      INSERT INTO blog_actu_queue (id, title, url, source, note, status)
      VALUES (${id}, ${title}, ${url}, ${source}, ${note}, 'pending')
      ON CONFLICT (id) DO NOTHING
    `;
    return res.status(200).json({ ok: true, id: id, message: "Ajouté à la file — prioritaire au prochain blog:actu:auto" });
  } catch (e) {
    console.error("[blog-actu-ingest]", e);
    return res.status(500).json({ error: e.message || "Erreur base" });
  }
};
