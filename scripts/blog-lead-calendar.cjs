/**
 * Articles orientes leads a publier progressivement.
 *
 * La date de reference peut etre forcee avec BLOG_PUBLISH_DATE=YYYY-MM-DD
 * pour tester une publication future sans attendre le planning reel.
 */

function block(type, payload) {
  return Object.assign({ type: type }, payload);
}

function p(text) {
  return block("p", { text: text });
}

function h2(text) {
  return block("h2", { text: text });
}

function ul(items) {
  return block("ul", { items: items });
}

function bridge() {
  return block("bridge", {});
}

var LEAD_ARTICLES = [
  {
    publishAt: "2026-06-15",
    file: "mutuelle-famille-rentree-scolaire-budget.html",
    section: "sante",
    tag: "Famille",
    tagClass: "tag-sante",
    title: "Mutuelle famille avant la rentree : postes a verifier pour generer des economies",
    description:
      "Rentree scolaire, lunettes, orthodontie, pediatre : comment ajuster une mutuelle famille sans perdre les garanties utiles.",
    meta: "8 min · Juin 2026",
    cardExcerpt: "Rentree scolaire : le moment ideal pour recalibrer la mutuelle famille.",
    keywords: [
      "mutuelle famille",
      "mutuelle rentree scolaire",
      "orthodontie enfant remboursement",
      "lunettes enfant mutuelle",
      "devis mutuelle famille",
      "courtier ORIAS",
    ],
    cta: { href: "../landings/questionnaire.html?need=sante&journey=standard", label: "Questionnaire mutuelle famille" },
    blocks: [
      p(
        "La rentree scolaire concentre plusieurs depenses sante : certificat medical, lunettes cassees pendant l'ete, orthodontie qui demarre, consultations specialistes. C'est le bon moment pour verifier si votre <strong>mutuelle famille</strong> couvre les vrais postes du foyer, pas seulement une brochure generale."
      ),
      h2("1. Identifier les postes qui creent du reste a charge"),
      ul([
        "<strong>Optique enfant</strong> : forfait monture/verres, renouvellement anticipe en cas de casse",
        "<strong>Orthodontie</strong> : plafond annuel, semestre rembourse, carence eventuelle",
        "<strong>Pediatrie et specialistes</strong> : depassements d'honoraires en secteur 2",
        "<strong>Hospitalisation</strong> : chambre accompagnant et honoraires chirurgien",
      ]),
      h2("2. Comparer a garanties equivalentes"),
      p(
        "Une cotisation plus basse n'est pas une economie si elle supprime l'orthodontie ou baisse l'hospitalisation. Demandez toujours un comparatif a postes identiques : optique, dentaire, soins courants, hospitalisation, pharmacie. Un courtier peut isoler les lignes vraiment utiles pour votre foyer."
      ),
      bridge(),
      h2("3. Transformer l'article en demande de devis qualifiee"),
      p(
        "Le bon parcours lead pose les questions concretes : nombre d'enfants, besoins lunettes, orthodontie prevue, budget mensuel, mutuelle employeur existante. Notre questionnaire mutuelle permet de filtrer rapidement les profils famille et d'orienter vers un rappel utile."
      ),
    ],
    faq: [
      {
        q: "Quand comparer une mutuelle famille ?",
        a: "La rentree scolaire et la naissance d'un enfant sont deux moments pertinents, car les besoins optique, dentaire et pediatrie changent vite.",
      },
      {
        q: "L'orthodontie enfant est-elle toujours bien remboursee ?",
        a: "Non. Les contrats varient fortement selon le plafond par semestre, le taux BRSS et les delais de carence.",
      },
    ],
    related: [
      { href: "./mutuelle-sante-famille-petit-budget-2026.html", label: "Mutuelle famille petit budget" },
      { href: "./mutuelle-remboursement-optique-dentaire-2026.html", label: "Optique et dentaire" },
      { href: "../landings/sante.html", label: "Comparer ma mutuelle" },
    ],
  },
  {
    publishAt: "2026-06-22",
    file: "assurance-emprunteur-apres-40-ans-economies.html",
    section: "finance",
    tag: "Emprunteur",
    tagClass: "tag-immo",
    title: "Assurance emprunteur apres 40 ans : comment economiser sans fragiliser le pret",
    description:
      "Profil senior, quotite, loi Lemoine, garanties ITT/IPT : checklist pour reduire l'assurance de pret apres 40 ans.",
    meta: "9 min · Juin 2026",
    cardExcerpt: "Apres 40 ans, l'assurance emprunteur devient un levier d'economie majeur.",
    keywords: [
      "assurance emprunteur apres 40 ans",
      "loi Lemoine",
      "changer assurance pret immobilier",
      "quotite assurance emprunteur",
      "devis assurance emprunteur",
    ],
    cta: { href: "../landings/questionnaire.html?need=credit-immo&journey=standard", label: "Etudier mon assurance emprunteur" },
    blocks: [
      p(
        "Apres 40 ans, l'assurance emprunteur pese souvent plus lourd dans le cout total du credit. Pourtant, la <strong>loi Lemoine</strong> permet de changer d'assureur a tout moment si les garanties restent equivalentes. Le bon objectif : economiser sans prendre un contrat trop faible."
      ),
      h2("1. Regarder le TAEA, pas seulement la mensualite"),
      p(
        "Le TAEA mesure le cout de l'assurance dans le pret. Une baisse de 20 EUR par mois peut representer plusieurs milliers d'euros sur la duree restante, surtout si le capital est encore eleve."
      ),
      h2("2. Ne pas casser les garanties essentielles"),
      ul([
        "Deces / PTIA : socle exige par la banque",
        "ITT / IPT : critique si le foyer depend d'un revenu principal",
        "Quotite : 50/50, 70/30 ou 100/100 selon revenus du couple",
        "Exclusions sport, dos, psy : a lire avant signature",
      ]),
      bridge(),
      h2("3. Un lead qualifie commence par le pret existant"),
      p(
        "Pour chiffrer une economie, il faut le capital restant du, l'age, la profession, le taux actuel et les garanties exigees par la banque. Un formulaire trop court genere des contacts vagues ; un questionnaire emprunteur structure cree un dossier actionnable."
      ),
    ],
    faq: [
      {
        q: "Peut-on changer d'assurance emprunteur a tout moment ?",
        a: "Oui sous conditions d'equivalence de garanties. La banque ne peut pas refuser un contrat equivalent uniquement parce qu'il est externe.",
      },
      {
        q: "Apres 40 ans, faut-il baisser la quotite pour payer moins ?",
        a: "Pas automatiquement. Une quotite trop faible peut exposer le conjoint si un revenu principal disparait.",
      },
    ],
    related: [
      { href: "./assurance-emprunteur-loi-lemoine-2026.html", label: "Loi Lemoine 2026" },
      { href: "./taux-credit-immobilier-2026-frais-dossier.html", label: "Taux et frais de pret" },
      { href: "../landings/credit-immo.html", label: "Etude credit immobilier" },
    ],
  },
  {
    publishAt: "2026-06-29",
    file: "assurance-vtc-aeroport-ete-uber-bolt.html",
    section: "vtc",
    tag: "VTC ete",
    tagClass: "tag-vtc",
    title: "VTC aeroport en ete : assurance compatible Uber, Bolt et trajets longues distances",
    description:
      "Pic d'activite aeroport, bagages, passagers, trajets de nuit : les garanties VTC a verifier avant l'ete.",
    meta: "7 min · Juin 2026",
    cardExcerpt: "Aeroports et longues courses : le contrat VTC doit suivre le pic d'activite.",
    keywords: [
      "assurance VTC aeroport",
      "assurance Uber Bolt",
      "RC pro VTC",
      "devis assurance VTC",
      "chauffeur VTC ete",
    ],
    cta: { href: "../landings/vtc.html", label: "Devis assurance VTC" },
    blocks: [
      p(
        "L'ete augmente les courses aeroport, les trajets longue distance et les horaires de nuit. Pour un chauffeur VTC, cette hausse d'activite peut generer plus de chiffre d'affaires, mais aussi plus d'exposition : passagers, bagages, retard, panne, accident."
      ),
      h2("1. Verifier la compatibilite plateformes"),
      ul([
        "Usage transport de personnes clairement declare",
        "RC professionnelle VTC active et attestation disponible",
        "Vehicule conforme aux exigences Uber, Bolt ou Heetch",
        "Assistance panne adaptee aux longues distances",
      ]),
      h2("2. Bagages et litiges passagers"),
      p(
        "Un bagage endommage ou oublie peut rapidement devenir un litige client. La responsabilite civile professionnelle et la protection juridique aident a traiter ces situations sans bloquer l'activite."
      ),
      bridge(),
      h2("3. Convertir les chauffeurs en demande de devis"),
      p(
        "Les meilleurs leads VTC precisent la plateforme utilisee, le vehicule, le bonus, la zone d'activite et la date de debut. Le parcours VTC Leads Opportunities recupere ces informations avant rappel."
      ),
    ],
    faq: [
      {
        q: "Une assurance auto classique suffit-elle pour faire du VTC ?",
        a: "Non. Le transport remunere de personnes exige un contrat adapte et une RC professionnelle VTC.",
      },
      {
        q: "Faut-il changer d'assurance avant le pic d'ete ?",
        a: "Il faut au minimum verifier attestations, exclusions et assistance. Si le contrat est incomplet, comparez avant d'augmenter l'activite.",
      },
    ],
    related: [
      { href: "./assurance-vtc-uber-bolt-heetch.html", label: "Uber, Bolt, Heetch" },
      { href: "./assurance-vtc-rc-pro-garanties.html", label: "RC Pro VTC" },
      { href: "../landings/vtc.html", label: "Landing VTC" },
    ],
  },
  {
    publishAt: "2026-07-06",
    file: "assurance-habitation-orages-grele-ete.html",
    section: "habitat",
    tag: "Orages",
    tagClass: "tag-habitation",
    title: "Orages et grele en ete : assurance habitation, franchise et declaration sinistre",
    description:
      "Toiture, veranda, panneaux solaires, degats des eaux : checklist assurance habitation apres orage ou grele.",
    meta: "8 min · Juillet 2026",
    cardExcerpt: "Apres un orage, les bons reflexes assurance evitent le reste a charge.",
    keywords: [
      "assurance habitation grele",
      "degats des eaux orage",
      "declaration sinistre habitation",
      "franchise assurance habitation",
      "devis habitation",
    ],
    cta: { href: "../landings/questionnaire.html?need=habitation&journey=standard", label: "Questionnaire habitation" },
    blocks: [
      p(
        "Grele sur une veranda, infiltration apres orage, toiture abimee : les sinistres d'ete rappellent l'importance d'une <strong>assurance habitation</strong> a jour. Le contrat doit refleter la valeur du logement, les dependances et les equipements exterieurs."
      ),
      h2("1. Les garanties a relire avant l'orage"),
      ul([
        "Degats des eaux et infiltration par toiture",
        "Evenements climatiques, grele, tempete",
        "Bris de glace pour veranda, baie vitree, panneaux",
        "Dependances, cave, garage et mobilier exterieur",
      ]),
      h2("2. Declaration : les preuves changent tout"),
      p(
        "Photos datees, factures, devis de reparation, declaration rapide : le dossier sinistre se joue dans les premieres heures. Ne jetez pas les elements abimes avant accord ou passage expert."
      ),
      bridge(),
      h2("3. Pourquoi cela genere des leads habitation"),
      p(
        "Un article sinistre attire des internautes avec un besoin immediat : verifier franchise, plafond et exclusions. Le questionnaire habitation permet ensuite d'orienter vers une mise a niveau ou un devis concurrent."
      ),
    ],
    faq: [
      {
        q: "La grele est-elle couverte par l'assurance habitation ?",
        a: "Souvent oui via garantie evenement climatique, mais les exclusions et franchises dependent du contrat.",
      },
      {
        q: "Combien de temps pour declarer un sinistre habitation ?",
        a: "Le delai courant est de 5 jours ouvres, mais verifiez votre contrat et declarez le plus vite possible.",
      },
    ],
    related: [
      { href: "./canicule-degats-eaux-assurance-habitation.html", label: "Canicule et habitation" },
      { href: "./assurance-habitation-sous-assurance-sinistre.html", label: "Sous-assurance sinistre" },
      { href: "../assurance-habitation/", label: "Guide assurance habitation" },
    ],
  },
  {
    publishAt: "2026-07-13",
    file: "assurance-chien-vacances-garde-urgence-veterinaire.html",
    section: "animaux",
    tag: "Vacances chien",
    tagClass: "tag-animaux",
    title: "Vacances avec un chien : garde, urgence veterinaire et assurance animaux",
    description:
      "Depart en vacances, chenil, pet-sitter, urgence veto : comment l'assurance chien peut limiter les frais imprevus.",
    meta: "7 min · Juillet 2026",
    cardExcerpt: "Vacances avec chien : anticiper garde, veto et responsabilite.",
    keywords: [
      "assurance chien vacances",
      "urgence veterinaire chien",
      "garde chien assurance",
      "assurance animaux ete",
      "devis assurance chien",
    ],
    cta: { href: "../landings/animaux.html", label: "Comparer assurance chien" },
    blocks: [
      p(
        "Les vacances changent les habitudes du chien : route longue, chaleur, pension, plage, randonnee. Une urgence veterinaire loin de chez soi peut couter cher, surtout le soir ou le week-end. L'assurance animaux aide a absorber ces frais si le contrat est souscrit avant l'incident."
      ),
      h2("1. Les risques frequents en vacances"),
      ul([
        "Coup de chaleur ou deshydratation",
        "Blessure coussinet, epillet, morsure",
        "Troubles digestifs apres changement d'environnement",
        "Responsabilite civile si le chien blesse un tiers",
      ]),
      h2("2. Garde, chenil et pet-sitter"),
      p(
        "Demandez les conditions de responsabilite du chenil ou pet-sitter. Votre RC vie privee peut couvrir certains dommages causes par l'animal, mais les frais de soins du chien dependent plutot d'une assurance animaux."
      ),
      bridge(),
      h2("3. Lead qualifie : animal, age, race, antecedents"),
      p(
        "Pour un devis fiable, il faut l'age du chien, sa race, son identification, ses antecedents et le niveau souhaite : accident seul, maladie, prevention. Un formulaire animaux bien structure evite les devis inutilisables."
      ),
    ],
    faq: [
      {
        q: "Peut-on assurer un chien juste avant les vacances ?",
        a: "Oui, mais les delais de carence peuvent exclure les sinistres trop proches de la souscription. Anticipez autant que possible.",
      },
      {
        q: "La responsabilite civile couvre-t-elle les frais veto de mon chien ?",
        a: "Non en general. La RC couvre les dommages causes a autrui ; l'assurance chien couvre les soins de votre animal selon formule.",
      },
    ],
    related: [
      { href: "./assurance-chien-frais-veterinaires.html", label: "Frais veterinaires chien" },
      { href: "./assurance-animaux-comment-choisir.html", label: "Choisir assurance animaux" },
      { href: "../landings/animaux.html", label: "Devis animaux" },
    ],
  },
  {
    publishAt: "2026-07-20",
    file: "rc-pro-auto-entrepreneur-rentree-clients.html",
    section: "pro",
    tag: "Auto-entrepreneur",
    tagClass: "tag-pro",
    title: "RC Pro auto-entrepreneur : proteger ses premiers clients a la rentree",
    description:
      "Consultant, artisan, coach, freelance : quand la RC Pro devient indispensable pour signer de nouveaux clients.",
    meta: "8 min · Juillet 2026",
    cardExcerpt: "La rentree est le bon moment pour securiser devis, missions et RC Pro.",
    keywords: [
      "RC Pro auto entrepreneur",
      "assurance freelance",
      "devis RC Pro",
      "responsabilite civile professionnelle",
      "assurance artisan consultant",
    ],
    cta: { href: "../landings/questionnaire.html?need=rc-pro&journey=standard", label: "Questionnaire RC Pro" },
    blocks: [
      p(
        "La rentree relance les devis, missions courtes et contrats freelance. Beaucoup d'auto-entrepreneurs decouvrent la <strong>RC Pro</strong> quand un client la demande avant signature. Anticiper evite de perdre une mission ou de signer avec un contrat mal adapte."
      ),
      h2("1. La RC Pro est-elle obligatoire ?"),
      p(
        "Elle est obligatoire pour certaines professions reglementees, fortement recommandee pour les autres. Un conseil errone, un dommage chez un client ou un retard prejudiciable peut engager votre responsabilite personnelle."
      ),
      h2("2. Adapter le contrat au metier reel"),
      ul([
        "Consultant : conseil, erreur, prejudice financier",
        "Artisan : dommage materiel, chantier, decennale si batiment",
        "Coach / formateur : accident participant, contenu, local loue",
        "Prestataire digital : cyber, donnees, interruption de service",
      ]),
      bridge(),
      h2("3. Un bon lead RC Pro qualifie le risque"),
      p(
        "Le formulaire doit collecter activite exacte, chiffre d'affaires, clients B2B/B2C, intervention chez tiers, sous-traitance et besoin d'attestation. Ces informations permettent un devis plus rapide et plus credible."
      ),
    ],
    faq: [
      {
        q: "Un auto-entrepreneur peut-il travailler sans RC Pro ?",
        a: "Parfois oui legalement, mais c'est risque. Certains clients exigent une attestation avant toute mission.",
      },
      {
        q: "La RC Pro remplace-t-elle la decennale ?",
        a: "Non. Pour les activites du batiment concernees, la decennale est distincte et obligatoire.",
      },
    ],
    related: [
      { href: "./rc-pro-freelance-artisan-guide.html", label: "Guide RC Pro freelance" },
      { href: "../landings/devis.html?need=rc-pro", label: "Devis RC Pro" },
      { href: "../assurances/", label: "Catalogue assurances" },
    ],
  },
];

function getReferenceDate() {
  var raw = process.env.BLOG_PUBLISH_DATE || new Date().toISOString().slice(0, 10);
  var value = String(raw).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("BLOG_PUBLISH_DATE doit respecter le format YYYY-MM-DD");
  }
  return value;
}

function cleanArticle(article) {
  var copy = Object.assign({}, article);
  delete copy.publishAt;
  return copy;
}

function getDueLeadArticles(referenceDate) {
  var today = referenceDate || getReferenceDate();
  return LEAD_ARTICLES.filter(function (article) {
    return article.publishAt <= today;
  }).map(cleanArticle);
}

function getPendingLeadArticles(referenceDate) {
  var today = referenceDate || getReferenceDate();
  return LEAD_ARTICLES.filter(function (article) {
    return article.publishAt > today;
  }).map(function (article) {
    return {
      publishAt: article.publishAt,
      file: article.file,
      title: article.title,
      section: article.section,
    };
  });
}

module.exports = {
  LEAD_ARTICLES: LEAD_ARTICLES,
  getDueLeadArticles: getDueLeadArticles,
  getPendingLeadArticles: getPendingLeadArticles,
  getReferenceDate: getReferenceDate,
};
