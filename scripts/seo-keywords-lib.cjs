/**
 * Mots-clés SEO — clusters + meta par URL (titles, descriptions, maillage).
 */
const CLUSTERS = require("../data/seo-keyword-clusters.json").clusters;
const PAGE_META = require("../data/seo-page-meta.json").pages;
const { SITE_ORIGIN: SITE } = require("./site-url.cjs");

var pathIndex = {};
PAGE_META.forEach(function (p) {
  pathIndex[normalizePath(p.path)] = p;
});

function normalizePath(path) {
  var p = String(path || "").split("?")[0];
  if (!p.startsWith("/")) p = "/" + p;
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  if (p.endsWith("/index.html")) p = p.replace(/\/index\.html$/, "") || "/";
  return p;
}

function resolvePageMeta(pathOrCanonical, defaults) {
  var key = normalizePath(pathOrCanonical.replace(SITE, ""));
  var hit = pathIndex[key];
  var d = defaults || {};
  if (!hit) {
    return {
      title: d.title || "",
      description: d.description || "",
      keywords: d.keywords || keywordsForPath(key),
      h1: d.h1 || "",
    };
  }
  return {
    title: hit.title || d.title || "",
    description: hit.description || d.description || "",
    keywords: hit.keywords || keywordsForPath(key),
    h1: hit.h1 || d.h1 || "",
  };
}

function keywordsForPath(path) {
  var p = normalizePath(path);
  var best = null;
  CLUSTERS.forEach(function (c) {
    (c.moneyPages || []).forEach(function (mp) {
      if (normalizePath(mp) === p || p.indexOf(normalizePath(mp)) === 0) best = c;
    });
  });
  if (!best) {
    CLUSTERS.forEach(function (c) {
      if (p.indexOf("/assurance-vtc") === 0 && c.id === "vtc") best = c;
      if (p.indexOf("/assurance-sante") === 0 && c.id === "mutuelle") best = c;
      if (p.indexOf("/credit-immo") === 0 && c.id === "credit-immo") best = c;
      if (p.indexOf("/assurance-animaux") === 0 && c.id === "animaux") best = c;
      if (p.indexOf("/assurance-habitation") === 0 && c.id === "habitation") best = c;
      if (p.indexOf("/assurance-chasse") === 0 && c.id === "chasse") best = c;
      if (p.indexOf("/assurance-equitation") === 0 && c.id === "equitation") best = c;
      if (p.indexOf("/assurance-animaux/chien/pas-cher") === 0 && c.id === "animaux-longtail") best = c;
    });
  }
  if (!best) return "devis assurance France, courtier ORIAS, Leads Opportunities";
  return [best.primary].concat(best.longTail || []).join(", ");
}

function clusterForBlogArticle(article) {
  var file = String(article.file || "");
  var section = article.section || "";
  var hay = (article.title || "") + " " + file + " " + section;
  if (/vtc|chauffeur|uber|bolt|heetch/i.test(hay)) return clusterById("vtc");
  if (/mutuelle|sant[eé]|optique|dentaire|hospitalisation/i.test(hay)) return clusterById("mutuelle");
  if (/cr[eé]dit|emprunt|immobilier|lemoine|pret|prêt/i.test(hay)) return clusterById("credit-immo");
  if (/chien|chat|animaux|veterinaire/i.test(hay)) return clusterById("animaux");
  if (/chasse|chasseur|courre|gibier/i.test(hay)) return clusterById("chasse");
  if (/equitation|cheval|cavalier|equestre/i.test(hay)) return clusterById("equitation");
  if (/habitation|locataire|multirisque|logement/i.test(hay)) return clusterById("habitation");
  if (section === "vtc") return clusterById("vtc");
  if (section === "sante") return clusterById("mutuelle");
  if (section === "finance") return clusterById("credit-immo");
  if (section === "habitat") return clusterById("habitation");
  if (section === "animaux") return clusterById("animaux");
  return null;
}

function clusterById(id) {
  for (var i = 0; i < CLUSTERS.length; i++) {
    if (CLUSTERS[i].id === id) return CLUSTERS[i];
  }
  return null;
}

function moneyLinksHtml(cluster) {
  if (!cluster || !cluster.moneyPages || !cluster.moneyPages.length) return "";
  var labels = {
    "/assurance-vtc/": "Devis assurance VTC",
    "/landings/vtc.html": "Formulaire VTC",
    "/assurance-vtc/paris/": "VTC Paris",
    "/assurance-sante/": "Mutuelle santé",
    "/landings/sante.html": "Comparatif mutuelle",
    "/assurance-sante/paris/": "Mutuelle Paris",
    "/credit-immo/": "Crédit immobilier",
    "/landings/credit-immo.html": "Simulation crédit",
    "/credit-immo/simulation/": "Simulateur prêt",
    "/assurance-animaux/": "Assurance animaux",
    "/landings/animaux.html": "Devis animaux",
    "/assurance-habitation/": "Assurance habitation",
  };
  var items = cluster.moneyPages.slice(0, 4).map(function (href) {
    var label = labels[href] || href.replace(/^\//, "").replace(/\/$/, "");
    var rel = href.indexOf("/landings/") === 0 ? "../" + href.replace(/^\//, "") : "../" + href.replace(/^\//, "");
    if (href.indexOf("/assurance-") === 0 || href.indexOf("/credit-") === 0) rel = ".." + href;
    return '        <li><a href="' + rel + '">' + label + "</a></li>\n";
  });
  return (
    '      <div class="article-links article-links--money">\n' +
    '        <h2>Obtenir un devis</h2>\n' +
    "        <ul>\n" +
    items.join("") +
    "        </ul>\n      </div>\n"
  );
}

function metaKeywordsTag(path, defaults) {
  var kw = resolvePageMeta(path, defaults).keywords;
  if (!kw) return "";
  return '<meta name="keywords" content="' + String(kw).replace(/"/g, "&quot;") + '" />\n  ';
}

module.exports = {
  resolvePageMeta: resolvePageMeta,
  keywordsForPath: keywordsForPath,
  clusterForBlogArticle: clusterForBlogArticle,
  moneyLinksHtml: moneyLinksHtml,
  metaKeywordsTag: metaKeywordsTag,
  CLUSTERS: CLUSTERS,
};
