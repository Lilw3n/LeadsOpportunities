#!/usr/bin/env node
/**
 * Vérifie config Meta Lead Ads + templates questionnaire.
 */
const fs = require("fs");
const path = require("path");

const cfgPath = path.join(process.cwd(), "config", "meta-lead-forms.json");
let ok = true;

function fail(msg) {
  console.error("[FAIL]", msg);
  ok = false;
}

function pass(msg) {
  console.log("[OK]", msg);
}

if (!fs.existsSync(cfgPath)) {
  fail("config/meta-lead-forms.json manquant");
  process.exit(1);
}

const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
const templates = cfg.form_templates || {};
const keys = Object.keys(templates);

if (!keys.length) fail("Aucun form_template");
else pass(keys.length + " templates: " + keys.join(", "));

keys.forEach(function (k) {
  const t = templates[k];
  if (!t.questions || !t.questions.length) fail(k + ": pas de questions");
  else if (t.questions.length > 3) fail(k + ": trop de questions (" + t.questions.length + ")");
  else pass(k + ": " + t.questions.length + " question(s)");
});

const forms = cfg.forms || {};
const formIds = Object.keys(forms);
if (!formIds.length) {
  console.warn("[WARN] forms{} vide — créer les formulaires Meta puis ajouter les form_id");
} else {
  pass(formIds.length + " form_id Meta enregistré(s)");
}

try {
  require("../api/_lib/meta-lead-normalize");
  require("../api/_lib/routes/webhook-meta-lead");
  require("../api/webhooks/[action].js");
  pass("Modules webhook chargés");
} catch (e) {
  fail("Import modules: " + e.message);
}

const standalone = ["api/webhooks/meta-lead.js", "api/webhooks/withallo.js"];
standalone.forEach(function (f) {
  if (fs.existsSync(path.join(process.cwd(), f))) {
    fail(f + " encore present — utiliser api/webhooks/[action].js");
  }
});
if (!standalone.some(function (f) { return fs.existsSync(path.join(process.cwd(), f)); })) {
  pass("Webhooks consolidés (≤12 fonctions Vercel Hobby)");
}

process.exit(ok ? 0 : 1);
