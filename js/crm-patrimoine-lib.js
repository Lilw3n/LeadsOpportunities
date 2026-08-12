/**
 * Orientation patrimoniale intelligente (indicatif courtier / CGP light).
 * Retraite · mutuelle · invalidité · protection famille · banque/épargne.
 */
window.CrmPatrimoine = (function () {
  "use strict";

  var PILLARS = [
    {
      id: "retraite",
      label: "Retraite",
      short: "Se constituer une retraite",
      keywords: ["per", "retraite", "epargne retraite", "madelin"],
      href: "./crm-patrimoine.html#retraite"
    },
    {
      id: "mutuelle",
      label: "Mutuelle santé",
      short: "Complémentaire santé",
      keywords: ["mutuelle", "sante", "complementaire"],
      href: "./crm-patrimoine.html#mutuelle"
    },
    {
      id: "invalidite",
      label: "Invalidité / arrêt",
      short: "Prévoir un revenu si invalidité",
      keywords: ["invalidite", "ij", "prestation", "arret travail"],
      href: "./crm-patrimoine.html#invalidite"
    },
    {
      id: "famille",
      label: "Protection famille",
      short: "Décès / dépendance proches",
      keywords: ["deces", "obsèques", "dependance", "famille", "assurance vie"],
      href: "./crm-patrimoine.html#famille"
    },
    {
      id: "banque",
      label: "Banque & épargne",
      short: "Épargne, placements, cash",
      keywords: ["livret", "assurance vie", "pea", "tresorerie", "banque"],
      href: "./crm-banque-epargne.html"
    }
  ];

  function recommend(profile) {
    profile = profile || {};
    var age = Number(profile.age) || null;
    var kids = Number(profile.children) || 0;
    var income = Number(profile.incomeMonthly) || 0;
    var hasLoan = !!profile.hasLoan;
    var selfEmployed = !!profile.selfEmployed;
    var tips = [];

    if (age != null && age >= 35) {
      tips.push({
        pillar: "retraite",
        priority: age >= 45 ? 1 : 2,
        title: "Épargne retraite (PER)",
        detail:
          age >= 50
            ? "Priorité haute : horizon retraite rapproché — versements réguliers + éventuel rachat de trimestres à étudier hors CRM."
            : "Mettre en place un PER / enveloppe retraite dès que le cash-flow le permet (surtout TNS).",
      });
    } else {
      tips.push({
        pillar: "retraite",
        priority: 3,
        title: "Anticiper la retraite tôt",
        detail: "Même jeune : un petit versement automatique bat l’inaction. Réévaluer à chaque commission significative.",
      });
    }

    tips.push({
      pillar: "mutuelle",
      priority: kids > 0 || age >= 40 ? 1 : 2,
      title: "Mutuelle adaptée",
      detail:
        kids > 0
          ? "Famille : vérifier niveaux dentaire / optique / hospitalisation et éventuelle surcomplémentaire."
          : "Comparer mutuelle individuelle vs contrat Madelin (TNS) selon statut.",
    });

    tips.push({
      pillar: "invalidite",
      priority: selfEmployed || income >= 3000 ? 1 : 2,
      title: "Prévoyance invalidité / IJ",
      detail: selfEmployed
        ? "TNS : la prévoyance est critique (IJ + invalidité). Croiser avec ADE du prêt si crédit en cours."
        : "Vérifier les garanties arrêt de travail / invalidité (employeur + contrat perso).",
    });

    tips.push({
      pillar: "famille",
      priority: kids > 0 || hasLoan ? 1 : 2,
      title: "Protéger sa famille",
      detail: hasLoan
        ? "Crédit en cours : ADE + capital décès / assurance-vie bénéficiaires à aligner sur le prêt et la famille."
        : kids > 0
          ? "Enfants à charge : capital décès + désignation bénéficiaires + éventuelle dépendance parents."
          : "Désigner des bénéficiaires et revoir les clauses en cas de changement de situation.",
    });

    tips.push({
      pillar: "banque",
      priority: 2,
      title: "Côté bancaire / épargne",
      detail:
        "Séparer : 1) trésorerie pro (commissions) 2) épargne de précaution 3) enveloppes long terme (AV / PER). Voir pilier Banque.",
    });

    tips.sort(function (a, b) {
      return a.priority - b.priority;
    });
    return tips;
  }

  function explain(profile) {
    var tips = recommend(profile);
    return {
      tips: tips,
      top: tips.filter(function (t) {
        return t.priority === 1;
      }),
      pillars: PILLARS,
    };
  }

  return {
    PILLARS: PILLARS,
    recommend: recommend,
    explain: explain,
  };
})();
