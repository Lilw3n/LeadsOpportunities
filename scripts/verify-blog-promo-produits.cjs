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

assert(exists("scripts/blog-promo-produits-articles.cjs"), "module promo produits");
assert(
  read("scripts/blog-articles-manifest.cjs").indexOf("blog-promo-produits-articles") !== -1,
  "manifest charge promo produits"
);

var articles = require("./blog-promo-produits-articles.cjs");
assert(articles.length >= 8, "au moins 8 articles promo");

var vtc = articles.filter(function (a) {
  return a.section === "vtc";
});
assert(vtc.length >= 5, "au moins 5 articles VTC");

var files = {};
articles.forEach(function (a) {
  assert(a.file && a.title && a.blocks && a.blocks.length, "article complet " + (a.file || "?"));
  assert(!files[a.file], "slug unique " + a.file);
  files[a.file] = true;
  assert(/landings\/(vtc|sante|credit-immo|vsp|questionnaire|devis)/.test(JSON.stringify(a)), "CTA landing " + a.file);
  assert(a.cta && a.cta.href, "cta " + a.file);
});

assert(files["assurance-vtc-ile-de-france-paris-cdg-orly-2026.html"], "article VTC IDF");
assert(files["devis-assurance-vtc-rappel-15-min-courtier-orias.html"], "article devis VTC");
assert(files["mutuelle-sante-comparer-avant-renouvellement-2026.html"], "article mutuelle");
assert(files["credit-immobilier-courtier-accompagnement-2026.html"], "article crédit");

var csv = read("ads/meta-blog-conversions.csv");
assert(csv.indexOf("assurance-vtc-ile-de-france-paris-cdg-orly-2026") !== -1, "Meta CSV VTC IDF");
assert(csv.indexOf("devis-assurance-vtc-rappel-15-min-courtier-orias") !== -1, "Meta CSV devis VTC");

console.log("\nBlog promo produits (VTC+) : OK —", articles.length, "articles.");
