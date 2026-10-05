/**
 * Niches partenariat courtage — SEO LO (pas AVF).
 * Ramonage, esthétique/bien-être, salles de loisirs, padel,
 * immeuble pro / MRP, décennale, RC convoyage.
 * Chargé par blog-articles-manifest.cjs.
 */
function utm(path, campaign) {
  var sep = path.indexOf("?") >= 0 ? "&" : "?";
  return (
    path +
    sep +
    "utm_source=blog&utm_medium=article&utm_campaign=" +
    encodeURIComponent(campaign || "partenariat_niches")
  );
}

function article(opts) {
  var need = opts.need || "rc-pro";
  var landing = opts.landing;
  var campaign = opts.campaign || "partenariat_niches";
  return {
    file: opts.file,
    section: opts.section || "partenariat",
    tag: opts.tag,
    tagClass: "tag-actu",
    themes: opts.themes || ["niche", "rc-pro"],
    title: opts.title,
    description: opts.description,
    meta: opts.meta || "9 min · Octobre 2026",
    cardExcerpt: opts.cardExcerpt,
    keywords: opts.keywords,
    cta: {
      href: utm(landing, campaign),
      label: opts.ctaLabel || "Demander un devis",
    },
    blocks: opts.blocks,
    faq: opts.faq || [],
    related: opts.related || [
      { href: "../assurances-niches.html", label: "Assurances de niche" },
      { href: utm("../landings/questionnaire.html?need=" + need + "&journey=standard", campaign), label: "Questionnaire" },
    ],
  };
}

module.exports = [
  article({
    file: "assurance-ramoneur-rc-pro-multirisque-2026.html",
    tag: "Ramonage",
    campaign: "ramonage",
    need: "rc-pro",
    landing: "../landings/ramonage.html",
    themes: ["ramonage", "rc-pro", "mrp"],
    title: "Assurance ramoneur 2026 : RC Pro, locaux et matériel",
    description:
      "Assurance ramonage : RC Pro obligatoire, dommages aux clients, matériel, véhicule pro. Guide courtier ORIAS pour artisans ramoneurs.",
    cardExcerpt: "Ramoneur : RC Pro + MRP — ce qu’il faut vraiment assurer.",
    keywords: [
      "assurance ramoneur",
      "rc pro ramonage",
      "assurance ramonage",
      "responsabilité civile ramoneur",
      "multirisque ramoneur",
      "devis assurance ramoneur",
    ],
    ctaLabel: "Devis ramoneur",
    blocks: [
      {
        type: "p",
        text: "Le <strong>ramonage</strong> cumule risques terrain (chez le client), fumées, outils et parfois local atelier. Sans <strong>RC professionnelle</strong> adaptée, un dégât des eaux, un incendie consécutif ou une blessure tiers peut mettre l’entreprise en difficulté. Ce guide détaille le pack type : RC Pro, multirisque, véhicule. <a href=\"../landings/ramonage.html\"><strong>Obtenir un devis ramoneur</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Pourquoi la RC Pro ramonage est critique" },
      {
        type: "p",
        text: "Vous intervenez sur des <strong>conduits</strong>, poêles, chaudières. Une mauvaise manipulation ou un oubli de consignes peut causer un sinistre habitation chez le client. La RC Pro ramoneur couvre les dommages corporels et matériels causés dans le cadre de l’activité — à condition que l’activité soit bien déclarée.",
      },
      { type: "h2", text: "2. Multirisque : atelier, stock, outils" },
      {
        type: "p",
        text: "Si vous avez un <strong>local</strong>, du stock de conduits / joints, ou un parc d’outils, la <strong>multirisque professionnelle</strong> (incendie, vol, dégât des eaux, perte d’exploitation) complète la RC. Les outils dans le véhicule méritent une clause spécifique.",
      },
      { type: "h2", text: "3. Checklist devis ramoneur" },
      {
        type: "ul",
        items: [
          "Activité exacte : ramonage, entretien chaudière, fumisterie",
          "CA et part interventions chez particuliers vs pro",
          "Local / atelier : surface, valeur matériel",
          "Véhicule utilitaire et outils embarqués",
          "Sinistres antérieurs (si connus)",
        ],
      },
      { type: "bridge" },
      {
        type: "p",
        text: "Niche peu saturée côté SEO : les gros comparateurs parlent rarement « assurance ramoneur ». Ideal pour générer des leads qualifiés. <a href=\"../landings/ramonage.html\">Devis express ramonage</a> · <a href=\"../landings/questionnaire.html?need=rc-pro&amp;journey=standard\">questionnaire RC Pro</a>.",
      },
    ],
    faq: [
      {
        q: "La RC habitation du client me couvre-t-elle ?",
        a: "Non : en intervention pro, c’est votre RC professionnelle qui est attendue. La MRH du client ne remplace pas votre responsabilité métier.",
      },
      {
        q: "Faut-il une décennale pour le ramonage ?",
        a: "Le ramonage pur n’est en général pas un ouvrage de construction. Si vous faites aussi de la fumisterie / pose, vérifiez si une décennale s’impose selon les travaux.",
      },
    ],
  }),

  article({
    file: "assurance-institut-beaute-esthetique-rc-pro-2026.html",
    tag: "Esthétique",
    campaign: "esthetique",
    need: "rc-pro",
    landing: "../landings/esthetique-bien-etre.html",
    themes: ["esthetique", "bien-etre", "rc-pro"],
    title: "Assurance institut de beauté & esthétique : RC Pro et locaux 2026",
    description:
      "RC Pro esthétique, bien-être, soins : brûlures, allergies, locaux, matériel. Guide assurance institut de beauté pour indépendants et salons.",
    cardExcerpt: "Esthétique / bien-être : RC Pro + locaux sans mauvaise surprise.",
    keywords: [
      "assurance institut de beauté",
      "rc pro esthétique",
      "assurance esthéticienne",
      "assurance salon bien-être",
      "responsabilité civile esthétique",
      "devis assurance esthétique",
    ],
    ctaLabel: "Devis esthétique / bien-être",
    blocks: [
      {
        type: "p",
        text: "Spas, instituts, esthéticiennes à domicile, coaching bien-être : le risque client (brûlure, réaction cutanée, glissade) impose une <strong>RC Pro</strong> claire. Ajoutez locaux, matériel et parfois perte d’exploitation. <a href=\"../landings/esthetique-bien-etre.html\"><strong>Devis esthétique &amp; bien-être</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. RC Pro : le cœur du métier" },
      {
        type: "p",
        text: "Déclarez précisément les <strong>actes</strong> (soins visage, épilation, UV, massage bien-être…). Les extensions (laser, actes médicaux périphériques) changent le tarif et les exclusions. Une activité mal déclarée = refus de garantie.",
      },
      { type: "h2", text: "2. Locaux et matériel" },
      {
        type: "p",
        text: "Cabines, tables, stérilisateurs, stock de produits : la <strong>multirisque</strong> protège le patrimoine pro. Vérifiez vol, dégât des eaux et valeur à neuf du matériel.",
      },
      { type: "h2", text: "3. Indépendant à domicile vs salon" },
      {
        type: "ul",
        items: [
          "À domicile : RC Pro + éventuellement extension habitation (usage pro)",
          "Salon / spa : MRP locaux + RC Pro + souvent protection juridique",
          "Employés : vérifier responsabilité employeur / accidents du travail",
        ],
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Le coaching bien-être est-il assurable en RC Pro ?",
        a: "Oui si l’activité est référencée (coaching, bien-être hors actes médicaux). Les actes médicaux ou paramédicaux hors cadre demandent une autre couverture.",
      },
    ],
  }),

  article({
    file: "assurance-salle-loisirs-escape-game-accrobranche-trampoline-2026.html",
    tag: "Loisirs",
    campaign: "salles_loisirs",
    need: "rc-pro",
    landing: "../landings/salles-loisirs.html",
    themes: ["loisirs", "escape-game", "rc-pro", "mrp"],
    title: "Assurance salle de loisirs 2026 : escape game, accrobranche, trampoline",
    description:
      "RC Pro et multirisque pour escape games, accrobranche, trampoline parks : public accueilli, locaux, matériel. Devis courtier ORIAS.",
    cardExcerpt: "Escape / accrobranche / trampoline : RC + locaux pour accueillir du public.",
    keywords: [
      "assurance escape game",
      "assurance accrobranche",
      "assurance trampoline park",
      "rc pro salle de loisirs",
      "assurance parc de loisirs",
      "multirisque salle de sport loisirs",
    ],
    ctaLabel: "Devis salles de loisirs",
    blocks: [
      {
        type: "p",
        text: "Accueillir du public dans un <strong>escape game</strong>, un <strong>parc accrobranche</strong> ou un <strong>trampoline park</strong> change tout : RC exploitation, locaux, matériel, parfois RC organisateur. Les comparateurs généralistes couvrent mal ces niches — idéal pour le SEO local et les leads B2B. <a href=\"../landings/salles-loisirs.html\"><strong>Devis salle de loisirs</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Escape game" },
      {
        type: "p",
        text: "Risques : blessures en salle, panique, dégâts au décor, responsabilité sur les mineurs. Besoin typique : <strong>RC Pro / exploitation</strong> + MRP locaux + matériel scénique.",
      },
      { type: "h2", text: "2. Accrobranche" },
      {
        type: "p",
        text: "Activité à risque élevé : équipements, contrôles, protocole secours. L’assureur demande souvent des <strong>normes</strong>, formations et fréquences de contrôle. Préparez le dossier avant le devis.",
      },
      { type: "h2", text: "3. Trampoline park" },
      {
        type: "p",
        text: "Surface, fréquentation, supervision, sinistralité : le tarif suit le volume et l’historique. MRP + RC + parfois protection juridique et perte d’exploitation.",
      },
      {
        type: "ul",
        items: [
          "Surface et capacité d’accueil",
          "CA et part scolaire / anniversaires",
          "Contrôles sécurité et certifications",
          "Sinistres des 36 derniers mois",
        ],
      },
      { type: "bridge" },
    ],
  }),

  article({
    file: "assurance-terrain-padel-club-rc-pro-2026.html",
    tag: "Padel",
    campaign: "padel",
    need: "rc-pro",
    landing: "../landings/padel.html",
    themes: ["padel", "loisirs", "rc-pro"],
    title: "Assurance terrain de padel & club : RC Pro, locaux, matériel 2026",
    description:
      "Assurance club de padel : RC exploitation, terrains, vestiaires, matériel. Guide devis pour gérants de clubs et centres sportifs.",
    cardExcerpt: "Club de padel : RC, terrains et locaux — pack assurance 2026.",
    keywords: [
      "assurance padel",
      "assurance club padel",
      "assurance terrain de padel",
      "rc pro club sportif",
      "assurance centre padel",
      "devis assurance padel",
    ],
    ctaLabel: "Devis club padel",
    blocks: [
      {
        type: "p",
        text: "Le <strong>padel</strong> explose en France : nouveaux clubs, terrains indoor/outdoor, location de créneaux. L’assurance doit suivre : RC exploitation, dommages aux installations, matériel, parfois responsabilité sur tournois. <a href=\"../landings/padel.html\"><strong>Devis assurance padel</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Ce qui est à assurer" },
      {
        type: "ul",
        items: [
          "RC Pro / exploitation (blessures joueurs, tiers)",
          "Structures de terrains, filets, éclairage",
          "Vestiaires, accueil, snack éventuel",
          "Matériel (raquettes, balles, réservation)",
          "Perte d’exploitation si fermeture sinistre",
        ],
      },
      { type: "h2", text: "2. Pourquoi c’est une niche SEO" },
      {
        type: "p",
        text: "Peu de pages ciblent « assurance terrain de padel » ou « assurance club padel ». Un contenu clair + landing devis convertit mieux qu’une pub générique « RC Pro ».",
      },
      { type: "bridge" },
    ],
  }),

  article({
    file: "assurance-immeuble-professionnel-multirisque-2026.html",
    tag: "Immeuble pro",
    campaign: "immeuble_pro",
    need: "mrp",
    landing: "../landings/immeuble-professionnel.html",
    section: "pro",
    themes: ["immeuble", "mrp", "professionnel"],
    title: "Assurance immeuble professionnel & multirisque 2026",
    description:
      "Immeubles professionnels, mixtes, en travaux ou classés : multirisque, propriétaire non occupant, perte d’exploitation. Guide courtier ORIAS.",
    cardExcerpt: "Immeuble pro / mixte / travaux : MRP et PNO sans angle mort.",
    keywords: [
      "assurance immeuble professionnel",
      "multirisque professionnelle immeuble",
      "assurance immeuble en travaux",
      "assurance bâtiment classé",
      "assurance PNO professionnel",
      "mrp locaux professionnels",
    ],
    ctaLabel: "Devis immeuble / MRP",
    blocks: [
      {
        type: "p",
        text: "Les <strong>immeubles professionnels</strong>, d’habitation ou <strong>mixtes</strong> — y compris en <strong>travaux</strong> ou <strong>classés</strong> — sont des dossiers à forte valeur. Priorisez MRP / PNO plutôt que des micro-dossiers particuliers. <a href=\"../landings/immeuble-professionnel.html\"><strong>Devis immeuble professionnel</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Types de biens" },
      {
        type: "ul",
        items: [
          "Immeuble de bureaux / commerce",
          "Immeuble d’habitation (PNO / syndic)",
          "Mixte (commerces + logements)",
          "Bien en travaux / rénovation",
          "Bâtiment classé ou inscrit",
        ],
      },
      { type: "h2", text: "2. Garanties à cadrer" },
      {
        type: "p",
        text: "Incendie, dégât des eaux, responsabilité propriétaire, pertes de loyers, catastrophes naturelles, parfois bris de glace et vol. En travaux : extension chantier / tous risques chantier selon le dossier.",
      },
      { type: "h2", text: "3. Pourquoi prioriser ces leads" },
      {
        type: "p",
        text: "Commission et intensité commerciale plus élevées que sur un devis auto. Alignez acquisition SEO/SEA sur « assurance immeuble professionnel », « MRP locaux », « PNO immeuble ». <a href=\"../landings/questionnaire.html?need=mrp&amp;journey=standard\">Questionnaire multirisque pro</a>.",
      },
      { type: "bridge" },
    ],
  }),

  article({
    file: "assurance-decennale-artisan-guide-2026.html",
    tag: "Décennale",
    campaign: "decennale",
    need: "decennale",
    landing: "../landings/decennale.html",
    themes: ["decennale", "construction", "pro"],
    title: "Assurance décennale artisan 2026 : obligations, devis, corps d’état",
    description:
      "Assurance décennale obligatoire pour artisans du bâtiment : qui est concerné, pièces du devis, sinistralité, sous-traitance. Courtier ORIAS.",
    cardExcerpt: "Décennale : qui doit s’assurer, quelles pièces pour un devis propre.",
    keywords: [
      "assurance décennale",
      "décennale artisan",
      "devis assurance décennale",
      "obligation décennale",
      "assurance construction décennale",
      "décennale pas cher",
    ],
    ctaLabel: "Devis décennale",
    blocks: [
      {
        type: "p",
        text: "La <strong>garantie décennale</strong> est une obligation pour de nombreux corps d’état du bâtiment. Sans attestation, pas de chantier sérieux. Ce guide prépare un devis propre : métier, CA travaux, sinistres, sous-traitance. <a href=\"../landings/decennale.html\"><strong>Demander un devis décennale</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Qui est concerné ?" },
      {
        type: "p",
        text: "Maçons, couvreurs, électriciens, plombiers, constructeurs… dès qu’il y a <strong>ouvrage</strong> susceptible d’engager la responsabilité décennale. Vérifiez votre code APE et la nature des travaux.",
      },
      { type: "h2", text: "2. Pièces pour accélérer le devis" },
      {
        type: "ul",
        items: [
          "KBIS / extrait INSEE",
          "CA travaux des 3 derniers exercices",
          "Liste des corps d’état",
          "Historique sinistres décennale",
          "Attestation précédente si renouvellement",
        ],
      },
      { type: "h2", text: "3. Lien avec la MRP" },
      {
        type: "p",
        text: "La décennale ne remplace pas la <strong>RC Pro chantier</strong> ni la multirisque de l’atelier. Souvent on couple décennale + RC / MRP. Voir aussi <a href=\"./assurance-immeuble-professionnel-multirisque-2026.html\">immeuble professionnel</a>.",
      },
      { type: "bridge" },
    ],
  }),

  article({
    file: "assurance-convoyeur-vehicules-rc-pro-2026.html",
    tag: "Convoyage",
    campaign: "convoyage",
    need: "rc-pro",
    landing: "../landings/convoyage-vehicules.html",
    themes: ["convoyage", "rc-pro", "transport"],
    title: "Assurance convoyeur de véhicules : RC Pro simple 2026",
    description:
      "RC Pro pour convoyeurs de véhicules : responsabilité pendant le déplacement, exclusions circulation, devis courtier. Niche B2B peu concurrentielle.",
    cardExcerpt: "Convoyage auto : RC Pro adaptée quand la plateforme / le donneur d’ordre assure le véhicule.",
    keywords: [
      "assurance convoyeur véhicules",
      "rc pro convoyage",
      "assurance convoyage automobile",
      "responsabilité convoyeur auto",
      "devis rc convoyage",
      "assurance transporteur véhicules",
    ],
    ctaLabel: "Devis RC convoyage",
    blocks: [
      {
        type: "p",
        text: "Pour le <strong>convoyage de véhicules</strong>, une <strong>RC Pro simple</strong> couvre souvent la responsabilité métier (hors garantie circulation du véhicule, portée par le propriétaire ou le donneur d’ordre). Niche claire, peu de contenu SEO dédié. <a href=\"../landings/convoyage-vehicules.html\"><strong>Devis RC convoyage</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Ce que la RC Pro convoyage couvre (typiquement)" },
      {
        type: "p",
        text: "Erreurs, omissions, dommages causés dans le cadre de la prestation de convoyage déclarée — selon contrat. Elle ne remplace en général <strong>pas</strong> l’assurance circulation du véhicule convoyé.",
      },
      { type: "h2", text: "2. Points à déclarer" },
      {
        type: "ul",
        items: [
          "Statut : auto-entrepreneur, SASU, salarié plateforme",
          "Volume de convoyages / mois",
          "Types de véhicules (VP, utilitaires, prestige)",
          "Zones géographiques",
          "Sinistres antérieurs",
        ],
      },
      { type: "h2", text: "3. Différence avec VTC / taxi" },
      {
        type: "p",
        text: "Le transport de personnes (VTC/taxi) relève d’autres garanties (circulation à titre onéreux). Ici on reste sur le <strong>convoyage sans passager commercial</strong>. Ne mélangez pas les questionnaires.",
      },
      { type: "bridge" },
    ],
  }),

  article({
    file: "niches-assurance-pro-ramonage-loisirs-padel-strategie-2026.html",
    tag: "Stratégie niches",
    campaign: "partenariat_niches",
    need: "rc-pro",
    landing: "../assurances-niches.html",
    themes: ["niche", "strategie", "seo"],
    title: "Niches assurance pro 2026 : ramonage, loisirs, padel, immeuble",
    description:
      "Quelles niches assurance professionnelle cibler en SEO : ramonage, esthétique, salles de loisirs, padel, immeuble, décennale, convoyage. Plan Leads Opportunities.",
    cardExcerpt: "Prioriser les niches pro à forte valeur plutôt que les dossiers particuliers.",
    keywords: [
      "niches assurance professionnelle",
      "assurance pro niche seo",
      "marchés niche courtage",
      "assurance ramonage loisirs padel",
      "spécialisation courtier assurance",
    ],
    ctaLabel: "Voir les niches",
    blocks: [
      {
        type: "p",
        text: "Pour un courtier solo qui génère des leads en ligne, les <strong>niches professionnelles</strong> battent souvent les dossiers particuliers : meilleure valeur, moins de concurrence SEO, questionnaires plus courts. Voici le panier activé sur Leads Opportunities.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Niches activées" },
      {
        type: "ul",
        items: [
          "<a href=\"./assurance-ramoneur-rc-pro-multirisque-2026.html\">Ramonage</a> — RC Pro + MRP",
          "<a href=\"./assurance-institut-beaute-esthetique-rc-pro-2026.html\">Esthétique &amp; bien-être</a>",
          "<a href=\"./assurance-salle-loisirs-escape-game-accrobranche-trampoline-2026.html\">Salles de loisirs</a>",
          "<a href=\"./assurance-terrain-padel-club-rc-pro-2026.html\">Terrains / clubs de padel</a>",
          "<a href=\"./assurance-immeuble-professionnel-multirisque-2026.html\">Immeuble professionnel &amp; MRP</a>",
          "<a href=\"./assurance-decennale-artisan-guide-2026.html\">Décennale artisans</a>",
          "<a href=\"./assurance-convoyeur-vehicules-rc-pro-2026.html\">RC convoyage véhicules</a>",
        ],
      },
      { type: "h2", text: "2. Ce qu’on ne force pas" },
      {
        type: "p",
        text: "Les activités hors référentiel assureur (ex. fabrication machines + coaching non listé) n’ont pas de solution magique : on vérifie d’abord si une activité approchante existe, sinon on refuse proprement plutôt que de promettre.",
      },
      { type: "h2", text: "3. Prochaine étape acquisition" },
      {
        type: "p",
        text: "Indexer les landings + articles dans Search Console (`npm run gsc:niches`), 1 campagne SEA = 1 landing, et relancer les blogs vers le questionnaire. Hub : <a href=\"../assurances-niches.html\">assurances de niche</a>.",
      },
      { type: "bridge" },
    ],
  }),
];
