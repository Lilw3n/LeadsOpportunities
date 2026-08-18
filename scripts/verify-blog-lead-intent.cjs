#!/usr/bin/env node
/** Vérifie les articles intent → leads (blog-lead-intent-articles.cjs). */
var fs = require("fs");
var path = require("path");
var articles = require("./blog-lead-intent-articles.cjs");
var failed = 0;
var root = path.join(__dirname, "..");

function assert(cond, msg) {
  if (!cond) {
    failed++;
    console.log("FAIL", msg);
  } else {
    console.log("OK  ", msg);
  }
}

assert(articles.length >= 10, "au moins 10 articles lead-intent");

articles.forEach(function (a) {
  assert(a.keywords && a.keywords.length >= 3, a.file + " : keywords");
  assert(a.cta && a.cta.href.indexOf("../landings/") === 0, a.file + " : CTA landing");
  assert(fs.existsSync(path.join(root, "blog", a.file)), a.file + " : HTML généré");
  var hasBridge = (a.blocks || []).some(function (b) {
    return b.type === "bridge";
  });
  assert(hasBridge, a.file + " : bloc bridge");
  var body = (a.blocks || [])
    .filter(function (b) {
      return b.type === "p";
    })
    .map(function (b) {
      return b.text;
    })
    .join(" ");
  assert(/landings\//.test(body), a.file + " : liens leads inline");
});

var gsc = fs.readFileSync(path.join(root, "scripts/seo-gsc-priority-urls.cjs"), "utf8");
assert(gsc.indexOf("heritiers-pas-daccord") !== -1, "GSC héritiers");
assert(gsc.indexOf("taux-pret-immobilier-aout-2026") !== -1, "GSC taux août");

process.exit(failed ? 1 : 0);
