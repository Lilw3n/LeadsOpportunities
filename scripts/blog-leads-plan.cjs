#!/usr/bin/env node
/**
 * Affiche le plan editorial evergreen leads (cadence + verticales).
 *
 * Usage: npm run blog:leads:plan
 */
const fs = require("fs");
const path = require("path");

var planPath = path.join(__dirname, "..", "data", "blog-lead-article-plan.json");
var plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
var cadence = plan.cadence || {};
var bySection = {};

(plan.topics || []).forEach(function (topic) {
  var key = topic.section || "autre";
  bySection[key] = bySection[key] || [];
  bySection[key].push(topic);
});

console.log("=== Plan blog leads ===");
console.log(cadence.goal || "Generer des leads via articles evergreen.");
console.log("Cron recommande:", cadence.recommendedCron || "n/a");
console.log("Par run:", cadence.defaultCount || 1, "/ max", cadence.maxCount || 3);
console.log("Sujets:", (plan.topics || []).length);
console.log("\nPar verticale:");
Object.keys(bySection)
  .sort()
  .forEach(function (section) {
    console.log("  -", section + ":", bySection[section].length, "sujet(s)");
  });
