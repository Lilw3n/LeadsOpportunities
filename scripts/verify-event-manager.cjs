#!/usr/bin/env node
/**
 * Vérifie le gestionnaire d’événements + interlocuteurs de dossier.
 */
var fs = require("fs");
var path = require("path");
var INT = require("../js/crm-dossier-interlocutors.js");
var failed = 0;

function assert(cond, msg) {
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

var important = INT.importantRoles().map(function (r) {
  return r.id;
});
["client", "co_emprunteur", "banque", "notaire", "partenaire", "apporteur", "conseiller", "negociateur"].forEach(
  function (id) {
    assert(important.indexOf(id) >= 0, "rôle important : " + id);
  }
);

var list = INT.normalizeList([
  { role: "banque", name: "BNP", phone: "01 00 00 00 00" },
  { role: "notaire", name: "Me Dupont", email: "notaire@example.fr" },
  { role: "client" },
  { role: "partenaire", firstName: "Léa", lastName: "Martin" },
]);
assert(list.length === 3, "normalizeList ignore les fiches vides (got " + list.length + ")");
assert(list[0].roleLabel.indexOf("Banque") >= 0, "libellé banque");
assert(list[1].email === "notaire@example.fr", "email notaire conservé");
assert(list[2].name === "Léa Martin", "prénom + nom fusionnés");

assert(INT.nextFollowUp("pending") === "waiting", "cycle pending → waiting");
assert(INT.nextFollowUp("waiting") === "done", "cycle waiting → done");
assert(INT.nextFollowUp("done") === "pending", "cycle done → pending");
assert(INT.followUpLabel("waiting") === "En attente de retour", "libellé waiting");

var html = INT.roleOptionsHtml("notaire");
assert(html.indexOf('value="notaire" selected') >= 0, "option notaire sélectionnée");
assert(html.indexOf('value="client"') >= 0, "option client présente");

var manager = read("crm-event-manager.html");
assert(manager.indexOf("crm-event-manager.js") >= 0, "page gestionnaire charge le JS");
assert(manager.indexOf("crm-dossier-interlocutors.js") >= 0, "page gestionnaire charge les rôles");
assert(manager.indexOf('value="interlocutors"') >= 0, "vue par interlocuteur");
assert(manager.indexOf('value="dossiers"') >= 0, "vue par dossier");

var create = read("crm-event-create.html");
assert(create.indexOf("interlocutorsBox") >= 0, "création : bloc interlocuteurs");
assert(create.indexOf("btnAddInterlocutor") >= 0, "création : bouton + interlocuteur");
assert(create.indexOf("crm-dossier-interlocutors.js") >= 0, "création charge les rôles");

var createJs = read("crm-event-create.js");
assert(createJs.indexOf("collectInterlocutors") >= 0, "collectInterlocutors défini");
assert(createJs.indexOf("form.onsubmit") >= 0, "submit formulaire présent");
assert(createJs.indexOf("interlocutors: collectInterlocutors()") >= 0, "POST envoie interlocutors");

var api = read("api/_lib/routes/crm-events.js");
assert(api.indexOf("req.method === \"PATCH\"") >= 0, "API PATCH événements");
assert(api.indexOf("Interlocutors.normalizeList") >= 0, "API normalise les interlocuteurs");
assert(api.indexOf("crm-dossier-interlocutors") >= 0, "API importe le catalogue de rôles");

var side = read("js/crm-sidebar.js");
assert(side.indexOf("crm-event-manager.html") >= 0, "sidebar : gestionnaire");
assert(side.indexOf("Gestionnaire d’événements") >= 0, "sidebar : libellé gestionnaire");

var shell = read("js/crm-subpage-shell.js");
assert(shell.indexOf("crm-event-manager.html") >= 0, "coque CRM : meta gestionnaire");

var home = read("crm.html");
assert(home.indexOf("crm-event-manager.html") >= 0, "accueil CRM : lien gestionnaire");

var types = read("js/crm-agenda-types.js");
["relance", "pieces", "banque", "notaire", "partenaire"].forEach(function (id) {
  assert(types.indexOf('id: "' + id + '"') >= 0, "type agenda " + id);
});

var mgrJs = read("crm-event-manager.js");
assert(mgrJs.indexOf("data-int-cycle") >= 0, "clic tag = cycle suivi interlocuteur");
assert(mgrJs.indexOf('status: "completed"') >= 0, "marquer événement fait");
assert(mgrJs.indexOf("renderByInterlocutor") >= 0, "vue groupée par interlocuteur");
assert(mgrJs.indexOf("renderByDossier") >= 0, "vue groupée par dossier");

["crm-event-manager.js", "crm-event-create.js", "js/crm-dossier-interlocutors.js", "api/_lib/routes/crm-events.js"].forEach(
  function (rel) {
    require("child_process").execFileSync(process.execPath, ["--check", path.join(__dirname, "..", rel)]);
    assert(true, "syntaxe " + rel);
  }
);

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nTous les contrôles du gestionnaire d’événements sont OK.");
