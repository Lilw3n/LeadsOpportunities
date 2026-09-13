/**
 * Articles blog assurance taxi — intent chaud → landing / questionnaire.
 * Chargé par blog-articles-manifest.cjs. UTM blog pour corrélation CRM.
 */
var UTM = "utm_source=blog&utm_medium=article&utm_campaign=promo_taxi";

function landing(content) {
  return "../landings/taxi.html?" + UTM + (content ? "&utm_content=" + content : "");
}

function quest(content) {
  return (
    "../landings/questionnaire.html?need=taxi&journey=standard&" +
    UTM +
    (content ? "&utm_content=" + content : "")
  );
}

function express(content) {
  return (
    "../landings/devis-rapide.html?need=taxi&" +
    UTM +
    (content ? "&utm_content=" + content : "")
  );
}

var CTA_TAXI = { href: landing("taxi-hub"), label: "Devis assurance taxi" };

var RELATED_TAXI = [
  { href: "./assurance-taxi-moins-cher-2026.html", label: "Assurance taxi moins cher" },
  { href: "./assurance-taxi-garanties-obligatoires-tpt-2026.html", label: "Garanties obligatoires TPT" },
  { href: "./assurance-taxi-creation-activite-ads-2026.html", label: "Création activité taxi" },
  { href: "./assurance-taxi-vehicule-relais-perte-exploitation.html", label: "Véhicule relais" },
  { href: "./changer-assurance-taxi-resiliation-2026.html", label: "Changer d'assurance taxi" },
  { href: "./devis-assurance-taxi-rappel-15-min-courtier-orias.html", label: "Devis taxi 15 min" },
  { href: "../assurance-taxi/", label: "Hub assurance taxi" },
  { href: "../assurance-taxi/garanties/", label: "Catalogue de garanties" },
  { href: "../landings/taxi.html", label: "Landing devis taxi" },
];

function relatedTaxi() {
  var extra = Array.prototype.slice.call(arguments);
  var seen = {};
  return extra.concat(RELATED_TAXI).filter(function (l) {
    if (seen[l.href]) return false;
    seen[l.href] = true;
    return true;
  });
}

module.exports = [
  {
    file: "assurance-taxi-moins-cher-2026.html",
    section: "taxi",
    tag: "Tarif taxi",
    tagClass: "tag-taxi",
    themes: ["taxi"],
    title: "Assurance taxi moins cher en 2026 : 7 leviers sans sous-assurer",
    description:
      "Prime taxi trop élevée ? Comparez RC auto TPT, RC pro, franchises et véhicule relais. Courtier ORIAS, devis gratuit.",
    meta: "11 min · Septembre 2026",
    cardExcerpt: "7 leviers pour baisser la prime taxi sans perdre l'attestation TPT.",
    keywords: [
      "assurance taxi moins cher",
      "tarif assurance taxi 2026",
      "prix assurance taxi",
      "comparer assurance taxi",
      "prime taxi pas cher",
      "devis assurance taxi",
    ],
    cta: CTA_TAXI,
    blocks: [
      {
        type: "p",
        text:
          "Un chauffeur de taxi ne paie pas une <strong>assurance auto particulière</strong> : il paie un contrat <strong>usage taxi / TPT</strong> (transport de personnes à titre onéreux). Le « moins cher » qui oublie cette mention est un faux devis — refusé en contrôle et inopposable au sinistre. Voici comment <strong>baisser la prime</strong> sans bricoler l'attestation. <a href=\"" +
          landing("taxi-tarif-intro") +
          "\"><strong>Obtenir mon devis taxi</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Exiger l'usage TPT dès le premier devis" },
      {
        type: "p",
        text:
          "Sans mention <strong>taxi / TPT</strong> sur l'attestation, le contrat peut être requalifié en auto loisir. La police des taxis et les compagnies regardent ce point en premier. Un écart de 20 €/mois ne vaut pas une non-assurance. Détail : <a href=\"./assurance-taxi-garanties-obligatoires-tpt-2026.html\">garanties obligatoires TPT</a> · <a href=\"../assurance-taxi/garanties/\">catalogue garanties</a>.",
      },
      { type: "h2", text: "2. Ce qui fait vraiment varier le tarif" },
      {
        type: "ul",
        items: [
          "Véhicule (valeur, énergie, âge) et kilométrage annuel",
          "Zone : stations, aéroports, nuits — sinistralité différente",
          "Antécédents conducteur et bonus-malus professionnel",
          "Franchise bris de glace / dommages (souvent le levier n°1)",
          "Options : véhicule relais, perte d'exploitation, tous accidents",
        ],
      },
      { type: "h2", text: "3. Sept leviers concrets" },
      {
        type: "ul",
        items: [
          "Comparer 3 à 5 partenaires (AXA, Generali, Allianz, spécialistes taxi) à garanties équivalentes",
          "Relever une franchise que vous pouvez absorber sur 1 semaine de courses",
          "Retirer une option jamais utilisée (ex. relais trop bas pour un TPT)",
          "Déclarer le vrai usage (double activité VTC / taxi = avenant, pas un silence)",
          "Regrouper RC auto TPT + RC pro chez le même courtier pour éviter les trous",
          "Payer annuel si le fractionnement ajoute 8–12 %",
          "Changer à l'échéance ou via Hamon une fois le nouveau contrat signé — <a href=\"./changer-assurance-taxi-resiliation-2026.html\">guide résiliation</a>",
        ],
      },
      { type: "h2", text: "4. Ne pas « gagner » 30 € en perdant une semaine" },
      {
        type: "p",
        text:
          "Une franchise trop haute, un plafond conducteur trop bas ou un véhicule relais exclu du TPT coûte plus cher qu'une prime un peu plus élevée. Règle LO : <strong>conformité d'abord</strong>, optimisation ensuite. <a href=\"" +
          quest("taxi-tarif-quest") +
          "\">Décrire mon activité (questionnaire)</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "5. On compare pour vous" },
      {
        type: "p",
        text:
          "Courtier ORIAS : lecture claire des franchises, attestation TPT, rappel souvent sous 15 min en journée. <a href=\"" +
          landing("taxi-tarif-cta") +
          "\"><strong>Comparer mon assurance taxi</strong></a> · <a href=\"" +
          express("taxi-tarif-express") +
          "\">devis express 30 sec</a>.",
      },
    ],
    related: relatedTaxi({ href: "../assurance-taxi/tarif/", label: "Page tarif taxi" }),
    faq: [
      {
        q: "Quel est le prix moyen d'une assurance taxi ?",
        a: "Il n'existe pas de prix unique fiable : véhicule, zone, antécédents et options changent tout. Un devis nominatif vaut mieux qu'un « à partir de » trompeur.",
      },
      {
        q: "Puis-je assurer un taxi comme une auto perso pour payer moins ?",
        a: "Non. L'usage transport de personnes à titre onéreux doit être déclaré. Sinon le sinistre peut être refusé.",
      },
      {
        q: "Le devis est-il gratuit ?",
        a: "Oui, sans engagement. Vous recevez une proposition avec les mentions TPT / RC pro à vérifier avant signature.",
      },
    ],
  },
  {
    file: "assurance-taxi-garanties-obligatoires-tpt-2026.html",
    section: "taxi",
    tag: "Garanties TPT",
    tagClass: "tag-taxi",
    themes: ["taxi"],
    title: "Garanties obligatoires assurance taxi : RC auto TPT et RC pro (2026)",
    description:
      "Ce qui est obligatoire pour rouler en taxi : RC auto usage TPT, RC professionnelle, attestations. Checklist courtier ORIAS.",
    meta: "10 min · Septembre 2026",
    cardExcerpt: "Socle légal taxi : TPT + RC pro — ce que le contrôle vérifie vraiment.",
    keywords: [
      "garanties obligatoires taxi",
      "assurance taxi TPT",
      "RC pro taxi obligatoire",
      "attestation taxi police",
      "responsabilité civile taxi",
      "usage taxi titre onéreux",
    ],
    cta: { href: landing("taxi-garanties"), label: "Vérifier mes garanties taxi" },
    blocks: [
      {
        type: "p",
        text:
          "Avant de parler « tous risques » ou véhicule relais, un taxi doit avoir un <strong>socle obligatoire</strong> : <strong>RC automobile avec usage TPT</strong> et <strong>RC professionnelle</strong>. Sans ces deux attestations, vous n'êtes pas en règle — ni pour la préfecture / police des taxis, ni pour un sinistre client. <a href=\"" +
          landing("taxi-tpt-intro") +
          "\"><strong>Faire vérifier mon contrat</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. RC auto usage taxi / TPT" },
      {
        type: "p",
        text:
          "La RC auto classique (usage privé ou trajet travail) <strong>ne suffit pas</strong> dès que vous transportez des clients contre rémunération. Le contrat doit citer l'<strong>usage taxi</strong> ou le <strong>transport de personnes à titre onéreux</strong>. Catalogue détaillé : <a href=\"../assurance-taxi/garanties/#tpt\">usage TPT</a> · <a href=\"../assurance-taxi/garanties-obligatoires/\">page garanties obligatoires</a>.",
      },
      { type: "h2", text: "2. RC professionnelle taxi" },
      {
        type: "p",
        text:
          "Elle couvre les dommages liés à l'<strong>activité</strong> (client, bagages, incident hors collision). Plafonds corporels, territorialité et exclusions se lisent ligne à ligne. Voir <a href=\"../assurance-taxi/rc-pro/\">RC Pro taxi</a> et <a href=\"../assurance-taxi/garanties/#rc-pro\">fiche RC pro</a>.",
      },
      { type: "h2", text: "3. Ce que le contrôle demande souvent" },
      {
        type: "ul",
        items: [
          "Attestation RC auto avec mention taxi / TPT",
          "Attestation RC pro à jour, nominative",
          "Carte professionnelle / ADS selon votre statut",
          "Contrôle technique et documents véhicule",
        ],
      },
      { type: "h2", text: "4. Fortement recommandé (pas « gadget »)" },
      {
        type: "p",
        text:
          "Assurance du <strong>conducteur</strong> (revenu à temps plein), <strong>bris de glace</strong> (stations, aéroports), <strong>vol / incendie</strong>, et selon le financement <strong>dommages tous accidents</strong>. Le <a href=\"./assurance-taxi-vehicule-relais-perte-exploitation.html\">véhicule relais</a> protège le chiffre d'affaires. <a href=\"" +
          quest("taxi-tpt-quest") +
          "\">Questionnaire taxi (3 min)</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "5. On aligne le contrat sur votre activité" },
      {
        type: "p",
        text:
          "On ne vend pas une « auto pro » générique : on vérifie que chaque attestation cite le taxi. <a href=\"" +
          landing("taxi-tpt-cta") +
          "\"><strong>Demander mon devis taxi</strong></a>.",
      },
    ],
    related: relatedTaxi({ href: "../assurance-taxi/garanties-obligatoires/", label: "Alias garanties obligatoires" }),
    faq: [
      {
        q: "La RC auto personnelle suffit-elle pour un taxi ?",
        a: "En général non. L'usage transport de personnes à titre onéreux doit être explicitement garanti.",
      },
      {
        q: "La RC pro taxi est-elle obligatoire ?",
        a: "Oui dans le cadre du TPT. Elle complète la RC automobile et doit être présentable en contrôle.",
      },
      {
        q: "Que faire si mon attestation dit seulement « usage professionnel » ?",
        a: "Demandez un avenant ou un nouveau devis mentionnant taxi / TPT. Un libellé trop générique est un risque au sinistre.",
      },
    ],
  },
  {
    file: "assurance-taxi-creation-activite-ads-2026.html",
    section: "taxi",
    tag: "Création taxi",
    tagClass: "tag-taxi",
    themes: ["taxi"],
    title: "Créer son activité taxi : assurance, ADS et checklist avant la première course",
    description:
      "Nouveau chauffeur taxi : RC pro, TPT, ADS, attestations. Checklist avant de prendre la route. Devis courtier ORIAS.",
    meta: "10 min · Septembre 2026",
    cardExcerpt: "Création taxi : l'assurance à caler avant la première station.",
    keywords: [
      "création activité taxi",
      "assurance nouveau taxi",
      "ADS taxi assurance",
      "première course taxi assurance",
      "devenir chauffeur taxi assurance",
      "attestation taxi création",
    ],
    cta: { href: landing("taxi-creation"), label: "Devis nouveau taxi" },
    blocks: [
      {
        type: "p",
        text:
          "Lancer une <strong>activité taxi</strong> (licence / ADS, véhicule, statuts) sans contrat <strong>TPT + RC pro</strong> est le piège le plus fréquent : vous êtes bloqué au premier contrôle, ou découvert au premier sinistre. Voici l'ordre des documents. <a href=\"" +
          landing("taxi-crea-intro") +
          "\"><strong>Préparer mon devis création</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Ordre recommandé" },
      {
        type: "ul",
        items: [
          "Statut (EI, EURL…) et immatriculation",
          "Véhicule conforme + financement (LOA/LLD → dommages souvent exigés)",
          "Devis assurance taxi avec mention TPT + RC pro",
          "Attestations émises <em>avant</em> la première course",
          "Puis seulement : stations, aéroports, double activité VTC",
        ],
      },
      { type: "h2", text: "2. Documents que le courtier demande" },
      {
        type: "p",
        text:
          "Permis, relevé d'information, carte grise, devis ou photo du véhicule, et selon les cas justificatif d'<strong>ADS</strong> / carte professionnelle. Plus le dossier est complet, plus l'attestation arrive vite. Hub : <a href=\"../assurance-taxi/creation-activite/\">création d'activité</a>.",
      },
      { type: "h2", text: "3. Double activité taxi + VTC" },
      {
        type: "p",
        text:
          "Si vous cumulez les deux, dites-le dès le devis. Un contrat taxi seul peut exclure les plateformes VTC, et inversement. Voir aussi <a href=\"./assurance-vtc-creation-chauffeur.html\">création VTC</a> et <a href=\"../assurance-vtc/garanties/\">garanties VTC</a>.",
      },
      { type: "h2", text: "4. Budget de lancement" },
      {
        type: "p",
        text:
          "Intégrez la <strong>prime</strong> (souvent annuelle ou mensuelle), la franchise que vous pouvez payer le premier mois, et un relais si le véhicule est votre seul outil. Guide prix : <a href=\"./assurance-taxi-moins-cher-2026.html\">assurance taxi moins cher</a>. <a href=\"" +
          quest("taxi-crea-quest") +
          "\">Questionnaire nouveau taxi</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "5. On calcule le socle avant que vous rouliez" },
      {
        type: "p",
        text:
          "Objectif : attestation prête, pas un devis « on verra après la première semaine ». <a href=\"" +
          landing("taxi-crea-cta") +
          "\"><strong>Obtenir mon devis création taxi</strong></a>.",
      },
    ],
    related: relatedTaxi({ href: "../assurance-taxi/creation-activite/", label: "Page création activité" }),
    faq: [
      {
        q: "Puis-je rouler quelques jours en attendant l'attestation ?",
        a: "Non. Sans attestation TPT + RC pro, vous n'êtes pas couvert — et vous n'êtes pas en règle.",
      },
      {
        q: "Un véhicule de location est-il assurable en taxi ?",
        a: "Souvent oui si le loueur et l'assureur acceptent l'usage TPT. Il faut le dire dès le devis (LOA / LLD / courte durée).",
      },
      {
        q: "Combien de temps pour l'attestation ?",
        a: "Dossier complet : souvent sous 24–48 h ouvrées, parfois le jour même. Un devis express 30 sec lance le rappel.",
      },
    ],
  },
  {
    file: "assurance-taxi-vehicule-relais-perte-exploitation.html",
    section: "taxi",
    tag: "Continuité d'activité",
    tagClass: "tag-taxi",
    themes: ["taxi"],
    title: "Véhicule relais et perte d'exploitation taxi : protéger vos courses",
    description:
      "Taxi immobilisé : véhicule relais TPT, indemnité d'exploitation, franchises. Ce qu'il faut exiger par écrit. Devis ORIAS.",
    meta: "9 min · Septembre 2026",
    cardExcerpt: "Taxi à l'arrêt = CA à zéro. Relais et perte d'exploitation à cadrer.",
    keywords: [
      "véhicule relais taxi",
      "perte d'exploitation taxi",
      "voiture de remplacement taxi",
      "taxi immobilisé assurance",
      "indemnité courses perdues",
      "relais TPT",
    ],
    cta: { href: landing("taxi-relais"), label: "Cadrer mon relais taxi" },
    blocks: [
      {
        type: "p",
        text:
          "Un taxi à l'atelier, ce n'est pas « gênant » : c'est <strong>zéro course</strong>. La garantie <strong>véhicule relais</strong> et la <strong>perte d'exploitation</strong> existent — encore faut-il qu'elles soient <strong>compatibles TPT</strong>. Beaucoup de pools de remplacement excluent le transport de personnes. <a href=\"" +
          landing("taxi-relais-intro") +
          "\"><strong>Vérifier ma clause relais</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Véhicule relais : la question à poser par écrit" },
      {
        type: "p",
        text:
          "« Le véhicule de remplacement est-il <strong>autorisé en usage taxi / TPT</strong> ? » Si la réponse est floue, partez du principe que non. Cylindrée, catégorie, délai de mise à disposition et durée (7, 15, 30 jours) se négocient. Fiche : <a href=\"../assurance-taxi/garanties/#vehicule-relais\">véhicule relais</a>.",
      },
      { type: "h2", text: "2. Perte d'exploitation : lire la franchise en jours" },
      {
        type: "p",
        text:
          "Une indemnité trop basse, ou une <strong>franchise de 7 jours</strong>, ne sauve pas un chauffeur à fort rythme. Calculez : courses moyennes × jours d'arrêt − franchise. Détail : <a href=\"../assurance-taxi/garanties/#perte-exploitation\">perte d'exploitation</a>.",
      },
      { type: "h2", text: "3. Quand ces options valent le coût" },
      {
        type: "ul",
        items: [
          "Véhicule unique, pas de second taxi dans le foyer",
          "Stations / aéroports à fort volume",
          "Crédit ou LOA : immobilisation + échéance à payer",
          "Pas de trésorerie pour encaisser 10 jours à l'arrêt",
        ],
      },
      { type: "h2", text: "4. Quand les retirer pour baisser la prime" },
      {
        type: "p",
        text:
          "Si vous avez déjà un relais familial compatible TPT, ou un volume très faible, ces options peuvent être du surplus. Comparez alors le <a href=\"./assurance-taxi-moins-cher-2026.html\">tarif</a> sans casser le socle obligatoire. <a href=\"" +
          quest("taxi-relais-quest") +
          "\">Décrire mon rythme de courses</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "5. On lit la clause avec vous" },
      {
        type: "p",
        text:
          "On demande la compatibilité TPT par écrit aux partenaires avant de vous faire signer. <a href=\"" +
          landing("taxi-relais-cta") +
          "\"><strong>Obtenir un devis avec relais cadré</strong></a>.",
      },
    ],
    related: relatedTaxi({ href: "../assurance-taxi/garanties/#vehicule-relais", label: "Fiche véhicule relais" }),
    faq: [
      {
        q: "Le véhicule relais auto classique convient-il à un taxi ?",
        a: "Souvent non : les pools excluent le TPT. Exigez une clause écrite.",
      },
      {
        q: "La perte d'exploitation remplace-t-elle le relais ?",
        a: "Non. L'une verse une indemnité, l'autre un véhicule. Selon votre rythme, l'une des deux (ou les deux) se justifie.",
      },
      {
        q: "Quel délai avant d'avoir un relais ?",
        a: "Variable selon l'assureur et la zone. Demandez le délai contractuel (24 h, 48 h…) au devis.",
      },
    ],
  },
  {
    file: "changer-assurance-taxi-resiliation-2026.html",
    section: "taxi",
    tag: "Résiliation",
    tagClass: "tag-taxi",
    themes: ["taxi"],
    title: "Changer d'assurance taxi en 2026 : Hamon, échéance, sans trou de garantie",
    description:
      "Résilier et changer d'assurance taxi sans jour de non-assurance. Loi Hamon, documents, attestation TPT. Courtier ORIAS.",
    meta: "9 min · Septembre 2026",
    cardExcerpt: "Changer de contrat taxi : d'abord le nouveau, ensuite la résiliation.",
    keywords: [
      "changer assurance taxi",
      "résilier assurance taxi",
      "loi Hamon taxi",
      "résiliation assurance TPT",
      "renouvellement assurance taxi",
      "attestation taxi changement",
    ],
    cta: { href: landing("taxi-resiliation"), label: "Préparer mon changement taxi" },
    blocks: [
      {
        type: "p",
        text:
          "Changer d'assurance taxi n'est pas comme changer d'auto perso : un <strong>jour sans attestation TPT</strong> et vous ne pouvez plus prendre de course — ni tenir un contrôle. L'ordre est strict : <strong>nouveau devis signé → attestation émise → puis résiliation</strong>. <a href=\"" +
          landing("taxi-resil-intro") +
          "\"><strong>Comparer avant de résilier</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Loi Hamon, échéance, résiliation infra-annuelle" },
      {
        type: "p",
        text:
          "Après un an, la <strong>loi Hamon</strong> permet souvent de partir sans attendre l'échéance. Avant un an, regardez l'échéance annuelle et la loi Chatel. Un courtier peut envoyer la lettre une fois le nouveau contrat actif. Page : <a href=\"../assurance-taxi/resiliation/\">résiliation taxi</a>.",
      },
      { type: "h2", text: "2. Documents à avoir sous la main" },
      {
        type: "ul",
        items: [
          "Relevé d'information (ou attestation en cours)",
          "Carte grise et usage déclaré",
          "Relevé de sinistres si on vous le demande",
          "Dates d'échéance et de première souscription",
        ],
      },
      { type: "h2", text: "3. Piège : résilier trop tôt" },
      {
        type: "p",
        text:
          "Si l'ancien contrat s'arrête un lundi et que le nouveau n'émet l'attestation que le mercredi, vous avez <strong>deux jours de non-assurance</strong>. Inacceptable en taxi. On calcule le chevauchement. <a href=\"" +
          quest("taxi-resil-quest") +
          "\">Questionnaire changement de contrat</a>.",
      },
      { type: "h2", text: "4. Pourquoi les gens changent" },
      {
        type: "p",
        text:
          "Prime en hausse, franchise mal calée, attestation trop vague (« usage pro »), relais exclu du TPT, ou simple comparatif annuel. Les leviers prix : <a href=\"./assurance-taxi-moins-cher-2026.html\">7 leviers</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "5. On enchaîne devis → attestation → résiliation" },
      {
        type: "p",
        text:
          "Vous ne restez pas une heure sans papier. <a href=\"" +
          landing("taxi-resil-cta") +
          "\"><strong>Lancer mon devis de bascule</strong></a> · <a href=\"" +
          express("taxi-resil-express") +
          "\">rappel express</a>.",
      },
    ],
    related: relatedTaxi({ href: "../assurance-taxi/resiliation/", label: "Page résiliation taxi" }),
    faq: [
      {
        q: "Puis-je résilier moi-même avant d'avoir le nouveau contrat ?",
        a: "Déconseillé. Attendez l'attestation TPT du nouvel assureur, puis résiliez (ou laissez le courtier le faire).",
      },
      {
        q: "La loi Hamon s'applique-t-elle à un contrat taxi ?",
        a: "Souvent oui après 12 mois sur les contrats d'assurance auto. Votre échéancier et les conditions générales tranchent — on le vérifie avec vous.",
      },
      {
        q: "Que se passe-t-il si j'ai un sinistre en cours ?",
        a: "Déclarez-le. Un sinistre ouvert n'interdit pas toujours un changement, mais il doit figurer au relevé.",
      },
    ],
  },
  {
    file: "devis-assurance-taxi-rappel-15-min-courtier-orias.html",
    section: "taxi",
    tag: "Devis taxi",
    tagClass: "tag-taxi",
    themes: ["taxi"],
    title: "Devis assurance taxi : rappel 15 min par un courtier ORIAS",
    description:
      "Devis assurance taxi gratuit : RC pro, TPT, relais. Courtier ORIAS, rappel souvent sous 15 min. Questionnaire ou express 30 sec.",
    meta: "8 min · Septembre 2026",
    cardExcerpt: "Devis taxi : téléphone + e-mail, rappel rapide, attestation TPT.",
    keywords: [
      "devis assurance taxi",
      "devis taxi gratuit",
      "courtier assurance taxi",
      "rappel assurance taxi",
      "comparer assurance taxi",
      "ORIAS taxi",
    ],
    cta: { href: landing("taxi-devis-rapide"), label: "Obtenir mon devis taxi" },
    blocks: [
      {
        type: "p",
        text:
          "Vous voulez un <strong>devis assurance taxi</strong> lisible — pas un tarif anonyme. Chez Leads Opportunities (courtier <strong>ORIAS</strong>), le parcours est simple : téléphone + e-mail, besoin taxi, puis questionnaire ou <a href=\"" +
          express("taxi-devis-hero") +
          "\">devis express 30 sec</a>. Rappel souvent <strong>sous 15 minutes</strong> en journée ouvrable. <a href=\"" +
          landing("taxi-devis-hero") +
          "\"><strong>Demander mon devis</strong></a> · <a href=\"" +
          quest("taxi-devis-quest") +
          "\">questionnaire 3 min</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Ce que le devis doit afficher" },
      {
        type: "ul",
        items: [
          "Mention taxi / TPT sur la RC auto",
          "RC professionnelle (plafonds)",
          "Franchises bris de glace et dommages",
          "Options : conducteur, relais, perte d'exploitation",
          "Prix TTC et fractionnement",
        ],
      },
      { type: "h2", text: "2. Trois portes d'entrée" },
      {
        type: "p",
        text:
          "<a href=\"" +
          landing("taxi-devis-landing") +
          "\">Landing taxi</a> (parcours guidé) · <a href=\"" +
          quest("taxi-devis-q") +
          "\">questionnaire</a> (profil détaillé) · <a href=\"" +
          express("taxi-devis-x") +
          "\">express</a> si vous voulez juste être rappelé. Les trois tombent dans le CRM avec UTM blog.",
      },
      { type: "h2", text: "3. Avec quoi arriver" },
      {
        type: "p",
        text:
          "Immatriculation ou modèle, usage (taxi seul ou taxi + VTC), zone, et si possible relevé d'information. Plus c'est précis, plus l'attestation est juste. Pour le socle légal : <a href=\"./assurance-taxi-garanties-obligatoires-tpt-2026.html\">garanties obligatoires</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "4. Gratuit, sans engagement" },
      {
        type: "p",
        text:
          "Comparer n'oblige pas à signer. Vous gardez vos attestations actuelles jusqu'à la bascule. <a href=\"" +
          landing("taxi-devis-cta") +
          "\"><strong>Être rappelé pour mon taxi</strong></a>.",
      },
    ],
    related: relatedTaxi({ href: "../assurance-taxi/devis-rapide/", label: "Page devis rapide SEO" }),
    faq: [
      {
        q: "Le devis taxi est-il vraiment gratuit ?",
        a: "Oui. Le courtage est rémunéré par les partenaires si vous souscrivez — pas par un frais de dossier caché sur le devis.",
      },
      {
        q: "Sous 15 minutes, vraiment ?",
        a: "En heures ouvrables, dès que téléphone et e-mail sont valides. En soirée ou week-end, le rappel passe au premier créneau.",
      },
      {
        q: "Puis-je aussi assurer un VTC ?",
        a: "Oui. Signalez la double activité : on oriente vers le bon contrat (taxi, VTC, ou les deux).",
      },
    ],
  },
];
