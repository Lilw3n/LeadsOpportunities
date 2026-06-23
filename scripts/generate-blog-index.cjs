const fs = require("fs");
const path = require("path");
const manifest = require("./blog-articles-manifest.cjs");
const { SITE_ORIGIN: base } = require("./site-url.cjs");
const clarityInlineHtml = require("./clarity-inline-html.cjs");
const { franceMetaBlock, blogLogoBlock } = require("./france-brand.cjs");
const CLARITY_HEAD = clarityInlineHtml();

const indexPath = path.join(__dirname, "..", "blog", "index.html");

function card(a) {
  return (
    '      <a class="blog-card" href="./' +
    a.file +
    '">\n        <span class="blog-card-tag ' +
    a.tagClass +
    '">' +
    a.tag +
    "</span>\n        <h2>" +
    a.title +
    "</h2>\n        <p>" +
    (a.cardExcerpt || a.description) +
    '</p>\n        <span class="blog-card-meta">' +
    a.meta +
    "</span>\n      </a>\n"
  );
}

var bySection = {};
manifest.articles.forEach(function (a) {
  if (!bySection[a.section]) bySection[a.section] = [];
  bySection[a.section].push(a);
});

var sectionsHtml = manifest.sections
  .map(function (sec) {
    var arts = bySection[sec.id] || [];
    if (!arts.length) return "";
    var cta =
      sec.cta
        ? '\n    <div class="article-cta" style="margin:24px 0">\n      <a class="btn btn-primary" href="' +
          sec.cta.href +
          '">' +
          sec.cta.label +
          "</a>\n    </div>\n"
        : "";
    var intro = sec.intro ? '<p style="color:#64748b;margin:-8px 0 16px">' + sec.intro + "</p>\n" : "";
    return (
      '    <h2 style="font-size:1.15rem;margin:32px 0 16px">' +
      sec.title +
      "</h2>\n" +
      intro +
      '    <div class="blog-grid">\n' +
      arts.map(card).join("") +
      "    </div>\n" +
      cta
    );
  })
  .join("\n");

var html =
  '<!doctype html>\n<html lang="fr">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  ' +
  franceMetaBlock() +
  '\n  <meta name="robots" content="index,follow" />\n  <title>Blog assurance France | Mutuelle, habitation, emprunteur | Leads Opportunities</title>\n  <meta name="description" content="Guides assurance en France : mutuelle, auto, habitation, emprunteur, prevoyance, VTC. Conseils courtier ORIAS, devis gratuit." />\n  <link rel="canonical" href="' +
  base +
  '/blog/" />\n  <link rel="alternate" type="application/rss+xml" title="Blog Leads Opportunities" href="/blog/feed.xml" />\n  <script async src="https://www.googletagmanager.com/gtag/js?id=G-JX8E35693F"></script>\n  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag(\'js\',new Date());gtag(\'config\',\'G-JX8E35693F\');</script>\n  <script src="/api/google-config-env"></script>\n  <script src="../google-config.js"></script>\n  ' +
  CLARITY_HEAD +
  '\n  <script src="/js/clarity-init.js" defer></script>\n  <link rel="stylesheet" href="./blog.css" />\n</head>\n<body data-blog-page="index" data-market-intent="FR">\n  <header class="blog-topbar">\n    <div class="blog-topbar-inner">\n      <a class="blog-back" href="../index.html">Accueil</a>\n      ' +
  blogLogoBlock() +
  '\n    </div>\n  </header>\n  <main class="blog-container">\n    <div class="blog-hero">\n      <h1>Blog &amp; conseils assurance</h1>\n      <p>Guides mutuelle, habitation, emprunteur et credit en <strong>France</strong> — plus une selection d\'articles actu relies a votre protection (elections, inflation, vie quotidienne).</p>\n      <p style="margin-top:12px"><a href="../assurances/">Voir toutes nos assurances</a></p>\n    </div>\n\n' +
  sectionsHtml +
  '\n  </main>\n  <footer class="blog-footer">\n    <a href="../assurances/">Catalogue assurances</a>\n    <a href="../assurance-vtc/">VTC</a>\n    <a href="../assurance-animaux/">Animaux</a>\n    <a href="../index.html#contact">Contact</a>\n  </footer>\n  <script src="../js/attribution.js" defer></script>\n  <script src="../js/blog-reading-analytics.js" defer></script>\n</body>\n</html>\n';

fs.writeFileSync(indexPath, html);
console.log("blog/index.html —", manifest.articles.length, "articles");
