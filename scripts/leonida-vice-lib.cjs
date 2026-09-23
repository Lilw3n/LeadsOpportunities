/**
 * Pont blog GTA → leonida-vice.com (hub GTA VI).
 */
var LEONIDA_ORIGIN = "https://www.leonida-vice.com";

var GTA_ARTICLE_FILES = [
  "gta-6-sortie-assurance-gaming-materiel.html",
  "gta-6-pret-immobilier-budget-gaming.html",
  "gta-6-precommande-ps5-pro-credit-conso-france.html",
  "gta-6-ps5-pro-budget-1000-euros-pret-conso.html",
  "pret-conso-gaming-ps5-pro-gta6-comparatif-2026.html",
  "gta-6-fuites-cyberleek-memecoin-arnaque-france.html",
  "gta-6-fuites-rockstar-cybersecurite-assurance.html",
  "gta-6-leak-netflix-extended-look-precommande-budget.html",
  "gta-6-netflix-extended-look-immobilier-france-2026.html",
];

/** Chemin Leonida selon l’angle de l’article */
var PATH_BY_FILE = {
  "gta-6-sortie-assurance-gaming-materiel.html": "/boutique",
  "gta-6-pret-immobilier-budget-gaming.html": "/",
  "gta-6-precommande-ps5-pro-credit-conso-france.html": "/boutique",
  "gta-6-ps5-pro-budget-1000-euros-pret-conso.html": "/boutique",
  "pret-conso-gaming-ps5-pro-gta6-comparatif-2026.html": "/boutique",
  "gta-6-fuites-cyberleek-memecoin-arnaque-france.html": "/fans",
  "gta-6-fuites-rockstar-cybersecurite-assurance.html": "/actu",
  "gta-6-leak-netflix-extended-look-precommande-budget.html": "/blog",
  "gta-6-netflix-extended-look-immobilier-france-2026.html": "/blog",
};

var LABEL_BY_PATH = {
  "/": "Hub GTA VI — Leonida Vice",
  "/boutique": "Boutique GTA VI — Leonida Vice",
  "/actu": "Actu GTA VI — Leonida Vice",
  "/blog": "Blog GTA VI — Leonida Vice",
  "/fans": "Fans & fuites — Leonida Vice",
  "/pro": "Leonida Vice Pro",
};

var HOOK_BY_PATH = {
  "/": "Après la lecture : le hub GTA VI (actu, boutique, fans) sur Leonida Vice.",
  "/boutique": "Console, précommande, goodies : la boutique GTA VI est sur Leonida Vice.",
  "/actu": "Fuites, trailer, day-one : suivez l’actu GTA VI sur Leonida Vice.",
  "/blog": "Analyses et guides GTA VI : continuez sur le blog Leonida Vice.",
  "/fans": "Communauté, fuites et vigilance arnaques : espace fans Leonida Vice.",
};

function isGtaArticleFile(file) {
  var f = String(file || "").replace(/^.*\//, "");
  if (GTA_ARTICLE_FILES.indexOf(f) !== -1) return true;
  return /gta-?6|gta6/i.test(f);
}

function slugFromFile(file) {
  return String(file || "")
    .replace(/^.*\//, "")
    .replace(/\.html$/i, "");
}

function leonidaUrl(fileOrSlug, pathOverride) {
  var file = String(fileOrSlug || "");
  if (!/\.html$/i.test(file) && file.indexOf("/") === -1) {
    file = file + ".html";
  }
  var baseFile = file.replace(/^.*\//, "");
  var path = pathOverride || PATH_BY_FILE[baseFile] || "/";
  var slug = slugFromFile(baseFile);
  var u = new URL(path, LEONIDA_ORIGIN);
  u.searchParams.set("utm_source", "leadsopportunities");
  u.searchParams.set("utm_medium", "blog");
  u.searchParams.set("utm_campaign", "gta6");
  u.searchParams.set("utm_content", slug);
  return u.toString();
}

function leonidaCta(file) {
  var baseFile = String(file || "").replace(/^.*\//, "");
  var path = PATH_BY_FILE[baseFile] || "/";
  return {
    href: leonidaUrl(baseFile, path),
    label: LABEL_BY_PATH[path] || "Leonida Vice — hub GTA VI",
    path: path,
  };
}

/** Pont questionnaire → Leonida (boutons bridge des articles GTA). */
function leonidaBridge(file) {
  var cta = leonidaCta(file);
  var hub = leonidaUrl(file, "/");
  var path = cta.path;
  return {
    need: "gta6",
    questionnaire: cta.href,
    landing: hub,
    express: null,
    hook: HOOK_BY_PATH[path] || HOOK_BY_PATH["/"],
    question: "Continuer sur Leonida Vice — hub GTA VI ?",
    primaryLabel: cta.label,
    landingLabel: LABEL_BY_PATH["/"] || "Hub Leonida Vice",
    questionnaireLabel: cta.label,
    expressLabel: null,
    species: null,
    section: "actu",
    matchedRule: "leonida-vice",
    partner: "leonida-vice",
  };
}

/** Applique CTA + lien related Leonida sur un article manifest. */
function applyLeonidaToArticle(article) {
  if (!article || !isGtaArticleFile(article.file)) return article;
  var cta = leonidaCta(article.file);
  article.cta = { href: cta.href, label: cta.label };
  article.related = Array.isArray(article.related) ? article.related.slice() : [];
  var has = article.related.some(function (r) {
    return r && /leonida-vice\.com/i.test(String(r.href || ""));
  });
  if (!has) {
    article.related.unshift({ href: cta.href, label: cta.label });
  }
  // Retirer les landings LO en tête des related (garde les articles internes)
  article.related = article.related.filter(function (r) {
    return !r || !/landings\//i.test(String(r.href || ""));
  });
  return article;
}

module.exports = {
  LEONIDA_ORIGIN,
  GTA_ARTICLE_FILES,
  PATH_BY_FILE,
  isGtaArticleFile,
  leonidaUrl,
  leonidaCta,
  leonidaBridge,
  applyLeonidaToArticle,
  slugFromFile,
};
