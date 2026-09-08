/**
 * Aide-mémoire habitation (loi n° 89-462 du 6 juillet 1989).
 * Cadre général — pas un modèle de courrier, pas un avis d'avocat.
 * Bail commercial / saisonnier / mobilité : autres règles.
 */
(function (global) {
  var SOURCE =
    "Loi n° 89-462 du 6 juillet 1989 (habitation). Cadre général à adapter au bail (nu, meublé, coloc). Pas un acte d'avocat : on rédige le courrier avec vous.";

  var KINDS = [
    { id: "irl", label: "Révision IRL — comment l'annoncer" },
    { id: "travaux", label: "Travaux dans le logement" },
    { id: "visites", label: "Visites / mise à disposition des locaux" },
    { id: "conge_bailleur", label: "Congé donné par le bailleur" },
    { id: "conge_locataire", label: "Congé donné par le locataire" },
    { id: "depot_garantie", label: "Dépôt de garantie, vétusté, provision, clés" },
    { id: "mise_en_demeure", label: "Impayé : mise en demeure, intérêts de retard" },
    { id: "annexes", label: "Pièces à annexer au bail" },
  ];

  var SUJET_TO_KIND = {
    irl: "irl",
    revision: "irl",
    "revision-loyer": "irl",
    travaux: "travaux",
    visites: "visites",
    acces: "visites",
    locaux: "visites",
    "mise-a-disposition": "visites",
    droits: "visites",
    preavis: "conge_locataire",
    conge: "conge_bailleur",
    depot: "depot_garantie",
    dg: "depot_garantie",
    garantie: "depot_garantie",
    vetuste: "depot_garantie",
    cles: "depot_garantie",
    restitution: "depot_garantie",
    provision: "depot_garantie",
    demeure: "mise_en_demeure",
    "mise-en-demeure": "mise_en_demeure",
    retard: "mise_en_demeure",
    interets: "mise_en_demeure",
    annexes: "annexes",
    pieces: "annexes",
    bail: "annexes",
  };

  var DETAILS = {
    irl: {
      delay: "Écrit (LRAR ou remise contre récépissé). Même trimestre que le bail, une fois par an.",
      tenant: [
        "Recevoir le calcul : loyer actuel, IRL de référence, nouvel IRL, nouveau loyer.",
        "Sans clause de révision dans le bail, le loyer n’est pas indexé.",
        "Une notification tardive ne reprend pas les mois déjà écoulés (pas de rétroactivité).",
      ],
      landlord: [
        "Annoncer par écrit avant d’appeler le nouveau loyer, avec les indices et la formule.",
        "Ne pas se contenter d’un SMS ou d’une quittance « mise à jour ».",
        "Joindre le trimestre du bail (ex. T2) : on ne change pas de trimestre d’une année sur l’autre.",
      ],
      watch: [
        "Corse et DOM : indices distincts.",
        "Encadrement des loyers : l’IRL ne permet pas de dépasser le loyer de référence majoré.",
      ],
    },
    travaux: {
      delay: "Préavis écrit, délai raisonnable (usage : 8 jours). Urgence (dégât des eaux, sécurité) : accès immédiat.",
      tenant: [
        "Jouissance paisible du logement : on n’entre pas sans l’avoir prévenu, sauf urgence.",
        "Si les travaux durent plus de 21 jours : baisse de loyer proportionnelle à la durée et aux pièces inutilisables.",
        "Si le logement devient inhabitable ou dangereux : il peut refuser de rester et demander la résiliation.",
        "Les travaux ne peuvent pas transformer le logement sans son accord (changer la distribution, etc.).",
      ],
      landlord: [
        "Dire par écrit : nature des travaux, dates, durée prévue, pièces concernées, horaires.",
        "Indiquer si une baisse de loyer s’applique (dès 21 jours) et comment elle sera calculée.",
        "Prévoir l’accès (clés, présence) : le locataire n’a pas à « se rendre disponible » 7 j/7.",
        "Pas de travaux de nuit, dimanche ou jour férié sans accord, sauf urgence.",
      ],
      watch: [
        "Un mail vague (« on passe faire des travaux ») ne suffit pas.",
        "Couper l’eau, l’électricité ou changer les serrures pour « forcer » l’accès est illégal.",
      ],
    },
    visites: {
      delay: "Prévenir raisonnablement. Visites : jours ouvrables y compris le samedi, 2 heures max par jour, pas le dimanche ni les jours fériés.",
      tenant: [
        "Rester dans les lieux jusqu’à la fin du bail : le bailleur ne reprend pas une pièce « en attendant ».",
        "Être présent aux visites, sauf accord contraire.",
        "Refuser les créneaux abusifs (soirée, dimanche, plusieurs passages par jour).",
      ],
      landlord: [
        "Mise à disposition à l’entrée : logement décent, équipements du bail, clés, relevés de compteurs, état des lieux.",
        "Pendant le bail : visites pour vente ou relocation seulement, dans le cadre légal (2 h / jour ouvrable).",
        "Ne pas imposer un passage inopiné « pour montrer à un artisan » sans l’avoir inscrit dans un avis de travaux.",
      ],
      watch: [
        "Changer les serrures ou retenir une copie « pour passer quand je veux » = violation de domicile.",
        "Bail commercial : autres règles (pas ce cadre).",
      ],
    },
    conge_bailleur: {
      delay: "Habitation nue : 6 mois avant l’échéance. Meublé : 3 mois. Forme : LRAR ou acte de commissaire de justice.",
      tenant: [
        "Un congé n’est valable que pour un motif prévu (reprise, vente, motif légitime et sérieux) et un contenu conforme.",
        "Délai de préavis à compter de la réception, pas de la date d’envoi seule.",
        "Maintien dans les lieux jusqu’à la date d’effet si le congé est contesté : on ne « met pas dehors » soi-même.",
      ],
      landlord: [
        "Vérifier la date d’échéance du bail (tacite reconduction) avant d’écrire.",
        "Mentionner le motif, les pièces exigées (reprise : bénéficiaire ; vente : conditions de priorité d’achat le cas échéant).",
        "Congé pour vente ou reprise : mentions obligatoires, sous peine de nullité.",
      ],
      watch: [
        "Personne morale (SCI) : reprise personnelle souvent impossible.",
        "On ne rédige pas le congé « à la va-vite » : on le calibre sur le bail réel.",
      ],
    },
    conge_locataire: {
      delay: "Nu : 3 mois. Meublé : 1 mois. Zone tendue : 1 mois aussi (nu). LRAR, remise en main propre ou acte.",
      tenant: [
        "Le préavis court à réception. Motifs de préavis réduit (mutation, perte d’emploi, etc.) à justifier.",
        "Nancy métropole : souvent zone tendue (1 mois) — Lunéville : vérifier l’arrêté en vigueur.",
        "Restituer les clés, laisser le logement propre, assister à l’état des lieux de sortie.",
      ],
      landlord: [
        "Accuser réception, proposer un EDL de sortie contradictoire, noter l’adresse de restitution du dépôt.",
        "Ne pas retenir un mois de loyer « d’office » au-delà du préavis dû.",
        "Colocation : selon bail unique ou chambres, le congé d’un seul n’éteint pas toujours le bail des autres.",
      ],
      watch: ["Un SMS de départ n’interrompt pas le bail."],
    },
    depot_garantie: {
      delay: "Restitution du dépôt : 1 mois si EDL sortie = EDL entrée, sinon 2 mois — hors provision sur charges à régulariser.",
      tenant: [
        "Plafond du dépôt : 1 mois de loyer HC (nu) ou 2 mois (meublé). Pas de « double caution » ni de retenue d’un mois de loyer en plus.",
        "Vétusté (usure normale peinture, sols, joints) : pas à sa charge. Seules les dégradations au-delà de la grille / de l’EDL d’entrée.",
        "Provision sur charges : le bailleur peut retenir une provision jusqu’à la régularisation annuelle, puis rend le trop-perçu avec le décompte.",
        "Restitution des clés (et badges) = fin de jouissance : plus de loyer après cette date, hors préavis non respecté.",
        "Dépôt rendu hors délai : intérêts au taux légal sur les sommes indûment conservées.",
      ],
      landlord: [
        "EDL d’entrée ET de sortie contradictoires, photos datées, relevés de compteurs le jour des clés.",
        "Annexer une grille de vétusté au bail : on ne l’improvise pas à la sortie.",
        "Toute retenue sur le dépôt : devis ou factures, poste par poste — pas un forfait « remise en état ».",
        "Provision charges : montant cohérent avec le bail, régul dans l’année, décompte envoyé au locataire avant de clôturer le dépôt.",
        "PV de restitution des clés : date, heure, nombre de clés / badges / boîte aux lettres, adresse pour virer le dépôt.",
      ],
      watch: [
        "Sans EDL d’entrée, la preuve de l’état initial pèse sur le bailleur.",
        "Ne pas « garder le dépôt au cas où » après les 1 ou 2 mois légaux.",
      ],
    },
    mise_en_demeure: {
      delay: "Relance amiable, puis mise en demeure LRAR avec décompte. Expulsion : commandement de payer par commissaire de justice — jamais soi-même.",
      tenant: [
        "Être informé des sommes (loyer, charges, période) et d’un délai pour régler.",
        "Droit d’expliquer (APL, accident de vie) et de saisir le FSL 54 le cas échéant.",
        "Le bailleur n’a pas le droit de couper l’eau / l’énergie, changer les serrures, jeter les affaires ou « garder les clés » du locataire encore en place.",
      ],
      landlord: [
        "Décompte clair : échéances, paiements reçus, solde, clause d’intérêts si le bail en prévoit une.",
        "Intérêts de retard : taux légal, ou clause du bail si elle n’est pas disproportionnée — les indiquer dans la mise en demeure.",
        "Garder preuve d’envoi et de réception avant toute suite (GLI / PNO, commission de coordination, commissaire de justice).",
        "Ne pas imputer le dépôt de garantie sur l’impayé tant que le bail n’est pas clos (le dépôt garantit la fin de location, pas la trésorerie du mois).",
      ],
      watch: [
        "Menacer d’une expulsion « la semaine prochaine » sans titre = illégal.",
        "PNO / GLI : déclarer selon les délais du contrat, en parallèle de la mise en demeure.",
      ],
    },
    annexes: {
      delay: "Remises à la signature du bail. L’état des lieux peut être établi à l’entrée, au plus tard lors de la remise des clés.",
      tenant: [
        "Recevoir les annexes obligatoires (diagnostics, notice d’information, règlement de copro si lot).",
        "Meublé : inventaire du mobilier conforme à la liste légale, signé.",
        "Remettre une attestation d’assurance habitation (risques locatifs) au bailleur.",
      ],
      landlord: [
        "Ne pas signer un bail « nu » sans le dossier de diagnostic et la notice d’information.",
        "Copropriété : extraits du règlement (destination, jouissance, charges).",
        "Si caution : acte de cautionnement daté, mentions manuscrites exigées.",
        "Grille de vétusté et inventaire des clés : pas obligatoires mais évitent le contentieux à la sortie.",
      ],
      checklist: [
        "Bail (nu, meublé, mobilité ou coloc) + clauses IRL / solidarité",
        "Notice d’information locataire (décret 2015)",
        "DPE",
        "ERP / état des risques",
        "CREP plomb (permis de construire avant 1949)",
        "Amiante (permis avant juillet 1997)",
        "Gaz et électricité si installation de plus de 15 ans",
        "Extraits règlement de copropriété / charges (si copro)",
        "État des lieux d’entrée (et sortie plus tard)",
        "Inventaire mobilier (meublé) + grille de vétusté",
        "Acte de cautionnement (si caution)",
        "Inventaire des clés / badges + relevés compteurs",
        "Attestation d’assurance locataire (remise par le locataire)",
        "Encadrement des loyers : références si la commune est concernée",
      ],
      watch: [
        "Un bail sans annexes obligatoires est fragile (sanctions / inopposabilité selon les pièces).",
        "Bail commercial ou saisonnier : autre liste.",
      ],
    },
  };

  function find(id) {
    for (var i = 0; i < KINDS.length; i++) {
      if (KINDS[i].id === id) return KINDS[i];
    }
    return KINDS[0];
  }

  function explain(id) {
    var meta = find(id);
    var d = DETAILS[meta.id] || DETAILS.irl;
    return {
      id: meta.id,
      label: meta.label,
      delay: d.delay,
      tenant: d.tenant,
      landlord: d.landlord,
      watch: d.watch,
      checklist: d.checklist || [],
      source: SOURCE,
    };
  }

  function kindFromSujet(sujet) {
    return SUJET_TO_KIND[String(sujet || "").toLowerCase()] || "";
  }

  function optionsHtml(selectedId) {
    return KINDS.map(function (k) {
      return (
        '<option value="' +
        k.id +
        '"' +
        (k.id === selectedId ? " selected" : "") +
        ">" +
        k.label +
        "</option>"
      );
    }).join("");
  }

  global.LocationDroits = {
    SOURCE: SOURCE,
    KINDS: KINDS,
    SUJET_TO_KIND: SUJET_TO_KIND,
    find: find,
    explain: explain,
    kindFromSujet: kindFromSujet,
    optionsHtml: optionsHtml,
  };
})(typeof window !== "undefined" ? window : global);
