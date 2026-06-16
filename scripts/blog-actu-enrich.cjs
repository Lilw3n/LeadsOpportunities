/**
 * Enrichissement intelligent par niche assurance (sans IA).
 */
const { matchTopic, ctaWithUtm, monthLabel, relatedForSection } = require("./blog-actu-lib.cjs");

var ANGLES = {
  sante: {
    hook: "Le reste a charge sante peut exploser si votre mutuelle n'est pas calibree sur vos vrais besoins.",
    checklist: [
      "Hospitalisation et chirurgie : plafonds honoraires",
      "Pharmacie et medicaments nouvellement rembourses",
      "Optique / dentaire si consommation annuelle",
      "Delais de carence avant changement de contrat",
      "Tiers payant et teletransmission",
    ],
    ctaLine:
      "Le questionnaire mutuelle (3 min) identifie le bon niveau — sans engagement, reponse orientee par un courtier ORIAS.",
  },
  habitation: {
    hook: "Un sinistre habitation mal couvert peut coutet des dizaines de milliers d'euros a votre charge.",
    checklist: [
      "Capital mobilier vs valeur reelle du contenu",
      "Degats des eaux, tempete, catastrophes naturelles",
      "Usage du logement (residence, location, Airbnb)",
      "Franchise et exclusions du contrat",
      "Coordination PNO si proprietaire bailleur",
    ],
    ctaLine:
      "Le questionnaire habitation estime surface et risques — base pour un devis coherent.",
  },
  auto: {
    hook: "Le mauvais niveau de garantie auto se paie au premier sinistre responsable.",
    checklist: [
      "Tiers simple vs tiers etendu vs tous risques",
      "Bonus-malus et coefficient actuel",
      "Franchise et vehicule de remplacement",
      "Conducteurs declares au contrat",
      "Options assistance et protection juridique",
    ],
    ctaLine: "Questionnaire auto : profil conducteur et usage en 3 minutes.",
  },
  emprunteur: {
    hook: "L'assurance emprunteur peut representer des milliers d'euros sur la duree du pret.",
    checklist: [
      "Quotite et garanties deces / invalidite",
      "ITT et perte d'emploi selon statut",
      "Loi Lemoine : comparer hors banque",
      "Coordination avec prevoyance existante",
      "Mise a jour apres demenagement ou divorce",
    ],
    ctaLine: "Questionnaire emprunteur : pret, age, fumeur — orientation Lemoine possible.",
  },
  prevoyance: {
    hook: "Sans prevoyance solide, un arret de travail fait chuter les revenus du foyer.",
    checklist: [
      "Maintien de salaire et franchise ITT",
      "Invalidite et rente education",
      "Deces et capital pour les proches",
      "Statut salarie vs TNS",
      "Coordination avec mutuelle et PER",
    ],
    ctaLine: "Questionnaire prevoyance : securiser revenus et charges fixes.",
  },
  vtc: {
    hook: "Un contrat VTC inadapte peut bloquer Uber, Bolt ou Heetch — et couter cher au sinistre.",
    checklist: [
      "RC Pro plateforme et activite",
      "Vehicule : usage professionnel declare",
      "Assistance et perte d'exploitation",
      "Franchise et conducteurs secondaires",
      "Attestation a jour avant chaque course",
    ],
    ctaLine: "Questionnaire VTC : plateforme, vehicule, anciennete.",
  },
  animaux: {
    hook: "Une urgence veterinaire peut depasser 1 000 EUR sans assurance animaux.",
    checklist: [
      "Plafond annuel et franchise",
      "Maladies hereditaires et exclusions",
      "Prevention et vermifuge",
      "Age du chien ou chat a la souscription",
      "Delai de carence",
    ],
    ctaLine: "Questionnaire animaux : espece, age, antecedents.",
  },
  "rc-pro": {
    hook: "Un litige client peut engager votre patrimoine personnel sans RC Pro adequate.",
    checklist: [
      "Activite declaree vs activite reelle",
      "Plafonds RC et protection juridique",
      "Cyber et materiel professionnel",
      "Sous-traitance et dommages corporels",
      "Coordination avec assurance auto pro",
    ],
    ctaLine: "Questionnaire RC Pro : activite et chiffre d'affaires.",
  },
};

function enrichFromCandidate(candidate) {
  var title = String(candidate.title || "").trim();
  var topic = matchTopic(title + " " + (candidate.summary || ""));
  var need = candidate.need || topic.need || "habitation";
  var angle = ANGLES[need] || ANGLES.habitation;
  var slug = title.slice(0, 40);
  var file = candidate.suggestedFile;
  if (!file) return null;
  var platform = platformLabel(candidate.sourceType || candidate.source);

  return {
    file: file.endsWith(".html") ? file : file + ".html",
    section: topic.section,
    tag: topic.tag,
    tagClass: topic.tagClass,
    title: buildTitle(title, need),
    description: title.slice(0, 155) + " — conseils assurance et questionnaire gratuit Leads Opportunities.",
    meta: "7 min · " + monthLabel(),
    cardExcerpt: title.slice(0, 110) + " — impact sur votre assurance.",
    cta: ctaWithUtm(need, slug),
    blocks: [
      {
        type: "p",
        text:
          "Selon l'information relayee ce jour via <strong>" +
          platform +
          "</strong> (<strong>" +
          escapeHtml(shortTitle(title)) +
          "</strong>), l'actualite rappelle un enjeu concret pour les foyers francais. " +
          angle.hook,
      },
      { type: "h2", text: "Lien avec votre contrat d'assurance" },
      {
        type: "p",
        text:
          "Avant de react agir sous le coup de l'emotion mediatique, verifiez <strong>ce que couvre deja votre contrat</strong> : plafonds, franchises, exclusions, delais. Un comparatif a garanties equivalentes evite de surpayer ou de rester sous-assure.",
      },
      { type: "h2", text: "Checklist pratique (5 minutes)" },
      { type: "ul", items: angle.checklist },
      { type: "bridge" },
      { type: "h2", text: "Prochaine etape : qualifier votre besoin" },
      { type: "p", text: angle.ctaLine },
      {
        type: "p",
        text:
          "Leads Opportunities — courtier ORIAS. Nous comparons April, AXA, Allianz, Generali, Zephir et le marche selon votre profil. <strong>100 % gratuit</strong>, sans engagement.",
      },
    ],
    related: relatedForSection(topic.section, need),
  };
}

function buildTitle(raw, need) {
  var short = shortTitle(raw);
  var suffix = {
    sante: "mutuelle et remboursements",
    habitation: "assurance habitation",
    auto: "assurance auto",
    emprunteur: "pret et assurance emprunteur",
    prevoyance: "prevoyance et revenus",
    vtc: "assurance VTC",
    animaux: "assurance animaux",
    "rc-pro": "RC Pro",
  };
  return short + " : " + (suffix[need] || "assurance") + " — que faire ?";
}

function shortTitle(t) {
  return t.length > 90 ? t.slice(0, 87) + "…" : t;
}

function escapeHtml(s) {
  return String(s).replace(/</g, "").replace(/>/g, "");
}

function platformLabel(sourceType) {
  var t = String(sourceType || "").toLowerCase();
  if (t === "cafeyn" || t.indexOf("cafeyn") !== -1) return "Cafeyn (presse partenaire)";
  if (t === "edge" || t.indexOf("edge") !== -1 || t.indexOf("msn") !== -1 || t.indexOf("bing") !== -1) {
    return "Microsoft Edge / Bing actu";
  }
  if (t === "firefox" || t.indexOf("firefox") !== -1 || t.indexOf("pocket") !== -1) {
    return "Mozilla Firefox / Pocket";
  }
  return "l'actualite du jour";
}

module.exports = { enrichFromCandidate: enrichFromCandidate };
