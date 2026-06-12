const fs = require("fs");
const path = require("path");
const manifest = require("./blog-articles-manifest.cjs");
const { listAdminRows } = require("./blog-questionnaire-bridge.cjs");

var rows = listAdminRows(manifest.articles.filter(function (a) {
  return !a.skipGenerate;
}));
var sections = [];
rows.forEach(function (r) {
  if (sections.indexOf(r.section) === -1) sections.push(r.section);
});
sections.sort();

function articleDate(article) {
  return article.updatedAt || article.publishedAt || article.publishAt || "2026-06-11";
}

var updated = manifest.articles.reduce(function (latest, article) {
  var date = articleDate(article);
  return date > latest ? date : latest;
}, "2026-06-11");

var out = {
  updated: updated,
  sections: sections,
  rows: rows,
};

var dest = path.join(__dirname, "..", "data", "blog-questionnaire-admin.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n");
console.log("written:", dest, "—", rows.length, "articles");
