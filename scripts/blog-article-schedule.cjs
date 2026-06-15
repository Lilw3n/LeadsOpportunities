const DEFAULT_BUILD_DATE = new Date().toISOString().slice(0, 10);

function readBuildDate() {
  var raw = process.env.BLOG_BUILD_DATE || DEFAULT_BUILD_DATE;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    throw new Error("BLOG_BUILD_DATE must use YYYY-MM-DD format");
  }
  return raw;
}

function isPublished(article, buildDate) {
  return !article.publishAt || article.publishAt <= buildDate;
}

function getPublishedArticles(manifest, buildDate) {
  var date = buildDate || readBuildDate();
  return manifest.articles.filter(function (article) {
    return isPublished(article, date);
  });
}

function getFutureArticles(manifest, buildDate) {
  var date = buildDate || readBuildDate();
  return manifest.articles
    .filter(function (article) {
      return article.publishAt && article.publishAt > date;
    })
    .sort(function (a, b) {
      return a.publishAt.localeCompare(b.publishAt);
    });
}

function articleDate(article, fallbackDate) {
  return article.updatedAt || article.publishAt || fallbackDate || readBuildDate();
}

function rssDate(article, fallbackDate) {
  var iso = articleDate(article, fallbackDate);
  return new Date(iso + "T09:00:00Z").toUTCString();
}

module.exports = {
  readBuildDate,
  getPublishedArticles,
  getFutureArticles,
  articleDate,
  rssDate,
};
