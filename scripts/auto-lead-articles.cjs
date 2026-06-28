#!/usr/bin/env node
/**
 * Pipeline evergreen leads : catalogue editorial -> article JSON -> blog + SEO.
 *
 * Usage:
 *   npm run blog:leads:auto
 *   npm run blog:leads:auto -- --count=2
 *   npm run blog:leads:auto -- --section=sante
 *   npm run blog:leads:auto -- --topic=mutuelle-senior-lunettes-progressives
 *   npm run blog:leads:auto -- --dry-run
 */
const { execSync } = require("child_process");
const path = require("path");
const {
  readJson,
  writeJson,
  slugify,
  uniqueFile,
  monthLabel,
  relatedForSection,
} = require("./blog-actu-lib.cjs");
const { appendPendingArticle } = require("./blog-actu-pending.cjs");

var ROOT = path.join(__dirname, "..");
var MAX_COUNT = 3;

function arg(name, def) {
  var m = process.argv.find(function (a) {
    return a.indexOf("--" + name + "=") === 0;
  });
  if (!m) return def;
  return m.split("=").slice(1).join("=");
}

function hasFlag(name) {
  return process.argv.indexOf("--" + name) !== -1;
}

function cleanText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .trim();
}

function sentence(value, fallback) {
  var out = cleanText(value || fallback || "");
  return out.replace(/\s+/g, " ");
}

function loadTopics() {
  var cfg = readJson("blog-lead-topics.json", { topics: [] });
  return (cfg.topics || []).filter(function (topic) {
    return topic && topic.enabled !== false && topic.id && topic.title;
  });
}

function loadState() {
  return readJson("blog-lead-state.json", {
    rotationIndex: 0,
    publishedTopicIds: [],
    publishedFiles: [],
    runs: [],
  });
}

function leadCta(topic, file) {
  var cfg = readJson("blog-actu-keywords.json", { leadCta: {} });
  var fallback = cfg.leadCta.habitation || {
    href: "../landings/questionnaire.html?need=habitation&journey=standard",
    label: "Questionnaire assurance (3 min)",
  };
  var base = cfg.leadCta[topic.need] || fallback;
  var href = base.href;
  var sep = href.indexOf("?") === -1 ? "?" : "&";
  return {
    href:
      href +
      sep +
      "utm_source=blog&utm_medium=lead_evergreen&utm_campaign=" +
      encodeURIComponent(topic.need || topic.section || "assurance") +
      "&utm_content=" +
      encodeURIComponent(slugify(topic.id || file).slice(0, 48)),
    label: base.label || "Questionnaire assurance (3 min)",
  };
}

function listItems(items, fallback) {
  var src = Array.isArray(items) && items.length ? items : fallback;
  return src.map(function (item) {
    return cleanText(item);
  });
}

function faqForTopic(topic) {
  var label = cleanText(topic.title).split(":")[0];
  var questions = listItems(topic.questions, [
    "Quelle garantie verifier en premier ?",
    "Quel budget mensuel viser ?",
    "Faut-il changer de contrat maintenant ?",
  ]);
  return [
    {
      q: "Pourquoi comparer maintenant ?",
      a:
        "Parce que les tarifs, exclusions et plafonds changent selon le profil. Un comparatif a garanties equivalentes evite de choisir seulement le prix.",
    },
    {
      q: "Le questionnaire Leads Opportunities est-il gratuit ?",
      a:
        "Oui. Il sert a qualifier le besoin, orienter vers le bon parcours et preparer un devis sans engagement.",
    },
    {
      q: "Quels documents preparer ?",
      a:
        "Contrat actuel, dernier avis d'echeance, devis ou justificatifs de situation. Le questionnaire precise ensuite les elements utiles.",
    },
    {
      q: questions[0],
      a:
        "Cette question permet de calibrer le niveau de garantie avant de solliciter un assureur ou un courtier.",
    },
    {
      q: "Cet article " + label + " remplace-t-il un conseil personnalise ?",
      a:
        "Non. Il donne les points de vigilance. Une etude personnalisee reste necessaire avant de resilier, souscrire ou accepter une exclusion.",
    },
  ];
}

function buildBlocks(topic) {
  var checklist = listItems(topic.checklist, [
    "Plafonds de remboursement",
    "Franchises et exclusions",
    "Delais de carence",
    "Assistance et options utiles",
    "Prix annuel hors promotion",
  ]);
  var signals = listItems(topic.signals, [
    "Contrat a echeance proche",
    "Changement de situation",
    "Devis ou facture recente",
  ]);
  var questions = listItems(topic.questions, [
    "Quel est votre besoin principal ?",
    "Quel budget souhaitez-vous respecter ?",
    "Avez-vous deja un contrat ou un devis ?",
  ]);

  return [
    {
      type: "p",
      text:
        "Vous cherchez a faire le point sur <strong>" +
        cleanText(topic.title) +
        "</strong>. Le bon contrat ne se choisit pas uniquement au prix : il doit correspondre a votre situation, a vos risques et au niveau de remboursement attendu.",
    },
    {
      type: "p",
      text:
        "<strong>Profil concerne :</strong> " +
        sentence(topic.audience, "Particuliers ou professionnels qui veulent comparer avant de souscrire.") +
        " <strong>Point de douleur :</strong> " +
        sentence(topic.pain, "Un mauvais contrat peut couter cher au moment du sinistre."),
    },
    {
      type: "h2",
      text: "Pourquoi comparer maintenant",
    },
    {
      type: "p",
      text:
        sentence(topic.promise, "Vous obtenez une methode claire pour comparer.") +
        " Dans la pratique, c'est souvent au moment d'un devis, d'un renouvellement, d'un achat ou d'un changement de situation que les ecarts entre contrats deviennent visibles.",
    },
    { type: "bridge" },
    {
      type: "h2",
      text: "Les garanties a verifier en priorite",
    },
    {
      type: "ul",
      items: checklist,
    },
    {
      type: "h2",
      text: "Signaux qui doivent declencher une comparaison",
    },
    {
      type: "ul",
      items: signals,
    },
    {
      type: "h2",
      text: "Les 3 questions a poser avant le devis",
    },
    {
      type: "ul",
      items: questions,
    },
    {
      type: "h2",
      text: "Comparer sans tomber dans le piege du prix seul",
    },
    {
      type: "p",
      text:
        "Deux contrats au meme tarif peuvent etre tres differents : franchise, plafond, exclusion, assistance, delai de carence ou condition de declaration. Le bon reflexe consiste a comparer <strong>a garanties equivalentes</strong>, puis a choisir le niveau de confort adapte au budget.",
    },
    {
      type: "h2",
      text: "Comment obtenir un accompagnement Leads Opportunities",
    },
    {
      type: "p",
      text:
        "Le questionnaire recueille le besoin, la situation, l'urgence et le type de contrat recherche. Ces informations permettent a un conseiller ORIAS de proposer le bon parcours : devis detaille, rappel express ou page produit specialisee, sans engagement.",
    },
  ];
}

function buildArticle(topic) {
  var baseSlug = topic.slug || slugify(topic.title);
  var file = uniqueFile(baseSlug);
  var keywords = listItems(topic.keywords, [
    "devis assurance",
    "comparatif assurance",
    "courtier ORIAS",
    "Leads Opportunities",
  ]);

  return {
    file: file,
    section: topic.section || "actu",
    themes: topic.themes || [],
    tag: topic.tag || "Guide assurance",
    tagClass: topic.tagClass || "tag-actu",
    title: topic.title,
    description: topic.description,
    meta: "9 min · " + monthLabel(),
    cardExcerpt: topic.cardExcerpt || topic.description,
    keywords: keywords,
    cta: leadCta(topic, file),
    source: {
      name: "lead-evergreen",
      topicId: topic.id,
      generatedAt: new Date().toISOString(),
    },
    blocks: buildBlocks(topic),
    faq: faqForTopic(topic),
    related: topic.related || relatedForSection(topic.section || "actu", topic.need),
  };
}

function matchesFilters(topic, opts) {
  if (opts.topicId && topic.id !== opts.topicId) return false;
  if (opts.section && topic.section !== opts.section && topic.need !== opts.section) return false;
  return true;
}

function pickTopics(topics, state, count, opts) {
  var published = new Set(state.publishedTopicIds || []);
  var selected = [];
  var used = new Set();
  var start = Math.max(0, Number(state.rotationIndex || 0)) % Math.max(1, topics.length);
  var maxSteps = opts.topicId || opts.section ? topics.length : topics.length * 2;

  for (var step = 0; step < maxSteps && selected.length < count; step++) {
    var index = (start + step) % topics.length;
    var topic = topics[index];
    if (!topic || used.has(topic.id)) continue;
    if (!matchesFilters(topic, opts)) continue;
    if (!opts.force && published.has(topic.id)) continue;
    selected.push({ topic: topic, index: index });
    used.add(topic.id);
  }

  return selected;
}

function publishGeneratedArticles(picks, dryRun) {
  var generated = [];
  picks.forEach(function (pick) {
    var article = buildArticle(pick.topic);
    generated.push({
      topic: pick.topic,
      index: pick.index,
      article: article,
    });
    console.log(
      "- [" +
        article.section +
        "] " +
        article.file +
        " <- " +
        pick.topic.id
    );
    if (!dryRun) appendPendingArticle(article);
  });
  return generated;
}

function updateState(state, generated, topicsLength) {
  var publishedTopicIds = new Set(state.publishedTopicIds || []);
  var publishedFiles = new Set(state.publishedFiles || []);
  generated.forEach(function (item) {
    publishedTopicIds.add(item.topic.id);
    publishedFiles.add(item.article.file);
  });

  state.updated = new Date().toISOString();
  state.rotationIndex = generated.length
    ? (generated[generated.length - 1].index + 1) % Math.max(1, topicsLength)
    : state.rotationIndex || 0;
  state.publishedTopicIds = Array.from(publishedTopicIds);
  state.publishedFiles = Array.from(publishedFiles);
  state.runs = state.runs || [];
  state.runs.push({
    at: state.updated,
    count: generated.length,
    topics: generated.map(function (item) {
      return item.topic.id;
    }),
    files: generated.map(function (item) {
      return item.article.file;
    }),
  });
  if (state.runs.length > 100) state.runs = state.runs.slice(-100);
  writeJson("blog-lead-state.json", state);
}

function main() {
  var count = Math.min(MAX_COUNT, Math.max(1, Number(arg("count", 1)) || 1));
  var dryRun = hasFlag("dry-run");
  var skipPublish = hasFlag("skip-publish");
  var opts = {
    topicId: arg("topic", ""),
    section: arg("section", ""),
    force: hasFlag("force-republish"),
  };
  var topics = loadTopics();
  var state = loadState();
  var picks = pickTopics(topics, state, count, opts);

  console.log("=== Auto lead articles ===");
  console.log(
    "count:",
    count,
    "| sujets disponibles:",
    topics.length,
    "| dry-run:",
    dryRun,
    "| filtre:",
    opts.topicId || opts.section || "aucun"
  );

  if (!picks.length) {
    console.log("Aucun sujet lead disponible. Ajoutez des entrees dans data/blog-lead-topics.json ou utilisez --force-republish.");
    process.exit(0);
  }

  var generated = publishGeneratedArticles(picks, dryRun);

  if (dryRun) {
    console.log("\nDry-run termine —", generated.length, "article(s) simule(s).");
    process.exit(0);
  }

  updateState(state, generated, topics.length);

  if (!skipPublish) {
    console.log("\n=== Generation HTML + SEO ===");
    execSync("npm run blog:actu:publish", { stdio: "inherit", cwd: ROOT });
    execSync("node scripts/archive-actu-pending.cjs", { stdio: "inherit", cwd: ROOT });
  }

  console.log("\n✓ Articles leads generes:", generated.length);
  generated.forEach(function (item) {
    console.log("  -", item.article.file, "(" + item.topic.id + ")");
  });
}

main();
