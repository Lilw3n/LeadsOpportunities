/**
 * Pages SEO — assurance chasse & equitation
 */
var LT = require("./seo-long-term-related.cjs");

function buildChassePages(page) {
  const BASE = "/assurance-chasse/";
  const LANDING = "/landings/devis.html?need=chasse";
  return [
    page({
      file: "assurance-chasse/index.html",
      theme: "niche",
      badge: "Chasse",
      title: "Assurance chasse | RC chasseur & chien de chasse 2026",
      description:
        "Assurance chasse : responsabilite civile chasseur, blessures, chien courant. Devis gratuit, courtier ORIAS, France entiere.",
      keywords:
        "assurance chasse, rc chasseur, assurance chasse pas cher, assurance chien de chasse, responsabilite chasseur",
      h1: "Assurance chasse : securiser votre pratique et vos chiens",
      intro:
        "Battue, chasse a courre ou tir sportif : les garanties RC et les options blessures ne se ressemblent pas. Nous comparons avec un conseiller qui connait la reglementation.",
      cta: { href: LANDING, label: "Devis assurance chasse" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurances", url: "/assurances/" },
        { name: "Assurance chasse", url: BASE },
      ],
      benefits: [
        { title: "RC chasseur", text: "Responsabilite civile et defense selon contrats." },
        { title: "Chien de chasse", text: "Options pour chiens courants et blessures." },
        { title: "Rappel conseiller", text: "Demande en ligne, rappel en journee ouvrable." },
      ],
      sections: [
        {
          h2: "Mots-cles et guides utiles",
          paragraphs: [
            "Les recherches « assurance chasse », « RC chasseur » et « assurance chien de chasse » menent rarement vers un comparateur generaliste. Nous structurons le silo autour de ces requetes, avec des pages ville et des articles de fond.",
          ],
          list: [
            "RC chasseur : plafonds, defense penale, exclusions",
            "Chien de chasse : blessures, responsabilite, options",
            "Tarifs et devis : formulaire puis rappel conseiller",
          ],
        },
        {
          h2: "Actu et longue traine",
          paragraphs: [
            "Feux de foret, orages et vigilance rouge impactent aussi les territoires de chasse. Nos articles actu renvoient vers le devis niche, sans promesse marketing vide.",
          ],
        },
      ],
      related: LT.mergeUnique(
        [
          { href: BASE + "rc-chasseur/", label: "RC chasseur" },
          { href: BASE + "chien-chasse/", label: "Chien de chasse" },
          { href: BASE + "villes/", label: "Par ville" },
          { href: "/assurances-niches.html", label: "Hub niches" },
          { href: "/assurances/", label: "Toutes nos assurances" },
        ],
        LT.NICHES_CHASSE,
        LT.ACTU_CLIMAT_HABITATION.slice(0, 2)
      ),
      faq: [
        {
          q: "L assurance chasse est-elle obligatoire ?",
          a: "La RC chasse est fortement encadree ; selon pratiques et territoires, des garanties specifiques sont requises. Nous verifions votre cas.",
        },
        {
          q: "Puis-je assurer mon chien de chasse a part ?",
          a: "Oui : certaines polices chasse incluent le chien ; sinon nous regardons une assurance chien classique en complement.",
        },
      ],
    }),
    page({
      file: "assurance-chasse/rc-chasseur/index.html",
      theme: "niche",
      badge: "RC chasseur",
      title: "RC chasseur | Responsabilite civile chasse",
      description: "RC chasseur : dommages aux tiers, defense. Devis assurance chasse, courtier ORIAS.",
      keywords: "rc chasseur, responsabilite civile chasse, assurance chasse rc",
      h1: "RC chasseur : couvrir les dommages causes aux tiers",
      intro: "La responsabilite civile est le coeur de l assurance chasse. Nous detailons plafonds et exclusions avant souscription.",
      cta: { href: LANDING, label: "Devis RC chasseur" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurance chasse", url: BASE },
        { name: "RC chasseur", url: BASE + "rc-chasseur/" },
      ],
      related: LT.mergeUnique(
        [{ href: BASE, label: "Guide chasse" }, { href: BASE + "chien-chasse/", label: "Chien de chasse" }],
        LT.NICHES_CHASSE
      ),
    }),
    page({
      file: "assurance-chasse/chien-chasse/index.html",
      theme: "niche",
      badge: "Chien de chasse",
      title: "Assurance chien de chasse | Devis",
      description: "Assurer un chien de chasse : blessures, responsabilite. Comparatif et devis gratuit.",
      keywords: "assurance chien de chasse, chien courant assurance, rc chien chasse",
      h1: "Assurance chien de chasse",
      intro: "Votre chien courant est un atout precieux. Certaines polices chasse incluent des garanties dediees — nous les identifions.",
      cta: { href: LANDING, label: "Devis chien de chasse" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurance chasse", url: BASE },
        { name: "Chien de chasse", url: BASE + "chien-chasse/" },
      ],
      related: LT.mergeUnique(
        [
          { href: "/assurance-animaux/chien/", label: "Assurance chien classique" },
          { href: BASE + "rc-chasseur/", label: "RC chasseur" },
        ],
        LT.NICHES_CHASSE,
        LT.NICHES_ANIMAUX.slice(0, 2)
      ),
    }),
  ];
}

function buildEquitationPages(page) {
  const BASE = "/assurance-equitation/";
  const LANDING = "/landings/devis.html?need=equitation";
  return [
    page({
      file: "assurance-equitation/index.html",
      theme: "niche",
      badge: "Equitation",
      title: "Assurance equitation | Cheval & RC equestre 2026",
      description:
        "Assurance equitation : RC equestre, cheval, materiel. Devis gratuit, courtier ORIAS, France entiere.",
      keywords:
        "assurance equitation, rc equestre, assurance cheval, assurance centre equestre, assurance cheval pas cher",
      h1: "Assurance equitation : cavaliers et proprietaires de chevaux",
      intro:
        "Cavalier de loisir, competition ou proprietaire : RC equestre, mortalite cheval et materiel se combinent differemment. Nous clarifions avant devis.",
      cta: { href: LANDING, label: "Devis assurance equitation" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurances", url: "/assurances/" },
        { name: "Assurance equitation", url: BASE },
      ],
      benefits: [
        { title: "RC equestre", text: "Dommages causes aux tiers a cheval." },
        { title: "Cheval", text: "Mortalite, frais veterinaires selon produits." },
        { title: "Conseil", text: "Rappel apres formulaire en ligne." },
      ],
      sections: [
        {
          h2: "Requêtes longue traine",
          paragraphs: [
            "« RC equestre », « assurance cheval pas cher » et « assurance centre equestre » sont des requetes a forte intention. Le hub national renvoie vers les pages metier et les articles guides 2026.",
          ],
          list: [
            "RC equestre : dommages aux tiers, ecurie, enseignement",
            "Assurance cheval : mortalite, veterinaire, usage",
            "Devis : landings niche puis rappel ORIAS",
          ],
        },
      ],
      related: LT.mergeUnique(
        [
          { href: BASE + "rc-equestre/", label: "RC equestre" },
          { href: BASE + "cheval/", label: "Assurance cheval" },
          { href: BASE + "villes/", label: "Par ville" },
          { href: "/assurances-niches.html", label: "Hub niches" },
        ],
        LT.NICHES_EQUITATION
      ),
      faq: [
        {
          q: "RC equestre : qui en a besoin ?",
          a: "Tout cavalier peut etre tenu responsable de dommages a des tiers. Les ecuries et enseignants ont des besoins specifiques.",
        },
      ],
    }),
    page({
      file: "assurance-equitation/rc-equestre/index.html",
      theme: "niche",
      badge: "RC equestre",
      title: "RC equestre | Responsabilite civile cavalier",
      description: "RC equestre : dommages aux tiers. Devis assurance equitation.",
      keywords: "rc equestre, responsabilite civile cavalier, assurance equitation rc",
      h1: "RC equestre : la garantie incontournable",
      intro: "Chute, degat a un tiers, dommage materiel : la RC equestre vous protege hors fautes lourdes exclues au contrat.",
      cta: { href: LANDING, label: "Devis RC equestre" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Equitation", url: BASE },
        { name: "RC equestre", url: BASE + "rc-equestre/" },
      ],
      related: LT.mergeUnique(
        [{ href: BASE, label: "Guide equitation" }, { href: BASE + "cheval/", label: "Assurance cheval" }],
        LT.NICHES_EQUITATION
      ),
    }),
    page({
      file: "assurance-equitation/cheval/index.html",
      theme: "niche",
      badge: "Cheval",
      title: "Assurance cheval | Mortalite & frais veterinaires",
      description: "Assurance cheval : mortalite, veterinaire, pension. Devis equitation.",
      keywords: "assurance cheval, assurance cheval pas cher, mortalite cheval",
      h1: "Assurer son cheval",
      intro: "Valeur du cheval, usage (loisir, competition), veterinaire : nous ciblons les produits encore commercialises.",
      cta: { href: LANDING, label: "Devis assurance cheval" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Equitation", url: BASE },
        { name: "Cheval", url: BASE + "cheval/" },
      ],
      related: LT.mergeUnique(
        [{ href: BASE + "rc-equestre/", label: "RC equestre" }, { href: BASE + "villes/", label: "Par ville" }],
        LT.NICHES_EQUITATION
      ),
    }),
  ];
}

module.exports = { buildChassePages: buildChassePages, buildEquitationPages: buildEquitationPages };
