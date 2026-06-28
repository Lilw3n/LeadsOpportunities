#!/usr/bin/env node
/**
 * Genere des articles evergreen orientes leads quand l'actu ne suffit pas.
 *
 * Usage:
 *   npm run blog:evergreen
 *   npm run blog:evergreen -- --count=2
 *   npm run blog:evergreen -- --dry-run
 */
const {
  appendPendingArticle,
  ctaWithUtm,
  existingFiles,
  monthLabel,
  readJson,
  relatedForSection,
  slugify,
  uniqueFile,
  writeJson,
} = require("./blog-actu-lib.cjs");

function arg(name, def) {
  var m = process.argv.find(function (a) {
    return a.indexOf("--" + name + "=") === 0;
  });
  if (!m) return def;
  return m.split("=").slice(1).join("=");
}

function daysSince(iso) {
  if (!iso) return Infinity;
  var t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return Infinity;
  return (Date.now() - t) / 86400000;
}

function loadConfig() {
  return readJson("blog-evergreen-topics.json", { cooldownDays: 45, topics: [] });
}

function loadState() {
  return readJson("blog-evergreen-state.json", {
    nextIndex: 0,
    publishedTopics: {},
    runs: [],
  });
}

function alreadyPublishedRecently(topic, state, cooldownDays) {
  var info = (state.publishedTopics || {})[topic.id];
  return info && daysSince(info.at) < cooldownDays;
}

function topicFileExists(topic) {
  var files = existingFiles();
  var slug = slugify(topic.slug || topic.title);
  return files.has(slug + ".html");
}

function pickNextTopic(config, state, usedIds) {
  var topics = config.topics || [];
  if (!topics.length) return null;
  var cooldownDays = Number(config.cooldownDays || 45);
  var start = Number(state.nextIndex || 0) % topics.length;

  for (var step = 0; step < topics.length; step++) {
    var index = (start + step) % topics.length;
    var topic = topics[index];
    if (!topic || usedIds[topic.id]) continue;
    if (alreadyPublishedRecently(topic, state, cooldownDays)) continue;
    if (topicFileExists(topic)) continue;
    state.nextIndex = (index + 1) % topics.length;
    return topic;
  }

  return null;
}

function paragraph(text) {
  return { type: "p", text: text };
}

function list(items) {
  return { type: "ul", items: items || [] };
}

function buildArticle(topic) {
  var file = uniqueFile(slugify(topic.slug || topic.title));
  var need = topic.need || "habitation";
  var related = topic.related || relatedForSection(topic.section || "actu", need);
  var cta = ctaWithUtm(need, topic.id || topic.slug || topic.title);

  return {
    file: file,
    section: topic.section || "actu",
    tag: topic.tag || "Guide assurance",
    tagClass: topic.tagClass || "tag-actu",
    themes: topic.themes || [],
    title: topic.title,
    description: topic.description,
    meta: "8 min · " + monthLabel(),
    cardExcerpt: topic.cardExcerpt || topic.description,
    cta: cta,
    source: {
      name: "evergreen-lead-calendar",
      url: "",
      fetchedAt: new Date().toISOString(),
    },
    blocks: [
      paragraph(
        "<strong>" +
          topic.title +
          "</strong> repond a une intention simple : " +
          topic.intent +
          " C'est typiquement le moment ou un questionnaire court evite de comparer des contrats incomparables."
      ),
      { type: "h2", text: "Le signal qui doit vous faire verifier le contrat" },
      paragraph(
        topic.trigger +
          " Dans ces situations, le risque n'est pas seulement de payer trop cher : c'est surtout de decouvrir une franchise, un plafond ou une exclusion au mauvais moment."
      ),
      { type: "h2", text: "Les garanties a controler en priorite" },
      list(topic.checklist),
      { type: "bridge" },
      { type: "h2", text: "Les erreurs qui transforment un devis en mauvais lead" },
      list(topic.mistakes),
      { type: "h2", text: "Methode rapide : qualifier avant de comparer" },
      paragraph(
        "Le bon reflexe consiste a renseigner les donnees qui changent vraiment le tarif : situation, bien ou vehicule a assurer, garanties deja en place, sinistres, budget et urgence. Le questionnaire Leads Opportunities structure ces elements en quelques minutes avant un rappel courtier ORIAS."
      ),
      { type: "h2", text: "Quand demander un rappel" },
      paragraph(
        "Demandez un rappel si vous avez une echeance proche, un devis concurrent, un sinistre recent ou une situation qui sort du standard. Un conseiller peut alors verifier les garanties equivalentes et orienter vers les assureurs pertinents sans multiplier les formulaires."
      ),
    ],
    faq: topic.faq || [],
    related: related,
  };
}

function generateEvergreenArticles(count, opts) {
  opts = opts || {};
  var config = loadConfig();
  var state = loadState();
  state.publishedTopics = state.publishedTopics || {};
  state.runs = state.runs || [];

  var usedIds = {};
  var generated = [];
  var max = Math.max(1, Math.min(5, Number(count || 1)));

  for (var i = 0; i < max; i++) {
    var topic = pickNextTopic(config, state, usedIds);
    if (!topic) break;
    usedIds[topic.id] = true;
    var article = buildArticle(topic);
    generated.push({ topic: topic, article: article });
    if (!opts.dryRun) {
      appendPendingArticle(article);
      state.publishedTopics[topic.id] = {
        at: new Date().toISOString(),
        file: article.file,
        title: article.title,
        reason: opts.reason || "evergreen",
      };
    }
  }

  if (generated.length && !opts.dryRun) {
    state.lastRun = new Date().toISOString();
    state.runs.push({
      at: state.lastRun,
      count: generated.length,
      reason: opts.reason || "evergreen",
      articles: generated.map(function (entry) {
        return {
          topicId: entry.topic.id,
          file: entry.article.file,
          title: entry.article.title,
        };
      }),
    });
    if (state.runs.length > 50) state.runs = state.runs.slice(-50);
    writeJson("blog-evergreen-state.json", state);
  }

  return generated.map(function (entry) {
    return entry.article;
  });
}

function main() {
  var count = Math.max(1, Math.min(5, Number(arg("count", 1)) || 1));
  var dryRun = process.argv.indexOf("--dry-run") !== -1;
  var articles = generateEvergreenArticles(count, {
    dryRun: dryRun,
    reason: "manual",
  });

  if (!articles.length) {
    console.log("Aucun theme evergreen disponible (cooldown ou deja publie).");
    return;
  }

  console.log((dryRun ? "Simulation" : "Generation") + " evergreen:", articles.length, "article(s)");
  articles.forEach(function (article) {
    console.log("  -", article.file, "—", article.title);
  });
}

if (require.main === module) {
  main();
}

module.exports = {
  buildArticle: buildArticle,
  generateEvergreenArticles: generateEvergreenArticles,
  pickNextTopic: pickNextTopic,
};
