const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const manifest = require("./blog-articles-manifest.cjs");
const {
  listDueArticles,
  listFutureArticles,
  resolvePublishDate,
} = require("./blog-editorial-calendar.cjs");

const blogDir = path.join(__dirname, "..", "blog");
const force = process.argv.includes("--force");
const dateArg = process.argv.find(function (arg) {
  return arg.indexOf("--date=") === 0;
});
const date = resolvePublishDate({ date: dateArg ? dateArg.slice("--date=".length) : null });

function findDuplicates(articles) {
  var seen = {};
  var duplicates = [];
  articles.forEach(function (article) {
    if (seen[article.file] && duplicates.indexOf(article.file) === -1) {
      duplicates.push(article.file);
    }
    seen[article.file] = true;
  });
  return duplicates;
}

function missingGeneratedFiles(articles) {
  return articles.filter(function (article) {
    return !fs.existsSync(path.join(blogDir, article.file));
  });
}

var duplicates = findDuplicates(manifest.articles);
if (duplicates.length) {
  console.error("Doublons d'articles detectes :", duplicates.join(", "));
  process.exit(1);
}

var due = listDueArticles({ date: date });
var future = listFutureArticles({ date: date });
var missing = missingGeneratedFiles(due);

console.log("Calendrier blog :", due.length, "article(s) publiable(s) au", date);
due.forEach(function (article) {
  console.log(" -", article.publishAt, article.file);
});
if (future.length) {
  console.log("Prochains articles :");
  future.slice(0, 5).forEach(function (article) {
    console.log(" -", article.publishAt, article.file);
  });
}

if (!force && missing.length === 0) {
  console.log("Aucun nouvel article a generer.");
  process.exit(0);
}

if (missing.length) {
  console.log("Articles manquants a generer :", missing.map(function (article) {
    return article.file;
  }).join(", "));
}

var result = spawnSync("npm", ["run", "blog:build"], {
  cwd: path.join(__dirname, ".."),
  env: Object.assign({}, process.env, { BLOG_PUBLISH_DATE: date }),
  stdio: "inherit",
});

process.exit(result.status || 0);
