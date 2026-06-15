/**
 * File editoriale orientee leads.
 *
 * Les articles sont publies automatiquement lorsqu'ils deviennent dus
 * (scheduledAt <= BLOG_PUBLISH_DATE ou date du jour).
 */

const CALENDAR = {
  cadence: "monday-thursday",
  articles: [
    {
      scheduledAt: "2026-06-15",
      leadIntent: "mutuelle_senior",
      file: "mutuelle-senior-2026-remboursements-prix.html",
      section: "sante",
      tag: "Senior",
      tagClass: "tag-sante",
      title: "Mutuelle senior 2026 : remboursements, prix et garanties a comparer",
      description:
        "Mutuelle senior : hospitalisation, optique, dentaire, audio et budget mensuel. Les garanties a comparer avant de changer.",
      meta: "9 min - Juin 2026",
      cardExcerpt: "Senior : comparer les garanties qui coutent vraiment cher.",
      cta: { href: "../landings/questionnaire.html?need=sante&journey=standard", label: "Questionnaire mutuelle senior" },
      keywords: ["mutuelle senior", "mutuelle retraite", "hospitalisation senior", "optique dentaire", "devis mutuelle"],
      blocks: [
        {
          type: "p",
          text: "A la retraite, la cotisation n'est plus partagee avec un employeur et les besoins de soins changent : hospitalisation, dentaire, optique, audio, medecins secteur 2. Une <strong>mutuelle senior</strong> doit donc se comparer poste par poste, pas seulement au prix mensuel.",
        },
        { type: "h2", text: "Les postes qui font varier le prix" },
        {
          type: "ul",
          items: [
            "<strong>Hospitalisation</strong> : honoraires chirurgien/anesthesiste, chambre particuliere, forfait journalier",
            "<strong>Dentaire</strong> : couronnes, implants, protheses hors panier 100 % sante",
            "<strong>Optique et audio</strong> : forfaits par equipement et frequence de renouvellement",
            "<strong>Medecine courante</strong> : depassements secteur 2, specialistes, analyses",
          ],
        },
        { type: "bridge" },
        { type: "h2", text: "Prix bas ou garanties utiles : la bonne methode" },
        {
          type: "p",
          text: "Une formule moins chere peut devenir couteuse si elle plafonne l'hospitalisation ou impose une carence sur le dentaire. Demandez un comparatif a garanties equivalentes : cotisation annuelle, plafonds, franchises, reseau de soins et delais de carence.",
        },
        { type: "h2", text: "Quand changer de mutuelle senior ?" },
        {
          type: "p",
          text: "Les signaux : hausse forte a l'echeance, soins prevus mal couverts, depart en retraite, changement de ville ou perte de la mutuelle entreprise. Le questionnaire Leads Opportunities aide a cibler le niveau utile avant de demander un devis.",
        },
      ],
      related: [
        { href: "../assurance-sante/", label: "Mutuelle sante" },
        { href: "./mutuelle-sante-hospitalisation-2026.html", label: "Hospitalisation mutuelle" },
        { href: "./mutuelle-remboursement-optique-dentaire-2026.html", label: "Optique et dentaire" },
      ],
      faq: [
        {
          q: "Quel est le poste le plus important pour une mutuelle senior ?",
          a: "L'hospitalisation arrive souvent en premier, car un depassement d'honoraires ou une chambre particuliere peut creer un reste a charge important.",
        },
        {
          q: "Faut-il garder sa mutuelle entreprise a la retraite ?",
          a: "Pas automatiquement : la portabilite ou le maintien peut etre interessant, mais il faut comparer le prix total et les garanties reelles.",
        },
      ],
    },
    {
      scheduledAt: "2026-06-18",
      leadIntent: "emprunteur_loi_lemoine",
      file: "assurance-emprunteur-changer-juin-2026-checklist.html",
      section: "finance",
      tag: "Emprunteur",
      tagClass: "tag-immo",
      title: "Changer d'assurance emprunteur en 2026 : checklist loi Lemoine",
      description:
        "Assurance emprunteur : documents, equivalence de garanties, delais banque et economies possibles grace a la loi Lemoine.",
      meta: "8 min - Juin 2026",
      cardExcerpt: "Loi Lemoine : la checklist avant de remplacer l'assurance banque.",
      cta: { href: "../landings/questionnaire.html?need=emprunteur&journey=standard", label: "Questionnaire emprunteur" },
      keywords: ["assurance emprunteur", "loi Lemoine", "changer assurance pret", "delegation assurance", "credit immobilier"],
      blocks: [
        {
          type: "p",
          text: "Changer d'<strong>assurance emprunteur</strong> peut economiser plusieurs milliers d'euros sur un pret immobilier. Depuis la loi Lemoine, la substitution est possible plus simplement, mais la banque controle l'<strong>equivalence de garanties</strong>.",
        },
        { type: "h2", text: "Documents a reunir" },
        {
          type: "ul",
          items: [
            "Tableau d'amortissement du pret",
            "Fiche standardisee d'information ou exigences de garanties banque",
            "Contrat d'assurance actuel et cout mensuel",
            "Questionnaire emprunteur avec age, capital restant du, profession et garanties exigees",
          ],
        },
        { type: "bridge" },
        { type: "h2", text: "Comparer le prix sans perdre de garanties" },
        {
          type: "p",
          text: "La banque compare deces, PTIA, ITT, IPT, IPP, franchises et exclusions. Un contrat externe moins cher peut etre refuse si une garantie manque. Le bon comparatif met le tarif et l'equivalence sur la meme ligne.",
        },
        { type: "h2", text: "Quand l'economie vaut le plus le coup" },
        {
          type: "p",
          text: "Plus le capital restant du est eleve, plus le potentiel d'economie est important. Les profils jeunes, non-fumeurs ou avec un risque professionnel faible obtiennent souvent un tarif plus competitif qu'en contrat groupe bancaire.",
        },
      ],
      related: [
        { href: "./assurance-emprunteur-loi-lemoine-2026.html", label: "Guide loi Lemoine" },
        { href: "../credit-immo/", label: "Credit immobilier" },
        { href: "../landings/credit-immo.html", label: "Etude credit immo" },
      ],
    },
    {
      scheduledAt: "2026-06-22",
      leadIntent: "habitation_devis",
      file: "assurance-habitation-devis-rapide-avant-demenagement.html",
      section: "habitat",
      tag: "Demenagement",
      tagClass: "tag-habitation",
      title: "Assurance habitation avant demenagement : devis rapide et erreurs a eviter",
      description:
        "Demenagement, bail, achat immobilier : quand souscrire l'assurance habitation et quels plafonds verifier.",
      meta: "7 min - Juin 2026",
      cardExcerpt: "Demenagement : l'assurance habitation a ne pas oublier.",
      cta: { href: "../landings/questionnaire.html?need=habitation&journey=standard", label: "Questionnaire habitation" },
      keywords: ["assurance habitation", "devis habitation", "demenagement", "locataire", "proprietaire"],
      blocks: [
        { type: "p", text: "Un demenagement concentre urgence administrative et risque d'oubli. Pourtant, l'<strong>assurance habitation</strong> est souvent exigee avant remise des cles en location et recommandee des la signature pour un achat." },
        { type: "h2", text: "Les informations a preparer" },
        { type: "ul", items: ["Adresse, surface, nombre de pieces", "Etage, cave, dependances, stationnement", "Valeur du mobilier et objets de valeur", "Statut : locataire, proprietaire occupant, PNO, colocation"] },
        { type: "bridge" },
        { type: "h2", text: "Plafonds a verifier avant de signer" },
        { type: "p", text: "Mobilier, vol, degats des eaux, bris de glace, responsabilite civile et protection juridique : les plafonds font la difference au sinistre. Un devis rapide doit rester precis sur ces postes." },
      ],
      related: [
        { href: "../assurance-habitation/", label: "Assurance habitation" },
        { href: "./assurance-habitation-locataire-proprietaire-2026.html", label: "Locataire ou proprietaire" },
        { href: "./pno-bailleur-proprietaire-non-occupant.html", label: "PNO bailleur" },
      ],
    },
    {
      scheduledAt: "2026-06-25",
      leadIntent: "vtc_creation",
      file: "chauffeur-vtc-debutant-assurance-premiere-annee.html",
      section: "vtc",
      tag: "Creation VTC",
      tagClass: "tag-vtc",
      title: "Chauffeur VTC debutant : assurance, RC Pro et budget premiere annee",
      description:
        "Nouveau chauffeur VTC : RC Pro, vehicule, plateformes Uber Bolt Heetch, franchise et budget assurance.",
      meta: "8 min - Juin 2026",
      cardExcerpt: "Premiere annee VTC : eviter le mauvais contrat.",
      cta: { href: "../landings/questionnaire.html?need=vtc&journey=standard", label: "Questionnaire VTC" },
      keywords: ["assurance VTC", "chauffeur VTC debutant", "RC Pro VTC", "Uber Bolt Heetch", "devis VTC"],
      blocks: [
        { type: "p", text: "La premiere annee d'activite VTC met la tresorerie sous pression : vehicule, carburant, entretien, plateformes et <strong>assurance VTC</strong>. Un contrat incomplet peut bloquer l'activation Uber, Bolt ou Heetch." },
        { type: "h2", text: "Les garanties indispensables" },
        { type: "ul", items: ["RC professionnelle transport de personnes", "Assurance du vehicule compatible usage VTC", "Protection conducteur", "Assistance 0 km ou vehicule de remplacement selon activite"] },
        { type: "bridge" },
        { type: "h2", text: "Franchise et budget sinistre" },
        { type: "p", text: "Une franchise haute baisse la cotisation mais peut mettre en difficulte apres un choc. Pour un vehicule finance, comparez mensualite, franchise, valeur de remplacement et immobilisation." },
      ],
      related: [
        { href: "../assurance-vtc/", label: "Assurance VTC" },
        { href: "./assurance-vtc-creation-chauffeur.html", label: "Creation chauffeur VTC" },
        { href: "./vtc-premiere-course-checklist-assurance.html", label: "Checklist premiere course" },
      ],
    },
    {
      scheduledAt: "2026-06-29",
      leadIntent: "animaux_chien",
      file: "assurance-chien-operation-croises-budget-remboursement.html",
      section: "animaux",
      tag: "Chien",
      tagClass: "tag-animaux",
      title: "Operation du chien : budget veto, remboursement et assurance animaux",
      description:
        "Chirurgie du chien, radio, anesthesie : combien coute une operation et comment l'assurance chien peut rembourser.",
      meta: "8 min - Juin 2026",
      cardExcerpt: "Chirurgie chien : anticiper la facture veterinaire.",
      cta: { href: "../landings/questionnaire.html?need=animaux&journey=standard", label: "Questionnaire assurance chien" },
      keywords: ["assurance chien", "operation chien", "frais veterinaires", "remboursement veterinaire", "devis animaux"],
      blocks: [
        { type: "p", text: "Rupture des ligaments croises, torsion, corps etranger, fracture : une <strong>operation du chien</strong> peut atteindre plusieurs centaines ou milliers d'euros avec consultation, imagerie, anesthesie et suivi." },
        { type: "h2", text: "Les couts qui s'additionnent" },
        { type: "ul", items: ["Consultation d'urgence et examens", "Radio, echo ou scanner", "Bloc operatoire et anesthesie", "Hospitalisation, medicaments et controle post-op"] },
        { type: "bridge" },
        { type: "h2", text: "Ce que rembourse une assurance chien" },
        { type: "p", text: "Selon la formule : maladie, accident, chirurgie, prevention et plafond annuel. Comparez taux de remboursement, franchise, delai de carence et exclusions de race avant le premier souci." },
      ],
      related: [
        { href: "../assurance-animaux/chien/", label: "Assurance chien" },
        { href: "./assurance-chien-frais-veterinaires.html", label: "Frais veterinaires chien" },
        { href: "../landings/animaux-express.html", label: "Devis express animaux" },
      ],
    },
    {
      scheduledAt: "2026-07-02",
      leadIntent: "rc_pro",
      file: "rc-pro-auto-entrepreneur-2026-devis-obligations.html",
      section: "pro",
      tag: "Auto-entrepreneur",
      tagClass: "tag-pro",
      title: "RC Pro auto-entrepreneur 2026 : devis, obligations et garanties",
      description:
        "Auto-entrepreneur : quand la RC Pro est obligatoire, quelles garanties demander et comment comparer un devis.",
      meta: "8 min - Juillet 2026",
      cardExcerpt: "Auto-entrepreneur : proteger son activite avant le litige.",
      cta: { href: "../landings/questionnaire.html?need=rc-pro&journey=standard", label: "Questionnaire RC Pro" },
      keywords: ["RC Pro auto entrepreneur", "devis RC Pro", "assurance professionnelle", "freelance", "artisan"],
      blocks: [
        { type: "p", text: "Une <strong>RC Pro auto-entrepreneur</strong> couvre les dommages causes a un client, fournisseur ou tiers dans le cadre de l'activite. Elle n'est pas toujours obligatoire, mais elle devient vite indispensable des qu'un contrat client l'exige." },
        { type: "h2", text: "Profils les plus exposes" },
        { type: "ul", items: ["Conseil, informatique, marketing et prestation intellectuelle", "Artisans et metiers avec intervention chez le client", "Coachs, formateurs, bien-etre", "Vendeurs avec risque produit ou livraison"] },
        { type: "bridge" },
        { type: "h2", text: "Lire un devis RC Pro" },
        { type: "p", text: "Comparez plafond par sinistre, franchise, exclusions, protection juridique, RC apres livraison et zone geographique. Le prix seul ne dit rien du risque couvert." },
      ],
      related: [
        { href: "./rc-pro-freelance-artisan-guide.html", label: "RC Pro freelance" },
        { href: "../landings/devis.html?need=rc-pro", label: "Devis RC Pro" },
      ],
    },
    {
      scheduledAt: "2026-07-06",
      leadIntent: "credit_rachat",
      file: "rachat-credit-baisser-mensualite-questions-courtier.html",
      section: "finance",
      tag: "Rachat",
      tagClass: "tag-immo",
      title: "Rachat de credit : baisser sa mensualite sans piege",
      description:
        "Rachat credit immobilier ou conso : conditions, frais, assurance emprunteur et questions a poser avant de signer.",
      meta: "8 min - Juillet 2026",
      cardExcerpt: "Rachat de credit : mensualite plus basse, cout total a verifier.",
      cta: { href: "../landings/questionnaire.html?need=credit-immo&journey=standard", label: "Questionnaire credit" },
      keywords: ["rachat de credit", "regroupement de credits", "baisser mensualite", "assurance emprunteur", "courtier credit"],
      blocks: [
        { type: "p", text: "Le <strong>rachat de credit</strong> peut redonner de l'air au budget en regroupant plusieurs prets. Mais une mensualite plus basse s'obtient souvent avec une duree plus longue : le cout total doit etre mesure avant de signer." },
        { type: "h2", text: "Questions a poser au courtier" },
        { type: "ul", items: ["Quel cout total apres operation ?", "Quels frais de dossier, garantie et remboursement anticipe ?", "Quelle assurance emprunteur et quelles garanties ?", "Quel taux d'endettement apres rachat ?"] },
        { type: "bridge" },
        { type: "h2", text: "Quand c'est pertinent" },
        { type: "p", text: "Plusieurs credits consommation, variation de revenus, projet immobilier a stabiliser : une etude gratuite permet de comparer scenario actuel et scenario rachat avant engagement." },
      ],
      related: [
        { href: "./rachat-credit-immobilier-guide-2026.html", label: "Guide rachat credit" },
        { href: "../credit-immo/rachat-credit/", label: "Page rachat credit" },
        { href: "../landings/credit-immo.html", label: "Credit immobilier" },
      ],
    },
    {
      scheduledAt: "2026-07-09",
      leadIntent: "collective_tpe",
      file: "mutuelle-collective-tpe-embauche-premier-salarie.html",
      section: "sante",
      tag: "TPE",
      tagClass: "tag-sante",
      title: "Mutuelle collective TPE : que faire a la premiere embauche ?",
      description:
        "Premiere embauche en TPE : obligations mutuelle collective, panier de soins, DUE et budget employeur.",
      meta: "8 min - Juillet 2026",
      cardExcerpt: "Premiere embauche : mettre en place la mutuelle collective.",
      cta: { href: "../landings/questionnaire.html?need=sante&journey=standard", label: "Questionnaire mutuelle collective" },
      keywords: ["mutuelle collective TPE", "premiere embauche", "ANI", "DUE", "panier de soins"],
      blocks: [
        { type: "p", text: "Des le premier salarie, une entreprise privee doit proposer une <strong>mutuelle collective</strong> conforme aux obligations ANI, sauf cas de dispense. Pour une TPE, l'enjeu est de rester conforme sans surpayer." },
        { type: "h2", text: "Les bases a valider" },
        { type: "ul", items: ["Panier de soins minimum", "Financement employeur au moins 50 %", "Decision unilaterale de l'employeur (DUE)", "Cas de dispense et justificatifs"] },
        { type: "bridge" },
        { type: "h2", text: "Choisir sans complexifier la paie" },
        { type: "p", text: "Un contrat lisible, des niveaux optionnels et une gestion simple evitent les erreurs a l'embauche. Comparez le cout employeur, la portabilite et les garanties utiles aux salaries." },
      ],
      related: [
        { href: "./mutuelle-collective-obligations-employeur-ani.html", label: "Obligations ANI" },
        { href: "./mutuelle-collective-pme-tpe-budget-2026.html", label: "Budget PME/TPE" },
        { href: "../landings/sante-collective.html", label: "Sante collective" },
      ],
    },
    {
      scheduledAt: "2026-07-13",
      leadIntent: "auto_malus",
      file: "assurance-auto-malus-apres-sinistre-trouver-contrat.html",
      section: "auto",
      tag: "Malus",
      tagClass: "tag-auto",
      title: "Assurance auto avec malus : comment retrouver un contrat apres sinistre",
      description:
        "Malus auto, sinistre responsable, resiliation assureur : solutions pour retrouver une assurance auto adaptee.",
      meta: "7 min - Juillet 2026",
      cardExcerpt: "Malus auto : retrouver une assurance sans surpayer inutilement.",
      cta: { href: "../landings/questionnaire.html?need=auto&journey=standard", label: "Questionnaire auto" },
      keywords: ["assurance auto malus", "sinistre responsable", "resiliation assureur", "bonus malus", "devis auto"],
      blocks: [
        { type: "p", text: "Apres un sinistre responsable, le <strong>malus auto</strong> augmente la prime et peut compliquer le renouvellement. L'objectif n'est pas de cacher le dossier, mais de presenter le bon profil au bon assureur." },
        { type: "h2", text: "Documents utiles" },
        { type: "ul", items: ["Releve d'information", "Historique sinistres", "Usage du vehicule", "Mesures prises pour reduire le risque"] },
        { type: "bridge" },
        { type: "h2", text: "Solutions possibles" },
        { type: "p", text: "Tiers plus temporaire, franchise ajustee, vehicule moins puissant, paiement annuel, assureur specialise : plusieurs leviers existent pour rester assure legalement." },
      ],
      related: [
        { href: "./assurance-auto-bonus-malus.html", label: "Bonus malus" },
        { href: "../assurance-auto/", label: "Assurance auto" },
      ],
    },
    {
      scheduledAt: "2026-07-16",
      leadIntent: "prevoyance_tns",
      file: "prevoyance-tns-arret-travail-indemnites-calcul.html",
      section: "prevoyance",
      tag: "TNS",
      tagClass: "tag-prevoyance",
      title: "Prevoyance TNS : calculer ses indemnites en cas d'arret de travail",
      description:
        "Independant, artisan, profession liberale : comment dimensionner une prevoyance TNS et eviter la perte de revenus.",
      meta: "8 min - Juillet 2026",
      cardExcerpt: "TNS : dimensionner le maintien de revenus.",
      cta: { href: "../landings/questionnaire.html?need=prevoyance&journey=standard", label: "Questionnaire prevoyance" },
      keywords: ["prevoyance TNS", "arret de travail independant", "maintien de revenus", "indemnites journalieres", "devis prevoyance"],
      blocks: [
        { type: "p", text: "Un independant malade ne dispose pas du meme filet qu'un salarie. Une <strong>prevoyance TNS</strong> sert a maintenir les revenus apres franchise, selon un montant d'indemnites journalieres choisi a la souscription." },
        { type: "h2", text: "Calculer le besoin reel" },
        { type: "ul", items: ["Charges personnelles incompressibles", "Charges professionnelles qui continuent", "Remboursement de pret", "Tresorerie disponible et delai de franchise acceptable"] },
        { type: "bridge" },
        { type: "h2", text: "Garanties a comparer" },
        { type: "p", text: "ITT, invalidite, deces, rente education, exclusions dos/psy, franchise 15/30/60 jours : le contrat doit coller au metier et au revenu declare." },
      ],
      related: [
        { href: "./prevoyance-independants-guide.html", label: "Guide prevoyance independants" },
        { href: "../assurance-prevoyance/", label: "Assurance prevoyance" },
      ],
    },
    {
      scheduledAt: "2026-07-20",
      leadIntent: "chat_sante",
      file: "assurance-chat-sterilisation-vaccins-prevention.html",
      section: "animaux",
      tag: "Chat",
      tagClass: "tag-animaux",
      title: "Assurance chat : sterilisation, vaccins et prevention sont-ils rembourses ?",
      description:
        "Assurance chat : forfait prevention, vaccins, sterilisation, antiparasitaires et exclusions a verifier.",
      meta: "7 min - Juillet 2026",
      cardExcerpt: "Chat : comprendre le forfait prevention avant de choisir.",
      cta: { href: "../landings/questionnaire.html?need=animaux&journey=standard", label: "Questionnaire assurance chat" },
      keywords: ["assurance chat", "sterilisation chat", "vaccins chat", "forfait prevention", "mutuelle animaux"],
      blocks: [
        { type: "p", text: "Pour un chat, la prevention revient chaque annee : vaccins, antiparasitaires, vermifuge, bilan senior. Selon la formule, une <strong>assurance chat</strong> peut inclure un forfait prevention en plus des accidents et maladies." },
        { type: "h2", text: "Ce qui peut etre rembourse" },
        { type: "ul", items: ["Vaccins et rappels", "Sterilisation selon contrat", "Antiparasitaires prescrits", "Bilan annuel ou actes de prevention plafonnes"] },
        { type: "bridge" },
        { type: "h2", text: "Attention au plafond prevention" },
        { type: "p", text: "Un forfait de 50 ou 100 EUR ne remplace pas le plafond maladie/chirurgie. Comparez les deux : prevention pour le quotidien, garantie maladie pour les gros frais." },
      ],
      related: [
        { href: "../assurance-animaux/chat/", label: "Assurance chat" },
        { href: "./chat-puces-tiques-assurance-remboursement.html", label: "Puces et tiques chat" },
        { href: "./assurance-chat-guide-complet.html", label: "Guide assurance chat" },
      ],
    },
    {
      scheduledAt: "2026-07-23",
      leadIntent: "patrimoine",
      file: "assurance-vie-beneficiaire-erreurs-transmission.html",
      section: "patrimoine",
      tag: "Transmission",
      tagClass: "tag-patrimoine",
      title: "Assurance-vie : clause beneficiaire, transmission et erreurs frequentes",
      description:
        "Assurance-vie : pourquoi verifier la clause beneficiaire, comment eviter les erreurs et preparer la transmission.",
      meta: "8 min - Juillet 2026",
      cardExcerpt: "Clause beneficiaire : le detail qui change tout.",
      cta: { href: "../landings/questionnaire.html?need=assurance-vie&journey=standard", label: "Questionnaire patrimoine" },
      keywords: ["assurance vie", "clause beneficiaire", "transmission patrimoine", "epargne retraite", "devis assurance vie"],
      blocks: [
        { type: "p", text: "L'<strong>assurance-vie</strong> n'est pas seulement un placement : c'est aussi un outil de transmission. Une clause beneficiaire oubliee apres mariage, divorce ou naissance peut contredire la volonte actuelle de l'epargnant." },
        { type: "h2", text: "Erreurs frequentes" },
        { type: "ul", items: ["Clause trop vague ou ancienne", "Beneficiaire decede non remplace", "Absence de rangs successifs", "Contrat ouvert mais jamais revu apres changement familial"] },
        { type: "bridge" },
        { type: "h2", text: "Quand faire le point" },
        { type: "p", text: "Naissance, separation, achat immobilier, creation d'entreprise, retraite : chaque evenement patrimonial justifie une verification du contrat et des beneficiaires." },
      ],
      related: [
        { href: "./assurance-vie-epargne-retraite-patrimoine.html", label: "Assurance-vie et patrimoine" },
        { href: "../assurances/", label: "Catalogue assurances" },
      ],
    },
  ],
};

function resolvePublishDate(options) {
  if (options && options.publishDate) return options.publishDate;
  return process.env.BLOG_PUBLISH_DATE || new Date().toISOString().slice(0, 10);
}

function getDueLeadGenerationArticles(options) {
  var publishDate = resolvePublishDate(options);
  return CALENDAR.articles
    .filter(function (article) {
      return !article.paused && article.scheduledAt <= publishDate;
    })
    .map(function (article) {
      return Object.assign({}, article, {
        publishedAt: article.publishedAt || article.scheduledAt,
        updatedAt: article.updatedAt || article.publishedAt || article.scheduledAt,
      });
    })
    .sort(function (a, b) {
      return b.publishedAt.localeCompare(a.publishedAt);
    });
}

module.exports = {
  CALENDAR: CALENDAR,
  getDueLeadGenerationArticles: getDueLeadGenerationArticles,
};
