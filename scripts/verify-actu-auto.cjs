#!/usr/bin/env node
/** Garde-fous pipeline actu auto (placeholder file + contrôle qualité CI). */
var fs = require("fs");
var path = require("path");
var lib = require("./blog-actu-lib.cjs");

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
  lib.isPlaceholderActuItem({
    title: "COLLEZ ICI le titre de la une Cafeyn (Le Figaro, Le Parisien…)",
  }),
  "détecte le gabarit COLLEZ ICI"
);
assert(lib.isPlaceholderActuItem({ id: "cafeyn-pending-template", title: "Une réelle" }), "détecte l'id template");
assert(lib.isPlaceholderActuItem({ status: "template", title: "x" }), "status template");
assert(
  !lib.isPlaceholderActuItem({ title: "Mutuelle : reste à charge après hospitalisation" }),
  "laisse passer un vrai titre"
);
assert(
  lib.hasQualifiedLeadIntent({ title: "Nouvelle cyberattaque contre une mutuelle en France" }),
  "intent mutuelle"
);
assert(
  !lib.hasQualifiedLeadIntent({ title: "Les fabricants de vélos français devraient profiter de meilleures ventes" }),
  "rejette un sujet sans angle assurance"
);

var queue = JSON.parse(fs.readFileSync(path.join(root, "data/blog-actu-queue.json"), "utf8"));
(queue.items || []).forEach(function (item) {
  if (lib.isPlaceholderActuItem(item)) {
    assert(
      item.status === "template" || item.status === "rejected" || item.status === "published",
      item.id + " ne doit pas être pending/queued"
    );
  }
});

var qualitySrc = fs.readFileSync(path.join(__dirname, "verify-actu-quality.cjs"), "utf8");
assert(qualitySrc.indexOf("!process.stdin.isTTY") === -1, "qualité ne parse plus stdin vide (CI)");
assert(qualitySrc.indexOf("--stdin") !== -1, "flag --stdin explicite");

var autoSrc = fs.readFileSync(path.join(__dirname, "auto-actu-publish.cjs"), "utf8");
assert(autoSrc.indexOf("--file=data/blog-actu-pending.json") !== -1, "auto-publish passe --file au contrôle qualité");
assert(autoSrc.indexOf("isPlaceholderActuItem") !== -1, "auto-publish ignore les gabarits");
assert(autoSrc.indexOf("hasQualifiedLeadIntent") !== -1, "auto-publish filtre l'intent lead");

process.exit(failed ? 1 : 0);
