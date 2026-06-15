const fs = require("fs");
const path = require("path");
const manifest = require("./blog-articles-manifest.cjs");
const { SITE_ORIGIN: base } = require("./site-url.cjs");

const ROOT = path.join(__dirname, "..");
const blogDir = path.join(ROOT, "blog");
const today = new Date().toISOString().slice(0, 10);

function escapeXml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function urlEntry(loc, priority, changefreq) {
  return (
    "  <url>\n" +
    "    <loc>" +
    escapeXml(loc) +
    "</loc>\n" +
    "    <lastmod>" +
    today +
    "</lastmod>\n" +
    "    <changefreq>" +
    changefreq +
    "</changefreq>\n" +
    "    <priority>" +
    priority +
    "</priority>\n" +
    "  </url>"
  );
}

const urls = [urlEntry(base + "/blog/", "0.8", "weekly")];
manifest.articles.forEach(function (article) {
  if (!article.skipGenerate && fs.existsSync(path.join(blogDir, article.file))) {
    urls.push(urlEntry(base + "/blog/" + article.file, "0.74", "monthly"));
  }
});

const sitemap =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.join("\n") +
  "\n</urlset>\n";

fs.writeFileSync(path.join(ROOT, "sitemap-blog.xml"), sitemap, "utf8");
const sitemapIndex =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  ["sitemap-main.xml", "sitemap-geo.xml", "sitemap-france.xml", "sitemap-blog.xml"]
    .map(function (name) {
      return (
        "  <sitemap>\n" +
        "    <loc>" +
        base +
        "/" +
        name +
        "</loc>\n" +
        "    <lastmod>" +
        today +
        "</lastmod>\n" +
        "  </sitemap>"
      );
    })
    .join("\n") +
  "\n</sitemapindex>\n";
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemapIndex, "utf8");
console.log("sitemap-blog.xml —", urls.length, "URLs");
