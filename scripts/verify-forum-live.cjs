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

assert(fs.existsSync(path.join(ROOT, "api/_lib/forum-store.js")), "forum-store");
assert(fs.existsSync(path.join(ROOT, "api/_lib/routes/public-forum.js")), "public-forum route");
assert(fs.existsSync(path.join(ROOT, "js/forum-app.js")), "forum-app.js");

var api = fs.readFileSync(path.join(ROOT, "api/[action].js"), "utf8");
assert(api.indexOf("forum:") !== -1 || api.indexOf('forum:') !== -1, "api/[action] forum");
assert(api.indexOf("public-forum") !== -1, "api wire public-forum");

var store = fs.readFileSync(path.join(ROOT, "api/_lib/forum-store.js"), "utf8");
assert(store.indexOf("forum_categories") !== -1, "table forum_categories");
assert(store.indexOf("forum_topics") !== -1, "table forum_topics");
assert(store.indexOf("forum_posts") !== -1, "table forum_posts");
assert(store.indexOf("forum_topic_links") !== -1, "table forum_topic_links");
assert(store.indexOf("seedForumIfEmpty") !== -1, "seed SEO → DB");
assert(store.indexOf("searchBlogSuggestions") !== -1, "suggest articles blog");

var route = fs.readFileSync(path.join(ROOT, "api/_lib/routes/public-forum.js"), "utf8");
assert(route.indexOf("create-topic") !== -1, "op create-topic");
assert(route.indexOf("reply") !== -1, "op reply");
assert(route.indexOf("link-article") !== -1, "op link-article");
assert(route.indexOf("getAuthUser") !== -1, "auth required for write");

var app = fs.readFileSync(path.join(ROOT, "js/forum-app.js"), "utf8");
assert(app.indexOf("/api/auth/login") !== -1, "login");
assert(app.indexOf("/api/auth/register") !== -1, "register");
assert(app.indexOf("link-article") !== -1, "UI link article");
assert(app.indexOf("data-forum-live") !== -1 || app.indexOf("[data-forum-live]") !== -1, "mount selector");

var hub = fs.readFileSync(path.join(ROOT, "forum/index.html"), "utf8");
assert(hub.indexOf("data-forum-live") !== -1, "hub mount live");
assert(hub.indexOf("forum-app.js") !== -1, "hub charge forum-app.js");
assert(hub.indexOf("Créer un compte") !== -1 || hub.indexOf("Creer un compte") !== -1 || hub.indexOf("#/auth/register") !== -1, "CTA compte");

var css = fs.readFileSync(path.join(ROOT, "forum/forum.css"), "utf8");
assert(css.indexOf("flive-cat") !== -1, "css live cats");

var vercel = fs.readFileSync(path.join(ROOT, "vercel.json"), "utf8");
assert(vercel.indexOf('"/mutuelle-sante"') !== -1, "redirect /mutuelle-sante → forum");
assert(vercel.indexOf("/forum/mutuelle-sante/") !== -1, "redirect destination forum mutuelle");

var ensure = fs.readFileSync(path.join(ROOT, "api/_lib/ensure-schema.js"), "utf8");
assert(ensure.indexOf("ensureForumSchema") !== -1, "ensure-schema forum");

var pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
assert(!!(pkg.scripts && pkg.scripts["verify:forum-live"]), "npm verify:forum-live");

console.log(ok ? "verify:forum-live OK" : "verify:forum-live FAILED");
process.exit(ok ? 0 : 1);
