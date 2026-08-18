#!/usr/bin/env node
/** Vérifie le contenu « prix / groupes Facebook » — blog, questionnaire, landing. */
var fs = require("fs");
var path = require("path");
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

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

var articles = require("./blog-facebook-prix-articles.cjs");
assert(articles.length >= 6, "6+ articles prix FB");

var hub = articles.find(function (a) {
  return a.file === "prix-credit-immo-questions-groupe-facebook-2026.html";
});
assert(
  hub &&
    hub.blocks.some(function (b) {
      return b.type === "h2" && /ne marche pas/i.test(b.text);
    }),
  "hub ce qui ne marche pas"
);

articles.forEach(function (a) {
  var htmlPath = path.join(root, "blog", a.file);
  assert(fs.existsSync(htmlPath), "blog genere " + a.file);
  var html = read("blog/" + a.file);
  assert(html.indexOf("bridge") >= 0 || html.indexOf("questionnaire") >= 0, a.file + " CTA");
});

var map = JSON.parse(read("data/blog-questionnaire-map.json"));
assert(map.articles["prix-credit-immo-questions-groupe-facebook-2026.html"], "bridge map hub");
assert(
  map.keywordRules.some(function (r) {
    return r.id === "prix-facebook";
  }),
  "keyword rule prix-facebook"
);

var qConfig = read("js/questionnaire-config.js");
assert(qConfig.indexOf("immoPricingConcern") >= 0, "questionnaire prix FB");
assert(qConfig.indexOf("immoPriceQuestion") >= 0, "questionnaire question libre");

var landing = read("landings/credit-immo.html");
assert(landing.indexOf("prix-facebook") >= 0, "landing section prix FB");
assert(landing.indexOf("combien-coute-courtier") >= 0, "landing lien courtier");

var gsc = read("scripts/seo-gsc-priority-urls.cjs");
assert(gsc.indexOf("prix-credit-immo-questions-groupe-facebook-2026.html") >= 0, "GSC hub prix");

process.exit(failed ? 1 : 0);
