const fs = require("fs");
const path = require("path");
const manifest = require("./blog-articles-manifest.cjs");
const { SITE_ORIGIN: base } = require("./site-url.cjs");
const { readBuildDate, getPublishedArticles, articleDate } = require("./blog-article-schedule.cjs");

const sitemapPath = path.join(__dirname, "..", "sitemap-main.xml");
const blogDir = path.join(__dirname, "..", "blog");
const buildDate = readBuildDate();

function urlEntry(article) {
  return (
    "  <url>\n" +
    "    <loc>" +
    base +
    "/blog/" +
    article.file +
    "</loc>\n" +
    "    <lastmod>" +
    articleDate(article, "2026-05-29") +
    "</lastmod>\n" +
    "    <changefreq>monthly</changefreq>\n" +
    "    <priority>" +
    (article.leadIntent ? "0.78" : "0.74") +
    "</priority>\n" +
    "  </url>\n"
  );
}

var xml = fs.readFileSync(sitemapPath, "utf8");
var publishedArticles = getPublishedArticles(manifest, buildDate).filter(function (article) {
  return fs.existsSync(path.join(blogDir, article.file));
});

var missing = publishedArticles.filter(function (article) {
  return xml.indexOf(base + "/blog/" + article.file) === -1;
});

if (missing.length) {
  var insertion = missing.map(urlEntry).join("");
  xml = xml.replace("</urlset>", insertion + "</urlset>");
  fs.writeFileSync(sitemapPath, xml);
}

console.log("sitemap-main.xml — added:", missing.length, "blog urls", "buildDate:", buildDate);
