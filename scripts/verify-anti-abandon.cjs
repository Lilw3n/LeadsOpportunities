/**
 * Anti-abandon parcours : adresse facultative + rappel anticipe wizard.
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

var qw = read("landings/quote-wizard.js");
ok(qw.indexOf("wizard-early-finish") >= 0, "bouton rappel anticipe");
ok(qw.indexOf("journey_mode") >= 0, "journey_mode early_callback");
ok(qw.indexOf("wizard-benefit-nudge") >= 0, "nudge mid-funnel");
ok(qw.indexOf("relaxForEarlyFinish") >= 0, "relax required");

var css = read("landings/quote-intelligence.css");
ok(read("landings/styles.css").indexOf(".wizard-benefit-nudge") >= 0, "css styles partages");
ok(read("js/tracking-correlation.js").indexOf("journey_early_callback") >= 0, "GA early callback");
ok(read("js/attribution.js").indexOf("lo:wizard_early_finish") >= 0, "attribution early finish");
ok(read("landings/credit-immo.html").indexOf("devis-express.html?need=credit-immo") >= 0, "credit lien express");

console.log("\nAnti-abandon parcours : OK.");
