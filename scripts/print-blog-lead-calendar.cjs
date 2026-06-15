const manifest = require("./blog-articles-manifest.cjs");
const calendar = require("./blog-lead-article-calendar.cjs");
const { readBuildDate, getPublishedArticles, getFutureArticles } = require("./blog-article-schedule.cjs");

var buildDate = readBuildDate();
var scheduled = calendar.articles.slice().sort(function (a, b) {
  return a.publishAt.localeCompare(b.publishAt);
});
var publishedFiles = new Set(
  getPublishedArticles(manifest, buildDate).map(function (article) {
    return article.file;
  })
);
var future = getFutureArticles(manifest, buildDate);

console.log("Calendrier articles lead-gen");
console.log("Build date:", buildDate);
console.log("Cadence:", calendar.cadence.frequency, "(", calendar.cadence.recommendedDay, ")");
console.log("Objectif:", calendar.cadence.goal);
console.log("");

scheduled.forEach(function (article) {
  var status = publishedFiles.has(article.file) ? "published" : "scheduled";
  console.log(
    [
      article.publishAt,
      status,
      article.section,
      article.leadIntent,
      article.file,
    ].join(" | ")
  );
});

console.log("");
console.log("Articles planifies non publies:", future.length);
