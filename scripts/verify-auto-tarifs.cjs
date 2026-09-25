#!/usr/bin/env node
"use strict";
var fs = require("fs");
var path = require("path");
var root = path.join(__dirname, "..");
var failed = 0;

function assert(cond, msg) {
  if (!cond) {
    failed++;
    console.log("FAIL", msg);
  } else {
    console.log("OK  ", msg);
  }
}

var arts = require("./blog-auto-tarifs-articles.cjs");
assert(arts.length >= 4, "au moins 4 articles auto tarifs");
arts.forEach(function (a) {
  assert(a.cta && /need=auto/.test(a.cta.href), a.file + " CTA auto");
  assert(fs.existsSync(path.join(root, "blog", a.file)), a.file + " HTML");
  var html = fs.readFileSync(path.join(root, "blog", a.file), "utf8");
  assert(/landings\/(devis|questionnaire|rappel)/.test(html), a.file + " lien landing");
});

var dash = fs.readFileSync(path.join(root, "dashboard.html"), "utf8");
assert(/filterVertical[\s\S]*value="auto">Auto/.test(dash), "dashboard filtre Auto");
assert(/value="habitation">Habitation/.test(dash), "dashboard filtre Habitation");
assert(/value="rc-pro">RC Pro/.test(dash), "dashboard filtre RC Pro");

var metaInbox = fs.readFileSync(path.join(root, "crm-meta-inbox.html"), "utf8");
assert(/value="auto">Auto/.test(metaInbox), "meta inbox Auto");

assert(fs.existsSync(path.join(root, "ads/meta-auto-tarifs.csv")), "meta-auto-tarifs.csv");
assert(fs.existsSync(path.join(root, "ads/google-auto-search.csv")), "google-auto-search.csv");
var metaCsv = fs.readFileSync(path.join(root, "ads/meta-auto-tarifs.csv"), "utf8");
assert(metaCsv.split("\n").filter(Boolean).length >= 5, "meta auto ≥ 4 annonces");
assert(/need=auto/.test(metaCsv), "meta landing need=auto");

var blogConv = fs.readFileSync(path.join(root, "ads/meta-blog-conversions.csv"), "utf8");
assert(/assurance-auto-tarifs-fous-comparer/.test(blogConv), "blog-conversions auto");

var priorite = fs.readFileSync(path.join(root, "ads/meta-priorite-vtc-pret-sante.csv"), "utf8");
assert(/auto_tarifs_comparer/.test(priorite), "priorite Meta inclut auto");

var gAds = fs.readFileSync(path.join(root, "ads/google-auto-search.csv"), "utf8");
assert(/FR_Search_Auto_Tarifs/.test(gAds), "campagne Google Auto");
assert(/comparer assurance auto/.test(gAds), "keyword comparer");

var manifest = fs.readFileSync(path.join(root, "scripts/blog-articles-manifest.cjs"), "utf8");
assert(/blog-auto-tarifs-articles/.test(manifest), "manifest charge auto tarifs");

if (failed) {
  console.log("\nverify:auto-tarifs FAILED —", failed);
  process.exit(1);
}
console.log("\nverify:auto-tarifs OK —", arts.length, "articles + pubs Meta/Google + filtre CRM");
