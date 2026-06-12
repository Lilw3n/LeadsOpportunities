const fs = require("fs");
const path = require("path");

const calendarPath = path.join(__dirname, "..", "data", "blog-editorial-calendar.json");

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function assertIsoDate(value, label) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) {
    throw new Error(label + " doit etre au format YYYY-MM-DD");
  }
}

function resolvePublishDate(opts) {
  opts = opts || {};
  var date = opts.date || process.env.BLOG_PUBLISH_DATE || todayIso();
  assertIsoDate(date, "BLOG_PUBLISH_DATE");
  return date;
}

function loadCalendar() {
  if (!fs.existsSync(calendarPath)) {
    return { cadence: "", articles: [] };
  }
  var raw = JSON.parse(fs.readFileSync(calendarPath, "utf8"));
  if (!Array.isArray(raw.articles)) {
    throw new Error("data/blog-editorial-calendar.json doit contenir un tableau articles");
  }
  raw.articles.forEach(function (entry, index) {
    validateEntry(entry, index);
  });
  return raw;
}

function validateEntry(entry, index) {
  var prefix = "Article calendrier #" + (index + 1);
  ["file", "section", "title", "description", "tag", "tagClass", "publishAt"].forEach(function (key) {
    if (!entry[key]) {
      throw new Error(prefix + " : champ requis manquant (" + key + ")");
    }
  });
  assertIsoDate(entry.publishAt, prefix + " publishAt");
  if (!Array.isArray(entry.blocks) || entry.blocks.length < 3) {
    throw new Error(prefix + " : blocks doit contenir au moins 3 blocs");
  }
  if (!Array.isArray(entry.related) || entry.related.length < 2) {
    throw new Error(prefix + " : related doit contenir au moins 2 liens");
  }
}

function articleFromEntry(entry) {
  var article = Object.assign({}, entry);
  delete article.status;
  delete article.notes;
  article.publishedAt = article.publishedAt || article.publishAt;
  article.updatedAt = article.updatedAt || article.publishedAt;
  article.meta = article.meta || "8 min · " + article.publishAt.slice(0, 7);
  return article;
}

function isPublishable(entry, date) {
  var status = entry.status || "scheduled";
  if (status === "draft" || status === "paused") return false;
  return entry.publishAt <= date;
}

function byPublishDateDesc(a, b) {
  if (a.publishAt !== b.publishAt) return a.publishAt < b.publishAt ? 1 : -1;
  return a.file.localeCompare(b.file);
}

function listDueArticles(opts) {
  var date = resolvePublishDate(opts);
  return loadCalendar()
    .articles.filter(function (entry) {
      return isPublishable(entry, date);
    })
    .sort(byPublishDateDesc)
    .map(articleFromEntry);
}

function listFutureArticles(opts) {
  var date = resolvePublishDate(opts);
  return loadCalendar()
    .articles.filter(function (entry) {
      return (entry.status || "scheduled") !== "draft" && entry.publishAt > date;
    })
    .sort(function (a, b) {
      if (a.publishAt !== b.publishAt) return a.publishAt > b.publishAt ? 1 : -1;
      return a.file.localeCompare(b.file);
    });
}

module.exports = {
  calendarPath: calendarPath,
  loadCalendar: loadCalendar,
  listDueArticles: listDueArticles,
  listFutureArticles: listFutureArticles,
  resolvePublishDate: resolvePublishDate,
};
