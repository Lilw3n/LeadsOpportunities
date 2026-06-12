/**
 * Enrichissements éditoriaux — contenu plus pertinent + pont questionnaire.
 * Fusionné dans blog-articles-manifest.cjs à la génération.
 */

var Q = {
  sante: "../landings/questionnaire.html?need=sante&journey=standard",
  habitation: "../landings/questionnaire.html?need=habitation&journey=standard",
  auto: "../landings/questionnaire.html?need=auto&journey=standard",
  vtc: "../landings/questionnaire.html?need=vtc&journey=standard",
  animaux: "../landings/questionnaire.html?need=animaux&journey=standard",
  emprunteur: "../landings/questionnaire.html?need=emprunteur&journey=standard",
  credit: "../landings/questionnaire.html?need=credit-immo&journey=standard",
  prevoyance: "../landings/questionnaire.html?need=prevoyance&journey=standard",
  collective: "../landings/sante-collective.html",
};

var UPGRADES = {
  "mutuelle-sante-5-criteres.html": {
    cta: { href: Q.sante, label: "Questionnaire mutuelle (3 min)" },
    cardExcerpt: "5 critères concrets + questionnaire pour cibler le bon niveau.",
    blocks: [
      {
        type: "p",
        text: "Comparer une <strong>mutuelle santé</strong> en regardant uniquement le prix mensuel, c'est comme choisir un appartement sur la photo : vous découvrez les mauvaises surprises au pire moment — une couronne, une hospitalisation, des lunettes pour toute la famille. La bonne méthode : partir de <strong>vos dépenses réelles</strong>, puis tester 3 à 5 offres à garanties équivalentes.",
      },
      { type: "h2", text: "Étape 1 — Inventorier vos vrais besoins (12 derniers mois)" },
      {
        type: "ul",
        items: [
          "Consultations généraliste / spécialiste (dépassements d'honoraires ?)",
          "Optique : nombre de paires, verres progressifs, lentilles",
          "Dentaire : soins courants, prothèse, implant, orthodontie enfant",
          "Hospitalisation : chirurgie prévue, maternité, personne fragile au foyer",
          "Médecines douces : ostéo, psy, diététique (souvent plafonnées)",
        ],
      },
      { type: "h2", text: "Étape 2 — Lire le tableau BRSS, pas la brochure marketing" },
      {
        type: "p",
        text: "Chaque poste indique un <strong>% de la BRSS</strong> (base Sécurité sociale) ou un forfait en euros. Deux contrats « 300 % BRSS chirurgie » peuvent différer si l'un plafonne la chambre particulière ou exclut certains actes. Demandez le <strong>tableau de garanties complet</strong>, pas la fiche résumé.",
      },
      { type: "bridge" },
      { type: "h2", text: "Étape 3 — Les 5 critères qui font vraiment la différence" },
      {
        type: "ul",
        items: [
          "<strong>Hospitalisation</strong> : honoraires chirurgien/anesthésiste, chambre, forfait journalier",
          "<strong>Optique / dentaire</strong> : postes où le reste à charge explose",
          "<strong>Carences et exclusions</strong> : délais sur certains actes, exclusions pathologies antérieures",
          "<strong>Tiers payant et réseau</strong> : accès direct ou avance de frais",
          "<strong>Coût total</strong> : part employeur + part salarié, ou 100 % à votre charge si indépendant",
        ],
      },
      { type: "h2", text: "Étape 4 — Quand changer (et quand ne pas changer)" },
      {
        type: "p",
        text: "Changez si votre contrat actuel ne couvre plus vos postes critiques ou si la cotisation a grimpé sans gain de garanties. <strong>Ne changez pas</strong> en plein parcours de soins lourd sans vérifier les carences du nouveau contrat. Un courtier ORIAS aligne April, Harmonie, Allianz, AXA et les mutuelles spécialisées sur votre profil réel.",
      },
      {
        type: "p",
        text: "Notre <strong>questionnaire mutuelle</strong> reprend ces 5 critères : vous indiquez votre situation (solo, couple, famille, TNS), vos postes sensibles, et vous recevez une orientation vers les formules cohérentes — sans engagement.",
      },
    ],
  },
  "mutuelle-sante-hospitalisation-2026.html": {
    cta: { href: Q.sante, label: "Tester mon profil hospitalisation" },
    blocks: [
      {
        type: "p",
        text: "Une <strong>hospitalisation</strong> — même « simple » — peut générer plusieurs centaines à plusieurs milliers d'euros de <strong>reste à charge</strong> : dépassements d'honoraires, chambre particulière, forfait journalier, frais de confort. C'est le poste qui distingue une mutuelle d'entrée de gamme d'un contrat réellement protecteur.",
      },
      { type: "h2", text: "Ce que la Sécu rembourse — et ce qu'elle laisse" },
      {
        type: "p",
        text: "La Sécurité sociale rembourse une base (BRSS). En secteur 2, le médecin facture au-delà : sans mutuelle solide, <strong>30 à 80 % du ticket</strong> peut rester à votre charge sur la chirurgie et l'anesthésie.",
      },
      { type: "h2", text: "Les 4 lignes à vérifier sur votre tableau" },
      {
        type: "ul",
        items: [
          "<strong>Honoraires chirurgien / anesthésiste</strong> : % BRSS ou forfait en euros",
          "<strong>Chambre particulière</strong> : forfait / jour et plafond annuel",
          "<strong>Forfait journalier hospitalier</strong> : pris en charge ou non",
          "<strong>Plafond global hospitalisation</strong> : rare mais existant sur les petits contrats",
        ],
      },
      { type: "bridge" },
      { type: "h2", text: "Cas concrets : maternité, appendicite, prothèse" },
      {
        type: "p",
        text: "Maternité : chambre, pédiatre, dépassements — budget fréquent <strong>800 à 2 500 €</strong> sans bon niveau. Appendicite en urgence : l'optique du contrat ne sert à rien si l'hospitalisation est faible. Avant une opération programmée, demandez une <strong>simulation de reste à charge</strong> à postes équivalents.",
      },
    ],
  },
  "inflation-mutuelle-hausse-2026.html": {
    cta: { href: Q.sante, label: "Comparer via questionnaire" },
    blocks: [
      {
        type: "p",
        text: "Votre mutuelle augmente en 2026 ? Vous n'êtes pas seul : hausse des soins, vieillissement des portefeuilles, postes optique/dentaire sous pression. Avant de résilier par réflexe, posez-vous la bonne question : <strong>payez-vous plus pour les mêmes garanties</strong>, ou payez-vous plus parce que vous étiez déjà sous-couvert ?",
      },
      { type: "h2", text: "Décortiquer l'avis d'échéance" },
      {
        type: "ul",
        items: [
          "Part employeur vs part salarié (salarié)",
          "Évolution du forfait optique / dentaire / hospitalisation",
          "Nouvelles exclusions ou franchises introduites silencieusement",
          "Changement de tranche d'âge ou de zone tarifaire",
        ],
      },
      { type: "h2", text: "Renégocier vs changer : la règle simple" },
      {
        type: "p",
        text: "Si les garanties hospitalisation et dentaire restent faibles, <strong>négocier 5 % de réduction</strong> ne règle pas le fond du problème. Comparez 3 offres à postes équivalents : parfois une autre mutuelle coûte pareil avec de meilleurs remboursements là où vous consommez vraiment.",
      },
      { type: "bridge" },
      {
        type: "p",
        text: "Le questionnaire santé Leads Opportunities reprend votre profil (famille, TNS, postes sensibles) pour orienter vers des formules comparables — utile quand l'inflation masque un mauvais rapport garanties/prix.",
      },
    ],
  },
  "assurance-habitation-locataire-proprietaire-2026.html": {
    cta: { href: Q.habitation, label: "Questionnaire habitation" },
    blocks: [
      {
        type: "p",
        text: "Locataire, propriétaire occupant ou bailleur : trois statuts, trois logiques d'<strong>assurance habitation</strong>. L'erreur la plus fréquente ? Souscrire un contrat générique sans vérifier les <strong>risques locatifs</strong>, les plafonds mobilier ou la compatibilité colocation.",
      },
      { type: "h2", text: "Locataire : l'obligation quasi-systématique" },
      {
        type: "p",
        text: "Votre bail exige une assurance couvrant au minimum les <strong>risques locatifs</strong> (incendie, dégâts des eaux, explosion). Sans contrat valide, le propriétaire peut résilier le bail ou souscrire à vos frais. Vérifiez aussi la RC vie privée : elle couvre les dommages que vous causez à autrui.",
      },
      { type: "h2", text: "Propriétaire occupant : au-delà du minimum" },
      {
        type: "ul",
        items: [
          "Bâtiment + contenu + RC vie privée",
          "Vol, bris de glace, catastrophes naturelles (selon zones)",
          "Plafonds mobilier : attention aux objets de valeur (bijoux, électronique)",
          "Option protection juridique si litige voisinage ou copropriété",
        ],
      },
      { type: "bridge" },
      { type: "h2", text: "Colocation et sous-location : clarifier qui est assuré" },
      {
        type: "p",
        text: "Un contrat par colocataire ou un contrat global : les deux existent. En cas de sinistre, l'assureur veut savoir <strong>qui a causé le dommage</strong> et si chaque chambre est déclarée. Une colocation mal assurée = reste à charge entre colocataires.",
      },
      { type: "h2", text: "Combien ça coûte vraiment ?" },
      {
        type: "p",
        text: "Comptez souvent <strong>120 à 350 € / an</strong> pour un T2/T3 en province, plus en zone à risques (vol, séisme, inondation). Le questionnaire habitation estime votre profil (surface, étage, cave, valeur mobilier) pour éviter le sous-assurance.",
      },
    ],
  },
  "assurance-emprunteur-loi-lemoine-2026.html": {
    cta: { href: Q.emprunteur, label: "Questionnaire emprunteur" },
    blocks: [
      {
        type: "p",
        text: "L'<strong>assurance emprunteur</strong> peut représenter <strong>20 à 35 % du coût total</strong> d'un crédit immobilier. Depuis la <strong>loi Lemoine</strong>, changer d'assureur est plus simple — mais la banque exige une <strong>équivalence de garanties</strong>. C'est là que beaucoup échouent en comparant uniquement le prix mensuel.",
      },
      { type: "h2", text: "Ce que la Lemoine change concrètement" },
      {
        type: "ul",
        items: [
          "Résiliation à tout moment (plus besoin d'attendre l'échéance annuelle)",
          "Suppression du questionnaire médical sous conditions (âge, montant emprunté)",
          "Substitution de garanties si le contrat externe est équivalent",
          "Économie typique : <strong>3 000 à 15 000 €</strong> sur la durée du prêt",
        ],
      },
      { type: "h2", text: "Équivalence : le piège invisible" },
      {
        type: "p",
        text: "La banque compare décès, PTIA, ITT, IPT, IPP. Un contrat moins cher avec franchise ITT plus longue ou plafond IPT plus bas peut être <strong>refusé</strong>. Un courtier prépare le dossier d'équivalence pour éviter les allers-retours.",
      },
      { type: "bridge" },
      { type: "h2", text: "Méthode en 4 étapes" },
      {
        type: "ul",
        items: [
          "Récupérer le tableau de garanties exigé par la banque",
          "Chiffrer l'assurance groupe actuelle (TAEG assurance, pas seulement le taux crédit)",
          "Demander 2 à 3 devis délégation avec profil médical identique",
          "Envoyer la substitution avec attestation d'équivalence",
        ],
      },
    ],
  },
  "assurance-auto-jeune-conducteur-2026.html": {
    cta: { href: Q.auto, label: "Questionnaire auto jeune conducteur" },
    blocks: [
      {
        type: "p",
        text: "Premier véhicule, permis récent : la surprime <strong>jeune conducteur</strong> est mécanique (coefficient, expérience limitée). Pourtant, deux profils identiques peuvent payer <strong>40 à 60 % d'écart</strong> selon le véhicule, le kilométrage déclaré et le choix tiers / tiers plus / tous risques.",
      },
      { type: "h2", text: "Les leviers qui fonctionnent vraiment" },
      {
        type: "ul",
        items: [
          "<strong>Véhicule</strong> : groupe SRA bas, faible puissance, pas de sportive",
          "<strong>Conduite accompagnée / supervisée</strong> : accélère parfois le bonus",
          "<strong>Conducteur secondaire</strong> : parent au bon CRM peut aider (selon assureur)",
          "<strong>Kilométrage réel</strong> : forfait bas si véhicule urbain peu utilisé",
          "<strong>Franchise</strong> : plus haute = prime plus basse si trésorerie disponible",
        ],
      },
      { type: "bridge" },
      { type: "h2", text: "Tiers, tiers plus ou tous risques ?" },
      {
        type: "p",
        text: "Véhicule neuf ou crédit auto : tous risques souvent exigé par le financeur. Vieille citadine à 2 000 € : tiers peut suffire. Le questionnaire auto croise âge du permis, véhicule et usage pour orienter sans sur-assurer.",
      },
    ],
  },
  "assurance-auto-bonus-malus.html": {
    cta: { href: Q.auto, label: "Analyser mon CRM" },
    blocks: [
      {
        type: "p",
        text: "Le <strong>bonus-malus</strong> (coefficient CRM) modifie votre prime chaque année : −5 % sans sinistre responsable, +25 % (ou plus) après sinistre. Comprendre le CRM évite deux erreurs : changer d'assureur au mauvais moment, ou croire qu'un comparateur « efface » le malus.",
      },
      { type: "h2", text: "Comment le CRM évolue" },
      {
        type: "ul",
        items: [
          "CRM 1,00 = neutre ; 0,50 = bonus 50 % ; 1,25 = malus 25 %",
          "Plafond bonus : 0,50 (50 % de réduction max)",
          "Plafond malus : 1,50 (jusqu'à +50 %), voire plus selon historique",
          "Sinistre non responsable : pas de malus (sauf exceptions contractuelles)",
        ],
      },
      { type: "h2", text: "Changer d'assureur sans perdre son bonus" },
      {
        type: "p",
        text: "Le CRM est <strong>portable</strong> : le nouvel assureur reprend votre coefficient (relevé d'information). Comparez à garanties identiques : parfois un malus 1,20 chez un assureur compétitif coûte moins qu'un 1,00 ailleurs.",
      },
      { type: "bridge" },
    ],
  },
  "assurance-vtc-moins-cher-2026.html": {
    cta: { href: Q.vtc, label: "Questionnaire VTC (3 min)" },
    blocks: [
      {
        type: "p",
        text: "Payer moins cher son <strong>assurance VTC</strong> sans rogner sur la <strong>RC pro</strong>, c'est possible — si vous comparez à garanties strictement équivalentes (Uber, Bolt, Heetch, dommages passagers, véhicule). Baissez le prix au mauvais endroit et c'est votre activité qui s'arrête après un sinistre.",
      },
      { type: "h2", text: "7 leviers concrets (testés en 2026)" },
      {
        type: "ul",
        items: [
          "Franchise véhicule : plus haute si trésorerie sinistre disponible",
          "Kilométrage annuel déclaré : aligné sur la réalité plateforme",
          "Véhicule : catégorie, puissance, valeur — impact majeur sur la prime",
          "Sinistralité : anticiper le surcoût après un sinistre responsable",
          "Comparatif multi-assureurs VTC (Zéphir, Solly Azar, Allianz, AXA…)",
          "Regrouper RC pro + auto si l'assureur le permet avec une seule franchise sinistre",
          "Renégocier à l'échéance avec relevé d'information propre",
        ],
      },
      { type: "bridge" },
      {
        type: "p",
        text: "Notre questionnaire VTC reprend plateforme utilisée, véhicule, ancienneté permis pro et sinistres : vous obtenez une orientation vers les contrats compatibles — avant d'activer Uber ou Bolt.",
      },
    ],
  },
  "assurance-vtc-uber-bolt-heetch.html": {
    cta: { href: Q.vtc, label: "Vérifier mon contrat plateforme" },
    blocks: [
      {
        type: "p",
        text: "Uber, Bolt, Heetch exigent une <strong>assurance VTC</strong> avec transport de personnes à titre onéreux, RC pro adaptée et parfois des plafonds minimums. Un contrat auto classique + VTC « oubliée » = compte désactivé et sinistre non couvert.",
      },
      { type: "h2", text: "Checklist avant activation du compte" },
      {
        type: "ul",
        items: [
          "Attestation RC pro VTC avec mention transport de personnes",
          "Véhicule déclaré (immatriculation, usage pro)",
          "Plafonds dommages corporels passagers conformes",
          "Pas d'exclusion « activité VTC / plateforme » dans les conditions",
          "Carte VTC valide + visite médicale à jour",
        ],
      },
      { type: "bridge" },
      { type: "h2", text: "Multi-plateforme : un contrat suffit ?" },
      {
        type: "p",
        text: "En général oui, si le contrat couvre le transport de personnes via plateforme sans restriction nominative. Vérifiez toutefois les clauses « usage professionnel » et les franchises en cas de sinistre pendant une course.",
      },
    ],
  },
  "assurance-animaux-comment-choisir.html": {
    cta: { href: Q.animaux, label: "Questionnaire animaux" },
    blocks: [
      {
        type: "p",
        text: "Chien, chat ou NAC : l'<strong>assurance animaux</strong> se compare sur 4 chiffres — plafond annuel, taux de remboursement, franchise, délai de carence — pas sur le prix affiché en première page.",
      },
      { type: "h2", text: "Simulation rapide : chat vs chien" },
      {
        type: "ul",
        items: [
          "<strong>Chat intérieur</strong> : 15–35 €/mois, plafond 1 500–2 500 €/an souvent suffisant",
          "<strong>Chien grande race</strong> : 30–70 €/mois, viser 3 000–4 000 € de plafond",
          "<strong>Chiot/chaton</strong> : souscrire tôt limite les exclusions pathologies futures",
          "<strong>Sénior</strong> : carences plus longues — comparer avant les premiers signes",
        ],
      },
      { type: "h2", text: "Ce que les contrats excluent souvent" },
      {
        type: "p",
        text: "Maladies antérieures, sterilisation non urgente, certains vaccins, alimentation thérapeutique, comportement. Lisez les <strong>garanties prévention</strong> (antiparasitaires, vaccins) : c'est souvent là que Santévet, Bulle Bleue et Kozoo se différencient.",
      },
      { type: "bridge" },
    ],
  },
  "pret-immo-erreurs-a-eviter.html": {
    cta: { href: Q.credit, label: "Questionnaire crédit immo" },
    blocks: [
      {
        type: "p",
        text: "Un <strong>prêt immobilier</strong> se joue sur des détails : apport, durée, taux, assurance emprunteur, frais de notaire. Voici les <strong>7 erreurs</strong> qui coûtent le plus cher en 2026 — et comment les éviter avant signature chez le notaire.",
      },
      { type: "h2", text: "Erreur 1 — Négliger l'assurance emprunteur" },
      {
        type: "p",
        text: "La banque propose « son » assurance groupe. Sans comparer une délégation (loi Lemoine), vous laissez souvent <strong>5 000 à 12 000 €</strong> sur la table sur 20 ans.",
      },
      { type: "h2", text: "Erreur 2 — Maximiser la durée pour « respirer »" },
      {
        type: "p",
        text: "25 ans au lieu de 20 ans : mensualité plus basse, mais intérêts totaux bien plus élevés. Simulez 3 durées avec le même apport.",
      },
      { type: "h2", text: "Erreurs 3 à 7 (checklist)" },
      {
        type: "ul",
        items: [
          "Apport trop faible → taux plus haut + assurance plus chère",
          "Oublier les frais de garantie (hypothèque / caution)",
          "Signer sans clause de renégociation ou de remboursement anticipé claire",
          "Sous-estimer le reste à vivre (banque + votre budget réel)",
          "Ne pas faire jouer la concurrence entre banques avec un dossier prêt",
        ],
      },
      { type: "bridge" },
    ],
  },
  "mutuelle-remboursement-optique-dentaire-2026.html": {
    cta: { href: Q.sante, label: "Questionnaire mutuelle optique/dentaire" },
    blocks: [
      {
        type: "p",
        text: "L'<strong>optique</strong> et le <strong>dentaire</strong> concentrent souvent le plus gros reste à charge. Avant de changer de <strong>mutuelle santé</strong>, lisez le tableau de garanties poste par poste — pas seulement la cotisation mensuelle.",
      },
      { type: "h2", text: "Optique : montures, verres, lentilles" },
      {
        type: "p",
        text: "Depuis la reforme 100 % santé, certains équipements sont pris en charge sans reste à charge dans le panier prévu. Hors panier, votre mutuelle intervient en % de la <strong>BRSS</strong> avec des forfaits par équipement.",
      },
      {
        type: "ul",
        items: [
          "Monture : forfait tous les 2 ans (adulte)",
          "Verres : % BRSS selon correction simple / complexe",
          "Lentilles : forfait annuel si non remboursées par la Sécu",
          "Chirurgie réfractive : souvent exclue ou plafonnée",
        ],
      },
      { type: "h2", text: "Dentaire : soins, prothèses, orthodontie" },
      {
        type: "p",
        text: "Un implant ou une couronne peut laisser <strong>300 à 800 €</strong> à charge si le niveau BRSS est faible. C'est le poste le plus discriminant entre contrats « pas cher » et contrats réellement protecteurs.",
      },
      { type: "bridge" },
      { type: "h2", text: "Méthode comparatif en 3 étapes" },
      {
        type: "ul",
        items: [
          "Récupérer vos devis opticien / dentiste des 12 derniers mois",
          "Demander un tableau de garanties à postes équivalents",
          "Lancer le questionnaire mutuelle pour calibrer le bon niveau",
        ],
      },
    ],
  },
  "assurance-vtc-creation-chauffeur.html": {
    cta: { href: Q.vtc, label: "Questionnaire nouveau VTC" },
    blocks: [
      {
        type: "p",
        text: "Nouveau <strong>chauffeur VTC</strong> : l'ordre compte. Carte pro, visite médicale, immatriculation, puis <strong>assurance RC pro + véhicule</strong> avant la première course. Activer Uber sans attestation valide = risque pénal et sinistre non indemnisé.",
      },
      { type: "h2", text: "Ordre des démarches" },
      {
        type: "ul",
        items: [
          "Formation + examen VTC",
          "Carte professionnelle + inscription registre",
          "Véhicule conforme (âge, places, état)",
          "Assurance VTC (RC pro transport personnes + garanties véhicule)",
          "Inscription plateforme avec upload attestation",
        ],
      },
      { type: "bridge" },
    ],
  },
  "rc-pro-freelance-artisan-guide.html": {
    cta: { href: "../landings/questionnaire.html?need=rc-pro&journey=standard", label: "Questionnaire RC Pro" },
    blocks: [
      {
        type: "p",
        text: "Freelance, artisan, consultant : la <strong>RC professionnelle</strong> protège votre patrimoine personnel si un client, un tiers ou un partenaire subit un préjudice lié à votre activité. Obligatoire pour certaines professions, fortement recommandée pour toutes les autres.",
      },
      { type: "h2", text: "Obligatoire ou recommandée ?" },
      {
        type: "ul",
        items: [
          "<strong>Obligatoire</strong> : artisans BTP (souvent + décennale), agents immobiliers, experts-comptables, certaines activités réglementées",
          "<strong>Recommandée</strong> : coach, formateur, développeur, photographe, consultant — dès qu'un client peut réclamer un préjudice",
          "<strong>Plafonds</strong> : vérifiez ce qu'exigent vos clients (1 à 10 M€ selon secteur)",
        ],
      },
      { type: "bridge" },
    ],
  },
};

var NEW_ARTICLES = [
  {
    file: "mutuelle-collective-obligations-employeur-ani.html",
    section: "collective",
    tag: "Sante collective",
    tagClass: "tag-sante",
    title: "Mutuelle collective obligatoire : ANI, employeur et panier de soins en 2026",
    description:
      "Obligations mutuelle collective entreprise : ANI, financement employeur, panier de soins minimum, cadres et non-cadres. Devis mutuelle collective PME et TPE.",
    meta: "9 min · Juin 2026",
    cardExcerpt: "Obligations ANI et financement employeur expliques.",
    cta: { href: Q.collective, label: "Devis mutuelle collective" },
    blocks: [
      {
        type: "p",
        text: "Depuis l'<strong>Accord National Interprofessionnel (ANI)</strong>, toute entreprise du secteur prive doit proposer une <strong>complementaire sante collective</strong> a ses salaries. Pour un dirigeant de TPE ou PME, la question n'est plus « faut-il une mutuelle ? » mais <strong>quel niveau de garanties</strong>, <strong>quel budget</strong> et <strong>comment rester conforme</strong> sans surpayer.",
      },
      { type: "h2", text: "Qui est concerne par la mutuelle collective obligatoire ?" },
      {
        type: "p",
        text: "L'obligation concerne les entreprises du secteur prive qui emploient des salaries, y compris les tres petites structures. Les modalites peuvent varier selon la <strong>convention collective</strong> applicable : cadres, non-cadres, cotisation minimale, ayants droit ou niveau de garanties impose.",
      },
      {
        type: "ul",
        items: [
          "<strong>Salaries en CDI ou CDD</strong> : couverture obligatoire des l'embauche, sauf dispense prevue",
          "<strong>Cadres et non-cadres</strong> : parfois deux contrats distincts selon la convention",
          "<strong>Dirigeants non salaries</strong> : souvent hors contrat collectif, avec mutuelle TNS a part",
        ],
      },
      { type: "h2", text: "Le panier de soins ANI : le socle minimum" },
      {
        type: "p",
        text: "Le contrat collectif doit couvrir un <strong>panier de soins minimum</strong> : hospitalisation, soins courants, pharmacie, optique, dentaire, avec des niveaux de prise en charge definis par la reglementation. Un contrat trop bas expose l'employeur a un <strong>risque de non-conformite</strong>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Qui paie quoi : employeur vs salarie" },
      {
        type: "p",
        text: "L'employeur doit financer au minimum <strong>50 % de la cotisation</strong> de base, hors options facultatives. Beaucoup d'entreprises financent davantage pour attirer et fideliser, surtout lorsque les postes optique, dentaire et hospitalisation sont sensibles pour les salaries.",
      },
      {
        type: "ul",
        items: [
          "<strong>Part employeur</strong> : souvent 50 % a 100 % de la cotisation de base",
          "<strong>Part salarie</strong> : prelevee sur le bulletin, avec presentation claire",
          "<strong>Options famille</strong> : conjoint, enfants ou surcomplementaire, souvent a la charge du salarie",
        ],
      },
      { type: "h2", text: "Les 5 erreurs des employeurs" },
      {
        type: "ul",
        items: [
          "Choisir sur le prix seul sans lire le tableau de garanties",
          "Oublier la distinction cadres / non-cadres imposee par la convention",
          "Ne pas informer les salaries : notice, DUE, adhesion, dispenses",
          "Sous-estimer l'optique et le dentaire, sources de reclamations",
          "Renouveler par habitude sans mise en concurrence tous les 2 ou 3 ans",
        ],
      },
      { type: "h2", text: "Documents a preparer pour un devis collectif" },
      {
        type: "ul",
        items: [
          "Effectif a couvrir et repartition cadres / non-cadres",
          "Convention collective et eventuelle obligation conventionnelle",
          "Contrat actuel, echeance et dernier bilan de sinistralite si disponible",
          "Budget cible employeur et niveau de garanties souhaite",
          "SIRET et raison sociale",
        ],
      },
    ],
    related: [
      { href: "./mutuelle-collective-pme-tpe-budget-2026.html", label: "Budget mutuelle collective PME" },
      { href: "./mutuelle-collective-mise-en-place-due-portabilite.html", label: "DUE et portabilite" },
      { href: "../landings/sante-collective.html", label: "Demander un devis collectif" },
    ],
  },
  {
    file: "mutuelle-collective-pme-tpe-budget-2026.html",
    section: "collective",
    tag: "PME / TPE",
    tagClass: "tag-sante",
    title: "Mutuelle collective PME et TPE : comment budgeter et choisir en 2026",
    description:
      "Budget mutuelle collective PME/TPE, part employeur, niveaux de garanties et comparatif pour eviter de surpayer.",
    meta: "8 min · Juin 2026",
    cardExcerpt: "Budget par salarie et criteres de comparaison.",
    cta: { href: Q.collective, label: "Devis mutuelle collective" },
    blocks: [
      {
        type: "p",
        text: "Pour une <strong>PME de 10 a 50 salaries</strong> ou une <strong>TPE de 2 a 9</strong>, la mutuelle collective est a la fois un <strong>cout RH</strong>, un <strong>levier d'attractivite</strong> et une <strong>obligation legale</strong>. Le bon reflexe : definir un budget global, puis comparer des offres a <strong>garanties equivalentes</strong>.",
      },
      { type: "h2", text: "Ordres de grandeur du budget mutuelle collective" },
      {
        type: "p",
        text: "Le cout depend de l'<strong>age moyen</strong> du personnel, de la <strong>localisation</strong>, du <strong>niveau de garanties</strong> et de la <strong>structure de cotisation</strong> : isole, duo, famille. Deux entreprises de 15 salaries peuvent obtenir des tarifs tres differents.",
      },
      {
        type: "ul",
        items: [
          "<strong>Socle conforme ANI</strong> : fourchette basse, utile pour budget serre",
          "<strong>Niveau intermediaire</strong> : meilleur equilibre optique, dentaire, hospitalisation",
          "<strong>Niveau renforce</strong> : pertinent pour cadres ou metiers en tension",
        ],
      },
      { type: "h2", text: "TPE : specificites a ne pas negliger" },
      {
        type: "p",
        text: "Avec un petit effectif, chaque euro compte. Mais un contrat mal calibre genere des <strong>reclamations salariees</strong> et des renouvellements difficiles. Verifiez l'effet petit groupe, la simplicite administrative et la possibilite de faire evoluer le contrat lorsque l'effectif grandit.",
      },
      { type: "bridge" },
      { type: "h2", text: "Les 4 criteres de comparaison pour une PME" },
      {
        type: "ul",
        items: [
          "<strong>Tableau de garanties</strong> : hospitalisation, dentaire, optique, pharmacie",
          "<strong>Reste a charge</strong> : ce que paie encore le salarie",
          "<strong>Tiers payant et services</strong> : teleconsultation, reseau de soins",
          "<strong>Cout total employeur</strong> : cotisation x effectif, pas seulement prix unitaire",
        ],
      },
      { type: "h2", text: "Financement employeur : 50 %, 60 % ou 100 % ?" },
      {
        type: "p",
        text: "Le legal impose 50 % minimum sur la base. Strategiquement, financer 60 % a 80 %, voire la totalite, peut reduire le turnover. Calculez le <strong>cout annuel global</strong> : part employeur x 12 x effectif.",
      },
      { type: "h2", text: "Quand lancer une mise en concurrence ?" },
      {
        type: "ul",
        items: [
          "A l'embauche du premier salarie si aucun contrat n'existe",
          "Trois mois avant l'echeance du contrat actuel",
          "Apres une hausse superieure a 5-8 % sans gain de garanties",
          "Lors d'une croissance d'effectif ou d'un changement de convention collective",
        ],
      },
    ],
    related: [
      { href: "./mutuelle-collective-obligations-employeur-ani.html", label: "Obligations ANI employeur" },
      { href: "./mutuelle-collective-renouvellement-hausse-tarifs-2026.html", label: "Hausse tarifaire au renouvellement" },
      { href: "../landings/sante-collective.html", label: "Devis mutuelle collective PME" },
    ],
  },
  {
    file: "mutuelle-collective-mise-en-place-due-portabilite.html",
    section: "collective",
    tag: "Mise en place",
    tagClass: "tag-sante",
    title: "Mutuelle collective : mise en place, DUE, adhesion salarie et portabilite",
    description:
      "Decision unilaterale de l'employeur, adhesion, dispenses et portabilite : les etapes pour mettre en place une mutuelle collective.",
    meta: "8 min · Juin 2026",
    cardExcerpt: "Etapes pratiques de la souscription au depart salarie.",
    cta: { href: Q.collective, label: "Devis mutuelle collective" },
    blocks: [
      {
        type: "p",
        text: "Avoir choisi une offre de <strong>mutuelle collective</strong>, c'est une etape. La <strong>mise en place</strong> en est une autre : DUE, information des salaries, gestion des dispenses, adhesion et <strong>portabilite</strong> en cas de depart.",
      },
      { type: "h2", text: "Les etapes cles de la mise en place" },
      {
        type: "ul",
        items: [
          "<strong>Choix du contrat</strong> et validation du niveau de garanties",
          "<strong>Decision unilaterale de l'employeur</strong> ou accord collectif selon la situation",
          "<strong>Information des salaries</strong> : notice, cotisations, delais eventuels",
          "<strong>Adhesion</strong> automatique sauf dispense legale",
          "<strong>Parametrage paie</strong> : retenues salariales et part patronale",
        ],
      },
      { type: "h2", text: "La DUE : document incontournable" },
      {
        type: "p",
        text: "La <strong>Decision Unilaterale de l'Employeur</strong> formalise l'instauration ou la modification de la complementaire sante collective. Elle precise le personnel concerne, les garanties, la repartition employeur / salarie et les conditions de dispense.",
      },
      { type: "bridge" },
      { type: "h2", text: "Adhesion salarie et dispenses" },
      {
        type: "p",
        text: "L'adhesion est en principe <strong>obligatoire</strong> pour les salaries concernes. Certaines <strong>dispenses</strong> existent : couverture par ailleurs, CDD court, temps partiel sous seuil, beneficiaire CSS. Chaque cas doit etre documente.",
      },
      { type: "h2", text: "Portabilite : ce qui se passe au depart d'un salarie" },
      {
        type: "p",
        text: "En cas de rupture du contrat de travail, sauf faute lourde, le salarie peut beneficier de la <strong>portabilite</strong> des garanties sante et prevoyance collective sous conditions de droits au chomage et d'anciennete.",
      },
      {
        type: "ul",
        items: [
          "Duree de maintien liee a l'anciennete, dans la limite legale",
          "Financement mutualise par le contrat collectif",
          "Information du salarie sur ses droits des la notification de depart",
        ],
      },
      { type: "h2", text: "Changer de mutuelle collective sans perturber l'entreprise" },
      {
        type: "p",
        text: "Anticipez trois mois avant l'echeance, comparez a garanties equivalentes, preparez une nouvelle DUE et verifiez la continuite des remboursements en cours de soins.",
      },
    ],
    related: [
      { href: "./mutuelle-collective-obligations-employeur-ani.html", label: "Obligations ANI" },
      { href: "./mutuelle-collective-dispenses-salaries-cdd-temps-partiel.html", label: "Dispenses salaries" },
      { href: "../landings/sante-collective.html", label: "Devis collectif accompagne" },
    ],
  },
  {
    file: "mutuelle-collective-renouvellement-hausse-tarifs-2026.html",
    section: "collective",
    tag: "Renouvellement",
    tagClass: "tag-sante",
    title: "Mutuelle collective : que faire si le tarif augmente au renouvellement ?",
    description:
      "Hausse de cotisation mutuelle collective : analyser le renouvellement, comparer les garanties et renegocier sans perdre la conformite.",
    meta: "7 min · Juin 2026",
    cardExcerpt: "Hausse de cotisation : renegocier sans downgrade cache.",
    cta: { href: Q.collective, label: "Comparer mon contrat collectif" },
    blocks: [
      {
        type: "p",
        text: "Chaque fin d'annee, de nombreuses entreprises recoivent un avis de renouvellement avec une <strong>hausse de cotisation</strong>. Avant de signer ou de resilier dans l'urgence, separez trois sujets : inflation medicale, sinistralite du groupe et niveau reel des garanties.",
      },
      { type: "h2", text: "Lire l'avis de renouvellement ligne par ligne" },
      {
        type: "ul",
        items: [
          "Taux de hausse global et hausse par college : cadres, non-cadres, familles",
          "Evolution des postes optique, dentaire, hospitalisation",
          "Modification des exclusions, delais de carence ou reseaux de soins",
          "Part employeur absorbee ou repercutee sur les salaries",
        ],
      },
      { type: "h2", text: "Renegocier ou changer : le bon seuil d'alerte" },
      {
        type: "p",
        text: "Une hausse faible avec de bonnes garanties peut rester acceptable. Une hausse de <strong>5 a 10 %</strong> sans amelioration merite une mise en concurrence, surtout si votre effectif ou votre convention collective a change.",
      },
      { type: "bridge" },
      { type: "h2", text: "Comparer sans degrader la couverture" },
      {
        type: "p",
        text: "Le piege classique consiste a baisser le prix en supprimant ce que les salaries utilisent : dentaire, optique, chambre particuliere, teleconsultation. Demandez un tableau comparatif a garanties equivalentes, puis un scenario economique si vous acceptez un ajustement.",
      },
      { type: "h2", text: "Plan d'action en 30 jours" },
      {
        type: "ul",
        items: [
          "Semaine 1 : reunir contrat actuel, effectif, cotisations et avis de renouvellement",
          "Semaine 2 : demander 3 propositions alternatives a garanties equivalentes",
          "Semaine 3 : arbitrer part employeur, options et communication salarie",
          "Semaine 4 : signer, informer et planifier la transition si changement",
        ],
      },
    ],
    related: [
      { href: "./mutuelle-collective-pme-tpe-budget-2026.html", label: "Budget PME/TPE" },
      { href: "./mutuelle-collective-courtier-comparatif-assureurs.html", label: "Comparer avec un courtier" },
      { href: "../landings/sante-collective.html", label: "Demander une mise en concurrence" },
    ],
  },
  {
    file: "mutuelle-collective-convention-collective-ccn.html",
    section: "collective",
    tag: "Convention collective",
    tagClass: "tag-sante",
    title: "Mutuelle collective et convention collective : les points a verifier avant devis",
    description:
      "CCN, categories cadres/non-cadres, garanties minimales : verifier la convention collective avant de choisir une mutuelle entreprise.",
    meta: "7 min · Juin 2026",
    cardExcerpt: "CCN : les obligations qui changent le devis collectif.",
    cta: { href: Q.collective, label: "Verifier ma convention collective" },
    blocks: [
      {
        type: "p",
        text: "La <strong>convention collective nationale</strong> peut imposer des garanties superieures au panier ANI, une repartition employeur specifique ou des regles par categorie de personnel. Sans cette verification, un devis attractif peut etre inutilisable.",
      },
      { type: "h2", text: "Pourquoi la CCN change le devis" },
      {
        type: "ul",
        items: [
          "Niveau minimal en hospitalisation, dentaire ou optique",
          "Cotisation differente pour cadres et non-cadres",
          "Obligation de couvrir les ayants droit dans certains cas",
          "Regles de prevoyance associees a ne pas confondre avec la sante",
        ],
      },
      { type: "h2", text: "Les informations a fournir au courtier" },
      {
        type: "p",
        text: "Indiquez votre <strong>IDCC</strong>, votre activite reelle, votre effectif et les categories presentes. Si vous hesitez entre deux conventions, faites valider le sujet avant de comparer les assureurs.",
      },
      { type: "bridge" },
      { type: "h2", text: "Cadres, non-cadres : meme contrat ou contrats separes ?" },
      {
        type: "p",
        text: "Un contrat unique simplifie la gestion, mais certaines conventions ou politiques RH justifient deux colleges. L'enjeu est de rester <strong>objectif</strong>, conforme et lisible sur la fiche de paie.",
      },
      { type: "h2", text: "Checklist avant de demander un devis" },
      {
        type: "ul",
        items: [
          "Nom de la convention collective et IDCC",
          "Nombre de salaries cadres, non-cadres, apprentis, CDD",
          "Part employeur envisagee",
          "Contrat actuel et dernier avis d'echeance si renouvellement",
          "Objectif : budget minimal, attractivite RH ou garanties renforcees",
        ],
      },
    ],
    related: [
      { href: "./mutuelle-collective-obligations-employeur-ani.html", label: "Obligations employeur" },
      { href: "./mutuelle-collective-mise-en-place-due-portabilite.html", label: "Mise en place et DUE" },
      { href: "../landings/sante-collective.html", label: "Devis selon votre CCN" },
    ],
  },
  {
    file: "mutuelle-collective-dispenses-salaries-cdd-temps-partiel.html",
    section: "collective",
    tag: "Dispenses",
    tagClass: "tag-sante",
    title: "Mutuelle collective : dispenses salaries, CDD et temps partiel sans erreur",
    description:
      "CDD, apprentis, temps partiel, couverture par ailleurs : comprendre les dispenses mutuelle collective et les justificatifs a conserver.",
    meta: "6 min · Juin 2026",
    cardExcerpt: "Dispenses : eviter les oublis qui coutent cher.",
    cta: { href: Q.collective, label: "Structurer mon contrat collectif" },
    blocks: [
      {
        type: "p",
        text: "La mutuelle collective est obligatoire, mais certains salaries peuvent demander une <strong>dispense d'adhesion</strong>. Le risque pour l'employeur : accepter oralement une dispense sans justificatif, puis perdre la trace au controle ou lors d'un litige.",
      },
      { type: "h2", text: "Les cas frequents de dispense" },
      {
        type: "ul",
        items: [
          "Salarie deja couvert par une autre mutuelle obligatoire",
          "CDD court ou contrat de mission selon duree et acte de mise en place",
          "Temps partiel ou apprenti avec cotisation trop lourde par rapport au salaire",
          "Beneficiaire de la CSS ou d'une couverture individuelle temporaire",
        ],
      },
      { type: "h2", text: "Le justificatif fait la difference" },
      {
        type: "p",
        text: "Une dispense doit etre demandee par le salarie et documentee. Prevoyez un dossier par personne : formulaire date, motif, justificatif et date de fin de validite. Les renouvellements doivent etre suivis.",
      },
      { type: "bridge" },
      { type: "h2", text: "CDD, apprentis, saisonniers : les points sensibles" },
      {
        type: "p",
        text: "Les populations temporaires changent vite. Pour eviter les trous de process, integrez la mutuelle au parcours d'onboarding : notice, bulletin d'adhesion, formulaire de dispense, rappel a l'echeance.",
      },
      { type: "h2", text: "Erreur a eviter lors d'un changement de contrat" },
      {
        type: "p",
        text: "Lorsqu'une entreprise change de mutuelle collective, les dispenses existantes ne doivent pas etre supposees valables automatiquement. Revalidez les cas et archivez les nouveaux documents.",
      },
    ],
    related: [
      { href: "./mutuelle-collective-mise-en-place-due-portabilite.html", label: "DUE et adhesion" },
      { href: "./mutuelle-collective-convention-collective-ccn.html", label: "Convention collective" },
      { href: "../landings/sante-collective.html", label: "Accompagnement collectif" },
    ],
  },
  {
    file: "mutuelle-collective-courtier-comparatif-assureurs.html",
    section: "collective",
    tag: "Comparatif",
    tagClass: "tag-sante",
    title: "Comparer une mutuelle collective avec un courtier : methode et documents",
    description:
      "Courtier mutuelle collective : methode de comparaison, documents a fournir et criteres pour recevoir des propositions lisibles.",
    meta: "7 min · Juin 2026",
    cardExcerpt: "Courtier collectif : comparer vite et proprement.",
    cta: { href: Q.collective, label: "Lancer un comparatif collectif" },
    blocks: [
      {
        type: "p",
        text: "Comparer une <strong>mutuelle collective</strong> ne consiste pas a empiler des prix mensuels. Un courtier aligne les garanties, verifie la convention collective, isole la part employeur et transforme des tableaux complexes en decision lisible.",
      },
      { type: "h2", text: "Ce que le courtier compare vraiment" },
      {
        type: "ul",
        items: [
          "Conformite ANI et convention collective",
          "Postes consommes : hospitalisation, optique, dentaire, soins courants",
          "Services : tiers payant, reseau de soins, teleconsultation, assistance",
          "Gestion RH : adhesion, dispenses, portabilite, notices salaries",
          "Budget employeur annuel et reste a charge salarie",
        ],
      },
      { type: "h2", text: "Documents a envoyer pour gagner du temps" },
      {
        type: "p",
        text: "Un dossier complet permet d'obtenir des propositions plus vite : effectif, SIRET, convention collective, contrat actuel, avis de renouvellement, repartition cadres/non-cadres et objectif budget.",
      },
      { type: "bridge" },
      { type: "h2", text: "Comment lire le comparatif final" },
      {
        type: "p",
        text: "Demandez une vue en trois colonnes : contrat actuel, proposition economique, proposition equilibree. Le meilleur choix n'est pas toujours le moins cher : il doit reduire les irritants salaries sans exploser le cout employeur.",
      },
      { type: "h2", text: "Quand demander un comparatif ?" },
      {
        type: "ul",
        items: [
          "Creation de la premiere embauche",
          "Renouvellement annuel avec hausse de cotisation",
          "Fusion, acquisition ou forte croissance d'effectif",
          "Changement de convention collective ou creation d'un college cadres",
        ],
      },
    ],
    related: [
      { href: "./mutuelle-collective-renouvellement-hausse-tarifs-2026.html", label: "Renouvellement et hausse tarifaire" },
      { href: "./mutuelle-collective-pme-tpe-budget-2026.html", label: "Budget PME/TPE" },
      { href: "../landings/sante-collective.html", label: "Comparer avec Leads Opportunities" },
    ],
  },
  {
    file: "questionnaire-mutuelle-quel-niveau-choisir.html",
    section: "sante",
    tag: "Guide pratique",
    tagClass: "tag-sante",
    title: "Quel niveau de mutuelle choisir ? Le questionnaire qui tranche en 3 minutes",
    description:
      "Entrée de gamme, confort ou premium : comment choisir sa mutuelle sans surpayer. Questionnaire gratuit selon votre profil.",
    meta: "6 min · Juin 2026",
    cardExcerpt: "Entrée, confort ou premium : le bon niveau en 3 min.",
    cta: { href: Q.sante, label: "Lancer le questionnaire mutuelle" },
    blocks: [
      {
        type: "p",
        text: "« Entry », « confort », « premium » : les labels marketing ne veulent rien dire sans contexte. Un célibataire sans lunettes n'a pas les mêmes besoins qu'un couple avec deux enfants en orthodontie. Plutôt que deviner, partez d'une <strong>matrice simple</strong> : qui est couvert, quels postes de soins consommez-vous, quel budget mensuel maximum ?",
      },
      { type: "h2", text: "Profil A — Solo, peu de soins" },
      {
        type: "p",
        text: "Priorité : hospitalisation correcte + médecine courante. Optique/dentaire bas si pas de besoin annuel. Budget cible : <strong>30 à 55 €/mois</strong>.",
      },
      { type: "h2", text: "Profil B — Famille, optique et dentaire actifs" },
      {
        type: "p",
        text: "Priorité : dentaire (prothèses), optique (verres progressifs), pédiatrie. Ne sacrifiez pas l'hospitalisation pour maximiser l'optique. Budget cible : <strong>80 à 160 €/mois</strong> selon enfants.",
      },
      { type: "bridge" },
      { type: "h2", text: "Profil C — TNS / indépendant" },
      {
        type: "p",
        text: "Pas de part employeur : vous payez 100 %. Visez un bon niveau hospitalisation + prévoyance si revenus variables. Le questionnaire croise statut TNS et postes sensibles.",
      },
      {
        type: "p",
        text: "Notre <strong>questionnaire mutuelle</strong> (3 minutes, gratuit) reprend ces profils et oriente vers des formules comparables chez les principaux assureurs — sans engagement.",
      },
    ],
    related: [
      { href: "./mutuelle-sante-5-criteres.html", label: "5 critères mutuelle" },
      { href: "../assurance-sante/comparatif/", label: "Comparatif mutuelle" },
      { href: "../landings/sante.html", label: "Parcours mutuelle complet" },
    ],
  },
  {
    file: "assurance-habitation-sous-assurance-sinistre.html",
    section: "habitat",
    tag: "Habitation",
    tagClass: "tag-habitation",
    title: "Sous-assurance habitation : le piège qui ruine un sinistre",
    description:
      "Plafonds mobilier, valeur à neuf, exclusions : éviter le mauvais surprise le jour du sinistre. Questionnaire habitation gratuit.",
    meta: "7 min · Juin 2026",
    cardExcerpt: "Sinistre refusé ou mal indemnisé : causes fréquentes.",
    cta: { href: Q.habitation, label: "Questionnaire habitation" },
    blocks: [
      {
        type: "p",
        text: "Vous pensez être couvert — puis l'assureur indemnise <strong>30 % de vos biens</strong> ou refuse le sinistre pour « sous-évaluation du capital mobilier ». La sous-assurance habitation est l'une des causes les plus fréquentes de litige.",
      },
      { type: "h2", text: "Capital mobilier : la règle du inventaire" },
      {
        type: "p",
        text: "Listez chambre par chambre : électroménager, électronique, vêtements, mobilier. Un T3 peut facilement dépasser <strong>25 000 à 45 000 €</strong> de contenu. Déclarez ce total au contrat — pas une estimation « au pif ».",
      },
      { type: "h2", text: "Exclusions qui surprennent" },
      {
        type: "ul",
        items: [
          "Objets de valeur non déclarés (bijoux, art) — extension nécessaire",
          "Location Airbnb sans option tourisme",
          "Travaux non déclarés modifiant le risque",
          "Absence de déclaration cave / garage / dépendance",
        ],
      },
      { type: "bridge" },
      {
        type: "p",
        text: "Le questionnaire habitation estime surface, type de logement et valeur mobilier pour calibrer une couverture cohérente — avant le prochain dégât des eaux.",
      },
    ],
    related: [
      { href: "./assurance-habitation-locataire-proprietaire-2026.html", label: "Guide locataire / proprio" },
      { href: "../assurance-habitation/", label: "Assurance habitation" },
    ],
  },
  {
    file: "vtc-premiere-course-checklist-assurance.html",
    section: "vtc",
    tag: "Checklist VTC",
    tagClass: "tag-vtc",
    title: "Avant votre première course VTC : checklist assurance (Uber, Bolt, Heetch)",
    description:
      "RC pro, attestation, franchise, plateforme : la checklist assurance avant d'accepter la première course.",
    meta: "5 min · Juin 2026",
    cardExcerpt: "Checklist assurance avant la 1re course.",
    cta: { href: Q.vtc, label: "Questionnaire VTC express" },
    blocks: [
      {
        type: "p",
        text: "Vous avez votre carte VTC, le véhicule est prêt, l'appli Uber ou Bolt installée. Dernière étape critique : <strong>vérifier l'assurance</strong>. Une course sans couverture valide peut coûter votre activité — et votre patrimoine personnel.",
      },
      { type: "h2", text: "5 points à valider ce soir" },
      {
        type: "ul",
        items: [
          "Attestation RC pro VTC en cours de validité (PDF prêt pour la plateforme)",
          "Véhicule et immatriculation conformes au contrat",
          "Aucune exclusion « transport rémunéré de personnes »",
          "Franchise sinistre connue et provisionnée",
          "Numéro assistance 24h/24 enregistré dans le téléphone",
        ],
      },
      { type: "bridge" },
      {
        type: "p",
        text: "Pas sûr que votre contrat actuel passe ? Le <strong>questionnaire VTC</strong> vérifie plateforme, véhicule et ancienneté — réponse orientée en quelques minutes.",
      },
    ],
    related: [
      { href: "./assurance-vtc-creation-chauffeur.html", label: "Création activité VTC" },
      { href: "./assurance-vtc-uber-bolt-heetch.html", label: "Contrat compatible plateformes" },
      { href: "../landings/vtc.html", label: "Devis VTC complet" },
    ],
  },
  {
    file: "assurance-emprunteur-combien-economiser-lemoine.html",
    section: "habitat",
    tag: "Économies",
    tagClass: "tag-habitation",
    title: "Assurance emprunteur : combien pouvez-vous économiser avec la Lemoine ?",
    description:
      "Simulation économie assurance emprunteur, loi Lemoine, délégation externe : calculez le gain sur 15 ou 20 ans.",
    meta: "7 min · Juin 2026",
    cardExcerpt: "Lemoine : combien sur 20 ans de prêt ?",
    cta: { href: Q.emprunteur, label: "Questionnaire emprunteur" },
    blocks: [
      {
        type: "p",
        text: "Sur un prêt de <strong>250 000 € sur 20 ans</strong>, l'assurance groupe bancaire peut coûter <strong>80 à 150 €/mois</strong>. Une délégation externe équivalente descend souvent à <strong>45 à 90 €/mois</strong>. Sur la durée : <strong>8 000 à 18 000 €</strong> d'écart possible — à condition de respecter l'équivalence de garanties.",
      },
      { type: "h2", text: "Mini-simulation (ordre de grandeur)" },
      {
        type: "ul",
        items: [
          "Prêt 180 000 € / 20 ans : économie fréquente 4 000–10 000 €",
          "Prêt 350 000 € / 25 ans : économie fréquente 10 000–22 000 €",
          "Couple 40 ans non-fumeurs : profil souvent favorable en délégation",
          "Profil médical chargé : comparer quand même — tous les assureurs ne tarifient pas pareil",
        ],
      },
      { type: "bridge" },
      { type: "h2", text: "Prochaine étape" },
      {
        type: "p",
        text: "Récupérez votre tableau de garanties bancaire, puis lancez le <strong>questionnaire emprunteur</strong> : montant restant dû, âge, fumeur/non-fumeur, quotité — vous serez orienté vers une étude de substitution Lemoine.",
      },
    ],
    related: [
      { href: "./assurance-emprunteur-loi-lemoine-2026.html", label: "Guide loi Lemoine 2026" },
      { href: "../assurance-emprunteur/", label: "Assurance emprunteur" },
      { href: "../landings/credit-immo.html", label: "Étude crédit immo" },
    ],
  },
];

function applyUpgrades(articles) {
  var byFile = {};
  articles.forEach(function (a) {
    byFile[a.file] = a;
  });

  Object.keys(UPGRADES).forEach(function (file) {
    if (!byFile[file]) return;
    var patch = UPGRADES[file];
    if (patch.blocks) byFile[file].blocks = patch.blocks;
    if (patch.cta) byFile[file].cta = patch.cta;
    if (patch.cardExcerpt) byFile[file].cardExcerpt = patch.cardExcerpt;
    if (patch.description) byFile[file].description = patch.description;
    if (patch.title) byFile[file].title = patch.title;
  });

  NEW_ARTICLES.forEach(function (a) {
    if (!byFile[a.file]) {
      articles.push(a);
      byFile[a.file] = a;
    }
  });

  return articles;
}

module.exports = { applyUpgrades: applyUpgrades, UPGRADES: UPGRADES, NEW_ARTICLES: NEW_ARTICLES };
