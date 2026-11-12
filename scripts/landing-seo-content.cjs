/**
 * Contenu de fond des pages devis professionnelles (landings).
 * Ces pages ne portaient qu'un titre et deux boutons : rien à lire pour Google ni pour le visiteur.
 * Règles : pas de tarif, pas de statistique, pas de nom d'assureur. Seulement ce que dit la loi
 * et ce que l'assureur demande avant de chiffrer.
 * Clé = nom du fichier dans /landings/.
 */
var DEVIS_GRATUIT = {
  q: "Le devis est-il payant ?",
  a: "Non. La demande est gratuite et sans engagement. Vous décrivez l'activité, un conseiller vous rappelle et vous compare plusieurs assureurs.",
};

module.exports = {
  "rc-pro.html": {
    service: "Assurance responsabilité civile professionnelle",
    title: "Assurance RC Pro : devis responsabilité civile professionnelle",
    description:
      "Devis RC Pro pour indépendants, artisans et sociétés : dommages aux clients, erreurs, plafonds et franchise. Courtier ORIAS, rappel rapide, sans engagement.",
    h1: "Assurance RC Pro : devis responsabilité civile professionnelle",
    sections: [
      {
        h2: "À quoi sert la RC Pro",
        p: [
          "La responsabilité civile professionnelle paie à votre place quand votre activité cause un dommage à un client ou à un tiers. Un client qui chute dans vos locaux, un matériel abîmé chez lui, un conseil erroné qui lui fait perdre de l'argent : sans contrat, c'est votre trésorerie, voire votre patrimoine personnel, qui répond.",
          "On distingue trois volets. La <strong>RC exploitation</strong> couvre les dommages causés pendant le travail. La <strong>RC professionnelle</strong> au sens strict couvre les fautes, erreurs et omissions dans la prestation. La <strong>RC après livraison</strong> couvre ce qui survient une fois le produit vendu ou le travail terminé.",
        ],
      },
      {
        h2: "Est-elle obligatoire ?",
        p: [
          "Elle est imposée par la loi aux professions réglementées : santé, droit, expertise comptable, immobilier, courtage en assurance et en crédit, agents de voyage, entre autres. Dans le bâtiment, c'est la <a href=\"./decennale.html\">décennale</a> qui est obligatoire, et elle se souscrit presque toujours avec une RC Pro.",
          "Pour les autres métiers, elle n'est pas exigée par la loi mais souvent par le client : un donneur d'ordre, une plateforme ou un bailleur demande une attestation avant de signer.",
        ],
      },
      {
        h2: "Ce que l'assureur regarde avant de chiffrer",
        list: [
          "L'activité exacte, telle qu'elle sera écrite au contrat : une activité non déclarée n'est pas couverte",
          "Le chiffre d'affaires et, s'il y en a, la part sous-traitée",
          "Le nombre de salariés et les antécédents de sinistres",
          "Le plafond de garantie demandé par vos clients et la franchise que vous acceptez",
          "La zone d'intervention : France seule, Europe, monde",
        ],
      },
      {
        h2: "Ce que la RC Pro ne couvre pas",
        p: [
          "Elle ne répare pas vos propres biens : locaux, stock et matériel relèvent de la <a href=\"./multirisque-professionnelle.html\">multirisque professionnelle</a>. Elle ne couvre ni vos véhicules (<a href=\"./flotte-vehicules.html\">flotte</a>), ni vos frais d'avocat dans un litige commercial (<a href=\"./protection-juridique-pro.html\">protection juridique</a>), ni votre arrêt de travail (<a href=\"./prevoyance-tns.html\">prévoyance TNS</a>).",
        ],
      },
    ],
    faq: [
      {
        q: "Un auto-entrepreneur a-t-il besoin d'une RC Pro ?",
        a: "Oui dès qu'il intervient chez un client ou donne un conseil. Le statut de micro-entrepreneur ne limite pas la responsabilité : en cas de dommage, il répond sur ses biens. La RC Pro est obligatoire s'il exerce une profession réglementée ou un métier du bâtiment.",
      },
      {
        q: "Que se passe-t-il si je change d'assureur ou si j'arrête mon activité ?",
        a: "La plupart des contrats fonctionnent en base réclamation : c'est le contrat en cours au moment de la réclamation qui joue. Après la résiliation, une garantie subséquente d'au moins cinq ans prend le relais pour les faits antérieurs. Il faut le vérifier avant de résilier.",
      },
      {
        q: "En combien de temps puis-je avoir une attestation ?",
        a: "Pour une activité courante et sans sinistre, l'attestation peut être émise dès l'accord de l'assureur et le premier règlement. Les activités techniques ou à risque demandent une étude plus longue.",
      },
      DEVIS_GRATUIT,
    ],
  },

  "decennale.html": {
    service: "Assurance décennale",
    title: "Assurance décennale artisan : devis et attestation",
    description:
      "Devis assurance décennale pour artisans, auto-entrepreneurs et entreprises du bâtiment. Obligation légale, activités couvertes, attestation de chantier. Courtier ORIAS.",
    h1: "Assurance décennale : devis pour artisans et entreprises du bâtiment",
    sections: [
      {
        h2: "Une assurance obligatoire avant le premier chantier",
        p: [
          "Tout professionnel qui construit ou rénove un ouvrage est responsable pendant dix ans, à compter de la réception des travaux, des dommages qui compromettent la solidité de l'ouvrage ou le rendent impropre à sa destination. La loi l'oblige à s'assurer pour cette responsabilité avant l'ouverture du chantier.",
          "L'obligation vaut pour l'artisan seul, le micro-entrepreneur comme pour la société. Les références du contrat doivent figurer sur les devis et les factures, et l'attestation est remise au client. Travailler sans décennale est un délit, puni d'une amende et d'une peine d'emprisonnement.",
        ],
      },
      {
        h2: "Ce que couvre la décennale, et ce qu'elle ne couvre pas",
        list: [
          "Couvert : fissures qui menacent la structure, infiltrations en toiture, affaissement de plancher, défaut d'étanchéité, installation qui rend le logement inhabitable",
          "Non couvert : les défauts purement esthétiques, l'usure normale, les dommages causés pendant le chantier à un tiers, qui relèvent de la RC Pro",
          "À ne pas confondre : la garantie de parfait achèvement (un an) et la garantie de bon fonctionnement des équipements (deux ans)",
        ],
      },
      {
        h2: "Ce que l'assureur demande pour un devis",
        list: [
          "Les activités exercées, selon la nomenclature du bâtiment : seules celles qui sont déclarées sont assurées",
          "L'expérience et les diplômes dans chaque activité",
          "Le chiffre d'affaires travaux, la part sous-traitée et la part donnée en sous-traitance",
          "Les sinistres déclarés et l'historique d'assurance, résiliation comprise",
          "Les techniques employées : courantes ou non",
        ],
        p: [
          "Création d'entreprise, reprise après résiliation, activité ajoutée en cours d'année : chaque situation se plaide différemment auprès des assureurs. C'est le travail du courtier.",
        ],
      },
      {
        h2: "Les contrats qui vont avec",
        p: [
          "La décennale se souscrit avec une <a href=\"./rc-pro.html\">RC Pro</a> pour les dommages causés pendant les travaux. L'atelier, le dépôt et l'outillage relèvent de la <a href=\"./multirisque-professionnelle.html\">multirisque professionnelle</a>, les fourgons d'un contrat auto ou <a href=\"./flotte-vehicules.html\">flotte</a>. Vue d'ensemble par métier sur la page <a href=\"./metiers-batiment.html\">assurances des métiers du bâtiment</a>.",
        ],
      },
    ],
    faq: [
      {
        q: "Un auto-entrepreneur du bâtiment doit-il avoir une décennale ?",
        a: "Oui. L'obligation dépend des travaux réalisés, pas du statut. Un micro-entrepreneur maçon, plaquiste, électricien ou plombier doit être assuré avant son premier chantier.",
      },
      {
        q: "La décennale couvre-t-elle les chantiers terminés avant la souscription ?",
        a: "Non. Le contrat couvre les chantiers ouverts pendant sa période de validité. Les travaux réalisés sans assurance restent à la charge du professionnel pendant dix ans.",
      },
      {
        q: "Que devient la garantie si je cesse mon activité ?",
        a: "Les chantiers ouverts pendant que le contrat était en vigueur restent couverts dix ans après leur réception, même si l'entreprise a fermé ou changé d'assureur.",
      },
      {
        q: "Tous les métiers du bâtiment sont-ils concernés ?",
        a: "Tous ceux qui participent à la construction d'un ouvrage : gros œuvre, charpente, couverture, étanchéité, plomberie, électricité, menuiserie, carrelage, isolation. Certaines prestations, comme le simple entretien, n'en relèvent pas : on le vérifie activité par activité.",
      },
    ],
  },

  "multirisque-professionnelle.html": {
    service: "Assurance multirisque professionnelle",
    title: "Multirisque professionnelle : devis locaux, stock, matériel",
    description:
      "Devis multirisque professionnelle (MRP) : incendie, dégât des eaux, vol, bris de machine, perte d'exploitation. Commerce, bureau, atelier. Courtier ORIAS.",
    h1: "Multirisque professionnelle : devis pour vos locaux, votre stock et votre matériel",
    sections: [
      {
        h2: "Ce que couvre une multirisque professionnelle",
        p: [
          "La multirisque professionnelle, ou MRP, protège ce que l'entreprise possède et occupe : les murs si vous êtes propriétaire, votre responsabilité de locataire sinon, les aménagements, le mobilier, le matériel, les marchandises.",
        ],
        list: [
          "Incendie, explosion, dégât des eaux, événements climatiques, catastrophes naturelles",
          "Vol et vandalisme, sous conditions de protection des locaux",
          "Bris de glace, enseigne et vitrine",
          "Bris de machine et dommages électriques sur le matériel",
          "Perte d'exploitation : la marge perdue et les charges fixes pendant l'arrêt d'activité après un sinistre",
        ],
      },
      {
        h2: "Est-elle obligatoire ?",
        p: [
          "La loi ne l'impose pas à tous, mais un bail commercial ou professionnel exige presque toujours que le locataire assure les risques locatifs et en justifie chaque année. Sans attestation, le bailleur peut faire jouer la clause de résiliation du bail.",
        ],
      },
      {
        h2: "Ce qu'il faut préparer pour le devis",
        list: [
          "L'adresse, la surface et l'usage des locaux : commerce, bureau, atelier, entrepôt",
          "Votre qualité : locataire, propriétaire occupant, copropriétaire",
          "La valeur du matériel et du stock, au plus haut de l'année",
          "Les protections en place : alarme, rideau métallique, extincteurs",
          "Le chiffre d'affaires et la marge, pour dimensionner la perte d'exploitation",
        ],
      },
      {
        h2: "MRP, RC Pro, immeuble : trois contrats distincts",
        p: [
          "La MRP répare vos biens. La <a href=\"./rc-pro.html\">RC Pro</a> indemnise les tiers. Si vous êtes propriétaire de murs que vous louez à une autre entreprise, c'est l'<a href=\"./immeuble-professionnel.html\">assurance de l'immeuble</a> qu'il vous faut. Beaucoup de contrats regroupent MRP et RC exploitation : on le vérifie ligne par ligne.",
        ],
      },
    ],
    faq: [
      {
        q: "Je travaille à domicile, mon assurance habitation suffit-elle ?",
        a: "Rarement. La plupart des contrats habitation excluent le matériel professionnel, le stock et l'accueil de clients. Il faut soit une extension, soit une multirisque professionnelle adaptée au domicile.",
      },
      {
        q: "La perte d'exploitation est-elle incluse d'office ?",
        a: "Non, c'est une garantie optionnelle dans beaucoup de contrats. Elle ne joue qu'à la suite d'un dommage garanti, comme un incendie ou un dégât des eaux, et pour une durée fixée au contrat.",
      },
      {
        q: "Mon matériel est-il couvert hors des locaux ?",
        a: "Seulement si le contrat le prévoit : garantie du matériel transporté, en clientèle ou sur chantier. C'est un point à déclarer dès le devis.",
      },
      DEVIS_GRATUIT,
    ],
  },

  "metiers-batiment.html": {
    service: "Assurances des artisans du bâtiment",
    title: "Assurance artisan du bâtiment : décennale, RC Pro, atelier",
    description:
      "Maçon, couvreur, électricien, plombier, plaquiste, peintre : les assurances obligatoires et utiles d'un artisan du bâtiment. Devis décennale et RC Pro, courtier ORIAS.",
    h1: "Assurance artisan du bâtiment : décennale, RC Pro et atelier",
    sections: [
      {
        h2: "Les quatre contrats d'une entreprise du bâtiment",
        list: [
          "La décennale, obligatoire : dix ans de garantie sur la solidité de l'ouvrage après réception",
          "La RC Pro : les dommages causés à un client ou à un voisin pendant le chantier, et après",
          "La multirisque : atelier, dépôt, outillage, matériel sur chantier",
          "L'auto ou la flotte : fourgons et utilitaires, avec l'outillage transporté",
        ],
        p: [
          "S'y ajoutent, dès le premier salarié, la mutuelle d'entreprise obligatoire, et pour le dirigeant une <a href=\"./prevoyance-tns.html\">prévoyance</a> en cas d'arrêt de travail.",
        ],
      },
      {
        h2: "Par corps de métier",
        list: [
          "Gros œuvre, maçonnerie, charpente, couverture, étanchéité : décennale étudiée de près, l'expérience et les sinistres passés comptent beaucoup",
          "Plomberie, chauffage, électricité : décennale et RC, avec une attention aux dégâts des eaux et aux incendies après intervention",
          "Plâtrerie, menuiserie, carrelage, peinture : décennale pour tout ce qui touche à l'ouvrage, RC pour le reste",
          "Ramonage et fumisterie : une page dédiée, <a href=\"./ramonage.html\">assurance ramoneur</a>",
        ],
      },
      {
        h2: "Ce qui fait refuser ou renchérir un dossier",
        p: [
          "Une activité exercée mais non déclarée, une résiliation par un précédent assureur, un chiffre d'affaires sous-estimé, des techniques non courantes. Mieux vaut l'écrire dès la demande : un courtier présente le dossier à l'assureur qui accepte ce profil, plutôt que d'essuyer un refus.",
        ],
      },
    ],
    faq: [
      {
        q: "Peut-on avoir une décennale en création d'entreprise ?",
        a: "Oui. L'assureur regarde alors les diplômes et l'expérience acquise comme salarié dans l'activité. Les certificats de travail et bulletins de paie servent de justificatifs.",
      },
      {
        q: "Un seul contrat peut-il tout couvrir ?",
        a: "Décennale et RC Pro sont le plus souvent réunies dans un même contrat. Les locaux, l'outillage et les véhicules restent des contrats séparés.",
      },
      {
        q: "Je sous-traite une partie des chantiers, est-ce un problème ?",
        a: "Non, mais il faut le déclarer et vérifier que chaque sous-traitant a sa propre décennale. Vous restez responsable devant le client.",
      },
    ],
  },

  "garage-negociant-auto.html": {
    service: "Assurance garage et négociant automobile",
    title: "Assurance garage et négociant auto : devis professionnel",
    description:
      "Devis assurance garage, carrosserie et négociant auto : véhicules confiés, essais, stock, atelier, RC après travaux. Courtier ORIAS, rappel rapide.",
    h1: "Assurance garage et négociant auto : véhicules confiés, stock et atelier",
    sections: [
      {
        h2: "Les risques propres à un garage",
        list: [
          "Les véhicules confiés : la voiture d'un client endommagée, volée ou incendiée pendant qu'elle est sous votre garde",
          "La RC après travaux : un accident causé par une réparation défectueuse",
          "Les essais et les déplacements : conduite d'un véhicule client ou d'un véhicule en plaque de garage",
          "Le stock de véhicules à vendre, sur parc ou en hall",
          "L'atelier : pont, cabine de peinture, outillage, pollution accidentelle",
        ],
      },
      {
        h2: "Ce que l'assureur demande",
        list: [
          "L'activité précise : mécanique, carrosserie, peinture, pneumatique, vente de véhicules neufs ou d'occasion, dépannage",
          "Le nombre de véhicules confiés et en stock, et leur valeur moyenne",
          "Le nombre de plaques de garage et de personnes amenées à conduire",
          "La protection du site : clôture, alarme, stationnement intérieur ou extérieur",
        ],
      },
      {
        h2: "Ce qui reste à part",
        p: [
          "Les véhicules de l'entreprise elle-même, dépanneuse comprise, relèvent d'un contrat auto ou <a href=\"./flotte-vehicules.html\">flotte</a>. Le déplacement de véhicules pour le compte de tiers est un autre métier : voir <a href=\"./convoyage-vehicules.html\">convoyage</a>. Les murs et le matériel se règlent en <a href=\"./multirisque-professionnelle.html\">multirisque professionnelle</a>.",
        ],
      },
    ],
    faq: [
      {
        q: "L'assurance du client couvre-t-elle sa voiture dans mon garage ?",
        a: "Pas pour les dommages dont vous êtes responsable. Dès que le véhicule vous est confié, vous en avez la garde : c'est votre contrat qui doit répondre.",
      },
      {
        q: "Un négociant sans atelier a-t-il besoin de ce contrat ?",
        a: "Oui, pour le stock, les essais par les acheteurs et la responsabilité liée à la vente. Le contrat est simplement construit sans le volet réparation.",
      },
      {
        q: "Les véhicules de prêt sont-ils couverts ?",
        a: "Uniquement si le contrat le prévoit. C'est une garantie à demander explicitement, avec les conditions de prêt.",
      },
    ],
  },

  "transport-logistique.html": {
    service: "Assurance transport de marchandises et logistique",
    title: "Assurance transport de marchandises et logistique : devis",
    description:
      "Devis assurance transporteur, messagerie, commissionnaire et entrepôt : marchandises transportées, responsabilité contractuelle, RC exploitation. Courtier ORIAS.",
    h1: "Assurance transport de marchandises et logistique",
    sections: [
      {
        h2: "La marchandise n'est pas assurée par le contrat du camion",
        p: [
          "L'assurance du véhicule couvre la circulation et le véhicule lui-même. La marchandise confiée relève de la responsabilité contractuelle du transporteur, qui est plafonnée par les contrats types. Au-delà de ces plafonds, le client n'est indemnisé que s'il existe une assurance de la marchandise en valeur déclarée.",
        ],
      },
      {
        h2: "Les garanties à réunir",
        list: [
          "Responsabilité civile contractuelle du transporteur : perte, avarie, retard",
          "Marchandises transportées pour compte propre : vos propres biens dans vos véhicules",
          "RC exploitation et entrepôt : marchandises stockées, quai, manutention",
          "Commissionnaire de transport : responsabilité du fait des transporteurs que vous choisissez",
          "Véhicules : contrat auto ou flotte, à part",
        ],
      },
      {
        h2: "Ce qu'il faut décrire",
        list: [
          "Compte propre ou compte d'autrui, et inscription au registre des transporteurs",
          "Nature des marchandises : général, fragile, sous température dirigée, matières dangereuses",
          "Valeur moyenne et maximale d'un chargement",
          "Zone : régional, national, international",
          "Recours à des sous-traitants",
        ],
      },
    ],
    faq: [
      {
        q: "Je livre mes propres produits, suis-je transporteur ?",
        a: "Non, c'est du transport pour compte propre. Il vous faut une garantie des marchandises transportées, souvent en extension de la multirisque ou du contrat auto.",
      },
      {
        q: "Le vol du chargement est-il couvert ?",
        a: "Sous conditions inscrites au contrat : stationnement, fermeture du véhicule, durée de l'arrêt. Ces clauses sont à lire avant de signer, car elles décident de l'indemnisation.",
      },
      {
        q: "Et les véhicules eux-mêmes ?",
        a: "Ils sont assurés par un contrat auto ou flotte distinct. Le convoyage de véhicules vides et le transport de personnes ont chacun leur parcours.",
      },
    ],
    links: [
      ["./flotte-vehicules.html", "Assurance flotte"],
      ["./convoyage-vehicules.html", "Convoyage de véhicules"],
    ],
  },

  "transport-voyageurs.html": {
    service: "Assurance transport de voyageurs",
    title: "Assurance transport de voyageurs : autocar, navette, scolaire",
    description:
      "Devis assurance transport de personnes : autocar, minibus, navette, transport scolaire ou occasionnel. Responsabilité envers les passagers. Courtier ORIAS.",
    h1: "Assurance transport de voyageurs : autocar, navette et transport scolaire",
    sections: [
      {
        h2: "Une responsabilité lourde envers les passagers",
        p: [
          "Transporter des personnes à titre onéreux engage la responsabilité du transporteur pour chaque passager. Le contrat doit mentionner l'usage exact : ligne régulière, transport scolaire, tourisme, navette d'entreprise ou d'hôtel, transport à la demande.",
        ],
      },
      {
        h2: "Ce que l'assureur demande",
        list: [
          "Le nombre et le type de véhicules : minibus, autocar, nombre de places",
          "Les conducteurs : ancienneté du permis D, formations, sinistres",
          "Le type de service et la zone : locale, nationale, étranger",
          "L'inscription au registre des transporteurs de voyageurs",
        ],
      },
      {
        h2: "VTC et taxi : un autre parcours",
        p: [
          "La voiture avec chauffeur et le taxi relèvent d'une assurance spécifique, avec leurs propres garanties. Voir <a href=\"../assurance-vtc/\">assurance VTC</a> et <a href=\"../assurance-taxi/\">assurance taxi</a>.",
        ],
      },
    ],
    faq: [
      {
        q: "Une association qui transporte ses adhérents est-elle concernée ?",
        a: "Oui, dès qu'elle utilise un minibus. Le contrat doit préciser les conducteurs autorisés, bénévoles compris, et l'usage.",
      },
      {
        q: "Les bagages des passagers sont-ils couverts ?",
        a: "Par une garantie spécifique, plafonnée. Elle n'est pas incluse d'office.",
      },
      DEVIS_GRATUIT,
    ],
  },

  "flotte-vehicules.html": {
    service: "Assurance flotte automobile",
    title: "Assurance flotte automobile entreprise : devis parc auto",
    description:
      "Devis assurance flotte : utilitaires, voitures de société, poids lourds. Un seul contrat, une seule échéance, tous conducteurs. Courtier ORIAS, rappel rapide.",
    h1: "Assurance flotte automobile : un seul contrat pour le parc de l'entreprise",
    sections: [
      {
        h2: "À partir de quand parle-t-on de flotte",
        p: [
          "Chaque véhicule à moteur doit être assuré au minimum en responsabilité civile. Quand l'entreprise en possède plusieurs, le contrat flotte les réunit : une seule échéance, un seul interlocuteur, des garanties homogènes. Le seuil d'entrée dépend des assureurs, souvent quelques véhicules.",
        ],
      },
      {
        h2: "Ce que change un contrat flotte",
        list: [
          "Pas de bonus-malus par conducteur : le tarif suit la sinistralité de l'ensemble du parc",
          "Conduite ouverte à tous les salariés autorisés, sans les nommer un par un",
          "Entrées et sorties de véhicules en cours d'année, par simple déclaration",
          "Garanties choisies par catégorie : tous risques pour les récents, tiers pour les anciens",
        ],
      },
      {
        h2: "Les informations à réunir",
        list: [
          "La liste des véhicules : immatriculation, type, date de mise en circulation, mode de financement",
          "L'usage : tournées, chantiers, livraison, déplacements commerciaux",
          "Le relevé de sinistralité des dernières années, à demander à l'assureur actuel",
          "Le stationnement de nuit et la zone de circulation",
        ],
      },
      {
        h2: "Ce que la flotte ne couvre pas",
        p: [
          "La marchandise et l'outillage transportés se déclarent à part. Les véhicules confiés par des clients relèvent du contrat <a href=\"./garage-negociant-auto.html\">garage</a>, le transport de personnes de l'<a href=\"../assurance-vtc/\">assurance VTC</a> ou du <a href=\"./transport-voyageurs.html\">transport de voyageurs</a>.",
        ],
      },
    ],
    faq: [
      {
        q: "Deux ou trois utilitaires, est-ce suffisant ?",
        a: "Certains assureurs acceptent une petite flotte dès trois véhicules, d'autres à partir de cinq. En dessous, des contrats individuels restent possibles : on compare les deux montages.",
      },
      {
        q: "Les véhicules en leasing peuvent-ils entrer dans la flotte ?",
        a: "Oui. Le loueur exige en général une garantie tous risques et parfois une garantie de perte financière, qu'on intègre au contrat.",
      },
      {
        q: "Un salarié peut-il rentrer chez lui avec le véhicule ?",
        a: "Si l'usage trajet domicile-travail ou privé est déclaré. Sinon l'assureur peut réduire son indemnisation.",
      },
    ],
  },

  "assurance-dirigeant.html": {
    service: "Assurance homme clé et prévoyance du dirigeant",
    title: "Assurance homme clé et prévoyance du dirigeant : devis",
    description:
      "Devis assurance homme clé et prévoyance du dirigeant : arrêt, invalidité, décès. Protéger l'entreprise et le revenu du chef d'entreprise. Courtier ORIAS.",
    h1: "Assurance homme clé et prévoyance du dirigeant",
    sections: [
      {
        h2: "Deux besoins, deux bénéficiaires",
        p: [
          "L'<strong>assurance homme clé</strong> protège l'entreprise : si la personne dont dépend le chiffre d'affaires est durablement absente ou décède, un capital est versé à la société pour passer le cap, recruter, rassurer la banque.",
          "La <strong>prévoyance du dirigeant</strong> protège la personne et sa famille : indemnités en cas d'arrêt de travail, rente d'invalidité, capital décès. Un dirigeant non salarié est peu couvert par son régime obligatoire.",
        ],
      },
      {
        h2: "Qui est concerné",
        list: [
          "Le gérant ou le président qui porte seul la relation client ou le savoir-faire",
          "Un associé, un directeur technique, un commercial dont le départ ferait chuter l'activité",
          "L'entreprise qui a emprunté : la banque demande souvent cette garantie",
        ],
      },
      {
        h2: "Ce qu'on prépare pour le devis",
        list: [
          "Le statut : gérant majoritaire, président de SAS, entrepreneur individuel",
          "L'âge et la profession exacte, avec ses déplacements et ses risques",
          "Le rôle dans le chiffre d'affaires et les charges fixes à couvrir",
          "Un questionnaire de santé, selon les montants",
        ],
      },
    ],
    faq: [
      {
        q: "L'homme clé remplace-t-il la RC Pro ?",
        a: "Non. La RC Pro indemnise les clients. L'homme clé indemnise l'entreprise quand une personne essentielle manque.",
      },
      {
        q: "Les cotisations sont-elles déductibles ?",
        a: "Elles peuvent l'être, sous conditions qui dépendent du statut et de la nature du contrat. On le vérifie avec votre expert-comptable avant de signer.",
      },
      {
        q: "Un président de SAS est-il bien couvert par son régime ?",
        a: "Il relève du régime général, mais sans assurance chômage et avec des plafonds vite atteints. Une prévoyance complémentaire reste utile.",
      },
    ],
    links: [
      ["./prevoyance-tns.html", "Prévoyance TNS"],
      ["./rc-pro.html", "RC Pro"],
    ],
  },

  "prevoyance-tns.html": {
    service: "Prévoyance des travailleurs non salariés",
    title: "Prévoyance TNS : devis indépendant, arrêt de travail, Madelin",
    description:
      "Devis prévoyance TNS : indemnités journalières, invalidité, décès pour artisans, commerçants, professions libérales et gérants. Courtier ORIAS, rappel rapide.",
    h1: "Prévoyance TNS : maintenir votre revenu en cas d'arrêt de travail",
    sections: [
      {
        h2: "Pourquoi un indépendant doit y penser",
        p: [
          "En cas de maladie ou d'accident, le régime obligatoire d'un travailleur non salarié verse des indemnités limitées, après un délai de carence, alors que les charges de l'entreprise continuent de courir. La prévoyance complète ce revenu.",
        ],
      },
      {
        h2: "Les trois garanties",
        list: [
          "Indemnités journalières pendant l'arrêt de travail, après une franchise que vous choisissez",
          "Rente d'invalidité si vous ne pouvez plus exercer, en tout ou en partie",
          "Capital ou rente pour vos proches en cas de décès",
        ],
        p: [
          "Une option frais généraux peut aussi prendre en charge le loyer et les charges fixes du cabinet ou de l'atelier pendant l'arrêt.",
        ],
      },
      {
        h2: "Les points qui font la différence entre deux contrats",
        list: [
          "La définition de l'invalidité : selon votre profession, ou selon toute profession",
          "Le mode d'indemnisation : forfaitaire, ou limité à la perte de revenu réelle",
          "Les exclusions : dos, affections psychiques, sports pratiqués",
          "La durée de la franchise selon la cause : accident, maladie, hospitalisation",
        ],
      },
      {
        h2: "Fiscalité",
        p: [
          "Pour les indépendants imposés au réel, les cotisations d'un contrat Madelin sont déductibles du bénéfice imposable, dans la limite d'un plafond. Les micro-entrepreneurs peuvent souscrire, sans cette déduction.",
        ],
      },
    ],
    faq: [
      {
        q: "Quelle franchise choisir ?",
        a: "Celle que votre trésorerie peut supporter. Une franchise courte coûte plus cher. Beaucoup d'indépendants retiennent une franchise réduite en cas d'accident ou d'hospitalisation, plus longue en cas de maladie.",
      },
      {
        q: "Faut-il remplir un questionnaire de santé ?",
        a: "Oui dans la plupart des cas. Il doit être rempli avec exactitude : une fausse déclaration peut faire annuler le contrat au moment du sinistre.",
      },
      {
        q: "La prévoyance remplace-t-elle la mutuelle ?",
        a: "Non. La mutuelle rembourse les soins. La prévoyance remplace le revenu.",
      },
    ],
    links: [
      ["./assurance-dirigeant.html", "Homme clé et dirigeant"],
      ["./sante.html", "Mutuelle santé"],
    ],
  },

  "protection-juridique-pro.html": {
    service: "Protection juridique professionnelle",
    title: "Protection juridique professionnelle : devis entreprise",
    description:
      "Devis protection juridique pour entreprises et indépendants : impayés, litiges fournisseurs, prud'hommes, contrôle fiscal. Frais d'avocat pris en charge. Courtier ORIAS.",
    h1: "Protection juridique professionnelle : faire valoir vos droits sans avancer les frais",
    sections: [
      {
        h2: "À quoi elle sert",
        p: [
          "La protection juridique vous informe sur vos droits, tente une solution amiable et, si le litige va au tribunal, prend en charge les honoraires d'avocat, d'expert et de commissaire de justice, dans la limite des plafonds du contrat. Vous gardez le libre choix de votre avocat.",
        ],
      },
      {
        h2: "Les litiges couverts le plus souvent",
        list: [
          "Client qui ne paie pas, fournisseur qui livre mal ou en retard",
          "Conflit avec un salarié devant les prud'hommes",
          "Litige avec le bailleur sur le bail commercial",
          "Contrôle fiscal ou de l'URSSAF, selon les contrats",
          "Atteinte à la réputation en ligne, selon les contrats",
        ],
      },
      {
        h2: "Ce qu'il faut lire avant de signer",
        list: [
          "Le délai de carence : les litiges nés avant, ou juste après la souscription, ne sont pas couverts",
          "Le seuil d'intervention : montant minimal du litige",
          "Les plafonds par litige et par type de procédure",
          "Les domaines exclus",
        ],
        p: [
          "La protection juridique ne paie pas l'indemnité que vous devriez à un client : c'est le rôle de la <a href=\"./rc-pro.html\">RC Pro</a>.",
        ],
      },
    ],
    faq: [
      {
        q: "N'est-elle pas déjà incluse dans ma RC Pro ?",
        a: "Certaines RC Pro incluent une défense pénale et recours, limitée aux sinistres garantis. Une vraie protection juridique couvre un champ plus large : impayés, bail, social, fiscal.",
      },
      {
        q: "Puis-je souscrire pour un litige déjà en cours ?",
        a: "Non. Comme toute assurance, elle ne couvre que les litiges dont vous n'aviez pas connaissance à la souscription.",
      },
      DEVIS_GRATUIT,
    ],
  },

  "credit-professionnel.html": {
    service: "Crédit professionnel",
    title: "Crédit professionnel : financer matériel, trésorerie ou murs",
    description:
      "Financement professionnel : matériel, véhicule, travaux, trésorerie, reprise de fonds de commerce, murs. Dossier monté par un courtier ORIAS, étude gratuite.",
    h1: "Crédit professionnel : matériel, trésorerie, fonds de commerce ou murs",
    sections: [
      {
        h2: "Quel financement pour quel besoin",
        list: [
          "Matériel et véhicules : prêt classique, crédit-bail ou location financière",
          "Travaux et aménagement de locaux : prêt professionnel moyen terme",
          "Trésorerie : découvert autorisé, crédit court terme, affacturage",
          "Reprise d'un fonds de commerce ou de parts : prêt avec nantissement",
          "Achat de murs professionnels : prêt immobilier, souvent via une SCI",
        ],
      },
      {
        h2: "Ce que la banque veut voir",
        list: [
          "Les deux ou trois derniers bilans, ou un prévisionnel solide en création",
          "L'objet précis du financement, devis à l'appui",
          "L'apport et les garanties possibles : nantissement, caution, organisme de garantie",
          "Les relevés de compte professionnels récents",
        ],
      },
      {
        h2: "Le rôle du courtier",
        p: [
          "Présenter le dossier à plusieurs établissements, dans la forme qu'ils attendent, et négocier le taux, les garanties et l'assurance du prêt. La loi interdit à un intermédiaire de percevoir la moindre somme avant le versement effectif des fonds : l'étude ne vous coûte rien.",
          "Un crédit vous engage et doit être remboursé. Vérifiez vos capacités de remboursement avant de vous engager.",
        ],
      },
    ],
    faq: [
      {
        q: "Peut-on emprunter en création d'entreprise ?",
        a: "Oui, avec un prévisionnel, un apport personnel et souvent une garantie complémentaire. Les prêts d'honneur renforcent l'apport.",
      },
      {
        q: "Faut-il se porter caution personnelle ?",
        a: "C'est souvent demandé, mais négociable : montant limité, durée limitée, ou remplacement par un organisme de garantie.",
      },
      {
        q: "L'assurance du prêt est-elle obligatoire ?",
        a: "La loi ne l'impose pas, la banque presque toujours. Vous pouvez la choisir ailleurs que dans la banque prêteuse.",
      },
    ],
    links: [
      ["./assurance-dirigeant.html", "Homme clé"],
      ["./credit-immo.html", "Crédit immobilier"],
    ],
  },

  "immeuble-professionnel.html": {
    service: "Assurance immeuble professionnel",
    title: "Assurance immeuble professionnel : devis propriétaire, PNO",
    description:
      "Devis assurance immeuble professionnel ou de rapport : propriétaire non occupant, murs commerciaux, entrepôt, immeuble locatif. Courtier ORIAS, rappel rapide.",
    h1: "Assurance immeuble professionnel et propriétaire non occupant",
    sections: [
      {
        h2: "Pour qui",
        list: [
          "Propriétaire de murs commerciaux, de bureaux ou d'un entrepôt loués à une entreprise",
          "SCI qui détient les locaux de la société d'exploitation",
          "Propriétaire d'un immeuble de rapport, entier ou en partie",
          "Syndicat de copropriété, pour les parties communes",
        ],
      },
      {
        h2: "Ce que couvre le contrat",
        list: [
          "Le bâtiment : incendie, dégât des eaux, tempête, catastrophes naturelles, bris de glace",
          "La responsabilité civile du propriétaire : chute d'une tuile, défaut d'entretien",
          "La perte de loyers après un sinistre garanti",
          "Les recours des locataires et des voisins",
        ],
        p: [
          "L'assurance du locataire ne couvre que sa propre responsabilité et ses biens. Entre deux locataires, ou si le locataire est mal assuré, c'est le contrat du propriétaire qui joue.",
        ],
      },
      {
        h2: "Les informations utiles",
        list: [
          "Adresse, surface, année de construction, nature des matériaux",
          "Activité exercée par les locataires : elle change le risque d'incendie",
          "Valeur de reconstruction et montant annuel des loyers",
          "Locaux vacants, s'il y en a",
        ],
      },
    ],
    faq: [
      {
        q: "Mon locataire est assuré, pourquoi m'assurer aussi ?",
        a: "Parce que son contrat ne couvre pas votre responsabilité de propriétaire, ni les dommages dont il n'est pas responsable, ni les périodes sans locataire.",
      },
      {
        q: "L'activité du locataire compte-t-elle ?",
        a: "Oui. Un restaurant, un garage ou un stockage de produits inflammables n'ont pas le même tarif qu'un bureau. Un changement de locataire se déclare.",
      },
      DEVIS_GRATUIT,
    ],
    links: [
      ["./multirisque-professionnelle.html", "Multirisque professionnelle"],
      ["./syndic.html", "Syndic de copropriété"],
    ],
  },

  "convoyage-vehicules.html": {
    service: "Assurance convoyeur de véhicules",
    title: "Assurance convoyeur de véhicules : devis RC Pro convoyage",
    description:
      "Devis assurance convoyage : dommages au véhicule convoyé, responsabilité civile, plaques de garage. Convoyeur indépendant ou société. Courtier ORIAS.",
    h1: "Assurance convoyeur de véhicules : RC Pro et dommages au véhicule confié",
    sections: [
      {
        h2: "Le risque du convoyeur",
        p: [
          "Vous conduisez un véhicule qui ne vous appartient pas, pour le compte d'un client : loueur, concessionnaire, particulier. S'il est accidenté ou volé pendant le trajet, c'est vous que le propriétaire viendra chercher. L'assurance du propriétaire, quand elle joue, se retourne ensuite contre vous.",
        ],
      },
      {
        h2: "Les garanties à réunir",
        list: [
          "Responsabilité civile circulation pour les dommages causés aux autres",
          "Dommages au véhicule convoyé, avec un plafond par véhicule adapté à ce que vous conduisez",
          "Vol pendant la mission, sous conditions",
          "RC Pro pour le reste de l'activité : retard, clés perdues, erreur de livraison",
        ],
      },
      {
        h2: "Pour le devis",
        list: [
          "Le nombre de convoyages par an et la valeur maximale d'un véhicule",
          "Les types de véhicules : tourisme, utilitaires, prestige, poids lourds",
          "Le nombre de convoyeurs et l'ancienneté de leur permis",
          "Convoyage par la route uniquement, ou aussi sur plateau",
        ],
      },
    ],
    faq: [
      {
        q: "Un auto-entrepreneur convoyeur peut-il s'assurer ?",
        a: "Oui. Les plateformes de mise en relation exigent d'ailleurs une attestation. L'ancienneté du permis et l'absence de sinistre pèsent dans l'étude.",
      },
      {
        q: "Les véhicules de luxe sont-ils couverts ?",
        a: "Dans la limite du plafond par véhicule inscrit au contrat. Au-delà, il faut une extension avant la mission.",
      },
      DEVIS_GRATUIT,
    ],
    links: [
      ["./garage-negociant-auto.html", "Garage et négociant"],
      ["./transport-logistique.html", "Transport de marchandises"],
    ],
  },

  "esthetique-bien-etre.html": {
    service: "Assurance institut de beauté et bien-être",
    title: "Assurance institut de beauté et bien-être : devis RC Pro",
    description:
      "Devis RC Pro esthéticienne, institut de beauté, spa, prothésiste ongulaire, masseur bien-être : soins, produits, local. Courtier ORIAS, rappel rapide.",
    h1: "Assurance esthétique et bien-être : RC Pro de l'institut et du praticien",
    sections: [
      {
        h2: "Les risques du métier",
        list: [
          "Réaction cutanée, brûlure ou allergie après un soin, une épilation, une pose",
          "Chute d'une cliente dans l'institut",
          "Dommage causé par un produit que vous vendez",
          "Sinistre dans le local : dégât des eaux, incendie, vol du matériel",
        ],
      },
      {
        h2: "Déclarer chaque technique",
        p: [
          "Soins du visage, épilation à la cire ou à la lumière pulsée, UV, extensions de cils, onglerie, maquillage permanent, modelage : chaque technique se déclare. Les appareils et les actes les plus techniques sont étudiés à part, et certains assureurs les refusent. Une technique non déclarée n'est pas couverte.",
        ],
      },
      {
        h2: "Institut, domicile, cabine louée",
        p: [
          "En institut, la RC Pro se complète d'une <a href=\"./multirisque-professionnelle.html\">multirisque</a> pour le local et le matériel. À domicile ou chez la cliente, il faut vérifier que le matériel transporté est couvert. En cabine louée, le bail précise qui assure quoi.",
        ],
      },
    ],
    faq: [
      {
        q: "La RC Pro est-elle obligatoire pour une esthéticienne ?",
        a: "Elle n'est pas imposée par un texte général, mais un bailleur, une franchise ou un fournisseur d'appareils l'exige presque toujours, et un seul sinistre corporel peut coûter très cher.",
      },
      {
        q: "Une praticienne à domicile est-elle concernée ?",
        a: "Oui, autant qu'en institut. Le contrat doit mentionner l'exercice à domicile et en déplacement.",
      },
      DEVIS_GRATUIT,
    ],
  },

  "ramonage.html": {
    service: "Assurance ramoneur",
    title: "Assurance ramoneur : devis RC Pro, fumisterie, multirisque",
    description:
      "Devis assurance ramoneur et fumiste : RC Pro après intervention, incendie de conduit, pose de poêle et tubage en décennale. Courtier ORIAS, rappel rapide.",
    h1: "Assurance ramoneur : RC Pro, fumisterie et multirisque",
    sections: [
      {
        h2: "Le risque après intervention",
        p: [
          "Un feu de conduit ou une intoxication au monoxyde de carbone après votre passage engage votre responsabilité, parfois des mois plus tard. C'est la RC après travaux qui répond : elle doit figurer au contrat, avec un plafond à la hauteur d'un sinistre incendie dans une habitation.",
        ],
      },
      {
        h2: "Ramonage seul, ou pose et tubage",
        list: [
          "Ramonage et entretien : RC Pro avec garantie après intervention",
          "Pose de poêle, d'insert, tubage, création de conduit : ce sont des travaux de construction, qui relèvent de la décennale",
          "Débistrage, contrôle par caméra, diagnostic : à déclarer comme activités distinctes",
        ],
      },
      {
        h2: "Le reste de l'activité",
        p: [
          "Le fourgon et l'outillage transporté s'assurent en contrat auto professionnel. Le dépôt et le matériel en <a href=\"./multirisque-professionnelle.html\">multirisque</a>. Pour la pose, voir <a href=\"./decennale.html\">assurance décennale</a>.",
        ],
      },
    ],
    faq: [
      {
        q: "Un ramoneur doit-il avoir une décennale ?",
        a: "Pas pour le ramonage seul. Dès qu'il pose un appareil, tube ou crée un conduit, oui.",
      },
      {
        q: "Le certificat de ramonage engage-t-il ma responsabilité ?",
        a: "Oui. Il atteste que le conduit a été nettoyé sur toute sa longueur. S'il est remis sans que le travail soit conforme, votre responsabilité est engagée en cas de sinistre.",
      },
      DEVIS_GRATUIT,
    ],
    links: [["./metiers-batiment.html", "Métiers du bâtiment"]],
  },

  "padel.html": {
    service: "Assurance club et terrain de padel",
    title: "Assurance club de padel : devis RC exploitant et terrains",
    description:
      "Devis assurance club de padel : responsabilité de l'exploitant, blessures des joueurs, structures et vitrages, perte d'exploitation. Courtier ORIAS.",
    h1: "Assurance club et terrain de padel : RC exploitant, structures et vitrages",
    sections: [
      {
        h2: "Une assurance imposée par le Code du sport",
        p: [
          "L'exploitant d'un établissement où l'on pratique une activité physique ou sportive doit être assuré en responsabilité civile, pour lui-même, ses salariés et les pratiquants. Un club de padel, associatif ou commercial, entre dans ce cadre.",
        ],
      },
      {
        h2: "Les garanties d'un club",
        list: [
          "RC exploitant : blessure d'un joueur ou d'un visiteur liée aux installations ou à l'organisation",
          "Dommages aux terrains : structure, vitrages, gazon synthétique, éclairage, couverture",
          "Bâtiment, bar, boutique, matériel de location",
          "Perte d'exploitation après un sinistre : tempête, bris de vitrage, incendie",
          "RC des enseignants, salariés ou indépendants",
        ],
      },
      {
        h2: "Pour le devis",
        list: [
          "Nombre de terrains, couverts ou extérieurs, et valeur des installations",
          "Statut : association, société, terrains loués ou en propriété",
          "Activités annexes : restauration, tournois, stages, autres sports",
          "Chiffre d'affaires prévisionnel en création",
        ],
      },
    ],
    faq: [
      {
        q: "Les joueurs doivent-ils avoir leur propre assurance ?",
        a: "Le club doit les informer de l'intérêt d'une assurance individuelle accident, qui couvre leurs propres blessures. La RC du club ne joue que s'il est responsable.",
      },
      {
        q: "Les terrains en construction sont-ils assurés ?",
        a: "Par l'entreprise qui les construit, puis par le club à la réception. La date de bascule se prévoit avant la livraison.",
      },
      DEVIS_GRATUIT,
    ],
    links: [["./salles-loisirs.html", "Salles de loisirs"]],
  },

  "salles-loisirs.html": {
    service: "Assurance salle de loisirs",
    title: "Assurance salle de loisirs : escape game, trampoline, accrobranche",
    description:
      "Devis assurance salle de loisirs : escape game, parc de trampolines, accrobranche, laser game, bowling, karting. RC exploitant, local, perte d'exploitation. Courtier ORIAS.",
    h1: "Assurance salle de loisirs : escape game, trampoline, accrobranche",
    sections: [
      {
        h2: "Un établissement qui reçoit du public",
        p: [
          "Une salle de loisirs accueille des clients dans un lieu que vous aménagez et surveillez. Votre responsabilité est engagée en cas de blessure liée aux installations, à la surveillance ou aux consignes. Les activités sportives ou à sensation sont étudiées de près par les assureurs.",
        ],
      },
      {
        h2: "Les garanties à réunir",
        list: [
          "RC exploitant, avec un plafond élevé en dommages corporels",
          "Multirisque du local : décors, structures, matériel électronique, aménagements",
          "Perte d'exploitation après un sinistre ou une fermeture liée à un dommage garanti",
          "Protection juridique en cas de mise en cause",
        ],
      },
      {
        h2: "Ce que l'assureur veut savoir",
        list: [
          "Les activités exactes et l'âge du public accueilli",
          "Les contrôles des installations et les qualifications de l'encadrement",
          "La capacité d'accueil et le classement du local en établissement recevant du public",
          "Les activités annexes : anniversaires, restauration, événements d'entreprise",
        ],
      },
    ],
    faq: [
      {
        q: "Une décharge signée par le client me protège-t-elle ?",
        a: "Non. Elle ne supprime pas votre obligation de sécurité. Elle prouve seulement que les consignes ont été données.",
      },
      {
        q: "Peut-on s'assurer avant l'ouverture ?",
        a: "Oui, et c'est conseillé : le bailleur et la commission de sécurité demandent une attestation. Le devis se fait sur le prévisionnel.",
      },
      DEVIS_GRATUIT,
    ],
    links: [["./padel.html", "Club de padel"]],
  },
};
