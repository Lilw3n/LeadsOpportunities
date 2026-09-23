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

function leadTouchesBlog(row) {
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
    payload.landing,
    payload.landing_page,
    payload.landing_url,
    payload.page_url,
    payload.page_path,
    payload.referrer,
    payload.referer,
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
    String(row.utm_medium || payload.utm_medium || "").toLowerCase() === "content"
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

function loadArticleInventory() {
  var root = path.join(__dirname, "..", "..");
  var blogDir = path.join(root, "blog");
  var forumDir = path.join(root, "forum");
  var articles = [];
  var byFile = {};

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
        if (byFile[f]) {
          articles.push(byFile[f]);
          return;
        }
        articles.push({
          file: f,
          slug: f.replace(/\.html$/i, ""),
          title: f.replace(/\.html$/i, "").replace(/-/g, " "),
          section: "",
          tag: "",
          path: "/blog/" + f,
          kind: "blog",
        });
      });
  }

  if (fs.existsSync(forumDir)) {
    fs.readdirSync(forumDir)
      .filter(function (f) {
        return /\.html$/i.test(f) && f !== "index.html";
      })
      .forEach(function (f) {
        articles.push({
          file: f,
          slug: "forum:" + f.replace(/\.html$/i, ""),
          title: f.replace(/\.html$/i, "").replace(/-/g, " "),
          section: "forum",
          tag: "Forum",
          path: "/forum/" + f,
          kind: "forum",
        });
      });
  }

  articles.sort(function (a, b) {
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
  inventory.articles.forEach(function (a) {
    titleBySlug[a.slug] = a.title;
    titleBySlug[a.file] = a.title;
  });

  var leadRows = [];
  try {
    leadRows = await sql`
      SELECT id, source, vertical, lead_score, email, phone,
             utm_source, utm_medium, utm_campaign, utm_content,
             form_id, created_at, payload, city
      FROM site_leads
      WHERE created_at >= ${since}
      ORDER BY created_at DESC
      LIMIT 800
    `;
  } catch (e) {
    try {
      leadRows = await sql`
        SELECT id, source, vertical, lead_score, email, phone,
               utm_source, utm_medium, utm_campaign, created_at, payload
        FROM site_leads
        WHERE created_at >= ${since}
        ORDER BY created_at DESC
        LIMIT 800
      `;
    } catch (e2) {
      leadRows = [];
    }
  }

  var blogLeads = [];
  var leads7d = 0;
  var leadsPrev7d = 0;
  leadRows.forEach(function (row) {
    if (!leadTouchesBlog(row)) return;
    var landing = leadLandingPath(row);
    var slug = slugFromPath(landing) || "(landing blog/forum)";
    bump(bySlug, slug, "leads", 1);
    var created = new Date(row.created_at).getTime();
    if (created >= Date.parse(weekAgo)) leads7d++;
    else if (created >= Date.parse(twoWeeksAgo)) leadsPrev7d++;
    blogLeads.push({
      id: row.id,
      created_at: row.created_at,
      vertical: row.vertical,
      source: row.source,
      utm_campaign: row.utm_campaign,
      landing: landing || null,
      slug: slug,
      email: row.email ? "oui" : "non",
      phone: row.phone ? "oui" : "non",
      lead_score: row.lead_score || 0,
    });
  });

  var articlesTable = Object.keys(bySlug)
    .map(function (slug) {
      var row = bySlug[slug];
      return Object.assign({}, row, {
        title: titleBySlug[slug] || titleBySlug[slug + ".html"] || slug,
        path:
          slug.indexOf("forum:") === 0
            ? "/forum/" + slug.replace(/^forum:/, "") + ".html"
            : slug === "index"
              ? "/blog/"
              : "/blog/" + slug + ".html",
      });
    })
    .sort(function (a, b) {
      return b.views + b.cta_clicks * 3 + b.leads * 10 - (a.views + a.cta_clicks * 3 + a.leads * 10);
    })
    .slice(0, 50);

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
      "Vues/clics = journey_events first-party (page_view + événements blog_*). Leads = site_leads dont landing/UTM touche /blog ou /forum. GA4/Clarity restent la référence pour le trafic SEO global.",
  };
}

module.exports = {
  buildBlogStats,
  loadArticleInventory,
  isBlogOrForumPath,
  slugFromPath,
  BLOG_EVENT_TYPES,
};
