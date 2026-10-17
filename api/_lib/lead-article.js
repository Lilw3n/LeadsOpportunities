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

var OFFICE_NATIONAL = "0651366222";
try {
  var brandPhone = require("../../scripts/france-brand.cjs").PHONE_NATIONAL;
  if (brandPhone) OFFICE_NATIONAL = String(brandPhone).replace(/\D/g, "");
} catch (e) {
  /* numéro du cabinet déjà posé */
}

var PLACEHOLDER_PHONES = {
  "0612345678": 1,
  "0123456789": 1,
  "0102030405": 1,
  "0601020304": 1,
  "0701020304": 1,
  "0611111111": 1,
  "0600000000": 1,
  "0700000000": 1,
  "0900000000": 1,
  "0606060606": 1,
};

function isPlaceholderPhone(national) {
  if (PLACEHOLDER_PHONES[national]) return true;
  var body = national.slice(1);
  if (/^(\d)\1{8}$/.test(body)) return true;
  if (body === "123456789" || body === "987654321" || body === "012345678") return true;
  var asc = true;
  var desc = true;
  for (var i = 1; i < body.length; i++) {
    var prev = Number(body.charAt(i - 1));
    var cur = Number(body.charAt(i));
    if (cur !== (prev + 1) % 10) asc = false;
    if (cur !== (prev + 9) % 10) desc = false;
  }
  return asc || desc;
}

/** Mobile ou fixe français à 10 chiffres. Hors : cabinet, exemple, indicatif étranger. */
function frenchCallablePhone(value) {
  var raw = String(value || "").trim();
  if (!raw || /[a-z]/i.test(raw)) return "";
  var d = raw.replace(/\D/g, "");
  if (d.indexOf("0033") === 0) d = d.slice(2);
  if (d.indexOf("330") === 0 && d.length === 12) d = "0" + d.slice(3);
  else if (d.indexOf("33") === 0 && d.length === 11) d = "0" + d.slice(2);
  if (!/^0[1-79]\d{8}$/.test(d)) return "";
  if (d === OFFICE_NATIONAL || isPlaceholderPhone(d)) return "";
  return d;
}

function formatFrenchPhone(national) {
  return String(national || "").replace(/(\d{2})(?=\d)/g, "$1 ").trim();
}

function clientName(row) {
  var payload = payloadObject(row);
  var name = [payload.firstName || payload.first_name || payload.prenom, payload.lastName || payload.last_name || payload.nom]
    .filter(Boolean)
    .join(" ")
    .trim();
  if (!name) name = String(payload.fullName || payload.name || "").trim();
  return name.slice(0, 80);
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

function telHref(national) {
  if (!national || national.length !== 10) return "";
  return "tel:+33" + national.slice(1);
}

function buildCallQueue(rows, clickMap) {
  var queue = [];
  (rows || []).forEach(function (row) {
    var copy = decorateLeadArticle(Object.assign({}, row), clickMap);
    if (!copy.questionnaire_filled) return;
    var national = frenchCallablePhone(copy.phone);
    if (!national) return;
    var status = String(copy.status || "new").toLowerCase();
    if (status === "lost" || status === "converted" || status === "won") return;
    var money = moneyMeta(copy);
    queue.push({
      id: copy.id || null,
      name: clientName(copy),
      phone: formatFrenchPhone(national),
      phone_national: national,
      tel: telHref(national),
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
  var seen = {};
  queue = queue.filter(function (item) {
    if (seen[item.phone_national]) return false;
    seen[item.phone_national] = 1;
    return true;
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
  frenchCallablePhone,
  loadArticleClickMap,
  articleCatalog,
};
