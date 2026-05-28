/**
 * Pages SEO silos « niches » — export pour generate-seo-pages.cjs
 */
const { buildAnimauxLongtailPages } = require("./niche-animaux-pages.cjs");
const { buildChassePages, buildEquitationPages } = require("./niche-chasse-equitation-pages.cjs");

function page(data) {
  return Object.assign(
    {
      benefits: [],
      steps: [],
      sections: [],
      faq: [],
      related: [],
    },
    data
  );
}

const ANIMAUX_BASE = "/assurance-animaux/";
const LANDING = "/landings/animaux.html";
const LANDING_EXPRESS = "/landings/animaux-express.html";

const ANIMAUX_PAGES = [
  page({
    file: "assurance-animaux/index.html",
    theme: "animaux",
    badge: "Assurance animaux",
    title: "Assurance animaux | Chien, chat — devis gratuit 2026",
    description:
      "Assurance animaux pour chien, chat et NAC : frais veterinaires, prevention, chirurgie. Comparatif des offres (Santévet, Bulle Bleue…) avec courtier ORIAS.",
    h1: "Assurance animaux : proteger votre compagnon sans vous ruiner",
    intro:
      "Les factures veterinaires peuvent exploser (chirurgie, hospitalisation, imagerie). Nous comparons les formules du marche — prevention, plafonds, franchises — avec un conseiller qui connait les vrais besoins des proprietaires.",
    cta: { href: LANDING, label: "Comparer l assurance animaux" },
    crumbs: [
      { name: "Accueil", url: "/" },
      { name: "Niches", url: "/niches/" },
      { name: "Assurance animaux", url: ANIMAUX_BASE },
    ],
    benefits: [
      { title: "Marques connues", text: "Santévet, Bulle Bleue, Kozoo et reseau courtage : des noms rassurants." },
      { title: "Formules expliquees", text: "Plafond annuel, franchise, prevention : tout en clair avant de signer." },
      { title: "Rappel humain", text: "Devis en ligne puis conseiller dedie — pas un comparateur froid." },
    ],
    steps: [
      { title: "Decrivez votre animal", text: "Espece, age, race, antecedents sante." },
      { title: "Choisissez vos priorites", text: "Prevention, chirurgie, budget mensuel." },
      { title: "Recevez un comparatif", text: "Offres adaptees avec explication telephone." },
    ],
    sections: [
      {
        h2: "Pourquoi souscrire une assurance animaux ?",
        paragraphs: [
          "Une consultation simple coute deja cher ; une urgence (torsion d estomac, fracture, allergie severe) peut depasser 1 000 EUR. L assurance lisse le budget avec un plafond annuel et des remboursements partiels des actes.",
          "Sans couverture, beaucoup de proprietaires repoussent les soins. Avec une bonne formule, vous decidez selon le besoin medical, pas seulement selon le portefeuille.",
        ],
      },
      {
        h2: "Ce que nous comparons pour vous",
        list: [
          "Plafond annuel et taux de remboursement",
          "Franchise par acte ou annuelle",
          "Prevention (vaccins, antiparasitaires, bilan)",
          "Delais de carence et exclusions",
          "Prise en charge chirurgie / hospitalisation",
        ],
      },
    ],
    related: [
      { href: "/assurance-animaux/chien/", label: "Assurance chien" },
      { href: "/assurance-animaux/chat/", label: "Assurance chat" },
      { href: "/assurance-animaux/villes/", label: "Assurance animaux par ville" },
      { href: "/assurance-animaux/comparatif/", label: "Comparatif assurance animaux" },
      { href: "/assurance-animaux/tarif/", label: "Tarif assurance animaux" },
      { href: "/assurance-animaux/chien/pas-cher/", label: "Assurance chien pas cher" },
      { href: "/assurance-animaux/chat/pas-cher/", label: "Assurance chat pas cher" },
      { href: "/assurance-animaux/remboursement-veterinaire/", label: "Remboursement veterinaire" },
      { href: LANDING_EXPRESS, label: "Devis express 30 sec" },
    ],
    faq: [
      {
        q: "Assurance animaux : a partir de quel age ?",
        a: "La plupart des assureurs acceptent les chiots et chatons a partir de 2-3 mois, parfois jusqu a un age limite a l adhesion (souvent 8-10 ans).",
      },
      {
        q: "Les maladies chroniques sont-elles couvertes ?",
        a: "Cela depend du contrat et des antecedents declares. Nous verifions les exclusions avant de vous proposer une offre.",
      },
      {
        q: "Combien de temps pour un devis ?",
        a: "Formulaire express en 30 secondes ou questionnaire complet en 3 minutes, puis rappel conseiller en journee ouvrable.",
      },
    ],
  }),
  page({
    file: "assurance-animaux/chien/index.html",
    theme: "animaux",
    badge: "Chien",
    title: "Assurance chien | Devis et comparatif 2026",
    description:
      "Assurance chien : remboursement frais veterinaires, prevention, chirurgie. Devis gratuit, courtier ORIAS, comparatif des assureurs specialises.",
    h1: "Assurance chien : la bonne couverture pour votre compagnon",
    intro:
      "Race, age, poids, antecedents : le tarif chien varie fortement. Nous ciblons les formules adaptees aux profils sensibles (grandes races, chiots, chiens seniors).",
    cta: { href: LANDING, label: "Devis assurance chien" },
    crumbs: [
      { name: "Accueil", url: "/" },
      { name: "Assurance animaux", url: ANIMAUX_BASE },
      { name: "Assurance chien", url: "/assurance-animaux/chien/" },
    ],
    benefits: [
      { title: "Profil chien", text: "Questionnaire oriente races et risques courants." },
      { title: "Budget maitrise", text: "Du essentiel au premium selon votre usage veterinaire." },
      { title: "Conseil telephonique", text: "On traduit les garanties en euros rembourses." },
    ],
    sections: [
      {
        h2: "Points de vigilance pour un chien",
        list: [
          "Dysplasie et pathologies de race",
          "Accidents domestiques et morsures",
          "Sterilisation et suivi annuel",
          "Osteopathie / alternatives selon contrats",
        ],
      },
    ],
    related: [
      { href: ANIMAUX_BASE, label: "Guide assurance animaux" },
      { href: "/assurance-animaux/chien/pas-cher/", label: "Chien pas cher" },
      { href: "/assurance-animaux/chien/chiot/", label: "Assurance chiot" },
      { href: "/assurance-animaux/chien/senior/", label: "Chien senior" },
      { href: "/assurance-animaux/chat/", label: "Assurance chat" },
      { href: "/assurance-animaux/villes/", label: "Par ville" },
    ],
    faq: [
      {
        q: "Mon chien est-il trop vieux pour etre assure ?",
        a: "Plusieurs assureurs acceptent les seniors avec plafonds ou franchises specifiques. Nous testons votre profil.",
      },
    ],
  }),
  page({
    file: "assurance-animaux/chat/index.html",
    theme: "animaux",
    badge: "Chat",
    title: "Assurance chat | Mutuelle et devis gratuit",
    description:
      "Assurance chat : frais veterinaires, prevention, urgence. Comparatif des offres du marche, devis en ligne, courtier ORIAS.",
    h1: "Assurance chat : couvrir les soins du quotidien et les urgences",
    intro:
      "Les chats interieurs ou d exterieur ont des profils de risque differents. Nous adaptons le niveau de garanties (prevention, plafond, franchise) a votre situation.",
    cta: { href: LANDING, label: "Devis assurance chat" },
    crumbs: [
      { name: "Accueil", url: "/" },
      { name: "Assurance animaux", url: ANIMAUX_BASE },
      { name: "Assurance chat", url: "/assurance-animaux/chat/" },
    ],
    benefits: [
      { title: "Chat d interieur / exterieur", text: "Risques et options expliques simplement." },
      { title: "Prevention incluse", text: "Vaccins et bilans selon formules." },
      { title: "Sans engagement", text: "Devis gratuit, vous decidez apres le comparatif." },
    ],
    related: [
      { href: ANIMAUX_BASE, label: "Assurance animaux" },
      { href: "/assurance-animaux/chien/", label: "Assurance chien" },
      { href: "/assurance-animaux/chat/pas-cher/", label: "Chat pas cher" },
      { href: "/assurance-animaux/chat/chaton/", label: "Assurance chaton" },
      { href: "/assurance-animaux/villes/", label: "Par ville" },
      { href: LANDING_EXPRESS, label: "Rappel express" },
    ],
    faq: [
      {
        q: "Assurance chat : que couvre-t-on en general ?",
        a: "Consultations, medicaments, chirurgie, parfois prevention. Chaque contrat a ses plafonds et exclusions.",
      },
    ],
  }),
  page({
    file: "assurance-animaux/comparatif/index.html",
    theme: "animaux",
    badge: "Comparatif",
    title: "Comparatif assurance animaux 2026 | Chien et chat",
    description:
      "Comparer assurance animaux a garanties equivalentes : plafonds, franchises, prevention. Courtier ORIAS, devis gratuit.",
    h1: "Comparatif assurance animaux : lire les vraies differences",
    intro:
      "Deux contrats a 25 EUR/mois peuvent rembourser tres differemment. Nous alignons le comparatif sur vos priorites : chirurgie, prevention, budget.",
    cta: { href: LANDING, label: "Lancer le comparatif" },
    crumbs: [
      { name: "Accueil", url: "/" },
      { name: "Assurance animaux", url: ANIMAUX_BASE },
      { name: "Comparatif", url: "/assurance-animaux/comparatif/" },
    ],
    sections: [
      {
        h2: "Criteres de comparaison",
        list: [
          "Plafond annuel (ex. 1 500 / 2 500 / 4 000 EUR)",
          "Taux de remboursement (50 % a 100 % selon actes)",
          "Franchise par sinistre",
          "Delai de carence",
          "Reseau de cliniques partenaires",
        ],
      },
    ],
    related: [
      { href: "/assurance-animaux/remboursement-veterinaire/", label: "Remboursement veterinaire" },
      { href: LANDING, label: "Questionnaire complet" },
    ],
    faq: [
      {
        q: "Puis-je changer d assurance animaux ?",
        a: "Oui selon echeance et conditions de resiliation. Nous vous aidons a comparer avant de basculer.",
      },
    ],
  }),
  page({
    file: "assurance-animaux/remboursement-veterinaire/index.html",
    theme: "animaux",
    badge: "Remboursement",
    title: "Remboursement frais veterinaires | Assurance animaux",
    description:
      "Comment fonctionne le remboursement veterinaire avec une assurance animaux : plafond, franchise, delais. Devis et conseil courtier.",
    h1: "Remboursement veterinaire : comprendre le calcul",
    intro:
      "Facture de 400 EUR, remboursement de 280 EUR : voici comment lire plafond, taux et franchise. Nous vous aidons a choisir une formule coherente avec vos depenses reelles.",
    cta: { href: LANDING, label: "Estimer ma couverture" },
    crumbs: [
      { name: "Accueil", url: "/" },
      { name: "Assurance animaux", url: ANIMAUX_BASE },
      { name: "Remboursement veterinaire", url: "/assurance-animaux/remboursement-veterinaire/" },
    ],
    sections: [
      {
        h2: "Exemple simplifie",
        paragraphs: [
          "Facture veterinaire 350 EUR, taux 80 %, franchise 50 EUR : remboursement = (350 - 50) x 80 % = 240 EUR, dans la limite du plafond annuel restant.",
          "Les actes de prevention peuvent etre rembourses a 100 % jusqu a un sous-plafond selon le contrat.",
        ],
      },
    ],
    related: [
      { href: "/assurance-animaux/comparatif/", label: "Comparatif" },
      { href: LANDING_EXPRESS, label: "Devis express" },
    ],
    faq: [
      {
        q: "Faut-il avancer les frais ?",
        a: "Souvent oui, puis envoi de la facture a l assureur. Certains reseaux proposent le tiers payant en clinique partenaire.",
      },
    ],
  }),
];

const ANIMAUX_LONGTAIL_PAGES = buildAnimauxLongtailPages(page, ANIMAUX_BASE);
const CHASSE_PAGES = buildChassePages(page);
const EQUITATION_PAGES = buildEquitationPages(page);
const ALL_NICHE_PAGES = ANIMAUX_PAGES.concat(ANIMAUX_LONGTAIL_PAGES, CHASSE_PAGES, EQUITATION_PAGES);

function getNicheSitemapEntries(base) {
  const today = new Date().toISOString().slice(0, 10);
  const staticPaths = [
    "/niches/",
    "/landings/animaux.html",
    "/landings/animaux-express.html",
    "/assurance-chasse/",
    "/assurance-chasse/rc-chasseur/",
    "/assurance-chasse/chien-chasse/",
    "/assurance-equitation/",
    "/assurance-equitation/rc-equestre/",
    "/assurance-equitation/cheval/",
  ];
  const pagePaths = ALL_NICHE_PAGES.map(function (p) {
    return "/" + p.file.replace(/index\.html$/, "");
  });
  return staticPaths
    .concat(pagePaths)
    .map(function (p) {
      var pr = "0.88";
      if (p.indexOf("landings") >= 0) pr = "0.9";
      else if (p === "/niches/") pr = "0.85";
      else if (p === "/assurance-animaux/" || p.indexOf("/assurance-chasse/") === 0 && p.split("/").length <= 4) pr = "0.9";
      return {
        loc: base + p,
        lastmod: today,
        changefreq: "weekly",
        priority: pr,
      };
    });
}

module.exports = {
  NICHE_PAGES: ALL_NICHE_PAGES,
  getNicheSitemapEntries: getNicheSitemapEntries,
};
