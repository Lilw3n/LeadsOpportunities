/**
 * Genere les pages SEO silo enrichies (contenu, conversion, schema).
 * Usage: node scripts/generate-seo-pages.cjs
 */
const fs = require("fs");
const path = require("path");
const {
  buildGeoPageConfigs,
  buildHubPageConfigs,
  collectSitemapUrls,
  writeSitemap,
} = require("./seo-geo-lib.cjs");

const ROOT = path.join(__dirname, "..");
const BASE = "https://leads-opportunities.vercel.app";
const CITIES = JSON.parse(fs.readFileSync(path.join(ROOT, "seo/france-cities.json"), "utf8"));

const TRUST = [
  "Courtier ORIAS",
  "Devis gratuit",
  "Sans engagement",
  "Reponse rapide",
];

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

const PAGES = [
  page({
    file: "assurance-vtc/index.html",
    theme: "vtc",
    badge: "Mobilite pro",
    title: "Assurance VTC | Devis et comparatif chauffeur 2026",
    description:
      "Assurance VTC pour chauffeurs actifs et creation d activite : RC pro, garanties, franchises. Devis rapide avec courtier ORIAS, sans engagement.",
    h1: "Assurance VTC : la bonne couverture pour rouler sereinement",
    intro:
      "Que vous soyez chauffeur VTC confirme ou en cours d immatriculation, nous comparons les offres du marche a garanties equivalentes. Un conseiller specialise vous explique chaque poste avant de signer.",
    cta: { href: "/landings/vtc.html", label: "Obtenir mon devis VTC" },
    crumbs: [
      { name: "Accueil", url: "/" },
      { name: "Assurance VTC", url: "/assurance-vtc/" },
    ],
    benefits: [
      { title: "Conseil humain", text: "Pas de comparateur aveugle : un courtier analyse votre profil VTC." },
      { title: "Garanties clarifiees", text: "RC pro, dommages, protection juridique : tout est explique." },
      { title: "Reponse rapide", text: "Rappel sous 15 min en heures ouvrables apres votre demande." },
    ],
    steps: [
      { title: "Decrivez votre activite", text: "Vehicule, zone, statut chauffeur, antecedents." },
      { title: "Nous comparons", text: "Selection d offres adaptees a votre usage VTC." },
      { title: "Vous decidez", text: "Devis detaille, sans obligation de souscription." },
    ],
    sections: [
      {
        h2: "Pourquoi une assurance dediee VTC ?",
        paragraphs: [
          "L assurance auto classique ne couvre en general pas l activite de transport de personnes a titre onereux. Une police VTC aligne vos garanties sur les exigences des plateformes et du code des transports.",
          "Mal assure, vous exposez votre activite a des refus de prise en charge et a des sanctions. Bien assure, vous roulez en conformite avec un budget maitrise.",
        ],
      },
      {
        h2: "Ce que nous verifions pour vous",
        list: [
          "Responsabilite civile professionnelle et garanties conducteur",
          "Franchises et plafonds en cas de sinistre",
          "Options perte d exploitation et vehicule de remplacement",
          "Compatibilite avec votre statut (creation ou chauffeur actif)",
        ],
      },
    ],
    related: [
      { href: "/assurance-vtc/devis-rapide/", label: "Devis assurance VTC rapide" },
      { href: "/assurance-vtc/tarif/", label: "Comprendre le tarif VTC" },
      { href: "/assurance-vtc/villes/", label: "Assurance VTC par ville" },
      { href: "/assurance-vtc/paris/", label: "Assurance VTC Paris" },
      { href: "/blog/assurance-vtc-moins-cher-2026.html", label: "Article : payer moins cher" },
    ],
    faq: [
      {
        q: "Quelle assurance est obligatoire pour un chauffeur VTC ?",
        a: "La responsabilite civile professionnelle et une assurance vehicule adaptee a l activite VTC sont indispensables avant de prendre des courses.",
      },
      {
        q: "Combien de temps pour obtenir un devis ?",
        a: "En moyenne sous 15 minutes en heures ouvrables apres envoi du formulaire.",
      },
      {
        q: "Puis-je assurer un vehicule en cours d achat ?",
        a: "Oui, nous etudions les solutions des la reservation ou la livraison prevue, selon l assureur.",
      },
    ],
  }),
  page({
    file: "assurance-vtc/devis-rapide/index.html",
    theme: "vtc",
    badge: "Devis express",
    title: "Devis assurance VTC rapide | Reponse sous 15 minutes",
    description:
      "Demandez un devis assurance VTC en ligne : formulaire guide, comparatif des offres, rappel conseiller sous 15 minutes. Gratuit et sans engagement.",
    h1: "Devis assurance VTC rapide",
    intro:
      "En quelques minutes, transmettez les informations utiles a notre courtier. Vous recevez une synthese claire des options disponibles pour votre profil chauffeur.",
    cta: { href: "/landings/vtc.html", label: "Lancer mon devis VTC" },
    crumbs: [
      { name: "Accueil", url: "/" },
      { name: "Assurance VTC", url: "/assurance-vtc/" },
      { name: "Devis rapide", url: "/assurance-vtc/devis-rapide/" },
    ],
    benefits: [
      { title: "Formulaire guide", text: "Parcours etape par etape pour un dossier complet des le premier contact." },
      { title: "Zero frais caches", text: "Le devis et le conseil initial sont gratuits." },
      { title: "Suivi dedie", text: "Un interlocuteur unique jusqu a la validation du contrat." },
    ],
    steps: [
      { title: "Remplissez le formulaire", text: "3 a 5 minutes pour decrire votre besoin VTC." },
      { title: "Analyse par un conseiller", text: "Comparaison des offres pertinentes." },
      { title: "Proposition par telephone", text: "Explication des garanties et du tarif." },
    ],
    sections: [
      {
        h2: "Informations a preparer",
        list: [
          "Marque, modele et annee du vehicule",
          "Date de permis et antecedents d assurance",
          "Ville d activite principale",
          "Statut : creation d activite ou chauffeur en cours",
        ],
      },
    ],
    related: [
      { href: "/assurance-vtc/", label: "Guide assurance VTC" },
      { href: "/assurance-vtc/tarif/", label: "Tarifs VTC" },
      { href: "/assurance-vtc/paris/", label: "VTC a Paris" },
    ],
    faq: [
      {
        q: "Le devis est-il gratuit ?",
        a: "Oui, le devis et l accompagnement initial sont sans frais et sans engagement.",
      },
      {
        q: "Dois-je avoir deja mon inscription VTC ?",
        a: "Non, nous pouvons vous conseiller en amont de votre lancement d activite.",
      },
    ],
  }),
  page({
    file: "assurance-vtc/tarif/index.html",
    theme: "vtc",
    badge: "Tarifs",
    title: "Tarif assurance VTC 2026 | Ce qui fait varier le prix",
    description:
      "Tarif assurance VTC : bonus-malus, franchises, garanties. Comprenez les leviers pour comparer a prix egal et optimiser votre budget chauffeur.",
    h1: "Tarif assurance VTC : comparer a garanties equivalentes",
    intro:
      "Deux devis peuvent afficher 40 % d ecart pour un profil similaire. La cle est de comparer le meme niveau de protection, pas seulement la prime mensuelle.",
    cta: { href: "/landings/vtc.html", label: "Comparer mon tarif VTC" },
    crumbs: [
      { name: "Accueil", url: "/" },
      { name: "Assurance VTC", url: "/assurance-vtc/" },
      { name: "Tarif", url: "/assurance-vtc/tarif/" },
    ],
    benefits: [
      { title: "Lecture experte", text: "Nous traduisons les garanties en langage clair." },
      { title: "Benchmark marché", text: "Offres de plusieurs compagnies comparees." },
      { title: "Optimisation", text: "Franchises et options ajustees a votre usage reel." },
    ],
    sections: [
      {
        h2: "Les principaux facteurs de prix",
        list: [
          "Puissance et valeur du vehicule",
          "Zone geographique et volume de courses",
          "Sinistres et coefficient bonus-malus",
          "Niveau de franchises et extensions choisies",
        ],
      },
      {
        h2: "Erreurs frequentes",
        paragraphs: [
          "Choisir la formule la moins chere sans verifier la RC pro et les exclusions d activite peut couter tres cher en cas de sinistre.",
          "Renouveler sans comparer chaque annee : les tarifs evoluent, de nouveaux acteurs arrivent sur le marche VTC.",
        ],
      },
    ],
    related: [
      { href: "/assurance-vtc/devis-rapide/", label: "Devis rapide" },
      { href: "/blog/assurance-vtc-moins-cher-2026.html", label: "Payer moins cher son VTC" },
    ],
    faq: [
      {
        q: "Peut-on negocier son tarif VTC ?",
        a: "Oui, en jouant sur les franchises, les garanties optionnelles et la concurrence entre assureurs.",
      },
    ],
  }),
  page({
    file: "assurance-vtc/paris/index.html",
    theme: "vtc",
    badge: "Paris & IDF",
    title: "Assurance VTC Paris | Devis chauffeur Ile-de-France",
    description:
      "Assurance VTC a Paris et en Ile-de-France : devis rapide, garanties adaptees au trafic urbain, courtier ORIAS. Chauffeurs Uber, Bolt, Heetch.",
    h1: "Assurance VTC a Paris et en Ile-de-France",
    intro:
      "Rouler en zone dense implique des risques specifiques : circulation urbaine, stationnement, sinistralite plus elevee. Nous calibrons votre contrat en fonction de votre zone d activite reelle.",
    cta: { href: "/landings/vtc.html", label: "Devis VTC Paris" },
    crumbs: [
      { name: "Accueil", url: "/" },
      { name: "Assurance VTC", url: "/assurance-vtc/" },
      { name: "Paris", url: "/assurance-vtc/paris/" },
    ],
    benefits: [
      { title: "Connaissance locale", text: "Prise en compte des specificites IDF." },
      { title: "Reactivite", text: "Equipe disponible aux heures de pointe." },
      { title: "Multi-plateformes", text: "Uber, Bolt, Heetch : meme exigence RC pro." },
    ],
    sections: [
      {
        h2: "Pourquoi Paris change la donne",
        paragraphs: [
          "Les assureurs integrent la zone d exercice dans leur tarification. Un chauffeur base a Paris intra-muros n a pas le meme profil de risque qu un exercice en province.",
        ],
      },
    ],
    related: [
      { href: "/assurance-vtc/devis-rapide/", label: "Devis rapide" },
      { href: "/assurance-vtc/", label: "Guide VTC national" },
    ],
    faq: [
      {
        q: "Couvrez-vous toute l Ile-de-France ?",
        a: "Oui, Paris et departements limitropes selon votre zone declaree d activite.",
      },
    ],
  }),
  page({
    file: "assurance-sante/index.html",
    theme: "sante",
    badge: "Sante & prevoyance",
    title: "Mutuelle sante | Comparatif et devis gratuit",
    description:
      "Mutuelle sante solo, couple ou famille : comparatif des garanties optique, dentaire, hospitalisation. Courtier ORIAS, devis gratuit.",
    h1: "Mutuelle sante : bien couvrir sans surpayer",
    intro:
      "Optique, dentaire, hospitalisation : les ecarts entre contrats sont enormes. Nous identifions les postes qui comptent pour votre foyer et comparons a niveau de garanties equivalent.",
    cta: { href: "/landings/sante.html", label: "Comparer les mutuelles" },
    crumbs: [
      { name: "Accueil", url: "/" },
      { name: "Assurance sante", url: "/assurance-sante/" },
    ],
    benefits: [
      { title: "Lecture des garanties", text: "Fini le jargon : vous voyez ce qui est rembourse." },
      { title: "Profils flexibles", text: "Solo, couple, famille, TNS." },
      { title: "Budget ou remboursements", text: "Priorite prix ou niveau de couverture." },
    ],
    steps: [
      { title: "Definissez vos priorites", text: "Optique, dentaire, hospitalisation, medecines douces." },
      { title: "Recevez un comparatif", text: "Synthese des meilleures offres du moment." },
      { title: "Souscrivez en confiance", text: "Accompagnement jusqu a la mise en service." },
    ],
    sections: [
      {
        h2: "Comment choisir sa mutuelle en 2026",
        paragraphs: [
          "Le prix seul est trompeur : une cotisation basse peut cacher des plafonds optique ou dentaire insuffisants pour votre usage reel.",
          "Notre methode : partir de vos depenses de sante des 12 derniers mois, puis calibrer le niveau de garanties.",
        ],
      },
    ],
    related: [
      { href: "/assurance-sante/comparatif/", label: "Comparatif mutuelle" },
      { href: "/assurance-sante/remboursement-optique/", label: "Remboursement optique" },
      { href: "/assurance-sante/villes/", label: "Mutuelle par ville" },
      { href: "/assurance-sante/paris/", label: "Mutuelle Paris" },
      { href: "/blog/mutuelle-sante-5-criteres.html", label: "5 criteres de choix" },
    ],
    faq: [
      {
        q: "Comment comparer deux mutuelles ?",
        a: "A garanties equivalentes, comparez optique, dentaire, hospitalisation et le ticket moderateur restant.",
      },
      {
        q: "Puis-je changer en cours d annee ?",
        a: "Oui, selon votre situation (resiliation a echéance, portabilite, etc.). Nous vous guidons.",
      },
    ],
  }),
  page({
    file: "assurance-sante/comparatif/index.html",
    theme: "sante",
    badge: "Comparatif",
    title: "Comparatif mutuelle sante 2026 | Devis gratuit",
    description:
      "Comparatif mutuelle sante en ligne : analyse des garanties et tarifs pour solo, couple ou famille. Conseiller dedie, sans engagement.",
    h1: "Comparatif mutuelle sante personnalise",
    intro:
      "Recevez une short-list d offres commentees : ce qui est couvert, ce qui ne l est pas, et le tarif mensuel adapte a votre profil.",
    cta: { href: "/landings/sante.html", label: "Lancer le comparatif" },
    crumbs: [
      { name: "Accueil", url: "/" },
      { name: "Assurance sante", url: "/assurance-sante/" },
      { name: "Comparatif", url: "/assurance-sante/comparatif/" },
    ],
    benefits: [
      { title: "Tableau clair", text: "Garanties alignees ligne par ligne." },
      { title: "Gain de temps", text: "Plus besoin d appeler 5 assureurs." },
      { title: "Conseil independant", text: "Nous ne poussons pas une seule compagnie." },
    ],
    sections: [
      {
        h2: "Ce que contient notre comparatif",
        list: [
          "Hospitalisation et chambre particuliere",
          "Dentaire (protheses, orthodontie adulte/enfant)",
          "Optique (verres simples, complexes, progressifs)",
          "Medecines douces et prevention",
        ],
      },
    ],
    related: [
      { href: "/assurance-sante/", label: "Guide mutuelle" },
      { href: "/assurance-sante/remboursement-optique/", label: "Optique" },
      { href: "/assurance-sante/paris/", label: "Paris" },
    ],
    faq: [
      {
        q: "Le comparatif engage-t-il a souscrire ?",
        a: "Non, vous restez libre de refuser ou de demander d autres options.",
      },
    ],
  }),
  page({
    file: "assurance-sante/remboursement-optique/index.html",
    theme: "sante",
    badge: "Optique",
    title: "Remboursement optique mutuelle | Guide complet",
    description:
      "Remboursement optique mutuelle : plafonds, reseaux de partenaires, verres progressifs. Optimisez vos lunettes avec un comparatif sur-mesure.",
    h1: "Remboursement optique : lire votre mutuelle correctement",
    intro:
      "Les plafonds optique varient du simple au triple selon les contrats. Avant de changer de mutuelle, verifiez le reste a charge sur vos verres actuels ou prevus.",
    cta: { href: "/landings/sante.html", label: "Etude mutuelle optique" },
    crumbs: [
      { name: "Accueil", url: "/" },
      { name: "Assurance sante", url: "/assurance-sante/" },
      { name: "Optique", url: "/assurance-sante/remboursement-optique/" },
    ],
    sections: [
      {
        h2: "Les postes a verifier",
        list: [
          "Plafond annuel monture + verres",
          "Prise en charge des verres progressifs ou anti-lumiere bleue",
          "Delai de carence eventuel",
          "Reseau opticiens partenaires (100 % Sante)",
        ],
      },
      {
        h2: "Astuce pratique",
        paragraphs: [
          "Si vous portez des verres complexes, une mutuelle entree de gamme peut vous laisser plusieurs centaines d euros a charge. Le surcout de cotisation est parfois largement compense.",
        ],
      },
    ],
    related: [
      { href: "/assurance-sante/comparatif/", label: "Comparatif mutuelle" },
      { href: "/blog/mutuelle-sante-5-criteres.html", label: "5 criteres" },
    ],
    faq: [
      {
        q: "Qu est-ce que le 100 % Sante en optique ?",
        a: "Un panier de soins avec reste a charge zero chez les professionnels agrees, selon les equipements eligibles.",
      },
    ],
  }),
  page({
    file: "assurance-sante/paris/index.html",
    theme: "sante",
    badge: "Paris",
    title: "Mutuelle sante Paris | Devis et comparatif local",
    description:
      "Mutuelle sante a Paris : particuliers, independants, familles. Comparatif des garanties et devis gratuit avec courtier ORIAS.",
    h1: "Mutuelle sante a Paris",
    intro:
      "Paris et petite couronne : acces aux reseaux de soins, besoins optique et dentaire souvent plus eleves. Nous adaptons le niveau de garanties a votre mode de vie.",
    cta: { href: "/landings/sante.html", label: "Devis mutuelle Paris" },
    crumbs: [
      { name: "Accueil", url: "/" },
      { name: "Assurance sante", url: "/assurance-sante/" },
      { name: "Paris", url: "/assurance-sante/paris/" },
    ],
    related: [
      { href: "/assurance-sante/comparatif/", label: "Comparatif" },
      { href: "/assurance-sante/", label: "Guide national" },
    ],
    faq: [],
  }),
  page({
    file: "credit-immo/index.html",
    theme: "credit",
    badge: "Credit immobilier",
    title: "Credit immobilier | Simulation et courtier",
    description:
      "Credit immobilier : simulation, capacite d emprunt, negociation du taux. Courtier ORIAS, accompagnement dossier, sans engagement.",
    h1: "Credit immobilier : securiser votre financement",
    intro:
      "Primo-accedant ou investisseur : nous analysons votre capacite d emprunt, comparons les banques et securisons les assurances associees pour un plan de financement solide.",
    cta: { href: "/landings/credit-immo.html", label: "Simulation credit immo" },
    crumbs: [
      { name: "Accueil", url: "/" },
      { name: "Credit immobilier", url: "/credit-immo/" },
    ],
    benefits: [
      { title: "Simulation realiste", text: "Mensualite, duree, apport, taux." },
      { title: "Montage dossier", text: "Check-list des pieces pour les banques." },
      { title: "Assurance emprunteur", text: "Optimisation du cout global du pret." },
    ],
    steps: [
      { title: "Premier echange", text: "Projet, budget, apport personnel." },
      { title: "Faisabilite", text: "Capacite d emprunt et banques cibles." },
      { title: "Offre de pret", text: "Negociation et accompagnement signature." },
    ],
    sections: [
      {
        h2: "Pourquoi passer par un courtier",
        paragraphs: [
          "Les conditions varient fortement d une banque a l autre. Un courtier identifie les etablissements les plus favorables a votre profil et evite les refus inutiles.",
        ],
      },
    ],
    related: [
      { href: "/credit-immo/simulation/", label: "Simulation" },
      { href: "/credit-immo/villes/", label: "Credit immo par ville" },
      { href: "/credit-immo/paris/", label: "Credit immo Paris" },
      { href: "/blog/pret-immo-erreurs-a-eviter.html", label: "Erreurs a eviter" },
    ],
    faq: [
      {
        q: "Puis-je faire une simulation sans engagement ?",
        a: "Oui, la premiere analyse est gratuite et sans obligation de souscrire.",
      },
      {
        q: "Quel apport minimum en 2026 ?",
        a: "Cela depend du projet et de la banque ; nous calculons votre faisabilite reellement.",
      },
    ],
  }),
  page({
    file: "credit-immo/simulation/index.html",
    theme: "credit",
    badge: "Simulation",
    title: "Simulation credit immobilier | Gratuit et rapide",
    description:
      "Simulation credit immobilier : mensualite, duree, taux. Estimez votre capacite d emprunt avec un conseiller dedie.",
    h1: "Simulation credit immobilier",
    intro:
      "Avant de visiter des biens, clarifiez votre enveloppe d emprunt. Notre simulation integre revenus, charges et apport pour un budget realiste.",
    cta: { href: "/landings/credit-immo.html", label: "Demarrer la simulation" },
    crumbs: [
      { name: "Accueil", url: "/" },
      { name: "Credit immobilier", url: "/credit-immo/" },
      { name: "Simulation", url: "/credit-immo/simulation/" },
    ],
    benefits: [
      { title: "Vision claire", text: "Mensualite cible et duree de pret." },
      { title: "Multi-scenarios", text: "Taux fixe, duree 20 ou 25 ans." },
      { title: "Rapidite", text: "Premiers elements sous 24h ouvrées." },
    ],
    sections: [
      {
        h2: "Documents utiles pour affiner la simulation",
        list: [
          "Derniers bulletins de salaire",
          "Releves de comptes (3 mois)",
          "Estimation de l apport disponible",
          "Nature du bien recherche (residence principale, locatif)",
        ],
      },
    ],
    related: [
      { href: "/credit-immo/", label: "Guide credit immo" },
      { href: "/credit-immo/paris/", label: "Paris" },
    ],
    faq: [],
  }),
  page({
    file: "credit-immo/paris/index.html",
    theme: "credit",
    badge: "Paris",
    title: "Credit immobilier Paris | Courtier local",
    description:
      "Courtier credit immobilier a Paris : simulation, negociation taux, dossier banque. Primo-accedants et investisseurs.",
    h1: "Credit immobilier a Paris",
    intro:
      "Marche tendu, prix au m2 eleves : un dossier bancaire solide fait la difference. Nous vous aidons a presenter un financement credible aux vendeurs et aux banques.",
    cta: { href: "/landings/credit-immo.html", label: "Etude credit Paris" },
    crumbs: [
      { name: "Accueil", url: "/" },
      { name: "Credit immobilier", url: "/credit-immo/" },
      { name: "Paris", url: "/credit-immo/paris/" },
    ],
    related: [
      { href: "/credit-immo/simulation/", label: "Simulation" },
      { href: "/credit-immo/", label: "Guide national" },
    ],
    faq: [],
  }),
];

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function depthPrefix(file) {
  const depth = file.split("/").length - 1;
  return depth ? "../".repeat(depth) : "./";
}

function hrefPath(prefix, urlPath) {
  if (!urlPath) return prefix + "index.html";
  return prefix + urlPath.replace(/^\//, "");
}

function renderSections(sections) {
  return (sections || [])
    .map(function (s) {
      var html = '<section class="seo-card"><h2>' + esc(s.h2) + "</h2>";
      (s.paragraphs || []).forEach(function (p) {
        html += "<p>" + esc(p) + "</p>";
      });
      if (s.list && s.list.length) {
        html += '<ul class="seo-list">';
        s.list.forEach(function (li) {
          html += "<li>" + esc(li) + "</li>";
        });
        html += "</ul>";
      }
      html += "</section>";
      return html;
    })
    .join("");
}

function renderBenefits(benefits) {
  if (!benefits || !benefits.length) return "";
  var items = benefits
    .map(function (b) {
      return (
        '<div class="seo-benefit"><strong>' +
        esc(b.title) +
        "</strong><p>" +
        esc(b.text) +
        "</p></div>"
      );
    })
    .join("");
  return (
    '<section class="seo-card"><h2>Pourquoi nous choisir</h2><div class="seo-benefits">' +
    items +
    "</div></section>"
  );
}

function renderSteps(steps) {
  if (!steps || !steps.length) return "";
  var items = steps
    .map(function (s, i) {
      return (
        '<div class="seo-step"><div class="seo-step-num">' +
        (i + 1) +
        '</div><div><strong>' +
        esc(s.title) +
        "</strong><p>" +
        esc(s.text) +
        "</p></div></div>"
      );
    })
    .join("");
  return '<section class="seo-card"><h2>Comment ca marche</h2><div class="seo-steps">' + items + "</div></section>";
}

function renderPage(p) {
  const prefix = depthPrefix(p.file);
  const canonical = BASE + "/" + p.file.replace(/index\.html$/, "");
  const theme = p.theme || "vtc";
  const crumbs = p.crumbs || [];
  const related = p.related || [];
  const faq = p.faq || [];
  const ctaHref = hrefPath(prefix, p.cta.href);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map(function (c, i) {
      return {
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: BASE + c.url,
      };
    }),
  };

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: p.h1,
    description: p.description,
    provider: {
      "@type": "Organization",
      name: "Leads Opportunities",
      url: BASE + "/",
    },
    areaServed: p.city
      ? {
          "@type": "City",
          name: p.city.name,
          containedInPlace: { "@type": "AdministrativeArea", name: p.city.region },
        }
      : { "@type": "Country", name: "France" },
    url: canonical,
  };

  const faqLd =
    faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map(function (f) {
            return {
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            };
          }),
        }
      : null;

  const faqHtml = faq
    .map(function (f) {
      return (
        '<details class="seo-faq"><summary>' +
        esc(f.q) +
        "</summary><p>" +
        esc(f.a) +
        "</p></details>"
      );
    })
    .join("");

  const relatedHtml = related
    .map(function (l) {
      return '<li><a href="' + esc(hrefPath(prefix, l.href)) + '">' + esc(l.label) + "</a></li>";
    })
    .join("");

  const crumbsHtml = crumbs
    .map(function (c, i) {
      if (i === crumbs.length - 1) return "<span>" + esc(c.name) + "</span>";
      return '<a href="' + esc(hrefPath(prefix, c.url)) + '">' + esc(c.name) + "</a>";
    })
    .join(' <span aria-hidden="true">/</span> ');

  const trustHtml = TRUST.map(function (t) {
    return (
      '<span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' +
      esc(t) +
      "</span>"
    );
  }).join("");

  const navVtc = hrefPath(prefix, "/assurance-vtc/");
  const navSante = hrefPath(prefix, "/assurance-sante/");
  const navCredit = hrefPath(prefix, "/credit-immo/");

  const geoMeta = p.city
    ? '<meta name="geo.region" content="FR" />\n  <meta name="geo.placename" content="' +
      esc(p.city.name) +
      '" />\n  <meta name="language" content="fr-FR" />'
    : '<meta name="geo.region" content="FR" />\n  <meta name="language" content="fr-FR" />';

  const cityGridHtml =
    p.hubCityGrid && p.hubCityGrid.length
      ? '<section class="seo-card"><h2>Villes couvertes en France</h2><div class="seo-city-grid">' +
        p.hubCityGrid
          .map(function (l) {
            var cityName = l.label.replace(/^[^\s]+\s/, "");
            return (
              '<a class="seo-city-link" href="' +
              esc(hrefPath(prefix, l.href)) +
              '">' +
              esc(cityName) +
              "</a>"
            );
          })
          .join("") +
        "</div></section>"
      : "";

  const hubProductsHtml =
    p.hubProducts && p.hubProducts.length
      ? '<section class="seo-card"><h2>Annuaires par metier</h2><ul class="seo-list">' +
        p.hubProducts
          .map(function (l) {
            return '<li><a href="' + esc(hrefPath(prefix, l.href)) + '">' + esc(l.label) + "</a></li>";
          })
          .join("") +
        "</ul></section>"
      : "";

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(p.title)}</title>
  <meta name="description" content="${esc(p.description)}" />
  <meta name="robots" content="index,follow" />
  ${geoMeta}
  <link rel="canonical" href="${esc(canonical)}" />
  <link rel="alternate" hreflang="fr-FR" href="${esc(canonical)}" />
  <meta property="og:title" content="${esc(p.title)}" />
  <meta property="og:description" content="${esc(p.description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${esc(canonical)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="${prefix}seo/seo-pages.css" />
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-JX8E35693F"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-JX8E35693F');</script>
</head>
<body class="seo-page seo-page--${theme}">
  <header class="seo-topbar">
    <div class="seo-container">
      <a href="${prefix}index.html" class="seo-logo">
        <span class="seo-logo-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </span>
        Leads Opportunities
      </a>
      <nav class="seo-nav" aria-label="Navigation principale">
        <a href="${navVtc}">VTC</a>
        <a href="${navSante}">Sante</a>
        <a href="${navCredit}">Credit immo</a>
        <a class="seo-cta" href="${esc(ctaHref)}">${esc(p.cta.label)}</a>
      </nav>
    </div>
  </header>
  <main class="seo-container">
    <nav class="seo-breadcrumb" aria-label="Fil d Ariane">${crumbsHtml}</nav>
    <header class="seo-hero">
      ${p.badge ? '<span class="seo-badge">' + esc(p.badge) + "</span>" : ""}
      <h1>${esc(p.h1)}</h1>
      <p class="seo-intro">${esc(p.intro)}</p>
      <div class="seo-hero-actions">
        <a class="btn btn-primary btn-lg" href="${esc(ctaHref)}">${esc(p.cta.label)}</a>
        <a class="btn btn-ghost btn-lg" href="${prefix}index.html#contact">Nous contacter</a>
      </div>
      <div class="seo-trust">${trustHtml}</div>
    </header>
    <div class="seo-layout">
      <div class="seo-main">
        ${renderBenefits(p.benefits)}
        ${renderSteps(p.steps)}
        ${renderSections(p.sections)}
        ${cityGridHtml}
        ${hubProductsHtml}
        ${faqHtml ? '<section class="seo-card seo-faq-block"><h2>Questions frequentes</h2>' + faqHtml + "</section>" : ""}
      </div>
      <aside class="seo-aside">
        <div class="seo-aside-card">
          <h3>Demarrer maintenant</h3>
          <p>Devis gratuit, conseiller dedie, reponse rapide. Sans engagement.</p>
          <a class="btn btn-primary" href="${esc(ctaHref)}">${esc(p.cta.label)}</a>
        </div>
        ${relatedHtml ? '<div class="seo-aside-card"><h3>Pages liees</h3><ul class="seo-related">' + relatedHtml + "</ul></div>" : ""}
        <div class="seo-aside-card">
          <h3>Besoin d aide ?</h3>
          <p><a href="${prefix}index.html#contact">Contactez-nous</a> ou consultez notre <a href="${prefix}blog/">blog conseils</a>.</p>
        </div>
      </aside>
    </div>
  </main>
  <footer class="seo-footer">
    <div class="seo-container seo-footer-grid">
      <small>ORIAS n&deg; 15005935 · Leads Opportunities</small>
      <div>
        <a href="${prefix}mentions-legales.html">Mentions legales</a>
        · <a href="${prefix}politique-confidentialite.html">Confidentialite</a>
        · <a href="${prefix}cgu.html">CGU</a>
      </div>
    </div>
  </footer>
  <div class="seo-mobile-cta">
    <a class="btn btn-primary btn-lg" href="${esc(ctaHref)}">${esc(p.cta.label)}</a>
  </div>
  <script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>
  <script type="application/ld+json">${JSON.stringify(serviceLd)}</script>
  ${faqLd ? '<script type="application/ld+json">' + JSON.stringify(faqLd) + "</script>" : ""}
</body>
</html>`;
}

const ALL_PAGES = PAGES.concat(buildGeoPageConfigs(CITIES, page)).concat(buildHubPageConfigs(CITIES, page));

ALL_PAGES.forEach(function (p) {
  const out = path.join(ROOT, p.file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, renderPage(p), "utf8");
  console.log("OK", p.file);
});

const sitemapUrls = collectSitemapUrls(CITIES, BASE);
writeSitemap(sitemapUrls, path.join(ROOT, "sitemap.xml"));

const fragment = sitemapUrls
  .filter(function (u) {
    return (
      u.loc.indexOf("/assurance-vtc/") > -1 ||
      u.loc.indexOf("/assurance-sante/") > -1 ||
      u.loc.indexOf("/credit-immo/") > -1 ||
      u.loc.indexOf("/france/") > -1
    );
  })
  .map(function (u) {
    return (
      "  <url>\n    <loc>" +
      u.loc +
      "</loc>\n    <lastmod>" +
      u.lastmod +
      "</lastmod>\n    <changefreq>" +
      u.changefreq +
      "</changefreq>\n    <priority>" +
      u.priority +
      "</priority>\n  </url>"
    );
  })
  .join("\n");
fs.writeFileSync(path.join(ROOT, "seo/generated-sitemap-fragment.xml"), fragment + "\n", "utf8");

console.log(
  "Done:",
  ALL_PAGES.length,
  "pages |",
  sitemapUrls.length,
  "URLs sitemap |",
  CITIES.length,
  "villes x 3 produits"
);
