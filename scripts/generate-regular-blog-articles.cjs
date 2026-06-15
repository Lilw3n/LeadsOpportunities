/**
 * Publie le prochain article lead-gen depuis data/blog-generation-plan.json.
 *
 * Usage:
 *   node scripts/generate-regular-blog-articles.cjs
 *   node scripts/generate-regular-blog-articles.cjs --count=2
 *   node scripts/generate-regular-blog-articles.cjs --topic=mutuelle-senior-reste-a-charge-2026
 */
const fs = require("fs");
const path = require("path");
const util = require("util");

const ROOT = path.join(__dirname, "..");
const PLAN_PATH = path.join(ROOT, "data", "blog-generation-plan.json");
const GENERATED_PATH = path.join(__dirname, "blog-generated-articles.cjs");
const MANIFEST_PATH = path.join(__dirname, "blog-articles-manifest.cjs");

const MONTHS = [
  "Janvier",
  "Fevrier",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Aout",
  "Septembre",
  "Octobre",
  "Novembre",
  "Decembre",
];

const SECTION_DEFAULTS = {
  animaux: {
    ctaHref: "../landings/questionnaire.html?need=animaux&journey=standard",
    ctaLabel: "Questionnaire animaux",
    related: [{ href: "../assurance-animaux/", label: "Assurance animaux" }],
  },
  auto: {
    ctaHref: "../landings/questionnaire.html?need=auto&journey=standard",
    ctaLabel: "Questionnaire auto",
    related: [{ href: "../assurance-auto/", label: "Assurance auto" }],
  },
  finance: {
    ctaHref: "../landings/questionnaire.html?need=credit-immo&journey=standard",
    ctaLabel: "Questionnaire credit immo",
    related: [{ href: "../credit-immo/", label: "Credit immobilier" }],
  },
  habitat: {
    ctaHref: "../landings/questionnaire.html?need=habitation&journey=standard",
    ctaLabel: "Questionnaire habitation",
    related: [{ href: "../assurance-habitation/", label: "Assurance habitation" }],
  },
  prevoyance: {
    ctaHref: "../landings/questionnaire.html?need=prevoyance&journey=standard",
    ctaLabel: "Questionnaire prevoyance",
    related: [{ href: "../assurance-prevoyance/", label: "Assurance prevoyance" }],
  },
  pro: {
    ctaHref: "../landings/questionnaire.html?need=rc-pro&journey=standard",
    ctaLabel: "Questionnaire RC Pro",
    related: [{ href: "../landings/devis.html?need=rc-pro", label: "Devis RC Pro" }],
  },
  sante: {
    ctaHref: "../landings/questionnaire.html?need=sante&journey=standard",
    ctaLabel: "Questionnaire mutuelle",
    related: [{ href: "../assurance-sante/", label: "Mutuelle sante" }],
  },
  vtc: {
    ctaHref: "../landings/questionnaire.html?need=vtc&journey=standard",
    ctaLabel: "Questionnaire VTC",
    related: [{ href: "../assurance-vtc/", label: "Assurance VTC" }],
  },
};

function parseArgs(argv) {
  const out = { dryRun: false };
  argv.forEach(function (arg) {
    if (arg === "--dry-run") out.dryRun = true;
    if (arg.indexOf("--count=") === 0) out.count = Number(arg.split("=")[1]);
    if (arg.indexOf("--topic=") === 0) out.topic = arg.split("=")[1];
  });
  return out;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function loadGenerated() {
  delete require.cache[require.resolve(GENERATED_PATH)];
  return require(GENERATED_PATH);
}

function loadManifest() {
  delete require.cache[require.resolve(MANIFEST_PATH)];
  return require(MANIFEST_PATH);
}

function slugify(input) {
  return String(input)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function listBlock(items) {
  return {
    type: "ul",
    items: items.map(function (item) {
      return esc(item);
    }),
  };
}

function currentMeta(date) {
  return "8 min · " + MONTHS[date.getMonth()] + " " + date.getFullYear();
}

function estimatePrimaryKeyword(topic) {
  return (topic.keywords && topic.keywords[0]) || topic.title;
}

function buildBlocks(topic) {
  const primary = esc(estimatePrimaryKeyword(topic));
  return [
    {
      type: "p",
      text:
        "<strong>" +
        esc(topic.title) +
        "</strong> concerne surtout " +
        esc(topic.audience || "les assures qui veulent comparer sans surpayer") +
        ". " +
        esc(topic.problem || "Le bon contrat se choisit a garanties equivalentes, pas seulement au prix."),
    },
    {
      type: "h2",
      text: "Pourquoi ce sujet genere des economies reelles",
    },
    {
      type: "p",
      text:
        esc(topic.budget || "Le budget doit etre compare sur l'annee, avec franchises et exclusions incluses.") +
        " Avant de demander un devis, l'objectif est de clarifier les garanties qui comptent vraiment pour votre profil.",
    },
    {
      type: "h2",
      text: "Garanties a verifier avant de signer",
    },
    listBlock(topic.guarantees || ["Plafonds", "Franchises", "Exclusions", "Assistance", "Delais de carence"]),
    { type: "bridge" },
    {
      type: "h2",
      text: "Checklist avant de comparer",
    },
    listBlock(topic.checklist || ["Recuperer le contrat actuel", "Lister les besoins reels", "Comparer 3 offres", "Controler les exclusions"]),
    {
      type: "h2",
      text: "Erreurs frequentes a eviter",
    },
    listBlock(topic.mistakes || ["Comparer uniquement le prix", "Oublier les franchises", "Resilier trop tot"]),
    {
      type: "h2",
      text: "Comment Leads Opportunities transforme l'article en lead qualifie",
    },
    {
      type: "p",
      text:
        "Le questionnaire relie cet article <strong>" +
        primary +
        "</strong> a votre situation reelle : profil, budget, contrat actuel et urgence. Le conseiller peut ainsi rappeler avec un dossier plus propre et proposer un devis sans perdre de temps.",
    },
  ];
}

function buildFaq(topic) {
  const label = esc(estimatePrimaryKeyword(topic));
  return [
    {
      q: "Le devis " + label + " est-il gratuit ?",
      a: "Oui. Le questionnaire Leads Opportunities permet de preparer une etude gratuite et sans engagement avant tout changement de contrat.",
    },
    {
      q: "Pourquoi passer par un questionnaire plutot qu'un simple formulaire contact ?",
      a: "Le questionnaire collecte les informations utiles des le depart : besoin, budget, garanties sensibles et contrat actuel. Le rappel est plus rapide et plus pertinent.",
    },
    {
      q: "Puis-je comparer si j'ai deja un contrat en cours ?",
      a: "Oui. Gardez votre avis d'echeance ou tableau de garanties : le conseiller compare a garanties equivalentes avant toute resiliation.",
    },
  ];
}

function topicToArticle(topic, date) {
  const defaults = SECTION_DEFAULTS[topic.section] || SECTION_DEFAULTS.sante;
  const slug = topic.slug || slugify(topic.title);
  return {
    file: slug + ".html",
    section: topic.section || "sante",
    tag: topic.tag || "Guide",
    tagClass: topic.tagClass || "tag-sante",
    title: topic.title,
    description: topic.description,
    meta: currentMeta(date),
    cardExcerpt: topic.cardExcerpt || topic.description,
    cta: {
      href: topic.ctaHref || defaults.ctaHref,
      label: topic.ctaLabel || defaults.ctaLabel,
    },
    keywords: topic.keywords || ["devis assurance", "courtier ORIAS", "Leads Opportunities"],
    generated: true,
    sourceTopic: topic.id,
    publishedAt: date.toISOString().slice(0, 10),
    blocks: buildBlocks(topic),
    related: (topic.related || []).concat(defaults.related || []),
    faq: buildFaq(topic),
  };
}

function writeGenerated(articles) {
  const body =
    "/**\n" +
    " * Articles crees par `scripts/generate-regular-blog-articles.cjs`.\n" +
    " * Ne pas editer a la main : ajoutez les sujets dans data/blog-generation-plan.json.\n" +
    " */\n" +
    "module.exports = " +
    util.inspect(articles, { depth: null, maxArrayLength: null, breakLength: 100 }) +
    ";\n";
  fs.writeFileSync(GENERATED_PATH, body, "utf8");
}

function sortTopics(a, b) {
  return (a.priority || 9999) - (b.priority || 9999) || a.id.localeCompare(b.id);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const plan = readJson(PLAN_PATH);
  const generated = loadGenerated();
  const manifest = loadManifest();
  const existingFiles = new Set(
    manifest.articles.map(function (a) {
      return a.file;
    })
  );
  const existingTopics = new Set(
    generated
      .map(function (a) {
        return a.sourceTopic;
      })
      .filter(Boolean)
  );
  const plannedTopics = (plan.topics || []).slice().sort(sortTopics);
  const requestedCount = args.topic ? 1 : args.count || (plan.cadence && plan.cadence.articlesPerRun) || 1;
  const count = Math.max(1, Number(requestedCount) || 1);
  const date = new Date();
  const selected = [];

  plannedTopics.forEach(function (topic) {
    if (selected.length >= count) return;
    if (args.topic && topic.id !== args.topic) return;
    const file = (topic.slug || slugify(topic.title)) + ".html";
    if (!args.topic && (existingTopics.has(topic.id) || existingFiles.has(file))) return;
    if (args.topic && existingFiles.has(file)) {
      console.log("already published:", topic.id, file);
      return;
    }
    selected.push(topic);
  });

  if (!selected.length) {
    console.log(args.topic ? "No matching unpublished topic." : "No unpublished planned topic.");
    return;
  }

  const additions = selected.map(function (topic) {
    return topicToArticle(topic, date);
  });

  additions.forEach(function (article) {
    console.log("selected:", article.sourceTopic, "->", article.file);
  });

  if (args.dryRun) {
    console.log("dry-run: no file written");
    return;
  }

  writeGenerated(generated.concat(additions));
  console.log("written:", GENERATED_PATH, "—", additions.length, "article(s) ajoute(s)");
}

main();
