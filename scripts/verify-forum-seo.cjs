#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { getForumSitemapEntries, DATA } = require("./generate-forum.cjs");

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

assert(DATA.themes && DATA.themes.length >= 4, "au moins 4 thèmes");
var totalThreads = DATA.themes.reduce(function (n, t) {
  return n + (t.threads ? t.threads.length : 0);
}, 0);
assert(totalThreads >= 20, "au moins 20 questions SEO (got " + totalThreads + ")");
assert(fs.existsSync(path.join(ROOT, "forum", "index.html")), "forum/index.html");
assert(fs.existsSync(path.join(ROOT, "forum", "forum.css")), "forum.css");
assert(fs.existsSync(path.join(ROOT, "js", "forum-ask.js")), "forum-ask.js");

DATA.themes.forEach(function (t) {
  var idx = path.join(ROOT, "forum", t.slug, "index.html");
  assert(fs.existsSync(idx), "thème " + t.slug);
  var html = fs.readFileSync(idx, "utf8");
  assert(html.indexOf("og:image") >= 0, t.slug + " og:image (Facebook)");
  assert(html.indexOf("contact@leadsopportunities.fr") >= 0, t.slug + " email contact");
  assert(html.indexOf("data-forum-ask") >= 0, t.slug + " formulaire demande");
  assert(html.indexOf("facebook.com/sharer") >= 0, t.slug + " partage Facebook");
  t.threads.forEach(function (th) {
    var p = path.join(ROOT, "forum", t.slug, th.slug + ".html");
    assert(fs.existsSync(p), "fil " + th.slug);
    var thHtml = fs.readFileSync(p, "utf8");
    assert(thHtml.indexOf("QAPage") >= 0, th.slug + " schema QAPage");
    assert(thHtml.indexOf("DiscussionForumPosting") >= 0, th.slug + " DiscussionForumPosting");
    assert(thHtml.indexOf(th.question.slice(0, 20)) >= 0, th.slug + " titre question");
    assert(thHtml.indexOf("forum-post--question") >= 0, th.slug + " layout fil forum");
    assert(thHtml.indexOf("Recherches associées") >= 0, th.slug + " phrases SEO");
  });
});

var entries = getForumSitemapEntries("https://www.leadsopportunities.fr");
assert(entries.length >= 25, "sitemap entries forum >= 25 (got " + entries.length + ")");

var hub = fs.readFileSync(path.join(ROOT, "forum", "index.html"), "utf8");
assert(hub.indexOf("Facebook") >= 0 || hub.indexOf("facebook") >= 0, "hub mention Facebook");
assert(hub.indexOf("forum-table") >= 0, "hub tableau questions (vrai forum)");
assert(hub.indexOf("toutes-les-questions") >= 0, "hub ancre toutes les questions");
assert(hub.indexOf("data-hub-ask") >= 0, "hub formulaire poser question");
assert(hub.indexOf("ItemList") >= 0, "hub schema ItemList SEO");
(DATA.seoPhrases || []).slice(0, 3).forEach(function (p) {
  assert(hub.indexOf(p) >= 0, "phrase SEO hub: " + p);
});
// au moins une question de chaque thème listée sur le hub
DATA.themes.forEach(function (t) {
  var th = t.threads[0];
  assert(hub.indexOf(th.slug + ".html") >= 0, "hub liste fil " + th.slug);
});

var askJs = fs.readFileSync(path.join(ROOT, "js", "forum-ask.js"), "utf8");
assert(askJs.indexOf("forum_theme_select") >= 0, "forum-ask : sélecteur thème hub");

console.log(ok ? "verify:forum-seo OK — " + totalThreads + " questions" : "verify:forum-seo FAILED");
process.exit(ok ? 0 : 1);
