/**
 * Forum communautaire interactif — schéma Neon + CRUD + seed SEO.
 */
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

let schemaReady = false;
let seedDone = false;

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

async function ensureForumSchema(sql) {
  if (!sql) return false;
  if (schemaReady) return true;

  await sql`
    CREATE TABLE IF NOT EXISTS forum_categories (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      nav_label TEXT,
      tagline TEXT,
      need TEXT,
      landing TEXT,
      questionnaire TEXT,
      sort_order INT NOT NULL DEFAULT 100,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS forum_topics (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL REFERENCES forum_categories(id),
      slug TEXT NOT NULL,
      title TEXT NOT NULL,
      excerpt TEXT,
      author_id TEXT,
      author_name TEXT,
      author_email TEXT,
      is_seed BOOLEAN NOT NULL DEFAULT FALSE,
      is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
      is_locked BOOLEAN NOT NULL DEFAULT FALSE,
      reply_count INT NOT NULL DEFAULT 0,
      last_post_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (category_id, slug)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS forum_posts (
      id TEXT PRIMARY KEY,
      topic_id TEXT NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
      author_id TEXT,
      author_name TEXT,
      author_email TEXT,
      body TEXT NOT NULL,
      is_answer BOOLEAN NOT NULL DEFAULT FALSE,
      is_staff BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS forum_topic_links (
      id TEXT PRIMARY KEY,
      topic_id TEXT NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      title TEXT,
      kind TEXT DEFAULT 'blog',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS forum_topics_cat_idx ON forum_topics(category_id, last_post_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS forum_posts_topic_idx ON forum_posts(topic_id, created_at)`;
  await sql`CREATE INDEX IF NOT EXISTS forum_links_topic_idx ON forum_topic_links(topic_id)`;

  schemaReady = true;
  return true;
}

function loadThemesFile() {
  try {
    var p = path.join(__dirname, "..", "..", "data", "forum-themes.json");
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    return { themes: [] };
  }
}

function guessBlogLinks(theme, thread) {
  var links = [];
  var phrases = (thread.phrases || []).concat([thread.question, theme.title]).join(" ").toLowerCase();
  var candidates = [
    { test: /mutuelle|optique|dentaire|sante/, url: "/blog/", title: "Blog mutuelle & santé", kind: "blog" },
    { test: /vtc|uber|bolt|chauffeur/, url: "/blog/", title: "Articles assurance VTC", kind: "blog" },
    { test: /credit|pret|emprunteur|apport|taux/, url: "/landings/credit-immo.html", title: "Parcours crédit immobilier", kind: "landing" },
    { test: /habitation|locataire|degat|coloc/, url: "/assurance-habitation/", title: "Assurance habitation", kind: "landing" },
    { test: /nancy|varangeville|metropole|54/, url: "/nancy-54/", title: "Hub local Nancy 54", kind: "landing" },
  ];
  candidates.forEach(function (c) {
    if (c.test.test(phrases)) {
      links.push({ url: c.url, title: c.title, kind: c.kind });
    }
  });
  if (theme.landing) {
    links.unshift({
      url: theme.landing,
      title: "Devis / parcours " + (theme.navLabel || theme.title),
      kind: "landing",
    });
  }
  // dédup
  var seen = {};
  return links.filter(function (l) {
    if (seen[l.url]) return false;
    seen[l.url] = true;
    return true;
  }).slice(0, 4);
}

async function seedForumIfEmpty(sql) {
  if (seedDone) return;
  await ensureForumSchema(sql);
  var cats = await sql`SELECT COUNT(*)::int AS n FROM forum_categories`;
  if (cats[0] && cats[0].n > 0) {
    seedDone = true;
    return;
  }

  var data = loadThemesFile();
  var themes = data.themes || [];
  for (var i = 0; i < themes.length; i++) {
    var t = themes[i];
    var catId = "cat_" + t.slug;
    await sql`
      INSERT INTO forum_categories (id, slug, title, nav_label, tagline, need, landing, questionnaire, sort_order)
      VALUES (
        ${catId}, ${t.slug}, ${t.title}, ${t.navLabel || t.title}, ${t.tagline || ""},
        ${t.need || null}, ${t.landing || null}, ${t.questionnaire || null}, ${(i + 1) * 10}
      )
      ON CONFLICT (slug) DO NOTHING
    `;

    var threads = t.threads || [];
    for (var j = 0; j < threads.length; j++) {
      var th = threads[j];
      var topicId = "seed_" + t.slug + "_" + th.slug;
      await sql`
        INSERT INTO forum_topics (
          id, category_id, slug, title, excerpt, author_name, is_seed, reply_count, last_post_at
        ) VALUES (
          ${topicId}, ${catId}, ${th.slug}, ${th.question}, ${th.excerpt || ""},
          ${"Membre forum"}, TRUE, 1, NOW()
        )
        ON CONFLICT (category_id, slug) DO NOTHING
      `;

      var qPostId = topicId + "_q";
      var aPostId = topicId + "_a";
      await sql`
        INSERT INTO forum_posts (id, topic_id, author_name, body, is_answer, is_staff)
        VALUES (${qPostId}, ${topicId}, ${"Membre forum"}, ${th.excerpt || th.question}, FALSE, FALSE)
        ON CONFLICT (id) DO NOTHING
      `;
      await sql`
        INSERT INTO forum_posts (id, topic_id, author_name, body, is_answer, is_staff)
        VALUES (${aPostId}, ${topicId}, ${"Wendy Buchet"}, ${th.answer || ""}, TRUE, TRUE)
        ON CONFLICT (id) DO NOTHING
      `;

      var links = guessBlogLinks(t, th);
      for (var k = 0; k < links.length; k++) {
        var L = links[k];
        var lid = "link_" + topicId + "_" + k;
        await sql`
          INSERT INTO forum_topic_links (id, topic_id, url, title, kind)
          VALUES (${lid}, ${topicId}, ${L.url}, ${L.title}, ${L.kind})
          ON CONFLICT (id) DO NOTHING
        `;
      }
    }
  }
  seedDone = true;
}

async function listCategories(sql) {
  await seedForumIfEmpty(sql);
  var rows = await sql`
    SELECT c.*,
      (SELECT COUNT(*)::int FROM forum_topics t WHERE t.category_id = c.id) AS topic_count,
      (SELECT COUNT(*)::int FROM forum_posts p
         JOIN forum_topics t ON t.id = p.topic_id WHERE t.category_id = c.id) AS post_count
    FROM forum_categories c
    ORDER BY c.sort_order ASC, c.title ASC
  `;
  return rows;
}

async function listTopics(sql, opts) {
  await seedForumIfEmpty(sql);
  opts = opts || {};
  var limit = Math.min(Number(opts.limit) || 40, 100);
  if (opts.categorySlug) {
    return sql`
      SELECT t.*, c.slug AS category_slug, c.nav_label AS category_label, c.title AS category_title
      FROM forum_topics t
      JOIN forum_categories c ON c.id = t.category_id
      WHERE c.slug = ${opts.categorySlug}
      ORDER BY t.is_pinned DESC, t.last_post_at DESC
      LIMIT ${limit}
    `;
  }
  return sql`
    SELECT t.*, c.slug AS category_slug, c.nav_label AS category_label, c.title AS category_title
    FROM forum_topics t
    JOIN forum_categories c ON c.id = t.category_id
    ORDER BY t.is_pinned DESC, t.last_post_at DESC
    LIMIT ${limit}
  `;
}

async function getTopicByIdOrSlug(sql, idOrSlug, categorySlug) {
  await seedForumIfEmpty(sql);
  var rows;
  if (categorySlug) {
    rows = await sql`
      SELECT t.*, c.slug AS category_slug, c.nav_label AS category_label, c.title AS category_title,
             c.need, c.landing, c.questionnaire
      FROM forum_topics t
      JOIN forum_categories c ON c.id = t.category_id
      WHERE c.slug = ${categorySlug} AND t.slug = ${idOrSlug}
      LIMIT 1
    `;
  } else {
    rows = await sql`
      SELECT t.*, c.slug AS category_slug, c.nav_label AS category_label, c.title AS category_title,
             c.need, c.landing, c.questionnaire
      FROM forum_topics t
      JOIN forum_categories c ON c.id = t.category_id
      WHERE t.id = ${idOrSlug} OR t.slug = ${idOrSlug}
      ORDER BY (t.id = ${idOrSlug}) DESC
      LIMIT 1
    `;
  }
  if (!rows.length) return null;
  var topic = rows[0];
  var posts = await sql`
    SELECT * FROM forum_posts WHERE topic_id = ${topic.id} ORDER BY created_at ASC
  `;
  var links = await sql`
    SELECT * FROM forum_topic_links WHERE topic_id = ${topic.id} ORDER BY created_at ASC
  `;
  return { topic: topic, posts: posts, links: links };
}

async function createTopic(sql, input, user) {
  await ensureForumSchema(sql);
  var catRows = await sql`SELECT * FROM forum_categories WHERE slug = ${input.categorySlug} LIMIT 1`;
  if (!catRows.length) throw Object.assign(new Error("Catégorie introuvable"), { status: 404 });
  var cat = catRows[0];
  var title = String(input.title || "").trim().slice(0, 200);
  var body = String(input.body || "").trim().slice(0, 8000);
  if (title.length < 8) throw Object.assign(new Error("Titre trop court (min 8 caractères)"), { status: 400 });
  if (body.length < 12) throw Object.assign(new Error("Message trop court"), { status: 400 });

  var baseSlug = slugify(title) || "sujet";
  var slug = baseSlug;
  var n = 0;
  while (true) {
    var exists = await sql`SELECT id FROM forum_topics WHERE category_id = ${cat.id} AND slug = ${slug}`;
    if (!exists.length) break;
    n += 1;
    slug = baseSlug + "-" + n;
  }

  var topicId = randomUUID();
  var postId = randomUUID();
  var authorName = (user && (user.fullName || user.email)) || input.authorName || "Membre";
  var authorEmail = (user && user.email) || input.authorEmail || null;
  var authorId = (user && user.userId) || null;

  await sql`
    INSERT INTO forum_topics (
      id, category_id, slug, title, excerpt, author_id, author_name, author_email,
      is_seed, reply_count, last_post_at
    ) VALUES (
      ${topicId}, ${cat.id}, ${slug}, ${title}, ${body.slice(0, 220)},
      ${authorId}, ${authorName}, ${authorEmail}, FALSE, 0, NOW()
    )
  `;
  await sql`
    INSERT INTO forum_posts (id, topic_id, author_id, author_name, author_email, body, is_answer, is_staff)
    VALUES (${postId}, ${topicId}, ${authorId}, ${authorName}, ${authorEmail}, ${body}, FALSE, FALSE)
  `;

  // liens articles optionnels
  var links = Array.isArray(input.links) ? input.links.slice(0, 5) : [];
  for (var i = 0; i < links.length; i++) {
    var L = links[i];
    if (!L || !L.url) continue;
    await sql`
      INSERT INTO forum_topic_links (id, topic_id, url, title, kind)
      VALUES (${randomUUID()}, ${topicId}, ${String(L.url).slice(0, 500)}, ${String(L.title || "").slice(0, 200)}, ${String(L.kind || "blog").slice(0, 40)})
    `;
  }

  return getTopicByIdOrSlug(sql, topicId);
}

async function addReply(sql, topicId, input, user) {
  await ensureForumSchema(sql);
  var topics = await sql`SELECT * FROM forum_topics WHERE id = ${topicId} LIMIT 1`;
  if (!topics.length) throw Object.assign(new Error("Sujet introuvable"), { status: 404 });
  if (topics[0].is_locked) throw Object.assign(new Error("Ce sujet est verrouillé"), { status: 403 });

  var body = String(input.body || "").trim().slice(0, 8000);
  if (body.length < 2) throw Object.assign(new Error("Réponse vide"), { status: 400 });

  var isStaff = !!(user && (user.role === "admin" || user.crmRole));
  var authorName = (user && (user.fullName || user.email)) || input.authorName || "Membre";
  var authorEmail = (user && user.email) || null;
  var authorId = (user && user.userId) || null;
  var postId = randomUUID();

  await sql`
    INSERT INTO forum_posts (id, topic_id, author_id, author_name, author_email, body, is_answer, is_staff)
    VALUES (${postId}, ${topicId}, ${authorId}, ${authorName}, ${authorEmail}, ${body}, ${!!input.isAnswer && isStaff}, ${isStaff})
  `;
  await sql`
    UPDATE forum_topics
    SET reply_count = reply_count + 1, last_post_at = NOW(), updated_at = NOW()
    WHERE id = ${topicId}
  `;

  return getTopicByIdOrSlug(sql, topicId);
}

async function addLink(sql, topicId, input, user) {
  await ensureForumSchema(sql);
  if (!user || !user.userId) throw Object.assign(new Error("Connexion requise"), { status: 401 });
  var url = String(input.url || "").trim();
  if (!url) throw Object.assign(new Error("URL requise"), { status: 400 });
  if (!/^https?:\/\//i.test(url) && url.charAt(0) !== "/") {
    throw Object.assign(new Error("URL invalide"), { status: 400 });
  }
  var id = randomUUID();
  await sql`
    INSERT INTO forum_topic_links (id, topic_id, url, title, kind)
    VALUES (${id}, ${topicId}, ${url.slice(0, 500)}, ${String(input.title || "").slice(0, 200)}, ${String(input.kind || "blog").slice(0, 40)})
  `;
  return getTopicByIdOrSlug(sql, topicId);
}

async function searchBlogSuggestions(query) {
  // Suggestions statiques à partir du blog manifeste (sans DB blog)
  var q = String(query || "").toLowerCase();
  var suggestions = [];
  try {
    var manifest = require("../../scripts/blog-articles-manifest.cjs");
    var arts = (manifest.articles || []).slice(0, 400);
    arts.forEach(function (a) {
      if (!a || !a.file || !a.title) return;
      var hay = (a.title + " " + (a.tag || "") + " " + (a.description || "")).toLowerCase();
      var score = 0;
      q.split(/\s+/).forEach(function (w) {
        if (w.length > 2 && hay.indexOf(w) !== -1) score += 1;
      });
      if (score > 0) {
        suggestions.push({
          url: "/blog/" + a.file,
          title: a.title,
          kind: "blog",
          score: score,
        });
      }
    });
  } catch (e) {}
  suggestions.sort(function (a, b) {
    return b.score - a.score;
  });
  return suggestions.slice(0, 8);
}

module.exports = {
  ensureForumSchema,
  seedForumIfEmpty,
  listCategories,
  listTopics,
  getTopicByIdOrSlug,
  createTopic,
  addReply,
  addLink,
  searchBlogSuggestions,
  slugify,
};
