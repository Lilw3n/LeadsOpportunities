#!/usr/bin/env node
var assert = require("assert");
var summary = require("../api/_lib/call-summary.js");

var refused = null;
summary.summarizeCall({ transcript: "bonjour", useAi: false }).then(function (r) {
  refused = r;
  assert.strictEqual(r.ok, false);
  var garage = summary.summarizeCallLocal({
    transcript: "Le client tient un garage et un négociant auto, véhicules en dépôt. Il veut un devis.",
    consentSource: "withallo",
  });
  assert.strictEqual(garage.metier.id, "garage");
  assert.strictEqual(garage.audio, false);
  assert.ok(garage.summary.indexOf("Garage") >= 0);

  var calls = summary.normalizeFreeboxLog({
    result: [{ type: "incoming", number: "+33612345678", duration: 42, datetime: 1710000000 }],
  });
  assert.strictEqual(calls.length, 1);
  assert.strictEqual(calls[0].direction, "entrant");
  assert.strictEqual(calls[0].duration, 42);
  assert.ok(summary.phonesMatch("0612345678", "+33 6 12 34 56 78"));
  var picked = summary.pickFreeboxCall(calls, "06 12 34 56 78");
  assert.strictEqual(picked.duration, 42);

  var noAudio = summary.summarizeCallLocal({ transcript: "", free: calls[0], consent: true });
  assert.ok(noAudio.summary.indexOf("Pas de transcript") >= 0);
  assert.ok(noAudio.note.indexOf("Free ne fournit pas") >= 0);

  var fs = require("fs");
  var path = require("path");
  var root = path.join(__dirname, "..");
  var page = fs.readFileSync(path.join(root, "crm-appels.html"), "utf8");
  var js = fs.readFileSync(path.join(root, "crm-appels.js"), "utf8");
  assert.ok(page.indexOf("callConsent") >= 0);
  assert.ok(js.indexOf("mafreebox.freebox.fr") >= 0);
  assert.ok(js.indexOf("https:") >= 0);
  var hook = fs.readFileSync(path.join(root, "api/_lib/routes/webhook-withallo.js"), "utf8");
  assert.ok(hook.indexOf("attachCallSummary") >= 0);
  var route = fs.readFileSync(path.join(root, "api/crm/[action].js"), "utf8");
  assert.ok(route.indexOf("call-summary") >= 0);
  console.log("OK call-summary");
}).catch(function (e) {
  console.error(e);
  process.exit(1);
});
