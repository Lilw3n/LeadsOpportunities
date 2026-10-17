/**
 * Bloc visible « articles métiers » — blog et catalogue assurances.
 * prefix : "./" depuis /blog/, "../blog/" depuis /assurances/.
 */
var pro = require("./blog-pro-metiers-articles.cjs");
var suite = require("./blog-metiers-suite-articles.cjs");

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function articles() {
  return pro.concat(suite);
}

function html(prefix) {
  var list = articles();
  var cards = list
    .map(function (a) {
      return (
        '      <a class="metier-blog-card" href="' +
        prefix +
        a.file +
        '"><span>' +
        esc(a.tag) +
        "</span><strong>" +
        esc(a.title) +
        "</strong></a>\n"
      );
    })
    .join("");
  return (
    '    <section class="metier-blog-shelf" id="articles-metiers">\n' +
    '      <div class="metier-blog-shelf-head">\n' +
    "        <h2>Articles des métiers</h2>\n" +
    "        <p><strong>" +
    list.length +
    "</strong> guides : garage, MRP, RC Pro, décennale, bâtiment, transport, flotte, TNS, bateau, scolaire et les autres.</p>\n" +
    "      </div>\n" +
    '      <div class="metier-blog-grid">\n' +
    cards +
    "      </div>\n" +
    "    </section>\n"
  );
}

var CSS =
  ".metier-blog-shelf{margin:28px 0 8px;padding:18px 18px 8px;background:#f0fdfa;border:1px solid #99f6e4;border-radius:16px}" +
  ".metier-blog-shelf h2{margin:0 0 6px;font-size:1.35rem}" +
  ".metier-blog-shelf-head p{margin:0 0 14px;color:#475569}" +
  ".metier-blog-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px}" +
  ".metier-blog-card{display:block;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:12px 14px;text-decoration:none;color:#0f172a}" +
  ".metier-blog-card span{display:block;font-size:.72rem;font-weight:700;letter-spacing:.03em;text-transform:uppercase;color:#0f766e;margin-bottom:4px}" +
  ".metier-blog-card strong{font-size:.95rem;line-height:1.35}";

module.exports = { html: html, articles: articles, CSS: CSS };
