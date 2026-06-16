#!/usr/bin/env node
/**
 * Archive les articles pending déjà générés en HTML → blog-actu-published.json
 * Usage: npm run blog:actu:archive
 */
const fs = require("fs");
const path = require("path");
const { readPending, stripForManifest } = require("./blog-actu-pending.cjs");

var ROOT = path.join(__dirname, "..");
var blogDir = path.join(ROOT, "blog");
var PUBLISHED = path.join(ROOT, "data", "blog-actu-published.json");

function readPublished() {
  try {
    return JSON.parse(fs.readFileSync(PUBLISHED, "utf8"));
  } catch (e) {
    return { articles: [] };
  }
}

function main() {
  var pending = readPending();
  var published = readPublished();
  var pubFiles = {};
  (published.articles || []).forEach(function (a) {
    pubFiles[a.file] = true;
  });

  var moved = 0;
  var remaining = [];

  (pending.articles || []).forEach(function (a) {
    var htmlPath = path.join(blogDir, a.file);
    if (fs.existsSync(htmlPath) && !pubFiles[a.file]) {
      published.articles = published.articles || [];
      published.articles.push(stripForManifest(a));
      pubFiles[a.file] = true;
      moved++;
    } else if (!fs.existsSync(htmlPath)) {
      remaining.push(a);
    } else {
      remaining.push(a);
    }
  });

  pending.articles = remaining.filter(function (a) {
    return !pubFiles[a.file] || !fs.existsSync(path.join(blogDir, a.file));
  });
  pending.articles = remaining;

  published.updated = new Date().toISOString();
  pending.updated = new Date().toISOString();
  fs.writeFileSync(PUBLISHED, JSON.stringify(published, null, 2) + "\n");
  fs.writeFileSync(path.join(ROOT, "data", "blog-actu-pending.json"), JSON.stringify(pending, null, 2) + "\n");
  console.log("Archivé:", moved, "| Pending restant:", pending.articles.length, "| Publiés total:", published.articles.length);
}

main();
