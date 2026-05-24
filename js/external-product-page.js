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
      intro: "Complémentaire santé pour optimiser vos remboursements.",
      features: ["Consultations", "Dentaire & optique", "Hospitalisation", "Pharmacie"],
    },
    "rc-pro": {
      title: "RC Professionnelle",
      icon: "💼",
      gradient: "linear-gradient(135deg,#2563eb,#1d4ed8)",
      type: "rc-pro",
      intro: "Protégez votre activité professionnelle.",
      features: ["RC exploitation", "RC après livraison", "Défense recours", "Dommages corporels"],
    },
    prevoyance: {
      title: "Prévoyance",
      icon: "🛡️",
      gradient: "linear-gradient(135deg,#7c3aed,#5b21b6)",
      type: "prevoyance",
      intro: "Sécurisez vos revenus et votre famille.",
      features: ["Décès", "Invalidité", "ITT", "Rente éducation"],
    },
    decennale: {
      title: "Décennale",
      icon: "🏗️",
      gradient: "linear-gradient(135deg,#ea580c,#c2410c)",
      type: "decennale",
      intro: "Assurance obligatoire pour le BTP.",
      features: ["Garantie décennale", "Dommages ouvrage", "RC pro BTP", "Conformité marchés"],
    },
    flotte: {
      title: "Flotte automobile",
      icon: "🚛",
      gradient: "linear-gradient(135deg,#0891b2,#0e7490)",
      type: "flotte",
      intro: "Assurez plusieurs véhicules avec un contrat unique.",
      features: ["Multi-véhicules", "Gestion centralisée", "Assistance 24/7", "Sinistres dédiés"],
    },
    cyber: {
      title: "Cyber-assurance",
      icon: "🔐",
      gradient: "linear-gradient(135deg,#4338ca,#312e81)",
      type: "rc-pro",
      intro: "Protection contre les cyberattaques et fuites de données.",
      features: ["Ransomware", "Violation de données", "Interruption d'activité", "Assistance juridique"],
    },
    vie: {
      title: "Assurance Vie",
      icon: "🌱",
      gradient: "linear-gradient(135deg,#16a34a,#15803d)",
      type: "prevoyance",
      intro: "Épargne et transmission patrimoniale.",
      features: ["Capital garanti", "Fiscalité avantageuse", "Transmission", "Sortie flexible"],
    },
    moto: {
      title: "Assurance Moto",
      icon: "🏍️",
      gradient: "linear-gradient(135deg,#dc2626,#991b1b)",
      type: "auto",
      intro: "Protégez votre deux-roues toute l'année.",
      features: ["Tous risques / Tiers", "Vol & incendie", "Assistance 0 km", "Équipement pilote"],
    },
    pno: {
      title: "PNO / GLI",
      icon: "🏠",
      gradient: "linear-gradient(135deg,#0d9488,#115e59)",
      type: "habitation",
      intro: "Propriétaire non occupant et garantie loyers impayés.",
      features: ["PNO", "GLI", "Vacance locative", "Protection revenus"],
    },
    "sante-collective": {
      title: "Santé collective",
      icon: "🏢",
      gradient: "linear-gradient(135deg,#ec4899,#be185d)",
      type: "sante",
      intro: "Mutuelle entreprise pour vos salariés.",
      features: ["Obligation employeur", "Options familiales", "Tiers payant", "Prévention"],
    },
    "prevoyance-collective": {
      title: "Prévoyance collective",
      icon: "👥",
      gradient: "linear-gradient(135deg,#8b5cf6,#6d28d9)",
      type: "prevoyance",
      intro: "Protection sociale complémentaire de votre équipe.",
      features: ["Décès / invalidité", "Maintien salaire", "Fiscalité avantageuse", "Conformité CCN"],
    },
    "gestion-locative": {
      title: "Gestion locative pro",
      icon: "🔑",
      gradient: "linear-gradient(135deg,#f59e0b,#d97706)",
      type: "habitation",
      intro: "Assurance et protection pour bailleurs professionnels.",
      features: ["GLI", "PNO", "Vacance locative", "Protection juridique"],
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
      '">Devis intelligent gratuit</a></header>' +
      '<main class="product-main"><h2>Garanties</h2><ul class="product-features">' +
      p.features
        .map(function (f) {
          return "<li>✓ " + f + "</li>";
        })
        .join("") +
      '</ul><p><a href="../devis-wizard.html?type=' +
      encodeURIComponent(p.type) +
      '" class="product-cta-inline" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#6366f1;color:#fff;border-radius:10px;text-decoration:none;font-weight:600">Devis intelligent IA</a></p>' +
      '<p><a href="../devis-wizard.html?type=' +
      encodeURIComponent(p.type) +
      '">Lancer le wizard comparatif →</a></p></main>';
  },
};
