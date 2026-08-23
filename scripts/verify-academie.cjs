/**
 * Vérifie l'Académie (hub + cours + leçons).
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, "data/academie-curriculum.json"), "utf8"));

var failed = 0;
function ok(msg) {
  console.log("  OK  " + msg);
}
function bad(msg) {
  console.log("  FAIL " + msg);
  failed += 1;
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

console.log("=== verify:academie ===\n");

if (exists("academie/index.html")) ok("hub academie/index.html");
else bad("hub manquant — npm run academie:build");

if (exists("css/academie.css")) ok("css/academie.css");
else bad("css/academie.css manquant");

DATA.courses.forEach(function (c) {
  var hub = "academie/" + c.slug + "/index.html";
  if (exists(hub)) ok(hub);
  else bad(hub);
  c.lessons.forEach(function (l) {
    var f = "academie/" + c.slug + "/" + l.slug + ".html";
    if (exists(f)) ok(f);
    else bad(f);
  });
});

var index = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
if (index.indexOf("/academie/") !== -1 || index.indexOf("./academie/") !== -1) ok("lien Académie sur l'accueil");
else bad("lien Académie absent de index.html");

var sm = fs.readFileSync(path.join(ROOT, "sitemap-main.xml"), "utf8");
if (sm.indexOf("/academie/") !== -1) ok("academie dans sitemap-main.xml");
else bad("academie absente du sitemap-main");

console.log("");
if (failed) {
  console.error("Échec: " + failed);
  process.exit(1);
}
console.log("Académie: OK");
