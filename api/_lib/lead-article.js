/**
 * Article source d'un lead + compteur questionnaire (contact + formulaire envoyé).
 * Les clics viennent des événements blog (cartes, CTA, liens), pas des vues.
 */
const {
  resolveLeadArticle,
  isFilledQuestionnaireLead,
  attributeBlogClick,
} = require("./blog-stats");

var catalogCache = null;
var clickCache = { at: 0, map: null };

function articleCatalog() {
  if (catalogCache) return catalogCache;
  var by = {};
  try {
    var manifest = require("../../scripts/blog-articles-manifest.cjs");
    var list = manifest.articles || [];
    list.forEach(function (a) {
      if (!a || !a.file) return;
      var slug = String(a.file).replace(/\.html$/i, "");
      by[slug] = { slug: slug, title: a.title || slug, path: "/blog/" + a.file };
    });
  } catch (e) {
    /* manifeste optionnel */
  }
  catalogCache = by;
  return by;
}

function decorateLeadArticle(row, clickMap) {
  if (!row) return row;
  var resolved = resolveLeadArticle(row);
  var filled = isFilledQuestionnaireLead(row);
  var slug =
    resolved && resolved.slug && resolved.slug !== "index" && resolved.slug !== "(landing blog/forum)"
      ? resolved.slug
      : "";
  var art = slug ? articleCatalog()[slug] : null;
  row.questionnaire_filled = !!filled;
  row.article_slug = slug || null;
  row.article_title = art ? art.title : slug || null;
  row.article_path = art ? art.path : slug ? "/blog/" + slug + ".html" : null;
  row.article_clicks = slug ? Number((clickMap && clickMap[slug]) || 0) : 0;
  return row;
}

function summarizeQuestionnaireLeads(rows, clickMap) {
  var by = {};
  var total = 0;
  (rows || []).forEach(function (row) {
    var copy = decorateLeadArticle(Object.assign({}, row), clickMap);
    if (!copy.questionnaire_filled) return;
    total++;
    var key = copy.article_slug || "(sans article)";
    if (!by[key]) {
      by[key] = {
        slug: copy.article_slug || "",
        title: copy.article_title || "Questionnaire sans article de blog",
        path: copy.article_path || "",
        clicks: copy.article_clicks || 0,
        questionnaire_leads: 0,
      };
    }
    by[key].questionnaire_leads++;
  });
  var articles = Object.keys(by)
    .map(function (k) {
      return by[k];
    })
    .sort(function (a, b) {
      var q = (b.questionnaire_leads || 0) - (a.questionnaire_leads || 0);
      if (q) return q;
      return (b.clicks || 0) - (a.clicks || 0);
    });
  return { questionnaire_total: total, articles: articles.slice(0, 20) };
}

async function loadArticleClickMap(sql) {
  if (!sql) return {};
  if (clickCache.map && Date.now() - clickCache.at < 60000) return clickCache.map;
  var map = {};
  try {
    var since = new Date(Date.now() - 30 * 86400000).toISOString();
    var rows = await sql`
      SELECT event_type, page_path, meta
      FROM journey_events
      WHERE created_at >= ${since}
        AND event_type IN ('blog_card_click', 'blog_cta_click', 'blog_link_click')
      ORDER BY created_at DESC
      LIMIT 4000
    `;
    (rows || []).forEach(function (row) {
      var attr = attributeBlogClick(row);
      if (!attr.slug || attr.slug === "index" || attr.slug === "(autre)") return;
      map[attr.slug] = (map[attr.slug] || 0) + 1;
    });
  } catch (e) {
    map = {};
  }
  clickCache = { at: Date.now(), map: map };
  return map;
}

module.exports = {
  decorateLeadArticle,
  summarizeQuestionnaireLeads,
  loadArticleClickMap,
  articleCatalog,
};
