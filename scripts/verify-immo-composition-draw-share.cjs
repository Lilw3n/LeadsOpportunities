#!/usr/bin/env node
/** Dessin composition + synthèses courte/longue + partage/fork couleurs. */
var fs = require("fs");
var path = require("path");
var root = path.join(__dirname, "..");
var failed = 0;
function ok(c, m) {
  if (!c) {
    failed++;
    console.log("FAIL", m);
  } else console.log("OK  ", m);
}
function read(r) {
  return fs.readFileSync(path.join(root, r), "utf8");
}

var draw = read("js/crm-immo-composition-draw.js");
ok(draw.indexOf("renderSvg") >= 0, "draw renderSvg");
ok(draw.indexOf("ROLE_COLORS") >= 0, "draw couleurs rôles");

var share = read("js/crm-immo-composition-share-lib.js");
ok(share.indexOf("publish") >= 0 && share.indexOf("createFork") >= 0, "share publish/fork");
ok(share.indexOf("AGENT_COLOR") >= 0 && share.indexOf("USER_COLOR") >= 0, "couleurs auteurs");
ok(share.indexOf("shortSynthesisText") >= 0 && share.indexOf("longSynthesisHtml") >= 0, "synthèses courte/longue");

var page = read("js/crm-immo-property-page.js");
ok(page.indexOf("CrmImmoCompositionDraw") >= 0, "page charge dessin");
ok(page.indexOf("synthese-courte") >= 0 && page.indexOf("synthese-longue") >= 0, "synthèses dans composition");
ok(page.indexOf("btnPublishShare") >= 0, "bouton publier");
ok(page.indexOf("comp-draw") >= 0, "section dessin");

var html = read("crm-immo-property.html");
ok(html.indexOf("crm-immo-composition-draw.js") >= 0, "script draw inclus");
ok(html.indexOf("crm-immo-composition-share-lib.js") >= 0, "script share inclus");

ok(fs.existsSync(path.join(root, "immo-composition-partage.html")), "page publique");
ok(fs.existsSync(path.join(root, "js/immo-composition-share-page.js")), "page JS publique");

var pub = read("immo-composition-partage.html");
ok(pub.indexOf("immo-composition-share-page.js") >= 0, "publique charge le JS");

var dossier = read("js/crm-immo-dossier-lib.js");
ok(dossier.indexOf("levelRole") >= 0 && dossier.indexOf("unitLabel") >= 0, "dossier levelRole/unitLabel");

// runtime
var Draw = require(path.join(root, "js/crm-immo-composition-draw.js"));
var Share = require(path.join(root, "js/crm-immo-composition-share-lib.js"));
var Dossier = require(path.join(root, "js/crm-immo-dossier-lib.js"));
var tree = Dossier.buildCompositionTree([
  { id: "t1", type: "terrain", label: "Terrain", parent_id: null },
  { id: "a1", type: "appartement", label: "A1", parent_id: "t1", occupation: "loue", loyer_reel: 500, surface_carrez: 40 },
]);
var svg = Draw.renderSvg(tree, { Dossier: Dossier });
ok(svg.indexOf("<svg") >= 0 || svg.indexOf("comp-draw") >= 0, "SVG généré");
ok(svg.indexOf("comp-draw-hint") >= 0 || svg.indexOf("immeuble") >= 0, "hint hiérarchie si plat");

var nested = Dossier.buildCompositionTree([
  { id: "t", type: "terrain", label: "Parc", parent_id: null },
  { id: "i", type: "immeuble", label: "Bât A", parent_id: "t" },
  { id: "e", type: "etage", label: "R+1", parent_id: "i" },
  {
    id: "a",
    type: "appartement",
    label: "A12",
    parent_id: "e",
    occupation: "loue",
    surface_carrez: 48,
    pieces_list: [
      { type: "salon", qty: 1, surface_m2: 20 },
      { type: "chambre", qty: 2 },
      { type: "cuisine", qty: 1 },
    ],
  },
]);
var nestedSvg = Draw.renderSvg(nested, { Dossier: Dossier });
ok(nestedSvg.indexOf('data-role="foncier"') >= 0, "niveau terrain");
ok(nestedSvg.indexOf('data-role="bati"') >= 0, "niveau bâti");
ok(nestedSvg.indexOf('data-role="niveau"') >= 0, "niveau étage");
ok(nestedSvg.indexOf('data-role="lot"') >= 0, "niveau lot");
ok(nestedSvg.indexOf("comp-draw-piece") >= 0, "pièces dans le lot");
ok(draw.indexOf("terrain →") >= 0 || draw.indexOf("mesureForest") >= 0 || draw.indexOf("measureForest") >= 0, "layout imbriqué");
ok(html.indexOf("leg.piece") >= 0 || html.indexOf(".leg.piece") >= 0, "légende pièce CSS");
ok(page.indexOf("lot → pièces") >= 0 || page.indexOf("étage → lot") >= 0, "sous-titre hiérarchie");

global.localStorage = {
  _d: {},
  getItem: function (k) {
    return this._d[k] || null;
  },
  setItem: function (k, v) {
    this._d[k] = String(v);
  },
};
global.window = {
  CrmImmoStore: {
    listProperties: function () {
      return [prop];
    },
  },
};
var prop = {
  id: "p1",
  title: "Complexe test",
  city: "Nancy",
  units: [
    { id: "t1", type: "terrain", label: "Terrain" },
    { id: "a1", type: "appartement", label: "A1", loyer_reel: 500 },
  ],
  details: { localisation: { ville: "Nancy" } },
};
var published = Share.publish(prop, { agent: { id: "w", name: "Wendy", color: "#0f766e", role: "agent" } });
ok(published && published.enabled && published.token, "publish ok");
var pack = Share.getPublicByToken(published.token);
ok(!!pack, "getPublicByToken");
localStorage.setItem("lo_token", "tok");
localStorage.setItem("lo_user", JSON.stringify({ id: "u1", name: "Client", email: "c@x.fr" }));
ok(Share.isConnected(), "user connected");
var fork = Share.createFork(pack);
ok(fork && fork.units.length === 2, "fork créé");
Share.markUserEdit(fork, "a1", "loyer_reel");
ok(Share.unitAuthorMix(fork, "a1") === "mixed" || Share.unitAuthorMix(fork, "a1") === "user", "mix auteur");
var short = Share.shortSynthesisText(Dossier.unitTotals(prop.units), pack.snapshot);
ok(short.indexOf("Nancy") >= 0 || short.indexOf("Complexe") >= 0, "synthèse courte texte");
var long = Share.longSynthesisHtml(Dossier.unitTotals(prop.units), pack.snapshot, {});
ok(long.indexOf("Synthèse longue") >= 0, "synthèse longue html");

if (failed) {
  console.log(failed + " échec(s)");
  process.exit(1);
}
console.log("\nOK verify-immo-composition-draw-share");
