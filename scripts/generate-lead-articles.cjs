#!/usr/bin/env node
/**
 * Generation recurrente d'articles evergreen orientes leads.
 *
 * Usage:
 *   npm run blog:lead:auto
 *   npm run blog:lead:auto -- --count=2
 *   npm run blog:lead:auto -- --dry-run
 *   npm run blog:lead:auto -- --skip-publish
 */
const { execSync } = require("child_process");
const path = require("path");
const { readJson, writeJson, slugify, existingFiles, appendPendingArticle, monthLabel } = require("./blog-actu-lib.cjs");

const ROOT = path.join(__dirname, "..");
const CALENDAR_FILE = "blog-lead-calendar.json";
const STATE_FILE = "blog-lead-state.json";

const TAG_BY_SECTION = {
  sante: "tag-sante",
  habitat: "tag-habitation",
  auto: "tag-auto",
  animaux: "tag-animaux",
  vtc: "tag-vtc",
  prevoyance: "tag-prevoyance",
  pro: "tag-pro",
  patrimoine: "tag-patrimoine",
  finance: "tag-immo",
};

function arg(name, def) {
  var m = process.argv.find(function (a) {
    return a.indexOf("--" + name + "=") === 0;
  });
  if (!m) return def;
  return m.split("=").slice(1).join("=");
}

function asList(items, fallback) {
  return Array.isArray(items) && items.length ? items : fallback;
}

function articleHref(href) {
  if (!href) return href;
  if (href.indexOf("../") === 0 || href.indexOf("./") === 0 || href.indexOf("http") === 0) return href;
  if (href.indexOf("/") === 0) return ".." + href;
  return href;
}

function addUtm(href, topic) {
  var base = articleHref(href || "../landings/questionnaire.html");
  var sep = base.indexOf("?") === -1 ? "?" : "&";
  return (
    base +
    sep +
    "utm_source=blog&utm_medium=lead_regular&utm_campaign=" +
    encodeURIComponent(topic.need || topic.section || "assurance") +
    "&utm_content=" +
    encodeURIComponent(slugify(topic.id || topic.title).slice(0, 40))
  );
}

function ctaForTopic(topic) {
  var map = readJson("blog-questionnaire-map.json", { sections: {} });
  var section = (map.sections && map.sections[topic.section]) || map.sections.actu || {};
  var questionnaire = topic.questionnaire || section.questionnaire || "/landings/questionnaire.html";
  return {
    href: addUtm(questionnaire, topic),
    label: topic.ctaLabel || section.questionnaireLabel || section.primaryLabel || "Questionnaire gratuit",
  };
}

function fileForTopic(topic) {
  if (topic.file) return topic.file;
  return slugify(topic.title || topic.id || "article-lead") + ".html";
}

function p(text) {
  return { type: "p", text: text };
}

function h2(text) {
  return { type: "h2", text: text };
}

function ul(items) {
  return { type: "ul", items: items };
}

function buildBlocks(topic) {
  var painPoints = asList(topic.painPoints, [
    "Contrat actuel difficile a lire",
    "Garanties utiles melangees avec des options secondaires",
    "Prix compare sans tenir compte des franchises",
  ]);
  var checklist = asList(topic.checklist, [
    "Relire plafonds, franchises et exclusions",
    "Comparer au moins deux offres a garanties equivalentes",
    "Verifier les delais de carence ou de resiliation",
    "Preparer les documents utiles avant demande de devis",
  ]);

  return [
    p(
      "Ce guide part d'une situation concrete : <strong>" +
        topic.angle +
        "</strong> L'objectif n'est pas de choisir le contrat le moins cher, mais de trouver une couverture coherente avec votre profil, vos risques et votre budget."
    ),
    h2("Pourquoi ce sujet genere des leads qualifies"),
    p(
      "Un lecteur qui cherche <strong>" +
        topic.title.replace(/<[^>]+>/g, "") +
        "</strong> a souvent deja un besoin actif : devis, changement d'assureur, achat, renouvellement ou sinistre recent. C'est le bon moment pour proposer un questionnaire court et utile."
    ),
    h2("Les signaux d'alerte a verifier"),
    ul(
      painPoints.map(function (item) {
        return "<strong>" + item + "</strong> : a clarifier avant toute souscription ou resiliation.";
      })
    ),
    { type: "bridge" },
    h2("Checklist avant de demander un devis"),
    ul(checklist),
    h2("Comment comparer sans se tromper"),
    p(
      "Comparez toujours a garanties equivalentes : meme franchise, meme plafond, meme delai de carence, meme usage declare. Un courtier ORIAS peut reformuler les exclusions et eviter une rupture de garantie entre deux contrats."
    ),
    h2("Passer a l'action en 3 minutes"),
    p(
      "Le questionnaire Leads Opportunities permet de qualifier le besoin, d'identifier le bon parcours et de transmettre les informations utiles avant rappel. Vous gagnez du temps et l'echange commercial part d'un dossier plus clair."
    ),
  ];
}

function buildArticle(topic) {
  var file = fileForTopic(topic);
  var need = topic.need || topic.section || "assurance";
  return {
    file: file,
    section: topic.section || "actu",
    tag: topic.tag || "Assurance",
    tagClass: topic.tagClass || TAG_BY_SECTION[topic.section] || "tag-actu",
    title: topic.title,
    description: topic.description,
    meta: "8 min · " + monthLabel(),
    cardExcerpt: topic.cardExcerpt || topic.description,
    cta: ctaForTopic(topic),
    keywords: topic.keywords || ["devis assurance", "courtier ORIAS", "comparatif assurance", need],
    blocks: buildBlocks(topic),
    related: topic.related || [{ href: "../assurances/", label: "Toutes nos assurances" }],
    source: {
      name: "blog-lead-calendar",
      id: topic.id,
      fetchedAt: new Date().toISOString(),
    },
  };
}

function pickTopics(calendar, count, state) {
  var generated = new Set(state.generatedTopicIds || []);
  var files = existingFiles();
  return (calendar.topics || [])
    .filter(function (topic) {
      if (topic.enabled === false) return false;
      if (!topic.id || !topic.title || !topic.description) return false;
      if (generated.has(topic.id)) return false;
      if (files.has(fileForTopic(topic))) return false;
      return true;
    })
    .sort(function (a, b) {
      var prio = (b.priority || 0) - (a.priority || 0);
      if (prio) return prio;
      return String(a.id).localeCompare(String(b.id));
    })
    .slice(0, count);
}

function main() {
  var calendar = readJson(CALENDAR_FILE, { topics: [], defaultCount: 1 });
  var state = readJson(STATE_FILE, { generatedTopicIds: [], generatedArticles: [], runs: [] });
  var count = Math.min(5, Math.max(1, Number(arg("count", calendar.defaultCount || 1)) || 1));
  var dryRun = process.argv.indexOf("--dry-run") !== -1;
  var skipPublish = process.argv.indexOf("--skip-publish") !== -1;

  console.log("=== Blog lead evergreen ===");
  console.log("count:", count, "| dry-run:", dryRun, "| publish:", skipPublish || dryRun ? "non" : "oui");

  var picks = pickTopics(calendar, count, state);
  if (!picks.length) {
    console.log("Aucun sujet disponible dans", CALENDAR_FILE);
    process.exit(0);
  }

  var generated = picks.map(buildArticle);
  generated.forEach(function (article, i) {
    console.log("[" + (i + 1) + "/" + generated.length + "]", article.file, "—", article.title);
  });

  if (dryRun) {
    console.log("Dry-run termine — aucun fichier modifie.");
    return;
  }

  generated.forEach(function (article) {
    appendPendingArticle(article);
  });

  state.generatedTopicIds = state.generatedTopicIds || [];
  state.generatedArticles = state.generatedArticles || [];
  picks.forEach(function (topic, i) {
    if (state.generatedTopicIds.indexOf(topic.id) === -1) {
      state.generatedTopicIds.push(topic.id);
    }
    state.generatedArticles.push({
      at: new Date().toISOString(),
      topicId: topic.id,
      file: generated[i].file,
      title: generated[i].title,
      section: generated[i].section,
      need: topic.need || topic.section,
    });
  });
  if (state.generatedArticles.length > 100) {
    state.generatedArticles = state.generatedArticles.slice(-100);
  }
  state.lastRun = new Date().toISOString();
  state.runs = state.runs || [];
  state.runs.push({
    at: state.lastRun,
    count: generated.length,
    files: generated.map(function (a) {
      return a.file;
    }),
  });
  if (state.runs.length > 50) state.runs = state.runs.slice(-50);
  writeJson(STATE_FILE, state);

  if (!skipPublish) {
    console.log("\n=== Generation HTML + SEO ===");
    execSync("npm run blog:actu:publish", { stdio: "inherit", cwd: ROOT });
    execSync("node scripts/archive-actu-pending.cjs", { stdio: "inherit", cwd: ROOT });
  }

  console.log("\n✓ Articles lead generes:", generated.length);
}

main();
