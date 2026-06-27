/**
 * Articles evergreen orientes leads.
 * Utilises comme filet de securite quand l'actualite ne fournit pas assez
 * de sujets qualifiables vers un questionnaire.
 */
const { readJson, ctaWithUtm, monthLabel, relatedForSection, slugify, uniqueFile } = require("./blog-actu-lib.cjs");

function todayKey(date) {
  var d = date || new Date();
  return d.toISOString().slice(0, 10);
}

function loadTopics() {
  var cfg = readJson("blog-evergreen-lead-topics.json", { topics: [] });
  return (cfg.topics || []).filter(function (topic) {
    return topic && topic.id && topic.title && topic.need;
  });
}

function pickEvergreenLeadTopics(options) {
  options = options || {};
  var topics = loadTopics();
  if (!topics.length) return { topics: [], nextIndex: 0, today: todayKey() };

  var count = Math.max(1, Number(options.count || 1) || 1);
  var dailyCap = options.dailyCap !== false;
  var state = options.state || {};
  var today = todayKey();

  if (dailyCap) {
    count = Math.min(count, 1);
    if (state.lastEvergreenDate === today) {
      return {
        topics: [],
        nextIndex: state.evergreenTopicIndex || 0,
        today: today,
        capped: true,
      };
    }
  }

  var used = new Set(state.evergreenPublishedTopicIds || []);
  if (used.size >= topics.length) used = new Set();

  var selected = [];
  var start = Math.max(0, Number(state.evergreenTopicIndex || 0) || 0) % topics.length;
  var cursor = start;
  var scanned = 0;

  while (selected.length < count && scanned < topics.length * 2) {
    var topic = topics[cursor % topics.length];
    cursor += 1;
    scanned += 1;
    if (used.has(topic.id)) continue;
    selected.push(topic);
    used.add(topic.id);
  }

  return {
    topics: selected,
    nextIndex: cursor % topics.length,
    today: today,
    capped: false,
  };
}

function listItems(items) {
  return (items || []).map(function (item) {
    return String(item || "");
  }).filter(Boolean);
}

function createEvergreenLeadArticle(topic) {
  var slugBase = slugify("guide-" + topic.id + "-" + todayKey());
  var file = uniqueFile(slugBase || "guide-assurance-" + Date.now());
  var need = topic.need || "habitation";
  var section = topic.section || "actu";
  var checklist = listItems(topic.checklist);
  var advisorQuestions = listItems(topic.advisorQuestions);
  var title = topic.title + " : guide courtier " + monthLabel();

  return {
    file: file,
    section: section,
    tag: topic.tag || "Guide assurance",
    tagClass: topic.tagClass || "tag-actu",
    title: title,
    description:
      topic.description ||
      "Guide assurance Leads Opportunities : garanties a comparer, points de vigilance et questionnaire gratuit pour obtenir un devis adapte.",
    meta: "7 min · " + monthLabel(),
    cardExcerpt: String(topic.summary || topic.description || topic.title).slice(0, 130),
    cta: ctaWithUtm(need, topic.id),
    blocks: [
      {
        type: "p",
        text:
          "Ce guide pratique aide a transformer une question assurance en <strong>decision concrete</strong> : quelles garanties verifier, quelles informations preparer et quand demander un devis. L'objectif est simple : eviter un contrat trop cher, trop faible ou mal declare.",
      },
      {
        type: "h2",
        text: "Pourquoi verifier maintenant",
      },
      {
        type: "p",
        text:
          String(topic.summary || "Un contrat utile commence par un besoin bien qualifie.") +
          " Avant de comparer les prix, commencez par cadrer le risque reel, les exclusions et le niveau de service attendu.",
      },
      {
        type: "h2",
        text: "Les garanties a comparer",
      },
      {
        type: "ul",
        items: checklist.length
          ? checklist
          : [
              "Comparer les garanties essentielles a situation equivalente",
              "Verifier plafonds, franchises, exclusions et delais",
              "Declarer les informations importantes sans approximation",
              "Conserver les justificatifs utiles avant souscription",
              "Demander un devis personnalise avant de resilier",
            ],
      },
      { type: "bridge" },
      {
        type: "h2",
        text: "Les informations a preparer pour un devis",
      },
      {
        type: "ul",
        items: advisorQuestions.length
          ? advisorQuestions
          : [
              "Situation personnelle ou professionnelle",
              "Contrat actuel et echeance",
              "Budget cible et niveau de garantie souhaite",
            ],
      },
      {
        type: "p",
        text:
          "Le questionnaire gratuit Leads Opportunities prend quelques minutes. Il permet d'orienter la demande vers le bon parcours, puis un conseiller peut comparer plusieurs offres selon votre profil.",
      },
      {
        type: "h2",
        text: "Quand demander un rappel conseiller",
      },
      {
        type: "p",
        text:
          "Demandez un rappel si votre contrat arrive a echeance, si votre situation a change, ou si vous hesitez entre deux niveaux de garantie. Leads Opportunities est courtier ORIAS : l'accompagnement reste gratuit et sans engagement jusqu'au choix d'une offre.",
      },
    ],
    related: relatedForSection(section, need),
    source: {
      name: "Planning editorial Leads Opportunities",
      url: "",
      fetchedAt: new Date().toISOString(),
    },
    evergreenLead: true,
    evergreenTopicId: topic.id,
  };
}

module.exports = {
  createEvergreenLeadArticle: createEvergreenLeadArticle,
  loadTopics: loadTopics,
  pickEvergreenLeadTopics: pickEvergreenLeadTopics,
  todayKey: todayKey,
};
