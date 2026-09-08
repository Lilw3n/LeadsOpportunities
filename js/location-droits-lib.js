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
    { id: "conges", label: "Congés : locataire, bailleur, commercial" },
    { id: "conge_locataire", label: "Congé donné par le locataire" },
    { id: "conge_bailleur", label: "Congé donné par le bailleur" },
    { id: "conge_commercial", label: "Congé / bail commercial" },
    { id: "depot_garantie", label: "Dépôt de garantie, vétusté, provision, clés" },
    { id: "mise_en_demeure", label: "Impayé : mise en demeure, intérêts de retard" },
    { id: "annexes", label: "Pièces à annexer au bail" },
    { id: "fiscalite", label: "Meublé, fiscalité, TVA, taxes" },
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
    preavis: "conges",
    conge: "conges",
    conges: "conges",
    "conge-bailleur": "conge_bailleur",
    "conge-locataire": "conge_locataire",
    "par-le-locataire": "conge_locataire",
    "par-locataire": "conge_locataire",
    "donne-par-locataire": "conge_locataire",
    "par-le-bailleur": "conge_bailleur",
    "par-bailleur": "conge_bailleur",
    "donne-par-bailleur": "conge_bailleur",
    "conge-commercial": "conge_commercial",
    "bail-commercial-conge": "conge_commercial",
    preneur: "conge_commercial",
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
    meuble: "fiscalite",
    fiscalite: "fiscalite",
    tva: "fiscalite",
    taxes: "fiscalite",
    impot: "fiscalite",
    lmnp: "fiscalite",
    commercial: "fiscalite",
    "bail-commercial": "annexes",
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
    conges: {
      delay: "Toujours un écrit (LRAR, remise contre récépissé ou acte). Le délai court à réception, pas à l’envoi. Habitation ≠ commercial.",
      tenant: [
        "Recevoir (ou donner) un congé écrit, avec un délai qui part de la réception.",
        "Rester dans les lieux jusqu’à la date d’effet : on ne « met pas dehors » soi-même.",
        "Un SMS, un WhatsApp ou un coup de fil ne rompt pas le bail.",
      ],
      landlord: [
        "Identifier qui donne le congé (locataire, bailleur, preneur commercial) avant d’écrire.",
        "Caler le délai sur le bail réel : nu, meublé, zone tendue, commercial, mobilité.",
        "On rédige le courrier avec vous (LRAR / commissaire de justice) — pas un modèle générique.",
      ],
      groups: [
        {
          title: "Congé donné par le locataire (habitation)",
          items: [
            { req: "obligatoire", t: "Écrit : LRAR, remise contre récépissé, ou acte — un SMS ne rompt pas le bail" },
            { req: "obligatoire", t: "Nu : préavis 3 mois à compter de la réception" },
            { req: "selon cas", t: "Préavis 1 mois : meublé, ou nu en zone tendue (Nancy métropole souvent ; Lunéville : vérifier l’arrêté)" },
            { req: "selon cas", t: "Préavis réduit (nu hors zone tendue) : mutation, perte d’emploi, nouvel emploi après perte, RSA, AAH, santé, violences… à justifier dans la lettre" },
            { req: "obligatoire", t: "Clés + EDL de sortie à la date d’effet" },
          ],
        },
        {
          title: "Congé donné par le bailleur (habitation)",
          items: [
            { req: "obligatoire", t: "Seulement pour l’échéance du bail (y compris tacite reconduction) — pas en cours de période sauf cas très limités" },
            { req: "obligatoire", t: "Nu : 6 mois avant l’échéance. Meublé : 3 mois. Forme : LRAR ou acte de commissaire de justice" },
            { req: "obligatoire", t: "Motif légal : reprise (habiter / conjoint / ascendant / descendant), vente, ou motif légitime et sérieux" },
            { req: "obligatoire", t: "Mentions obligatoires (bénéficiaire de la reprise ; priorité d’achat si vente) — sinon nullité" },
            { req: "selon cas", t: "SCI / personne morale : reprise pour habiter souvent impossible" },
          ],
        },
        {
          title: "Congé / bail commercial (code de commerce)",
          items: [
            { req: "obligatoire", t: "Ce n’est pas la loi 1989 : congé pour l’échéance triennale, 6 mois d’avance" },
            { req: "selon cas", t: "Preneur (locataire commercial) : peut partir à chaque triennale, 6 mois d’écrit" },
            { req: "selon cas", t: "Bailleur : refus de renouvellement / éviction → indemnité d’éviction sauf motif grave" },
          ],
        },
        {
          title: "Colocation, mobilité, saisonnier",
          items: [
            { req: "selon cas", t: "Bail unique : le congé d’un colocataire n’éteint pas le bail des autres (solidarité souvent 6 mois après le départ)" },
            { req: "selon cas", t: "Baux par chambre : chaque chambre a son propre préavis" },
            { req: "selon cas", t: "Bail mobilité : locataire 1 mois ; le bailleur ne donne pas un congé « classique » avant le terme" },
          ],
        },
      ],
      watch: [
        "Personne morale (SCI) : reprise pour habiter souvent impossible.",
        "On rédige le congé sur le bail réel (nu / meublé / commercial / mobilité).",
      ],
    },
    conge_locataire: {
      delay: "Nu : 3 mois. Meublé : 1 mois. Zone tendue : 1 mois aussi (nu). LRAR, remise contre récépissé ou acte. Délai à réception.",
      tenant: [
        "Le préavis court à réception. Motifs de préavis réduit (mutation, perte d’emploi, RSA, santé, violences…) à justifier.",
        "Nancy métropole : souvent zone tendue (1 mois) — Lunéville : vérifier l’arrêté en vigueur.",
        "Restituer les clés, laisser le logement propre, assister à l’état des lieux de sortie.",
      ],
      landlord: [
        "Accuser réception, proposer un EDL de sortie contradictoire, noter l’adresse de restitution du dépôt.",
        "Ne pas retenir un mois de loyer « d’office » au-delà du préavis dû.",
        "Colocation : selon bail unique ou chambres, le congé d’un seul n’éteint pas toujours le bail des autres.",
      ],
      groups: [
        {
          title: "Qui écrit — le locataire",
          items: [
            { req: "obligatoire", t: "Lettre de congé datée, signée, adresse du logement, date d’effet visée" },
            { req: "obligatoire", t: "Envoyer en LRAR (ou acte / remise contre récépissé) et garder la preuve" },
            { req: "selon cas", t: "Joindre le justificatif si préavis réduit (employeur, France Travail, CAF, certificat médical…)" },
          ],
        },
        {
          title: "Délais",
          items: [
            { req: "obligatoire", t: "Nu hors zone tendue : 3 mois" },
            { req: "selon cas", t: "Meublé ou zone tendue : 1 mois" },
            { req: "selon cas", t: "Bail mobilité : 1 mois" },
          ],
        },
      ],
      watch: ["Un SMS de départ n’interrompt pas le bail."],
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
      groups: [
        {
          title: "Qui écrit — le bailleur",
          items: [
            { req: "obligatoire", t: "Écrit 6 mois (nu) ou 3 mois (meublé) avant l’échéance — pas au milieu du bail" },
            { req: "obligatoire", t: "Motif + mentions légales (reprise : qui habitera ; vente : offre / priorité)" },
            { req: "selon cas", t: "SCI : reprise personnelle souvent impossible — choisir un autre motif ou attendre" },
          ],
        },
        {
          title: "Motifs possibles (habitation)",
          items: [
            { req: "selon cas", t: "Reprise pour habiter (bailleur, conjoint, ascendant, descendant)" },
            { req: "selon cas", t: "Vente du logement (règles de priorité du locataire)" },
            { req: "selon cas", t: "Motif légitime et sérieux (impayés caractérisés, manquements graves…)" },
          ],
        },
      ],
      watch: [
        "Personne morale (SCI) : reprise personnelle souvent impossible.",
        "On ne rédige pas le congé « à la va-vite » : on le calibre sur le bail réel.",
      ],
    },
    conge_commercial: {
      delay: "Code de commerce (statut des baux commerciaux). Congé pour l’échéance triennale : 6 mois d’avance, LRAR ou acte. Pas la loi 1989.",
      tenant: [
        "Preneur : droit de partir à chaque période de 3 ans, avec 6 mois d’écrit (sauf clause contraire limitée).",
        "Refus de renouvellement par le bailleur : en principe indemnité d’éviction, sauf motif grave et légitime.",
      ],
      landlord: [
        "Ne pas copier un congé d’habitation (IRL, 6 mois « nu », reprise pour habiter) : ça ne s’applique pas.",
        "Échéance, clause d’indexation ILC/ILAT, destination, dépôt de garantie commercial : à relire avant d’écrire.",
      ],
      groups: [
        {
          title: "Congé donné par le preneur (locataire commercial)",
          items: [
            { req: "obligatoire", t: "6 mois avant l’échéance triennale, écrit (LRAR ou acte)" },
            { req: "selon cas", t: "Dérogations / clauses du bail : on les vérifie avant d’envoyer" },
          ],
        },
        {
          title: "Congé / refus de renouvellement par le bailleur",
          items: [
            { req: "obligatoire", t: "Forme et délai du code de commerce (souvent 6 mois avant le terme)" },
            { req: "selon cas", t: "Indemnité d’éviction si refus de renouvellement sans motif grave" },
            { req: "selon cas", t: "Motif grave (impayés, manquement à la destination…) : à documenter" },
          ],
        },
      ],
      watch: [
        "Bail professionnel (hors 1989 et hors statut commercial) : encore d’autres délais — on calibre sur le contrat.",
        "Local mixte habitation + commerce : deux régimes possibles, ne pas mélanger.",
      ],
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
      delay: "Habitation : remises à la signature. EDL au plus tard à la remise des clés. Commercial : état des lieux + diagnostics propres au local.",
      tenant: [
        "Recevoir les annexes obligatoires avant ou lors de la signature.",
        "Meublé : inventaire du mobilier (liste légale) signé des deux côtés.",
        "Remettre l’attestation d’assurance habitation (risques locatifs).",
      ],
      landlord: [
        "Ne pas faire signer un bail d’habitation sans notice d’information ni dossier de diagnostic.",
        "Copropriété : extraits du règlement (destination, jouissance, charges).",
        "Commercial : ne pas copier la liste habitation — ILC/ILAT, pas IRL ; annexe environnementale si local > 2 000 m².",
      ],
      groups: [
        {
          title: "Habitation (loi 1989) — obligatoire à la signature",
          items: [
            { req: "obligatoire", t: "Bail (nu, meublé, mobilité ou coloc) avec clauses IRL / solidarité" },
            { req: "obligatoire", t: "Notice d’information locataire (décret 2015)" },
            { req: "obligatoire", t: "Surface habitable (loi Boutin) — dans le bail ou en annexe" },
            { req: "obligatoire", t: "DPE" },
            { req: "obligatoire", t: "ERP / état des risques et pollutions" },
            { req: "selon cas", t: "CREP plomb — permis de construire avant 1949" },
            { req: "selon cas", t: "Amiante — permis avant juillet 1997" },
            { req: "selon cas", t: "Gaz et électricité — installation de plus de 15 ans" },
            { req: "selon cas", t: "Termites — zone couverte par arrêté préfectoral" },
            { req: "selon cas", t: "Assainissement non collectif (SPANC) — maison hors tout-à-l’égout" },
            { req: "selon cas", t: "Bruit (plan d’exposition au bruit aéroport)" },
            { req: "selon cas", t: "Extraits du règlement de copropriété / charges" },
            { req: "selon cas", t: "Encadrement des loyers : loyer de référence (si commune concernée)" },
            { req: "selon cas", t: "Acte de cautionnement (si caution personne physique — mentions manuscrites)" },
            { req: "recommande", t: "Honoraires d’agence / détail des frais (si un professionnel intervient)" },
          ],
        },
        {
          title: "À l’entrée dans les lieux",
          items: [
            { req: "obligatoire", t: "État des lieux d’entrée contradictoire (sortie : en fin de bail)" },
            { req: "obligatoire", t: "Attestation d’assurance locataire (risques locatifs)" },
            { req: "recommande", t: "Inventaire des clés / badges + relevés de compteurs" },
            { req: "recommande", t: "Grille de vétusté annexée (évite le conflit à la sortie)" },
          ],
        },
        {
          title: "En plus si meublé",
          items: [
            { req: "obligatoire", t: "Inventaire et état détaillé du mobilier (décret 31 juillet 2015 — liste minimale)" },
            { req: "selon cas", t: "Contrat d’entretien / notices des équipements fournis" },
          ],
        },
        {
          title: "En plus si colocation",
          items: [
            { req: "selon cas", t: "Bail unique avec clause de solidarité, ou baux individuels par chambre" },
            { req: "recommande", t: "Règlement intérieur coloc (charges, parties communes)" },
            { req: "recommande", t: "Attestation d’assurance de chaque colocataire" },
          ],
        },
        {
          title: "Bail commercial (autre cadre)",
          items: [
            { req: "obligatoire", t: "Bail commercial (code de commerce) — pas un bail loi 1989" },
            { req: "obligatoire", t: "État des lieux d’entrée du local" },
            { req: "obligatoire", t: "ERP / diagnostics du local (amiante, etc.)" },
            { req: "selon cas", t: "DPE tertiaire / annexe environnementale (« annexe verte ») si plus de 2 000 m²" },
            { req: "selon cas", t: "Extraits règlement de copropriété / destination des lots" },
            { req: "recommande", t: "Inventaire, clause d’indexation ILC/ILAT (pas IRL habitation)" },
            { req: "recommande", t: "Caution / garantie à première demande, état du fonds si cession" },
          ],
        },
      ],
      watch: [
        "Un bail d’habitation sans annexes obligatoires est fragile (sanctions / inopposabilité selon les pièces).",
        "Saisonnier / mobilité / civil : listes encore différentes — on calibre sur le contrat réel.",
      ],
    },
    fiscalite: {
      delay: "Cadre fiscal 2026, à caler sur le régime réel du bailleur (IR, société, LMNP). Pas un conseil fiscal signé.",
      tenant: [
        "Charges locatives récupérables ≠ impôts du bailleur : la taxe foncière n’est pas un loyer.",
        "Meublé : le statut du bailleur (BIC) ne change pas vos droits au bail (durée, préavis, dépôt).",
      ],
      landlord: [
        "Nu : revenus fonciers (micro-foncier ou réel). Meublé : BIC (micro-BIC ou réel / LMNP) — ce n’est pas le même impôt.",
        "Exonérations : ne pas confondre plus-value sur résidence principale et loyers encaissés (toujours imposables selon le régime).",
        "TVA : location nue d’habitation en principe exonérée. Meublé para-hôtelier ou local commercial : option / taux à vérifier.",
        "Taxes : taxe foncière (bailleur), CFE souvent due en meublé, TH abolie pour la RP — pas de « taxe loyer » à inventer.",
      ],
      groups: [
        {
          title: "Location nue",
          items: [
            { req: "obligatoire", t: "Déclarer les loyers en revenus fonciers (micro-foncier ou frais réels)" },
            { req: "selon cas", t: "Charges récupérables sur le locataire : liste légale, pas la TF au réel sauf exception" },
          ],
        },
        {
          title: "Location meublée & « exonérations »",
          items: [
            { req: "obligatoire", t: "BIC : micro-BIC ou réel (LMNP). Plafonds et abattements selon classement (meuble tourisme vs classique) — on les vérifie au dossier" },
            { req: "selon cas", t: "CFE (cotisation foncière des entreprises) : souvent due en meublé, avec seuils / exonérations temporaires" },
            { req: "selon cas", t: "Chambre chez l’habitant / pièce de la RP : régimes d’exonération limités, conditions strictes (plafond, pièce principale conservée)" },
          ],
        },
        {
          title: "TVA & taxes",
          items: [
            { req: "selon cas", t: "Habitation nue : exonération de TVA (en principe)" },
            { req: "selon cas", t: "Para-hôtelier (petit-déj, linge, accueil…) : TVA possible (taux réduit selon prestation)" },
            { req: "selon cas", t: "Local commercial / professionnel : option TVA à étudier (déduction, loyer HT vs TTC)" },
            { req: "obligatoire", t: "Taxe foncière : à la charge du propriétaire ; ne pas la « refacturer » hors charges récupérables autorisées" },
          ],
        },
      ],
      watch: [
        "Un bail meublé mal qualifié (inventaire incomplet) peut être requalifié en nu — fiscalité et préavis changent.",
        "SCI à l’IR vs à l’IS, location meublée en société : on ne mélange pas les régimes.",
      ],
    },
  };

  function find(id) {
    for (var i = 0; i < KINDS.length; i++) {
      if (KINDS[i].id === id) return KINDS[i];
    }
    return KINDS[0];
  }

  function flattenChecklist(d) {
    if (d.checklist && d.checklist.length) return d.checklist;
    var out = [];
    (d.groups || []).forEach(function (g) {
      (g.items || []).forEach(function (it) {
        out.push(typeof it === "string" ? it : it.t);
      });
    });
    return out;
  }

  function explain(id) {
    var key = DETAILS[id] ? id : find(id).id;
    var meta = find(key);
    var d = DETAILS[key] || DETAILS.irl;
    return {
      id: key,
      label: meta.label || key,
      delay: d.delay,
      tenant: d.tenant,
      landlord: d.landlord,
      watch: d.watch,
      groups: d.groups || [],
      checklist: flattenChecklist(d),
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
