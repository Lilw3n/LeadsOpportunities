/**
 * Contenu de fond des pages piliers nationales (auto, habitation, emprunteur, prévoyance).
 * Elles ne portaient qu'une phrase d'introduction. Pas de tarif ni de statistique :
 * seulement les règles en vigueur et ce qu'il faut préparer pour un devis.
 * Clé = fichier généré. Les champs remplacent ceux de la fiche pilier.
 */
module.exports = {
  "assurance-auto/index.html": {
    title: "Assurance auto : devis, tiers ou tous risques, tous profils",
    description:
      "Devis assurance auto : au tiers, intermédiaire ou tous risques. Jeune conducteur, malus, résilié : un courtier ORIAS compare et vous rappelle. Gratuit, sans engagement.",
    h1: "Assurance auto : devis et comparatif pour tous les profils",
    intro:
      "Bon conducteur, jeune permis, malussé ou résilié par votre assureur : nous comparons les contrats et nous vous expliquons les écarts de garanties avant de parler prix.",
    sections: [
      {
        h2: "Les trois niveaux de garantie",
        list: [
          "Au tiers : la responsabilité civile, seule garantie obligatoire. Elle indemnise les victimes, pas votre véhicule ni vos blessures si vous êtes responsable.",
          "Intermédiaire : on ajoute le vol, l'incendie, le bris de glace et les événements climatiques.",
          "Tous risques : votre véhicule est couvert même si vous êtes responsable ou si le tiers n'est pas identifié.",
        ],
        paragraphs: [
          "La garantie du conducteur mérite une attention à part : sans elle, vos propres blessures ne sont pas indemnisées quand vous êtes responsable de l'accident.",
        ],
      },
      {
        h2: "Ce qui fait le prix d'un contrat",
        list: [
          "Le bonus-malus et les sinistres des dernières années",
          "L'ancienneté du permis et l'âge du conducteur principal",
          "Le véhicule : puissance, valeur, coût des réparations",
          "L'usage : privé, trajet domicile-travail, professionnel",
          "Le lieu de stationnement et le kilométrage annuel",
        ],
      },
      {
        h2: "Jeune conducteur, malus, résiliation : les profils difficiles",
        paragraphs: [
          "Un jeune conducteur paie une surprime qui diminue chaque année sans accident responsable. Un conducteur malussé, ou résilié pour sinistres, non-paiement ou suspension de permis, se voit souvent refusé par les assureurs classiques. Des contrats existent pour ces situations : c'est précisément là qu'un courtier est utile.",
        ],
      },
      {
        h2: "Changer d'assurance auto",
        paragraphs: [
          "Après un an de contrat, vous pouvez résilier à tout moment, sans frais ni justification. Le nouvel assureur se charge des démarches, pour que le véhicule ne reste jamais sans assurance.",
        ],
      },
    ],
    faq: [
      {
        q: "L'assurance auto est-elle obligatoire si la voiture ne roule pas ?",
        a: "Oui. Tout véhicule à moteur en état de circuler doit être assuré au moins en responsabilité civile, même s'il reste stationné.",
      },
      {
        q: "Quels documents faut-il pour un devis ?",
        a: "La carte grise, le permis de conduire et le relevé d'information de votre assureur actuel, qui retrace votre bonus et vos sinistres.",
      },
      {
        q: "Je viens d'être résilié, puis-je être assuré rapidement ?",
        a: "Oui dans la plupart des cas. Il faut dire la cause de la résiliation dès la demande : l'omettre expose à la nullité du contrat.",
      },
      { q: "Le devis est-il gratuit ?", a: "Oui, sans engagement." },
    ],
  },

  "assurance-habitation/index.html": {
    description:
      "Devis assurance habitation : locataire, propriétaire, copropriétaire, bailleur. Dégât des eaux, vol, incendie, responsabilité civile. Courtier ORIAS, gratuit.",
    h1: "Assurance habitation : devis locataire, propriétaire et bailleur",
    intro:
      "Appartement ou maison, résidence principale, secondaire ou logement loué : nous comparons les contrats multirisques habitation et nous vérifions avec vous ce qui est réellement couvert.",
    sections: [
      {
        h2: "Qui doit s'assurer",
        list: [
          "Le locataire : la loi l'oblige à assurer les risques locatifs et à remettre une attestation au bailleur chaque année.",
          "Le copropriétaire, occupant ou non : il doit être assuré au moins en responsabilité civile.",
          "Le propriétaire d'une maison : rien ne l'y oblige, mais sans contrat il supporte seul un incendie ou un dégât des eaux.",
          "Le bailleur : l'assurance propriétaire non occupant couvre le logement entre deux locataires et ce que le contrat du locataire ne couvre pas.",
        ],
      },
      {
        h2: "Ce que couvre une multirisque habitation",
        list: [
          "Incendie, explosion, dégât des eaux",
          "Vol et vandalisme, sous conditions de fermeture",
          "Bris de glace, tempête, grêle, catastrophes naturelles",
          "Responsabilité civile vie privée de toute la famille",
          "En option : objets de valeur, dommages électriques, piscine, dépendances, assistance",
        ],
      },
      {
        h2: "Ce qu'il faut déclarer avec soin",
        paragraphs: [
          "Le nombre de pièces, la surface, les dépendances, la valeur du mobilier et des objets précieux. Une pièce oubliée ou un mobilier sous-évalué réduit l'indemnisation le jour du sinistre. À l'inverse, un capital surévalué se paie chaque année pour rien.",
        ],
      },
    ],
    faq: [
      {
        q: "Peut-on changer d'assurance habitation en cours d'année ?",
        a: "Oui, à tout moment après la première année de contrat. Pour un locataire, le nouvel assureur effectue la résiliation afin d'éviter toute interruption.",
      },
      {
        q: "En colocation, faut-il un contrat par personne ?",
        a: "Un seul contrat peut couvrir tous les colocataires s'ils y sont nommés. Sinon chacun doit s'assurer.",
      },
      {
        q: "Le vol est-il toujours couvert ?",
        a: "Seulement si la garantie est souscrite et si les conditions de protection sont respectées : porte fermée à clé, volets clos selon la durée d'absence.",
      },
      { q: "Le devis est-il gratuit ?", a: "Oui, sans engagement." },
    ],
  },

  "assurance-emprunteur/index.html": {
    title: "Assurance emprunteur : changer et payer moins | Loi Lemoine",
    description:
      "Assurance de prêt immobilier : changez d'assureur à tout moment avec la loi Lemoine. Équivalence de garanties, questionnaire de santé, démarches. Courtier ORIAS.",
    h1: "Assurance emprunteur : changer d'assurance de prêt et réduire son coût",
    intro:
      "Nouveau prêt ou crédit en cours : l'assurance pèse lourd dans le coût total d'un emprunt immobilier. Vous pouvez la choisir ailleurs que dans votre banque, et en changer quand vous voulez.",
    sections: [
      {
        h2: "Ce que couvre l'assurance de prêt",
        list: [
          "Décès et perte totale et irréversible d'autonomie : le capital restant dû est remboursé à la banque",
          "Incapacité temporaire de travail : les mensualités sont prises en charge pendant l'arrêt, après une franchise",
          "Invalidité permanente, totale ou partielle",
          "Perte d'emploi, en option",
        ],
        paragraphs: [
          "La quotité fixe la part du prêt assurée sur chaque tête. À deux, elle peut aller de 100 % réparti entre les emprunteurs à 100 % sur chacun.",
        ],
      },
      {
        h2: "Changer d'assurance : vos droits",
        paragraphs: [
          "Dès l'offre de prêt, vous pouvez présenter le contrat d'un autre assureur que celui de la banque. Depuis la loi Lemoine, vous pouvez aussi changer à tout moment pendant la vie du prêt, sans frais et sans attendre la date anniversaire.",
          "Une seule condition : le nouveau contrat doit offrir des garanties au moins équivalentes à celles que la banque exige. La banque a dix jours ouvrés pour répondre, doit motiver tout refus, et ne peut ni modifier le taux du crédit ni facturer de frais.",
        ],
      },
      {
        h2: "Santé : questionnaire médical et droit à l'oubli",
        paragraphs: [
          "Aucun questionnaire de santé n'est demandé quand la part assurée ne dépasse pas 200 000 euros par personne et que le prêt se termine avant vos 60 ans. Au-delà, le questionnaire doit être rempli avec exactitude.",
          "Le droit à l'oubli permet de ne plus déclarer un cancer ou une hépatite C cinq ans après la fin du traitement, sans rechute. Pour les autres pathologies, la convention AERAS organise l'examen des dossiers à risque aggravé.",
        ],
      },
      {
        h2: "Ce qu'on prépare pour comparer",
        list: [
          "L'offre de prêt ou le tableau d'amortissement",
          "La fiche standardisée d'information remise par la banque, qui liste les garanties exigées",
          "Votre contrat d'assurance actuel et son coût",
          "Profession, déplacements, sports pratiqués, statut fumeur",
        ],
      },
    ],
    faq: [
      {
        q: "La banque peut-elle refuser mon changement d'assurance ?",
        a: "Uniquement si le nouveau contrat ne présente pas des garanties équivalentes, et elle doit l'écrire en détaillant les garanties manquantes. Un courtier construit le contrat sur la fiche de la banque pour éviter ce refus.",
      },
      {
        q: "Changer d'assurance modifie-t-il mon prêt ?",
        a: "Non. Le taux, la durée et les mensualités du crédit restent les mêmes. Seule la cotisation d'assurance change.",
      },
      {
        q: "Est-ce intéressant sur un prêt déjà ancien ?",
        a: "Cela dépend du capital restant dû et de votre âge. On le calcule avant toute démarche : s'il n'y a rien à gagner, on vous le dit.",
      },
      {
        q: "Un problème de santé empêche-t-il de changer ?",
        a: "Pas forcément. Sous les seuils de la loi Lemoine, il n'y a pas de questionnaire. Au-dessus, l'assureur peut proposer une surprime ou une exclusion, que l'on compare avec votre contrat actuel.",
      },
      { q: "Le devis est-il gratuit ?", a: "Oui, sans engagement." },
    ],
  },

  "assurance-prevoyance/index.html": {
    title: "Assurance prévoyance : arrêt de travail, invalidité, décès",
    description:
      "Devis prévoyance : indemnités en cas d'arrêt de travail, rente d'invalidité, capital décès. Salariés, indépendants, familles. Courtier ORIAS, gratuit et sans engagement.",
    h1: "Assurance prévoyance : protéger vos revenus et votre famille",
    intro:
      "Un arrêt long, une invalidité ou un décès font chuter les revenus du foyer du jour au lendemain. La prévoyance complète ce que versent la Sécurité sociale et l'employeur.",
    sections: [
      {
        h2: "Les garanties d'un contrat de prévoyance",
        list: [
          "Indemnités journalières pendant un arrêt de travail",
          "Rente en cas d'invalidité, totale ou partielle",
          "Capital décès versé aux proches que vous désignez",
          "Rente éducation pour les enfants, rente de conjoint",
        ],
      },
      {
        h2: "Salarié ou indépendant : pas le même besoin",
        paragraphs: [
          "Un salarié bénéficie souvent d'une prévoyance d'entreprise : il faut d'abord lire ce qu'elle prévoit, puis compléter ce qui manque, le plus souvent le capital décès et l'invalidité.",
          "Un indépendant est beaucoup moins couvert par son régime obligatoire. Pour lui, la prévoyance est la première assurance à mettre en place, avant même d'optimiser la mutuelle.",
        ],
      },
      {
        h2: "Ce qu'il faut comparer",
        list: [
          "La franchise : nombre de jours avant le premier versement",
          "La définition de l'invalidité, et le barème utilisé",
          "Les exclusions : dos, affections psychiques, sports à risque",
          "Le montant garanti : forfaitaire, ou limité à la perte de revenu réelle",
        ],
      },
    ],
    faq: [
      {
        q: "Quelle différence entre mutuelle et prévoyance ?",
        a: "La mutuelle rembourse les soins. La prévoyance remplace un revenu ou verse un capital.",
      },
      {
        q: "Faut-il un questionnaire de santé ?",
        a: "Oui le plus souvent. Il doit être rempli avec exactitude : une fausse déclaration peut faire annuler le contrat au moment où vous en avez besoin.",
      },
      {
        q: "Peut-on choisir librement les bénéficiaires du capital décès ?",
        a: "Oui, par une clause bénéficiaire que vous pouvez modifier à tout moment.",
      },
      { q: "Le devis est-il gratuit ?", a: "Oui, sans engagement." },
    ],
  },
};
