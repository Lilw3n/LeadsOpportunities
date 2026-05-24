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
      tagline: "Comparatif Zéphir, Solly Azar, 2M2A — devis professionnel",
      features: [
        "RC professionnelle VTC & taxi",
        "Dommages tous accidents / tiers",
        "Protection juridique & assistance 0 km",
        "Franchises adaptées activité VTC",
        "Conducteur secondaire / remplaçant",
        "Flotte & multi-véhicules",
      ],
      docs: "KBIS, carte grise, permis, relevé d'information, carte VTC, RIB.",
    },
    auto: {
      title: "Assurance Automobile",
      icon: "🚗",
      gradient: "linear-gradient(135deg,#2563eb,#1d4ed8)",
      type: "auto",
      tagline: "Tous risques, tiers+, jeunes conducteurs — devis en 90 secondes",
      features: [
        "Tous risques premium & valeur à neuf",
        "Bonus malus protégé (1 sinistre NR sans malus)",
        "Assistance 0 km & véhicule de remplacement",
        "Bris de glace sans franchise réseau agréé",
        "Vol, incendie, catastrophes naturelles",
        "Défense recours & protection juridique",
      ],
      docs: "Permis, carte grise, relevé d'information, RIB.",
    },
    habitation: {
      title: "Assurance Habitation",
      icon: "🏠",
      gradient: "linear-gradient(135deg,#059669,#047857)",
      type: "habitation",
      tagline: "Propriétaire, locataire, PNO — protection complète du logement",
      features: [
        "Incendie, dégâts des eaux, catastrophes",
        "Vol, vandalisme, bris de glace",
        "Responsabilité civile vie privée",
        "Protection juridique habitation",
        "Assistance dépannage 24h/24",
        "Option objets de valeur & jardin",
      ],
      docs: "Adresse du bien, surface, année construction, sinistres 3 ans.",
    },
    "rc-pro": {
      title: "RC Professionnelle",
      icon: "💼",
      gradient: "linear-gradient(135deg,#4338ca,#312e81)",
      type: "rc-pro",
      tagline: "Protégez votre activité et votre patrimoine personnel",
      features: [
        "RC exploitation & après livraison",
        "Dommages corporels & matériels",
        "Défense recours & protection juridique",
        "RC locative des locaux",
        "Cyber option (extension)",
        "Franchises adaptées à votre métier",
      ],
      docs: "KBIS, description activité, CA, effectif, sinistres.",
    },
    sante: {
      title: "Assurance Santé",
      icon: "❤️",
      gradient: "linear-gradient(135deg,#db2777,#be185d)",
      type: "sante",
      tagline: "Mutuelle sur-mesure — remboursements optimisés",
      features: [
        "Hospitalisation & chambre particulière",
        "Dentaire & optique renforcés",
        "Médecines douces & prévention",
        "Téléconsultation incluse",
        "Options famille & enfants",
        "Tiers payant généralisé",
      ],
      docs: "Carte vitale, contrat actuel si reprise.",
    },
    cyber: {
      title: "Assurance Cyber",
      icon: "🔐",
      gradient: "linear-gradient(135deg,#7c3aed,#4c1d95)",
      type: "rc-pro",
      tagline: "Protection ransomware, fuite de données & interruption d'activité",
      features: [
        "Ransomware & extorsion cyber",
        "Fuite de données personnelles (RGPD)",
        "Interruption d'activité IT",
        "Assistance forensic 24h/24",
        "Notification clients & autorités",
        "Cyber responsabilité civile",
      ],
      docs: "Description SI, CA, effectif, historique incidents.",
    },
    decennale: {
      title: "Assurance Décennale",
      icon: "🏗️",
      gradient: "linear-gradient(135deg,#ea580c,#c2410c)",
      type: "decennale",
      tagline: "Obligatoire BTP — dommages ouvrage & responsabilité décennale",
      features: [
        "Garantie décennale obligatoire",
        "Dommages ouvrage (DO)",
        "RC professionnelle chantier",
        "Protection juridique BTP",
        "Extension sous-traitance",
        "Attestation instantanée",
      ],
      docs: "KBIS, qualifications, chiffre d'affaires, sinistres 5 ans.",
    },
    flotte: {
      title: "Assurance Flotte",
      icon: "🚛",
      gradient: "linear-gradient(135deg,#0891b2,#0e7490)",
      type: "auto",
      tagline: "Multi-véhicules pro — gestion centralisée & tarifs dégressifs",
      features: [
        "Gestion flotte centralisée",
        "Tarifs dégressifs volume",
        "Conducteur nommé / tous conducteurs",
        "Assistance 0 km flotte",
        "Gestion sinistres dédiée",
        "Reporting & télématique",
      ],
      docs: "Liste véhicules, cartes grises, conducteurs, sinistres.",
    },
    moto: {
      title: "Assurance Moto / Deux-roues",
      icon: "🏍️",
      gradient: "linear-gradient(135deg,#dc2626,#991b1b)",
      type: "auto",
      tagline: "Scooter, moto, quad — tous risques & tiers+",
      features: [
        "Tous risques & tiers étendu",
        "Équipement pilote & casque",
        "Vol & vandalisme renforcés",
        "Assistance 0 km deux-roues",
        "Permis A/A2 — jeunes conducteurs",
        "Garage sécurisé — réduction",
      ],
      docs: "Permis, carte grise, relevé d'information.",
    },
    pno: {
      title: "PNO — Propriétaire Non Occupant",
      icon: "🔑",
      gradient: "linear-gradient(135deg,#0d9488,#115e59)",
      type: "habitation",
      tagline: "Louez sereinement — protection du bien non occupé",
      features: [
        "Incendie, dégâts des eaux, catastrophes",
        "RC propriétaire bailleur",
        "Vacance locative (option)",
        "Protection juridique bailleur",
        "Assistance locataire défaillant",
        "Couverture multi-biens",
      ],
      docs: "Adresse bien, type location, loyer, surface.",
    },
    prevoyance: {
      title: "Prévoyance Individuelle",
      icon: "🛡️",
      gradient: "linear-gradient(135deg,#6366f1,#4338ca)",
      type: "sante",
      tagline: "Décès, invalidité, arrêt de travail — sécurisez vos revenus",
      features: [
        "Capital décès & rente conjoint",
        "Indemnités journalières arrêt maladie",
        "Invalidité permanente totale/partielle",
        "Options TNS & indépendants",
        "Franchises adaptées métier",
        "Rachat exclusions médicales",
      ],
      docs: "Revenus, profession, antécédents médicaux.",
    },
    vie: {
      title: "Assurance Vie & Épargne",
      icon: "💎",
      gradient: "linear-gradient(135deg,#a855f7,#7e22ce)",
      type: "sante",
      tagline: "Transmission, retraite, épargne — contrats sur-mesure",
      features: [
        "Contrats en euros & UC",
        "Optimisation fiscale (PEA, assurance-vie)",
        "Transmission patrimoine",
        "Retraite supplémentaire Madelin",
        "Arbitrages automatiques",
        "Sortie en rente ou capital",
      ],
      docs: "Objectif épargne, horizon, profil risque.",
    },
    "gestion-locative": {
      title: "Gestion Locative Assurée",
      icon: "🏘️",
      gradient: "linear-gradient(135deg,#64748b,#334155)",
      type: "habitation",
      tagline: "PNO + GLI + protection revenus locatifs",
      features: [
        "Garantie loyers impayés (GLI)",
        "PNO multi-lots",
        "Protection juridique bailleur",
        "Vacance locative",
        "Dommages locataire",
        "Assistance gestion locative",
      ],
      docs: "Baux, loyers, adresses biens, antécédents locataires.",
    },
    "sante-collective": {
      title: "Mutuelle Collective Entreprise",
      icon: "🏢",
      gradient: "linear-gradient(135deg,#db2777,#9d174d)",
      type: "sante",
      tagline: "Obligation employeur — contrats collectifs sur-mesure",
      features: [
        "Conformité obligation ANI",
        "Panachage options salariés",
        "Portabilité & maintien garanties",
        "Tiers payant entreprise",
        "Prévention & téléconsultation",
        "Tarifs dégressifs effectif",
      ],
      docs: "Effectif, convention collective, budget employeur.",
    },
    "prevoyance-collective": {
      title: "Prévoyance Collective",
      icon: "👥",
      gradient: "linear-gradient(135deg,#2563eb,#1e40af)",
      type: "sante",
      tagline: "Protection sociale complémentaire entreprise",
      features: [
        "Décès & invalidité collectif",
        "Indemnités journalières salariés",
        "Maintien salaire cadres/dirigeants",
        "Options TNS dirigeants",
        "Conformité CCN",
        "Délégation de gestion",
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
      '">Devis instantané IA</button><a class="btn-outline" href="../devis-wizard.html?type=' +
      encodeURIComponent(p.type) +
      '">Wizard complet</a></div></header>' +
      '<main class="prod-main"><h2>Garanties &amp; services</h2><ul class="prod-features">' +
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
