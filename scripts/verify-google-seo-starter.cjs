#!/usr/bin/env node
"use strict";
/**
 * Vérifie les points du Google SEO Starter Guide sur pages clés.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
let ok = true;

function assert(c, m) {
  if (!c) {
    console.error("FAIL", m);
    ok = false;
  } else console.log("OK  ", m);
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

// robots — ne pas bloquer CSS/JS (starter guide)
var robots = read("robots.txt");
assert(robots.indexOf("Allow: /css/") >= 0 || robots.indexOf("Allow: /") >= 0, "robots autorise exploration large");
assert(robots.indexOf("Sitemap:") >= 0, "robots déclare Sitemap");
assert(robots.indexOf("/forum/") >= 0, "robots mentionne /forum/");

// Home
var home = read("index.html");
assert(/<title>[^<]{10,}<\/title>/.test(home), "home title");
assert(home.indexOf('rel="canonical"') >= 0, "home canonical");
assert(home.indexOf('name="viewport"') >= 0, "home viewport mobile");
assert((home.match(/<h1[\s>]/g) || []).length === 1, "home un seul h1");
assert(home.indexOf('href="./forum/"') >= 0, "home lien Forum (maillage)");

// Forum thread sample
var thread = "forum/mutuelle-sante/combien-coute-vraiment-une-bonne-mutuelle-en-2026.html";
assert(fs.existsSync(path.join(ROOT, thread)), "fil forum existe");
var th = read(thread);
assert(th.indexOf("QAPage") >= 0, "QAPage schema");
assert(th.indexOf("BreadcrumbList") >= 0, "BreadcrumbList schema");
assert(th.indexOf("DiscussionForumPosting") >= 0, "DiscussionForumPosting");
assert(th.indexOf("Wendy Buchet") >= 0, "E-E-A-T auteur Wendy Buchet");
assert(th.indexOf("upvoteCount") >= 0, "QAPage upvoteCount (guide Google)");
assert(th.indexOf("#acceptedAnswer") >= 0, "answer url #acceptedAnswer");
assert(th.indexOf("og:image") >= 0, "og:image Facebook/Google");
assert(th.indexOf('<ol class="forum-bc-list">') >= 0, "fil d'Ariane visible");
assert(th.indexOf("seo-author-box") >= 0, "bloc expertise visible");

// Org schema export
var org = require("./seo-org-schema.cjs");
assert(org.AUTHOR && org.AUTHOR.name === "Wendy Buchet", "AUTHOR Person export");
assert(org.ORG.orias === "15005935", "ORIAS");

// Landings maillage
assert(read("landings/sante.html").indexOf("/forum/mutuelle-sante/") >= 0, "landing sante → forum");
assert(read("landings/vtc.html").indexOf("/forum/assurance-vtc/") >= 0, "landing vtc → forum");
assert(read("landings/credit-immo.html").indexOf("/forum/credit-immobilier/") >= 0, "landing crédit → forum");

console.log(ok ? "verify:google-seo-starter OK" : "verify:google-seo-starter FAILED");
process.exit(ok ? 0 : 1);
