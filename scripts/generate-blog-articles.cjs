const fs = require("fs");
const path = require("path");
const manifest = require("./blog-articles-manifest.cjs");
const { SITE_ORIGIN: base } = require("./site-url.cjs");

const blogDir = path.join(__dirname, "..", "blog");
const force = process.argv.includes("--force");

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderBlock(b) {
  if (b.type === "h2") return "      <h2>" + b.text + "</h2>\n";
  if (b.type === "p") return "      <p>" + b.text + "</p>\n";
  if (b.type === "ul") {
    return (
      "      <ul>\n" +
      b.items.map(function (i) {
        return "        <li>" + i + "</li>\n";
      }).join("") +
      "      </ul>\n"
    );
  }
  return "";
}

function renderArticle(a) {
  var canonical = base + "/blog/" + a.file;
  var body = (a.blocks || []).map(renderBlock).join("\n");
  var cta = a.cta
    ? '      <div class="article-cta">\n        <p>Devis gratuit et accompagnement courtier ORIAS</p>\n        <a class="btn btn-primary" href="' +
      a.cta.href +
      '">' +
      esc(a.cta.label) +
      "</a>\n      </div>\n"
    : "";
  var links =
    a.related && a.related.length
      ? '      <div class="article-links">\n        <h2>Nos pages utiles</h2>\n        <ul>\n' +
        a.related
          .map(function (r) {
            return '          <li><a href="' + r.href + '">' + esc(r.label) + "</a></li>\n";
          })
          .join("") +
        "        </ul>\n      </div>\n"
      : "";

  return (
    '<!doctype html>\n<html lang="fr">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>' +
    esc(a.title) +
    " | Leads Opportunities</title>\n  <meta name=\"description\" content=\"" +
    esc(a.description) +
    '" />\n  <link rel="canonical" href="' +
    canonical +
    '" />\n  <meta name="google-site-verification" content="ScnkvjLBpwnI_QIExLhB1bMxxvGnNZSmiqFgexE9x64" />\n  <meta property="og:title" content="' +
    esc(a.title) +
    '" />\n  <meta property="og:description" content="' +
    esc(a.description) +
    '" />\n  <meta property="og:type" content="article" />\n  <meta property="og:url" content="' +
    canonical +
    '" />\n  <meta property="og:image" content="' +
    base +
    '/og-default.jpg" />\n  <link rel="alternate" type="application/rss+xml" title="Blog" href="/blog/feed.xml" />\n  <script async src="https://www.googletagmanager.com/gtag/js?id=G-JX8E35693F"></script>\n  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag(\'js\',new Date());gtag(\'config\',\'G-JX8E35693F\');</script>\n  <script src="/api/google-config-env"></script>\n  <script src="../google-config.js"></script>\n  <link rel="stylesheet" href="./blog.css" />\n</head>\n<body>\n  <header class="blog-topbar">\n    <div class="blog-topbar-inner">\n      <a class="blog-back" href="./index.html">\n        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>\n        Blog\n      </a>\n      <a class="blog-logo" href="../index.html">\n        <span class="blog-logo-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span>\n        Leads Opportunities\n      </a>\n    </div>\n  </header>\n  <main class="blog-container">\n    <div class="article-header">\n      <div class="article-tag ' +
    a.tagClass +
    '">' +
    esc(a.tag) +
    '</div>\n      <h1>' +
    a.title +
    '</h1>\n      <p class="article-meta">' +
    a.meta +
    " &middot; Par l'equipe Leads Opportunities</p>\n    </div>\n    <div class=\"article-body\">\n" +
    body +
    cta +
    links +
    '    </div>\n  </main>\n  <footer class="blog-footer">\n    <a href="../assurances/">Toutes nos assurances</a>\n    <a href="../index.html#contact">Demande de rappel</a>\n  </footer>\n</body>\n</html>\n'
  );
}

var created = 0;
var skipped = 0;

manifest.articles.forEach(function (a) {
  if (a.skipGenerate) {
    skipped++;
    return;
  }
  var out = path.join(blogDir, a.file);
  if (fs.existsSync(out) && !force) {
    skipped++;
    return;
  }
  if (!a.blocks || !a.blocks.length) {
    console.warn("skip (no blocks):", a.file);
    return;
  }
  fs.writeFileSync(out, renderArticle(a));
  created++;
  console.log("written:", a.file);
});

console.log("Done — created:", created, "skipped:", skipped);
