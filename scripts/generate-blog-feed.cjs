const fs = require("fs");
const path = require("path");
const manifest = require("./blog-articles-manifest.cjs");
const { SITE_ORIGIN: base } = require("./site-url.cjs");

const blogDir = path.join(__dirname, "..", "blog");
var fallbackPubDate = "2026-06-11";

function escapeXml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function articlePubDate(article) {
  return article.publishedAt || article.publishAt || fallbackPubDate;
}

var items = manifest.articles
  .filter(function (a) {
    return fs.existsSync(path.join(blogDir, a.file));
  })
  .map(function (a) {
    return (
      "  <item>\n    <title>" +
      escapeXml(a.title) +
      "</title>\n    <link>" +
      base +
      "/blog/" +
      a.file +
      "</link>\n    <guid isPermaLink=\"true\">" +
      base +
      "/blog/" +
      a.file +
      "</guid>\n    <pubDate>" +
      articlePubDate(a) +
      "</pubDate>\n  </item>"
    );
  })
  .join("\n");

var xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<rss version="2.0"><channel>\n' +
  "<title>Leads Opportunities Blog</title>\n" +
  "<link>" +
  base +
  "/blog/</link>\n" +
  "<description>Conseils assurance sante, auto, habitation, emprunteur, prevoyance, VTC, animaux et actu</description>\n" +
  "<language>fr-FR</language>\n" +
  items +
  "\n</channel></rss>";

fs.writeFileSync(path.join(blogDir, "feed.xml"), xml);
console.log("blog/feed.xml —", manifest.articles.length, "articles");
