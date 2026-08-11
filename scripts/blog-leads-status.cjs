#!/usr/bin/env node
/**
 * Statut du plan d'articles evergreen orientes leads.
 *
 * Usage: npm run blog:leads:status
 */
const path = require("path");
const fs = require("fs");
const { existingFiles, slugify } = require("./blog-actu-lib.cjs");

var ROOT = path.join(__dirname, "..");
var DATA = path.join(ROOT, "data");

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    return fallback;
  }
}

function main() {
  var plan = readJson(path.join(DATA, "blog-lead-article-plan.json"), { topics: [], cadence: {} });
  var state = readJson(path.join(DATA, "blog-lead-articles-state.json"), {
    publishedTopicIds: [],
    runs: [],
  });
  var files = existingFiles();
  var done = new Set(state.publishedTopicIds || []);
  var topics = plan.topics || [];

  var remaining = topics.filter(function (topic) {
    var file = (topic.slug || slugify(topic.title)) + ".html";
    return !done.has(topic.id) && !files.has(file);
  });

  var next = remaining
    .slice()
    .sort(function (a, b) {
      return (b.priority || 0) - (a.priority || 0);
    })
    .slice(0, 5);

  console.log("=== Blog leads evergreen ===");
  console.log("Plan mis a jour:", plan.updated || "n/a");
  console.log("Cadence cron:", (plan.cadence && plan.cadence.recommendedCron) || "n/a");
  console.log(
    "Articles/run:",
    (plan.cadence && plan.cadence.defaultCount) || 1,
    "(max " + ((plan.cadence && plan.cadence.maxCount) || 3) + ")"
  );
  console.log("Sujets planifies:", topics.length);
  console.log("Deja publies (state):", done.size);
  console.log("Restants publicables:", remaining.length);
  console.log("Runs enregistres:", (state.runs || []).length);

  if (next.length) {
    console.log("\nProchains sujets:");
    next.forEach(function (topic, i) {
      console.log(
        "  " +
          (i + 1) +
          ". [" +
          (topic.priority || 0) +
          "] " +
          topic.id +
          " — " +
          topic.title
      );
    });
  } else {
    console.log("\nAucun sujet restant : enrichir data/blog-lead-article-plan.json");
  }

  var lastRun = (state.runs || []).slice(-1)[0];
  if (lastRun) {
    console.log("\nDernier run:", lastRun.at, "| articles:", lastRun.count, "| publish:", !!lastRun.published);
  }

  console.log("\nCommandes:");
  console.log("  npm run blog:leads:auto -- --dry-run");
  console.log("  npm run blog:leads:auto");
  console.log("  npm run blog:leads:auto -- --count=2");
}

main();
