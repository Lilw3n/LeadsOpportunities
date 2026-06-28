#!/usr/bin/env node
/**
 * Generation reguliere d'articles evergreen orientes leads.
 *
 * Usage:
 *   npm run blog:leads:auto
 *   npm run blog:leads:auto -- --count=3
 *   npm run blog:leads:auto -- --topic=assurance-vtc-uber-bolt-attestation
 *   npm run blog:leads:auto -- --dry-run
 */
const { execSync } = require("child_process");
const path = require("path");
const {
  readJson,
  writeJson,
  existingFiles,
  appendPendingArticle,
  monthLabel,
  slugify,
} = require("./blog-actu-lib.cjs");

const ROOT = path.join(__dirname, "..");
const TOPICS_FILE = "blog-lead-topics.json";
const STATE_FILE = "blog-lead-state.json";

const SECTION_DEFAULTS = {
  sante: { tag: "Sante & mutuelle", tagClass: "tag-sante", need: "sante" },
  habitat: { tag: "Habitation", tagClass: "tag-habitation", need: "habitation" },
  finance: { tag: "Credit & emprunteur", tagClass: "tag-actu", need: "emprunteur" },
  auto: { tag: "Auto", tagClass: "tag-auto", need: "auto" },
  vtc: { tag: "VTC", tagClass: "tag-vtc", need: "vtc" },
  animaux: { tag: "Animaux", tagClass: "tag-animaux", need: "animaux" },
  prevoyance: { tag: "Prevoyance", tagClass: "tag-prevoyance", need: "prevoyance" },
  pro: { tag: "Pro & RC", tagClass: "tag-pro", need: "rc-pro" },
};

const RELATED_BY_SECTION = {
  sante: [
    { href: "./mutuelle-sante-5-criteres.html", label: "5 criteres pour choisir sa mutuelle" },
    { href: "./mutuelle-sante-hospitalisation-2026.html", label: "Hospitalisation et mutuelle" },
    { href: "../landings/sante.html", label: "Parcours mutuelle" },
  ],
  habitat: [
    { href: "./assurance-habitation-locataire-proprietaire-2026.html", label: "Guide assurance habitation" },
    { href: "./pno-bailleur-proprietaire-non-occupant.html", label: "PNO bailleur" },
    { href: "../assurance-habitation/", label: "Assurance habitation" },
  ],
  finance: [
    { href: "./assurance-emprunteur-loi-lemoine-2026.html", label: "Loi Lemoine emprunteur" },
    { href: "./pret-immo-erreurs-a-eviter.html", label: "Pret immo : erreurs a eviter" },
    { href: "../assurance-emprunteur/", label: "Assurance emprunteur" },
  ],
  auto: [
    { href: "./assurance-auto-bonus-malus.html", label: "Bonus-malus auto" },
    { href: "./assurance-auto-jeune-conducteur-2026.html", label: "Jeune conducteur" },
    { href: "../assurance-auto/", label: "Assurance auto" },
  ],
  vtc: [
    { href: "./assurance-vtc-moins-cher-2026.html", label: "Assurance VTC moins chere" },
    { href: "./assurance-vtc-rc-pro-garanties.html", label: "RC Pro VTC" },
    { href: "../assurance-vtc/", label: "Assurance VTC" },
  ],
  animaux: [
    { href: "./assurance-animaux-comment-choisir.html", label: "Choisir assurance animaux" },
    { href: "./assurance-chien-frais-veterinaires.html", label: "Frais veterinaires chien" },
    { href: "../assurance-animaux/", label: "Assurance animaux" },
  ],
  prevoyance: [
    { href: "./prevoyance-independants-guide.html", label: "Prevoyance independants" },
    { href: "./assurance-deces-obseques-prevoyance.html", label: "Assurance deces" },
    { href: "../assurance-prevoyance/", label: "Assurance prevoyance" },
  ],
  pro: [
    { href: "./rc-pro-freelance-artisan-guide.html", label: "RC Pro freelance et artisan" },
    { href: "../landings/devis.html?need=rc-pro", label: "Devis RC Pro" },
    { href: "../assurances/", label: "Toutes nos assurances pro" },
  ],
};

function arg(name, def) {
  var prefix = "--" + name + "=";
  var m = process.argv.find(function (a) {
    return a.indexOf(prefix) === 0;
  });
  if (!m) return def;
  return m.slice(prefix.length);
}

function hasFlag(name) {
  return process.argv.indexOf("--" + name) !== -1;
}

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function text(s) {
  return esc(s).replace(/"/g, "&quot;");
}

function sentencePart(s) {
  return text(s).replace(/[.!?]+$/, "");
}

function leadCta(need, slug) {
  var cfg = readJson("blog-actu-keywords.json", { leadCta: {} });
  var key = need === "credit-immo" ? "emprunteur" : need;
  var base = cfg.leadCta[key] || cfg.leadCta.habitation || {
    href: "../landings/questionnaire.html?journey=standard",
    label: "Questionnaire assurance (3 min)",
  };
  var href = base.href || "../landings/questionnaire.html?journey=standard";
  var sep = href.indexOf("?") === -1 ? "?" : "&";
  return {
    href:
      href +
      sep +
      "utm_source=blog&utm_medium=lead_evergreen&utm_campaign=" +
      encodeURIComponent(key || "assurance") +
      "&utm_content=" +
      encodeURIComponent(slugify(slug || key).slice(0, 48)),
    label: base.label || "Questionnaire assurance (3 min)",
  };
}

function normalizeTopic(raw) {
  var section = raw.section || "habitat";
  var defaults = SECTION_DEFAULTS[section] || SECTION_DEFAULTS.habitat;
  var slug = raw.slug || slugify(raw.title);
  return Object.assign({}, raw, {
    slug: slug,
    file: (raw.file || slug) + ".html",
    section: section,
    need: raw.need || defaults.need,
    tag: raw.tag || defaults.tag,
    tagClass: raw.tagClass || defaults.tagClass,
    priority: Number(raw.priority || 0),
  });
}

function loadTopics() {
  var data = readJson(TOPICS_FILE, { topics: [] });
  return (data.topics || []).map(normalizeTopic);
}

function loadState() {
  return readJson(STATE_FILE, {
    generatedTopicSlugs: [],
    runs: [],
  });
}

function pickTopics(topics, state, count, topicSlug) {
  var files = existingFiles();
  var generated = new Set(state.generatedTopicSlugs || []);
  var available = topics
    .filter(function (t) {
      if (topicSlug && t.slug !== topicSlug) return false;
      if (files.has(t.file)) return false;
      if (generated.has(t.slug)) return false;
      return true;
    })
    .sort(function (a, b) {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return topics.indexOf(a) - topics.indexOf(b);
    });
  return available.slice(0, count);
}

function buildArticle(topic) {
  var cta = leadCta(topic.need, topic.slug);
  var title = text(topic.title);
  var persona = sentencePart(topic.persona || "Foyer francais qui veut comparer avant de signer.");
  var trigger = text(topic.trigger || "Un changement de situation impose de relire les garanties.");
  var mainRisk = text(topic.mainRisk || "Un contrat mal calibre peut laisser une franchise ou un reste a charge important.");
  var checks = (topic.checks || []).map(text);
  var mistakes = (topic.mistakes || []).map(text);
  var related = topic.related || RELATED_BY_SECTION[topic.section] || RELATED_BY_SECTION.habitat;

  return {
    file: topic.file,
    section: topic.section,
    tag: topic.tag,
    tagClass: topic.tagClass,
    themes: topic.themes || [],
    title: title,
    description: text(topic.description),
    meta: "8 min · " + monthLabel(),
    cardExcerpt: text(topic.cardExcerpt || topic.description),
    cta: cta,
    blocks: [
      {
        type: "p",
        text:
          "Ce guide s'adresse a <strong>" +
          persona +
          "</strong>. L'objectif est simple : transformer une recherche d'information en decision utile, avec un niveau de garanties coherent et un <strong>questionnaire gratuit</strong> pour qualifier le besoin.",
      },
      {
        type: "h2",
        text: "Pourquoi regarder ce sujet maintenant ?",
      },
      {
        type: "p",
        text:
          "<strong>Declencheur :</strong> " +
          trigger +
          " Dans ce contexte, comparer trop vite sur le prix peut faire manquer une exclusion, un plafond ou un delai de carence.",
      },
      { type: "bridge" },
      {
        type: "h2",
        text: "Le risque principal a eviter",
      },
      {
        type: "p",
        text:
          mainRisk +
          " Un courtier ORIAS aide a lire le contrat avec un angle concret : que se passe-t-il le jour du sinistre, de l'hospitalisation, du litige ou de la demande bancaire ?",
      },
      {
        type: "h2",
        text: "Checklist avant de demander un devis",
      },
      {
        type: "ul",
        items: checks,
      },
      {
        type: "h2",
        text: "Erreurs frequentes qui coutent cher",
      },
      {
        type: "ul",
        items: mistakes,
      },
      {
        type: "h2",
        text: "Comment Leads Opportunities qualifie le lead",
      },
      {
        type: "p",
        text:
          "Le questionnaire commence par les informations qui changent vraiment le tarif et les garanties : profil, situation, usage, budget, urgence et niveau de protection souhaite. Le conseiller peut ensuite comparer April, AXA, Allianz, Generali, Zephir ou d'autres partenaires selon le cas.",
      },
      {
        type: "h2",
        text: "Prochaine etape",
      },
      {
        type: "p",
        text:
          "Remplissez le <a href=\"" +
          esc(cta.href) +
          "\">" +
          esc(cta.label) +
          "</a> : c'est gratuit, sans engagement, et cela evite de recevoir une proposition hors sujet.",
      },
    ],
    faq: (topic.faq || []).map(function (item) {
      return { q: text(item.q), a: text(item.a) };
    }),
    related: related,
    source: {
      name: "lead-calendar",
      topic: topic.slug,
      generatedAt: new Date().toISOString(),
    },
  };
}

function publishGenerated() {
  console.log("\n=== Generation HTML + SEO ===");
  execSync("npm run blog:actu:publish", { cwd: ROOT, stdio: "inherit" });
  execSync("node scripts/archive-actu-pending.cjs", { cwd: ROOT, stdio: "inherit" });
}

function main() {
  var count = Math.min(5, Math.max(1, Number(arg("count", 1)) || 1));
  var topicSlug = arg("topic", "");
  var dryRun = hasFlag("dry-run");
  var skipPublish = hasFlag("skip-publish");
  var topics = loadTopics();
  var state = loadState();
  var picks = pickTopics(topics, state, count, topicSlug);

  console.log("=== Blog leads evergreen ===");
  console.log("count:", count, "| dry-run:", dryRun, "| skip-publish:", skipPublish);

  if (!topics.length) {
    console.log("Aucun sujet configure dans data/" + TOPICS_FILE);
    process.exit(0);
  }

  if (!picks.length) {
    if (topicSlug) {
      console.log("Aucun sujet disponible pour:", topicSlug);
    } else {
      console.log("Tous les sujets lead configures sont deja publies. Ajoutez des sujets dans data/" + TOPICS_FILE + ".");
    }
    process.exit(0);
  }

  var generated = picks.map(buildArticle);
  generated.forEach(function (article) {
    if (dryRun) {
      console.log("[dry-run]", article.file, "-", article.title);
      return;
    }
    appendPendingArticle(article);
    console.log("Ajoute:", article.file);
  });

  if (dryRun) {
    console.log("\nDry-run termine:", generated.length, "article(s) simule(s).");
    process.exit(0);
  }

  if (!skipPublish) {
    publishGenerated();
  }

  var now = new Date().toISOString();
  state.generatedTopicSlugs = state.generatedTopicSlugs || [];
  picks.forEach(function (topic) {
    if (state.generatedTopicSlugs.indexOf(topic.slug) === -1) {
      state.generatedTopicSlugs.push(topic.slug);
    }
  });
  state.lastRun = now;
  state.runs = state.runs || [];
  state.runs.push({
    at: now,
    count: generated.length,
    articles: generated.map(function (article) {
      return { file: article.file, title: article.title };
    }),
  });
  if (state.runs.length > 50) state.runs = state.runs.slice(-50);
  writeJson(STATE_FILE, state);

  console.log("\nOK:", generated.length, "article(s) lead genere(s).");
}

main();
