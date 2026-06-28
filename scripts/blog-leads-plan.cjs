#!/usr/bin/env node
/**
 * Configuration editoriale pour publier regulierement des articles qui generent des leads.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PLAN_FILE = path.join(ROOT, "data", "blog-leads-plan.json");

const DEFAULT_PLAN = {
  cadence: {
    runsPerDay: 5,
    cronUtc: ["06:00", "09:00", "12:00", "15:00", "18:00"],
    defaultArticlesPerRun: 1,
    maxArticlesPerRun: 5,
    dailyArticleTarget: 5,
    staleAfterHours: 8,
  },
  leadQuality: {
    minimumLeadScore: 35,
    strictQuality: true,
    requiredCtaMedium: "actu_daily",
    requiredBlock: "bridge",
  },
  conversion: {
    primaryCta: "questionnaire",
    utmMedium: "actu_daily",
    leadEvent: "qualified_lead",
  },
};

function mergeObject(base, override) {
  var out = Object.assign({}, base || {});
  Object.keys(override || {}).forEach(function (key) {
    if (
      override[key] &&
      typeof override[key] === "object" &&
      !Array.isArray(override[key]) &&
      base &&
      typeof base[key] === "object" &&
      !Array.isArray(base[key])
    ) {
      out[key] = mergeObject(base[key], override[key]);
    } else {
      out[key] = override[key];
    }
  });
  return out;
}

function loadLeadPlan() {
  try {
    var parsed = JSON.parse(fs.readFileSync(PLAN_FILE, "utf8"));
    return mergeObject(DEFAULT_PLAN, parsed);
  } catch (e) {
    return DEFAULT_PLAN;
  }
}

function numberFromEnv(name, fallback) {
  var raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  var n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function clampInt(value, min, max) {
  var n = Math.round(Number(value) || min);
  return Math.min(max, Math.max(min, n));
}

function defaultArticlesPerRun(plan) {
  return clampInt((plan.cadence || {}).defaultArticlesPerRun || 1, 1, maxArticlesPerRun(plan));
}

function maxArticlesPerRun(plan) {
  return clampInt((plan.cadence || {}).maxArticlesPerRun || 5, 1, 5);
}

function minLeadScore(plan) {
  return clampInt(numberFromEnv("BLOG_ACTU_MIN_LEAD_SCORE", (plan.leadQuality || {}).minimumLeadScore || 0), 0, 100);
}

function staleAfterHours(plan) {
  return clampInt((plan.cadence || {}).staleAfterHours || 8, 1, 168);
}

function targetArticlesPerDay(plan) {
  return clampInt((plan.cadence || {}).dailyArticleTarget || defaultArticlesPerRun(plan), 1, 25);
}

function resolveCount(plan, cliCount) {
  var raw = cliCount !== undefined && cliCount !== "" ? cliCount : numberFromEnv("BLOG_ACTU_COUNT", defaultArticlesPerRun(plan));
  return clampInt(raw, 1, maxArticlesPerRun(plan));
}

function shouldUseStrictQuality(plan) {
  var env = process.env.STRICT_ACTU_QUALITY;
  if (env === "1" || env === "true") return true;
  if (env === "0" || env === "false") return false;
  return !!((plan.leadQuality || {}).strictQuality);
}

function describeLeadPlan(plan) {
  var cadence = plan.cadence || {};
  var quality = plan.leadQuality || {};
  return [
    "Objectif: " + (plan.goal || "articles leads"),
    "Cadence: " + ((cadence.cronUtc || []).join(", ") || cadence.runsPerDay + " run(s)/jour"),
    "Volume: " + defaultArticlesPerRun(plan) + " article(s)/run, cible " + targetArticlesPerDay(plan) + "/jour",
    "Seuil leadScore: " + minLeadScore(plan),
    "Qualite stricte: " + (shouldUseStrictQuality(plan) ? "oui" : "non"),
    "CTA: " + (((plan.conversion || {}).primaryCta || "questionnaire") + " / utm_medium=" + (quality.requiredCtaMedium || (plan.conversion || {}).utmMedium || "actu_daily")),
  ];
}

function main() {
  describeLeadPlan(loadLeadPlan()).forEach(function (line) {
    console.log(line);
  });
}

if (require.main === module) {
  main();
}

module.exports = {
  loadLeadPlan: loadLeadPlan,
  defaultArticlesPerRun: defaultArticlesPerRun,
  maxArticlesPerRun: maxArticlesPerRun,
  minLeadScore: minLeadScore,
  staleAfterHours: staleAfterHours,
  targetArticlesPerDay: targetArticlesPerDay,
  resolveCount: resolveCount,
  shouldUseStrictQuality: shouldUseStrictQuality,
  describeLeadPlan: describeLeadPlan,
};
