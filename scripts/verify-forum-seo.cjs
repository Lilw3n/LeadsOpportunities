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
  });
});

var entries = getForumSitemapEntries("https://www.leadsopportunities.fr");
assert(entries.length >= 10, "sitemap entries forum >= 10 (got " + entries.length + ")");

var hub = fs.readFileSync(path.join(ROOT, "forum", "index.html"), "utf8");
assert(hub.indexOf("Facebook") >= 0 || hub.indexOf("facebook") >= 0, "hub mention Facebook");
(DATA.seoPhrases || []).slice(0, 3).forEach(function (p) {
  assert(hub.indexOf(p) >= 0, "phrase SEO hub: " + p);
});

console.log(ok ? "verify:forum-seo OK" : "verify:forum-seo FAILED");
process.exit(ok ? 0 : 1);
