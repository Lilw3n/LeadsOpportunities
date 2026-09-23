/**
 * Charge la file actu depuis Neon (bookmarklet Cafeyn / inbox web).
 * Chemin DB : api/_lib/db (pas ../db).
 */
const { getSql } = require("../api/_lib/db");

async function loadQueueFromDatabase() {
  var sql = getSql();
  if (!sql) return [];

  try {
    var rows = await sql`
      SELECT id, title, url, source, note, status, added_at
      FROM blog_actu_queue
      WHERE status IN ('pending', 'queued')
      ORDER BY added_at DESC
      LIMIT 30
    `;
    return (rows || []).map(function (r) {
      return {
        id: r.id,
        title: r.title,
        url: r.url || "",
        source: r.source || "cafeyn",
        note: r.note || "",
        status: "queued",
        addedAt: r.added_at,
        fromDatabase: true,
      };
    });
  } catch (e) {
    if (String(e.message || "").indexOf("blog_actu_queue") !== -1) {
      console.warn("Table blog_actu_queue absente — exécutez database/blog-actu-queue.sql");
    } else {
      console.warn("DB queue skip:", e.message);
    }
    return [];
  }
}

async function markQueuePublished(ids) {
  var sql = getSql();
  if (!sql || !ids || !ids.length) return;
  try {
    for (var i = 0; i < ids.length; i++) {
      var id = ids[i];
      await sql`UPDATE blog_actu_queue SET status = 'published' WHERE id = ${id}`;
    }
  } catch (e) {
    console.warn("markQueuePublished:", e.message);
  }
}

module.exports = {
  loadQueueFromDatabase: loadQueueFromDatabase,
  markQueuePublished: markQueuePublished,
};
