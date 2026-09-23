#!/usr/bin/env node
/**
 * Vérifie que l’origine prod (LO ou Buchet) expose blog CRM / stats.
 * Usage:
 *   PROD_ORIGIN=https://www.leadsopportunities.fr node scripts/verify-buchet-blog-crm.cjs
 *   PROD_ORIGIN=https://www.buchetimmobilier.com node scripts/verify-buchet-blog-crm.cjs
 */
var ORIGIN = (process.env.PROD_ORIGIN || "https://www.buchetimmobilier.com").replace(/\/$/, "");
var fs = require("fs");
var path = require("path");
var failed = 0;

function assert(cond, msg) {
  if (!cond) {
    failed++;
    console.log("FAIL", msg);
  } else {
    console.log("OK  ", msg);
  }
}

function read(rel) {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf8");
}

/* Vérifs code (toujours) */
assert(fs.existsSync(path.join(__dirname, "..", "js/site-host-brand.js")), "site-host-brand.js");
assert(read("js/site-host-brand.js").indexOf("buchetimmobilier") !== -1, "détection host buchet");
assert(read("crm-blog-stats.html").indexOf("site-host-brand.js") !== -1, "CRM stats charge site-host-brand");
assert(read("crm-blog-stats.js").indexOf("article_title") !== -1 || read("crm-blog-stats.js").indexOf("article_source") !== -1, "UI article source leads");
assert(read("api/_lib/blog-stats.js").indexOf("resolveLeadArticle") !== -1, "resolveLeadArticle");
assert(read("api/_lib/blog-stats.js").indexOf("leads_by_article") !== -1, "leads_by_article API");
assert(read("js/attribution.js").indexOf("blog_article") !== -1, "attribution blog_article");
assert(read("js/attribution.js").indexOf("attr_last_utm_content") !== -1, "attr_last_utm_content");

var { resolveLeadArticle, slugFromUtmContent } = require("../api/_lib/blog-stats.js");
assert(slugFromUtmContent("courtier-assurance-mutuelle-sante-nancy.html") === "courtier-assurance-mutuelle-sante-nancy", "slugFromUtmContent");
var sample = resolveLeadArticle({
  utm_content: "vendeur-cherche-acquereur-mandat-matching",
  utm_source: "blog",
  payload: {},
});
assert(sample && sample.slug === "vendeur-cherche-acquereur-mandat-matching", "resolveLeadArticle utm_content");

/* Vérifs HTTP prod (si réseau) */
async function checkOrigin() {
  var paths = [
    "/crm-blog-stats.html",
    "/blog-questionnaires.html",
    "/js/site-host-brand.js",
    "/crm-blog-stats.js",
    "/blog/",
  ];
  var httpFailed = 0;
  for (var i = 0; i < paths.length; i++) {
    var p = paths[i];
    try {
      var r = await fetch(ORIGIN + p, { redirect: "follow" });
      if (!r.ok) {
        console.log("WARN", ORIGIN + p, r.status, "→ redeploy le projet Vercel de ce domaine depuis main");
        httpFailed++;
      } else {
        console.log("OK  ", ORIGIN + p, r.status);
      }
    } catch (e) {
      console.log("WARN", ORIGIN + p, e.message);
      httpFailed++;
    }
  }
  return httpFailed;
}

checkOrigin()
  .then(function (httpFailed) {
    if (failed) {
      console.error("\n" + failed + " échec(s) code local");
      process.exit(1);
    }
    if (httpFailed) {
      console.log("\nCode OK — " + httpFailed + " URL(s) pas encore en prod sur " + ORIGIN + " (redeploy)");
      process.exit(0);
    }
    console.log("\nverify:buchet-blog-crm OK —", ORIGIN);
  })
  .catch(function (e) {
    console.error(e);
    process.exit(1);
  });
