#!/usr/bin/env node
/**
 * Génère assurances-niches.html — hub public indexable (stratégie visibilité niches).
 * Usage: node scripts/generate-assurances-niches-page.cjs
 */
const fs = require("fs");
const path = require("path");
const niches = require("../seo/niches.json");
const markets = require("../data/seo-niche-markets.json");
const { SITE_ORIGIN: SITE } = require("./site-url.cjs");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "assurances-niches.html");

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

var live = niches.niches.filter(function (n) {
  return n.status === "live";
});
var planned = niches.niches.filter(function (n) {
  return n.status === "planned";
});

function card(n) {
  var links = (n.quickLinks || [])
    .map(function (l) {
      return '<a href="' + esc(l.href) + '">' + esc(l.label) + "</a>";
    })
    .join(" · ");
  var kw = (n.keywords || []).slice(0, 4).join(", ");
  return (
    '<article class="niche-card niche-card--live">\n' +
    '  <div class="niche-card-emoji">' +
    esc(n.emoji || "") +
    "</div>\n" +
    "  <h2>" +
    esc(n.label) +
    '</h2>\n  <p class="niche-tagline">' +
    esc(n.tagline) +
    "</p>\n" +
    '  <p class="niche-meta"><strong>' +
    (n.pageCount || "?") +
    " pages SEO</strong> · " +
    esc(kw) +
    "</p>\n" +
    '  <div class="niche-links">' +
    links +
    "</div>\n" +
    '  <a class="btn btn-sm" href="' +
    esc(n.landing) +
    '">Devis ' +
    esc(n.label.split(" ").slice(-1)[0] || "gratuit") +
    "</a>\n" +
    "</article>\n"
  );
}

function plannedRow(n) {
  var m = markets.markets.find(function (x) {
    return x.id === n.id;
  });
  var ready = m && m.questionnaireReady ? "Questionnaire prêt" : "À venir";
  return (
    "<tr>\n" +
    "  <td>" +
    esc(n.emoji + " " + n.label) +
    "</td>\n" +
    "  <td>" +
    esc((n.keywords || []).join(", ")) +
    "</td>\n" +
    "  <td>" +
    esc(n.eta || "—") +
    "</td>\n" +
    "  <td>" +
    esc(ready) +
    "</td>\n" +
    "  <td>" +
    (n.landing ? '<a href="' + esc(n.landing) + '">Demander un devis</a>' : "—") +
    "</td>\n" +
    "</tr>\n"
  );
}

function blogSlugLabel(u) {
  return String(u)
    .replace(/^\/blog\//, "")
    .replace(/\.html$/, "")
    .replace(/-/g, " ");
}

function blogList(urls, title) {
  if (!urls || !urls.length) return "";
  var items = urls
    .map(function (u) {
      return '<li><a href="' + esc(u) + '">' + esc(blogSlugLabel(u)) + "</a></li>";
    })
    .join("\n");
  return "<h2>" + esc(title) + '</h2>\n<ul class="niche-blog-list">\n' + items + "</ul>\n";
}

var liveBlogBlocks = live
  .map(function (n) {
    var m = markets.markets.find(function (x) {
      return x.id === n.id;
    });
    if (!m || !(m.blogUrls || []).length) return "";
    return (
      '<section class="niche-blog-block">\n<h3>' +
      esc(n.label) +
      " — guides SEO</h3>\n<ul>\n" +
      (m.blogUrls || [])
        .map(function (u) {
          return "<li><a href=\"" + esc(u) + "\">" + esc(blogSlugLabel(u)) + "</a></li>";
        })
        .join("\n") +
      "</ul>\n</section>\n"
    );
  })
  .join("");

var html =
  '<!doctype html>\n<html lang="fr">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>Assurances de niche France 2026 | Chasse, équitation, animaux | Leads Opportunities</title>\n  <meta name="description" content="Assurances peu concurrentielles : chien, chat, chasse, équitation, instrument, bateau… 900+ pages SEO par ville. Courtier ORIAS, devis gratuit." />\n  <meta name="keywords" content="assurance niche, assurance chasse, assurance équitation, assurance chien pas cher, rc chasseur, assurance cheval" />\n  <meta name="robots" content="index,follow" />\n  <link rel="canonical" href="' +
  SITE +
  '/assurances-niches.html" />\n  <meta property="og:title" content="Assurances de niche — percer sur Google sans se battre sur la mutuelle" />\n  <meta property="og:description" content="Chasse, équitation, animaux : silos SEO 189 villes. Devis courtier ORIAS." />\n  <meta property="og:url" content="' +
  SITE +
  '/assurances-niches.html" />\n  <meta property="og:image" content="' +
  SITE +
  '/og/og-animaux.jpg" />\n  <meta property="og:type" content="website" />\n  <meta name="google-site-verification" content="I3CAH3KoD216Gpr7VbJ6-p3IM4vGizTzxW0HsqG-HKU" />\n  <link rel="stylesheet" href="./main.css" />\n  <link rel="stylesheet" href="./css/assurances-hub.css" />\n  <style>\n    .niche-hub-intro{max-width:720px;color:#64748b;margin-bottom:2rem;line-height:1.6}\n    .niche-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.25rem;margin:2rem 0}\n    .niche-card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:1.25rem}\n    .niche-card--live{border-color:#99f6e4;box-shadow:0 4px 20px rgba(15,118,110,.08)}\n    .niche-card-emoji{font-size:2rem;margin-bottom:.5rem}\n    .niche-tagline{color:#475569;font-size:.95rem;margin:.5rem 0}\n    .niche-meta{font-size:.85rem;color:#64748b}\n    .niche-links{margin:1rem 0;font-size:.9rem;display:flex;flex-wrap:wrap;gap:.35rem}\n    .niche-links a{color:#0d9488}\n    .niche-table{width:100%;border-collapse:collapse;font-size:.9rem;margin-top:1rem}\n    .niche-table th,.niche-table td{border:1px solid #e2e8f0;padding:.6rem .75rem;text-align:left}\n    .niche-table th{background:#f8fafc}\n    .niche-alert{background:#fef3c7;border:1px solid #fcd34d;border-radius:12px;padding:1rem 1.25rem;margin:1.5rem 0}\n    .niche-blog-list,.niche-blog-block ul{line-height:1.7;margin:0.75rem 0 1.5rem}\n    .niche-blog-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem;margin:1rem 0 2rem}\n    .niche-blog-block{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:1rem 1.15rem}\n    .niche-blog-block h3{margin:0 0 0.5rem;font-size:1.05rem}\n  </style>\n  <script async src="https://www.googletagmanager.com/gtag/js?id=G-JX8E35693F"></script>\n  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag(\'js\',new Date());gtag(\'config\',\'G-JX8E35693F\');</script>\n</head>\n<body data-market-intent="FR">\n  <header class="topbar">\n    <div class="container nav">\n      <a class="logo" href="./index.html">Leads Opportunities</a>\n      <nav>\n        <a href="./assurances/">Catalogue</a>\n        <a href="./blog/">Blog</a>\n        <a class="btn btn-nav" href="./index.html#contact">Devis</a>\n      </nav>\n    </div>\n  </header>\n  <main class="container" style="padding:2rem 0 4rem">\n    <span class="section-badge section-badge-featured">Stratégie visibilité 2026</span>\n    <h1>Assurances de <span class="text-gradient">niche</span> — moins de concurrence sur Google</h1>\n    <p class="niche-hub-intro">Les comparateurs généralistes dominent « mutuelle » et « assurance auto ». Nous ciblons les <strong>requêtes longue traîne</strong> : assurance chasse, RC équestre, chien pas cher, instrument pro… <strong>' +
  live.length +
  " niches actives</strong>, " +
  (niches.hub.stats.seoPagesApprox || "900+") +
  ' pages SEO dont pages par ville.</p>\n    <div class="niche-alert"><strong>Pas visible sur Google ?</strong> Normal si le domaine est récent. Indexez d\'abord <a href="./">l\'accueil</a> et les piliers ci-dessous via <a href="https://search.google.com/search-console">Search Console</a> — voir <code>docs/PLAN-VISIBILITE-NICHES.md</code>.</div>\n    <h2>Niches en ligne (devis disponible)</h2>\n    <div class="niche-grid">\n' +
  live.map(card).join("") +
  '    </div>\n    <h2>Prochaines niches (questionnaire ou silo à venir)</h2>\n    <table class="niche-table">\n      <thead><tr><th>Niche</th><th>Mots-clés cibles</th><th>ETA</th><th>Statut</th><th>Action</th></tr></thead>\n      <tbody>\n' +
  planned.map(plannedRow).join("") +
  "      </tbody>\n    </table>\n" +
  blogList(markets.blogActuNiches, "Actu & longue traîne (indexation prioritaire)") +
  (liveBlogBlocks
    ? "<h2>Guides par niche live</h2>\n<div class=\"niche-blog-grid\">" + liveBlogBlocks + "</div>\n"
    : "") +
  '    <p style="margin-top:2rem"><a href="./assurances/">← Toutes nos assurances (VTC, mutuelle, crédit)</a> · <a href="./methode.html">Notre méthode ORIAS</a> · <a href="./blog/">Blog</a></p>\n  </main>\n  <footer class="footer"><div class="container footer-bottom"><small>&copy; 2026 Leads Opportunities · ORIAS 15005935</small></div></footer>\n  <script type="application/ld+json">' +
  JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Assurances de niche France",
    url: SITE + "/assurances-niches.html",
    description: "Catalogue niches assurance : animaux, chasse, équitation, voiture sans permis et roadmap.",
    provider: { "@type": "InsuranceAgency", name: "Leads Opportunities" },
  }) +
  "</script>\n</body>\n</html>\n";

fs.writeFileSync(OUT, html, "utf8");
console.log("Written", OUT, "—", live.length, "live,", planned.length, "planned");
