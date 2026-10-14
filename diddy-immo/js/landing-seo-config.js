/**
 * Mots-cles et contenus SEO par page landing / parcours devis.
 */
(function (global) {
  var ORIGIN = "https://www.leadsopportunities.fr";

  var PAGES = {
    index: {
      title: "Parcours devis en ligne | Assurance et credit immo",
      description:
        "Tous les parcours devis Leads Opportunities : assurance VTC, mutuelle sante, credit immobilier, animaux et 30+ questionnaires. Devis gratuit, courtier ORIAS.",
      keywords:
        "parcours devis, devis assurance en ligne, devis mutuelle, simulation credit immo, questionnaire assurance, courtier ORIAS",
      badge: "Parcours devis",
      h1: "Parcours de devis en ligne : assurance et financement",
      intro:
        "Choisissez le parcours adapte a votre besoin : formulaire express, questionnaire complet ou devis personnalise par produit. Chaque parcours prepare votre dossier pour un conseiller dedie.",
      sections: [
        {
          h2: "Devis assurance VTC et mobilite",
          text: "Devis assurance VTC, tarif chauffeur, RC pro, Uber Bolt Heetch, bonus-malus et creation d activite VTC.",
          links: [
            { href: "/landings/vtc.html", label: "Questionnaire VTC complet" },
            { href: "/landings/devis-rapide.html", label: "Devis VTC express" },
            { href: "/assurance-vtc/", label: "Guide assurance VTC" },
          ],
        },
        {
          h2: "Mutuelle sante et prevoyance",
          text: "Comparatif mutuelle sante, devis assurance sante, remboursement optique dentaire, mutuelle famille et petit budget.",
          links: [
            { href: "/landings/sante.html", label: "Comparatif mutuelle" },
            { href: "/landings/questionnaire.html?need=prevoyance", label: "Prevoyance" },
            { href: "/assurance-sante/", label: "Guide mutuelle" },
          ],
        },
        {
          h2: "Credit immobilier et financement",
          text: "Simulation credit immo, courtier pret immobilier, rachat de credit, capacite d emprunt et taux 2026.",
          links: [
            { href: "/landings/projection-achat.html", label: "Cout reel du logement" },
            { href: "/landings/credit-immo.html", label: "Simulation credit immo" },
            { href: "/landings/questionnaire.html?need=rachat", label: "Rachat de credit" },
            { href: "/credit-immo/", label: "Guide credit immo" },
          ],
        },
      ],
      faq: [
        {
          q: "Quel parcours devis choisir ?",
          a: "Express pour un rappel rapide, questionnaire complet pour un tarif precis, ou le hub produit pour les 30+ prestations.",
        },
        {
          q: "Les devis sont-ils gratuits ?",
          a: "Oui, sans engagement. Courtier ORIAS n 15005935.",
        },
      ],
    },
    vtc: {
      keywords:
        "devis assurance vtc, assurance vtc tarif, assurance chauffeur vtc, auto pro vtc, rc pro vtc, uber bolt assurance, bonus malus vtc, creation activite vtc",
      sections: [
        {
          h2: "Devis assurance VTC via Auto Pro",
          text: "Usage professionnel declare des le devis. Comparez garanties, franchises et tarif VTC. Devis Express ou questionnaire complet : vehicule, antecedents, plateformes Uber Bolt Heetch.",
        },
        {
          h2: "Formules auto pour chauffeurs",
          text: "Auto Pro pour l activite VTC, Auto Standard pour usage personnel, Auto Aggrave pour profils a risque. Tarificateur unique et suivi sinistre en ligne.",
        },
      ],
      pillar: "/assurance-vtc/",
    },
    "devis-rapide": {
      keywords:
        "devis vtc rapide, rappel assurance vtc, devis express chauffeur, assurance vtc 30 secondes",
      sections: [
        {
          h2: "Devis VTC express",
          text: "Demande de rappel prioritaire puis questionnaire complet pour affiner tarif assurance VTC et garanties.",
        },
      ],
      pillar: "/assurance-vtc/devis-rapide/",
    },
    "sante-collective": {
      keywords:
        "mutuelle collective entreprise, devis mutuelle collective, complementaire sante entreprise, ANI mutuelle obligatoire, mutuelle PME TPE, convention collective sante, courtier ORIAS",
      sections: [
        {
          h2: "Mutuelle collective : couvrir tous vos salaries",
          text: "Etude selon effectif, convention collective et budget employeur. Comparatif des niveaux de garanties (ANI, panier de soins) et accompagnement mise en place (DUE, adhesion salarie).",
        },
        {
          h2: "TPE, PME et ETI",
          text: "Devis express pour un premier chiffrage ou questionnaire complet pour une mise en concurrence. Partenaires distributeurs collectif via notre reseau courtier.",
        },
      ],
      pillar: "/assurances/",
    },
    sante: {
      keywords:
        "devis assurance sante, comparatif mutuelle sante, mutuelle sante prix, april sante optimale, mutuelle famille, remboursement optique dentaire, marketplace sante",
      sections: [
        {
          h2: "Marketplace sante : 12+ formules comparees",
          text: "APRIL Sante Optimale, Flexi, Vita, Serenite, Malakoff Humanis, Senior GAN et autres. Comparatif par poste : hospitalisation, dentaire, optique, soins courants.",
        },
        {
          h2: "Parcours en 3 etapes",
          text: "Infos projet, liste des offres, envoi du comparatif. Migration possible si deja adherent. Promo € gagnants et Espace Assure avec Doctolib.",
        },
      ],
      pillar: "/assurance-sante/",
    },
    "credit-immo": {
      keywords:
        "simulation credit immo, courtier pret immobilier, assurance emprunteur, april reprise, capacite emprunt, taux credit immobilier, rachat credit immobilier",
      sections: [
        {
          h2: "Credit immo + assurance emprunteur",
          text: "Faisabilite via La Centrale de Financement. Comparatif assurance de pret : Equilibre, Essentiel, Integrale, Optimum+, Horizon, APRIL Reprise.",
        },
        {
          h2: "Accompagnement de bout en bout",
          text: "Simulation gratuite, estimation des economies emprunteur, conseiller unique jusqu a la signature chez le notaire.",
        },
      ],
      pillar: "/credit-immo/",
    },
    "projection-achat": {
      keywords:
        "cout reel achat immobilier, simulateur pret immobilier, taxe fonciere, charges electricite gaz eau, travaux renovation, reste a vivre, capacite emprunt, apport personnel",
      sections: [
        {
          h2: "Au-dela de la mensualite",
          text: "Le pret n est qu une ligne. Taxe fonciere, energie, eau, copro, travaux et assurance habitation forment le vrai budget mensuel du proprietaire.",
        },
        {
          h2: "Salaire, apport, patrimoine",
          text: "Le simulateur croise endettement HCSF 35 %, reste a vivre et coussin d epargne apres apport — pour voir si le dossier tient et si vous vous en sortez au quotidien.",
        },
      ],
      pillar: "/credit-immo/",
    },
    devis: {
      keywords:
        "demande de devis assurance, questionnaire devis personnalise, devis financement, courtier devis gratuit",
      sections: [
        {
          h2: "Devis personnalise par produit",
          text: "Questionnaire adapte a votre prestation : mobilite, sante, habitat, credit, professionnel, patrimoine.",
        },
      ],
    },
    questionnaire: {
      keywords:
        "questionnaire assurance, devis en ligne toutes assurances, devis auto habitation rc pro, comparateur courtier",
      sections: [
        {
          h2: "Questionnaire universel assurance et credit",
          text: "Plus de 30 prestations : auto, moto, flotte, mutuelle, habitation, emprunteur, RC pro, animaux, niches.",
        },
      ],
      pillar: "/assurances/",
    },
    animaux: {
      keywords:
        "devis assurance animaux, assurance chien, assurance chat, frais veterinaires, mutuelle animaux comparatif",
      sections: [
        {
          h2: "Devis assurance chien et chat",
          text: "Parcours animaux : formule, franchise, plafond veterinaire et rappel conseiller.",
        },
      ],
      pillar: "/assurance-animaux/",
    },
    "animaux-express": {
      keywords: "devis assurance animaux rapide, assurance chiot chaton, devis chien express",
      sections: [
        {
          h2: "Devis animaux express",
          text: "Demande rapide puis affinage du devis assurance animaux.",
        },
      ],
      pillar: "/assurance-animaux/",
    },
  };

  function slugFromPath(pathname) {
    var m = (pathname || "").match(/\/landings\/([^/?#]+)/i);
    if (!m) return null;
    return m[1].replace(/\.html$/i, "");
  }

  function getBySlug(slug) {
    return PAGES[slug] || null;
  }

  function buildForService(service) {
    if (!service) return null;
    var cat = service.category || "assurance";
    var label = service.label || "Devis";
    return {
      title: "Devis " + label + " en ligne | Leads Opportunities",
      description:
        "Devis " +
        label.toLowerCase() +
        " gratuit : questionnaire adapte, conseiller ORIAS, reponse rapide sans engagement.",
      keywords:
        "devis " +
        label.toLowerCase() +
        ", " +
        label.toLowerCase() +
        " prix, " +
        label.toLowerCase() +
        " comparatif, courtier ORIAS, " +
        cat,
      sections: [
        {
          h2: "Devis " + label,
          text:
            "Parcours devis intelligent pour " +
            label.toLowerCase() +
            " : vos reponses structurent la demande et accelerent le rappel conseiller.",
        },
      ],
    };
  }

  global.LANDING_SEO_CONFIG = {
    ORIGIN: ORIGIN,
    PAGES: PAGES,
    slugFromPath: slugFromPath,
    getBySlug: getBySlug,
    buildForService: buildForService,
  };
})(typeof window !== "undefined" ? window : global);
