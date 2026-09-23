/**
 * Stats blog / forum first-party (journey_events + site_leads + inventaire).
 */
const fs = require("fs");
const path = require("path");
const { getSql } = require("./db");
const { ensureJourneySchema } = require("./journey-store");
const { pctGrowth } = require("./traffic-stats");
const { loadHubConfig } = require("./ad-platform-hub");

var BLOG_EVENT_TYPES = [
  "blog_article_view",
  "blog_cta_click",
  "blog_card_click",
  "blog_link_click",
  "blog_scroll_depth",
  "blog_read_complete",
  "blog_faq_open",
  "blog_section_view",
  "blog_engagement",
];

function parsePayloadSafe(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function isBlogOrForumPath(p) {
  var s = String(p || "").toLowerCase();
  return s.indexOf("/blog") !== -1 || s.indexOf("/forum") !== -1;
}

function slugFromPath(p) {
  var s = String(p || "");
  var m = s.match(/\/blog\/([^/?#]+?)(?:\.html)?\/?$/i);
  if (m) return decodeURIComponent(m[1]);
  m = s.match(/\/forum\/([^/?#]+?)(?:\.html)?\/?$/i);
  if (m) return "forum:" + decodeURIComponent(m[1]);
  if (/\/blog\/?$/i.test(s)) return "index";
  if (/\/forum\/?$/i.test(s)) return "forum:index";
  return "";
}

function slugFromUtmContent(raw) {
  var s = String(raw || "").trim();
  if (!s) return "";
  s = s.replace(/\.html$/i, "");
  if (/^forum[:/]/i.test(s)) return "forum:" + s.replace(/^forum[:/]+/i, "").replace(/\//g, ":");
  if (s.indexOf("/") !== -1) return slugFromPath(s);
  if (/^[a-z0-9][a-z0-9_-]{2,120}$/i.test(s)) return s;
  return "";
}

function resolveLeadArticle(row) {
  var payload = parsePayloadSafe(row.payload);
  var candidates = [
    { src: "utm_content", value: row.utm_content || payload.utm_content || payload.attr_last_utm_content || payload.attr_first_utm_content },
    { src: "blog_article", value: payload.blog_article || payload.blog_article_slug || payload.article_slug || payload.lo_blog_article },
    { src: "landing", value: leadLandingPath(row) },
    { src: "referrer", value: payload.referrer || payload.referer || payload.referrer_first || row.referrer },
    { src: "page_path", value: payload.page_path || payload.path || payload.href || payload.page_url },
  ];
  for (var i = 0; i < candidates.length; i++) {
    var c = candidates[i];
    var slug = "";
    if (c.src === "utm_content" || c.src === "blog_article") {
      slug = slugFromUtmContent(c.value);
      if (!slug && c.value) slug = slugFromPath(String(c.value));
    } else {
      var pathVal = String(c.value || "");
      try {
        if (pathVal.indexOf("http") === 0) pathVal = new URL(pathVal).pathname;
      } catch (e) {}
      slug = slugFromPath(pathVal);
    }
    if (slug && slug !== "index") {
      return { slug: slug, source: c.src, raw: c.value || null };
    }
  }
  var landing = leadLandingPath(row);
  var fallback = slugFromPath(landing);
  if (fallback) return { slug: fallback, source: "landing", raw: landing };
  return null;
}

function leadTouchesBlog(row) {
  var resolved = resolveLeadArticle(row);
  if (resolved && resolved.slug) return true;
  var payload = parsePayloadSafe(row.payload);
  var blob = [
    row.source,
    row.utm_source,
    row.utm_medium,
    row.utm_campaign,
    row.utm_content,
    row.form_id,
    payload.source,
    payload.utm_source,
    payload.utm_medium,
    payload.utm_campaign,
    payload.utm_content,
    payload.attr_last_utm_content,
    payload.attr_first_utm_content,
    payload.blog_article,
    payload.blog_article_slug,
    payload.article_slug,
    payload.lo_blog_article,
    payload.landing,
    payload.landing_page,
    payload.landing_url,
    payload.page_url,
    payload.page_path,
    payload.referrer,
    payload.referer,
    payload.referrer_first,
    payload.href,
    payload.path,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return (
    blob.indexOf("/blog") !== -1 ||
    blob.indexOf("blog") !== -1 ||
    blob.indexOf("/forum") !== -1 ||
    blob.indexOf("forum") !== -1 ||
    String(row.utm_medium || payload.utm_medium || "").toLowerCase() === "content" ||
    String(row.utm_source || payload.utm_source || "").toLowerCase() === "blog" ||
    String(row.utm_medium || payload.utm_medium || "").toLowerCase() === "article_bridge"
  );
}

function leadLandingPath(row) {
  var payload = parsePayloadSafe(row.payload);
  var candidates = [
    payload.page_path,
    payload.path,
    payload.landing_page,
    payload.landing,
    payload.landing_url,
    payload.page_url,
    payload.href,
  ];
  for (var i = 0; i < candidates.length; i++) {
    var c = String(candidates[i] || "");
    if (!c) continue;
    try {
      if (c.indexOf("http") === 0) c = new URL(c).pathname;
    } catch (e) {
      /* keep raw */
    }
    if (isBlogOrForumPath(c)) return c.split("?")[0];
  }
  return "";
}

function parseDateFromHtml(html) {
  if (!html) return { datePublished: null, dateModified: null };
  var pub = html.match(/"datePublished"\s*:\s*"([^"]+)"/);
  var mod = html.match(/"dateModified"\s*:\s*"([^"]+)"/);
  return {
    datePublished: pub ? pub[1].slice(0, 10) : null,
    dateModified: mod ? mod[1].slice(0, 10) : null,
  };
}

function metaToDateLabel(meta) {
  if (!meta) return "";
  var m = String(meta).match(/·\s*(.+)$/);
  return m ? m[1].trim() : String(meta).trim();
}

function loadQuestionnaireByFile() {
  var map = {};
  try {
    var admin = require("../../data/blog-questionnaire-admin.json");
    (admin.rows || []).forEach(function (r) {
      if (!r || !r.file) return;
      map[r.file] = {
        need: r.need || "",
        question: r.question || "",
        questionnaire: r.questionnaire || "",
        landing: r.landing || "",
        express: r.express || "",
        matchedRule: r.matchedRule || "",
        section: r.section || "",
      };
    });
  } catch (e) {
    /* optional */
  }
  return map;
}

function loadArticleInventory() {
  var root = path.join(__dirname, "..", "..");
  var blogDir = path.join(root, "blog");
  var forumDir = path.join(root, "forum");
  var articles = [];
  var byFile = {};
  var questionnaires = loadQuestionnaireByFile();

  try {
    var manifest = require("../../scripts/blog-articles-manifest.cjs");
    var list = Array.isArray(manifest) ? manifest : manifest.articles || [];
    list.forEach(function (a) {
      if (!a || !a.file) return;
      byFile[a.file] = {
        file: a.file,
        slug: String(a.file).replace(/\.html$/i, ""),
        title: a.title || a.file,
        section: a.section || "",
        tag: a.tag || "",
        meta: a.meta || "",
        date_label: metaToDateLabel(a.meta),
        date_published: a.datePublished || null,
        date_modified: a.dateModified || null,
        path: "/blog/" + a.file,
        kind: "blog",
      };
    });
  } catch (e) {
    /* manifest optional */
  }

  if (fs.existsSync(blogDir)) {
    fs.readdirSync(blogDir)
      .filter(function (f) {
        return /\.html$/i.test(f) && f !== "index.html" && f !== "actu-inbox.html";
      })
      .forEach(function (f) {
        var abs = path.join(blogDir, f);
        var html = "";
        try {
          html = fs.readFileSync(abs, "utf8");
        } catch (e) {
          html = "";
        }
        var dates = parseDateFromHtml(html);
        var mtime = null;
        try {
          mtime = fs.statSync(abs).mtime.toISOString().slice(0, 10);
        } catch (e2) {
          mtime = null;
        }
        var base = byFile[f] || {
          file: f,
          slug: f.replace(/\.html$/i, ""),
          title: f.replace(/\.html$/i, "").replace(/-/g, " "),
          section: "",
          tag: "",
          meta: "",
          date_label: "",
          date_published: null,
          date_modified: null,
          path: "/blog/" + f,
          kind: "blog",
        };
        base.date_published = base.date_published || dates.datePublished || mtime;
        base.date_modified = base.date_modified || dates.dateModified || mtime;
        if (!base.date_label && base.date_published) {
          base.date_label = base.date_published;
        }
        var q = questionnaires[f];
        if (q) {
          base.questionnaire_need = q.need;
          base.questionnaire_question = q.question;
          base.questionnaire_url = q.questionnaire;
          base.questionnaire_landing = q.landing;
          base.questionnaire_rule = q.matchedRule;
          if (!base.section && q.section) base.section = q.section;
        }
        base.questionnaires_admin_url =
          "/blog-questionnaires.html?q=" + encodeURIComponent(base.slug || f.replace(/\.html$/i, ""));
        articles.push(base);
      });
  }

  function walkForum(dir, urlPrefix) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(function (f) {
      var abs = path.join(dir, f);
      var st;
      try {
        st = fs.statSync(abs);
      } catch (e) {
        return;
      }
      if (st.isDirectory()) {
        walkForum(abs, urlPrefix + f + "/");
        return;
      }
      if (!/\.html$/i.test(f) || f === "index.html") return;
      var rel = urlPrefix + f;
      var slug = "forum:" + rel.replace(/\.html$/i, "").replace(/\//g, ":");
      var html = "";
      try {
        html = fs.readFileSync(abs, "utf8");
      } catch (e2) {
        html = "";
      }
      var dates = parseDateFromHtml(html);
      articles.push({
        file: rel,
        slug: slug,
        title: f.replace(/\.html$/i, "").replace(/-/g, " "),
        section: "forum",
        tag: "Forum",
        meta: "",
        date_label: dates.datePublished || st.mtime.toISOString().slice(0, 10),
        date_published: dates.datePublished || st.mtime.toISOString().slice(0, 10),
        date_modified: dates.dateModified || st.mtime.toISOString().slice(0, 10),
        path: "/forum/" + rel,
        kind: "forum",
        questionnaires_admin_url: "/blog-questionnaires.html",
      });
    });
  }
  walkForum(forumDir, "");

  articles.sort(function (a, b) {
    var da = a.date_published || "";
    var db = b.date_published || "";
    if (da !== db) return db.localeCompare(da);
    return String(a.slug).localeCompare(String(b.slug));
  });

  return {
    total_articles: articles.filter(function (a) {
      return a.kind === "blog";
    }).length,
    total_forum_pages: articles.filter(function (a) {
      return a.kind === "forum";
    }).length,
    articles: articles,
  };
}

function bump(map, key, field, n) {
  var k = key || "(inconnu)";
  if (!map[k]) {
    map[k] = {
      slug: k,
      views: 0,
      visitors: 0,
      cta_clicks: 0,
      link_clicks: 0,
      card_clicks: 0,
      reads_complete: 0,
      scroll_50: 0,
      scroll_100: 0,
      leads: 0,
    };
  }
  map[k][field] = (map[k][field] || 0) + (n || 1);
}

async function buildBlogStats(options) {
  options = options || {};
  var days = Math.min(Math.max(Number(options.days) || 30, 7), 90);
  var sql = getSql();
  var inventory = loadArticleInventory();
  var hub = loadHubConfig();

  var analyticsLinks = [];
  (hub.platforms || []).forEach(function (p) {
    if (p.id === "clarity" || p.id === "google") {
      (p.links || []).forEach(function (l) {
        if (l.primary) {
          analyticsLinks.push({ platform: p.id, label: l.label, url: l.url });
        }
      });
    }
  });
  analyticsLinks.push({
    platform: "gsc",
    label: "Search Console",
    url: "https://search.google.com/search-console",
  });
  analyticsLinks.push({
    platform: "ga4",
    label: "GA4 — événements blog",
    url: "https://analytics.google.com/analytics/web/#/p0/reports/realtime",
  });

  if (!sql) {
    return {
      ok: false,
      error: "Base de données non configurée",
      inventory: inventory,
      analytics_links: analyticsLinks,
    };
  }

  await ensureJourneySchema(sql);

  var since = new Date(Date.now() - days * 86400000).toISOString();
  var weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  var twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString();

  var kpisRows = await sql`
    SELECT
      COUNT(*) FILTER (
        WHERE event_type = 'page_view'
          AND (page_path ILIKE '/blog%' OR page_path ILIKE '/forum%')
          AND created_at >= ${weekAgo}
      )::int AS page_views_7d,
      COUNT(*) FILTER (
        WHERE event_type = 'page_view'
          AND (page_path ILIKE '/blog%' OR page_path ILIKE '/forum%')
          AND created_at >= ${twoWeeksAgo} AND created_at < ${weekAgo}
      )::int AS page_views_prev_7d,
      COUNT(DISTINCT COALESCE(NULLIF(session_id, ''), visitor_id)) FILTER (
        WHERE (page_path ILIKE '/blog%' OR page_path ILIKE '/forum%')
          AND created_at >= ${weekAgo}
      )::int AS visitors_7d,
      COUNT(DISTINCT COALESCE(NULLIF(session_id, ''), visitor_id)) FILTER (
        WHERE (page_path ILIKE '/blog%' OR page_path ILIKE '/forum%')
          AND created_at >= ${twoWeeksAgo} AND created_at < ${weekAgo}
      )::int AS visitors_prev_7d,
      COUNT(*) FILTER (
        WHERE event_type = 'blog_article_view' AND created_at >= ${weekAgo}
      )::int AS article_views_7d,
      COUNT(*) FILTER (
        WHERE event_type = 'blog_cta_click' AND created_at >= ${weekAgo}
      )::int AS cta_clicks_7d,
      COUNT(*) FILTER (
        WHERE event_type = 'blog_cta_click'
          AND created_at >= ${twoWeeksAgo} AND created_at < ${weekAgo}
      )::int AS cta_clicks_prev_7d,
      COUNT(*) FILTER (
        WHERE event_type = 'blog_read_complete' AND created_at >= ${weekAgo}
      )::int AS reads_complete_7d,
      COUNT(*) FILTER (
        WHERE event_type = 'blog_card_click' AND created_at >= ${weekAgo}
      )::int AS card_clicks_7d,
      COUNT(*) FILTER (
        WHERE event_type LIKE 'blog_%'
          AND created_at >= ${since}
      )::int AS blog_events_period
    FROM journey_events
    WHERE created_at >= ${twoWeeksAgo}
  `;

  var k = kpisRows[0] || {};

  var topPages = await sql`
    SELECT page_path, COUNT(*)::int AS views,
      COUNT(DISTINCT COALESCE(NULLIF(session_id, ''), visitor_id))::int AS visitors
    FROM journey_events
    WHERE created_at >= ${since}
      AND event_type = 'page_view'
      AND (page_path ILIKE '/blog%' OR page_path ILIKE '/forum%')
      AND page_path IS NOT NULL
    GROUP BY page_path
    ORDER BY views DESC
    LIMIT 40
  `;

  var blogEvents = await sql`
    SELECT event_type, page_path, meta, created_at, visitor_id, session_id
    FROM journey_events
    WHERE created_at >= ${since}
      AND (
        event_type LIKE 'blog_%'
        OR (
          event_type = 'page_view'
          AND (page_path ILIKE '/blog%' OR page_path ILIKE '/forum%')
        )
      )
    ORDER BY created_at DESC
    LIMIT 4000
  `;

  var bySlug = {};
  var ctaByLabel = {};
  var eventCounts = {};

  blogEvents.forEach(function (row) {
    var meta = parsePayloadSafe(row.meta);
    var slug =
      meta.article_slug ||
      slugFromPath(row.page_path) ||
      (row.event_type === "page_view" ? slugFromPath(row.page_path) : "(autre)");
    eventCounts[row.event_type] = (eventCounts[row.event_type] || 0) + 1;

    if (row.event_type === "page_view" || row.event_type === "blog_article_view") {
      bump(bySlug, slug, "views", 1);
    }
    if (row.event_type === "blog_cta_click") {
      bump(bySlug, slug, "cta_clicks", 1);
      var label = String(meta.link_text || meta.link_zone || "CTA").trim().slice(0, 80) || "CTA";
      ctaByLabel[label] = (ctaByLabel[label] || 0) + 1;
    }
    if (row.event_type === "blog_link_click") bump(bySlug, slug, "link_clicks", 1);
    if (row.event_type === "blog_card_click") bump(bySlug, slug, "card_clicks", 1);
    if (row.event_type === "blog_read_complete") bump(bySlug, slug, "reads_complete", 1);
    if (row.event_type === "blog_scroll_depth") {
      var pct = Number(meta.percent_scrolled || meta.scroll_depth_threshold || 0);
      if (pct >= 100) bump(bySlug, slug, "scroll_100", 1);
      else if (pct >= 50) bump(bySlug, slug, "scroll_50", 1);
    }
  });

  var titleBySlug = {};
  var invBySlug = {};
  inventory.articles.forEach(function (a) {
    titleBySlug[a.slug] = a.title;
    titleBySlug[a.file] = a.title;
    invBySlug[a.slug] = a;
    if (a.file) invBySlug[String(a.file).replace(/\.html$/i, "")] = a;
  });

  var leadRows = [];
  try {
    leadRows = await sql`
      SELECT id, source, vertical, lead_score, email, phone,
             utm_source, utm_medium, utm_campaign, utm_content,
             form_id, created_at, payload, city, visitor_id
      FROM site_leads
      WHERE created_at >= ${since}
      ORDER BY created_at DESC
      LIMIT 800
    `;
  } catch (e) {
    try {
      leadRows = await sql`
        SELECT id, source, vertical, lead_score, email, phone,
               utm_source, utm_medium, utm_campaign, utm_content,
               created_at, payload, visitor_id
        FROM site_leads
        WHERE created_at >= ${since}
        ORDER BY created_at DESC
        LIMIT 800
      `;
    } catch (e2) {
      try {
        leadRows = await sql`
          SELECT id, source, vertical, lead_score, email, phone,
                 utm_source, utm_medium, utm_campaign, created_at, payload
          FROM site_leads
          WHERE created_at >= ${since}
          ORDER BY created_at DESC
          LIMIT 800
        `;
      } catch (e3) {
        leadRows = [];
      }
    }
  }

  /* Dernier article blog vu (journey) par visitor_id avant le lead */
  var journeyArticleByVisitor = {};
  var visitorIds = [];
  leadRows.forEach(function (row) {
    if (row.visitor_id) visitorIds.push(String(row.visitor_id));
  });
  visitorIds = Array.from(new Set(visitorIds)).slice(0, 200);
  if (visitorIds.length) {
    try {
      var journeyHits = await sql`
        SELECT DISTINCT ON (visitor_id)
          visitor_id, page_path, meta, created_at
        FROM journey_events
        WHERE visitor_id = ANY(${visitorIds})
          AND created_at >= ${since}
          AND (
            event_type IN ('blog_article_view', 'page_view')
            AND (page_path ILIKE '/blog%' OR page_path ILIKE '/forum%' OR event_type = 'blog_article_view')
          )
        ORDER BY visitor_id, created_at DESC
      `;
      journeyHits.forEach(function (j) {
        var meta = parsePayloadSafe(j.meta);
        var slug = meta.article_slug || slugFromPath(j.page_path);
        if (slug) {
          journeyArticleByVisitor[String(j.visitor_id)] = {
            slug: slug,
            path: j.page_path,
            source: "journey",
          };
        }
      });
    } catch (je) {
      /* journey optional */
    }
  }

  var blogLeads = [];
  var leads7d = 0;
  var leadsPrev7d = 0;
  var leadsByArticle = {};
  leadRows.forEach(function (row) {
    var resolved = resolveLeadArticle(row);
    var fromJourney =
      row.visitor_id && journeyArticleByVisitor[String(row.visitor_id)]
        ? journeyArticleByVisitor[String(row.visitor_id)]
        : null;
    if (!resolved && !fromJourney && !leadTouchesBlog(row)) return;

    var slug =
      (resolved && resolved.slug) ||
      (fromJourney && fromJourney.slug) ||
      "(landing blog/forum)";
    var articleSource =
      (resolved && resolved.source) ||
      (fromJourney && fromJourney.source) ||
      "utm_blog";
    /* Prefer explicit utm/blog_article over journey when both exist */
    if (resolved && resolved.slug && fromJourney && !resolved.source) {
      /* no-op */
    }
    if ((!resolved || !resolved.slug || resolved.slug === "(blog/forum)") && fromJourney) {
      slug = fromJourney.slug;
      articleSource = "journey";
    }

    bump(bySlug, slug, "leads", 1);
    leadsByArticle[slug] = (leadsByArticle[slug] || 0) + 1;
    var created = new Date(row.created_at).getTime();
    if (created >= Date.parse(weekAgo)) leads7d++;
    else if (created >= Date.parse(twoWeeksAgo)) leadsPrev7d++;

    var inv = invBySlug[slug] || {};
    var articlePath =
      inv.path ||
      (fromJourney && fromJourney.path) ||
      (slug.indexOf("forum:") === 0
        ? "/forum/" + slug.replace(/^forum:/, "").replace(/:/g, "/") + ".html"
        : slug === "(landing blog/forum)"
          ? null
          : "/blog/" + slug + ".html");

    blogLeads.push({
      id: row.id,
      created_at: row.created_at,
      vertical: row.vertical,
      source: row.source,
      utm_campaign: row.utm_campaign,
      utm_content: row.utm_content || null,
      landing: leadLandingPath(row) || null,
      slug: slug,
      article_slug: slug,
      article_title: inv.title || titleBySlug[slug] || slug,
      article_path: articlePath,
      article_source: articleSource,
      article_date: inv.date_published || null,
      questionnaires_admin_url:
        inv.questionnaires_admin_url ||
        "/blog-questionnaires.html?q=" + encodeURIComponent(String(slug).replace(/^forum:/, "")),
      email: row.email ? "oui" : "non",
      phone: row.phone ? "oui" : "non",
      lead_score: row.lead_score || 0,
    });
  });

  var articlesTable = Object.keys(bySlug)
    .map(function (slug) {
      var row = bySlug[slug];
      var inv = invBySlug[slug] || {};
      return Object.assign({}, row, {
        title: inv.title || titleBySlug[slug] || titleBySlug[slug + ".html"] || slug,
        path:
          inv.path ||
          (slug.indexOf("forum:") === 0
            ? "/forum/" + slug.replace(/^forum:/, "").replace(/:/g, "/") + ".html"
            : slug === "index"
              ? "/blog/"
              : "/blog/" + slug + ".html"),
        file: inv.file || (slug.indexOf("forum:") === 0 ? null : slug + ".html"),
        section: inv.section || "",
        date_published: inv.date_published || null,
        date_modified: inv.date_modified || null,
        date_label: inv.date_label || inv.date_published || null,
        meta: inv.meta || "",
        questionnaire_need: inv.questionnaire_need || null,
        questionnaire_question: inv.questionnaire_question || null,
        questionnaire_url: inv.questionnaire_url || null,
        questionnaires_admin_url:
          inv.questionnaires_admin_url ||
          (slug.indexOf("forum:") === 0
            ? "/blog-questionnaires.html"
            : "/blog-questionnaires.html?q=" + encodeURIComponent(slug)),
      });
    });

  /* Inclure aussi le catalogue (0 vue) pour date + clic + questionnaire */
  inventory.articles.forEach(function (inv) {
    if (bySlug[inv.slug]) return;
    articlesTable.push({
      slug: inv.slug,
      views: 0,
      visitors: 0,
      cta_clicks: 0,
      link_clicks: 0,
      card_clicks: 0,
      reads_complete: 0,
      scroll_50: 0,
      scroll_100: 0,
      leads: 0,
      title: inv.title,
      path: inv.path,
      file: inv.file,
      section: inv.section || "",
      date_published: inv.date_published || null,
      date_modified: inv.date_modified || null,
      date_label: inv.date_label || inv.date_published || null,
      meta: inv.meta || "",
      questionnaire_need: inv.questionnaire_need || null,
      questionnaire_question: inv.questionnaire_question || null,
      questionnaire_url: inv.questionnaire_url || null,
      questionnaires_admin_url: inv.questionnaires_admin_url || "/blog-questionnaires.html",
      kind: inv.kind,
    });
  });

  articlesTable.sort(function (a, b) {
    var scoreA = (b.views || 0) + (b.cta_clicks || 0) * 3 + (b.leads || 0) * 10;
    var scoreB = (a.views || 0) + (a.cta_clicks || 0) * 3 + (a.leads || 0) * 10;
    if (scoreA !== scoreB) return scoreA - scoreB;
    return String(b.date_published || "").localeCompare(String(a.date_published || ""));
  });
  /* Garder le top trafic + les 40 plus récents sans trafic pour la lisibilité */
  var withTraffic = articlesTable.filter(function (r) {
    return (r.views || 0) + (r.cta_clicks || 0) + (r.leads || 0) > 0;
  });
  var withoutTraffic = articlesTable
    .filter(function (r) {
      return (r.views || 0) + (r.cta_clicks || 0) + (r.leads || 0) === 0;
    })
    .slice(0, 40);
  articlesTable = withTraffic.concat(withoutTraffic).slice(0, 80);

  var topCtas = Object.keys(ctaByLabel)
    .map(function (label) {
      return { label: label, clicks: ctaByLabel[label] };
    })
    .sort(function (a, b) {
      return b.clicks - a.clicks;
    })
    .slice(0, 15);

  var trend = await sql`
    SELECT DATE(created_at) AS day,
      COUNT(*) FILTER (
        WHERE event_type = 'page_view'
          AND (page_path ILIKE '/blog%' OR page_path ILIKE '/forum%')
      )::int AS page_views,
      COUNT(*) FILTER (WHERE event_type = 'blog_cta_click')::int AS cta_clicks,
      COUNT(*) FILTER (WHERE event_type = 'blog_article_view')::int AS article_views,
      COUNT(DISTINCT COALESCE(NULLIF(session_id, ''), visitor_id)) FILTER (
        WHERE page_path ILIKE '/blog%' OR page_path ILIKE '/forum%'
          OR event_type LIKE 'blog_%'
      )::int AS visitors
    FROM journey_events
    WHERE created_at >= ${since}
    GROUP BY DATE(created_at)
    ORDER BY day
  `;

  return {
    ok: true,
    generated_at: new Date().toISOString(),
    days: days,
    inventory: {
      total_articles: inventory.total_articles,
      total_forum_pages: inventory.total_forum_pages,
    },
    comparison: {
      visitors: {
        this_week: k.visitors_7d || 0,
        last_week: k.visitors_prev_7d || 0,
        growth_pct: pctGrowth(k.visitors_7d, k.visitors_prev_7d),
      },
      page_views: {
        this_week: k.page_views_7d || 0,
        last_week: k.page_views_prev_7d || 0,
        growth_pct: pctGrowth(k.page_views_7d, k.page_views_prev_7d),
      },
      article_views: {
        this_week: k.article_views_7d || 0,
        last_week: 0,
        growth_pct: 0,
      },
      cta_clicks: {
        this_week: k.cta_clicks_7d || 0,
        last_week: k.cta_clicks_prev_7d || 0,
        growth_pct: pctGrowth(k.cta_clicks_7d, k.cta_clicks_prev_7d),
      },
      reads_complete: {
        this_week: k.reads_complete_7d || 0,
        last_week: 0,
        growth_pct: 0,
      },
      card_clicks: {
        this_week: k.card_clicks_7d || 0,
        last_week: 0,
        growth_pct: 0,
      },
      leads_blog: {
        this_week: leads7d,
        last_week: leadsPrev7d,
        growth_pct: pctGrowth(leads7d, leadsPrev7d),
      },
    },
    event_counts: eventCounts,
    blog_events_period: k.blog_events_period || 0,
    top_pages: topPages.map(function (r) {
      return {
        path: r.page_path,
        views: r.views,
        visitors: r.visitors,
        slug: slugFromPath(r.page_path),
      };
    }),
    articles: articlesTable,
    top_ctas: topCtas,
    leads: blogLeads.slice(0, 40),
    leads_total: blogLeads.length,
    leads_by_article: Object.keys(leadsByArticle)
      .map(function (slug) {
        var inv = invBySlug[slug] || {};
        return {
          slug: slug,
          title: inv.title || titleBySlug[slug] || slug,
          path: inv.path || (slug.indexOf("forum:") === 0 ? null : "/blog/" + slug + ".html"),
          leads: leadsByArticle[slug],
          date_published: inv.date_published || null,
        };
      })
      .sort(function (a, b) {
        return b.leads - a.leads;
      })
      .slice(0, 20),
    trend: trend.map(function (r) {
      return {
        day: r.day,
        page_views: r.page_views,
        cta_clicks: r.cta_clicks,
        article_views: r.article_views,
        visitors: r.visitors,
      };
    }),
    analytics_links: analyticsLinks,
    note:
      "Vues/clics = journey_events. Leads blog = site_leads rattachés à un article via utm_content, blog_article, landing/referrer /blog, ou dernier parcours journey du visitor_id. GA4/Clarity restent la référence SEO globale.",
  };
}

module.exports = {
  buildBlogStats,
  loadArticleInventory,
  isBlogOrForumPath,
  slugFromPath,
  slugFromUtmContent,
  resolveLeadArticle,
  leadTouchesBlog,
  BLOG_EVENT_TYPES,
  parseDateFromHtml,
  metaToDateLabel,
};
