#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const required = [
  "index.html",
  "package.json",
  "vercel.json",
  "crm-immo-properties.html",
  "crm-immo-property.html",
  "crm-agency-fees.html",
  "immobilier/index.html",
  "immobilier/visite.html",
  "bareme-honoraires/index.html",
  "js/crm-immo-property-page.js",
  "js/bareme-honoraires-lib.js",
  "data/bareme-honoraires-public.json",
  "api/[action].js",
  "api/crm/[action].js",
  "api/drive/[action].js",
  "api/auth/[action].js",
  "api/_lib/routes/crm-immo.js",
  "api/_lib/routes/public-immo-listings.js",
  "api/_lib/immo-properties-store.js",
  "database/crm-immo-properties.sql",
];

let ok = true;
for (const rel of required) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) {
    console.error("MISSING", rel);
    ok = false;
  }
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
if (!pkg.dependencies || !pkg.dependencies["@neondatabase/serverless"]) {
  console.error("package.json: missing @neondatabase/serverless");
  ok = false;
}

const files = [];
function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === "node_modules" || ent.name === ".git") continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else files.push(p);
  }
}
walk(root);

console.log("pack files:", files.length);
console.log(ok ? "verify:pack OK" : "verify:pack FAILED");
process.exit(ok ? 0 : 1);
