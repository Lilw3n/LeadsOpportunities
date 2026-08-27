/**
 * Pages SEO — facturation électronique 2026 (Chorus Pro, plateformes agréées).
 */
var LT = require("./seo-long-term-related.cjs");

function buildFacturationElectroniquePages(page) {
  var BASE = "/facturation-electronique/";
  var LANDING = "/landings/facturation-electronique.html";
  var QPRO = "/landings/questionnaire.html?need=rc-pro&journey=standard";
  return [
    page({
      file: "facturation-electronique/index.html",
      theme: "pro",
      badge: "Reforme 2026",
      title: "Facturation électronique 2026 | Calendrier, Chorus Pro, TPE",
      description:
        "Facturation électronique obligatoire dès le 1er septembre 2026 : réception, émission, Chorus Pro, plateformes agréées. Guide TPE et devis RC Pro, courtier ORIAS.",
      keywords:
        "facturation électronique 2026, facturation électronique obligatoire, chorus pro, plateforme agréée, e-invoicing tpe",
      h1: "Facturation électronique : calendrier 2026 et démarches TPE",
      intro:
        "Toutes les entreprises doivent pouvoir recevoir une facture électronique au 1er septembre 2026. Grandes entreprises et ETI émettent à cette date ; PME, TPE et auto-entrepreneurs en 2027. Nous relions la réforme aux contrats pro (RC, mutuelle TNS).",
      cta: { href: LANDING, label: "Landing facturation électronique" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Professionnel", url: "/landings/devis.html?need=rc-pro" },
        { name: "Facturation électronique", url: BASE },
      ],
      benefits: [
        { title: "Calendrier officiel", text: "Dates DGFiP : réception 2026, émission selon taille." },
        { title: "Liens d'État", text: "impots.gouv.fr, Chorus Pro, liste des plateformes agréées." },
        { title: "Dossier TPE", text: "RC Pro et mutuelle TNS dans la même conversation." },
      ],
      sections: [
        {
          h2: "Ce que change la réforme",
          paragraphs: [
            "Un PDF envoyé par mail n'est pas une facture électronique au sens de la réforme. Il faut un format structuré (Factur-X, UBL, CII) et une plateforme agréée pour le B2B, ou Chorus Pro pour le secteur public.",
            "Sources : impots.gouv.fr (Je passe à la facturation électronique) et economie.gouv.fr.",
          ],
          list: [
            "Réception : toutes les entreprises au 1er septembre 2026",
            "Émission 2026 : grandes entreprises et ETI",
            "Émission 2027 : PME, TPE, micro-entreprises",
          ],
        },
        {
          h2: "Mots-clés utiles",
          paragraphs: [
            "facturation électronique 2026, facturation électronique obligatoire, chorus pro, plateforme agréée, auto-entrepreneur facture électronique, e-reporting, Factur-X, Nancy, Varangéville.",
          ],
        },
      ],
      related: LT.mergeUnique(
        [
          { href: BASE + "calendrier-2026/", label: "Calendrier 2026" },
          { href: BASE + "chorus-pro/", label: "Chorus Pro" },
          { href: BASE + "tpe-auto-entrepreneur/", label: "TPE / auto-entrepreneur" },
          { href: BASE + "plateformes-agreees/", label: "Plateformes agréées" },
          { href: QPRO, label: "Questionnaire RC Pro" },
          { href: "https://www.impots.gouv.fr/professionnel/je-passe-la-facturation-electronique", label: "DGFiP — je passe à la FE" },
          { href: "https://www.economie.gouv.fr/tout-savoir-sur-la-facturation-electronique-pour-les-entreprises", label: "economie.gouv.fr" },
          { href: "https://www.impots.gouv.fr/je-consulte-la-liste-des-plateformes-agreees", label: "Liste plateformes agréées" },
          { href: "https://portail.chorus-pro.gouv.fr/", label: "Portail Chorus Pro" },
        ],
        LT.FACTURATION_ELECTRONIQUE || []
      ),
      faq: [
        {
          q: "Où trouver le calendrier officiel ?",
          a: "Sur impots.gouv.fr (Je passe à la facturation électronique) et economie.gouv.fr. Notre page calendrier résume les dates sans remplacer l'administration.",
        },
        {
          q: "Proposez-vous une plateforme de facturation ?",
          a: "Nous sommes courtier ORIAS : nous vous orientons vers les sources officielles et nous comparons RC Pro / mutuelle TNS. La plateforme agréée se choisit sur la liste DGFiP.",
        },
      ],
    }),
    page({
      file: "facturation-electronique/calendrier-2026/index.html",
      theme: "pro",
      badge: "Calendrier",
      title: "Calendrier facturation électronique 2026–2027 | Réception et émission",
      description:
        "1er septembre 2026 : réception pour toutes, émission grandes entreprises et ETI. 1er septembre 2027 : PME TPE micro. Guide DGFiP.",
      keywords: "calendrier facturation électronique 2026, obligation e-facture septembre 2026",
      h1: "Calendrier facturation électronique 2026 et 2027",
      intro:
        "Les dates sont nationales. Vérifiez votre catégorie d'entreprise (grande, ETI, PME, TPE, micro) avant de choisir un logiciel.",
      cta: { href: LANDING, label: "Checklist + devis RC Pro" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Facturation électronique", url: BASE },
        { name: "Calendrier 2026", url: BASE + "calendrier-2026/" },
      ],
      sections: [
        {
          h2: "Les deux vagues",
          list: [
            "1er septembre 2026 — réception : toutes les entreprises",
            "1er septembre 2026 — émission + e-reporting : grandes entreprises et ETI",
            "1er septembre 2027 — émission : PME, TPE, auto-entrepreneurs",
          ],
        },
      ],
      related: [
        { href: BASE, label: "Hub facturation électronique" },
        { href: "/blog/facturation-electronique-obligatoire-2026.html", label: "Article guide 2026" },
        { href: "https://www.impots.gouv.fr/professionnel/je-passe-la-facturation-electronique", label: "DGFiP — je passe à la FE" },
      ],
      faq: [
        {
          q: "Le calendrier peut-il encore bouger ?",
          a: "Seule l'administration fait foi. Consultez impots.gouv.fr avant d'acheter un logiciel sur une rumeur LinkedIn.",
        },
      ],
    }),
    page({
      file: "facturation-electronique/chorus-pro/index.html",
      theme: "pro",
      badge: "Chorus Pro",
      title: "Chorus Pro 2026 | Facturation électronique du secteur public",
      description:
        "Chorus Pro reste le canal B2G. Portail, factures vers l'État et les collectivités. Complément : plateforme agréée pour le B2B.",
      keywords: "chorus pro, portail chorus pro, facturation électronique secteur public",
      h1: "Chorus Pro : facturer le secteur public",
      intro:
        "Si vous vendez à l'État, une collectivité ou un hôpital, Chorus Pro reste la plateforme de référence. Le B2B privé passe par une plateforme agréée.",
      cta: { href: LANDING, label: "Landing réforme 2026" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Facturation électronique", url: BASE },
        { name: "Chorus Pro", url: BASE + "chorus-pro/" },
      ],
      sections: [
        {
          h2: "Liens utiles",
          list: [
            "Portail : portail.chorus-pro.gouv.fr",
            "Actualité DGFiP : Chorus Pro restera la plateforme de référence du secteur public",
            "Article blog : Chorus Pro vs plateforme agréée",
          ],
        },
      ],
      related: [
        { href: BASE, label: "Hub" },
        { href: "/blog/chorus-pro-vs-plateforme-agreee-pdp-2026.html", label: "Blog Chorus vs PDP" },
        { href: "https://portail.chorus-pro.gouv.fr/", label: "Portail Chorus Pro" },
      ],
      faq: [
        {
          q: "Dois-je encore utiliser Chorus Pro après septembre 2026 ?",
          a: "Oui pour la sphère publique. L'actualité DGFiP le confirme. Le B2B se fait via une plateforme agréée.",
        },
      ],
    }),
    page({
      file: "facturation-electronique/tpe-auto-entrepreneur/index.html",
      theme: "pro",
      badge: "TPE",
      title: "Facturation électronique TPE et auto-entrepreneur | 2026–2027",
      description:
        "Micro-entreprise et TPE : réception e-facture dès septembre 2026, émission 2027. Franchise en base, B2C, RC Pro.",
      keywords: "facturation électronique auto-entrepreneur, facturation électronique tpe, micro-entreprise e-facture",
      h1: "TPE et auto-entrepreneur : vos dates e-facture",
      intro:
        "Vous n'êtes pas hors réforme. La réception arrive en 2026, l'émission en 2027. Relisez aussi RC Pro et mutuelle TNS.",
      cta: { href: QPRO, label: "Questionnaire RC Pro" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Facturation électronique", url: BASE },
        { name: "TPE / auto-entrepreneur", url: BASE + "tpe-auto-entrepreneur/" },
      ],
      sections: [
        {
          h2: "À faire avant septembre 2026",
          list: [
            "Pouvoir recevoir une facture électronique (logiciel ou plateforme agréée)",
            "Vérifier le nom de l'éditeur sur la liste DGFiP",
            "Chorus Pro si vous facturez le public",
            "Mettre à jour RC Pro et complémentaire TNS",
          ],
        },
      ],
      related: [
        { href: BASE, label: "Hub" },
        { href: "/blog/facturation-electronique-tpe-auto-entrepreneur-2026.html", label: "Article TPE / AE" },
        { href: "/blog/rc-pro-freelance-artisan-guide.html", label: "RC Pro freelance" },
        { href: LANDING, label: "Landing" },
      ],
      faq: [
        {
          q: "La franchise en base m'exonère-t-elle ?",
          a: "Pas automatiquement. La FAQ DGFiP traite franchise en base, absence de facture et mix B2B/B2C. Lisez-la avant de conclure.",
        },
      ],
    }),
    page({
      file: "facturation-electronique/plateformes-agreees/index.html",
      theme: "pro",
      badge: "Plateformes agréées",
      title: "Plateformes agréées facturation électronique | Liste DGFiP",
      description:
        "Liste officielle des plateformes agréées (ex-PDP) : seule la DGFiP fait foi. Tests d'interopérabilité, immatriculation.",
      keywords: "liste plateformes agréées, pdp immatriculée, plateforme agréée dgfip",
      h1: "Plateformes agréées : la liste qui fait foi",
      intro:
        "Un badge « compatible réforme » sur un site commercial ne suffit pas. Téléchargez les fichiers DGFiP (immatriculées vs dossiers en attente).",
      cta: { href: LANDING, label: "Landing + devis RC Pro" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Facturation électronique", url: BASE },
        { name: "Plateformes agréées", url: BASE + "plateformes-agreees/" },
      ],
      sections: [
        {
          h2: "Où vérifier",
          paragraphs: [
            "Page officielle : Je consulte la liste des plateformes agréées, sur impots.gouv.fr. Mise à jour régulière (fichiers ODS / XLSX / PDF).",
          ],
        },
      ],
      related: [
        { href: BASE, label: "Hub" },
        { href: "/blog/chorus-pro-vs-plateforme-agreee-pdp-2026.html", label: "Chorus vs plateforme agréée" },
        { href: "https://www.impots.gouv.fr/je-consulte-la-liste-des-plateformes-agreees", label: "Liste DGFiP" },
      ],
      faq: [
        {
          q: "Le numéro d'immatriculation affiché par un éditeur est-il officiel ?",
          a: "La DGFiP publie surtout nom, adresse, site et date. Vérifiez le nom exact dans le fichier officiel, pas un screenshot marketing.",
        },
      ],
    }),
  ];
}

module.exports = { buildFacturationElectroniquePages: buildFacturationElectroniquePages };
