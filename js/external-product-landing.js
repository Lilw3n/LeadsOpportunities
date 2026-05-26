/**
 * Landing produit assurance riche — inspire pages Assurance/* multisite
 */
window.ExternalProductLanding = {
  PAGES: {
    "vtc-taxi": {
      title: "Assurance VTC / Taxi",
      icon: "🚡",
      gradient: "linear-gradient(135deg,#0d9488,#6366f1)",
      type: "vtc-taxi",
      tagline: "Étude VTC / taxi selon votre dossier et les partenaires disponibles",
      features: [
        "Analyse de l'activité déclarée",
        "Étude des garanties selon partenaire",
        "Vérification des documents utiles",
        "Devis après étude du dossier",
      ],
      docs: "KBIS, carte grise, permis, relevé d'information, carte VTC, RIB.",
    },
    auto: {
      title: "Assurance Automobile",
      icon: "🚗",
      gradient: "linear-gradient(135deg,#2563eb,#1d4ed8)",
      type: "auto",
      tagline: "Étude automobile selon véhicule, usage et historique conducteur",
      features: [
        "Analyse du véhicule",
        "Étude de l'usage déclaré",
        "Vérification des antécédents",
        "Garanties selon partenaire",
      ],
      docs: "Permis, carte grise, relevé d'information, RIB.",
    },
    habitation: {
      title: "Assurance Habitation",
      icon: "🏠",
      gradient: "linear-gradient(135deg,#059669,#047857)",
      type: "habitation",
      tagline: "Étude habitation selon votre logement et votre statut",
      features: [
        "Analyse du logement",
        "Statut occupant ou bailleur",
        "Options selon partenaire",
        "Devis après vérification",
      ],
      docs: "Adresse du bien, surface, année construction, sinistres 3 ans.",
    },
    "rc-pro": {
      title: "RC Professionnelle",
      icon: "💼",
      gradient: "linear-gradient(135deg,#4338ca,#312e81)",
      type: "rc-pro",
      tagline: "Étude RC professionnelle selon votre activité",
      features: [
        "Analyse du métier",
        "Chiffre d'affaires et effectif",
        "Garanties selon partenaire",
        "Devis après étude",
      ],
      docs: "KBIS, description activité, CA, effectif, sinistres.",
    },
    sante: {
      title: "Assurance Santé",
      icon: "❤️",
      gradient: "linear-gradient(135deg,#db2777,#be185d)",
      type: "sante",
      tagline: "Étude santé selon votre profil et votre budget",
      features: [
        "Analyse du foyer",
        "Besoins de remboursement",
        "Options selon partenaire",
        "Comparaison après dossier",
      ],
      docs: "Carte vitale, contrat actuel si reprise.",
    },
    cyber: {
      title: "Assurance Cyber",
      icon: "🔐",
      gradient: "linear-gradient(135deg,#7c3aed,#4c1d95)",
      type: "rc-pro",
      tagline: "Étude cyber selon votre exposition numérique",
      features: [
        "Analyse de l'activité",
        "Questionnaire cyber",
        "Options selon partenaire",
        "Devis après vérification",
      ],
      docs: "Description SI, CA, effectif, historique incidents.",
    },
    decennale: {
      title: "Assurance Décennale",
      icon: "🏗️",
      gradient: "linear-gradient(135deg,#ea580c,#c2410c)",
      type: "decennale",
      tagline: "Étude BTP selon activité, qualifications et historique",
      features: [
        "Analyse des activités déclarées",
        "Vérification des qualifications",
        "Documents professionnels",
        "Étude partenaire avant proposition",
      ],
      docs: "KBIS, qualifications, chiffre d'affaires, sinistres 5 ans.",
    },
    flotte: {
      title: "Assurance Flotte",
      icon: "🚛",
      gradient: "linear-gradient(135deg,#0891b2,#0e7490)",
      type: "auto",
      tagline: "Étude flotte selon parc, conducteurs et usages",
      features: [
        "Inventaire véhicules",
        "Analyse conducteurs",
        "Historique sinistres",
        "Étude partenaire",
      ],
      docs: "Liste véhicules, cartes grises, conducteurs, sinistres.",
    },
    moto: {
      title: "Assurance Moto / Deux-roues",
      icon: "🏍️",
      gradient: "linear-gradient(135deg,#dc2626,#991b1b)",
      type: "auto",
      tagline: "Étude deux-roues selon véhicule et conducteur",
      features: [
        "Analyse du deux-roues",
        "Usage déclaré",
        "Historique conducteur",
        "Garanties selon partenaire",
      ],
      docs: "Permis, carte grise, relevé d'information.",
    },
    pno: {
      title: "PNO — Propriétaire Non Occupant",
      icon: "🔑",
      gradient: "linear-gradient(135deg,#0d9488,#115e59)",
      type: "habitation",
      tagline: "Étude PNO selon le bien et la situation locative",
      features: [
        "Analyse du bien",
        "Situation locative",
        "Options selon partenaire",
        "Devis après étude",
      ],
      docs: "Adresse bien, type location, loyer, surface.",
    },
    prevoyance: {
      title: "Prévoyance Individuelle",
      icon: "🛡️",
      gradient: "linear-gradient(135deg,#6366f1,#4338ca)",
      type: "sante",
      tagline: "Étude prévoyance selon profession et revenus",
      features: [
        "Analyse du statut professionnel",
        "Niveau de revenus",
        "Questionnaire selon partenaire",
        "Devis après étude",
      ],
      docs: "Revenus, profession, antécédents médicaux.",
    },
    vie: {
      title: "Assurance Vie & Épargne",
      icon: "💎",
      gradient: "linear-gradient(135deg,#a855f7,#7e22ce)",
      type: "sante",
      tagline: "Étude patrimoniale selon objectifs et profil de risque",
      features: [
        "Objectif d'épargne",
        "Horizon de placement",
        "Profil de risque",
        "Conseil avant souscription",
      ],
      docs: "Objectif épargne, horizon, profil risque.",
    },
    "gestion-locative": {
      title: "Gestion Locative Assurée",
      icon: "🏘️",
      gradient: "linear-gradient(135deg,#64748b,#334155)",
      type: "habitation",
      tagline: "Étude locative selon biens, baux et revenus",
      features: [
        "Analyse des baux",
        "Situation locative",
        "Documents justificatifs",
        "Options selon éligibilité",
      ],
      docs: "Baux, loyers, adresses biens, antécédents locataires.",
    },
    "sante-collective": {
      title: "Mutuelle Collective Entreprise",
      icon: "🏢",
      gradient: "linear-gradient(135deg,#db2777,#9d174d)",
      type: "sante",
      tagline: "Étude santé collective selon effectif et convention collective",
      features: [
        "Analyse de l'effectif",
        "Convention collective",
        "Budget employeur",
        "Options selon partenaire",
      ],
      docs: "Effectif, convention collective, budget employeur.",
    },
    "prevoyance-collective": {
      title: "Prévoyance Collective",
      icon: "👥",
      gradient: "linear-gradient(135deg,#2563eb,#1e40af)",
      type: "sante",
      tagline: "Étude prévoyance collective selon la structure",
      features: [
        "Analyse des catégories",
        "Masse salariale",
        "Convention collective",
        "Garanties selon partenaire",
      ],
      docs: "Effectif, masse salariale, CCN applicable.",
    },
  },

  render: function (slug) {
    var p = this.PAGES[slug];
    if (!p) return;
    document.title = p.title + " | Leads Opportunities";
    var root = document.getElementById("landingRoot");
    if (!root) return;
    root.innerHTML =
      '<header class="prod-hero" style="background:' +
      p.gradient +
      '"><a href="../assurance.html" class="prod-back">← Assurance</a><span class="prod-icon">' +
      p.icon +
      "</span><h1>" +
      p.title +
      "</h1><p>" +
      p.tagline +
      '</p><div class="prod-cta"><button type="button" class="btn-wizard" data-wizard-type="' +
      p.type +
      '">Demander une étude</button><a class="btn-outline" href="../devis-wizard.html?type=' +
      encodeURIComponent(p.type) +
      '">Questionnaire complet</a></div></header>' +
      '<main class="prod-main"><h2>Points étudiés</h2><ul class="prod-features">' +
      p.features
        .map(function (f) {
          return "<li>" + f + "</li>";
        })
        .join("") +
      '</ul><h2>Documents utiles</h2><p>' +
      p.docs +
      '</p></main><div id="wizardModal" class="wizard-modal hidden"><div class="wizard-modal-inner"><button type="button" id="closeWizard" class="wizard-close">×</button><div id="wizardEmbed"></div></div></div>';

    document.querySelector(".btn-wizard").onclick = function () {
      var modal = document.getElementById("wizardModal");
      modal.classList.remove("hidden");
      document.getElementById("wizardEmbed").innerHTML = "";
      if (window.IntelligentQuoteWizard) {
        window.IntelligentQuoteWizard.render(document.getElementById("wizardEmbed"), {
          insuranceType: p.type,
        });
      }
    };
    document.getElementById("closeWizard").onclick = function () {
      document.getElementById("wizardModal").classList.add("hidden");
    };
  },
};
