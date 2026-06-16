/**
 * Articles actu en attente — évite dépendance circulaire avec le manifeste.
 */
const fs = require("fs");
const path = require("path");

const DATA = path.join(__dirname, "..", "data", "blog-actu-pending.json");

function readPending() {
  try {
    return JSON.parse(fs.readFileSync(DATA, "utf8"));
  } catch (e) {
    return { articles: [] };
  }
}

function stripForManifest(article) {
  var copy = Object.assign({}, article);
  delete copy._scaffold;
  delete copy._needsAgentEnrichment;
  delete copy.source;
  return copy;
}

function loadPendingArticles() {
  var pending = readPending();
  return (pending.articles || []).map(stripForManifest);
}

function appendPendingArticle(article) {
  var pending = readPending();
  var clean = stripForManifest(article);
  var exists = pending.articles.some(function (a) {
    return a.file === clean.file;
  });
  if (!exists) pending.articles.push(clean);
  pending.updated = new Date().toISOString();
  fs.writeFileSync(DATA, JSON.stringify(pending, null, 2) + "\n");
  return clean;
}

module.exports = {
  loadPendingArticles: loadPendingArticles,
  appendPendingArticle: appendPendingArticle,
  stripForManifest: stripForManifest,
  readPending: readPending,
};
