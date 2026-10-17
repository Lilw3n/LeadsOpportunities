#!/usr/bin/env node
/**
 * File publique pour n8n auto-hébergé : un article = un post organique.
 * Aucun prix inventé. Les sujets hors France (audience international) restent dehors.
 */
var fs = require("fs");
var path = require("path");

var SITE = require("./site-url.cjs").SITE_ORIGIN;
var manifest = require("./blog-articles-manifest.cjs");
var images = require("./blog-article-images.cjs");
var social = require("../config/social-links.json");

var RANK = {
  vtc: 1,
  sante: 2,
  collective: 2,
  pro: 3,
  partenariat: 3,
  finance: 4,
  habitat: 5,
  auto: 6,
  vsp: 6,
};

var facebook = (social.links || []).filter(function (link) {
  return link.id === "facebook";
})[0];
var facebookPageId = "";
if (facebook && facebook.url) {
  var match = String(facebook.url).match(/[?&]id=(\d+)/);
  if (match) facebookPageId = match[1];
}

function sectionCta(sectionId) {
  var sections = manifest.sections || [];
  for (var i = 0; i < sections.length; i++) {
    if (sections[i].id === sectionId && sections[i].cta && sections[i].cta.href) return sections[i].cta.href;
  }
  return "../landings/questionnaire.html?need=sante&journey=standard";
}

function absFromBlog(href) {
  var raw = String(href || "").trim();
  if (!raw) return SITE + "/landings/questionnaire.html?need=sante&journey=standard";
  if (raw.indexOf("http") === 0) return raw;
  var rel = raw.replace(/^\.\.\//, "/").replace(/^\.\//, "/blog/");
  if (rel.charAt(0) !== "/") rel = "/" + rel;
  return SITE + rel.split("#")[0];
}

function absImage(src) {
  var raw = String(src || "").trim();
  if (!raw) return "";
  if (raw.indexOf("http") === 0) return raw;
  if (raw.indexOf("./") === 0) return SITE + "/blog/" + raw.slice(2);
  if (raw.charAt(0) === "/") return SITE + raw;
  return SITE + "/blog/" + raw;
}

function withUtm(url, source) {
  var join = url.indexOf("?") >= 0 ? "&" : "?";
  return url + join + "utm_source=" + source + "&utm_medium=organic&utm_campaign=blog-n8n";
}

function plain(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildQueue() {
  var posts = [];
  (manifest.articles || []).forEach(function (article, index) {
    if (!article || !article.file || !article.title) return;
    if (article.audience === "international") return;
    if (/€/.test(article.title) || /€/.test(article.cardExcerpt || "") || /€/.test(article.description || "")) return;
    var copy = {
      file: article.file,
      section: article.section,
      title: article.title,
      heroImage: article.heroImage,
      skipImages: article.skipImages,
      blocks: [],
    };
    images.applyArticleImages(copy);
    var slug = String(article.file).replace(/\.html$/i, "");
    var url = SITE + "/blog/" + article.file;
    var devis = absFromBlog(sectionCta(article.section));
    var line = plain(article.cardExcerpt || article.description).slice(0, 180);
    var message = [
      article.title,
      "",
      line,
      "",
      "Article : " + withUtm(url, "facebook"),
      "Devis : " + withUtm(devis, "facebook"),
      "",
      "Courtier ORIAS n° 15005935. Le prix est fixé après l'étude du dossier.",
    ].join("\n");
    posts.push({
      url: url,
      link: withUtm(url, "facebook"),
      linkedinLink: withUtm(url, "linkedin"),
      devis: withUtm(devis, "facebook"),
      title: article.title,
      section: article.section || "",
      rank: RANK[article.section] || 9,
      order: index,
      image: absImage(copy.heroImage && copy.heroImage.src),
      message: message,
      facebookPageId: facebookPageId,
    });
  });
  posts.sort(function (a, b) {
    if (a.rank !== b.rank) return a.rank - b.rank;
    return a.order - b.order;
  });
  return {
    generated: new Date().toISOString().slice(0, 10),
    site: SITE,
    facebookPageId: facebookPageId,
    count: posts.length,
    posts: posts,
  };
}

function writeQueue() {
  var data = buildQueue();
  var dest = path.join(__dirname, "..", "social", "queue.json");
  fs.writeFileSync(dest, JSON.stringify(data, null, 2) + "\n");
  return data;
}

module.exports = { buildQueue: buildQueue, writeQueue: writeQueue };

if (require.main === module) {
  var data = writeQueue();
  console.log("social/queue.json : " + data.count + " articles");
}
