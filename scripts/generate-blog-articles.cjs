const fs = require("fs");
const path = require("path");
const manifest = require("./blog-articles-manifest.cjs");
const { enrichArticle } = require("./blog-seo-enrich.cjs");
const { getOverride } = require("./blog-content-deep.cjs");
const { SITE_ORIGIN: base } = require("./site-url.cjs");
const { resolveBridge, renderBridgeHtml } = require("./blog-questionnaire-bridge.cjs");
const clarityInlineHtml = require("./clarity-inline-html.cjs");
const { franceMetaBlock, blogLogoBlock, googleSiteVerificationMeta } = require("./france-brand.cjs");
const { robotsMetaForArticle } = require("./france-audience-lib.cjs");
const { applyArticleImages } = require("./blog-article-images.cjs");
const { clusterForBlogArticle, moneyLinksHtml } = require("./seo-keywords-lib.cjs");
const CLARITY_HEAD = clarityInlineHtml();
const BLOG_CSS = "/blog/blog.css";

const blogDir = path.join(__dirname, "..", "blog");
const force = process.argv.includes("--force");

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function resolveOgImage(a) {
  if (a.ogImage) {
    return String(a.ogImage).indexOf("http") === 0 ? a.ogImage : base + a.ogImage;
  }
  if (a.heroImage && a.heroImage.src) {
    var src = String(a.heroImage.src).replace(/^\.\//, "/blog/");
    if (src.indexOf("/") !== 0) src = "/blog/" + src;
    return base + src;
  }
  return base + "/og-default.svg";
}

function renderHero(hero) {
  if (!hero || !hero.src) return "";
  return (
    '    <figure class="article-hero">\n' +
    '      <img src="' +
    esc(hero.src) +
    '" alt="' +
    esc(hero.alt || "") +
    '" width="' +
    esc(hero.width || "1280") +
    '" height="' +
    esc(hero.height || "720") +
    '" fetchpriority="high" decoding="async" />\n' +
    (hero.caption ? "      <figcaption>" + hero.caption + "</figcaption>\n" : "") +
    "    </figure>\n"
  );
}

function renderBlock(b, bridge) {
  if (b.type === "bridge" && bridge) return renderBridgeHtml(bridge, { variant: "mid" });
  if (b.type === "h2") return "      <h2>" + b.text + "</h2>\n";
  if (b.type === "h3") return "      <h3>" + b.text + "</h3>\n";
  if (b.type === "p") return "      <p>" + b.text + "</p>\n";
  if (b.type === "figure") {
    return (
      '      <figure class="article-figure">\n' +
      '        <img src="' +
      esc(b.src) +
      '" alt="' +
      esc(b.alt || "") +
      '" loading="lazy" decoding="async" width="' +
      esc(b.width || "1280") +
      '" height="' +
      esc(b.height || "720") +
      '" />\n' +
      (b.caption ? "        <figcaption>" + b.caption + "</figcaption>\n" : "") +
      "      </figure>\n"
    );
  }
  if (b.type === "gallery" && b.items && b.items.length) {
    return (
      '      <div class="article-gallery" role="group" aria-label="' +
      esc(b.label || "Galerie") +
      '">\n' +
      b.items
        .map(function (item) {
          return (
            '        <figure class="article-gallery-item">\n' +
            '          <img src="' +
            esc(item.src) +
            '" alt="' +
            esc(item.alt || "") +
            '" loading="lazy" decoding="async" width="' +
            esc(item.width || "1280") +
            '" height="' +
            esc(item.height || "720") +
            '" />\n' +
            (item.caption ? "          <figcaption>" + item.caption + "</figcaption>\n" : "") +
            "        </figure>\n"
          );
        })
        .join("") +
      "      </div>\n"
    );
  }
  if (b.type === "ul") {
    return (
      "      <ul>\n" +
      b.items
        .map(function (i) {
          return "        <li>" + i + "</li>\n";
        })
        .join("") +
      "      </ul>\n"
    );
  }
  return "";
}

function renderFaq(faq) {
  if (!faq || !faq.length) return "";
  return (
    '      <section class="article-faq" aria-labelledby="faq-title">\n' +
    '        <h2 id="faq-title">Questions frequentes</h2>\n' +
    faq
      .map(function (item) {
        return (
          '        <details class="article-faq-item">\n' +
          "          <summary>" +
          item.q +
          "</summary>\n" +
          "          <p>" +
          item.a +
          "</p>\n" +
          "        </details>\n"
        );
      })
      .join("") +
    "      </section>\n"
  );
}

function renderJsonLd(a, canonical) {
  var faq = a.faq || [];
  var graph = [
    {
      "@type": "Article",
      headline: a.title,
      description: a.description,
      author: { "@type": "Organization", name: "Leads Opportunities" },
      publisher: { "@type": "Organization", name: "Leads Opportunities" },
      mainEntityOfPage: canonical,
      datePublished: "2026-05-01",
      dateModified: "2026-05-28",
    },
  ];
  if (faq.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faq.map(function (item) {
        return {
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        };
      }),
    });
  }
  return (
    '  <script type="application/ld+json">\n' +
    JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2) +
    "\n  </script>\n"
  );
}

function renderArticle(a) {
  var canonical = base + "/blog/" + a.file;
  var bridge = resolveBridge(a);
  var body = (a.blocks || []).map(function (b) {
    return renderBlock(b, bridge);
  }).join("\n");
  var cluster = clusterForBlogArticle(a);
  var keywordsMeta = (a.keywords || []).join(", ");
  if (!keywordsMeta && cluster) {
    keywordsMeta = [cluster.primary].concat(cluster.longTail || []).slice(0, 8).join(", ");
  }
  var bridgeFooter = renderBridgeHtml(bridge, { variant: "footer" });
  var cta = bridgeFooter;
  var faqHtml = renderFaq(a.faq);
  var moneyLinks = moneyLinksHtml(cluster);
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
  links = links + moneyLinks;

  var robots = robotsMetaForArticle(a);
  var ogImage = resolveOgImage(a);
  var heroHtml = renderHero(a.heroImage);
  return (
    '<!doctype html>\n<html lang="fr">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  ' +
    franceMetaBlock() +
    '\n  <meta name="robots" content="' +
    robots +
    '" />\n  <title>' +
    esc(a.title) +
    " | Leads Opportunities</title>\n  <meta name=\"description\" content=\"" +
    esc(a.description) +
    '" />\n  <meta name="keywords" content="' +
    esc(keywordsMeta) +
    '" />\n  <link rel="canonical" href="' +
    canonical +
    '" />\n  ' +
    googleSiteVerificationMeta() +
    '\n  <meta property="og:title" content="' +
    esc(a.title) +
    '" />\n  <meta property="og:description" content="' +
    esc(a.description) +
    '" />\n  <meta property="og:type" content="article" />\n  <meta property="og:url" content="' +
    canonical +
    '" />\n  <meta property="og:image" content="' +
    esc(ogImage) +
    '" />\n  <meta property="og:image:width" content="1280" />\n  <meta property="og:image:height" content="720" />\n  <link rel="alternate" type="application/rss+xml" title="Blog" href="/blog/feed.xml" />\n  <script async src="https://www.googletagmanager.com/gtag/js?id=G-JX8E35693F"></script>\n  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag(\'js\',new Date());gtag(\'config\',\'G-JX8E35693F\');</script>\n  <script src="/api/google-config-env"></script>\n  <script src="../google-config.js"></script>\n  ' +
    CLARITY_HEAD +
    '\n  <script src="/js/clarity-init.js" defer></script>\n  <link rel="stylesheet" href="' +
    BLOG_CSS +
    '" />\n</head>\n<body data-blog-page="article" data-blog-article="' +
    esc(a.file) +
    '" data-blog-section="' +
    esc(a.section) +
    '" data-blog-tag="' +
    esc(a.tag) +
    '" data-market-intent="FR">\n  <header class="blog-topbar">\n    <div class="blog-topbar-inner">\n      <a class="blog-back" href="./index.html">\n        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>\n        Blog\n      </a>\n      ' +
    blogLogoBlock() +
    '\n    </div>\n  </header>\n  <main class="blog-container">\n    <div class="article-header">\n      <div class="article-tag ' +
    a.tagClass +
    '">' +
    esc(a.tag) +
    '</div>\n      <h1>' +
    a.title +
    '</h1>\n      <p class="article-meta">' +
    a.meta +
    " &middot; Par l'equipe Leads Opportunities</p>\n    </div>\n" +
    heroHtml +
    '    <div class="article-body">\n' +
    body +
    cta +
    faqHtml +
    links +
    '    </div>\n  </main>\n  <footer class="blog-footer">\n    <a href="../assurances/">Toutes nos assurances</a>\n    <a href="../index.html#contact">Demande de rappel</a>\n  </footer>\n  <script src="../js/attribution.js" defer></script>\n  <script src="../js/blog-reading-analytics.js" defer></script>\n  <script src="../js/blog-questionnaire-bridge.js" defer></script>\n' +
    renderJsonLd(a, canonical) +
    "</body>\n</html>\n"
  );
}

var created = 0;
var skipped = 0;

manifest.articles.forEach(function (raw) {
  if (raw.skipGenerate) {
    skipped++;
    return;
  }
  var out = path.join(blogDir, raw.file);
  if (fs.existsSync(out) && !force) {
    skipped++;
    return;
  }
  var override = getOverride(raw.file);
  var a = enrichArticle(raw, override);
  a = applyArticleImages(a);
  if (!a.blocks || !a.blocks.length) {
    console.warn("skip (no blocks):", raw.file);
    return;
  }
  a._manifestBlocks = raw.blocks || [];
  fs.writeFileSync(out, renderArticle(a));
  created++;
  console.log("written:", raw.file, "—", a.blocks.length, "blocs,", (a.faq || []).length, "FAQ");
});

console.log("Done — created:", created, "skipped:", skipped);
