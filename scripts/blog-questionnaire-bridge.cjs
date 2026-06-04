/**
 * Pont intelligent blog → questionnaire / landing / express
 */
const fs = require("fs");
const path = require("path");

let _map = null;

function loadMap() {
  if (_map) return _map;
  var p = path.join(__dirname, "..", "data", "blog-questionnaire-map.json");
  _map = JSON.parse(fs.readFileSync(p, "utf8"));
  return _map;
}

function normalizeText(article) {
  var parts = [article.title, article.tag, article.description, article.section];
  var blocks = article._manifestBlocks || article.blocks || [];
  blocks.forEach(function (b) {
    if (b.text) parts.push(b.text.replace(/<[^>]+>/g, " "));
    if (b.items) parts = parts.concat(b.items);
  });
  return parts.join(" ").toLowerCase();
}

function matchKeywordRule(text, rules) {
  var best = null;
  var bestScore = 0;
  (rules || []).forEach(function (rule) {
    var score = 0;
    (rule.match || []).forEach(function (kw) {
      var k = kw.toLowerCase();
      if (text.indexOf(k) >= 0) score += k.length;
    });
    if (score > bestScore) {
      bestScore = score;
      best = rule;
    }
  });
  return bestScore > 0 ? best : null;
}

function resolveBridge(article) {
  var map = loadMap();
  var section = map.sections[article.section] || map.sections.actu;
  var fileKey = article.file;
  var override = (map.articles && map.articles[fileKey]) || {};
  if (override.section && map.sections[override.section]) {
    section = map.sections[override.section];
  }
  var fromRule = matchKeywordRule(normalizeText(article), map.keywordRules);
  if (article.section === "actu") {
    fromRule = null;
  }
  var ruleSection = fromRule && fromRule.section ? map.sections[fromRule.section] : null;
  var base = ruleSection || section;
  if (article.cta && article.cta.href) {
    base = Object.assign({}, base, { landing: article.cta.href });
  }

  var species = override.species || (fromRule && fromRule.species) || null;
  var hook = override.hook || (fromRule && fromRule.hook) || base.hook;
  var question = override.question || (fromRule && fromRule.question) || base.question;

  if (species === "chat" && question.indexOf("animal") >= 0) {
    question = "Avez-vous pensé à assurer votre chat ?";
  }
  if (species === "chien" && question.indexOf("compagnon") >= 0) {
    question = "Avez-vous pensé à assurer votre chien ?";
  }

  var primaryLabel = override.primaryLabel || base.primaryLabel;
  if (species === "chat" && primaryLabel.indexOf("animaux") >= 0 && primaryLabel.indexOf("chat") === -1) {
    primaryLabel = "Devis assurance chat";
  }
  if (species === "chien" && primaryLabel.indexOf("animaux") >= 0 && primaryLabel.indexOf("chien") === -1) {
    primaryLabel = "Devis assurance chien";
  }

  return {
    need: override.need || base.need,
    questionnaire: override.questionnaire || base.questionnaire,
    landing: override.landing || (article.cta && article.cta.href) || base.landing,
    express: override.express || base.express,
    hook: hook,
    question: question,
    primaryLabel: primaryLabel,
    expressLabel: override.expressLabel || base.expressLabel,
    species: species,
    section: override.section || article.section,
    matchedRule: fromRule ? fromRule.id : null,
  };
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderBridgeHtml(bridge, opts) {
  opts = opts || {};
  var mid = opts.variant === "mid";
  var tag = mid ? "aside" : "div";
  var cls = mid ? "article-bridge article-bridge--mid" : "article-bridge article-bridge--footer";
  return (
    "      <" +
    tag +
    ' class="' +
    cls +
    '" data-need="' +
    esc(bridge.need) +
    '"' +
    (bridge.species ? ' data-species="' + esc(bridge.species) + '"' : "") +
    ">\n" +
    '        <p class="article-bridge-kicker">' +
    (mid ? "💡 À retenir" : "🛡️ Et maintenant ?") +
    "</p>\n" +
    '        <p class="article-bridge-hook">' +
    esc(bridge.hook) +
    "</p>\n" +
    '        <p class="article-bridge-question"><strong>' +
    esc(bridge.question) +
    "</strong></p>\n" +
    '        <div class="article-bridge-actions">\n' +
    '          <a class="btn btn-primary" href="' +
    esc(bridge.landing) +
    '">' +
    esc(bridge.primaryLabel) +
    "</a>\n" +
    (bridge.express
      ? '          <a class="btn btn-outline" href="' +
        esc(bridge.express) +
        '">' +
        esc(bridge.expressLabel) +
        "</a>\n"
      : "") +
    '          <a class="btn btn-soft" href="' +
    esc(bridge.questionnaire) +
    '">Questionnaire</a>\n' +
    "        </div>\n" +
    "      </" +
    tag +
    ">\n"
  );
}

function listAdminRows(manifestArticles) {
  return manifestArticles.map(function (a) {
    var b = resolveBridge(a);
    return {
      file: a.file,
      title: a.title,
      section: a.section,
      hook: b.hook,
      question: b.question,
      need: b.need,
      landing: b.landing,
      express: b.express,
      questionnaire: b.questionnaire,
      matchedRule: b.matchedRule,
      species: b.species,
    };
  });
}

module.exports = {
  loadMap: loadMap,
  resolveBridge: resolveBridge,
  renderBridgeHtml: renderBridgeHtml,
  listAdminRows: listAdminRows,
};
