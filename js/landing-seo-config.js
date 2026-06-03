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
        "devis assurance vtc, assurance vtc tarif, assurance chauffeur vtc, rc pro vtc, uber bolt assurance, bonus malus vtc, creation activite vtc",
      sections: [
        {
          h2: "Obtenir un devis assurance VTC adapte",
          text: "Comparez assurance VTC tarif, garanties RC pro, franchises et options perte d exploitation. Parcours intelligent : vehicule, antecedents, plateformes Uber Bolt.",
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
    sante: {
      keywords:
        "devis assurance sante, comparatif mutuelle sante, mutuelle sante prix, mutuelle famille, remboursement optique dentaire, meilleure mutuelle",
      sections: [
        {
          h2: "Comparatif mutuelle sante personnalise",
          text: "Devis mutuelle selon foyer, budget et postes hospitalisation, dentaire, optique. Courtier ORIAS sans engagement.",
        },
      ],
      pillar: "/assurance-sante/",
    },
    "credit-immo": {
      keywords:
        "simulation credit immo, courtier pret immobilier, devis credit immobilier, capacite emprunt, taux credit immobilier, rachat credit immobilier",
      sections: [
        {
          h2: "Simulation credit immobilier",
          text: "Premier avis de faisabilite, mensualites, apport et accompagnement dossier pret immobilier.",
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
