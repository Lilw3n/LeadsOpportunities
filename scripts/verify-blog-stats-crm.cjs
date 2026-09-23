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

var html = read("crm-blog-stats.html");
assert(html.indexOf("blogStatsArticles") !== -1, "table articles dans HTML");
assert(html.indexOf("/api/crm/blog-stats") === -1, "HTML sans fetch inline (JS séparé)");

process.exit(failed ? 1 : 0);
