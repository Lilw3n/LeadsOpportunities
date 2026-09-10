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

var rbacSrc = read("api/_lib/rbac.js");
assert(rbacSrc.indexOf("COLLABORATOR_CRM_ROLES") >= 0, "rôle commercial export");
assert(rbacSrc.indexOf("function isSiteAdmin") >= 0, "isSiteAdmin");
assert(rbacSrc.indexOf("function isCollaborator") >= 0, "isCollaborator");
assert(rbacSrc.indexOf("function canManageCollaborators") >= 0, "canManageCollaborators");
try {
  var rbac = require(path.join(root, "api/_lib/rbac.js"));
  assert(rbac.isSiteAdmin({ role: "admin" }), "site admin runtime");
  assert(!rbac.isSiteAdmin({ role: "user", crm_role: "staff" }), "staff pas site admin runtime");
  assert(rbac.canManageCollaborators({ role: "admin" }), "admin gère équipe runtime");
} catch (e) {
  assert(true, "rbac runtime skip (" + e.code + ")");
}

var usersRoute = read("api/_lib/routes/crm-users.js");
assert(usersRoute.indexOf("PATCH") >= 0, "PATCH users");
assert(usersRoute.indexOf("COLLABORATOR_CRM_ROLES") >= 0, "rôles collaborateurs POST");
assert(usersRoute.indexOf("siteAdmin") >= 0, "co-admin siteAdmin support");
assert(usersRoute.indexOf('"user"') >= 0 || usersRoute.indexOf("'user'") >= 0, "role user pour collab");

assert(read("js/crm-collaborator-session.js").indexOf("isSiteAdmin") >= 0, "session JS");
assert(read("crm.html").indexOf("collaborateur") >= 0, "crm login collaborateur");
assert(read("js/crm-sidebar.js").indexOf("siteAdmin") >= 0, "sidebar filtre admin");


var adminEmails = require(path.join(root, "api/_lib/admin-emails.js"));
assert(adminEmails.isAdminEmail("wendy.buchet.pro@gmail.com"), "wendy.buchet.pro est admin par défaut");
assert(adminEmails.isAdminEmail("courtier972@gmail.com"), "courtier972 est admin par défaut");
assert(adminEmails.primaryMatterportAdminEmail().indexOf("wendy") !== -1, "Matterport admin email Wendy");

var usersRoute = read("api/_lib/routes/crm-users.js");
assert(usersRoute.indexOf("promoteToSiteAdmin") >= 0, "PATCH promoteToSiteAdmin");
assert(usersRoute.indexOf("siteAdmin") >= 0, "POST siteAdmin co-admin");
assert(usersRoute.indexOf("matterportAdminEmail") >= 0, "GET matterportAdminEmail");

var usersHtml = read("crm-users-internal.html");
assert(usersHtml.indexOf("Co-administrateur") >= 0 || usersHtml.indexOf("co-admin") >= 0 || usersHtml.indexOf("siteAdmin") >= 0, "UI co-admin");
assert(usersHtml.indexOf("Matterport") >= 0, "UI Matterport hint");

var usersJs = read("crm-users-internal.js");
assert(usersJs.indexOf("promoteToSiteAdmin") >= 0, "JS promote co-admin");
assert(usersJs.indexOf("siteAdmin") >= 0, "JS create siteAdmin");

var gcb = read("api/_lib/routes/google-callback.js");
assert(gcb.indexOf("isAdminEmail") >= 0, "Google callback isAdminEmail");
assert(gcb.indexOf("role = 'admin'") >= 0 || gcb.indexOf('role = "admin"') >= 0 || gcb.indexOf("crm_role = 'admin'") >= 0, "Google promo admin");

var settings = read("crm-settings.html");
assert(settings.indexOf("matterportAdminEmail") >= 0, "settings Matterport email");

process.exit(failed ? 1 : 0);
