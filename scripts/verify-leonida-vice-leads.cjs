#!/usr/bin/env node
/** Vérifie le pack Leonida Vice → articles leads (conso, habitation, prêt 54). */
var fs = require("fs");
var path = require("path");
var articles = require("./blog-leonida-vice-articles.cjs");
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

assert(articles.length >= 3, "au moins 3 articles Leonida Vice");

var must = [
  "leonida-vice-gta-6-compte-a-rebours-budget-france.html",
  "leonida-vice-communaute-gta-6-assurance-setup-france.html",
  "leonida-vice-vice-city-immobilier-pret-nancy-metropole.html",
];
var files = articles.map(function (a) {
  return a.file;
});
must.forEach(function (f) {
  assert(files.indexOf(f) >= 0, "module contient " + f);
});

articles.forEach(function (a) {
  assert(a.audience === "france", a.file + " audience france");
  assert(a.keywords && a.keywords.length >= 3, a.file + " keywords");
  assert(a.cta && a.cta.href.indexOf("../landings/") === 0, a.file + " CTA landing");
  assert(
    (a.blocks || []).some(function (b) {
      return b.type === "bridge";
    }),
    a.file + " bloc bridge"
  );
  var body = (a.blocks || [])
    .filter(function (b) {
      return b.type === "p" || b.type === "ul" || b.type === "ol";
    })
    .map(function (b) {
      return b.text || (b.items || []).join(" ");
    })
    .join(" ");
  assert(/leonida-vice\.com/.test(body), a.file + " lien partenaire");
  assert(/utm_campaign=leonida_vice/.test(body), a.file + " UTM campagne");
  assert(/landings\//.test(body), a.file + " liens leads inline");
  assert(body.indexOf("Varengeville") === -1, a.file + " pas de typo Varengeville");
});

var immo = articles.find(function (a) {
  return a.file === "leonida-vice-vice-city-immobilier-pret-nancy-metropole.html";
});
assert(immo, "article prêt Nancy");
var immoBody = (immo.blocks || [])
  .map(function (b) {
    return b.text || (b.items || []).join(" ");
  })
  .join(" ");
assert(/pret-immobilier\/nancy-metropole/.test(immoBody), "lien hub Nancy métropole");
assert(/Varangéville/.test(immoBody), "orthographe Varangéville");
assert(/Jarville/.test(immoBody), "mention Jarville");

assert(read("scripts/blog-articles-manifest.cjs").indexOf("blog-leonida-vice-articles") !== -1, "manifeste charge le module");

var kw = JSON.parse(read("data/blog-actu-keywords.json"));
assert(kw.leadCta && kw.leadCta.conso, "leadCta conso");
assert(
  (kw.rules || []).some(function (r) {
    return (r.keywords || []).some(function (k) {
      return String(k).toLowerCase().indexOf("leonida") !== -1;
    });
  }),
  "keywords Leonida Vice"
);

var feeds = JSON.parse(read("data/blog-actu-feeds.json"));
assert(
  (feeds.feeds || []).some(function (f) {
    return f.id === "google-news-gta6-france";
  }),
  "flux Google News GTA 6 FR"
);
assert(
  (feeds.feeds || []).some(function (f) {
    return f.id === "google-news-leonida-vice";
  }),
  "flux Google News Leonida Vice"
);

var enrich = read("scripts/blog-actu-enrich.cjs");
assert(enrich.indexOf("isGamingActu") !== -1, "enrich isGamingActu");
assert(enrich.indexOf("ANGLES.conso") !== -1, "enrich angle conso");

var partners = JSON.parse(read("data/partner-sites.json"));
assert(
  (partners.sites || []).some(function (s) {
    return s.id === "leonida-vice" && s.active !== false;
  }),
  "partenaire leonida-vice actif"
);

var map = JSON.parse(read("data/blog-questionnaire-map.json"));
must.forEach(function (f) {
  assert(map.articles && map.articles[f], "map questionnaire " + f);
});

var gsc = require("./seo-gsc-priority-urls.cjs");
must.forEach(function (f) {
  assert(gsc.GSC_INDEX_NOW_PRIORITY.indexOf("/blog/" + f) >= 0, "GSC " + f);
});

must.forEach(function (f) {
  var htmlPath = path.join(root, "blog", f);
  assert(fs.existsSync(htmlPath), "HTML " + f);
  if (fs.existsSync(htmlPath)) {
    var html = read("blog/" + f);
    assert(html.indexOf("landings/") >= 0, f + " lien landing");
    assert(html.indexOf("article-bridge") >= 0, f + " bridge HTML");
    assert(html.indexOf("leonida-vice.com") >= 0, f + " partenaire HTML");
    assert(html.indexOf("Varengeville") === -1, f + " HTML sans typo Varengeville");
  }
});

var immoHtmlPath = path.join(root, "blog", "leonida-vice-vice-city-immobilier-pret-nancy-metropole.html");
if (fs.existsSync(immoHtmlPath)) {
  var immoHtml = read("blog/leonida-vice-vice-city-immobilier-pret-nancy-metropole.html");
  assert(immoHtml.indexOf("nancy-metropole") !== -1, "HTML hub Nancy");
  assert(immoHtml.indexOf("Varangéville") !== -1, "HTML Varangéville");
}

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nTous les checks Leonida Vice leads OK");
