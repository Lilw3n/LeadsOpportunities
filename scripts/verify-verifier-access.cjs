#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
let ok = true;

function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL", msg);
    ok = false;
  } else {
    console.log("OK  ", msg);
  }
}

var lib = fs.readFileSync(path.join(ROOT, "api/_lib/verifier-access.js"), "utf8");
assert(lib.indexOf("MrRollin") !== -1, "défaut MrRollin");
assert(lib.indexOf("LEGAL_VERIFIER_EMAILS") !== -1, "env LEGAL_VERIFIER_EMAILS");
assert(lib.indexOf("wendy.buchet@gmail.com") !== -1, "wendy.buchet@gmail.com vérificateur");
assert(lib.indexOf("isVerifierSharedPassword") !== -1, "helper shared password");

var login = fs.readFileSync(path.join(ROOT, "api/_lib/routes/login.js"), "utf8");
assert(login.indexOf("isVerifierSharedPassword") !== -1, "login accepte mdp partagé");
assert(login.indexOf("auth_provider = CASE") !== -1 || login.indexOf("auth_provider") !== -1, "dissocie / both");
assert(login.indexOf("indépendant") !== -1 || login.indexOf("independant") !== -1 || login.indexOf("Continuer avec Google") !== -1, "message Google indépendant");

var site = fs.readFileSync(path.join(ROOT, "api/_lib/routes/site-access.js"), "utf8");
assert(site.indexOf("legalLock") !== -1, "site-access legalLock");

var authAction = fs.readFileSync(path.join(ROOT, "api/auth/[action].js"), "utf8");
assert(authAction.indexOf("site-access") !== -1, "wire site-access");

var authHtml = fs.readFileSync(path.join(ROOT, "auth.html"), "utf8");
assert(authHtml.indexOf("authLockBanner") !== -1, "UI bannière lock");
assert(authHtml.indexOf("revue juridique") !== -1, "texte revue juridique");
assert(authHtml.indexOf("/api/auth/site-access") !== -1, "fetch site-access");
assert(authHtml.indexOf("MrRollin") !== -1, "hint MrRollin");

console.log(ok ? "verify:verifier-access OK" : "verify:verifier-access FAILED");
process.exit(ok ? 0 : 1);
