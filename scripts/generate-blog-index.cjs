const fs = require("fs");
const path = require("path");
const manifest = require("./blog-articles-manifest.cjs");
const {
  PRODUCT_THEMES,
  TOPIC_THEMES,
  ALL_THEMES,
  resolveThemes,
  parseArticleDate,
  themeChipsHtml,
  collectUsedThemes,
} = require("./blog-themes.cjs");
const { SITE_ORIGIN: base } = require("./site-url.cjs");
const clarityInlineHtml = require("./clarity-inline-html.cjs");
const { franceMetaBlock, blogLogoBlock } = require("./france-brand.cjs");
const CLARITY_HEAD = clarityInlineHtml();
const BLOG_CSS = "/blog/blog.css";

const indexPath = path.join(__dirname, "..", "blog", "index.html");

function card(a) {
  var themes = resolveThemes(a);
  var topicThemes = themes.filter(function (id) {
    return TOPIC_THEMES[id] || (PRODUCT_THEMES[id] && id !== a.section);
  });
  var displayThemes = topicThemes.length ? topicThemes : themes.filter(function (id) {
    return id === a.section;
  });
  if (displayThemes.indexOf(a.section) === -1 && PRODUCT_THEMES[a.section]) {
    displayThemes.unshift(a.section);
  }
  displayThemes = displayThemes.slice(0, 4);

  return (
    '      <a class="blog-card" href="./' +
    a.file +
    '" data-themes="' +
    themes.join(",") +
    '">\n        <div class="blog-card-head">\n          <span class="blog-card-tag ' +
    a.tagClass +
    '">' +
    a.tag +
    "</span>\n          <div class=\"blog-card-themes\" aria-label=\"Thèmes\">" +
    themeChipsHtml(displayThemes) +
    "</div>\n        </div>\n        <h2>" +
    a.title +
    "</h2>\n        <p>" +
    (a.cardExcerpt || a.description) +
    '</p>\n        <span class="blog-card-meta">' +
    a.meta +
    "</span>\n      </a>\n"
  );
}

function filterChip(id, label, tagClass, count) {
  return (
    '<button type="button" class="blog-filter-chip ' +
    tagClass +
    '" data-theme="' +
    id +
    '" aria-pressed="false">' +
    label +
    ' <span class="blog-filter-count">' +
    count +
    "</span></button>\n"
  );
}

function buildFiltersHtml(articles) {
  var used = collectUsedThemes(articles);
  var productIds = Object.keys(PRODUCT_THEMES).filter(function (id) {
    return used[id];
  });
  var topicIds = Object.keys(TOPIC_THEMES).filter(function (id) {
    return used[id];
  });

  var html =
    '    <section class="blog-filters" aria-label="Filtrer par thème">\n' +
    '      <div class="blog-filters-header">\n' +
    "        <h2>Explorer par thème</h2>\n" +
    '        <p id="blog-filter-count">' +
    articles.length +
    " articles</p>\n" +
    "      </div>\n" +
    '      <div class="blog-filter-group">\n' +
    '        <span class="blog-filter-label">Produits</span>\n' +
    '        <div class="blog-filter-chips" id="blog-theme-filters">\n' +
    filterChip("all", "Tous", "tag-all", articles.length);

  productIds.forEach(function (id) {
    var t = ALL_THEMES[id];
    html += filterChip(id, t.label, t.tagClass, used[id]);
  });

  html +=
    "        </div>\n" +
    "      </div>\n";

  if (topicIds.length) {
    html +=
      '      <div class="blog-filter-group">\n' +
      '        <span class="blog-filter-label">Sujets</span>\n' +
      '        <div class="blog-filter-chips blog-filter-chips--topics">\n';
    topicIds.forEach(function (id) {
      var t = ALL_THEMES[id];
      html += filterChip(id, t.label, t.tagClass, used[id]);
    });
    html += "        </div>\n      </div>\n";
  }

  html +=
    '      <p class="blog-filter-hint">Plusieurs thèmes possibles par article — combinez les filtres ou cliquez sur un badge dans une carte.</p>\n' +
    "    </section>\n";

  return html;
}

var sorted = manifest.articles.slice().sort(function (a, b) {
  return parseArticleDate(b.meta) - parseArticleDate(a.meta);
});

var filtersHtml = buildFiltersHtml(manifest.articles);
var gridHtml =
  '    <div class="blog-grid blog-grid--filtered" id="blog-grid">\n' +
  sorted.map(card).join("") +
  "    </div>\n" +
  '    <p class="blog-filter-empty" id="blog-filter-empty" hidden>Aucun article pour cette sélection. <button type="button" class="blog-filter-reset" data-theme="all">Voir tous les articles</button></p>\n';

var ctaBlocks = manifest.sections
  .filter(function (sec) {
    return sec.cta;
  })
  .map(function (sec) {
    return (
      '    <div class="blog-section-cta">\n      <span class="blog-section-cta-label">' +
      sec.title +
      '</span>\n      <a class="btn btn-primary" href="' +
      sec.cta.href +
      '">' +
      sec.cta.label +
      "</a>\n    </div>"
    );
  })
  .join("\n");

var html =
  '<!doctype html>\n<html lang="fr">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  ' +
  franceMetaBlock() +
  '\n  <meta name="robots" content="index,follow" />\n  <title>Blog assurance France | Mutuelle, habitation, emprunteur | Leads Opportunities</title>\n  <meta name="description" content="Guides assurance en France : mutuelle, auto, habitation, emprunteur, prevoyance, VTC. Filtrez par thème et trouvez l\'article qui vous concerne." />\n  <link rel="canonical" href="' +
  base +
  '/blog/" />\n  <link rel="alternate" type="application/rss+xml" title="Blog Leads Opportunities" href="/blog/feed.xml" />\n  <script async src="https://www.googletagmanager.com/gtag/js?id=G-JX8E35693F"></script>\n  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag(\'js\',new Date());gtag(\'config\',\'G-JX8E35693F\');</script>\n  <script src="/api/google-config-env"></script>\n  <script src="../google-config.js"></script>\n  ' +
  CLARITY_HEAD +
  '\n  <script src="/js/clarity-init.js" defer></script>\n  <link rel="stylesheet" href="' +
  BLOG_CSS +
  '" />\n</head>\n<body data-blog-page="index" data-market-intent="FR">\n  <header class="blog-topbar">\n    <div class="blog-topbar-inner">\n      <a class="blog-back" href="../index.html">Accueil</a>\n      ' +
  blogLogoBlock() +
  '\n    </div>\n  </header>\n  <main class="blog-container blog-container--index">\n    <div class="blog-hero">\n      <h1>Blog &amp; conseils assurance</h1>\n      <p>Guides mutuelle, habitation, emprunteur et credit en <strong>France</strong> — filtrez par <strong>produit</strong> ou par <strong>sujet</strong> (canicule, seniors, voyage…).</p>\n      <p class="blog-hero-link"><a href="../assurances/">Voir toutes nos assurances</a></p>\n    </div>\n\n' +
  filtersHtml +
  "\n" +
  gridHtml +
  "\n" +
  ctaBlocks +
  '\n  </main>\n  <footer class="blog-footer">\n    <a href="../assurances/">Catalogue assurances</a>\n    <a href="../assurance-vtc/">VTC</a>\n    <a href="../assurance-animaux/">Animaux</a>\n    <a href="../index.html#contact">Contact</a>\n  </footer>\n  <script src="../js/attribution.js" defer></script>\n  <script src="../js/blog-reading-analytics.js" defer></script>\n  <script src="../js/blog-index-filters.js" defer></script>\n</body>\n</html>\n';

fs.writeFileSync(indexPath, html);
console.log("blog/index.html —", manifest.articles.length, "articles (filtres par thème)");
