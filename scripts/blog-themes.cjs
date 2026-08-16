/**
 * Thèmes blog : produits (section) + sujets transverses (canicule, seniors…).
 * Un article peut appartenir à plusieurs thèmes.
 */

var PRODUCT_THEMES = {
  actu: { label: "Actu & tendances", tagClass: "tag-actu", group: "produit" },
  sante: { label: "Santé & mutuelle", tagClass: "tag-sante", group: "produit" },
  habitat: { label: "Habitation", tagClass: "tag-habitation", group: "produit" },
  auto: { label: "Auto & mobilité", tagClass: "tag-auto", group: "produit" },
  animaux: { label: "Animaux", tagClass: "tag-animaux", group: "produit" },
  vtc: { label: "VTC & chauffeurs", tagClass: "tag-vtc", group: "produit" },
  prevoyance: { label: "Prévoyance", tagClass: "tag-prevoyance", group: "produit" },
  pro: { label: "Pro & RC", tagClass: "tag-pro", group: "produit" },
  patrimoine: { label: "Patrimoine", tagClass: "tag-patrimoine", group: "produit" },
  finance: { label: "Crédit & immo", tagClass: "tag-immo", group: "produit" },
};

var TOPIC_THEMES = {
  canicule: { label: "Canicule", tagClass: "tag-canicule", group: "sujet" },
  seniors: { label: "Seniors", tagClass: "tag-seniors", group: "sujet" },
  voyage: { label: "Voyage & déplacements", tagClass: "tag-voyage", group: "sujet" },
  gaming: { label: "Gaming & culture", tagClass: "tag-gaming", group: "sujet" },
  emprunteur: { label: "Emprunteur", tagClass: "tag-emprunteur", group: "sujet" },
  "pret-refuse": { label: "Prêt refusé", tagClass: "tag-actu", group: "sujet" },
  politique: { label: "Politique & élections", tagClass: "tag-politique", group: "sujet" },
  economie: { label: "Économie & inflation", tagClass: "tag-economie", group: "sujet" },
  cuisine: { label: "Cuisine & foyer", tagClass: "tag-cuisine", group: "sujet" },
};

var ALL_THEMES = Object.assign({}, PRODUCT_THEMES, TOPIC_THEMES);

/** Mots-clés dans le tag → thèmes sujet additionnels */
var TAG_KEYWORDS = [
  { re: /canicule/i, themes: ["canicule"] },
  { re: /senior/i, themes: ["seniors"] },
  { re: /emprunteur|rachat|taux|frais|immo|cr[eé]dit|gta 6/i, themes: ["emprunteur"] },
  { re: /refus[eé]|prêt refusé|pret refuse|endettement 35|hcsf|ficp/i, themes: ["pret-refuse", "emprunteur"] },
  { re: /ligue des champions|coupe du monde|formule 1|voyage/i, themes: ["voyage"] },
  { re: /gaming|gta|zelda|streamer/i, themes: ["gaming"] },
  { re: /pr[eé]sident|trump|g7|inflation|march[eé]/i, themes: ["politique", "economie"] },
  { re: /inflation/i, themes: ["economie"] },
  { re: /hospitalisation|mutuelle|optique|dentaire|sant[eé]/i, themes: ["sante"] },
  { re: /habitation|pno|sinistre|locataire|bailleur/i, themes: ["habitat"] },
  { re: /chien|chat|chiot|animaux|v[eé]t[oé]/i, themes: ["animaux"] },
  { re: /cuisine|friteuse|robot cuiseur|renovation cuisine|meal prep/i, themes: ["cuisine"] },
  { re: /vtc|chauffeur|plateforme|uber/i, themes: ["vtc"] },
  { re: /prevoyance|d[eé]c[eè]s|famille/i, themes: ["prevoyance"] },
  { re: /rc pro|freelance|artisan|pro/i, themes: ["pro"] },
  { re: /assurance-vie|patrimoine|[eé]pargne|retraite/i, themes: ["patrimoine"] },
];

var MONTHS = {
  janvier: 1,
  fevrier: 2,
  février: 2,
  mars: 3,
  avril: 4,
  mai: 5,
  juin: 6,
  juillet: 7,
  aout: 8,
  août: 8,
  septembre: 9,
  octobre: 10,
  novembre: 11,
  decembre: 12,
  décembre: 12,
};

function resolveThemes(article) {
  var set = new Set();
  if (article.section) set.add(article.section);
  if (Array.isArray(article.themes)) {
    article.themes.forEach(function (t) {
      set.add(t);
    });
  }
  var tag = article.tag || "";
  TAG_KEYWORDS.forEach(function (rule) {
    if (rule.re.test(tag)) {
      rule.themes.forEach(function (t) {
        set.add(t);
      });
    }
  });
  return Array.from(set).filter(function (id) {
    return ALL_THEMES[id];
  });
}

function parseArticleDate(meta) {
  if (!meta) return 0;
  var m = meta.match(/·\s*([A-Za-zéû]+)\s+(\d{4})/);
  if (!m) return 0;
  var month = MONTHS[m[1].toLowerCase()] || 0;
  return parseInt(m[2], 10) * 100 + month;
}

function themeChipsHtml(themeIds) {
  return themeIds
    .map(function (id) {
      var t = ALL_THEMES[id];
      if (!t) return "";
      return (
        '<span class="blog-theme-chip ' +
        t.tagClass +
        '" data-theme="' +
        id +
        '">' +
        t.label +
        "</span>"
      );
    })
    .join("");
}

function collectUsedThemes(articles) {
  var counts = {};
  articles.forEach(function (a) {
    resolveThemes(a).forEach(function (id) {
      counts[id] = (counts[id] || 0) + 1;
    });
  });
  return counts;
}

module.exports = {
  PRODUCT_THEMES: PRODUCT_THEMES,
  TOPIC_THEMES: TOPIC_THEMES,
  ALL_THEMES: ALL_THEMES,
  resolveThemes: resolveThemes,
  parseArticleDate: parseArticleDate,
  themeChipsHtml: themeChipsHtml,
  collectUsedThemes: collectUsedThemes,
};
