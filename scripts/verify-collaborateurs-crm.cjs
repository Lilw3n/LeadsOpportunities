#!/usr/bin/env node
/** Vérifie RBAC collaborateurs — admin site unique, rôles CRM. */
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

var rbac = require(path.join(root, "api/_lib/rbac.js"));
assert(rbac.COLLABORATOR_CRM_ROLES.indexOf("commercial") >= 0, "rôle commercial");
assert(rbac.isSiteAdmin({ role: "admin" }), "site admin");
assert(!rbac.isSiteAdmin({ role: "user", crm_role: "staff" }), "staff pas site admin");
assert(rbac.isCollaborator({ role: "user", crm_role: "commercial" }), "commercial collaborateur");
assert(rbac.canManageCollaborators({ role: "admin" }), "admin gère équipe");
assert(!rbac.canManageCollaborators({ role: "user", crm_role: "staff" }), "staff ne gère pas équipe");

var usersRoute = read("api/_lib/routes/crm-users.js");
assert(usersRoute.indexOf("PATCH") >= 0, "PATCH users");
assert(usersRoute.indexOf("COLLABORATOR_CRM_ROLES") >= 0, "rôles collaborateurs POST");
assert(usersRoute.indexOf("role = 'admin'") < 0 || usersRoute.indexOf("'user'") >= 0, "collaborateurs role user");

assert(read("js/crm-collaborator-session.js").indexOf("isSiteAdmin") >= 0, "session JS");
assert(read("crm.html").indexOf("collaborateur") >= 0, "crm login collaborateur");
assert(read("js/crm-sidebar.js").indexOf("siteAdmin") >= 0, "sidebar filtre admin");

process.exit(failed ? 1 : 0);
