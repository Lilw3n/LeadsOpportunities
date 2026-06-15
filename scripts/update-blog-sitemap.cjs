const fs = require("fs");
const path = require("path");
const manifest = require("./blog-articles-manifest.cjs");
const { SITE_ORIGIN: base } = require("./site-url.cjs");

const ROOT = path.join(__dirname, "..");
const blogDir = path.join(ROOT, "blog");
const sitemapPath = path.join(ROOT, "sitemap-main.xml");
const publishDate = process.env.BLOG_PUBLISH_DATE || new Date().toISOString().slice(0, 10);

function escapeXml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function sitemapEntry(article) {
  var lastmod = article.publishedAt || article.updatedAt || publishDate;
  return (
    "  <url>\n" +
    "    <loc>" +
    escapeXml(base + "/blog/" + article.file) +
    "</loc>\n" +
    "    <lastmod>" +
    escapeXml(lastmod) +
    "</lastmod>\n" +
    "    <changefreq>monthly</changefreq>\n" +
    "    <priority>0.74</priority>\n" +
    "  </url>\n"
  );
}

var xml = fs.readFileSync(sitemapPath, "utf8");
var additions = [];

manifest.articles.forEach(function (article) {
  if (article.skipGenerate) return;
  if (!fs.existsSync(path.join(blogDir, article.file))) return;

  var loc = base + "/blog/" + article.file;
  if (xml.indexOf("<loc>" + loc + "</loc>") === -1) {
    additions.push(sitemapEntry(article));
  }
});

if (!additions.length) {
  console.log("sitemap-main.xml — aucun nouvel article blog a ajouter");
  process.exit(0);
}

xml = xml.replace("</urlset>", additions.join("") + "</urlset>");
fs.writeFileSync(sitemapPath, xml);
console.log("sitemap-main.xml —", additions.length, "article(s) blog ajoute(s)");
