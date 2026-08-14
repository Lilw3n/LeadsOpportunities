#!/usr/bin/env node
/**
 * Génère les visuels Open Graph immo (1200×630) via Python/Pillow.
 * Usage: node scripts/generate-og-immo.cjs
 */
var { spawnSync } = require("child_process");
var path = require("path");
var py = path.join(__dirname, "generate-og-immo.py");
var r = spawnSync("python3", [py], { stdio: "inherit" });
process.exit(r.status || 0);
