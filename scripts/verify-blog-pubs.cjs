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

assert(exists("ads/meta-blog-conversions.csv"), "CSV meta-blog-conversions");
assert(exists("scripts/build-blog-pubs-catalog.cjs"), "build catalog script");
assert(exists("crm-blog-pubs.html"), "crm-blog-pubs.html");
assert(exists("crm-blog-pubs.js"), "crm-blog-pubs.js");
assert(exists("crm-blog-pubs.css"), "crm-blog-pubs.css");

require("./build-blog-pubs-catalog.cjs");
assert(exists("data/blog-pubs-catalog.json"), "catalog JSON généré");

var catalog = JSON.parse(read("data/blog-pubs-catalog.json"));
assert(Array.isArray(catalog.items) && catalog.items.length >= 20, "≥ 20 créas dans le catalogue");
assert(catalog.counts && catalog.counts.total === catalog.items.length, "counts.total cohérent");
assert(
  catalog.items.some(function (it) {
    return it.vertical === "vtc" && it.primary_text;
  }),
  "au moins une créa VTC avec texte"
);
assert(
  catalog.items.some(function (it) {
    return it.destination_type === "blog_then_bridge";
  }),
  "créas blog_then_bridge présentes"
);

var html = read("crm-blog-pubs.html");
assert(html.indexOf("blogPubsGrid") !== -1, "grille HTML");
assert(html.indexOf("crm-blog-pubs.js") !== -1, "script page");
assert(html.indexOf("crm-blog-pubs.css") !== -1, "css page");

var js = read("crm-blog-pubs.js");
assert(js.indexOf("blog-pubs-catalog.json") !== -1, "JS charge le catalogue");
assert(js.indexOf("js-copy") !== -1, "boutons copier");

var sidebar = read("js/crm-sidebar.js");
assert(sidebar.indexOf("crm-blog-pubs.html") !== -1, "lien sidebar");

var pubs = read("crm-pubs.html");
assert(pubs.indexOf("crm-blog-pubs.html") !== -1, "lien depuis Gestion pubs");

var shell = read("js/crm-subpage-shell.js");
assert(shell.indexOf("crm-blog-pubs.html") !== -1, "meta sous-page shell");

var pkg = read("package.json");
assert(pkg.indexOf("verify:blog-pubs") !== -1, "script npm verify:blog-pubs");
assert(pkg.indexOf("blog:pubs:catalog") !== -1, "script npm blog:pubs:catalog");

console.log("\nverify-blog-pubs: OK");
