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
ok(read("landings/styles.css").indexOf(".wizard-benefit-nudge") >= 0, "css styles partages");
ok(read("landings/quote-intelligence.css").indexOf(".wizard-early-finish") >= 0, "css early qi");

["landings/sante.html", "landings/credit-immo.html", "landings/vtc.html", "landings/acheteur-immo.html"].forEach(function (f) {
  var h = read(f);
  var street = h.match(/<input id="street"[^>]*>/);
  ok(street && street[0].indexOf("required") < 0 && street[0].indexOf("data-optional") >= 0, f + " street facultatif");
  var city = h.match(/<input id="cityFull"[^>]*>/);
  ok(city && city[0].indexOf("required") < 0, f + " cityFull facultatif");
});

ok(/id="postalCode"[^>]*\srequired/.test(read("landings/sante.html")), "sante CP etape1 toujours requis");
ok(read("js/tracking-correlation.js").indexOf("journey_early_callback") >= 0, "GA early callback");
ok(read("js/attribution.js").indexOf("lo:wizard_early_finish") >= 0, "attribution early finish");
ok(read("landings/credit-immo.html").indexOf("devis-express.html?need=credit-immo") >= 0, "credit lien express");

console.log("\nAnti-abandon parcours : OK.");
