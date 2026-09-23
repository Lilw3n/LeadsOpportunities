#!/usr/bin/env node
/** Vérifie le dashboard CRM stats blog (vues / clics / leads). */
var fs = require("fs");
var path = require("path");
var failed = 0;
var root = path.join(__dirname, "..");

function assert(cond, msg) {
  if (!cond) {
    failed++;
    console.log("FAIL", msg);
  } else {
    console.log("OK  ", msg);
  }
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

assert(fs.existsSync(path.join(root, "crm-blog-stats.html")), "crm-blog-stats.html");
assert(fs.existsSync(path.join(root, "crm-blog-stats.js")), "crm-blog-stats.js");
assert(fs.existsSync(path.join(root, "api/_lib/blog-stats.js")), "api/_lib/blog-stats.js");
assert(fs.existsSync(path.join(root, "api/_lib/routes/crm-blog-stats.js")), "route crm-blog-stats");

var action = read("api/crm/[action].js");
assert(action.indexOf('"blog-stats"') !== -1, "route enregistrée blog-stats");

var sidebar = read("js/crm-sidebar.js");
assert(sidebar.indexOf("crm-blog-stats.html") !== -1, "lien sidebar Stats blog");

var trafic = read("crm-trafic.html");
assert(trafic.indexOf("crm-blog-stats.html") !== -1, "lien depuis crm-trafic");

var analytics = read("js/blog-reading-analytics.js");
assert(analytics.indexOf("mirrorJourney") !== -1, "miroir journey dans blog-reading-analytics");
assert(analytics.indexOf("/api/journey-event") !== -1, "POST journey-event");
assert(analytics.indexOf("blog_cta_click") !== -1, "événement CTA");

var lib = read("api/_lib/blog-stats.js");
assert(lib.indexOf("buildBlogStats") !== -1, "buildBlogStats exporté");
assert(lib.indexOf("cta_clicks") !== -1, "agrégation cta_clicks");
assert(lib.indexOf("leads_blog") !== -1, "agrégation leads_blog");

var inv = require("../api/_lib/blog-stats.js").loadArticleInventory();
assert(inv.total_articles >= 50, "inventaire articles >= 50 (got " + inv.total_articles + ")");
var withDate = inv.articles.filter(function (a) {
  return a.kind === "blog" && a.date_published;
});
assert(withDate.length >= 40, "articles avec date_published >= 40 (got " + withDate.length + ")");
var withQ = inv.articles.filter(function (a) {
  return a.questionnaire_need;
});
assert(withQ.length >= 20, "articles liés questionnaire >= 20 (got " + withQ.length + ")");
assert(
  inv.articles.some(function (a) {
    return a.questionnaires_admin_url && a.questionnaires_admin_url.indexOf("blog-questionnaires") !== -1;
  }),
  "lien blog-questionnaires dans inventaire"
);

var html = read("crm-blog-stats.html");
assert(html.indexOf("blogStatsArticles") !== -1, "table articles dans HTML");
assert(html.indexOf("blog-questionnaires.html") !== -1, "lien HTML vers questionnaires");
assert(html.indexOf("blogStatsSearch") !== -1, "champ recherche articles");
assert(html.indexOf("/api/crm/blog-stats") === -1, "HTML sans fetch inline (JS séparé)");

var js = read("crm-blog-stats.js");
assert(js.indexOf("blog-stats-article-link") !== -1, "titres articles cliquables");
assert(js.indexOf("date_published") !== -1 || js.indexOf("formatDate") !== -1, "affichage date article");
assert(js.indexOf("questionnaires_admin_url") !== -1, "lien mapping questionnaire");
assert(js.indexOf("article_source") !== -1 || js.indexOf("Article source") !== -1, "colonne article source leads");
assert(read("js/site-host-brand.js").indexOf("buchetimmobilier") !== -1, "brand host buchet");
assert(read("crm-blog-stats.html").indexOf("blogStatsLeadsByArticle") !== -1, "bloc leads par article");

var bq = read("blog-questionnaires-admin.js");
assert(bq.indexOf("queryParam") !== -1, "préremplissage ?q= sur questionnaires");
assert(bq.indexOf("crm-blog-stats.html") !== -1, "lien retour stats depuis questionnaires");

var { resolveLeadArticle, slugFromUtmContent } = require("../api/_lib/blog-stats.js");
assert(slugFromUtmContent("foo-bar.html") === "foo-bar", "slugFromUtmContent");
assert(
  resolveLeadArticle({ utm_source: "blog", utm_content: "pret-immobilier-refuse-que-faire-2026", payload: {} }).slug ===
    "pret-immobilier-refuse-que-faire-2026",
  "lead → article via utm_content"
);

process.exit(failed ? 1 : 0);
