/**
 * Article source d'un lead + compteur questionnaire (contact + formulaire envoyé).
 * Les clics viennent des événements blog (cartes, CTA, liens), pas des vues.
 */
const {
  resolveLeadArticle,
  isFilledQuestionnaireLead,
  attributeBlogClick,
} = require("./blog-stats");

var catalogCache = null;
var clickCache = { at: 0, map: null };

function articleCatalog() {
  if (catalogCache) return catalogCache;
  var by = {};
  try {
    var manifest = require("../../scripts/blog-articles-manifest.cjs");
    var list = manifest.articles || [];
    list.forEach(function (a) {
      if (!a || !a.file) return;
      var slug = String(a.file).replace(/\.html$/i, "");
      by[slug] = { slug: slug, title: a.title || slug, path: "/blog/" + a.file };
    });
  } catch (e) {
    /* manifeste optionnel */
  }
  catalogCache = by;
  return by;
}

function decorateLeadArticle(row, clickMap) {
  if (!row) return row;
  var resolved = resolveLeadArticle(row);
  var filled = isFilledQuestionnaireLead(row);
  var slug =
    resolved && resolved.slug && resolved.slug !== "index" && resolved.slug !== "(landing blog/forum)"
      ? resolved.slug
      : "";
  var art = slug ? articleCatalog()[slug] : null;
  row.questionnaire_filled = !!filled;
  row.article_slug = slug || null;
  row.article_title = art ? art.title : slug || null;
  row.article_path = art ? art.path : slug ? "/blog/" + slug + ".html" : null;
  row.article_clicks = slug ? Number((clickMap && clickMap[slug]) || 0) : 0;
  return row;
}

var MONEY_PRODUCTS = [
  { re: /vtc|taxi/, rank: 1, label: "VTC", step: "Rappeler, puis envoyer le dossier au grossiste VTC." },
  { re: /sante|mutuelle|collective/, rank: 2, label: "Mutuelle", step: "Rappeler, puis envoyer le dossier au grossiste santé." },
  { re: /mrp|rc-pro|rc_pro|decennale|garage|batiment|transport/, rank: 3, label: "Professionnel", step: "Le questionnaire décrit l'activité. Rappeler : le grossiste tarife." },
  { re: /emprunteur/, rank: 4, label: "Emprunteur", step: "Rappeler pour la délégation. Le partenaire crédit place le contrat." },
  { re: /credit|immo|habitation|habitat/, rank: 5, label: "Crédit ou habitation", step: "Rappeler. Le partenaire prêt ou habitation reprend le dossier." },
  { re: /auto/, rank: 6, label: "Auto", step: "Rappeler, puis envoyer au grossiste auto." },
];

function phoneDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function payloadObject(row) {
  var payload = row && row.payload;
  if (!payload) return {};
  if (typeof payload === "object") return payload;
  try {
    var parsed = JSON.parse(payload);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (e) {
    return {};
  }
}

function moneyMeta(row) {
  var payload = payloadObject(row);
  var blob = [row && row.vertical, row && row.seo_product, row && row.landing_slug, payload.need, payload.vertical, payload.product]
    .join(" ")
    .toLowerCase();
  for (var i = 0; i < MONEY_PRODUCTS.length; i++) {
    if (MONEY_PRODUCTS[i].re.test(blob)) return MONEY_PRODUCTS[i];
  }
  return { rank: 9, label: "Autre dossier", step: "Rappeler. Le questionnaire dit quel contrat envoyer au grossiste." };
}

function telHref(phone) {
  var digits = phoneDigits(phone);
  if (digits.length === 10 && digits.charAt(0) === "0") digits = "33" + digits.slice(1);
  if (digits.length === 11 && digits.indexOf("33") === 0) return "tel:+" + digits;
  if (digits.length >= 9) return "tel:+" + digits;
  return "";
}

function buildCallQueue(rows, clickMap) {
  var queue = [];
  (rows || []).forEach(function (row) {
    var copy = decorateLeadArticle(Object.assign({}, row), clickMap);
    if (!copy.questionnaire_filled) return;
    if (phoneDigits(copy.phone).length < 9) return;
    var status = String(copy.status || "new").toLowerCase();
    if (status === "lost" || status === "converted" || status === "won") return;
    var money = moneyMeta(copy);
    queue.push({
      id: copy.id || null,
      phone: String(copy.phone || "").trim(),
      tel: telHref(copy.phone),
      email: copy.email || "",
      status: status,
      created_at: copy.created_at || null,
      product: money.label,
      rank: money.rank,
      step: money.step,
      article_title: copy.article_title || "",
      article_path: copy.article_path || "",
    });
  });
  queue.sort(function (a, b) {
    if (a.rank !== b.rank) return a.rank - b.rank;
    var aNew = a.status === "new" ? 0 : 1;
    var bNew = b.status === "new" ? 0 : 1;
    if (aNew !== bNew) return aNew - bNew;
    return String(b.created_at || "").localeCompare(String(a.created_at || ""));
  });
  return queue.slice(0, 15);
}

function summarizeQuestionnaireLeads(rows, clickMap) {
  var by = {};
  var total = 0;
  (rows || []).forEach(function (row) {
    var copy = decorateLeadArticle(Object.assign({}, row), clickMap);
    if (!copy.questionnaire_filled) return;
    total++;
    var key = copy.article_slug || "(sans article)";
    if (!by[key]) {
      by[key] = {
        slug: copy.article_slug || "",
        title: copy.article_title || "Questionnaire sans article de blog",
        path: copy.article_path || "",
        clicks: copy.article_clicks || 0,
        questionnaire_leads: 0,
      };
    }
    by[key].questionnaire_leads++;
  });
  var articles = Object.keys(by)
    .map(function (k) {
      return by[k];
    })
    .sort(function (a, b) {
      var q = (b.questionnaire_leads || 0) - (a.questionnaire_leads || 0);
      if (q) return q;
      return (b.clicks || 0) - (a.clicks || 0);
    });
  return { questionnaire_total: total, articles: articles.slice(0, 20) };
}

async function loadArticleClickMap(sql) {
  if (!sql) return {};
  if (clickCache.map && Date.now() - clickCache.at < 60000) return clickCache.map;
  var map = {};
  try {
    var since = new Date(Date.now() - 30 * 86400000).toISOString();
    var rows = await sql`
      SELECT event_type, page_path, meta
      FROM journey_events
      WHERE created_at >= ${since}
        AND event_type IN ('blog_card_click', 'blog_cta_click', 'blog_link_click')
      ORDER BY created_at DESC
      LIMIT 4000
    `;
    (rows || []).forEach(function (row) {
      var attr = attributeBlogClick(row);
      if (!attr.slug || attr.slug === "index" || attr.slug === "(autre)") return;
      map[attr.slug] = (map[attr.slug] || 0) + 1;
    });
  } catch (e) {
    map = {};
  }
  clickCache = { at: Date.now(), map: map };
  return map;
}

module.exports = {
  decorateLeadArticle,
  summarizeQuestionnaireLeads,
  buildCallQueue,
  loadArticleClickMap,
  articleCatalog,
};
