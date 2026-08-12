#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.join(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "scripts", "pret-fiches-manifest.json"), "utf8"));
const inbox = path.resolve(process.argv[2] || path.join(root, manifest.inbox || "docs/pret-fiches/_inbox"));

function norm(name) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s*\(\d+\)(?=\.[^.]+$)/, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

if (!fs.existsSync(inbox)) {
  fs.mkdirSync(inbox, { recursive: true });
  console.log("Inbox créée:", inbox);
  process.exit(0);
}

const files = fs.readdirSync(inbox).filter((f) => /\.(pdf|xlsx|xls|docx?)$/i.test(f));
if (!files.length) {
  console.log("Aucun fichier dans", inbox);
  process.exit(0);
}

let matched = 0;
const unmatched = [];

files.forEach(function (file) {
  const n = norm(file);
  const entry = manifest.files.find(function (f) {
    const names = [f.canonical, f.downloadName].concat(f.aliases || []).filter(Boolean);
    return names.some(function (a) {
      const na = norm(a);
      if (!na) return false;
      return na === n || (na.length > 12 && (n.indexOf(na) >= 0 || na.indexOf(n) >= 0));
    });
  });
  if (!entry) {
    unmatched.push(file);
    return;
  }
  const destDir = path.join(root, manifest.baseDir || "docs/pret-fiches", entry.section);
  fs.mkdirSync(destDir, { recursive: true });
  const dest = path.join(destDir, entry.canonical);
  fs.copyFileSync(path.join(inbox, file), dest);
  matched++;
  console.log("OK", file, "→", path.relative(root, dest));
});

execFileSync(process.execPath, [path.join(root, "scripts", "build-pret-fiches-catalog.cjs")], { stdio: "inherit" });
console.log("\nImport fiches:", matched, "| non reconnus:", unmatched.length);
unmatched.forEach((u) => console.log("  ?", u));
