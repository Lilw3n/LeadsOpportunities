const fs = require("fs");
const path = require("path");
const manifest = require("./blog-articles-manifest.cjs");
const { listAdminRows } = require("./blog-questionnaire-bridge.cjs");
const { readBuildDate, getPublishedArticles, articleDate } = require("./blog-article-schedule.cjs");

var buildDate = readBuildDate();
var publishedArticles = getPublishedArticles(manifest, buildDate);
var rows = listAdminRows(publishedArticles.filter(function (a) {
  return !a.skipGenerate;
}));
var sections = [];
rows.forEach(function (r) {
  if (sections.indexOf(r.section) === -1) sections.push(r.section);
});
sections.sort();

var out = {
  updated: publishedArticles.reduce(function (latest, article) {
    var date = articleDate(article, "2026-05-29");
    return date > latest ? date : latest;
  }, "2026-05-29"),
  sections: sections,
  rows: rows,
};

var dest = path.join(__dirname, "..", "data", "blog-questionnaire-admin.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n");
console.log("written:", dest, "—", rows.length, "articles", "buildDate:", buildDate);
