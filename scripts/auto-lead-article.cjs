#!/usr/bin/env node
/**
 * Evergreen lead article pipeline.
 *
 * Generates the next curated insurance article from data/blog-lead-topics.json,
 * appends it to the blog pending queue, then rebuilds blog HTML + SEO.
 *
 * Usage:
 *   npm run blog:lead:auto
 *   npm run blog:lead:auto -- --count=2
 *   npm run blog:lead:auto -- --dry-run
 */
const { execSync } = require("child_process");
const path = require("path");
const {
  readJson,
  writeJson,
  appendPendingArticle,
  ctaWithUtm,
  existingFiles,
  monthLabel,
} = require("./blog-actu-lib.cjs");

var ROOT = path.join(__dirname, "..");

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

function topicFile(topic) {
  return String(topic.file || topic.id || "").replace(/\.html$/, "") + ".html";
}

function normalizeState(state) {
  state = state || {};
  state.publishedTopicIds = state.publishedTopicIds || [];
  state.generatedFiles = state.generatedFiles || [];
  state.runs = state.runs || [];
  return state;
}

function pickTopics(topics, state, count) {
  var files = existingFiles();
  var usedIds = {};
  state.publishedTopicIds.forEach(function (id) {
    usedIds[id] = true;
  });

  return topics
    .filter(function (topic) {
      if (!topic || !topic.id || !topic.title) return false;
      if (usedIds[topic.id]) return false;
      if (files.has(topicFile(topic))) return false;
      return true;
    })
    .slice(0, count);
}

function cleanInline(text) {
  return String(text || "")
    .replace(/</g, "")
    .replace(/>/g, "")
    .trim();
}

function checklistForNeed(need) {
  var map = {
    sante: [
      "Hospitalisation : chambre particuliere, depassements et forfait journalier",
      "Optique, dentaire, auditif : plafonds annuels et delais",
      "Soins courants : medecins, specialistes, teleconsultation",
      "Reste a charge estime selon votre consommation medicale",
      "Possibilite de changer sans trou de couverture",
    ],
    habitation: [
      "Capital mobilier et objets de valeur declares au contrat",
      "Degats des eaux, incendie, vol, tempete et catastrophe naturelle",
      "Franchise, exclusions et delais de declaration",
      "Usage exact du logement : locataire, proprietaire, bailleur, colocation",
      "Options utiles : assistance urgence, relogement, protection juridique",
    ],
    emprunteur: [
      "Quotite assuree par emprunteur et garanties exigees par la banque",
      "Deces, PTIA, IPT, IPP, ITT : definitions et exclusions",
      "Delegation externe et equivalence de garanties",
      "Impact age, fumeur, sport, profession et sante sur le tarif",
      "Economie totale possible sur la duree restante du pret",
    ],
    auto: [
      "Formule tiers, tiers etendu ou tous risques selon valeur du vehicule",
      "Bonus-malus, antecedents et conducteurs declares",
      "Franchise bris de glace, vol, incendie et dommages",
      "Assistance panne 0 km et vehicule de remplacement",
      "Kilometrage annuel et usage domicile-travail ou professionnel",
    ],
    vtc: [
      "RC circulation compatible avec usage transport de personnes",
      "RC Pro et attestation acceptee par les plateformes",
      "Assistance, remorquage et vehicule de remplacement",
      "Perte d'exploitation en cas d'immobilisation",
      "Franchise, conducteur secondaire et extension zone de circulation",
    ],
    animaux: [
      "Plafond annuel de remboursement et taux de prise en charge",
      "Franchise par acte ou par annee",
      "Delai de carence maladie, accident et chirurgie",
      "Exclusions : maladies hereditaires, actes preventifs, age limite",
      "Forfait prevention : vaccins, antiparasitaires, sterilisation",
    ],
    prevoyance: [
      "Indemnites journalieres et franchise en cas d'arret de travail",
      "Invalidite : rente, bareme et definition professionnelle",
      "Capital deces et rente education pour les proches",
      "Coordination avec regime obligatoire et contrat collectif",
      "Revenu assure coherent avec les charges fixes du foyer",
    ],
    "rc-pro": [
      "Activite declaree exactement comme dans vos devis et contrats clients",
      "Plafonds RC exploitation, RC apres livraison et dommages immateriels",
      "Protection juridique et frais de defense",
      "Cyber, materiel pro et sous-traitance si necessaire",
      "Attestation lisible a transmettre aux clients ou plateformes",
    ],
  };
  return map[need] || map.habitation;
}

function questionsForNeed(need) {
  var map = {
    sante: "age, ayants droit, postes de soins prioritaires, budget mensuel et delais souhaites",
    habitation: "statut d'occupation, surface, adresse, valeur du mobilier et sinistres passes",
    emprunteur: "montant restant du pret, duree, age, statut fumeur, profession et garanties banque",
    auto: "vehicule, bonus-malus, usage, conducteurs et historique de sinistres",
    vtc: "plateformes utilisees, vehicule, kilometrage, anciennete et garanties exigees",
    animaux: "espece, race, age, antecedents veterinaires et budget de remboursement",
    prevoyance: "revenu net, charges fixes, statut professionnel, franchise acceptee et beneficiaires",
    "rc-pro": "activite exacte, chiffre d'affaires, clients, sous-traitance et besoin d'attestation",
  };
  return map[need] || map.habitation;
}

function buildArticle(topic) {
  var need = topic.need || "habitation";
  var title = cleanInline(topic.title);
  var audience = cleanInline(topic.audience || "Foyers francais");
  var intent = cleanInline(topic.intent || "Comparer le bon contrat avant de signer.");
  var file = topicFile(topic);
  var cta = ctaWithUtm(need, topic.id);
  var checklist = checklistForNeed(need);
  var questions = questionsForNeed(need);

  return {
    file: file,
    section: topic.section || "actu",
    tag: topic.tag || "Guide assurance",
    tagClass: topic.tagClass || "tag-actu",
    title: title,
    description: cleanInline(topic.description),
    meta: "8 min · " + monthLabel(),
    cardExcerpt: cleanInline(topic.cardExcerpt || topic.description),
    keywords: topic.keywords || [],
    themes: topic.themes || [],
    cta: cta,
    source: {
      name: "Calendrier editorial leads",
      url: "",
      fetchedAt: new Date().toISOString(),
    },
    blocks: [
      {
        type: "p",
        text:
          "<strong>" +
          title +
          "</strong> repond a une intention simple : " +
          intent +
          " Ce guide transforme le sujet en checklist actionnable avant de demander un devis.",
      },
      {
        type: "h2",
        text: "Pour qui ce guide est utile",
      },
      {
        type: "p",
        text:
          "Profil vise : <strong>" +
          audience +
          "</strong>. Le bon contrat depend rarement d'un seul prix : il faut verifier les garanties, les exclusions, les franchises et le moment ou le besoin devient urgent.",
      },
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
        text: "Les signaux qui doivent declencher un comparatif",
      },
      {
        type: "p",
        text:
          "Hausse de cotisation, changement de situation, nouveau bien, sinistre recent, creation d'activite ou demande d'attestation : chaque evenement peut rendre l'ancien contrat trop cher ou mal calibre. Un comparatif a garanties equivalentes evite de regarder uniquement la mensualite.",
      },
      {
        type: "bridge",
      },
      {
        type: "h2",
        text: "Preparer son dossier avant de demander un devis",
      },
      {
        type: "ul",
        items: [
          "Retrouver le dernier avis d'echeance ou tableau de garanties",
          "Lister les besoins non couverts aujourd'hui",
          "Noter les franchises et plafonds qui posent probleme",
          "Comparer au moins deux offres sur les memes garanties",
          "Verifier les dates de resiliation possibles avant signature",
        ],
      },
      {
        type: "h2",
        text: "Ce que le questionnaire Leads Opportunities qualifie",
      },
      {
        type: "p",
        text:
          "Le questionnaire gratuit demande uniquement les informations utiles : " +
          questions +
          ". Il permet d'orienter le dossier vers le bon parcours avant l'echange avec un courtier ORIAS.",
      },
      {
        type: "p",
        text:
          "Objectif : gagner du temps, eviter les doublons de garanties et recevoir une proposition coherente avec votre profil. Le service est sans engagement et pense pour generer un lead qualifie, pas un simple clic.",
      },
    ],
    related: topic.related || [],
  };
}

function run(command) {
  execSync(command, { cwd: ROOT, stdio: "inherit" });
}

function main() {
  var count = Math.min(3, Math.max(1, Number(arg("count", 1)) || 1));
  var dryRun = hasFlag("dry-run");
  var skipPublish = hasFlag("skip-publish");
  var cfg = readJson("blog-lead-topics.json", { topics: [] });
  var state = normalizeState(readJson("blog-lead-state.json", {}));
  var picks = pickTopics(cfg.topics || [], state, count);

  console.log("=== Blog lead auto ===");
  console.log("count:", count, "| dry-run:", dryRun, "| skip-publish:", skipPublish);
  console.log("");

  if (!picks.length) {
    console.log("Aucun nouveau sujet lead disponible. Ajoutez des entrees dans data/blog-lead-topics.json.");
    return;
  }

  var generated = picks.map(buildArticle);
  generated.forEach(function (article) {
    console.log("- " + article.file + " — " + article.title);
  });

  if (dryRun) {
    console.log("\nDry-run termine — aucun fichier modifie.");
    return;
  }

  generated.forEach(function (article) {
    appendPendingArticle(article);
  });

  console.log("\n=== Controle qualite ===");
  run("node scripts/verify-actu-quality.cjs --file=data/blog-actu-pending.json");

  if (!skipPublish) {
    console.log("\n=== Generation HTML + SEO ===");
    run("npm run blog:actu:publish");
    run("node scripts/archive-actu-pending.cjs");
  }

  var now = new Date().toISOString();
  generated.forEach(function (article, index) {
    var topic = picks[index];
    if (state.publishedTopicIds.indexOf(topic.id) === -1) {
      state.publishedTopicIds.push(topic.id);
    }
    if (state.generatedFiles.indexOf(article.file) === -1) {
      state.generatedFiles.push(article.file);
    }
  });
  state.lastRun = now;
  state.runs.push({
    at: now,
    count: generated.length,
    files: generated.map(function (article) {
      return article.file;
    }),
  });
  if (state.runs.length > 50) {
    state.runs = state.runs.slice(-50);
  }
  writeJson("blog-lead-state.json", state);

  console.log("\nPublie:", generated.length, "article(s) lead evergreen");
}

main();
