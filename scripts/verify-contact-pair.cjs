#!/usr/bin/env node
/** Vérifie le bloc téléphone + e-mail (capture précoce). */
var fs = require("fs");
var path = require("path");
var failed = 0;
var root = path.join(__dirname, "..");

function assert(cond, msg) {
  if (!cond) {
    failed++;
    console.log("FAIL", msg);
  } else {
    console.log("OK  ", msg);
  }
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

assert(fs.existsSync(path.join(root, "css/contact-pair.css")), "css/contact-pair.css");
assert(fs.existsSync(path.join(root, "js/contact-pair.js")), "js/contact-pair.js");

var pairJs = read("js/contact-pair.js");
assert(pairJs.indexOf("tel-national") >= 0, "contact-pair autocomplete tel");
assert(pairJs.indexOf('name: "phone"') >= 0 && pairJs.indexOf('name: "email"') >= 0, "pair phone then email");

var cb = read("js/callback-form.js");
assert(cb.indexOf("Téléphone mobile") >= 0, "callback labels");
assert(cb.indexOf("Indiquez un téléphone et un e-mail") >= 0, "callback validation");
assert(cb.indexOf("callback-strip--inline") >= 0, "strip inline");
assert(cb.indexOf("data-callback-strip-open") < 0, "plus de bouton qui cache le strip");

var identity = read("landings/devis-steps.js");
assert(identity.indexOf("Comment vous joindre") >= 0, "identity contact d'abord");
assert(identity.indexOf("stepAddress") >= 0, "adresse séparée");
assert(identity.indexOf("parts.push(stepAddress())") >= 0, "address step wired");

["landings/vtc.html", "landings/sante.html", "landings/credit-immo.html"].forEach(function (f) {
  var html = read(f);
  var phoneIdx = html.indexOf('id="phone"');
  var emailIdx = html.indexOf('id="email"');
  var vehiculeIdx = html.indexOf("wizard-step");
  assert(phoneIdx > 0 && emailIdx > 0, f + " phone+email");
  assert(html.indexOf("contact-pair") >= 0, f + " contact-pair");
  assert(html.indexOf("data-callback-strip") >= 0, f + " callback strip");
  assert(html.indexOf("css/contact-pair.css") >= 0, f + " css");
  assert((html.match(/id="phone"/g) || []).length === 1, f + " un seul id phone");
  assert((html.match(/id="email"/g) || []).length === 1, f + " un seul id email");
  assert(phoneIdx < html.indexOf("wizard-step") + 2500 || phoneIdx < html.lastIndexOf("coordonnees"), f + " contact tôt");
  void vehiculeIdx;
});

var vtc = read("landings/vtc.html");
var step1 = vtc.indexOf('data-wizard-step="1"');
var phoneInStep1 = vtc.indexOf('id="phone"', step1);
var step6 = vtc.indexOf('data-wizard-step="6"');
assert(phoneInStep1 > step1 && phoneInStep1 < step6, "VTC phone dans étape 1");

var home = read("index.html");
assert(home.indexOf("contact-pair-row") >= 0, "accueil phone+email même rangée");
assert(home.indexOf("css/contact-pair.css") >= 0, "accueil css");

var qi = read("js/quote-intelligence.js");
assert(qi.indexOf("bindContactCapture") >= 0, "save progress blur");
assert(qi.indexOf("contact_blur") >= 0, "event contact_blur");

var pet = read("js/pet-journey.js");
assert(pet.indexOf("renderStepAnimalsBody") >= 0, "pet pair étape 1");
assert(pet.indexOf("state.phone") >= 0, "pet state phone");

var qc = read("js/questionnaire-config.js");
assert(qc.indexOf("tel-national") >= 0, "questionnaire autocomplete");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nContact téléphone + e-mail : OK.");
