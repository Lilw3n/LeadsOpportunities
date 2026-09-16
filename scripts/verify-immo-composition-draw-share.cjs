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
var svg = Draw.renderSvg(tree);
ok(svg.indexOf("<svg") >= 0 || svg.indexOf("comp-draw") >= 0, "SVG généré");

var fullUnits = [
  { id: "t1", type: "terrain", label: "Parcelle rue Stanislas", parent_id: null },
  { id: "b1", type: "immeuble", label: "Immeuble A", parent_id: "t1" },
  { id: "e0", type: "etage", label: "RDC", parent_id: "b1" },
  { id: "e1", type: "etage", label: "R+1", parent_id: "b1" },
  {
    id: "a1",
    type: "appartement",
    label: "Apt 1",
    parent_id: "e0",
    occupation: "loue",
    surface_carrez: 45,
    pieces_list: [
      { type: "salon", label: "Salon" },
      { type: "chambre", label: "Ch.1" },
      { type: "cuisine", label: "Cuisine" },
    ],
  },
  {
    id: "a2",
    type: "appartement",
    label: "Apt 2",
    parent_id: "e1",
    occupation: "vide",
    pieces_list: [{ type: "salon", label: "Séjour" }, { type: "chambre", label: "Chambre" }],
  },
  { id: "c1", type: "cave", label: "Cave 1", parent_id: "b1" },
];
var fullTree = Dossier.buildCompositionTree(fullUnits);
var fullSvg = Draw.renderSvg(fullTree, { Dossier: Dossier });
ok(fullSvg.indexOf('data-role="foncier"') >= 0, "dessin terrain");
ok(fullSvg.indexOf('data-role="bati"') >= 0, "dessin immeuble");
ok(fullSvg.indexOf('data-role="niveau"') >= 0, "dessin étages");
ok(fullSvg.indexOf('data-role="lot"') >= 0, "dessin lots");
ok(fullSvg.indexOf("comp-draw-piece") >= 0, "dessin pièces");
ok(fullSvg.indexOf('data-role="annexe"') >= 0, "dessin cave/annexe");
ok(fullSvg.indexOf("leg piece") >= 0, "légende pièce");
ok(fullSvg.indexOf("<path d=") >= 0 || fullSvg.indexOf("circle cx=") >= 0, "toit / acrotère architectural");

/* Empilement façade : R+1 au-dessus du RDC (y croissant vers le bas). */
var floorYs = [];
var floorRe = /transform="translate\(([\d.]+) ([\d.]+)\) rotate\(-90\)"[^>]*>([^<]+)</g;
var fm;
while ((fm = floorRe.exec(fullSvg))) {
  floorYs.push({ y: Number(fm[2]), lab: fm[3] });
}
floorYs.sort(function (a, b) {
  return a.y - b.y;
});
var labsTopDown = floorYs.map(function (f) {
  return f.lab;
});
ok(
  labsTopDown.indexOf("R+1") >= 0 &&
    labsTopDown.indexOf("RDC") >= 0 &&
    labsTopDown.indexOf("R+1") < labsTopDown.indexOf("RDC"),
  "étages empilés R+1 au-dessus du RDC"
);

var maisonTree = Dossier.buildCompositionTree([
  { id: "m1", type: "maison", label: "Pavillon", parent_id: null },
  {
    id: "lot1",
    type: "appartement",
    label: "Habitation",
    parent_id: "m1",
    pieces_list: [{ type: "salon", label: "Salon" }, { type: "chambre", label: "Chambre" }],
  },
]);
var maisonSvg = Draw.renderSvg(maisonTree, { Dossier: Dossier });
ok(maisonSvg.indexOf("Maison —") >= 0, "toit maison (libellé)");
ok(maisonSvg.indexOf("comp-draw-piece") >= 0, "pièces dans maison");

/* Groupement par champ Étage (sans nœuds etage) + cave -1 */
var floorUnits = [
  { id: "t1", type: "terrain", label: "Terrain / parcelle", parent_id: null },
  { id: "a3", type: "appartement", label: "Apt 3", parent_id: "t1", floor: "3", occupation: "loue", pieces_list: [{ type: "chambre", label: "Chambre" }] },
  { id: "a2", type: "appartement", label: "Apt 2", parent_id: "t1", floor: "2", pieces_list: [{ type: "chambre", label: "Chambre" }] },
  { id: "a1", type: "appartement", label: "Apt 1", parent_id: "t1", floor: "1", pieces_list: [{ type: "chambre", label: "Chambre" }] },
  { id: "a0", type: "appartement", label: "Apt RDC", parent_id: "t1", floor: "0", pieces_list: [{ type: "salon", label: "Salon" }] },
  { id: "c1", type: "dependance", label: "Cave", parent_id: "t1", floor: "-1" },
];
var floorSvg = Draw.renderSvg(Dossier.buildCompositionTree(floorUnits), { Dossier: Dossier });
var floorLabs = [];
var floorLabRe = /data-floor="([^"]+)"/g;
var flm;
while ((flm = floorLabRe.exec(floorSvg))) floorLabs.push(flm[1]);
ok(floorLabs.indexOf("R+3") >= 0 && floorLabs.indexOf("R+2") >= 0 && floorLabs.indexOf("R+1") >= 0, "floor-field grouping R+1..3");
ok(floorLabs.indexOf("RDC") >= 0, "floor-field grouping RDC");
ok(floorLabs.some(function (l) { return /cave|-1/i.test(l); }), "floor-field cave -1");
ok(floorLabs.indexOf("R+3") < floorLabs.indexOf("RDC") && floorLabs.indexOf("RDC") < floorLabs.findIndex(function (l) { return /cave|-1/i.test(l); }), "stack R+3 > RDC > cave");


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
