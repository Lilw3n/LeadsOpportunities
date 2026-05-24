/**
 * Scénarios dérogations — inspire derogationService.ts multisite
 */
window.CrmDerogations = {
  SCENARIOS: [
    {
      id: "vehicle_sold_period_gap",
      name: "Véhicule vendu — interruption période",
      description: "Client a vendu son véhicule et n'a pas pu se réassurer immédiatement",
      successRate: 82,
      documents: ["Certificat de vente", "Preuve recherche nouveau véhicule"],
      arguments: [
        "Interruption volontaire et documentée",
        "Pas de sinistre responsable",
        "Démarche proactive de réassurance",
      ],
      strategy: "Acceptation conditionnelle — délai 5-10 jours",
    },
    {
      id: "non_responsible_accident",
      name: "Accident non responsable",
      description: "Perte totale ou interruption forcée après accident subi",
      successRate: 88,
      documents: ["Constat amiable", "Rapport expertise", "Courrier assureur adverse"],
      arguments: ["Accident subi, non provoqué", "Force majeure", "Recherche active de solution"],
      strategy: "Demande directe — succès ~90%",
    },
    {
      id: "financial_hardship",
      name: "Difficultés financières temporaires",
      description: "Interruption due à une situation financière documentée et résolue",
      successRate: 65,
      documents: ["Attestation employeur", "Plan de redressement", "RIB"],
      arguments: ["Situation résolue", "Historique client fiable", "Engagement de paiement"],
      strategy: "Garantie supplémentaire ou surprime temporaire",
    },
    {
      id: "bonus_malus_gap",
      name: "Écart bonus-malus léger",
      description: "Client proche du seuil d'éligibilité (ex. BM 0.86 au lieu de 0.85)",
      successRate: 70,
      documents: ["Relevé d'information", "Attestation de non-sinistre"],
      arguments: ["Écart marginal", "Ancienneté client", "Aucun sinistre récent"],
      strategy: "Dérogation commerciale avec franchise majorée",
    },
    {
      id: "license_years_short",
      name: "Permis récent (< 5 ans)",
      description: "Conducteur VTC avec permis récent mais expérience pro documentée",
      successRate: 55,
      documents: ["Carte VTC", "Attestation employeur", "Relevé d'information"],
      arguments: ["Expérience professionnelle", "Formation continue", "Profil à faible sinistralité"],
      strategy: "Surprime temporaire 12 mois",
    },
  ],

  renderWizard: function (mount) {
    var self = this;
    mount.innerHTML =
      '<div class="panel"><label>Situation client<select id="derogScenario">' +
      this.SCENARIOS.map(function (s) {
        return '<option value="' + s.id + '">' + s.name + "</option>";
      }).join("") +
      '</select></label><button type="button" class="btn btn-primary" id="btnDerogRun" style="margin-top:12px">Générer stratégie</button></div>' +
      '<div id="derogResult"></div>';

    document.getElementById("btnDerogRun").onclick = function () {
      var id = document.getElementById("derogScenario").value;
      var sc = self.SCENARIOS.find(function (x) {
        return x.id === id;
      });
      if (!sc) return;
      document.getElementById("derogResult").innerHTML =
        '<div class="panel" style="margin-top:16px"><h3>' +
        sc.name +
        '</h3><p style="color:var(--muted)">' +
        sc.description +
        '</p><p><strong>Taux de succès estimé :</strong> ' +
        sc.successRate +
        '%</p><p><strong>Stratégie :</strong> ' +
        sc.strategy +
        '</p><h4>Documents à joindre</h4><ul>' +
        sc.documents
          .map(function (d) {
            return "<li>" + d + "</li>";
          })
          .join("") +
        '</ul><h4>Arguments clés</h4><ul>' +
        sc.arguments
          .map(function (a) {
            return "<li>" + a + "</li>";
          })
          .join("") +
        '</ul><p style="margin-top:12px"><button type="button" class="btn btn-ghost" id="btnCopyDerog">Copier stratégie (PDF texte)</button> · <a href="./crm-documents.html">Joindre au dossier →</a></p></div>';
      var txt =
        sc.name +
        "\n" +
        sc.strategy +
        "\n\nDocuments:\n" +
        sc.documents.join("\n") +
        "\n\nArguments:\n" +
        sc.arguments.join("\n");
      document.getElementById("btnCopyDerog").onclick = function () {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(txt).then(function () {
            alert("Stratégie copiée — collez dans votre PDF ou mail.");
          });
        } else {
          prompt("Copiez la stratégie :", txt);
        }
      };
    };
    document.getElementById("btnDerogRun").click();
  },
};
