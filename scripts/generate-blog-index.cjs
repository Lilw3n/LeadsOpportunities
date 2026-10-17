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
const metierShelf = require("./blog-metiers-shelf.cjs");
const { franceMetaBlock, blogLogoBlock, brandIconsMeta } = require("./france-brand.cjs");
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

var SECTION_ORDER = [
  "pro",
  "partenariat",
  "collective",
  "vtc",
  "sante",
  "auto",
  "vsp",
  "habitat",
  "prevoyance",
  "finance",
  "animaux",
  "chasse",
  "equitation",
  "patrimoine",
  "actu",
];

var SECTION_FACE = {
  pro: { label: "Professionnel et RC Pro", tag: "tag-pro", lead: "Garage, MRP, décennale, bâtiment, transport, dirigeant." },
  partenariat: { label: "Métiers et niches pro", tag: "tag-pro", lead: "Ramonage, esthétique, loisirs, padel, immeuble, convoyage." },
  collective: { label: "Santé collective", tag: "tag-sante", lead: "Mutuelle entreprise, ANI, DUE, panier de soins." },
  vtc: { label: "VTC et chauffeurs", tag: "tag-vtc", lead: "RC chauffeur, plateformes, première course." },
  sante: { label: "Santé et mutuelle", tag: "tag-sante", lead: "Garanties, seniors, optique, dentaire." },
  auto: { label: "Auto et mobilité", tag: "tag-auto", lead: "Bonus-malus, temporaire, flotte, collection." },
  vsp: { label: "Voiture sans permis", tag: "tag-auto", lead: "Tarif, résiliation, jeunes conducteurs." },
  habitat: { label: "Habitation", tag: "tag-habitation", lead: "Locataire, propriétaire, PNO, piscine." },
  prevoyance: { label: "Prévoyance", tag: "tag-prevoyance", lead: "TNS, arrêt de travail, famille." },
  finance: { label: "Crédit et immobilier", tag: "tag-immo", lead: "Prêt, emprunteur, refus, Nancy." },
  animaux: { label: "Animaux", tag: "tag-animaux", lead: "Chien, chat, devis et garanties." },
  chasse: { label: "Chasse", tag: "tag-animaux", lead: "RC chasseur et fédération." },
  equitation: { label: "Équitation", tag: "tag-animaux", lead: "RC équestre et centres." },
  patrimoine: { label: "Patrimoine", tag: "tag-patrimoine", lead: "Épargne, retraite, assurance-vie." },
  actu: { label: "Actu et tendances", tag: "tag-actu", lead: "Sujets du moment, angle assurance France." },
};

function sectionMeta(id) {
  var face = SECTION_FACE[id] || { label: id, tag: "tag-all", lead: "" };
  var fromManifest = manifest.sections.find(function (sec) {
    return sec.id === id;
  });
  return {
    id: id,
    label: face.label,
    tag: face.tag,
    lead: face.lead,
    cta: fromManifest && fromManifest.cta,
  };
}

function groupedSections(articles) {
  var buckets = {};
  articles.forEach(function (article) {
    var id = article.section || "actu";
    if (!buckets[id]) buckets[id] = [];
    buckets[id].push(article);
  });
  var ids = SECTION_ORDER.filter(function (id) {
    return buckets[id] && buckets[id].length;
  });
  Object.keys(buckets).forEach(function (id) {
    if (ids.indexOf(id) === -1) ids.push(id);
  });
  return ids.map(function (id) {
    var list = buckets[id].slice().sort(function (a, b) {
      return parseArticleDate(b.meta) - parseArticleDate(a.meta);
    });
    return { meta: sectionMeta(id), articles: list };
  });
}

var sections = groupedSections(sorted);

function sectionNavHtml(list) {
  var cards = list
    .map(function (block) {
      return (
        '        <a class="blog-section-nav-card ' +
        block.meta.tag +
        '" href="#blog-section-' +
        block.meta.id +
        '"><strong>' +
        block.meta.label +
        '</strong><span>' +
        block.articles.length +
        " article" +
        (block.articles.length > 1 ? "s" : "") +
        "</span></a>\n"
      );
    })
    .join("");
  return (
    '    <nav class="blog-section-nav" aria-label="Sections du blog">\n' +
    "      <h2>Sections du blog</h2>\n" +
    '      <p class="blog-section-nav-lead">Chaque métier et chaque produit a son bloc. Le rayon du haut rassemble les guides pro cités.</p>\n' +
    '      <div class="blog-section-nav-grid">\n' +
    cards +
    "      </div>\n" +
    "    </nav>\n"
  );
}

function sectionBlockHtml(block) {
  var cta = block.meta.cta
    ? '<a class="btn btn-primary" href="' + block.meta.cta.href + '">' + block.meta.cta.label + "</a>"
    : "";
  return (
    '    <section class="blog-theme-section" id="blog-section-' +
    block.meta.id +
    '" data-section="' +
    block.meta.id +
    '">\n' +
    '      <header class="blog-theme-section-head">\n' +
    "        <div>\n" +
    "          <h2>" +
    block.meta.label +
    "</h2>\n" +
    (block.meta.lead ? "          <p>" + block.meta.lead + "</p>\n" : "") +
    "        </div>\n" +
    '        <div class="blog-theme-section-actions">\n' +
    '          <span class="blog-theme-section-count ' +
    block.meta.tag +
    '">' +
    block.articles.length +
    "</span>\n" +
    cta +
    "\n        </div>\n" +
    "      </header>\n" +
    '      <div class="blog-grid blog-grid--filtered">\n' +
    block.articles.map(card).join("") +
    "      </div>\n" +
    "    </section>\n"
  );
}

var filtersHtml = buildFiltersHtml(manifest.articles);
var gridHtml =
  '    <div id="blog-grid">\n' +
  sections.map(sectionBlockHtml).join("") +
  "    </div>\n" +
  '    <p class="blog-filter-empty" id="blog-filter-empty" hidden>Aucun article pour cette sélection. <button type="button" class="blog-filter-reset" data-theme="all">Voir tous les articles</button></p>\n';

var html =
  '<!doctype html>\n<html lang="fr">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  ' +
  franceMetaBlock() +
  "\n  " +
  brandIconsMeta() +
  '\n  <meta name="robots" content="index,follow" />\n  <title>Blog assurance France | Mutuelle, habitation, emprunteur | Leads Opportunities</title>\n  <meta name="description" content="Guides assurance en France : mutuelle, auto, habitation, emprunteur, prevoyance, VTC. Filtrez par thème et trouvez l\'article qui vous concerne." />\n  <link rel="canonical" href="' +
  base +
  '/blog/" />\n  <link rel="alternate" type="application/rss+xml" title="Blog Leads Opportunities" href="/blog/feed.xml" />\n  <script async src="https://www.googletagmanager.com/gtag/js?id=G-JX8E35693F"></script>\n  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag(\'js\',new Date());gtag(\'config\',\'G-JX8E35693F\');</script>\n  <script src="/api/google-config-env"></script>\n  <script src="../google-config.js"></script>\n  ' +
  CLARITY_HEAD +
  '\n  <script src="/js/clarity-init.js" defer></script>\n  <link rel="stylesheet" href="' +
  BLOG_CSS +
  '" />\n  <style>' +
  metierShelf.CSS +
  '</style>\n</head>\n<body data-blog-page="index" data-market-intent="FR">\n  <header class="blog-topbar">\n    <div class="blog-topbar-inner">\n      <a class="blog-back" href="../index.html">Accueil</a>\n      ' +
  blogLogoBlock() +
  '\n    </div>\n  </header>\n  <main class="blog-container blog-container--index">\n    <div class="blog-hero">\n      <h1>Blog &amp; conseils assurance</h1>\n      <p>Guides en <strong>France</strong>, rangés par section : professionnel, santé collective, VTC, habitation, crédit. Le premier bloc liste les métiers cités.</p>\n      <p class="blog-hero-link"><a href="../assurances/">Voir toutes nos assurances</a> · <a href="#blog-sections">Voir les sections</a></p>\n    </div>\n\n' +
  metierShelf.html("./") +
  "\n" +
  sectionNavHtml(sections).replace('class="blog-section-nav"', 'class="blog-section-nav" id="blog-sections"') +
  "\n" +
  filtersHtml +
  "\n" +
  gridHtml +
  '\n  </main>\n  <footer class="blog-footer">\n    <a href="../assurances/">Catalogue assurances</a>\n    <a href="../assurance-vtc/">VTC</a>\n    <a href="../assurance-animaux/">Animaux</a>\n    <a href="../index.html#contact">Contact</a>\n  </footer>\n  <script src="../js/attribution.js" defer></script>\n  <script src="../js/blog-reading-analytics.js" defer></script>\n  <script src="../js/blog-index-filters.js" defer></script>\n</body>\n</html>\n';

fs.writeFileSync(indexPath, html);
console.log("blog/index.html —", manifest.articles.length, "articles (filtres par thème)");
