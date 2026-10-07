#!/usr/bin/env node
"use strict";

var fs = require("fs");
var path = require("path");
var root = path.join(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL", msg);
    process.exit(1);
  }
  console.log("OK  ", msg);
}

assert(exists("scripts/blog-pubs-pack-articles.cjs"), "module pubs pack");
assert(
  read("scripts/blog-articles-manifest.cjs").indexOf("blog-pubs-pack-articles") !== -1,
  "manifest charge pubs pack"
);

var articles = require("./blog-pubs-pack-articles.cjs");
assert(articles.length === 4, "4 articles pubs pack");

var expected = [
  "assurance-auto-tarifs-2026-comparer-sans-surpayer.html",
  "assurance-auto-resilier-loi-hamon-comparer-2026.html",
  "assurance-habitation-degat-des-eaux-que-faire-2026.html",
  "assurance-emprunteur-changer-economiser-2026.html",
];

expected.forEach(function (f) {
  assert(
    articles.some(function (a) {
      return a.file === f;
    }),
    "définition " + f
  );
  assert(exists("blog/" + f), "HTML généré " + f);
  assert(read("blog/" + f).indexOf("<article") !== -1 || read("blog/" + f).indexOf("article") !== -1, "contenu " + f);
});

var csv = read("ads/meta-blog-conversions.csv");
assert(csv.indexOf("assurance-auto-tarifs-2026-comparer-sans-surpayer") !== -1, "CSV auto tarifs");
assert(csv.indexOf("assurance-auto-resilier-loi-hamon-comparer-2026") !== -1, "CSV auto hamon");
assert(csv.indexOf("assurance-habitation-degat-des-eaux-que-faire-2026") !== -1, "CSV degat eaux");
assert(csv.indexOf("assurance-emprunteur-changer-economiser-2026") !== -1, "CSV emprunteur");

assert(exists("data/blog-pubs-catalog.json"), "catalogue pubs");
var catalog = JSON.parse(read("data/blog-pubs-catalog.json"));
assert(
  catalog.items.some(function (it) {
    return it.slug === "assurance-auto-tarifs-2026-comparer-sans-surpayer";
  }),
  "catalogue inclut auto tarifs"
);

var pkg = read("package.json");
assert(pkg.indexOf("verify:blog-pubs-pack") !== -1, "npm verify:blog-pubs-pack");

console.log("\nverify-blog-pubs-pack: OK");
