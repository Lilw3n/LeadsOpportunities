#!/usr/bin/env node
/**
 * Pipeline evergreen leads : plan éditorial → article questionnaire → publish.
 *
 * Usage:
 *   npm run blog:leads:auto
 *   npm run blog:leads:auto -- --count=2
 *   npm run blog:leads:auto -- --dry-run
 *   npm run blog:leads:auto -- --skip-publish
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const {
  appendPendingArticle,
  existingFiles,
  monthLabel,
  relatedForSection,
  slugify,
} = require("./blog-actu-lib.cjs");

var ROOT = path.join(__dirname, "..");
var DATA = path.join(ROOT, "data");
var PLAN_FILE = path.join(DATA, "blog-lead-article-plan.json");
var STATE_FILE = path.join(DATA, "blog-lead-articles-state.json");

function arg(name, def) {
  var m = process.argv.find(function (a) {
    return a.indexOf("--" + name + "=") === 0;
  });
  if (!m) return def;
  return m.split("=").slice(1).join("=");
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}

function leadCta(topic) {
  var cfg = readJson(path.join(DATA, "blog-actu-keywords.json"), { leadCta: {} });
  var base = (cfg.leadCta || {})[topic.need] || (cfg.leadCta || {}).habitation || {
    href: "../landings/questionnaire.html",
    label: "Questionnaire assurance (3 min)",
  };
  var href = base.href;
  var sep = href.indexOf("?") === -1 ? "?" : "&";
  var campaign = String(topic.need || topic.section || "assurance").replace(/[^a-z0-9-]+/g, "-");
  var content = slugify(topic.id || topic.slug || topic.title).slice(0, 48);
  return {
    href:
      href +
      sep +
      "utm_source=blog&utm_medium=lead_evergreen&utm_campaign=" +
      encodeURIComponent(campaign + "_lead_content") +
      "&utm_content=" +
      encodeURIComponent(content),
    label: base.label || "Questionnaire assurance (3 min)",
  };
}

function pickTopics(plan, state, count) {
  var done = new Set(state.publishedTopicIds || []);
  var files = existingFiles();
  return (plan.topics || [])
    .slice()
    .sort(function (a, b) {
      return (b.priority || 0) - (a.priority || 0);
    })
    .filter(function (topic) {
      var file = (topic.slug || slugify(topic.title)) + ".html";
      return !done.has(topic.id) && !files.has(file);
    })
    .slice(0, count);
}

function relatedLinks(topic) {
  var base = relatedForSection(topic.section, topic.need).slice(0, 4);
  var extras = {
    pro: [{ href: "../assurances/", label: "Catalogue assurances pro" }],
    finance: [
      { href: "../assurance-emprunteur/", label: "Assurance emprunteur" },
      { href: "../landings/credit-immo.html", label: "Simulation crédit immobilier" },
    ],
    sante: [{ href: "../assurance-sante/", label: "Mutuelle santé" }],
    habitat: [{ href: "../assurance-habitation/", label: "Assurance habitation" }],
    vtc: [{ href: "../assurance-vtc/", label: "Assurance VTC" }],
    animaux: [{ href: "../assurance-animaux/", label: "Assurance animaux" }],
  };
  return base.concat(extras[topic.section] || []).slice(0, 5);
}

function buildArticle(topic) {
  var file = (topic.slug || slugify(topic.title)) + ".html";
  var checklist = topic.checklist || [];
  var trigger = topic.trigger || "renouvellement, changement de situation ou hausse de budget";
  var cta = leadCta(topic);

  return {
    file: file,
    section: topic.section,
    tag: topic.tag,
    tagClass: topic.tagClass,
    themes: topic.themes || [topic.section],
    title: topic.title,
    description: topic.description,
    meta: "7 min · " + monthLabel(),
    cardExcerpt: topic.cardExcerpt || topic.description,
    cta: cta,
    blocks: [
      {
        type: "p",
        text:
          "Ce guide vise une situation concrète : <strong>" +
          topic.intent +
          "</strong>. L'objectif n'est pas de lire un comparatif de plus, mais de savoir si votre contrat actuel colle encore à votre risque, à votre budget et aux exigences du marché.",
      },
      {
        type: "h2",
        text: "Pourquoi ce sujet génère des demandes qualifiées",
      },
      {
        type: "p",
        text:
          topic.pain +
          " C'est exactement le moment où un questionnaire court transforme une lecture blog en demande exploitable : besoin, profil, niveau de garantie et urgence sont clarifiés avant l'appel.",
      },
      {
        type: "h2",
        text: "Quand comparer ou demander un devis",
      },
      {
        type: "p",
        text:
          "Les meilleurs signaux sont simples : <strong>" +
          trigger +
          "</strong>. Si l'un de ces cas vous concerne, comparer maintenant évite de choisir dans l'urgence après un sinistre, un refus d'attestation ou une facture trop élevée.",
      },
      {
        type: "h2",
        text: "Les garanties à vérifier avant de signer",
      },
      {
        type: "ul",
        items: checklist,
      },
      {
        type: "p",
        text:
          "Ne comparez pas uniquement le prix. Deux contrats au même tarif peuvent être très différents si les franchises, exclusions, plafonds ou délais de carence ne correspondent pas à votre profil.",
      },
      { type: "bridge" },
      {
        type: "h2",
        text: "Comment passer de l'article au bon parcours",
      },
      {
        type: "p",
        text:
          "Le questionnaire Leads Opportunities sert à qualifier le besoin en 3 à 6 minutes : situation, budget, garanties indispensables et date d'effet souhaitée. Il permet ensuite d'orienter vers le bon parcours, sans multiplier les formulaires inutiles.",
      },
      {
        type: "h2",
        text: "Ce que vous pouvez obtenir",
      },
      {
        type: "p",
        text:
          "La promesse est volontairement simple : <strong>" +
          topic.leadPromise +
          "</strong>. Un conseiller peut ensuite comparer plusieurs assureurs ou courtiers partenaires selon vos réponses.",
      },
    ],
    faq: topic.faq || [],
    related: relatedLinks(topic),
  };
}

function publish() {
  execSync("npm run blog:actu:publish", { cwd: ROOT, stdio: "inherit" });
  execSync("node scripts/archive-actu-pending.cjs", { cwd: ROOT, stdio: "inherit" });
}

async function main() {
  var plan = readJson(PLAN_FILE, { topics: [], cadence: { maxCount: 3 } });
  var state = readJson(STATE_FILE, { publishedTopicIds: [], runs: [] });
  var maxCount = Number((plan.cadence && plan.cadence.maxCount) || 3) || 3;
  var count = Math.min(
    maxCount,
    Math.max(1, Number(arg("count", (plan.cadence && plan.cadence.defaultCount) || 1)) || 1)
  );
  var dryRun = process.argv.indexOf("--dry-run") !== -1;
  var skipPublish = process.argv.indexOf("--skip-publish") !== -1;

  console.log("=== Auto lead articles ===");
  console.log("count:", count, "| dry-run:", dryRun, "| publish:", !skipPublish);

  var picks = pickTopics(plan, state, count);
  if (!picks.length) {
    console.log("Aucun sujet lead disponible dans le plan.");
    return;
  }

  var generated = picks.map(buildArticle);
  generated.forEach(function (article, i) {
    var hasBridge = (article.blocks || []).some(function (b) {
      return b && b.type === "bridge";
    });
    var hasUtm =
      article.cta &&
      article.cta.href &&
      String(article.cta.href).indexOf("utm_medium=lead_evergreen") !== -1;
    if (!hasBridge || !hasUtm) {
      throw new Error(
        "Article lead invalide (" + article.file + "): bridge=" + hasBridge + " utm=" + hasUtm
      );
    }
    console.log("[" + (i + 1) + "/" + generated.length + "]", article.file, "—", article.title);
    if (!dryRun) appendPendingArticle(article);
  });

  if (dryRun) {
    console.log("Dry-run terminé — aucun fichier modifié.");
    return;
  }

  if (!skipPublish) {
    publish();
  }

  var now = new Date().toISOString();
  state.publishedTopicIds = state.publishedTopicIds || [];
  picks.forEach(function (topic) {
    if (state.publishedTopicIds.indexOf(topic.id) === -1) state.publishedTopicIds.push(topic.id);
  });
  state.runs = state.runs || [];
  state.runs.push({
    at: now,
    count: generated.length,
    published: !skipPublish,
    articles: generated.map(function (article, i) {
      return {
        topicId: picks[i].id,
        file: article.file,
        title: article.title,
        need: picks[i].need,
      };
    }),
  });
  if (state.runs.length > 50) state.runs = state.runs.slice(-50);
  state.updated = now;
  writeJson(STATE_FILE, state);

  console.log("✓ Articles lead générés:", generated.length);
}

main().catch(function (e) {
  console.error(e);
  process.exit(1);
});
