#!/usr/bin/env node
var fs = require("fs");
var path = require("path");
var root = path.join(__dirname, "..");
var failed = 0;
function ok(c, m) {
  if (!c) {
    failed++;
    console.log("FAIL", m);
  } else console.log("OK  ", m);
}
function read(r) {
  return fs.readFileSync(path.join(root, r), "utf8");
}
var diag = read("js/clarity-click-diagnostics.mjs");
ok(diag.indexOf("bindCardPrimaryClicks") >= 0, "bindCardPrimaryClicks");
ok(diag.indexOf("data-card-href") >= 0, "data-card-href support");
ok(diag.indexOf("href='#']") >= 0 || diag.indexOf('href="#"]') >= 0, "href # non actionable");
var init = read("js/clarity-init.js");
ok(init.indexOf("bindCardPrimaryClicks") >= 0 || init.indexOf("data-card-href") >= 0, "bundle clarity contient card clicks");
var partners = read("js/public-partner-sites.js");
ok(
  !/href\s*=\s*["']#["']/.test(partners.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "")),
  "plus de href=# partenaires"
);
ok(partners.indexOf("sites-partenaires") >= 0, "fallback catalogue partenaires");
var index = read("index.html");
ok(index.indexOf("data-card-href") >= 0 && index.indexOf("js-card-nav") >= 0, "cartes SEO navigables");
var css = read("main.css");
ok(css.indexOf("article.service-card:hover") >= 0, "pas de faux hover article");
ok(css.indexOf("témoignage non cliquable") >= 0 || css.indexOf("testimonial-card:hover") >= 0, "témoignages sans lift");
var immo = read("js/crm-immo-properties-page.js");
ok(immo.indexOf("data-card-href") >= 0, "cartes piges navigables");
var docs = read("docs/CLARITY-DIAGNOSTICS.md");
ok(docs.indexOf("Dead click") >= 0 || docs.indexOf("dead click") >= 0, "doc explique dead clicks");
if (failed) {
  console.log(failed + " échec(s)");
  process.exit(1);
}
console.log("\nOK verify-dead-clicks");
