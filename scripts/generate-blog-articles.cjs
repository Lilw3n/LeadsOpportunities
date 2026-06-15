const fs = require("fs");
const path = require("path");
const manifest = require("./blog-articles-manifest.cjs");
const { enrichArticle } = require("./blog-seo-enrich.cjs");
const { getOverride } = require("./blog-content-deep.cjs");
const { SITE_ORIGIN: base } = require("./site-url.cjs");
const { resolveBridge, renderBridgeHtml } = require("./blog-questionnaire-bridge.cjs");

const blogDir = path.join(__dirname, "..", "blog");
const force = process.argv.includes("--force");

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderBlock(b, bridge) {
  if (b.type === "bridge" && bridge) return renderBridgeHtml(bridge, { variant: "mid" });
  if (b.type === "h2") return "      <h2>" + b.text + "</h2>\n";
  if (b.type === "h3") return "      <h3>" + b.text + "</h3>\n";
  if (b.type === "p") return "      <p>" + b.text + "</p>\n";
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
  var datePublished = a.publishedAt || "2026-05-01";
  var dateModified = a.updatedAt || datePublished || "2026-05-28";
  var graph = [
    {
      "@type": "Article",
      headline: a.title,
      description: a.description,
      author: { "@type": "Organization", name: "Leads Opportunities" },
      publisher: { "@type": "Organization", name: "Leads Opportunities" },
      mainEntityOfPage: canonical,
      datePublished: datePublished,
      dateModified: dateModified,
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
  var keywordsMeta = (a.keywords || []).join(", ");
  var bridgeFooter = renderBridgeHtml(bridge, { variant: "footer" });
  var cta = bridgeFooter;
  var faqHtml = renderFaq(a.faq);
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
    '" />\n  <meta name="keywords" content="' +
    esc(keywordsMeta) +
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
    faqHtml +
    links +
    '    </div>\n  </main>\n  <footer class="blog-footer">\n    <a href="../assurances/">Toutes nos assurances</a>\n    <a href="../index.html#contact">Demande de rappel</a>\n  </footer>\n  <script src="../js/blog-questionnaire-bridge.js" defer></script>\n' +
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
