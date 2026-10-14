/**
 * Pages produit assurance — inspire external/Assurance/* multisite
 */
window.ExternalProductPage = {
  PRODUCTS: {
    sante: {
      title: "Assurance Santé",
      icon: "❤️",
      gradient: "linear-gradient(135deg,#db2777,#be185d)",
      type: "sante",
      intro: "Étude de complémentaire santé selon votre profil et les offres partenaires disponibles.",
      features: ["Analyse du besoin", "Comparaison sur dossier", "Garanties selon partenaire", "Devis après étude"],
    },
    "rc-pro": {
      title: "RC Professionnelle",
      icon: "💼",
      gradient: "linear-gradient(135deg,#2563eb,#1d4ed8)",
      type: "rc-pro",
      intro: "Étude de responsabilité professionnelle selon votre activité et votre éligibilité.",
      features: ["Analyse de l'activité", "Garanties selon métier", "Étude partenaire", "Devis après vérification"],
    },
    prevoyance: {
      title: "Prévoyance",
      icon: "🛡️",
      gradient: "linear-gradient(135deg,#7c3aed,#5b21b6)",
      type: "prevoyance",
      intro: "Étude de prévoyance selon votre situation personnelle et professionnelle.",
      features: ["Analyse des besoins", "Options selon éligibilité", "Étude médicale si requise", "Devis après dossier"],
    },
    decennale: {
      title: "Décennale",
      icon: "🏗️",
      gradient: "linear-gradient(135deg,#ea580c,#c2410c)",
      type: "decennale",
      intro: "Étude d'assurance professionnelle du bâtiment selon activité déclarée.",
      features: ["Analyse activité", "Documents professionnels", "Éligibilité partenaire", "Devis après étude"],
    },
    flotte: {
      title: "Flotte automobile",
      icon: "🚛",
      gradient: "linear-gradient(135deg,#0891b2,#0e7490)",
      type: "flotte",
      intro: "Étude de solution flotte selon le nombre de véhicules et l'usage déclaré.",
      features: ["Inventaire véhicules", "Analyse usages", "Étude sinistralité", "Proposition selon partenaire"],
    },
    cyber: {
      title: "Cyber-assurance",
      icon: "🔐",
      gradient: "linear-gradient(135deg,#4338ca,#312e81)",
      type: "rc-pro",
      intro: "Étude de couverture cyber selon votre exposition numérique.",
      features: ["Analyse de l'activité", "Questionnaire cyber", "Options selon partenaire", "Devis après étude"],
    },
    vie: {
      title: "Assurance Vie",
      icon: "🌱",
      gradient: "linear-gradient(135deg,#16a34a,#15803d)",
      type: "prevoyance",
      intro: "Étude patrimoniale selon vos objectifs, horizon et profil de risque.",
      features: ["Analyse objectifs", "Profil investisseur", "Supports selon contrat", "Conseil avant souscription"],
    },
    moto: {
      title: "Assurance Moto",
      icon: "🏍️",
      gradient: "linear-gradient(135deg,#dc2626,#991b1b)",
      type: "auto",
      intro: "Étude d'assurance deux-roues selon véhicule, usage et historique conducteur.",
      features: ["Analyse véhicule", "Usage déclaré", "Historique assurance", "Garanties selon partenaire"],
    },
    pno: {
      title: "PNO / GLI",
      icon: "🏠",
      gradient: "linear-gradient(135deg,#0d9488,#115e59)",
      type: "habitation",
      intro: "Étude de protection bailleur selon le bien et la situation locative.",
      features: ["Analyse du bien", "Situation locative", "Options selon partenaire", "Devis après étude"],
    },
    "sante-collective": {
      title: "Santé collective",
      icon: "🏢",
      gradient: "linear-gradient(135deg,#ec4899,#be185d)",
      type: "sante",
      intro: "Étude de santé collective selon effectif, convention collective et budget.",
      features: ["Analyse effectif", "Convention collective", "Options selon contrat", "Devis après vérification"],
    },
    "prevoyance-collective": {
      title: "Prévoyance collective",
      icon: "👥",
      gradient: "linear-gradient(135deg,#8b5cf6,#6d28d9)",
      type: "prevoyance",
      intro: "Étude de prévoyance collective selon la structure et les obligations applicables.",
      features: ["Analyse entreprise", "Catégories de personnel", "Garanties selon partenaire", "Devis après étude"],
    },
    "gestion-locative": {
      title: "Gestion locative pro",
      icon: "🔑",
      gradient: "linear-gradient(135deg,#f59e0b,#d97706)",
      type: "habitation",
      intro: "Étude de protection locative selon les biens et les contrats existants.",
      features: ["Analyse parc immobilier", "Documents locatifs", "Options selon éligibilité", "Étude partenaire"],
    },
  },

  render: function (slug) {
    var p = this.PRODUCTS[slug];
    if (!p) {
      document.body.innerHTML = "<p>Produit inconnu</p>";
      return;
    }
    document.title = p.title + " | Leads Opportunities";
    var root = document.getElementById("productRoot");
    if (!root) return;
    root.innerHTML =
      '<header class="product-hero" style="background:' +
      p.gradient +
      '"><a href="../assurance.html" class="product-back">← Assurance</a><span class="product-icon">' +
      p.icon +
      "</span><h1>" +
      p.title +
      "</h1><p>" +
      p.intro +
      '</p><a class="product-cta" href="../devis-wizard.html?type=' +
      encodeURIComponent(p.type) +
      '">Demander une étude</a></header>' +
      '<main class="product-main"><h2>Points étudiés</h2><ul class="product-features">' +
      p.features
        .map(function (f) {
          return "<li>" + f + "</li>";
        })
        .join("") +
      '</ul><p><a href="../devis-wizard.html?type=' +
      encodeURIComponent(p.type) +
      '" class="product-cta-inline" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#6366f1;color:#fff;border-radius:10px;text-decoration:none;font-weight:600">Demander une étude</a></p>' +
      '<p><a href="../devis-wizard.html?type=' +
      encodeURIComponent(p.type) +
      '">Compléter le questionnaire →</a></p></main>';
  },
};
