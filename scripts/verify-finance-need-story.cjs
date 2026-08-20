#!/usr/bin/env node
/**
 * Vérifie le bloc besoin / parcours / difficultés sur le parcours Finance.
 */
var path = require("path");
var fs = require("fs");
var failed = 0;

function ok(cond, msg) {
  if (!cond) {
    failed++;
    console.log("FAIL", msg);
  } else {
    console.log("OK  ", msg);
  }
}

function read(rel) {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf8");
}

// Charger questionnaire-config en Node (window simulé)
global.window = global;
require("../js/questionnaire-config.js");
var QC = global.QUESTIONNAIRE_CONFIG;
ok(!!QC && typeof QC.needStoryFields === "function", "needStoryFields exporté");

var story = QC.needStoryFields({});
ok(story.indexOf('name="needExplain"') >= 0, "champ needExplain");
ok(story.indexOf('name="journeyStage"') >= 0, "champ journeyStage");
ok(story.indexOf('name="journeyDetails"') >= 0, "champ journeyDetails");
ok(story.indexOf('name="difficulties"') >= 0, "champ difficulties");

var overlays = QC.NEED_OVERLAYS;
["rachat", "conso", "credit-pro", "renegociation"].forEach(function (need) {
  var html = overlays[need]();
  ok(html.indexOf("needExplain") >= 0, need + " : besoin / parcours");
});
ok(QC.CATEGORY_CONTEXT.finance().indexOf("needExplain") >= 0, "catégorie finance : story");

var hub = read("finance/index.html");
ok(hub.indexOf('id="expliquer"') >= 0, "hub finance : ancre expliquer");
ok(hub.indexOf('name="needExplain"') >= 0, "hub finance : formulaire story");
ok(hub.indexOf('name="difficulties"') >= 0, "hub finance : difficultés");
ok(hub.indexOf("landings/tracking.js") >= 0, "hub finance : tracking lead");

var css = read("css/piliers-hub.css");
ok(css.indexOf(".pilier-story") >= 0, "CSS pilier-story");

var dossier = read("js/interlocuteur-dossier-lib.js");
ok(dossier.indexOf('needExplain: "Besoin expliqué"') >= 0, "libellé CRM needExplain");
ok(dossier.indexOf('"difficulties"') >= 0, "difficulties dans PROJET_KEYS");

require("child_process").execFileSync(process.execPath, [
  "--check",
  path.join(__dirname, "../js/questionnaire-config.js"),
]);
ok(true, "syntaxe questionnaire-config");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nTous les contrôles finance besoin/parcours OK.");
