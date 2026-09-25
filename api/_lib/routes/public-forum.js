/**
 * API publique forum interactif — GET/POST /api/forum?op=...
 */
const { getAuthUser, setCors } = require("../auth");
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");
const Forum = require("../forum-store");

function sqlClient() {
  var dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return null;
  var { neon } = require("@neondatabase/serverless");
  return neon(dbUrl);
}

async function enrichUser(sql, auth) {
  if (!auth || !auth.userId) return null;
  try {
    var rows = await sql`
      SELECT id, email, role, crm_role, full_name, phone
      FROM users WHERE id = ${auth.userId} LIMIT 1
    `;
    if (!rows.length) return auth;
    var u = rows[0];
    return {
      userId: u.id,
      email: u.email,
      role: u.role,
      crmRole: u.crm_role,
      fullName: u.full_name,
      phone: u.phone,
    };
  } catch (e) {
    return auth;
  }
}

module.exports = async function publicForum(req, res) {
  setCors(req, res);
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  var sql = sqlClient();
  if (!sql) return res.status(503).json({ error: "Base de données non configurée" });

  var op = String(req.query.op || req.query.action || "board").toLowerCase();
  var auth = await getAuthUser(req);
  var user = await enrichUser(sql, auth);

  try {
    if (req.method === "GET" && (op === "board" || op === "categories")) {
      var categories = await Forum.listCategories(sql);
      var topics = await Forum.listTopics(sql, { limit: 30 });
      return res.status(200).json({
        ok: true,
        me: user
          ? {
              id: user.userId,
              email: user.email,
              fullName: user.fullName,
              isStaff: user.role === "admin" || !!user.crmRole,
            }
          : null,
        categories: categories,
        topics: topics,
      });
    }

    if (req.method === "GET" && op === "topics") {
      var list = await Forum.listTopics(sql, {
        categorySlug: req.query.category || req.query.cat || null,
        limit: req.query.limit,
      });
      return res.status(200).json({ ok: true, topics: list, me: user || null });
    }

    if (req.method === "GET" && (op === "topic" || op === "thread")) {
      var id = req.query.id || req.query.topic;
      var cat = req.query.category || req.query.cat || null;
      var slug = req.query.slug || null;
      var detail = await Forum.getTopicByIdOrSlug(sql, slug || id, cat);
      if (!detail) return res.status(404).json({ error: "Sujet introuvable" });
      return res.status(200).json({
        ok: true,
        me: user
          ? {
              id: user.userId,
              email: user.email,
              fullName: user.fullName,
              isStaff: user.role === "admin" || !!user.crmRole,
            }
          : null,
        topic: detail.topic,
        posts: detail.posts,
        links: detail.links,
      });
    }

    if (req.method === "GET" && op === "suggest-articles") {
      var suggestions = await Forum.searchBlogSuggestions(req.query.q || "");
      return res.status(200).json({ ok: true, suggestions: suggestions });
    }

    if (req.method === "POST" && op === "create-topic") {
      if (!user) return res.status(401).json({ error: "Connectez-vous pour poser une question" });
      var rl = rateLimit("forum-create:" + getClientIp(req), 8, 60 * 60 * 1000);
      if (!rl.allowed) return res.status(429).json({ error: "Trop de sujets, réessayez plus tard" });
      var parsed = parseJsonBody(req);
      if (parsed.error) return res.status(400).json({ error: parsed.error });
      var created = await Forum.createTopic(sql, parsed.body || {}, user);
      return res.status(201).json({ ok: true, topic: created.topic, posts: created.posts, links: created.links });
    }

    if (req.method === "POST" && op === "reply") {
      if (!user) return res.status(401).json({ error: "Connectez-vous pour répondre" });
      var rl2 = rateLimit("forum-reply:" + getClientIp(req), 30, 60 * 60 * 1000);
      if (!rl2.allowed) return res.status(429).json({ error: "Trop de réponses" });
      var parsed2 = parseJsonBody(req);
      if (parsed2.error) return res.status(400).json({ error: parsed2.error });
      var body2 = parsed2.body || {};
      var tid = body2.topicId || body2.topic_id;
      if (!tid) return res.status(400).json({ error: "topicId requis" });
      var replied = await Forum.addReply(sql, tid, body2, user);
      return res.status(201).json({ ok: true, topic: replied.topic, posts: replied.posts, links: replied.links });
    }

    if (req.method === "POST" && op === "link-article") {
      if (!user) return res.status(401).json({ error: "Connexion requise" });
      var parsed3 = parseJsonBody(req);
      if (parsed3.error) return res.status(400).json({ error: parsed3.error });
      var body3 = parsed3.body || {};
      var tid3 = body3.topicId || body3.topic_id;
      if (!tid3) return res.status(400).json({ error: "topicId requis" });
      var linked = await Forum.addLink(sql, tid3, body3, user);
      return res.status(201).json({ ok: true, topic: linked.topic, posts: linked.posts, links: linked.links });
    }

    return res.status(404).json({ error: "Opération forum inconnue: " + op });
  } catch (e) {
    var status = e.status || 500;
    if (status >= 500) console.error("[forum]", e);
    return res.status(status).json({ error: e.message || "Erreur forum" });
  }
};
