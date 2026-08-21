/**
 * Vérifie le module rétention opportunité.
 */
var fs = require("fs");
var path = require("path");
var root = path.join(__dirname, "..");

function ok(c, m) {
  if (!c) throw new Error("FAIL: " + m);
  console.log("OK ", m);
}

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}

ok(fs.existsSync(path.join(root, "js/retention-opportunity.js")), "js");
ok(fs.existsSync(path.join(root, "css/retention-opportunity.css")), "css");
ok(fs.existsSync(path.join(root, "docs/RETENTION-OPPORTUNITE.md")), "doc");

var js = read("js/retention-opportunity.js");
ok(js.indexOf("exit_intent") >= 0, "exit intent");
ok(js.indexOf("Opportunité manquée") >= 0, "copy opportunités");
ok(js.indexOf("COPY_BY_NEED") >= 0, "copy par besoin");
ok(js.indexOf("MAX_SHOWS") >= 0, "anti-spam session");

[
  "landings/sante.html",
  "landings/credit-immo.html",
  "landings/devis.html",
  "landings/acheteur-immo.html",
  "landings/vtc.html",
  "index.html",
].forEach(function (p) {
  var t = read(p);
  ok(t.indexOf("retention-opportunity.js") >= 0, "wired " + p);
  ok(t.indexOf("retention-opportunity.css") >= 0, "css " + p);
  ok(t.indexOf("data-retention-need") >= 0, "need " + p);
});

console.log("\nRétention opportunité : OK.");
