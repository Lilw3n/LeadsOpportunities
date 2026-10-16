#!/usr/bin/env node
/** Landings des métiers qui n'avaient pas encore de page dédiée. */
var fs = require("fs");
var path = require("path");
var catalog = require("./metiers-suite-catalog.cjs");

var root = path.join(__dirname, "..");
var SITE = "https://www.leadsopportunities.fr";

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function hrefFromLanding(href) {
  if (href.indexOf("/landings/") === 0) return "." + href.slice("/landings".length);
  if (href.indexOf("/blog/") === 0) return ".." + href;
  if (href.indexOf("/") === 0) return ".." + href;
  return href;
}

function html(p) {
  var url = SITE + "/landings/" + p.file;
  var q =
    "./questionnaire.html?need=" +
    p.need +
    "&amp;journey=standard&amp;utm_source=landing&amp;utm_campaign=" +
    p.campaign;
  var devis = "./devis.html?need=" + p.need + "&amp;utm_source=landing&amp;utm_campaign=" + p.campaign;
  var points = p.points
    .map(function (item) {
      return "              <li>" + esc(item) + "</li>";
    })
    .join("\n");
  var blogHref = "../blog/" + p.blog;
  var links =
    'Guide : <a href="' +
    blogHref +
    '">' +
    esc(p.tag) +
    '</a> · <a href="../assurances-niches.html">toutes les niches</a>' +
    p.links
      .map(function (l) {
        return ' · <a href="' + hrefFromLanding(l.href) + '">' + esc(l.label) + "</a>";
      })
      .join("") +
    ' · <a href="./questionnaire.html?need=' +
    p.need +
    '&amp;journey=standard">questionnaire</a>';
  return (
    "<!doctype html>\n<html lang=\"fr\">\n<head>\n" +
    '  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n' +
    "  <title>" +
    esc(p.title) +
    "</title>\n" +
    '  <meta name="description" content="' +
    esc(p.description) +
    '" />\n' +
    '  <meta name="keywords" content="' +
    esc(p.keywords) +
    '" />\n' +
    '  <meta name="robots" content="index,follow" />\n  <meta name="geo.region" content="FR" />\n  <meta name="language" content="fr-FR" />\n' +
    '  <link rel="alternate" hreflang="fr-FR" href="' +
    url +
    '" />\n' +
    '  <link rel="alternate" hreflang="x-default" href="' +
    url +
    '" />\n' +
    '  <link rel="canonical" href="' +
    url +
    '" />\n' +
    '  <meta name="google-site-verification" content="I3CAH3KoD216Gpr7VbJ6-p3IM4vGizTzxW0HsqG-HKU" />\n' +
    '  <meta property="og:title" content="' +
    esc(p.title) +
    '" />\n' +
    '  <meta property="og:description" content="' +
    esc(p.description) +
    '" />\n' +
    '  <meta property="og:type" content="website" />\n  <meta property="og:locale" content="fr_FR" />\n' +
    '  <meta property="og:url" content="' +
    url +
    '" />\n' +
    '  <script async src="https://www.googletagmanager.com/gtag/js?id=G-JX8E35693F"></script>\n' +
    "  <script>\n    window.dataLayer = window.dataLayer || [];\n    function gtag(){dataLayer.push(arguments);}\n    gtag('js', new Date());\n    gtag('config', 'G-JX8E35693F');\n  </script>\n" +
    '  <script src="/api/google-config-env"></script>\n  <script src="../google-config.js"></script>\n  <script src="/js/clarity-init.js" defer></script>\n' +
    '  <link rel="stylesheet" href="./styles.css" />\n  <link rel="stylesheet" href="../css/geo-france-banner.css" />\n  <link rel="stylesheet" href="../css/callback-form.css" />\n  <link rel="stylesheet" href="../css/contact-pair.css" />\n' +
    "</head>\n<body data-market-intent=\"FR\" data-niche=\"landing_" +
    p.id +
    "\">\n" +
    '  <header class="landing-topbar">\n    <div class="landing-topbar-inner">\n' +
    '      <a class="landing-back" href="../assurances-niches.html">Assurances de niche</a>\n' +
    '      <a class="landing-logo" href="../index.html">Leads Opportunities</a>\n    </div>\n  </header>\n' +
    '  <main class="page">\n    <div class="container">\n      <span class="badge">' +
    esc(p.badge) +
    '</span>\n      <section class="card">\n        <div class="hero-surface">\n          <div class="hero">\n            <h1>' +
    esc(p.h1) +
    '</h1>\n            <p class="sub">' +
    esc(p.sub) +
    '</p>\n            <ul class="points">\n' +
    points +
    '\n            </ul>\n            <div class="actions">\n' +
    '              <a class="btn btn-primary" href="' +
    q +
    '">' +
    esc(p.primary) +
    "</a>\n" +
    '              <a class="btn btn-soft" href="' +
    devis +
    '">Devis express</a>\n            </div>\n          </div>\n        </div>\n' +
    '        <div data-callback-strip data-callback-need="' +
    p.need +
    '" data-callback-source="' +
    p.campaign +
    '"></div>\n' +
    '        <p class="small" style="margin-top:16px">' +
    links +
    "</p>\n      </section>\n    </div>\n  </main>\n" +
    '  <footer class="landing-footer">\n    <a href="../index.html#contact">Contact</a>\n    <a href="../mentions-legales.html">Mentions légales</a>\n' +
    "    <span>&copy; 2026 Leads Opportunities — ORIAS n&deg; 15005935</span>\n  </footer>\n" +
    '  <script src="../js/schedule-idle.js"></script>\n  <script src="../js/attribution.js"></script>\n  <script src="../js/callback-form.js"></script>\n  <script src="../js/cookie-banner.js"></script>\n  <script src="../js/geo-france-guard.js"></script>\n  <script src="../js/france-seo-meta.js"></script>\n' +
    "</body>\n</html>\n"
  );
}

catalog.forEach(function (p) {
  var dest = path.join(root, "landings", p.file);
  fs.writeFileSync(dest, html(p));
  console.log("written", dest);
});
