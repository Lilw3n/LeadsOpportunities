/**
 * Fiches partenaires détaillées — inspire partners/zephir & solly-azar multisite
 */
window.CrmPartnerDetail = {
  PARTNERS: {
    zephir: {
      name: "Zéphir VTC Taxi",
      logo: "🌪️",
      color: "#2563eb",
      requirements: {
        "Antécédents": "12 mois VTC, 0 mois pour Taxi",
        "Bonus": "≤ 1.50",
        "Âge": "25 à 65 ans",
        "Permis": "≥ 5 ans (3 ans conduite accompagnée)",
        "Sinistres": "Max 4 dont 1 corporel, 3 matériels, 1 stationnement, 2 bris de glace, 1 vol/incendie",
      },
      emailTemplate:
        "Bonjour,\n\nSuite à votre demande de devis VTC Zéphir, merci de nous transmettre :\n- Bonus malus\n- Ancienneté assurance VTC (12 à 33 mois selon compagnie)\n- KBIS récent (< 3 mois)\n- Carte grise et permis\n\nCordialement,\nWendy BUCHET",
    },
    "solly-azar": {
      name: "Solly Azar Pro",
      logo: "🛡️",
      color: "#059669",
      requirements: {
        "Antécédents": "Assurance pro VTC recommandée",
        "Bonus": "0.50 à 0.85",
        "Âge": "27 à 65 ans",
        "Permis": "≥ 5 ans",
        "Sinistres": "Max 2 matériels, 0 corporel responsable",
      },
      emailTemplate:
        "Bonjour,\n\nPour votre devis Solly Azar Pro, merci de confirmer :\n- Bonus actuel\n- Sinistres 36 derniers mois\n- Activité VTC ou Taxi\n- Immatriculation et véhicule\n\nCordialement,\nWendy BUCHET",
    },
    april: {
      name: "April",
      logo: "🌿",
      color: "#16a34a",
      requirements: {
        "Produits": "Auto, habitation, santé, prévoyance",
        "Public": "Particuliers et professionnels",
        "Digital": "Extranet April ON",
      },
      emailTemplate: "Bonjour,\n\nPour votre dossier April, merci de préciser le produit souhaité et vos coordonnées.\n\nCordialement,\nWendy BUCHET",
    },
  },

  render: function (slug) {
    var p = this.PARTNERS[slug];
    var root = document.getElementById("partnerRoot");
    if (!p || !root) return;
    document.title = p.name + " | CRM Partenaires";
    root.innerHTML =
      '<header style="border-left:4px solid ' +
      p.color +
      ';padding-left:16px;margin-bottom:24px"><span style="font-size:2rem">' +
      p.logo +
      "</span><h1>" +
      p.name +
      '</h1></header><section class="panel"><h2>Critères d\'éligibilité</h2><dl class="req-dl">' +
      Object.keys(p.requirements)
        .map(function (k) {
          return "<dt>" + k + "</dt><dd>" + p.requirements[k] + "</dd>";
        })
        .join("") +
      '</section><section class="panel" style="margin-top:16px"><h2>Modèle email client</h2><pre style="white-space:pre-wrap;background:#f8fafc;padding:16px;border-radius:10px;font-size:.9rem">' +
      p.emailTemplate +
      '</pre><button type="button" class="btn btn-primary" id="btnCopyEmail" style="margin-top:12px">Copier le modèle</button></section><p style="margin-top:16px"><a href="./crm-eligibility-test.html?product=vtc-taxi">Tester l\'éligibilité →</a></p>';
    document.getElementById("btnCopyEmail").onclick = function () {
      navigator.clipboard.writeText(p.emailTemplate).then(function () {
        alert("Modèle copié");
      });
    };
  },
};
