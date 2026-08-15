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

var contactHtml = read("crm-contact.html");
assert(contactHtml.indexOf("contactEventsPanel") >= 0, "fiche interlocuteur : panneau événements");
assert(contactHtml.indexOf("btnAddEvent") >= 0, "fiche interlocuteur : bouton + événement");
assert(contactHtml.indexOf("btnAddEventFull") >= 0, "fiche interlocuteur : lien RDV complet");
assert(contactHtml.indexOf("eventRoleFilter") >= 0, "fiche interlocuteur : filtre rôle interlocuteur");
assert(contactHtml.indexOf("crm-dossier-interlocutors.js") >= 0, "fiche interlocuteur charge les rôles");
assert(contactHtml.indexOf("crm-agenda-types.js") >= 0, "fiche interlocuteur charge les types agenda");
assert(contactHtml.indexOf("contactEventKpis") >= 0, "fiche interlocuteur : KPI événements");

var contactJs = read("crm-contact.js");
assert(contactJs.indexOf("linkedEvents") >= 0, "fiche JS : événements d’autres dossiers");
assert(contactJs.indexOf("data-int-cycle") >= 0, "fiche JS : cycle suivi interlocuteur");
assert(contactJs.indexOf('status: "completed"') >= 0, "fiche JS : marquer événement fait");
assert(contactJs.indexOf("interlocutorsOf") >= 0, "fiche JS : interlocutorsOf");
assert(contactJs.indexOf("_defaultInterlocutor") >= 0, "fiche JS : interlocuteur client prérempli");

var formJs = read("js/crm-event-form.js");
assert(formJs.indexOf("interlocutorRow") >= 0, "formulaire événement : ligne interlocuteur");
assert(formJs.indexOf("interlocutorsBox") >= 0, "formulaire événement : bloc interlocuteurs");
assert(formJs.indexOf("interlocutors: interlocutors") >= 0, "formulaire événement : parse interlocutors");

var modulesApi = read("api/_lib/routes/crm-modules.js");
assert(modulesApi.indexOf("Interlocutors.normalizeList") >= 0, "modules API : normalise interlocuteurs");
assert(modulesApi.indexOf("crm-dossier-interlocutors") >= 0, "modules API importe le catalogue");

var contactApi = read("api/_lib/routes/crm-contact.js");
assert(contactApi.indexOf("loadLinkedEvents") >= 0, "contact GET : events liés");
assert(contactApi.indexOf("linkedEvents") >= 0, "contact GET : champ linkedEvents");

var lib = read("api/_lib/crm-modules-lib.js");
assert(lib.indexOf("async function loadLinkedEvents") >= 0, "lib : loadLinkedEvents");

["crm-event-manager.js", "crm-event-create.js", "js/crm-dossier-interlocutors.js", "api/_lib/routes/crm-events.js", "js/crm-event-form.js", "crm-contact.js", "api/_lib/crm-modules-lib.js", "api/_lib/routes/crm-contact.js", "api/_lib/routes/crm-modules.js"].forEach(
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
