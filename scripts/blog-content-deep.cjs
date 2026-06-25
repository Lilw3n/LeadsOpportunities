/**
 * Contenu approfondi par article (sections supplementaires + mots-cles cibles).
 */
var h2 = function (t) {
  return { type: "h2", text: t };
};
var h3 = function (t) {
  return { type: "h3", text: t };
};
var p = function (t) {
  return { type: "p", text: t };
};
var ul = function (items) {
  return { type: "ul", items: items };
};

var DEEP = {
  "elections-presidentielles-prevoyance-patrimoine.html": {
    keywords: [
      "elections presidentielles 2027",
      "assurance prevoyance",
      "assurance-vie",
      "assurance emprunteur",
      "credit immobilier",
      "protection du patrimoine",
      "arret de travail",
      "perte de revenus",
      "fiscalite assurance-vie",
      "loi Lemoine",
      "courtier ORIAS",
      "devis prevoyance",
      "independant TNS",
      "prevoyance deces",
      "epargne retraite",
    ],
    extraBlocks: [
      h2("Presidentielles et pouvoir d'achat : impact sur vos contrats"),
      p(
        "Les <strong>elections presidentielles</strong> relancent les debats sur les impots, le SMIC, l'immobilier et la protection sociale. Pour votre foyer, l'essentiel est de verifier si vos contrats actuels (<strong>mutuelle</strong>, <strong>prevoyance</strong>, <strong>assurance emprunteur</strong>, <strong>assurance-vie</strong>) restent alignes avec votre situation et vos objectifs de <strong>protection du patrimoine</strong>."
      ),
      h3("Salarie, independant, dirigeant : trois profils, trois besoins"),
      ul([
        "<strong>Salarie</strong> : prevoyance collective + surcomplémentaire, portabilite en cas de depart",
        "<strong>Independant / TNS</strong> : prevoyance obligatoire ou recommandee, maintien de revenus, ITT/IPT",
        "<strong>Investisseur immobilier</strong> : assurance emprunteur par pret, PNO, fiscalite locative",
      ]),
      h2("Assurance-vie et debats fiscaux"),
      p(
        "Chaque campagne evoque la <strong>fiscalite de l'assurance-vie</strong>. Plutot que de reactir au dernier tract, diversifiez les supports (fonds euros, unités de compte), clarifiez la clause beneficiaire et planifiez les versements sur plusieurs annees. Un <strong>bilan patrimonial</strong> avec un courtier evite les rachats paniques."
      ),
      h2("Credit immobilier : taux, assurance emprunteur, renégociation"),
      p(
        "Les marches anticipent parfois des mouvements de taux apres les scrutins. Si votre <strong>assurance emprunteur</strong> date de plus de deux ans, testez la <strong>loi Lemoine</strong> (changement d'assureur, suppression du questionnaire medical sous conditions). L'economie peut representer des milliers d'euros sur la duree du pret."
      ),
      h2("Checklist assurance avant un scrutin"),
      ul([
        "Mettre a jour les beneficiaires prevoyance / assurance-vie",
        "Verifier les plafonds ITT et invalidite",
        "Comparer l'assurance emprunteur (TAEG assurance)",
        "Revoir la mutuelle (hospitalisation, optique, dentaire)",
        "S'assurer que l'habitation correspond au logement actuel",
      ]),
    ],
    faq: [
      {
        q: "Les elections presidentielles font-elles monter les primes d'assurance ?",
        a: "Pas directement. En revanche, l'inflation, les sinistres (climat) et les taux influencent les tarifs. Anticipez par un comparatif annuel.",
      },
      {
        q: "Dois-je modifier mon assurance-vie avant les presidentielles ?",
        a: "Pas par peur politique : ajustez selon votre horizon, votre fiscalite et vos beneficiaires, avec un conseil patrimonial.",
      },
    ],
  },
  "ligue-champions-assurance-voyage-deplacement.html": {
    keywords: [
      "ligue des champions",
      "assurance voyage",
      "assurance annulation",
      "mutuelle etranger",
      "carte europeenne assurance maladie",
      "rapatriement sanitaire",
      "vol bagages",
      "responsabilite civile voyage",
      "deplacement europe foot",
      "finale ligue des champions",
      "assurance auto location",
      "courtier assurance",
    ],
    extraBlocks: [
      h2("Finale, demi-finale : budget voyage au-dela du billet"),
      p(
        "Billet d'avion, hotel, restauration, transport local : un week-end <strong>Ligue des champions</strong> a l'etranger peut depasser 1 000 a 2 000 EUR par personne. Sans <strong>assurance voyage</strong>, une annulation medicale ou un vol de bagages peut faire perdre l'integralite du budget."
      ),
      h2("Carte bancaire premium : ce qui est souvent inclus"),
      ul([
        "<strong>Assistance rapatriement</strong> (plafonds variables)",
        "<strong>Retard de transport</strong> ou vol manque",
        "<strong>Vol/perte bagages</strong> (franchise et plafond)",
        "Parfois <strong>annulation</strong> si justificatif medical",
      ]),
      p(
        "Lisez la notice de votre carte avant de souscrire un doublon. En zone euro, la <strong>Carte Europeenne d'Assurance Maladie (CEAM)</strong> facilite les soins urgents — elle ne remplace pas une mutuelle avec bon poste <strong>etranger</strong>."
      ),
      h2("Supporter en groupe : responsabilite civile"),
      p(
        "Organisateur du voyage, covoiturage, soiree a l'hotel : la <strong>responsabilite civile vie privee</strong> de votre assurance habitation peut intervenir, selon les cas. En cas de dommage corporel grave, les plafonds contractuels doivent etre a la hauteur."
      ),
    ],
  },
  "coupe-monde-2026-assurance-voyage-sante.html": {
    keywords: [
      "coupe du monde 2026",
      "mondial foot USA",
      "assurance voyage USA",
      "mutuelle internationale",
      "frais medicaux etats-unis",
      "rapatriement",
      "assurance annulation voyage",
      "location voiture assurance",
      "supporter foot deplacement",
      "World Cup 2026 assurance",
    ],
    extraBlocks: [
      h2("Mondial 2026 : USA, Mexique, Canada — sante en priorite"),
      p(
        "Aux <strong>Etats-Unis</strong>, une consultation ou une urgence sans couverture adaptee peut coutar plusieurs milliers de dollars. Avant le <strong>Coupe du monde 2026</strong>, verifiez les plafonds <strong>etranger</strong> de votre mutuelle et completez avec une <strong>assurance voyage sante</strong> si besoin."
      ),
      h2("Bagages, maillots, appareils photo"),
      p(
        "Vol dans l'avion, a l'hotel ou au fan zone : declarez la valeur des biens si votre contrat le permet. Photographiez les equipements, conservez les factures des maillots et gadgets."
      ),
      h2("Location de voiture au Mondial"),
      p(
        "La <strong>franchise</strong> proposee au comptoir peut etre refusee si votre <strong>assurance auto</strong> ou carte bancaire couvre deja la location a l'etranger — verification obligatoire avant depart."
      ),
    ],
  },
  "gta-6-sortie-assurance-gaming-materiel.html": {
    keywords: [
      "GTA 6",
      "GTA VI",
      "assurance console",
      "assurance PC gamer",
      "vol materiel informatique",
      "multirisque habitation",
      "plafond mobilier",
      "assurance streamer",
      "edition collector",
      "degats des eaux PC",
      "cambriolage console",
      "extension garantie",
    ],
    extraBlocks: [
      h2("Sortie GTA VI : combien couter votre setup ?"),
      p(
        "Console next-gen, <strong>PC gamer</strong>, ecran 144 Hz, casque, disque SSD : un setup pour <strong>GTA 6</strong> peut depasser 2 500 a 5 000 EUR. Sans <strong>assurance habitation</strong> correctement calibree, un cambriolage ou un <strong>degat des eaux</strong> peut tout faire perdre."
      ),
      h2("Plafonds mobilier et option high-tech"),
      p(
        "Beaucoup de contrats MRH plafonnent le mobilier global (ex. 15 000 a 30 000 EUR). Listez vos equipements : si la valeur depasse le plafond « objets de valeur » ou « appareils », souscrivez une extension ou une assurance materiel dediee."
      ),
      h2("Createurs de contenu et day one GTA"),
      {
        type: "gallery",
        label: "Plateformes live et contenus courts",
        items: [
          {
            src: "./images/streaming/gaming-live-arena.jpg",
            alt: "Arene gaming et evenement live esport",
            caption: "Evenements live et LAN — materiel transporte et expose",
          },
          {
            src: "./images/streaming/twitch-live-stream-setup.png",
            alt: "Poste de streaming Twitch avec eclairage colore",
            caption: "Twitch live — RC pro si monétisation",
          },
        ],
      },
      p(
        "Stream <strong>Twitch</strong>, <strong>YouTube</strong>, <strong>Shorts</strong> ou <strong>TikTok Live</strong> : basculez vers une <strong>RC professionnelle</strong> et une MRPro si vous monetisez. Voir notre article <a href=\"./assurance-streamer-gaming-setup-materiel.html\">assurance streamer gaming</a>."
      ),
      h2("Achat day one : carte bancaire et garantie constructeur"),
      ul([
        "Garantie legale de conformite (2 ans)",
        "Extension commerciale (souvent payante)",
        "Assurance casse/vol carte Gold/Platinum (delais et plafonds)",
        "Livraison : photos en cas de colis endommage",
      ]),
    ],
  },
  "gta-6-ps5-pro-budget-1000-euros-pret-conso.html": {
    keywords: [
      "GTA 6",
      "GTA VI",
      "PS5 Pro",
      "budget 1000 euros",
      "pret consommation",
      "credit conso",
      "mensualite pret",
      "TAEG",
      "simulation credit",
      "console PlayStation",
      "financement gaming",
      "reste a vivre",
    ],
    extraBlocks: [
      h2("Exemple de panier a 1 000 € (juin 2026)"),
      ul([
        "PS5 Pro : ~749 €",
        "GTA 6 edition standard : ~80 €",
        "Manette DualSense : ~75 €",
        "Cable HDMI / accessoires : ~50 €",
        "Marge promotions ou livraison : ~46 €",
      ]),
      h2("Regle simple : cout total avant mensualite"),
      p(
        "Une mensualite de <strong>31 €</strong> sur 36 mois peut sembler legere, mais le <strong>cout total du credit</strong> depasse souvent <strong>110 €</strong> pour 1 000 € empruntes. Inversement, <strong>87 €/mois</strong> sur 12 mois limite les interets. Demandez toujours le <strong>montant total du</strong> sur la fiche precontractuelle."
      ),
    ],
  },
  "pret-conso-gaming-ps5-pro-gta6-comparatif-2026.html": {
    keywords: [
      "pret personnel",
      "credit affecte",
      "3x sans frais",
      "GTA 6",
      "PS5 Pro",
      "credit magasin",
      "Fnac",
      "Darty",
      "comparatif pret conso",
      "Code consommation",
      "retractation 14 jours",
      "financement console",
    ],
    extraBlocks: [
      h2("Tableau mental : trois options pour 1 000 €"),
      ul([
        "<strong>Pret personnel</strong> : liberte d'achat, TAEG variable, versement sous quelques jours.",
        "<strong>Credit affecte magasin</strong> : souvent lie au panier, promos courtes, attention aux bundles.",
        "<strong>3x/4x carte</strong> : parfois sans TAEG (debit differe), parfois credit reglemente — lire le contrat.",
      ]),
      h2("Projet immobilier en parallele"),
      p(
        "Si vous achetez un logement dans l'annee, un credit conso gaming de 1 000 € peut faire basculer votre <strong>taux d'endettement</strong>. Reportez l'achat ou financez uniquement le jeu si vous avez deja la console."
      ),
    ],
  },
  "canicule-degats-eaux-assurance-habitation.html": {
    keywords: [
      "canicule France 2026",
      "assurance habitation",
      "degats des eaux",
      "catastrophe naturelle",
      "secheresse fissures maison",
      "inondation cave",
      "mutuelle canicule",
      "coup de chaleur",
      "declaration sinistre",
      "multirisque habitation",
      "assurance locataire",
    ],
    extraBlocks: [
      h2("Vague de chaleur : deux risques majeurs pour le logement"),
      p(
        "La <strong>canicule en France</strong> alterne secheresse des sols (fissures, mouvements) et orages violents (<strong>degats des eaux</strong>, caves inondees). Votre <strong>assurance habitation</strong> et l'etat de catastrophe naturelle (si arrete) determinent l'indemnisation."
      ),
      h2("Personnes fragiles et mutuelle"),
      p(
        "Personnes agees, nourrissons, malades chroniques : la chaleur augmente les consultations et hospitalisations. Verifiez les postes <strong>soins courants</strong>, <strong>hospitalisation</strong> et teleconsultation de votre <strong>mutuelle sante</strong>."
      ),
      h2("Prevention avant l'ete"),
      ul([
        "Ventiler, hydrater, identifier les personnes a risque",
        "Verifier toiture, gouttieres, evacuation des eaux pluviales",
        "Photographier l'etat des murs et caves (preuve avant sinistre)",
        "Connaitre le delai de declaration sinistre (5 jours ouvrables en general)",
      ]),
    ],
  },
  "assurance-emprunteur-loi-lemoine-2026.html": {
    keywords: [
      "assurance emprunteur",
      "loi Lemoine",
      "delegation assurance pret",
      "changer assurance emprunteur",
      "equivalence garanties",
      "questionnaire sante",
      "TAEG assurance",
      "resiliation assurance pret",
      "economie assurance emprunteur",
      "courtier assurance emprunteur",
      "pret immobilier",
    ],
    extraBlocks: [
      h2("Loi Lemoine : resiliation a tout moment (sous conditions)"),
      p(
        "Depuis 2022, la <strong>loi Lemoine</strong> facilite le <strong>changement d'assurance emprunteur</strong> : resiliation a tout moment apres la premiere année, suppression du questionnaire medical pour certains profils, substitution par un contrat equivalent."
      ),
      h2("Equivalence de garanties : ce que la banque verifie"),
      ul([
        "Deces et PTIA (perte totale et irreversible d'autonomie)",
        "ITT / IPT selon le dossier",
        "Plafonds et franchises alignes sur l'offre groupe",
        "Delais de carence comparables",
      ]),
      h2("Combien peut-on economiser ?"),
      p(
        "Selon l'age, le capital restant du et le tabac, l'economie peut atteindre <strong>30 a 50 %</strong> du cout annuel d'assurance emprunteur. Un courtier simule plusieurs assureurs (April, Generali, CNP, etc.) avant envoi a la banque."
      ),
    ],
  },
  "assurance-habitation-locataire-proprietaire-2026.html": {
    keywords: [
      "assurance habitation",
      "assurance locataire",
      "assurance proprietaire",
      "multirisque habitation",
      "risques locatifs",
      "responsabilite civile vie privee",
      "degats des eaux",
      "vol habitation",
      "colocation assurance",
      "devis habitation 2026",
    ],
    extraBlocks: [
      h2("Locataire : l'assurance est quasi obligatoire"),
      p(
        "Le bail exige une attestation couvrant au minimum les <strong>risques locatifs</strong> (incendie, explosion, degats des eaux). Sans <strong>assurance habitation locataire</strong>, vous pouvez etre tenu responsable des dommages au logement et aux voisins."
      ),
      h2("Proprietaire occupant vs bailleur"),
      ul([
        "<strong>Occupant</strong> : MRH complete (batiment si proprio, contenu, RC, vol)",
        "<strong>Bailleur</strong> : PNO pour le batiment loue + eventuelle GLI",
        "<strong>Colocation</strong> : un contrat par chambre ou contrat global — clarifier les sinistres communs",
      ]),
      h2("Degats des eaux : sinistre numero 1"),
      p(
        "Fuite, rupture de canalisation, infiltration : declarez vite, coupez l'eau, photographiez. La <strong>responsabilite civile</strong> peut etre engagee entre locataire, proprietaire et copropriete."
      ),
    ],
  },
  "mutuelle-sante-hospitalisation-2026.html": {
    keywords: [
      "mutuelle hospitalisation",
      "forfait journalier",
      "chambre particuliere",
      "remboursement chirurgie",
      "100 BRSS",
      "depassement honoraires",
      "mutuelle 2026",
      "comparatif mutuelle",
      "tiers payant hospitalier",
    ],
    extraBlocks: [
      h2("Hospitalisation : les postes qui font exploser la facture"),
      ul([
        "<strong>Honoraires chirurgien</strong> et anesthesiste (depassements)",
        "<strong>Forfait journalier</strong> hospitalier",
        "<strong>Chambre particuliere</strong>",
        "Frais de transport et accompagnant selon contrats",
      ]),
      h2("Lire un tableau de garanties mutuelle"),
      p(
        "Ne comparez pas que le prix : un contrat a 40 EUR/mois avec 80 % BRSS en chirurgie peut couter plus cher qu'une formule a 55 EUR avec 150 % et chambre partielle."
      ),
    ],
  },
  "assurance-vtc-moins-cher-2026.html": {
    keywords: [
      "assurance vtc pas cher",
      "reduire prime vtc",
      "comparatif assurance vtc",
      "rc pro vtc",
      "chauffeur uber",
      "bolt heetch",
      "franchise vtc",
      "bonus vtc",
      "devis vtc 2026",
    ],
    extraBlocks: [
      h2("7 leviers pour payer moins cher son assurance VTC"),
      ul([
        "Comparer a garanties equivalentes (RC pro, dommages, protection juridique)",
        "Ajuster la franchise et les plafonds",
        "Declarer correctement le kilometrage et la zone",
        "Anticiper le bonus / sinistralite",
        "Changer en loi Hamon a l'echeance",
        "Eviter les doublons (auto perso + vtc)",
        "Passer par un courtier specialise VTC",
      ]),
    ],
  },
  "mutuelle-remboursement-optique-dentaire-2026.html": {
    keywords: [
      "remboursement mutuelle optique",
      "remboursement dentaire mutuelle",
      "tableau garanties",
      "BRSS optique",
      "prothese dentaire",
      "mutuelle sante",
      "comparatif mutuelle",
      "devis mutuelle sante",
      "100 pourcent sante",
      "forfait lunettes",
      "orthodontie enfant",
      "courtier ORIAS",
    ],
    extraBlocks: [
      h2("Exemple chiffré : lunettes hors panier 100 % sante"),
      p(
        "Une monture a 200 EUR et des verres complexes a 400 EUR peuvent laisser 150 a 300 EUR a charge selon le niveau de <strong>remboursement mutuelle optique</strong>. Demandez le detail Secu + mutuelle avant achat."
      ),
      h2("Implant dentaire : lire le % sur prothese"),
      p(
        "Un devis dentaire detaille chaque acte (CCAM). Comparez le remboursement sur <strong>prothese</strong> et <strong>implant</strong> — c'est la ligne qui fait basculer le comparatif entre deux mutuelles au meme prix."
      ),
    ],
    faq: [
      {
        q: "Quelle difference entre BRSS 100 % et forfait optique ?",
        a: "La BRSS est une base Securite sociale ; la mutuelle ajoute un % ou un forfait. Un forfait eleve peut etre plus avantageux qu'un faible % sur une base basse.",
      },
      {
        q: "Puis-je changer de mutuelle pour l'optique en cours d'annee ?",
        a: "Oui selon votre contrat (echeance, portabilite, resiliation). Verifiez les delais de carence sur le dentaire avant de basculer.",
      },
    ],
  },
  "mutuelle-sante-famille-petit-budget-2026.html": {
    keywords: [
      "mutuelle sante famille",
      "assurance sante famille",
      "mutuelle pas cher",
      "meilleure mutuelle famille",
      "mutuelle famille tarif",
      "complementaire sante enfants",
      "hospitalisation famille",
      "devis mutuelle",
      "comparatif assurance sante",
      "courtier ORIAS",
      "surcomplementaire sante",
      "CMU-C CSS",
    ],
    extraBlocks: [
      h2("Profil famille : adapter les postes par age"),
      ul([
        "Enfants : pediatrie, orthodontie, vaccins",
        "Parents actifs : hospitalisation, optique moderee",
        "Seniors au foyer : optique, dentaire, medecine de ville",
      ]),
      h2("Mutuelle pas cher : pieges a eviter"),
      p(
        "Un contrat a 25 EUR/mois avec plafond hospitalisation bas peut couter plus cher qu'une formule a 45 EUR apres une seule operation. Calculez le <strong>reste a charge maximal</strong> sur un scenario reel."
      ),
    ],
  },
  "assurance-vtc-franchise-garanties-2026.html": {
    keywords: [
      "franchise assurance vtc",
      "garanties assurance vtc",
      "assurance vtc tarif",
      "rc pro vtc",
      "assurance chauffeur vtc",
      "devis assurance vtc",
      "comparatif assurance vtc",
      "tous risques vtc",
      "assurance uber bolt",
      "sinistre vtc",
      "courtier ORIAS",
      "assurance vtc rapide",
    ],
    extraBlocks: [
      h2("Sinistre VTC : qui paie quoi ?"),
      p(
        "Collision responsable : franchise materielle + impact bonus. Dommages passager : <strong>RC pro</strong>. Vol ou incendie : selon garanties souscrites. Gardez les photos, constat et declaration sous 48 h."
      ),
      h2("Lien avec les pages SEO VTC"),
      p(
        "Consultez nos guides <a href=\"../assurance-vtc/garanties-obligatoires/\">garanties obligatoires VTC</a> et la page <a href=\"../assurance-vtc/devis-rapide/\">devis rapide</a> pour un comparatif aligne a votre plateforme."
      ),
    ],
  },
  "taux-credit-immobilier-2026-frais-dossier.html": {
    keywords: [
      "taux credit immobilier 2026",
      "frais dossier credit",
      "assurance emprunteur",
      "simulation credit immo",
      "courtier pret immobilier",
      "TAEG pret immobilier",
      "loi Lemoine",
      "delegation assurance emprunteur",
      "frais notaire",
      "pret immobilier",
      "devis credit immobilier",
      "courtier ORIAS",
    ],
    extraBlocks: [
      h2("Simulation : integrer tous les couts"),
      ul([
        "Capital emprunte + interets",
        "Assurance emprunteur sur toute la duree",
        "Frais dossier + garantie + courtage",
        "Notaire et eventuels travaux",
      ]),
      h2("Taux 2026 : fixe ou revisable ?"),
      p(
        "En periode de taux variables, certains emprunteurs choisissent le fixe pour securiser la mensualite. Un <strong>courtier pret immobilier</strong> compare banques et courtiers sur un meme dossier (revenus, apport, duree)."
      ),
    ],
  },
  "rachat-credit-immobilier-guide-2026.html": {
    keywords: [
      "rachat credit immobilier",
      "regroupement de credits",
      "baisse mensualites",
      "rachat credit immo",
      "simulation credit immo",
      "courtier credit immobilier",
      "taux endettement",
      "IRA remboursement anticipe",
      "assurance emprunteur rachat",
      "pret immobilier",
      "devis credit immobilier",
      "courtier ORIAS",
    ],
    extraBlocks: [
      h2("Rachat pur immo vs rachat de credits mixtes"),
      p(
        "Le <strong>rachat de credit immobilier</strong> seul renegocie le taux du pret immo. Le regroupement inclut consommation et revolving : mensualite plus basse, duree souvent allongee."
      ),
      h2("Checklist avant de signer un rachat"),
      ul([
        "Comparer cout total avant / apres (pas seulement la mensualite)",
        "Verifier IRA et frais de dossier",
        "Revoir l'assurance emprunteur du nouveau pret",
        "Confirmer le taux d'endettement apres operation",
      ]),
    ],
  },
};

function getOverride(file) {
  return DEEP[file] || null;
}

module.exports = { getOverride: getOverride, DEEP: DEEP };
