#!/usr/bin/env node
/**
 * Pose les liens de maillage partenariat + VTC ↔ Assurance VTC France
 * sur les landings, articles et le hub VTC. Idempotent.
 */
var fs = require("fs");
var path = require("path");
var LT = require("./seo-long-term-related.cjs");

var root = path.join(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}
function write(rel, text) {
  fs.writeFileSync(path.join(root, rel), text, "utf8");
}

function fromLanding(href) {
  if (href.indexOf("/landings/") === 0) return "." + href.slice("/landings".length);
  if (href.indexOf("/blog/") === 0) return ".." + href;
  if (href.charAt(0) === "/") return ".." + href;
  return href;
}

function fromBlog(href) {
  if (href.indexOf("http") === 0) return href;
  if (href.charAt(0) === "/") return ".." + href;
  return href;
}

var landingFiles = {
  "/landings/ramonage.html": "landings/ramonage.html",
  "/landings/esthetique-bien-etre.html": "landings/esthetique-bien-etre.html",
  "/landings/salles-loisirs.html": "landings/salles-loisirs.html",
  "/landings/padel.html": "landings/padel.html",
  "/landings/immeuble-professionnel.html": "landings/immeuble-professionnel.html",
  "/landings/decennale.html": "landings/decennale.html",
  "/landings/convoyage-vehicules.html": "landings/convoyage-vehicules.html",
  "/landings/garage-negociant-auto.html": "landings/garage-negociant-auto.html",
  "/landings/multirisque-professionnelle.html": "landings/multirisque-professionnelle.html",
  "/landings/rc-pro.html": "landings/rc-pro.html",
  "/landings/metiers-batiment.html": "landings/metiers-batiment.html",
  "/landings/transport-logistique.html": "landings/transport-logistique.html",
  "/landings/transport-voyageurs.html": "landings/transport-voyageurs.html",
};
require("./metiers-suite-catalog.cjs").forEach(function (item) {
  landingFiles["/landings/" + item.file] = "landings/" + item.file;
});

var blogByLanding = {};
Object.keys(LT.PARTENARIAT).forEach(function (id) {
  LT.PARTENARIAT[id].forEach(function (link) {
    if (link.href.indexOf("/blog/") === 0) {
      var landing = LT.PARTENARIAT[id].filter(function (l) {
        return l.href.indexOf("/landings/") === 0;
      })[0];
      if (landing) blogByLanding[landing.href] = "blog" + link.href.slice("/blog".length);
    }
  });
});

var changed = [];

Object.keys(LT.PARTENARIAT).forEach(function (id) {
  var links = LT.PARTENARIAT[id];
  var self = links.filter(function (l) {
    return landingFiles[l.href];
  })[0];
  if (!self) return;
  var rel = landingFiles[self.href];
  var html = read(rel);
  var extras = links
    .filter(function (l) {
      return l.href !== self.href;
    })
    .slice(0, 3);
  extras.forEach(function (l) {
    var href = fromLanding(l.href);
    if (html.indexOf(href) >= 0) return;
    var snippet = ' · <a href="' + href + '">' + l.label + "</a>";
    var marker = "toutes les niches</a>";
    var at = html.indexOf(marker);
    if (at < 0) return;
    html = html.slice(0, at + marker.length) + snippet + html.slice(at + marker.length);
    changed.push(rel + " +" + href);
  });
  write(rel, html);

  var blogRel = blogByLanding[self.href];
  if (!blogRel || !fs.existsSync(path.join(root, blogRel))) return;
  var blog = read(blogRel);
  extras.forEach(function (l) {
    var href = fromBlog(l.href);
    if (l.href === self.href) return;
    if (blogRel.indexOf(path.basename(l.href)) >= 0) return;
    if (blog.indexOf('href="' + href + '"') >= 0) return;
    var li = '          <li><a href="' + href + '">' + l.label + "</a></li>\n";
    var anchor = '          <li><a href="../assurances-niches.html">Assurances de niche</a></li>\n';
    if (blog.indexOf(anchor) < 0) return;
    blog = blog.replace(anchor, anchor + li);
    changed.push(blogRel + " +" + href);
  });
  write(blogRel, blog);
});

var vtcHub = "assurance-vtc/index.html";
var vtcHtml = read(vtcHub);
if (vtcHtml.indexOf("assurancevtcfrance.com") < 0) {
  var li =
    '<li><a href="https://www.assurancevtcfrance.com/">Assurance VTC France</a></li>';
  var ul = 'class="seo-related"><';
  var idx = vtcHtml.indexOf('class="seo-related">');
  if (idx >= 0) {
    var close = vtcHtml.indexOf("</ul>", idx);
    if (close > idx) {
      vtcHtml = vtcHtml.slice(0, close) + li + vtcHtml.slice(close);
      write(vtcHub, vtcHtml);
      changed.push(vtcHub + " +AVF");
    }
  }
}

var avf = "assurance-vtc-france/index.html";
var avfHtml = read(avf);
var avfHref = "https://www.leadsopportunities.fr/assurance-vtc/";
if (avfHtml.indexOf(avfHref) < 0) {
  avfHtml = avfHtml.replace(
    '<a href="https://www.leadsopportunities.fr/">leadsopportunities.fr</a>',
    '<a href="https://www.leadsopportunities.fr/">leadsopportunities.fr</a> · <a href="' +
      avfHref +
      '">hub assurance VTC</a>'
  );
  write(avf, avfHtml);
  changed.push(avf + " +hub VTC");
}

console.log(changed.length ? changed.join("\n") : "Maillage déjà en place");
