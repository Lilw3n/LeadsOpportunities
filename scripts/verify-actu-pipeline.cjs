#!/usr/bin/env node
/**
 * Garde-fous pipeline blog actu (placeholders + contrôle qualité hors TTY).
 */
var fs = require("fs");
var path = require("path");
var { spawnSync } = require("child_process");
var { isPlaceholderActuItem } = require("./blog-actu-lib.cjs");

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

assert(
  isPlaceholderActuItem({
    id: "cafeyn-pending-template",
    title: "COLLEZ ICI le titre de la une Cafeyn (Le Figaro, Le Parisien…)",
  }),
  "placeholder Cafeyn détecté"
);
assert(
  !isPlaceholderActuItem({
    title: "Rappel d'œufs : salmonellose et mutuelle",
    url: "https://www.franceinfo.fr/example",
  }),
  "titre réel non filtré"
);
assert(isPlaceholderActuItem({ title: "" }), "titre vide = placeholder");

var qualitySrc = fs.readFileSync(path.join(root, "scripts/verify-actu-quality.cjs"), "utf8");
assert(qualitySrc.indexOf("process.stdin.isTTY") === -1, "qualité ne dépend plus de isTTY");
assert(qualitySrc.indexOf('--stdin') !== -1, "flag --stdin explicite");

var autoSrc = fs.readFileSync(path.join(root, "scripts/auto-actu-publish.cjs"), "utf8");
assert(
  autoSrc.indexOf("--file=data/blog-actu-pending.json") !== -1,
  "auto-publish passe --file au contrôle qualité"
);

var queue = JSON.parse(fs.readFileSync(path.join(root, "data/blog-actu-queue.json"), "utf8"));
var template = (queue.items || []).find(function (i) {
  return i.id === "cafeyn-pending-template";
});
assert(template, "modele inbox toujours present (documentation)");
assert(template && template.status === "rejected", "modele inbox status rejected");

var empty = spawnSync(process.execPath, ["scripts/verify-actu-quality.cjs"], {
  cwd: root,
  encoding: "utf8",
  input: "",
});
assert(empty.status === 0, "qualité avec stdin vide (non-TTY) ne plante pas (code=" + empty.status + ")");
if (empty.stderr && /Unexpected end of JSON/.test(empty.stderr)) {
  failed++;
  console.log("FAIL qualité a lu un JSON stdin vide");
} else {
  console.log("OK  qualité ignore stdin vide sans --stdin");
}

process.exit(failed ? 1 : 0);
