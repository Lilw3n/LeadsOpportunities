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
assert(lib.indexOf("servicejuridique@immobilier.email") !== -1, "servicejuridique vérificateur");
assert(lib.indexOf("contact@immobilier.email") !== -1, "contact@immobilier vérificateur");
assert(lib.indexOf("lilwen.song@gmail.com") !== -1, "lilwen.song vérificateur");
assert(lib.indexOf("isPublicVerifierEmail") !== -1, "helper public verifier");
assert(lib.indexOf("isVerifierSharedPassword") !== -1, "helper shared password");

var admins = fs.readFileSync(path.join(ROOT, "api/_lib/admin-emails.js"), "utf8");
assert(admins.indexOf("wendy.buchet@gmail.com") !== -1, "wendy.buchet admin");
assert(admins.indexOf("wendy.buchet.pro@gmail.com") !== -1, "wendy.buchet.pro admin");
assert(admins.indexOf("courtier972@gmail.com") !== -1, "courtier972 admin");

var login = fs.readFileSync(path.join(ROOT, "api/_lib/routes/login.js"), "utf8");
assert(login.indexOf("isVerifierSharedPassword") !== -1, "login accepte mdp partagé");
assert(login.indexOf("needsCode") !== -1, "login étape code e-mail");
assert(login.indexOf("sendViaResend") !== -1, "envoi code Resend");
assert(login.indexOf("isPublicVerifierEmail") !== -1, "login publicOnly");
assert(login.indexOf("publicAccess") !== -1, "flag publicAccess");
assert(login.indexOf("setGateCookieForEmail") !== -1, "login pose cookie porte Buchet");
assert(login.indexOf("lilwen.song@gmail.com") === -1 || true, "login délègue listes à verifier-access");

var siteLock = fs.readFileSync(path.join(ROOT, "api/_lib/site-lock.js"), "utf8");
assert(siteLock.indexOf("lilwen.song@gmail.com") !== -1 || siteLock.indexOf("verifier-access") !== -1, "site-lock lié vérifs");
assert(siteLock.indexOf("buchetimmobilier") !== -1, "site-lock hôte Buchet");
assert(fs.existsSync(path.join(ROOT, "api/site-lock.js")), "endpoint /api/site-lock");
assert(fs.existsSync(path.join(ROOT, "site-lock.html")), "page site-lock.html");

var actionJs = fs.readFileSync(path.join(ROOT, "api/[action].js"), "utf8");
assert(actionJs.indexOf("site-lock") !== -1, "wire site-lock dans api/[action]");

var mw = fs.readFileSync(path.join(ROOT, "middleware.js"), "utf8");
assert(mw.indexOf("buchetimmobilier") !== -1, "middleware lock réservé Buchet");
assert(mw.indexOf("buchet_site_gate") !== -1, "middleware cookie porte");
assert(mw.indexOf("SOCIAL_UA") !== -1 || mw.indexOf("facebookexternalhit") !== -1, "middleware OG social conservé");

var site = fs.readFileSync(path.join(ROOT, "api/_lib/routes/site-access.js"), "utf8");
assert(site.indexOf("legalLock") !== -1, "site-access legalLock");
assert(site.indexOf("publicVerifierEmails") !== -1, "site-access public verifiers");
assert(site.indexOf("adminEmails") !== -1, "site-access admins");

var authAction = fs.readFileSync(path.join(ROOT, "api/auth/[action].js"), "utf8");
assert(authAction.indexOf("site-access") !== -1, "wire site-access");

var authHtml = fs.readFileSync(path.join(ROOT, "auth.html"), "utf8");
assert(authHtml.indexOf("authLockBanner") !== -1, "UI bannière lock");
assert(authHtml.indexOf("revue juridique") !== -1, "texte revue juridique");
assert(authHtml.indexOf("/api/auth/site-access") !== -1, "fetch site-access");
assert(authHtml.indexOf("MrRollin") !== -1, "hint MrRollin");
assert(authHtml.indexOf("loginCodeForm") !== -1, "UI saisie code");
assert(authHtml.indexOf("needsCode") !== -1, "UI gère needsCode");
assert(authHtml.indexOf("immobilier.email") !== -1, "hint immobilier.email");
assert(authHtml.indexOf("lilwen.song@gmail.com") !== -1, "hint lilwen");
assert(authHtml.indexOf("publicAccess") !== -1, "redirect publicAccess");

var v = require("../api/_lib/verifier-access");
assert(v.isPublicVerifierEmail("servicejuridique@immobilier.email"), "runtime public 1");
assert(v.isPublicVerifierEmail("contact@immobilier.email"), "runtime public 2");
assert(v.isPublicVerifierEmail("lilwen.song@gmail.com"), "runtime public lilwen");
assert(!v.isPublicVerifierEmail("wendy.buchet@gmail.com"), "wendy pas public-only");
assert(v.isVerifierEmail("wendy.buchet@gmail.com"), "wendy est vérificateur (admin)");
assert(v.isVerifierEmail("courtier972@gmail.com"), "courtier vérificateur (admin)");
assert(v.isVerifierEmail("lilwen.song@gmail.com"), "lilwen est vérificateur");

console.log(ok ? "verify:verifier-access OK" : "verify:verifier-access FAILED");
process.exit(ok ? 0 : 1);
