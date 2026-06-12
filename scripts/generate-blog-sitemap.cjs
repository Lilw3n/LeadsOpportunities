const fs = require("fs");
const path = require("path");
const manifest = require("./blog-articles-manifest.cjs");
const { SITE_ORIGIN: base } = require("./site-url.cjs");

const blogDir = path.join(__dirname, "..", "blog");
const fallbackLastmod = process.env.BLOG_PUBLISH_DATE || "2026-06-11";

function escapeXml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function articleDate(article) {
  return article.updatedAt || article.publishedAt || article.publishAt || fallbackLastmod;
}

var urls = [
  {
    loc: base + "/blog/",
    lastmod: fallbackLastmod,
    changefreq: "weekly",
    priority: "0.8",
  },
  {
    loc: base + "/blog/feed.xml",
    lastmod: fallbackLastmod,
    changefreq: "weekly",
    priority: "0.5",
  },
].concat(
  manifest.articles
    .filter(function (article) {
      return !article.skipGenerate && fs.existsSync(path.join(blogDir, article.file));
    })
    .map(function (article) {
      return {
        loc: base + "/blog/" + article.file,
        lastmod: articleDate(article),
        changefreq: "monthly",
        priority: article.publishAt ? "0.78" : "0.75",
      };
    })
);

var xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls
    .map(function (url) {
      return (
        "  <url>\n" +
        "    <loc>" +
        escapeXml(url.loc) +
        "</loc>\n" +
        "    <lastmod>" +
        escapeXml(url.lastmod) +
        "</lastmod>\n" +
        "    <changefreq>" +
        url.changefreq +
        "</changefreq>\n" +
        "    <priority>" +
        url.priority +
        "</priority>\n" +
        "  </url>"
      );
    })
    .join("\n") +
  "\n</urlset>\n";

fs.writeFileSync(path.join(blogDir, "sitemap.xml"), xml);
console.log("blog/sitemap.xml —", urls.length, "URLs");
