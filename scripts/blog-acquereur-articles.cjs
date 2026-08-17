/**
 * Cluster acquéreur — offre inversée : capter les acheteurs (alerte)
 * pour attirer ensuite les vendeurs. Chargé par blog-articles-manifest.cjs.
 */
var CTA = "../landings/acheteur-immo.html#alerte";

module.exports = [
  {
    file: "alerte-immobilier-acquereur-avant-les-autres.html",
    section: "habitat",
    tag: "Acquéreur",
    tagClass: "tag-actu",
    themes: ["acquereur", "immobilier"],
    title: "Alerte immobilier : être prévenu avant les autres (guide acquéreur)",
    description:
      "Les bons appartements partent en 48 h. Une alerte (tél. + e-mail) bat trois mois de scroll SeLoger. Courtier ORIAS, sans scraping.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Alerte acquéreur : ville, téléphone, e-mail — on vous prévient dès qu’un mandat match.",
    keywords: [
      "alerte immobilier",
      "alerte bien immobilier",
      "alerte appartement à vendre",
      "être prévenu annonce immobilière",
      "acquéreur immobilier alerte",
    ],
    cta: { href: CTA, label: "Créer mon alerte acquéreur" },
    heroImage: {
      src: "./images/habitat/appartement-locataire.jpg",
      alt: "Salon d'appartement — recherche acquéreur",
      caption: "Le bon bien se joue souvent avant la mise en ligne grand public.",
    },
    blocks: [
      {
        type: "p",
        text: "En France, un appartement correctement prix part souvent <strong>en 24 à 72 heures</strong> dès qu’il est visible. Scroller SeLoger ou Leboncoin tous les soirs ne suffit plus : vous arrivez après l’offre. L’<strong>alerte acquéreur</strong> inverse le rapport — on vous appelle quand un mandat correspond, même si la vitrine publique est encore vide. <a href=\"" + CTA + "\"><strong>Créer mon alerte (tél. + e-mail)</strong></a>.",
      },
      { type: "bridge" },
      {
        type: "h2",
        text: "1. Pourquoi une alerte bat une recherche manuelle",
      },
      {
        type: "ul",
        items: [
          "Les vendeurs sérieux testent d’abord leur réseau (agence, notaire, courtier) avant le portail",
          "Les portails sont saturés d’annonces déjà sous offre, hors marché ou hors financement",
          "Une alerte avec téléphone + e-mail permet un rappel le jour même — pas un compte à créer sur cinq sites",
          "Vous restez maître : pas d’engagement, prêt optionnel",
        ],
      },
      {
        type: "h2",
        text: "2. Ce qu’on enregistre (et ce qu’on ne fait pas)",
      },
      {
        type: "p",
        text: "Ville ou secteur, type (appart / maison), budget, pièces, surface. Téléphone et e-mail pour vous joindre. <strong>Pas de scraping</strong> Leboncoin, SeLoger ou ParuVendu : les biens affichés sont des mandats déposés ici. Si la grille est vide, l’alerte sert précisément à ça — vous n’attendez pas une vitrine pleine. Voir aussi <a href=\"./acheter-appartement-sans-passer-des-mois-sur-seloger.html\">acheter sans passer des mois sur les portails</a>.",
      },
      {
        type: "h2",
        text: "3. Offre inversée : les vendeurs suivent les acheteurs",
      },
      {
        type: "p",
        text: "Un vendeur n’a aucune raison de déposer sur un site sans acquéreurs. Si vous (et d’autres) créez une alerte, le vivier devient visible : visites, offres, délais. C’est pour ça que le parcours commence par <strong>l’acquéreur</strong>, pas par le dépôt d’annonce. Vous vendez aussi ? Le dépôt reste disponible à côté.",
      },
      { type: "bridge" },
      {
        type: "h2",
        text: "4. Après l’alerte : visite, offre, prêt",
      },
      {
        type: "p",
        text: "Checklist visite : <a href=\"./visite-immobiliere-checklist-acquereur.html\">guide visite</a>. Offre sans se faire doubler : <a href=\"./offre-achat-immobilier-negocier-sans-se-faire-doubler.html\">offre d’achat</a>. Le crédit n’est pas un prérequis pour l’alerte — il vient si le bien tient. <a href=\"../landings/projection-achat.html\">Projection coût réel</a> · <a href=\"../landings/credit-immo.html\">simulation prêt</a>.",
      },
      {
        type: "p",
        text: "<a href=\"" + CTA + "\"><strong>Créer mon alerte acquéreur</strong></a> — 30 secondes, ville + téléphone + e-mail.",
      },
    ],
  },
  {
    file: "acheter-appartement-sans-passer-des-mois-sur-seloger.html",
    section: "habitat",
    tag: "Acquéreur",
    tagClass: "tag-actu",
    themes: ["acquereur", "immobilier"],
    title: "Acheter un appartement sans passer 3 mois sur SeLoger",
    description:
      "Scroll infini, biens déjà vendus, fausses bonnes affaires : comment un acquéreur en France sort du piège des portails avec une alerte ciblée.",
    meta: "7 min · Août 2026",
    cardExcerpt: "Portails saturés : alerte + matching valent mieux que trois mois de filtres.",
    keywords: [
      "acheter un appartement",
      "acheter appartement sans agence",
      "recherche appartement SeLoger",
      "appartements à vendre",
      "recherche bien immobilier",
    ],
    cta: { href: CTA, label: "Créer mon alerte acquéreur" },
    heroImage: {
      src: "./images/habitat/maison-famille.jpg",
      alt: "Maison et jardin — projet d'achat",
      caption: "Le bon logement se trouve rarement au 40e scroll du soir.",
    },
    blocks: [
      {
        type: "p",
        text: "SeLoger, Leboncoin, Bien’ici : utiles pour <em>voir</em> le marché, épuisants pour <em>acheter</em>. Trois mois de filtres, des favoris qui disparaissent, des visites pour des biens déjà promis. Un <strong>acquéreur</strong> gagne du temps en déclarant ville + budget + contact, puis en laissant un humain matcher. <a href=\"" + CTA + "\"><strong>Créer mon alerte</strong></a>.",
      },
      { type: "bridge" },
      {
        type: "h2",
        text: "1. Ce que les portails ne vous disent pas",
      },
      {
        type: "ul",
        items: [
          "Beaucoup d’annonces sont des « tests de prix » ou déjà sous compromis",
          "Les 15 % sous le marché partent avant d’être vraiment en ligne",
          "Les doublons (même bien, trois agences) gonflent le stock",
          "Sans téléphone joignable, vous êtes un favori de plus, pas un dossier",
        ],
      },
      {
        type: "h2",
        text: "2. Une recherche utile tient en quatre champs",
      },
      {
        type: "p",
        text: "Ville (ou 2–3 communes), type, budget max, pièces min. Le reste (étage, extérieur, DPE) affine au rappel. Inutile de remplir un questionnaire de 11 étapes pour exister : <strong>téléphone + e-mail</strong> suffisent à déclencher l’alerte. Pages villes : <a href=\"../recherche-bien/\">recherche de bien</a>.",
      },
      {
        type: "h2",
        text: "3. Coller une URL déjà vue",
      },
      {
        type: "p",
        text: "Vous avez déjà un lien Leboncoin ou SeLoger sous les yeux ? Collez-le avec vos coordonnées : on enregistre <em>votre</em> intérêt (visite / offre), pas le téléphone du vendeur. Pas de scraping. Voir <a href=\"./alerte-immobilier-acquereur-avant-les-autres.html\">alerte avant les autres</a>.",
      },
      { type: "bridge" },
      {
        type: "h2",
        text: "4. Prêt : après le bien, pas avant la recherche",
      },
      {
        type: "p",
        text: "Caler une enveloppe aide à ne pas visiter hors budget — ce n’est pas un ticket d’entrée pour l’alerte. <a href=\"../landings/projection-achat.html\">Coût réel de l’achat</a> · <a href=\"./pret-immobilier-refuse-que-faire-2026.html\">prêt refusé</a> si une banque a déjà dit non.",
      },
      {
        type: "p",
        text: "<a href=\"" + CTA + "\"><strong>Créer mon alerte acquéreur</strong></a> — on vous prévient, vous arrêtez de scroller.",
      },
    ],
  },
  {
    file: "visite-immobiliere-checklist-acquereur.html",
    section: "habitat",
    tag: "Acquéreur",
    tagClass: "tag-actu",
    themes: ["acquereur", "immobilier"],
    title: "Visite immobilière : checklist acquéreur (ce qu’il faut regarder)",
    description:
      "Visite d’appartement ou de maison : bruit, copro, DPE, travaux, questions au vendeur. Checklist concrète pour un acquéreur en France.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Visite : 20 points à checker pour ne pas signer un problème.",
    keywords: [
      "visite immobilière",
      "checklist visite appartement",
      "que regarder visite maison",
      "visite bien immobilier conseils",
      "acquéreur visite checklist",
    ],
    cta: { href: CTA, label: "Être alerté pour visiter" },
    heroImage: {
      src: "./images/habitat/bailleur-cles.jpg",
      alt: "Clés d'un logement — visite acquéreur",
      caption: "Une visite utile se prépare : questions, photos, copro.",
    },
    blocks: [
      {
        type: "p",
        text: "Une visite de 20 minutes mal préparée coûte un compromis. Cette <strong>checklist acquéreur</strong> tient dans le téléphone : structure, copro, diagnostics, voisinage, financement. Objectif : décider vite, sans se faire doubler. <a href=\"" + CTA + "\"><strong>Être alerté dès qu’un mandat match</strong></a>.",
      },
      { type: "bridge" },
      {
        type: "h2",
        text: "1. Avant d’entrer",
      },
      {
        type: "ul",
        items: [
          "Rue à l’heure de pointe (bruit, stationnement, écoles)",
          "Façade, toiture, ravalement voté ou à venir",
          "Étage, ascenseur, caves / parkings accessibles",
          "DPE et diagnostics déjà demandés par mail",
        ],
      },
      {
        type: "h2",
        text: "2. Dans le logement",
      },
      {
        type: "ul",
        items: [
          "Humidité, fissures, traces d’infiltration (plafonds, pieds de mur)",
          "Orientation, double vitrage, VMC qui tourne vraiment",
          "Électricité (tableau, prises), plomberie (pression, évacuation)",
          "Rangements réels vs photos « vides » de l’annonce",
          "Charges : chauffage collectif, copro, taxe foncière si le vendeur la connaît",
        ],
      },
      {
        type: "h2",
        text: "3. Copropriété et papiers",
      },
      {
        type: "p",
        text: "Demandez les 3 derniers PV d’AG, le carnet d’entretien, le fonds travaux, les procédures en cours. Un ravalement ou un ascenseur à changer change le budget autant qu’un taux. Projetez le coût mensuel : <a href=\"../landings/projection-achat.html\">prêt + charges</a>.",
      },
      {
        type: "h2",
        text: "4. Après la visite",
      },
      {
        type: "p",
        text: "Notez à chaud (photos + 5 lignes). Si ça match : offre cadrée, pas une « marque d’intérêt » vague. Guide : <a href=\"./offre-achat-immobilier-negocier-sans-se-faire-doubler.html\">offre d’achat</a>. Pas encore de bien ? <a href=\"./alerte-immobilier-acquereur-avant-les-autres.html\">alerte</a> pour la prochaine visite.",
      },
      { type: "bridge" },
      {
        type: "p",
        text: "<a href=\"" + CTA + "\"><strong>Créer mon alerte visite</strong></a> — on vous prévient, vous arrivez avec la checklist.",
      },
    ],
  },
  {
    file: "offre-achat-immobilier-negocier-sans-se-faire-doubler.html",
    section: "habitat",
    tag: "Acquéreur",
    tagClass: "tag-actu",
    themes: ["acquereur", "immobilier"],
    title: "Offre d’achat immobilier : négocier sans se faire doubler",
    description:
      "Prix, conditions suspensives, délai, financement : comment un acquéreur pose une offre sérieuse en France sans surenchère aveugle.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Offre d’achat : dossier, prix, délais — pour ne plus arriver second.",
    keywords: [
      "offre d'achat immobilier",
      "faire une offre d'achat",
      "négocier prix appartement",
      "offre d'achat conditions suspensives",
      "acquéreur offre sérieuse",
    ],
    cta: { href: CTA, label: "Être prêt à offrir" },
    heroImage: {
      src: "./images/finance/credit-immo-cles.jpg",
      alt: "Clés et crédit — offre d'achat",
      caption: "Une offre tient si le financement et les délais sont clairs.",
    },
    blocks: [
      {
        type: "p",
        text: "Le vendeur choisit rarement « celui qui aime le plus le parquet ». Il choisit l’offre <strong>finançable, datée, complète</strong>. Arrivez second et vous relancez trois mois de recherche. Voici comment poser une offre d’acquéreur sans surpayer. <a href=\"" + CTA + "\"><strong>Alerte pour ne pas rater le bien</strong></a>.",
      },
      { type: "bridge" },
      {
        type: "h2",
        text: "1. Ce que contient une offre sérieuse",
      },
      {
        type: "ul",
        items: [
          "Prix net vendeur ou FAI, écrit, avec date de validité (48–72 h)",
          "Condition suspensive de prêt (montant, durée, taux max) — ou sans prêt si cash",
          "Délai de compromis et date d’entrée souhaitée",
          "Contact joignable (tél. + e-mail) : le notaire / l’agence rappelle le jour même",
        ],
      },
      {
        type: "h2",
        text: "2. Négocier le prix sans perdre le bien",
      },
      {
        type: "p",
        text: "Un -8 % « pour voir » sur un bien juste prix fait gagner l’offre voisine. Ancrez-vous sur DPE, travaux, copro, délai de vente du vendeur — pas sur un ressenti. Si le marché est tendu (Paris, Lyon, Bordeaux, Nantes…), un prix d’annonce propre + dossier prêt bat une négociation agressive.",
      },
      {
        type: "h2",
        text: "3. Le financement, sans en faire un mur",
      },
      {
        type: "p",
        text: "L’alerte n’exige pas un accord de prêt. L’offre, si. Une simulation à jour (capacité, apport, assurance) rassure. Refus précédent ? <a href=\"./pret-immobilier-refuse-que-faire-2026.html\">solutions 2e chance</a>. Projection charges : <a href=\"../landings/projection-achat.html\">coût réel</a>.",
      },
      { type: "bridge" },
      {
        type: "h2",
        text: "4. Ne plus arriver après l’offre",
      },
      {
        type: "p",
        text: "Le vrai levier n’est pas de scroller plus vite : c’est d’être <strong>prévenu plus tôt</strong>. Alerte ville + contact, checklist visite, offre prête. Cluster : <a href=\"./alerte-immobilier-acquereur-avant-les-autres.html\">alerte</a> · <a href=\"./visite-immobiliere-checklist-acquereur.html\">visite</a> · <a href=\"./acheter-appartement-sans-passer-des-mois-sur-seloger.html\">sortir des portails</a>.",
      },
      {
        type: "p",
        text: "<a href=\"" + CTA + "\"><strong>Créer mon alerte acquéreur</strong></a> — téléphone + e-mail, on vous prévient.",
      },
    ],
  },
];
