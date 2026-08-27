/**
 * Blocs longs uniques pour les articles piliers auto / MRH (review : trop courts).
 */
function p(text) {
  return { type: "p", text: text };
}
function h2(text) {
  return { type: "h2", text: text };
}
function ul(items) {
  return { type: "ul", items: items };
}

module.exports = {
  "tarif-assurance-auto-2026.html": {
    skipEnrich: true,
    meta: "8 min · Août 2026",
    blocks: [
      h2("Les postes qui pèsent vraiment sur le tarif 2026"),
      p(
        "En 2026, la prime auto n’est plus un « prix catalogue ». Les compagnies tarifient le <strong>coefficient bonus-malus (CRM)</strong>, le code postal de stationnement de nuit, la date de permis, le conducteur secondaire, la valeur du véhicule et la formule. Un jeune permis à Paris n’a rien à voir avec un 50 % de bonus à Varangéville : le courtier le sait, le comparateur grand public trop souvent non."
      ),
      p(
        "Les pièces, le verre et la main-d’œuvre ont augmenté. Résultat : même sans sinistre, beaucoup de contrats partent à la hausse à l’échéance. Avant d’accepter, demandez un <strong>relevé d’information</strong> et un comparatif à garanties égales (RC, vol, bris, assistance 0 km, véhicule de remplacement)."
      ),
      h2("Exemple de lecture d’un devis"),
      ul([
        "<strong>Franchise bris de glace</strong> : 0 € vs 150 € change le « petit prix » dès le premier impact",
        "<strong>Franchise collision</strong> trop haute : le tous risques ne sert plus sur une cote moyenne",
        "<strong>Exclusion usage pro</strong> : trajets clients non couverts si vous avez déclaré « privé »",
        "<strong>Conducteur occasionnel</strong> : enfant au permis, conjoint, malus caché",
      ]),
      p(
        "Un devis à 38 € / mois peut coûter plus cher qu’un devis à 46 € si la franchise et l’assistance 0 km ne sont pas les mêmes. C’est exactement le travail d’un <strong>courtier ORIAS</strong> — y compris via des <strong>grilles grossistes</strong> quand le profil est jeune, malussé ou atypique."
      ),
      h2("Paris, IDF, Nancy : le code postal n’est pas un détail"),
      p(
        "Stationnement voirie, vol, bris, sinistralité parking : l’Île-de-France (75, 92, 93, 94, 77, 78, 91, 95) reste plus chère que le bassin nancéien. À <strong>Nancy</strong> et <strong>Varangéville</strong>, le tarif baisse souvent, mais un malus ou une sportive rattrape l’écart. Pages : <a href=\"./assurance-auto-paris-ile-de-france-2026.html\">auto Paris / IDF</a> · <a href=\"./assurance-auto-nancy-varangeville-54.html\">auto 54</a>."
      ),
      h2("Quand changer (loi Hamon) plutôt que subir l’échéance"),
      p(
        "Après 12 mois, la <a href=\"./resilier-assurance-auto-loi-hamon-2026.html\">loi Hamon</a> permet de changer sans attendre. Le nouvel assureur envoie la résiliation. Ne résiliez jamais à vide : conduire sans assurance est une infraction. Préparez le relevé, le questionnaire, puis le devis."
      ),
    ],
    faq: [
      {
        q: "Puis-je comparer sans relever mon bonus-malus ?",
        a: "Un tarif indicatif oui. Un devis souscriptible non : le CRM et les sinistres 24–36 mois sont obligatoires.",
      },
      {
        q: "Le courtier est-il utile si j’ai 50 % de bonus ?",
        a: "Oui : franchises, bris, véhicule de remplacement et options. Même un bon CRM se compare à garanties égales.",
      },
    ],
  },
  "resilier-assurance-auto-loi-hamon-2026.html": {
    skipEnrich: true,
    meta: "8 min · Août 2026",
    blocks: [
      h2("Ce que la loi Hamon change concrètement"),
      p(
        "Depuis la loi Hamon, un contrat auto d’<strong>au moins un an</strong> se résilie à tout moment, sans frais ni motif. Le plus simple : le <strong>nouvel assureur</strong> envoie la lettre. Vous n’avez pas à gérer le recommandé vous-même si le dossier est complet (relevé, IBAN, carte grise, permis)."
      ),
      p(
        "Avant un an, d’autres portes existent : vente du véhicule, résiliation par l’assureur, loi Chatel à l’échéance si l’avis est arrivé hors délai. Dans tous les cas, <strong>pas de jour blanc</strong> : l’attestation du nouveau contrat doit coller à la date de sortie de l’ancien."
      ),
      h2("Le relevé d’information, pièce maîtresse"),
      ul([
        "Coefficient CRM et date d’obtention du permis",
        "Sinistres responsables et non responsables (souvent 24 ou 36 mois)",
        "Conducteurs désignés, suspensions, résiliations antérieures",
        "Usage déclaré (privé, trajet travail, tournées)",
      ]),
      p(
        "Sans relevé à jour, le devis est un prix d’appel. Un courtier le relit avant d’interroger les compagnies et les <a href=\"./assurance-auto-courtier-grossiste-comparatif-2026.html\">grilles grossistes</a>. Si vous êtes malussé, voyez aussi <a href=\"./assurance-auto-malus-apres-accident.html\">malus après accident</a>."
      ),
      h2("Pièges fréquents au changement"),
      p(
        "Déclarer un stationnement « box » alors que la voiture dort dans la rue. Oublier le conducteur secondaire. Résilier avant d’avoir l’attestation. Croire que « pas cher » = mêmes franchises. Un questionnaire honnête évite un refus à la souscription ou un sinistre mal indemnisé."
      ),
    ],
    faq: [
      {
        q: "Combien de temps entre le devis et la prise d’effet ?",
        a: "Souvent 24 à 72 h ouvrées si le relevé est lisible. Un dossier incomplet (sinistres, permis) retarde la date.",
      },
      {
        q: "Le nouvel assureur peut-il refuser après la demande de résiliation ?",
        a: "Il doit étudier le relevé avant. D’où l’intérêt de comparer d’abord, puis de faire partir Hamon.",
      },
    ],
  },
  "assurance-auto-courtier-grossiste-comparatif-2026.html": {
    skipEnrich: true,
    meta: "9 min · Août 2026",
    blocks: [
      h2("Comparateur web vs courtier vs grossiste"),
      p(
        "Le <strong>comparateur</strong> interroge un panier d’assureurs grand public et affiche un prix. Il refuse souvent le jeune permis, le malus, le véhicule puissant, l’usage un peu pro. Le <strong>courtier ORIAS</strong> reste votre interlocuteur : il explique franchises et exclusions. Le <strong>courtier grossiste</strong> (wholesale) est un intermédiaire B2B : il ouvre des délégations et des compagnies que vous ne voyez pas en ligne."
      ),
      p(
        "Nous ne sommes pas le grossiste. Nous sommes le courtier de proximité qui <strong>compare ces grilles</strong> à garanties équivalentes. Vous signez chez une compagnie ; nous restons le conseil. Pas de slogan « moins cher que tout le monde » : un dossier incomplet reste cher partout."
      ),
      h2("Profils où le grossiste change souvent la prime"),
      ul([
        "Jeune conducteur, permis récent, conduite accompagnée récente",
        "Malus, résiliation, sinistres rapprochés",
        "Sportive, véhicule haut de gamme, import",
        "Conducteurs secondaires, trajets domicile-travail longs, petit usage pro",
      ]),
      p(
        "Même avec 50 % de bonus, le grossiste sert à caler <strong>bris, assistance 0 km, véhicule de remplacement</strong>. Le prix seul n’est pas l’offre. Voir aussi <a href=\"./tarif-assurance-auto-2026.html\">tarifs 2026</a> et <a href=\"./devis-assurance-auto-pas-cher-2026.html\">pas cher sans se tromper</a>."
      ),
      h2("Comment se passe un dossier chez nous"),
      p(
        "1) Questionnaire auto (véhicule, CRM, commune). 2) Relevé d’information. 3) Comparatif à postes égaux. 4) Rappel conseiller. 5) Souscription et, si besoin, résiliation Hamon par le nouvel assureur. Le même schéma existe en <a href=\"./assurance-habitation-courtier-grossiste-mrh-2026.html\">MRH</a>."
      ),
    ],
    faq: [
      {
        q: "Le grossiste voit-il mon nom ?",
        a: "Le dossier est présenté aux partenaires. Vous n’avez pas de double relation commerciale : un seul courtier (ORIAS) vous rappelle.",
      },
      {
        q: "Puis-je rester chez mon assureur actuel ?",
        a: "Oui. Le comparatif sert aussi à décider de ne pas bouger si les garanties tiennent.",
      },
    ],
  },
  "assurance-auto-paris-ile-de-france-2026.html": {
    skipEnrich: true,
    description:
      "Assurance auto à Paris et en Île-de-France : stationnement voirie, vol, bris, codes 75, 92, 93, 94. Devis courtier ORIAS, pages par ville.",
    meta: "8 min · Août 2026",
    blocks: [
      h2("Pourquoi Paris et l’IDF tarifient plus cher"),
      p(
        "À <strong>Paris (75)</strong> et en petite couronne (<strong>92, 93, 94</strong>), le tarif auto intègre le vol, le bris de glace, les collisions parking et le stationnement sur voirie. Grande couronne (77, 78, 91, 95) : un peu moins cher en moyenne, mais un box fermé vs la rue change encore la prime. Déclarez le <strong>vrai lieu de stationnement de nuit</strong>."
      ),
      p(
        "Les codes postaux 75 / 93 pèsent surtout sur les jeunes permis et les citadines souvent stationnées dehors. Un courtier compare RC, vol, bris et assistance, y compris grilles grossistes si le profil est refusé en ligne. Page ville : <a href=\"../assurance-auto/paris/\">assurance auto Paris</a> · <a href=\"../assurance-auto/villes/\">toutes les villes</a>."
      ),
      h2("75, 92, 93, 94 : ce qu’il faut déclarer"),
      p(
        "Lieu de stationnement de nuit, kilométrage, trajet domicile-travail (périphérique, banlieue), conducteur secondaire, sinistres parking. Un oubli se paie au vol ou au bris. La grande couronne (77, 78, 91, 95) n’est pas un tarif unique non plus : un box à Versailles n’est pas une rue à Saint-Denis."
      ),
      h2("Garanties à caler en IDF"),
      ul([
        "Bris de glace (impacts périphérique, gravillons)",
        "Vol et tentative, accessoires, GPS",
        "Assistance 0 km (panne en ville, batterie)",
        "Véhicule de remplacement si vous n’avez pas de second véhicule",
      ]),
      p(
        "Le tous risques n’est pas automatique : sur une cote basse, une franchise élevée annule l’intérêt. Guide : <a href=\"./assurance-auto-tous-risques-ou-tiers-2026.html\">tous risques ou tiers</a> · <a href=\"./tarif-assurance-auto-2026.html\">tarifs</a>."
      ),
    ],
    faq: [
      {
        q: "Dois-je assurer une voiture qui dort dans la rue à Paris ?",
        a: "Oui, la RC est obligatoire. Le lieu de stationnement (voirie vs box) doit être le bon, sinon le vol peut être mal indemnisé.",
      },
      {
        q: "L’IDF est-elle un seul tarif ?",
        a: "Non. 75, 92, 93, 94, 77, 78, 91, 95 : chaque code postal et chaque usage (trajet, kilométrage) recale la grille.",
      },
    ],
  },
  "assurance-auto-nancy-varangeville-54.html": {
    skipEnrich: true,
    meta: "8 min · Août 2026",
    blocks: [
      h2("Bassin nancéien : même règles nationales, tarif souvent plus doux"),
      p(
        "À <strong>Nancy</strong>, <strong>Varangéville</strong>, Jarville-la-Malgrange, Dombasle-sur-Meurthe, Saint-Max, Vandœuvre-lès-Nancy, le CRM et le véhicule pèsent plus que le seul code postal. Le 54 n’est pas l’IDF : vol et bris moins fréquents en moyenne, donc des grilles plus ouvertes. Orthographe : <strong>Varangéville</strong> uniquement (Meurthe-et-Moselle)."
      ),
      p(
        "Notre cabinet ORIAS est à Varangéville. Le devis se fait en ligne, le rappel par téléphone, le dossier comme partout en France. Pages : <a href=\"../assurance-auto/nancy/\">auto Nancy</a> · <a href=\"../assurance-auto/varangeville/\">auto Varangéville</a> · <a href=\"../agence-varangeville/\">agence</a>."
      ),
      h2("Ce que le devis 54 doit contenir"),
      p(
        "Carte grise, relevé d’information, usage (domicile-travail Metz / Nancy, A31), stationnement (rue, parking, box). Un jeune permis ou un malus n’empêche pas d’assurer : cela change la grille, pas l’obligation de RC. Le courtier dit si le tous risques vaut le coup selon la cote."
      ),
      p(
        "Les communes du Grand Nancy (Houdemont, Ludres, Saint-Max, Maxéville, Laxou, Villers-lès-Nancy) ont chacune une page ville quand elles sont dans l’annuaire. Sinon le dossier se monte quand même, même parcours."
      ),
      h2("Jeune permis, malus, domicile-travail Metz / Nancy"),
      p(
        "Les trajets A31 / banlieue, le jeune conducteur et le malus restent des sujets 54. Un comparateur web refuse ; un <a href=\"./assurance-auto-courtier-grossiste-comparatif-2026.html\">courtier / grossiste</a> ouvre d’autres grilles. Préparez le relevé d’information et la carte grise."
      ),
      h2("Auto et habitation le même foyer"),
      p(
        "Beaucoup de clients du Grand Nancy revoient les deux contrats le même jour (loi Hamon). Voir <a href=\"./assurance-habitation-nancy-varangeville-54.html\">MRH Nancy / Varangéville</a>."
      ),
    ],
    faq: [
      {
        q: "Faut-il venir à l’agence de Varangéville ?",
        a: "Non. Le dossier est 100 % à distance. L’agence reste le point d’ancrage local du 54.",
      },
      {
        q: "Couvrez-vous Jarville, Dombasle, Houdemont ?",
        a: "Oui, tout le bassin nancéien et la Meurthe-et-Moselle, avec une page ville quand elle existe.",
      },
    ],
  },
  "changer-assurance-habitation-loi-hamon.html": {
    skipEnrich: true,
    meta: "8 min · Août 2026",
    blocks: [
      h2("Locataire : l’attestation ne doit jamais un trou"),
      p(
        "Le bailleur exige une <strong>attestation d’assurance habitation</strong> continue. Après 12 mois, la loi Hamon permet de changer de MRH à tout moment. Le nouvel assureur résilie souvent l’ancien. Vous choisissez la compagnie : le propriétaire peut exiger une attestation conforme, pas une marque."
      ),
      p(
        "Avant la date d’effet, envoyez la nouvelle attestation (e-mail / espace locataire). Un jour sans contrat = impayé d’assurance aux yeux du bailleur, même si Hamon est propre. Guide : <a href=\"./attestation-assurance-habitation-locataire-2026.html\">attestation locataire</a>."
      ),
      h2("Propriétaire occupant et copropriété"),
      p(
        "La copro ou la banque (crédit) demandent souvent une MRH. En changeant, vérifiez le <strong>capital mobilier</strong>, la RC vie privée, le vol, les dégâts des eaux et les dépendances. Une sous-évaluation du mobilier plafonne l’indemnité. Voir <a href=\"./assurance-habitation-locataire-proprietaire-2026.html\">locataire / propriétaire</a>."
      ),
      h2("Comparer avant d’envoyer Hamon"),
      ul([
        "Franchise dégâts des eaux (souvent le sinistre n°1)",
        "Vol : alarme, bijoux, high-tech, cave",
        "Plafond mobilier et objets nomades",
        "PNO si vous louez, ou villégiature",
      ]),
      p(
        "Les <a href=\"./assurance-habitation-courtier-grossiste-mrh-2026.html\">grilles grossistes</a> aident quand le comparateur web est pauvre (Paris vol, maison 54, capital élevé). Questionnaire puis devis, ensuite résiliation."
      ),
    ],
    faq: [
      {
        q: "Le nouvel assureur gère-t-il la résiliation MRH ?",
        a: "Le plus souvent oui, comme en auto. Vérifiez que la date d’effet recouvre l’ancien contrat.",
      },
      {
        q: "Puis-je changer avant 12 mois ?",
        a: "Oui dans certains cas (vente, résiliation assureur, Chatel). Sinon, attendez Hamon ou l’échéance.",
      },
    ],
  },
  "assurance-habitation-courtier-grossiste-mrh-2026.html": {
    skipEnrich: true,
    meta: "9 min · Août 2026",
    blocks: [
      h2("Pourquoi une grille grossiste MRH"),
      p(
        "Le comparateur habitation affiche peu d’offres dès que le logement sort du lot : appartement haussmannien, capital mobilier élevé, sinistres dégâts des eaux, PNO, maison avec dépendances. Un <strong>courtier grossiste</strong> agrège des délégations. Nous, courtier ORIAS, comparons ces formules : locataire, propriétaire occupant, PNO."
      ),
      p(
        "L’enjeu n’est pas « la moins chère de France ». C’est le bon <strong>capital</strong>, la bonne <strong>franchise vol / dégâts des eaux</strong>, et des exclusions lues avant le sinistre. Même logique qu’en <a href=\"./assurance-auto-courtier-grossiste-comparatif-2026.html\">auto</a>."
      ),
      h2("Cas où le comparateur web suffit rarement"),
      ul([
        "Paris / IDF : vol, caves, bris, copro",
        "Nancy, Varangéville, Jarville : maisons, dépendances, même foyer auto + MRH",
        "Bijoux, instruments, télétravail high-tech",
        "Antécédents dégâts des eaux ou cambriolage",
      ]),
      p(
        "Préparez : surface, étage, alarme, capital mobilier, sinistres 36 mois. Puis <a href=\"../landings/devis.html?need=habitation&utm_source=blog&utm_medium=article&utm_campaign=habitation\">devis habitation</a>."
      ),
      h2("Transparence ORIAS"),
      p(
        "Le grossiste est B2B. Vous avez un seul conseiller. Cabinet à Varangéville, dossiers France entière. Local : <a href=\"./assurance-habitation-nancy-varangeville-54.html\">MRH 54</a> · <a href=\"./assurance-habitation-paris-ile-de-france-2026.html\">MRH Paris</a>."
      ),
    ],
    faq: [
      {
        q: "Le grossiste MRH est-il un assureur ?",
        a: "Non. Intermédiaire B2B. Le contrat est au nom d’une compagnie ; Leads Opportunities reste votre courtier.",
      },
      {
        q: "Dois-je assurer auto et habitation ensemble ?",
        a: "Pas obligatoire, souvent utile (même relevé de besoins, parfois pack). On compare les deux sans forcer le pack.",
      },
    ],
  },
  "assurance-habitation-nancy-varangeville-54.html": {
    skipEnrich: true,
    meta: "8 min · Août 2026",
    blocks: [
      h2("MRH dans le 54 : locataire, proprio, vol, eaux"),
      p(
        "À <strong>Nancy</strong> et <strong>Varangéville</strong>, la MRH se joue sur le capital mobilier, la franchise dégâts des eaux et le vol (appartements centre, maisons avec cave). Orthographe : <strong>Varangéville</strong>. Pages : <a href=\"../assurance-habitation/nancy/\">habitation Nancy</a> · <a href=\"../assurance-habitation/varangeville/\">habitation Varangéville</a>."
      ),
      p(
        "Jarville, Dombasle, Houdemont, Saint-Max, Vandœuvre : même parcours devis, cabinet ORIAS à Varangéville. Beaucoup de foyers alignent <a href=\"./assurance-auto-nancy-varangeville-54.html\">auto 54</a> le même jour (Hamon)."
      ),
      h2("Attestation, capital, dépendances"),
      p(
        "Locataire à Nancy : envoyez l’attestation sans trou de dates. Propriétaire : capital mobilier (meubles, électroménager, high-tech) trop bas = indemnité plafonnée. Maison avec garage / abri : vérifiez si la dépendance est dans le contrat. Dégâts des eaux en copro : franchise et convention IRSI."
      ),
      p(
        "On ne promet pas « l’assurance habitation la moins chère du 54 ». On compare des grilles, y compris grossistes, et on explique le vol et les eaux avant la signature. <a href=\"../landings/devis.html?need=habitation&utm_source=blog&utm_medium=article&utm_campaign=habitation\">Devis MRH</a>."
      ),
      h2("Points de vigilance locaux"),
      ul([
        "Dégâts des eaux en copro (Nancy centre, étages)",
        "Vol / cave / garage",
        "Maison avec dépendances (bassin, villages)",
        "Attestation locataire sans trou de dates",
      ]),
      p(
        "Un courtier calibre, y compris <a href=\"./assurance-habitation-courtier-grossiste-mrh-2026.html\">grilles grossistes</a>. <a href=\"../agence-varangeville/\">Agence Varangéville</a>."
      ),
    ],
    faq: [
      {
        q: "Le tarif MRH Nancy est-il plus bas qu’à Paris ?",
        a: "Souvent oui sur le vol. Le capital mobilier et les sinistres eaux rattrapent l’écart si on sous-estime le contrat.",
      },
    ],
  },
};
