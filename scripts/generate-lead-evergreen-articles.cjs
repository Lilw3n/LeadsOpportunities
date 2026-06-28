#!/usr/bin/env node
/**
 * Generation recurrente d'articles evergreen orientes leads.
 *
 * Usage:
 *   npm run blog:leads:evergreen
 *   npm run blog:leads:evergreen -- --count=2
 *   npm run blog:leads:evergreen -- --topic=vtc-attestation-plateforme
 *   npm run blog:leads:evergreen -- --dry-run
 */
const { execSync } = require("child_process");
const {
  appendPendingArticle,
  existingFiles,
  monthLabel,
  readJson,
  relatedForSection,
  slugify,
  writeJson,
} = require("./blog-actu-lib.cjs");

const ROOT = require("path").join(__dirname, "..");
const MEDIUM = "lead_evergreen";

function arg(name, def) {
  var prefix = "--" + name + "=";
  var m = process.argv.find(function (a) {
    return a.indexOf(prefix) === 0;
  });
  return m ? m.slice(prefix.length) : def;
}

function flag(name) {
  return process.argv.indexOf("--" + name) !== -1;
}

function monthMeta() {
  return "8 min · " + monthLabel();
}

function ctaWithLeadUtm(need, slug, labelOverride) {
  var cfg = readJson("blog-actu-keywords.json", { leadCta: {} });
  var fallback = cfg.leadCta.habitation || {
    href: "../landings/questionnaire.html?need=habitation&journey=standard",
    label: "Questionnaire habitation (3 min)",
  };
  var base = cfg.leadCta[need] || fallback;
  var sep = base.href.indexOf("?") === -1 ? "?" : "&";
  return {
    href:
      base.href +
      sep +
      "utm_source=blog&utm_medium=" +
      MEDIUM +
      "&utm_campaign=" +
      encodeURIComponent(need) +
      "&utm_content=" +
      encodeURIComponent(slugify(slug).slice(0, 48)),
    label: labelOverride || base.label,
  };
}

function listBlock(items) {
  return {
    type: "ul",
    items: (items || []).map(function (item) {
      return item;
    }),
  };
}

function buildArticle(topic) {
  var slug = slugify(topic.file || topic.title).replace(/-html$/, "");
  var cta = ctaWithLeadUtm(topic.need, topic.id || slug, topic.ctaLabel);
  var related = topic.related || relatedForSection(topic.section, topic.need);
  var intro =
    "Ce guide repond a une intention simple : <strong>" +
    topic.leadIntent +
    "</strong> Avant de demander un devis, mieux vaut cadrer le besoin, les garanties et le budget pour eviter un contrat trop cher ou incomplet.";

  return {
    file: topic.file || slug + ".html",
    section: topic.section,
    tag: topic.tag,
    tagClass: topic.tagClass,
    themes: topic.themes || [topic.section],
    title: topic.title,
    description: topic.description,
    meta: monthMeta(),
    cardExcerpt: topic.cardExcerpt || topic.description,
    cta: cta,
    source: {
      name: "Calendrier editorial leads",
      url: "",
      fetchedAt: new Date().toISOString(),
    },
    blocks: [
      { type: "p", text: intro },
      { type: "h2", text: "Pourquoi ce sujet genere des leads qualifies" },
      {
        type: "p",
        text:
          topic.hook +
          " L'objectif est de transformer une recherche d'information en <strong>questionnaire qualifie</strong> : profil, situation, garanties attendues et moment de decision.",
      },
      { type: "h2", text: "Checklist avant de comparer" },
      listBlock(topic.checklist),
      { type: "bridge" },
      { type: "h2", text: "Les erreurs qui coutent cher" },
      listBlock(topic.mistakes),
      { type: "h2", text: "Comment Leads Opportunities traite la demande" },
      {
        type: "p",
        text:
          "Le questionnaire gratuit collecte uniquement les informations utiles au courtage : besoin principal, delai, garanties prioritaires et contraintes de budget. Un courtier ORIAS peut ensuite orienter vers April, AXA, Allianz, Generali, Zephir ou un autre acteur du marche selon le profil.",
      },
      { type: "h2", text: "Prochaine etape" },
      {
        type: "p",
        text:
          "Si le sujet correspond a votre situation, lancez le questionnaire en 3 minutes. Vous gardez une trace claire de votre besoin et le tracking UTM permet d'identifier les articles qui generent les meilleurs leads.",
      },
    ],
    related: related,
  };
}

function validateArticle(article) {
  var errors = [];
  if (!article.file) errors.push("file manquant");
  if (!article.title) errors.push("titre manquant");
  if (!article.description || article.description.length < 80) errors.push("description trop courte");
  if (!article.cta || !article.cta.href) errors.push("cta manquant");
  if (article.cta && article.cta.href && article.cta.href.indexOf("utm_medium=" + MEDIUM) === -1) {
    errors.push("utm lead_evergreen manquant");
  }
  if (!article.blocks || article.blocks.length < 9) errors.push("article trop court");
  if (
    !article.blocks ||
    !article.blocks.some(function (b) {
      return b.type === "bridge";
    })
  ) {
    errors.push("bridge CTA manquant");
  }
  if (
    !article.blocks ||
    article.blocks.filter(function (b) {
      return b.type === "p";
    }).length < 4
  ) {
    errors.push("paragraphes insuffisants");
  }
  return errors;
}

function pickTopics(calendar, state, count, topicId) {
  var files = existingFiles();
  var published = new Set(state.publishedIds || []);
  var topics = (calendar.topics || []).slice().sort(function (a, b) {
    return (b.priority || 0) - (a.priority || 0);
  });

  if (topicId) {
    topics = topics.filter(function (t) {
      return t.id === topicId;
    });
  }

  return topics
    .filter(function (topic) {
      return topic && topic.id && topic.title && topic.file;
    })
    .filter(function (topic) {
      if (published.has(topic.id)) return false;
      if (files.has(topic.file)) return false;
      return true;
    })
    .slice(0, count);
}

function main() {
  var count = Math.min(5, Math.max(1, Number(arg("count", 1)) || 1));
  var topicId = arg("topic", "");
  var dryRun = flag("dry-run");
  var skipPublish = flag("skip-publish") || flag("no-publish");
  var calendar = readJson("blog-lead-calendar.json", { topics: [] });
  var state = readJson("blog-lead-article-state.json", { publishedIds: [], runs: [] });
  var picked = pickTopics(calendar, state, count, topicId);

  console.log("=== Evergreen lead articles ===");
  console.log("count:", count, "| dry-run:", dryRun, "| publish:", skipPublish ? "non" : "oui");

  if (!picked.length) {
    console.log("Aucun sujet disponible. Ajoutez des topics dans data/blog-lead-calendar.json.");
    return;
  }

  var articles = picked.map(buildArticle);
  var ok = true;
  articles.forEach(function (article) {
    var errors = validateArticle(article);
    if (errors.length) {
      ok = false;
      console.error("[FAIL]", article.file, "-", errors.join("; "));
    } else {
      console.log("[OK]", article.file, "-", article.title);
    }
  });
  if (!ok) process.exit(1);

  if (dryRun) {
    console.log("Dry-run termine -", articles.length, "article(s) pret(s).");
    return;
  }

  articles.forEach(function (article) {
    appendPendingArticle(article);
  });

  if (!skipPublish) {
    console.log("\n=== Generation HTML + SEO ===");
    execSync("npm run blog:actu:publish", { stdio: "inherit", cwd: ROOT });
    execSync("node scripts/archive-actu-pending.cjs", { stdio: "inherit", cwd: ROOT });
  }

  state.publishedIds = state.publishedIds || [];
  picked.forEach(function (topic) {
    if (state.publishedIds.indexOf(topic.id) === -1) {
      state.publishedIds.push(topic.id);
    }
  });
  state.updated = new Date().toISOString();
  state.runs = state.runs || [];
  state.runs.push({
    at: state.updated,
    count: articles.length,
    published: !skipPublish,
    articles: articles.map(function (article) {
      return { file: article.file, title: article.title };
    }),
  });
  if (state.runs.length > 50) state.runs = state.runs.slice(-50);
  writeJson("blog-lead-article-state.json", state);

  console.log("\nPublies:", articles.length, "article(s)");
  articles.forEach(function (article) {
    console.log("  -", article.file);
  });
}

main();
