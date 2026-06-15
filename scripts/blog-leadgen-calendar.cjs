/**
 * Calendrier editorial lead-gen.
 *
 * Les articles dont publishDate est passee sont ajoutes au manifeste blog au build.
 * La publication reguliere est pilotee par le workflow hebdomadaire.
 */

var DAY_MS = 24 * 60 * 60 * 1000;

function utcDate(value) {
  return new Date(String(value) + "T00:00:00.000Z");
}

function todayUtc() {
  var now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function cloneArticle(article) {
  return JSON.parse(JSON.stringify(article));
}

var LEADGEN_ARTICLES = [
  {
    file: "mutuelle-senior-garanties-avant-65-ans.html",
    publishDate: "2026-06-15",
    section: "sante",
    tag: "Mutuelle senior",
    tagClass: "tag-sante",
    title: "Mutuelle senior : 6 garanties a verifier avant 65 ans",
    description:
      "Hospitalisation, optique, dentaire, audiologie : les garanties mutuelle senior a comparer avant la retraite pour limiter le reste a charge.",
    meta: "8 min · Juin 2026",
    cardExcerpt: "Avant 65 ans : les postes mutuelle a verrouiller.",
    cta: { href: "../landings/questionnaire.html?need=sante&journey=standard", label: "Questionnaire mutuelle senior" },
    keywords: [
      "mutuelle senior",
      "complementaire sante retraite",
      "hospitalisation senior",
      "remboursement dentaire",
      "audiologie",
      "devis mutuelle senior",
    ],
    blocks: [
      {
        type: "p",
        text: "Le passage a la retraite change souvent le prix de la <strong>mutuelle senior</strong> : fin de la part employeur, besoins optique/dentaire plus frequents, hospitalisation a mieux couvrir. L'objectif n'est pas de prendre la formule la plus chere, mais de verrouiller les postes qui creent le plus de reste a charge.",
      },
      { type: "h2", text: "1. Hospitalisation : le poste prioritaire" },
      {
        type: "p",
        text: "Chambre particuliere, depassements d'honoraires, forfait journalier : une hospitalisation peut couter plusieurs centaines d'euros sans bon niveau. Verifiez le % BRSS chirurgie et le forfait chambre par jour.",
      },
      { type: "h2", text: "2. Optique, dentaire et audiologie" },
      {
        type: "ul",
        items: [
          "Optique : verres progressifs, renouvellement, reseau de soins",
          "Dentaire : couronnes, implants, protheses et plafond annuel",
          "Audiologie : panier 100 % sante et forfait hors panier",
          "Delais de carence : a verifier avant des soins deja prevus",
        ],
      },
      { type: "bridge" },
      { type: "h2", text: "3. Budget : comparer a garanties equivalentes" },
      {
        type: "p",
        text: "Un contrat a 70 EUR/mois peut etre meilleur qu'un contrat a 55 EUR si l'hospitalisation et le dentaire sont solides. Demandez un comparatif a garanties equivalentes avec vos vrais postes de soins.",
      },
    ],
    related: [
      { href: "./mutuelle-sante-5-criteres.html", label: "5 criteres pour choisir sa mutuelle" },
      { href: "./mutuelle-remboursement-optique-dentaire-2026.html", label: "Optique et dentaire" },
      { href: "../landings/sante.html", label: "Parcours mutuelle" },
    ],
    faq: [
      {
        q: "Quand comparer sa mutuelle senior ?",
        a: "Idealement 3 a 6 mois avant la retraite ou avant une hausse d'echeance, pour eviter les carences sur les soins prevus.",
      },
      {
        q: "Faut-il choisir le niveau maximum ?",
        a: "Pas toujours. Il faut renforcer les postes reels : hospitalisation, dentaire, optique ou audiologie selon votre profil.",
      },
    ],
  },
  {
    file: "assurance-chien-pas-chere-urgences.html",
    publishDate: "2026-06-22",
    section: "animaux",
    tag: "Chien",
    tagClass: "tag-animaux",
    title: "Assurance chien pas chere : reduire la cotisation sans sacrifier les urgences",
    description:
      "Franchise, plafond, prevention : comment trouver une assurance chien pas chere tout en gardant une vraie protection en cas d'urgence veterinaire.",
    meta: "7 min · Juin 2026",
    cardExcerpt: "Payer moins cher sans perdre la couverture urgence.",
    cta: { href: "../landings/questionnaire.html?need=animaux&journey=standard", label: "Questionnaire assurance chien" },
    keywords: ["assurance chien pas chere", "frais veterinaires chien", "urgence veterinaire", "devis assurance chien"],
    blocks: [
      {
        type: "p",
        text: "Une <strong>assurance chien pas chere</strong> peut etre pertinente si elle garde l'essentiel : accident, maladie lourde et urgence. Le prix bas devient dangereux quand le plafond annuel est trop faible ou quand les exclusions retirent les soins les plus couteux.",
      },
      { type: "h2", text: "Les leviers qui baissent vraiment la prime" },
      {
        type: "ul",
        items: [
          "Franchise annuelle acceptee si vous avez une petite reserve",
          "Taux de remboursement 70 ou 80 % plutot que 100 % si le plafond reste correct",
          "Prevention en option si votre budget est serre",
          "Souscription jeune : moins d'exclusions qu'apres les premiers problemes",
        ],
      },
      { type: "bridge" },
      { type: "h2", text: "Ce qu'il ne faut pas sacrifier" },
      {
        type: "p",
        text: "Gardez un plafond coherent pour chirurgie, radio, hospitalisation et maladies digestives ou articulaires. Une seule urgence peut depasser 800 EUR, surtout pour un chien de grande race.",
      },
    ],
    related: [
      { href: "./assurance-chien-frais-veterinaires.html", label: "Frais veterinaires chien" },
      { href: "../assurance-animaux/chien/pas-cher/", label: "Assurance chien pas cher" },
      { href: "../landings/animaux-express.html", label: "Devis express animaux" },
    ],
  },
  {
    file: "vtc-electrique-hybride-assurance-batterie.html",
    publishDate: "2026-06-29",
    section: "vtc",
    tag: "VTC electrique",
    tagClass: "tag-vtc",
    title: "VTC electrique ou hybride : assurance, batterie et plateformes",
    description:
      "Tesla, hybride, recharge, batterie : les garanties assurance a verifier avant d'exploiter un vehicule VTC electrique ou hybride.",
    meta: "8 min · Juin 2026",
    cardExcerpt: "Batterie, recharge, plateforme : checklist VTC electrique.",
    cta: { href: "../landings/questionnaire.html?need=vtc&journey=standard", label: "Questionnaire VTC electrique" },
    keywords: ["assurance vtc electrique", "vtc hybride", "batterie voiture electrique", "tesla vtc", "devis vtc"],
    blocks: [
      {
        type: "p",
        text: "Le vehicule electrique attire les chauffeurs VTC : cout carburant reduit, image premium, compatibilite avec certaines zones urbaines. Cote assurance, la valeur du vehicule et la <strong>batterie</strong> changent le calcul.",
      },
      { type: "h2", text: "Batterie : location ou propriete ?" },
      {
        type: "p",
        text: "Si la batterie est louee, le contrat doit clarifier qui indemnise quoi en cas de vol, incendie ou choc. Si elle est incluse dans le vehicule, verifiez la valeur assuree et l'assistance remorquage vers borne ou garage agree.",
      },
      { type: "h2", text: "Plateformes et usage intensif" },
      {
        type: "ul",
        items: [
          "Usage transport de personnes declare explicitement",
          "Kilometrage annuel coherent avec Uber, Bolt ou Heetch",
          "Assistance 0 km utile en panne batterie",
          "Garantie valeur a neuf si vehicule recent ou LOA",
        ],
      },
      { type: "bridge" },
    ],
    related: [
      { href: "./assurance-vtc-uber-bolt-heetch.html", label: "Contrat compatible plateformes" },
      { href: "./assurance-vtc-franchise-garanties-2026.html", label: "Franchise VTC" },
      { href: "../landings/vtc.html", label: "Devis VTC" },
    ],
  },
  {
    file: "degat-des-eaux-location-qui-paie.html",
    publishDate: "2026-07-06",
    section: "habitat",
    tag: "Degat des eaux",
    tagClass: "tag-habitation",
    title: "Degat des eaux en location : qui paie entre locataire et proprietaire ?",
    description:
      "Fuite, voisin, copropriete : comprendre qui declare et qui paie apres un degat des eaux en location.",
    meta: "7 min · Juillet 2026",
    cardExcerpt: "Locataire, proprio, voisin : qui declare quoi ?",
    cta: { href: "../landings/questionnaire.html?need=habitation&journey=standard", label: "Questionnaire habitation" },
    keywords: ["degat des eaux location", "assurance habitation locataire", "proprietaire non occupant", "declaration sinistre"],
    blocks: [
      {
        type: "p",
        text: "Un <strong>degat des eaux en location</strong> implique souvent plusieurs contrats : assurance du locataire, assurance du proprietaire, copropriete, voisin. Le bon reflexe : limiter les dommages, photographier, puis declarer rapidement.",
      },
      { type: "h2", text: "Locataire : les premiers reflexes" },
      {
        type: "ul",
        items: [
          "Couper l'eau si la fuite vient du logement",
          "Prevenir proprietaire, syndic et voisin touche",
          "Declarer a son assureur dans les delais",
          "Remplir un constat amiable degat des eaux si possible",
        ],
      },
      { type: "bridge" },
      { type: "h2", text: "Proprietaire : quand la PNO intervient" },
      {
        type: "p",
        text: "La PNO peut intervenir si le logement est vacant, si le sinistre vient d'un element de structure ou si l'assurance locataire ne suffit pas. En copropriete, le syndic peut aussi etre implique.",
      },
    ],
    related: [
      { href: "./assurance-habitation-locataire-proprietaire-2026.html", label: "Assurance habitation locataire/proprietaire" },
      { href: "./pno-bailleur-proprietaire-non-occupant.html", label: "PNO bailleur" },
      { href: "../assurance-habitation/", label: "Guide habitation" },
    ],
  },
  {
    file: "rachat-credit-conso-immo-etude.html",
    publishDate: "2026-07-13",
    section: "finance",
    tag: "Rachat credit",
    tagClass: "tag-immo",
    title: "Rachat de credit conso et immo : quand demander une etude ?",
    description:
      "Mensualites, taux d'endettement, credits conso : les signaux qui justifient une etude de rachat ou regroupement de credits.",
    meta: "8 min · Juillet 2026",
    cardExcerpt: "Mensualite trop lourde : les signaux a surveiller.",
    cta: { href: "../landings/questionnaire.html?need=credit-immo&journey=standard", label: "Questionnaire rachat credit" },
    keywords: ["rachat credit", "regroupement de credits", "rachat credit immobilier", "baisse mensualites", "courtier credit"],
    blocks: [
      {
        type: "p",
        text: "Un <strong>rachat de credit</strong> n'est pas seulement une baisse de mensualite. C'est une operation qui recompose la dette : duree, taux, assurance emprunteur, frais et reste a vivre. Elle merite une etude quand le budget devient trop tendu ou quand plusieurs credits se chevauchent.",
      },
      { type: "h2", text: "3 signaux qui justifient une simulation" },
      {
        type: "ul",
        items: [
          "Taux d'endettement au-dessus du seuil accepte par les banques",
          "Credits conso qui absorbent l'epargne de precaution",
          "Projet immobilier bloque par des mensualites existantes",
          "Besoin de financer des travaux sans multiplier les lignes de credit",
        ],
      },
      { type: "bridge" },
      { type: "h2", text: "Comparer mensualite et cout total" },
      {
        type: "p",
        text: "Une mensualite plus basse peut allonger la duree et augmenter le cout total. Demandez toujours deux lectures : gain mensuel immediat et cout complet sur toute la duree.",
      },
    ],
    related: [
      { href: "./rachat-credit-immobilier-guide-2026.html", label: "Guide rachat credit immobilier" },
      { href: "../credit-immo/rachat-credit/", label: "Page rachat credit" },
      { href: "../landings/credit-immo.html", label: "Etude credit immo" },
    ],
  },
  {
    file: "rc-pro-consultant-independant-plafonds.html",
    publishDate: "2026-07-20",
    section: "pro",
    tag: "RC Pro",
    tagClass: "tag-pro",
    title: "RC Pro consultant independant : devis, plafonds et exclusions",
    description:
      "Consultant, freelance, formateur : les plafonds RC Pro et exclusions a verifier avant de signer un devis.",
    meta: "7 min · Juillet 2026",
    cardExcerpt: "Consultant : les clauses RC Pro a lire avant signature.",
    cta: { href: "../landings/questionnaire.html?need=rc-pro&journey=standard", label: "Questionnaire RC Pro" },
    keywords: ["rc pro consultant", "assurance freelance", "responsabilite civile professionnelle", "devis rc pro"],
    blocks: [
      {
        type: "p",
        text: "Un consultant independant vend du conseil, du code, de la formation ou de l'accompagnement. Une erreur, un retard ou une recommandation contestee peut declencher une reclamation client. La <strong>RC Pro</strong> sert a proteger votre tresorerie et votre patrimoine personnel.",
      },
      { type: "h2", text: "Plafonds : regarder le contrat client" },
      {
        type: "p",
        text: "Certaines missions imposent 1, 3 ou 5 millions d'euros de plafond. Votre devis RC Pro doit suivre ces exigences, sinon le client peut refuser le demarrage.",
      },
      { type: "h2", text: "Exclusions frequentes" },
      {
        type: "ul",
        items: [
          "Retard volontaire ou penalites contractuelles pures",
          "Cyber-risque si aucune option cyber n'est souscrite",
          "Activite non declaree au contrat",
          "Sous-traitance non encadree",
        ],
      },
      { type: "bridge" },
    ],
    related: [
      { href: "./rc-pro-freelance-artisan-guide.html", label: "Guide RC Pro freelance" },
      { href: "../landings/devis.html?need=rc-pro", label: "Devis RC Pro" },
    ],
  },
  {
    file: "prevoyance-tns-maintien-revenus-arret.html",
    publishDate: "2026-07-27",
    section: "prevoyance",
    tag: "Prevoyance TNS",
    tagClass: "tag-prevoyance",
    title: "Prevoyance TNS : maintenir ses revenus en cas d'arret de travail",
    description:
      "Indemnites journalieres, franchise, invalidite : comment calibrer une prevoyance TNS pour proteger ses revenus.",
    meta: "8 min · Juillet 2026",
    cardExcerpt: "Independant : combien toucher en cas d'arret ?",
    cta: { href: "../landings/questionnaire.html?need=prevoyance&journey=standard", label: "Questionnaire prevoyance TNS" },
    keywords: ["prevoyance tns", "maintien de revenus", "arret de travail independant", "indemnites journalieres"],
    blocks: [
      {
        type: "p",
        text: "Un salarie a souvent une protection collective. Un independant ou TNS doit organiser lui-meme le <strong>maintien de revenus</strong>. Sans prevoyance, un arret de travail long peut mettre en danger charges fixes, foyer et remboursement de pret.",
      },
      { type: "h2", text: "Franchise : 15, 30 ou 90 jours ?" },
      {
        type: "p",
        text: "Plus la franchise est courte, plus la cotisation augmente. Choisissez selon votre tresorerie : combien de temps pouvez-vous tenir sans revenu ?",
      },
      { type: "h2", text: "Invalidite et deces" },
      {
        type: "ul",
        items: [
          "Rente invalidite selon taux reconnu",
          "Capital deces pour proteger le foyer",
          "Rente education si enfants a charge",
          "Compatibilite avec credit immobilier et assurance emprunteur",
        ],
      },
      { type: "bridge" },
    ],
    related: [
      { href: "./prevoyance-independants-guide.html", label: "Guide prevoyance independants" },
      { href: "../assurance-prevoyance/", label: "Assurance prevoyance" },
      { href: "../landings/devis.html?need=prevoyance", label: "Devis prevoyance" },
    ],
  },
  {
    file: "assurance-chat-senior-soins-remboursement.html",
    publishDate: "2026-08-03",
    section: "animaux",
    tag: "Chat senior",
    tagClass: "tag-animaux",
    title: "Assurance chat senior : soins frequents et remboursement",
    description:
      "Chat senior, consultations, reins, dents : garanties et exclusions a verifier pour assurer un chat age.",
    meta: "7 min · Aout 2026",
    cardExcerpt: "Chat age : soins frequents, carences et exclusions.",
    cta: { href: "../landings/questionnaire.html?need=animaux&journey=standard", label: "Questionnaire assurance chat" },
    keywords: ["assurance chat senior", "chat age", "remboursement veterinaire chat", "maladie chat senior"],
    blocks: [
      {
        type: "p",
        text: "Un <strong>chat senior</strong> consulte plus souvent : dents, reins, digestion, arthrose, bilan sanguin. L'assurance peut aider, mais l'age d'adhesion et les maladies deja connues changent fortement l'acceptation.",
      },
      { type: "h2", text: "Age limite et antecedents" },
      {
        type: "p",
        text: "Certains contrats refusent les nouveaux chats au-dela d'un age donne ou excluent les pathologies anterieures. Comparez avant les premiers diagnostics lourds si possible.",
      },
      { type: "h2", text: "Garanties utiles pour un chat senior" },
      {
        type: "ul",
        items: [
          "Consultations et analyses sanguines",
          "Imagerie et hospitalisation",
          "Dentaire curatif selon contrat",
          "Plafond annuel suffisant pour maladie chronique",
        ],
      },
      { type: "bridge" },
    ],
    related: [
      { href: "./assurance-chat-guide-complet.html", label: "Guide assurance chat" },
      { href: "./chat-puces-tiques-assurance-remboursement.html", label: "Puces et tiques chez le chat" },
      { href: "../assurance-animaux/chat/", label: "Assurance chat" },
    ],
  },
];

function getLeadgenPlan() {
  return LEADGEN_ARTICLES.map(cloneArticle);
}

function getScheduledLeadArticles(options) {
  options = options || {};
  var baseDate = options.now ? utcDate(options.now) : todayUtc();
  var horizonDays =
    typeof options.horizonDays === "number"
      ? options.horizonDays
      : Number(process.env.BLOG_LEADGEN_HORIZON_DAYS || 0);
  var cutoff = new Date(baseDate.getTime() + Math.max(0, horizonDays) * DAY_MS);

  return LEADGEN_ARTICLES.filter(function (article) {
    return utcDate(article.publishDate).getTime() <= cutoff.getTime();
  }).map(cloneArticle);
}

module.exports = {
  getLeadgenPlan: getLeadgenPlan,
  getScheduledLeadArticles: getScheduledLeadArticles,
};
