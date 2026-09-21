#!/usr/bin/env node
"use strict";

var fs = require("fs");
var path = require("path");
var root = path.join(__dirname, "..");

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL", msg);
    process.exit(1);
  }
  console.log("OK  ", msg);
}

assert(exists("assets/brand/logo-mark.png"), "logo-mark.png");
assert(exists("assets/brand/logo-banner.jpg"), "logo-banner.jpg");
assert(exists("assets/logo.png"), "assets/logo.png");
assert(exists("favicon.png"), "favicon.png");
assert(exists("apple-touch-icon.png"), "apple-touch-icon.png");
assert(exists("og/og-brand.jpg"), "og-brand.jpg");

var brand = read("scripts/france-brand.cjs");
assert(brand.indexOf("logo-mark.png") !== -1, "france-brand utilise logo-mark");
assert(brand.indexOf("logoImgHtml") !== -1, "france-brand logoImgHtml");

var index = read("index.html");
assert(index.indexOf("/assets/brand/logo-banner.jpg") !== -1, "accueil bannière");
assert(index.indexOf("favicon.png") !== -1, "accueil favicon");
assert(index.indexOf("og/og-brand.jpg") !== -1, "accueil og brand");
assert(index.indexOf("hero-brand-banner") !== -1, "hero bannière marque");

assert(read("main.css").indexOf("logo-banner-img") !== -1, "CSS logo banner");
assert(read("blog/blog.css").indexOf("logo-mark.png") !== -1, "blog CSS logo");
assert(read("seo/seo-pages.css").indexOf("logo-mark.png") !== -1, "seo CSS logo");

var tenant = JSON.parse(read("config/tenant-brand.json"));
assert(tenant.branding.logoBannerPath.indexOf("logo-banner") !== -1, "tenant banner path");
assert(tenant.contact.phone === "0651366222", "numéro pro national");
assert(tenant.contact.phoneE164 === "+33651366222", "numéro pro E.164");
assert(index.indexOf("tel:+33651366222") !== -1, "accueil lien tel");
assert(index.indexOf("06 51 36 62 22") !== -1, "accueil affichage numéro");
assert(index.indexOf("+33695820866") === -1, "ancien numéro absent de l'accueil");
assert(read("mentions-legales.html").indexOf("06 51 36 62 22") !== -1, "mentions légales numéro pro");

console.log("\nMarque logo / bannière : OK.");
