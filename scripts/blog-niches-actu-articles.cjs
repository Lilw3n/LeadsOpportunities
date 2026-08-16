/**
 * Niches + actu été 2026 : incendies Gironde, restrictions d'eau, présidentielle,
 * chasse, équitation, animaux. Chargé par blog-articles-manifest.cjs.
 */
module.exports = [
  /* —— Incendies / pompiers / Gironde —— */
  {
    file: "incendies-gironde-feux-foret-assurance-habitation-2026.html",
    section: "habitat",
    tag: "Feux de forêt",
    tagClass: "tag-actu",
    themes: ["incendie", "gironde", "secheresse"],
    title: "Incendies Gironde 2026 : feux de forêt, vigilance rouge et assurance habitation",
    description:
      "Vigilance rouge feux de forêt en Gironde (août 2026) : ce que couvre l'assurance habitation, Cat Nat, exclusions et réflexes sinistre incendie.",
    meta: "9 min · Août 2026",
    cardExcerpt: "Feux de forêt Gironde : habitation, Cat Nat et checklist sinistre.",
    keywords: [
      "incendies gironde",
      "feux de forêt assurance habitation",
      "vigilance rouge incendie",
      "catastrophe naturelle incendie",
      "assurance maison feu de forêt",
      "gironde 2026 incendie",
    ],
    cta: { href: "../landings/devis.html?need=habitation", label: "Devis habitation" },
    heroImage: {
      src: "./images/canicule/climat-chaleur-extreme.jpg",
      alt: "Sécheresse et risque incendie — maison et terrain en période de chaleur",
      caption: "Gironde août 2026 : vigilance rouge feux de forêt — vérifier son contrat habitation.",
    },
    blocks: [
      {
        type: "p",
        text: "En <strong>août 2026</strong>, la <strong>Gironde</strong> a basculé en <strong>vigilance rouge</strong> pour risque de <strong>feux de forêt</strong> (préfecture, niveau très élevé). Interdictions de fumer, de feux à l'air libre, de moteurs en forêt aux heures critiques : les pompiers anticipent, les riverains doivent anticiper aussi — côté <strong>assurance habitation</strong>. Ce guide relie l'actu aux garanties concrètes : incendie, Cat Nat, dépendances, véhicules, jardin. <a href=\"../landings/devis.html?need=habitation\"><strong>Comparer mon habitation</strong></a> · <a href=\"../landings/questionnaire.html?need=habitation&journey=standard\">questionnaire habitation</a>.",
      },
      { type: "bridge" },
      {
        type: "gallery",
        label: "Trois postes à relire avant un départ de feu",
        items: [
          {
            src: "./images/habitat/maison-famille.jpg",
            alt: "Maison familiale — contrat multirisque habitation",
            caption: "Bâtiment + dépendances : plafonds et franchises",
          },
          {
            src: "./images/canicule/secheresse-fissures.jpg",
            alt: "Sol sec — sécheresse et risque incendie",
            caption: "Sécheresse : sols, jardin, accès pompiers",
          },
          {
            src: "./images/habitat/sinistre-degats.jpg",
            alt: "Sinistre habitation — déclaration et photos",
            caption: "Sinistre : photos, inventaire, déclaration sous 5 jours",
          },
        ],
      },
      { type: "h2", text: "1. Incendie classique vs catastrophe naturelle" },
      {
        type: "p",
        text: "Un <strong>incendie de maison</strong> (court-circuit, cuisine, cheminée) est en principe couvert par la garantie <strong>incendie</strong> de votre MRH. Un <strong>feu de forêt</strong> qui se propage depuis le massif peut relever de mécanismes différents selon l'origine, l'arrêté Cat Nat éventuel et les exclusions du contrat. Ne vous fiez pas au titre « tous risques » : lisez les pages <strong>incendie</strong>, <strong>événements climatiques</strong> et <strong>catastrophe naturelle</strong>.",
      },
      { type: "h2", text: "2. Débroussaillage, accès pompiers, voisinage" },
      {
        type: "p",
        text: "En zone forestière (Landes girondines, communes à dominante forestière), le <strong>débroussaillage obligatoire</strong> n'est pas qu'une règle préfectorale : un défaut peut compliquer l'indemnisation ou la responsabilité. Vérifiez aussi les <strong>dépendances</strong> (abris, carports), les véhicules garés près des arbres et la responsabilité civile si un feu part de votre terrain.",
      },
      { type: "h2", text: "3. Réflexes si le feu approche" },
      {
        type: "ul",
        items: [
          "Suivre les consignes préfecture / pompiers (évacuation, axes routiers)",
          "Couper gaz et électricité si ordonné, emporter papiers d'identité + attestation assurance",
          "Photographier l'état du bien dès que c'est sûr",
          "Déclarer le sinistre à l'assureur sous 5 jours ouvrables (souvent)",
          "Ne pas jeter les biens endommagés avant expertise sauf danger",
        ],
      },
      { type: "bridge" },
      { type: "h2", text: "4. Gironde : pourquoi l'actu change le risque" },
      {
        type: "p",
        text: "Sécheresse prolongée + chaleur + vents = <strong>départs de feu</strong> plus fréquents. Les arrêtés de vigilance (orange puis rouge) restreignent les usages (feux, moteurs, bivouac). Côté contrat, le risque n'augmente pas « automatiquement » les plafonds : c'est à vous de vérifier <strong>avant</strong> le prochain pic. Voir aussi <a href=\"./restriction-eau-secheresse-gironde-assurance-habitation.html\">restrictions d'eau Gironde</a> et <a href=\"./canicule-secheresse-fissures-catastrophe-naturelle-assurance.html\">sécheresse et fissures</a>.",
      },
      { type: "h2", text: "Checklist contrat habitation anti-incendie" },
      {
        type: "ul",
        items: [
          "Garantie incendie + fumée + explosion",
          "Dépendances et abris de jardin déclarés",
          "Valeur à neuf vs vétusté déduite",
          "Franchise incendie / Cat Nat",
          "RC vie privée et dommages aux tiers",
          "Assistance relogement temporaire",
        ],
      },
    ],
    faq: [
      {
        q: "L'assurance habitation couvre-t-elle un feu de forêt ?",
        a: "Souvent via incendie et/ou Cat Nat selon le dossier. Tout dépend de l'origine, de l'arrêté éventuel et des exclusions. Faites relire votre contrat par un courtier.",
      },
      {
        q: "Que faire en vigilance rouge en Gironde ?",
        a: "Respecter les interdictions (feu, fumer, moteurs en forêt aux heures interdites), préparer un kit d'évacuation et garder son attestation habitation accessible.",
      },
      {
        q: "Le débroussaillage est-il lié à l'assurance ?",
        a: "Oui indirectement : obligation légale en zone exposée ; un manquement peut peser en cas de sinistre ou de responsabilité.",
      },
    ],
    related: [
      { href: "./restriction-eau-secheresse-gironde-assurance-habitation.html", label: "Restrictions d'eau Gironde" },
      { href: "./pompiers-vigilance-rouge-feux-foret-prevoyance-sinistre.html", label: "Pompiers et sinistre" },
      { href: "./feux-foret-animaux-chien-chat-assurance.html", label: "Animaux et feux de forêt" },
      { href: "../assurance-habitation/", label: "Assurance habitation" },
      { href: "../landings/devis.html?need=habitation", label: "Devis habitation" },
    ],
  },

  {
    file: "pompiers-vigilance-rouge-feux-foret-prevoyance-sinistre.html",
    section: "prevoyance",
    tag: "Feux de forêt",
    tagClass: "tag-actu",
    themes: ["incendie", "pompiers", "prevoyance"],
    title: "Pompiers et feux de forêt : sinistre habitation, arrêt de travail et prévoyance",
    description:
      "Quand les pompiers combattent les incendies : ce que couvre l'habitation, la RC, et pourquoi une prévoyance compte si l'incendie coupe vos revenus.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Feux de forêt : habitation + prévoyance si revenus interrompus.",
    keywords: [
      "pompiers incendie assurance",
      "feux de forêt sinistre",
      "prévoyance arrêt travail incendie",
      "responsabilité civile incendie",
      "relodgeement après incendie",
    ],
    cta: { href: "../landings/devis.html?need=prevoyance", label: "Devis prévoyance" },
    heroImage: {
      src: "./images/prevoyance/famille-protection.jpg",
      alt: "Famille protégée — prévoyance et sinistre",
      caption: "Incendie : protéger le logement et les revenus du foyer.",
    },
    blocks: [
      {
        type: "p",
        text: "Les <strong>pompiers</strong> gèrent le feu ; votre foyer gère l'après : <strong>sinistre habitation</strong>, éventuel <strong>relogement</strong>, parfois <strong>arrêt de travail</strong> ou perte d'activité (artisan, commerçant, chauffeur). Ce duo <strong>habitation + prévoyance</strong> est rarement pensé ensemble — c'est pourtant le moment où il manque le plus. <a href=\"../landings/devis.html?need=prevoyance\"><strong>Étudier une prévoyance</strong></a> · <a href=\"../landings/devis.html?need=habitation\">habitation</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Pendant l'intervention" },
      {
        type: "p",
        text: "Suivez les consignes des <strong>services de secours</strong>. Ne revenez pas dans une zone interdite. Conservez les documents (attestation MRH, inventaire photos smartphone). Les dégâts causés pour circonscrire le feu (accès, démolition partielle) s'examinent au cas par cas avec l'assureur.",
      },
      { type: "h2", text: "2. Habitation : relogement et inventaire" },
      {
        type: "p",
        text: "Beaucoup de contrats prévoient une <strong>assistance relogement</strong> temporaire. Vérifiez durée, plafond hôtel, et prise en charge du mobilier. Photographiez pièce par pièce avant de jeter quoi que ce soit. Guide dédié : <a href=\"./incendies-gironde-feux-foret-assurance-habitation-2026.html\">incendies Gironde et habitation</a>.",
      },
      { type: "h2", text: "3. Prevoyance : si les revenus s'arrêtent" },
      {
        type: "p",
        text: "Indépendant, TNS, salarié en arrêt après stress ou blessure liée à l'évacuation : la <strong>prévoyance</strong> (IJ, invalidité) complète ce que la Sécu ne couvre pas. Les feux de forêt rappellent que le risque n'est pas que « le toit » — c'est aussi <strong>payer le loyer ou le crédit</strong> pendant trois mois.",
      },
      { type: "bridge" },
      { type: "h2", text: "Checklist foyer exposé" },
      {
        type: "ul",
        items: [
          "Attestation habitation + numéro sinistre assureur",
          "Contacts famille / mairie / pompiers",
          "Kit évacuation (papiers, médicaments, laisse animaux)",
          "Prévoir prévoyance si activité dépend de votre présence",
        ],
      },
    ],
    faq: [
      {
        q: "Les pompiers facturent-ils l'intervention ?",
        a: "Les secours publics ne se « facturent » pas comme une entreprise privée. Les questions d'assurance portent sur vos biens et votre RC, pas sur le coût d'intervention des SDIS en général.",
      },
      {
        q: "Pourquoi une prévoyance en plus de l'habitation ?",
        a: "L'habitation répare le bien. La prévoyance protège les revenus si vous ne pouvez plus travailler après le choc ou pendant le relogement.",
      },
    ],
    related: [
      { href: "./incendies-gironde-feux-foret-assurance-habitation-2026.html", label: "Incendies Gironde habitation" },
      { href: "./prevoyance-independants-guide.html", label: "Prévoyance indépendants" },
      { href: "../landings/devis.html?need=prevoyance", label: "Devis prévoyance" },
    ],
  },

  /* —— Restrictions d'eau / sécheresse —— */
  {
    file: "restriction-eau-secheresse-gironde-assurance-habitation.html",
    section: "habitat",
    tag: "Sécheresse",
    tagClass: "tag-actu",
    themes: ["secheresse", "eau", "gironde"],
    title: "Restrictions d'eau et sécheresse Gironde : impact sur l'assurance habitation",
    description:
      "Arrêtés sécheresse et restrictions d'eau en Gironde 2026 : arrosage, piscine, forage — et ce que l'assurance habitation couvre (ou non) en cas de sécheresse / fissures.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Restrictions d'eau Gironde + sécheresse : contrat habitation à jour.",
    keywords: [
      "restriction eau gironde",
      "sécheresse assurance habitation",
      "arrêté sécheresse 2026",
      "interdiction arrosage assurance",
      "catastrophe naturelle sécheresse",
      "fissures maison sécheresse",
    ],
    cta: { href: "../landings/devis.html?need=habitation", label: "Devis habitation" },
    heroImage: {
      src: "./images/canicule/secheresse-fissures.jpg",
      alt: "Sol sec et fissures — sécheresse habitation",
      caption: "Sécheresse Gironde : restrictions d'eau et risque fissures Cat Nat.",
    },
    blocks: [
      {
        type: "p",
        text: "En <strong>Gironde</strong>, l'été 2026 cumule <strong>restrictions d'usage de l'eau</strong> (alerte, alerte renforcée, crise selon bassins) et <strong>vigilance feux de forêt</strong>. Arrosage, remplissage de piscine, lavage de véhicules : souvent interdits ou limités. Côté assurance, la question n'est pas « suis-je en règle avec l'arrêté ? » seulement — c'est aussi : mon <strong>contrat habitation</strong> couvre-t-il la <strong>sécheresse des sols</strong> et les <strong>fissures</strong> ? <a href=\"../landings/devis.html?need=habitation\"><strong>Vérifier mon habitation</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Restrictions d'eau : ce que l'assurance ne remplace pas" },
      {
        type: "p",
        text: "Une <strong>amende</strong> pour arrosage interdit n'est pas un sinistre habitation. L'assureur ne paie pas le non-respect d'un arrêté préfectoral. En revanche, la <strong>sécheresse</strong> qui fait bouger les fondations peut, sous conditions (arrêté Cat Nat, garantie), ouvrir droit à indemnisation — dossier technique, expert, délais.",
      },
      { type: "h2", text: "2. Piscine, jardin, forage" },
      {
        type: "p",
        text: "Déclarez correctement <strong>piscine</strong>, <strong>spa</strong>, dépendances. En période de restriction, le risque « dommage » baisse (moins d'arrosage) mais le risque <strong>structurel</strong> (retrait-gonflement des argiles) augmente avec la sécheresse prolongée. Voir <a href=\"./secheresse-jardin-piscine-restriction-eau-assurance.html\">jardin et piscine</a>.",
      },
      { type: "h2", text: "3. Fissures : ne pas attendre l'hiver" },
      {
        type: "p",
        text: "Photographiez dès les premières fissures (dates, mètre). Consultez un professionnel du bâtiment. Relisez la garantie <strong>catastrophe naturelle sécheresse</strong>. Guide : <a href=\"./canicule-secheresse-fissures-catastrophe-naturelle-assurance.html\">sécheresse et Cat Nat</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Lier eau, feu et habitation" },
      {
        type: "p",
        text: "Même département, même été : <strong>manque d'eau</strong> + <strong>feu de forêt</strong>. Un seul contrat MRH doit être lu sous ces deux angles. Article feux : <a href=\"./incendies-gironde-feux-foret-assurance-habitation-2026.html\">incendies Gironde</a>.",
      },
    ],
    faq: [
      {
        q: "L'assurance paie-t-elle si je ne peux plus arroser ?",
        a: "Non. Les restrictions d'eau sont des mesures de police administrative. L'assurance traite les sinistres (dégâts, Cat Nat), pas les interdictions d'usage.",
      },
      {
        q: "Quand déclarer des fissures liées à la sécheresse ?",
        a: "Dès constat, avec photos datées. Un arrêté Cat Nat peut être nécessaire selon les cas — un courtier ou votre assureur précise la procédure.",
      },
    ],
    related: [
      { href: "./secheresse-jardin-piscine-restriction-eau-assurance.html", label: "Jardin et piscine" },
      { href: "./incendies-gironde-feux-foret-assurance-habitation-2026.html", label: "Incendies Gironde" },
      { href: "./canicule-secheresse-fissures-catastrophe-naturelle-assurance.html", label: "Fissures Cat Nat" },
      { href: "../assurance-habitation/", label: "Hub habitation" },
    ],
  },

  {
    file: "secheresse-jardin-piscine-restriction-eau-assurance.html",
    section: "habitat",
    tag: "Sécheresse",
    tagClass: "tag-actu",
    themes: ["secheresse", "eau"],
    title: "Sécheresse, jardin et piscine : restrictions d'eau et assurance habitation",
    description:
      "Restrictions d'arrosage et de remplissage de piscine : ce qu'il faut déclarer à l'assureur, plafonds, et risques sécheresse sur terrain et clôtures.",
    meta: "7 min · Août 2026",
    cardExcerpt: "Piscine et jardin sous restriction d'eau : points contrat MRH.",
    keywords: [
      "restriction eau piscine",
      "assurance piscine sécheresse",
      "interdiction arrosage jardin",
      "assurance habitation jardin",
      "déclaration piscine assureur",
    ],
    cta: { href: "../landings/questionnaire.html?need=habitation&journey=standard", label: "Questionnaire habitation" },
    heroImage: {
      src: "./images/habitat/canicule-maison.jpg",
      alt: "Maison et jardin en période de canicule",
      caption: "Jardin et piscine : déclarations et plafonds habitation.",
    },
    blocks: [
      {
        type: "p",
        text: "Sous <strong>restriction d'eau</strong>, remplir une piscine ou arroser une pelouse peut être interdit — ce n'est pas un sinistre. En revanche, une <strong>piscine non déclarée</strong>, un liner endommagé, une clôture arrachée ou un arbre qui tombe restent des sujets <strong>assurance habitation</strong>. Faites le point avant la prochaine canicule. <a href=\"../landings/devis.html?need=habitation\"><strong>Devis habitation</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Déclarer la piscine et les aménagements" },
      {
        type: "p",
        text: "Surface, type (enterrée / hors-sol), couverture, alarme : tout doit coller au contrat. Une sous-déclaration peut réduire l'indemnité. Les <strong>abris de jardin</strong> et serres ont souvent des plafonds séparés.",
      },
      { type: "h2", text: "Sécheresse du terrain" },
      {
        type: "p",
        text: "Murs de clôture fissurés, terrasse qui se décolle, arbres morts : documentez. La garantie Cat Nat sécheresse vise surtout le <strong>bâti</strong> (fondations), pas chaque plante du jardin.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Dois-je assurer ma piscine séparément ?",
        a: "Souvent incluse dans la MRH si déclarée. Vérifiez plafonds et franchises — surtout en cas de dommage structurel.",
      },
    ],
    related: [
      { href: "./restriction-eau-secheresse-gironde-assurance-habitation.html", label: "Restrictions eau Gironde" },
      { href: "../landings/devis.html?need=habitation", label: "Devis habitation" },
    ],
  },

  /* —— Présidentielle —— */
  {
    file: "presidentielle-2027-checklist-assurances-foyer.html",
    section: "actu",
    tag: "Présidentielle",
    tagClass: "tag-actu",
    themes: ["presidentielle", "patrimoine"],
    title: "Présidentielle 2027 : checklist assurances du foyer (habitation, mutuelle, prévoyance, prêt)",
    description:
      "Avant 2027 : ce que les débats (retraites, pouvoir d'achat, logement, climat) changent pour vos contrats — checklist pratique courtier ORIAS.",
    meta: "9 min · Août 2026",
    cardExcerpt: "Présidentielle 2027 : 12 points à vérifier sur vos assurances.",
    keywords: [
      "présidentielle 2027 assurance",
      "checklist assurance foyer",
      "élection présidentielle mutuelle",
      "prévoyance retraite 2027",
      "assurance habitation pouvoir d'achat",
    ],
    cta: { href: "../landings/questionnaire.html", label: "Trouver mon questionnaire" },
    heroImage: {
      src: "./images/actu/politique-france.jpg",
      alt: "Actualité politique France — assurances et patrimoine",
      caption: "Présidentielle 2027 : sécuriser le foyer avant les débats.",
    },
    blocks: [
      {
        type: "p",
        text: "La <strong>présidentielle 2027</strong> va saturer l'espace médiatique : retraites, logement, climat, pouvoir d'achat, sécurité. Les lois changent rarement du jour au lendemain — mais vos <strong>contrats</strong>, eux, se renégocient tout de suite. Voici une <strong>checklist foyer</strong> pour ne pas subir les hausses et les sinistres climat pendant la campagne. <a href=\"../landings/questionnaire.html\"><strong>Choisir mon besoin</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Habitation & climat" },
      {
        type: "p",
        text: "Incendies, sécheresse, orages : l'actu 2026 en Gironde le rappelle. Relisez incendie, Cat Nat, dépendances. <a href=\"./incendies-gironde-feux-foret-assurance-habitation-2026.html\">Feux de forêt</a> · <a href=\"./restriction-eau-secheresse-gironde-assurance-habitation.html\">restrictions d'eau</a>.",
      },
      { type: "h2", text: "2. Mutuelle & seniors" },
      {
        type: "p",
        text: "Hausses tarifaires + canicule = intent fort de comparaison. <a href=\"./canicule-mutuelle-coup-chaleur-seniors-2026.html\">Mutuelle seniors canicule</a> · <a href=\"../landings/sante.html\">comparatif mutuelle</a>.",
      },
      { type: "h2", text: "3. Prevoyance & retraite" },
      {
        type: "p",
        text: "Quel que soit le programme, votre <strong>arrêt de travail</strong> et votre <strong>invalidité</strong> se jouent sur votre contrat actuel. <a href=\"./presidentielle-2027-retraite-mutuelle-prevoyance.html\">Retraite, mutuelle, prévoyance</a>.",
      },
      { type: "h2", text: "4. Crédit & emprunteur" },
      {
        type: "p",
        text: "Loi Lemoine : changez d'assurance emprunteur sans attendre. <a href=\"./assurance-emprunteur-loi-lemoine-2026.html\">Guide Lemoine</a> · <a href=\"../landings/credit-immo.html\">crédit immo</a>.",
      },
      { type: "h2", text: "Checklist 12 points" },
      {
        type: "ul",
        items: [
          "Attestation habitation à jour + dépendances déclarées",
          "Franchise Cat Nat / incendie connues",
          "Mutuelle : hospitalisation + téléconsultation",
          "Prévoyance TNS / IJ si indépendant",
          "Emprunteur : devis concurrent Lemoine",
          "Auto : garanties clim (grêle, tempête)",
          "Animaux : plafond chirurgie",
          "RC vie privée / chasse / équitation si loisir",
          "Bénéficiaires assurance-vie à jour",
          "Inventaire photos smartphone du logement",
          "Contacts sinistre assureur enregistrés",
          "Devis comparatif avant reconduction tacite",
        ],
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Faut-il attendre la présidentielle pour changer d'assurance ?",
        a: "Non. Les hausses et sinistres n'attendent pas 2027. Comparez maintenant, surtout habitation, mutuelle et emprunteur.",
      },
      {
        q: "Un courtier est-il utile en période électorale ?",
        a: "Oui : il filtre le bruit politique et aligne les contrats sur votre risque réel (climat, santé, crédit).",
      },
    ],
    related: [
      { href: "./elections-presidentielles-prevoyance-patrimoine.html", label: "Élections et patrimoine" },
      { href: "./presidentielle-2027-retraite-mutuelle-prevoyance.html", label: "Retraite et prévoyance" },
      { href: "./darmanin-securite-habitation-assurance-emprunteur.html", label: "Sécurité et habitation" },
      { href: "../assurances-niches.html", label: "Assurances de niche" },
    ],
  },

  {
    file: "presidentielle-2027-retraite-mutuelle-prevoyance.html",
    section: "prevoyance",
    tag: "Présidentielle",
    tagClass: "tag-actu",
    themes: ["presidentielle", "retraite"],
    title: "Présidentielle 2027, retraite et mutuelle : ce que la prévoyance sécurise déjà",
    description:
      "Débats retraite 2027 : pourquoi mutuelle seniors et prévoyance (IJ, invalidité, décès) se décident avant les urnes — guide pratique.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Retraite 2027 : mutuelle + prévoyance à caler maintenant.",
    keywords: [
      "présidentielle retraite 2027",
      "mutuelle seniors 2027",
      "prévoyance retraite",
      "assurance invalidité indépendant",
      "pouvoir d'achat mutuelle",
    ],
    cta: { href: "../landings/sante.html", label: "Comparer ma mutuelle" },
    heroImage: {
      src: "./images/canicule/seniors-couple-ete.jpg",
      alt: "Couple senior — mutuelle et prévoyance",
      caption: "Seniors et actifs : mutuelle et prévoyance avant 2027.",
    },
    blocks: [
      {
        type: "p",
        text: "Quel que soit le vainqueur de <strong>2027</strong>, votre <strong>reste à charge santé</strong> et votre <strong>perte de revenus</strong> se jouent sur des contrats privés. La prévoyance et la mutuelle ne remplacent pas une réforme des retraites — elles évitent que le foyer bascule au premier arrêt maladie. <a href=\"../landings/sante.html\"><strong>Comparer ma mutuelle</strong></a> · <a href=\"../landings/devis.html?need=prevoyance\">prévoyance</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Mutuelle : hospitalisation et téléconsultation" },
      {
        type: "p",
        text: "Les étés caniculaires (et les feux de forêt qui saturent les secours) rappellent l'intérêt d'une bonne <strong>hospitalisation</strong>. Voir <a href=\"./canicule-mutuelle-coup-chaleur-seniors-2026.html\">canicule seniors</a>.",
      },
      { type: "h2", text: "Prévoyance : IJ et invalidité" },
      {
        type: "p",
        text: "Indépendants et TNS : sans prévoyance, un mois d'arrêt après un sinistre (incendie, accident) pèse autant qu'une réforme. <a href=\"./prevoyance-independants-guide.html\">Guide prévoyance indépendants</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "La mutuelle remplace-t-elle la prévoyance ?",
        a: "Non. La mutuelle complète les soins. La prévoyance remplace une partie des revenus en cas d'arrêt ou d'invalidité.",
      },
    ],
    related: [
      { href: "./presidentielle-2027-checklist-assurances-foyer.html", label: "Checklist présidentielle" },
      { href: "./elections-presidentielles-prevoyance-patrimoine.html", label: "Élections et patrimoine" },
      { href: "../landings/sante.html", label: "Mutuelle" },
    ],
  },

  /* —— Niches chasse / équitation / animaux —— */
  {
    file: "assurance-chasse-rc-chasseur-guide-2026.html",
    section: "chasse",
    tag: "Niche chasse",
    tagClass: "tag-guide",
    themes: ["chasse", "niche"],
    title: "Assurance chasse et RC chasseur 2026 : garanties, prix, devis",
    description:
      "Assurance chasse pas cher et RC chasseur : responsabilité civile obligatoire, chien de chasse, comparatif — guide courtier ORIAS France.",
    meta: "9 min · 2026",
    cardExcerpt: "RC chasseur + assurance chasse : le guide niches 2026.",
    keywords: [
      "assurance chasse",
      "rc chasseur",
      "assurance chasse pas cher",
      "responsabilité civile chasseur",
      "devis assurance chasse",
      "assurance chasse 2026",
    ],
    cta: { href: "../landings/chasse.html", label: "Devis assurance chasse" },
    heroImage: {
      src: "./images/habitat/maison-famille.jpg",
      alt: "Foyer et loisirs — assurance responsabilité chasse",
      caption: "Chasse : RC chasseur et garanties à comparer.",
    },
    blocks: [
      {
        type: "p",
        text: "L'<strong>assurance chasse</strong> et la <strong>RC chasseur</strong> sont des niches à faible concurrence SEO : peu de comparateurs saturent « assurance chasse [ville] ». Pourtant la <strong>responsabilité civile</strong> est centrale dès que l'on porte une arme ou que l'on circule en battue. Ce guide résume garanties, exclusions et devis. <a href=\"../landings/chasse.html\"><strong>Devis chasse</strong></a> · <a href=\"../landings/questionnaire.html?need=chasse&journey=standard\">questionnaire</a> · <a href=\"../assurance-chasse/\">hub SEO chasse</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. RC chasseur : le socle" },
      {
        type: "p",
        text: "Dommages corporels ou matériels causés à un tiers pendant l'acte de chasse : la <strong>RC</strong> est le poste n°1. Vérifiez plafonds, territorialité, et activités annexes (ball-trap, entraînement).",
      },
      { type: "h2", text: "2. Chien de chasse" },
      {
        type: "p",
        text: "Blessure, disparition, RC du chien : souvent un avenant ou un contrat dédié. Voir <a href=\"./assurance-chien-de-chasse-rc-comparatif.html\">chien de chasse</a> et <a href=\"../assurance-chasse/chien-chasse/\">page silo</a>.",
      },
      { type: "h2", text: "3. Habitation et armes" },
      {
        type: "p",
        text: "Le stockage des armes au domicile interagit avec l'<strong>habitation</strong> (coffre, vol). En période de feux de forêt (Gironde), vérifiez aussi l'accès et le débroussaillage de votre propriété.",
      },
      { type: "h2", text: "Mots-clés longue traîne qui convertissent" },
      {
        type: "ul",
        items: [
          "assurance chasse pas cher",
          "rc chasseur devis",
          "assurance chasse Paris / Lyon / Bordeaux",
          "assurance chien de chasse",
          "responsabilité civile chasseur obligatoire",
        ],
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "La RC chasse est-elle obligatoire ?",
        a: "La responsabilité civile est exigée dans le cadre de la pratique ; les modalités exactes dépendent des fédérations et du contrat. Un courtier aligne le devis sur votre pratique réelle.",
      },
      {
        q: "Puis-je assurer chasse + habitation chez le même courtier ?",
        a: "Oui. Leads Opportunities compare les niches et l'habitation pour éviter les trous de garantie.",
      },
    ],
    related: [
      { href: "./assurance-chien-de-chasse-rc-comparatif.html", label: "Chien de chasse" },
      { href: "../assurance-chasse/rc-chasseur/", label: "RC chasseur" },
      { href: "../assurance-chasse/", label: "Hub assurance chasse" },
      { href: "../landings/chasse.html", label: "Landing chasse" },
      { href: "../assurances-niches.html", label: "Toutes les niches" },
    ],
  },

  {
    file: "assurance-chien-de-chasse-rc-comparatif.html",
    section: "animaux",
    tag: "Niche chasse",
    tagClass: "tag-guide",
    themes: ["chasse", "animaux"],
    title: "Assurance chien de chasse : RC, blessures et comparatif 2026",
    description:
      "Chien de chasse : assurance animaux vs avenant chasse — RC, frais véto, disparition. Comparatif et devis ORIAS.",
    meta: "7 min · 2026",
    cardExcerpt: "Chien de chasse : RC + frais véto à comparer.",
    keywords: [
      "assurance chien de chasse",
      "chien de chasse rc",
      "assurance chien chasse pas cher",
      "mutuelle chien de chasse",
      "responsabilité civile chien chasse",
    ],
    cta: { href: "../landings/animaux.html", label: "Devis assurance animaux" },
    heroImage: {
      src: "./images/animaux/chien-promenade.jpg",
      alt: "Chien en extérieur — assurance et RC",
      caption: "Chien de chasse : frais véto et responsabilité.",
    },
    blocks: [
      {
        type: "p",
        text: "Un <strong>chien de chasse</strong> cumule deux risques : <strong>frais vétérinaires</strong> (blessures en action) et <strong>RC</strong> (dommages à un tiers). Selon les cas, on combine contrat <strong>animaux</strong> et volet <strong>chasse</strong>. <a href=\"../landings/animaux.html\"><strong>Devis animaux</strong></a> · <a href=\"../landings/chasse.html\">devis chasse</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Frais véto" },
      {
        type: "p",
        text: "Plafonds chirurgie, franchise, délai de carence : les mêmes critères que pour un chien de compagnie, avec une sinistralité parfois plus élevée. <a href=\"../assurance-animaux/chien/pas-cher/\">Chien pas cher</a>.",
      },
      { type: "h2", text: "RC et disparition" },
      {
        type: "p",
        text: "Vérifiez si la RC du chien est dans l'habitation, dans le contrat chasse, ou les deux. Guide RC : <a href=\"./assurance-chasse-rc-chasseur-guide-2026.html\">RC chasseur</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Une mutuelle chien classique suffit-elle pour la chasse ?",
        a: "Pour les soins souvent oui ; pour la RC liée à l'acte de chasse, vérifiez le contrat chasse / RC chasseur.",
      },
    ],
    related: [
      { href: "./assurance-chasse-rc-chasseur-guide-2026.html", label: "RC chasseur" },
      { href: "./feux-foret-animaux-chien-chat-assurance.html", label: "Animaux et feux" },
      { href: "../assurance-chasse/chien-chasse/", label: "Silo chien de chasse" },
    ],
  },

  {
    file: "assurance-equitation-rc-equestre-guide-2026.html",
    section: "equitation",
    tag: "Niche équitation",
    tagClass: "tag-guide",
    themes: ["equitation", "niche"],
    title: "Assurance équitation et RC équestre 2026 : guide devis",
    description:
      "Assurance équitation, RC équestre, centre équestre et cavalier : garanties, exclusions, devis — niche SEO faible concurrence.",
    meta: "9 min · 2026",
    cardExcerpt: "RC équestre + assurance cheval : guide niches 2026.",
    keywords: [
      "assurance équitation",
      "rc équestre",
      "assurance cheval",
      "assurance centre équestre",
      "assurance équitation pas cher",
      "responsabilité civile équestre",
    ],
    cta: { href: "../landings/equitation.html", label: "Devis équitation" },
    heroImage: {
      src: "./images/habitat/maison-famille.jpg",
      alt: "Activité loisirs famille — assurance équitation",
      caption: "Équitation : RC équestre et protection du cavalier.",
    },
    blocks: [
      {
        type: "p",
        text: "L'<strong>assurance équitation</strong> et la <strong>RC équestre</strong> ciblent cavaliers, propriétaires de chevaux et centres. Sur Google, « assurance cheval pas cher » et « rc équestre [ville] » restent des requêtes gagnables. <a href=\"../landings/equitation.html\"><strong>Devis équitation</strong></a> · <a href=\"../assurance-equitation/\">hub SEO</a> · <a href=\"../assurance-equitation/rc-equestre/\">RC équestre</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "RC équestre" },
      {
        type: "p",
        text: "Dommages causés à un tiers par le cheval ou pendant la pratique : plafonds et exclusions (compétition, location) à lire attentivement.",
      },
      { type: "h2", text: "Mortalité / frais véto cheval" },
      {
        type: "p",
        text: "Selon la valeur de l'animal et l'usage (loisir, sport), les garanties diffèrent. Voir <a href=\"./assurance-cheval-pas-cher-criteres-2026.html\">cheval pas cher — critères</a>.",
      },
      { type: "h2", text: "Lien habitation / prévoyance" },
      {
        type: "p",
        text: "Accident du cavalier : la mutuelle et la prévoyance complètent la RC. En été, chaleur et transports d'animaux augmentent les risques (aussi liés aux restrictions d'eau sur les structures).",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "La RC vie privée couvre-t-elle mon cheval ?",
        a: "Pas toujours. Beaucoup de contrats excluent ou limitent les animaux de selle — d'où l'intérêt d'une RC équestre dédiée.",
      },
    ],
    related: [
      { href: "./assurance-cheval-pas-cher-criteres-2026.html", label: "Cheval pas cher" },
      { href: "../assurance-equitation/rc-equestre/", label: "RC équestre" },
      { href: "../landings/equitation.html", label: "Landing équitation" },
      { href: "../assurances-niches.html", label: "Hub niches" },
    ],
  },

  {
    file: "assurance-cheval-pas-cher-criteres-2026.html",
    section: "equitation",
    tag: "Niche équitation",
    tagClass: "tag-guide",
    themes: ["equitation", "niche"],
    title: "Assurance cheval pas cher : 7 critères pour comparer sans se tromper",
    description:
      "Assurance cheval pas cher : mortalité, frais véto, RC, franchise — 7 critères et devis équitation ORIAS.",
    meta: "7 min · 2026",
    cardExcerpt: "7 critères pour une assurance cheval vraiment adaptée.",
    keywords: [
      "assurance cheval pas cher",
      "assurance cheval devis",
      "mutuelle cheval",
      "frais vétérinaires cheval",
      "assurance équidé",
    ],
    cta: { href: "../landings/questionnaire.html?need=equitation&journey=standard", label: "Questionnaire équitation" },
    heroImage: {
      src: "./images/animaux/chien-veterinaire.jpg",
      alt: "Soins vétérinaires — analogie frais de santé animal",
      caption: "Frais véto cheval : plafonds et franchises à comparer.",
    },
    blocks: [
      {
        type: "p",
        text: "« <strong>Assurance cheval pas cher</strong> » ne veut rien dire sans critères : valeur de l'équidé, usage, mortalité, frais véto, transport, RC. Voici 7 points pour un devis utile. <a href=\"../landings/equitation.html\"><strong>Devis équitation</strong></a>.",
      },
      { type: "bridge" },
      {
        type: "ul",
        items: [
          "Usage : loisir, sport, élevage",
          "Valeur déclarée de l'animal",
          "Mortalité / euthanasie",
          "Frais vétérinaires et plafonds",
          "Franchise et carence",
          "Transport et compétition",
          "RC équestre associée",
        ],
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Le moins cher est-il suffisant ?",
        a: "Rarement. Un contrat bas de gamme peut exclure la compétition ou plafonner trop bas les frais véto. Comparez à garanties équivalentes.",
      },
    ],
    related: [
      { href: "./assurance-equitation-rc-equestre-guide-2026.html", label: "Guide RC équestre" },
      { href: "../assurance-equitation/cheval/", label: "Silo assurance cheval" },
    ],
  },

  {
    file: "feux-foret-animaux-chien-chat-assurance.html",
    section: "animaux",
    tag: "Feux de forêt",
    tagClass: "tag-actu",
    themes: ["incendie", "animaux"],
    title: "Feux de forêt et animaux : évacuation, frais véto et assurance chien/chat",
    description:
      "Incendies et vigilance rouge : comment protéger chien et chat, que couvre l'assurance animaux (urgence, brûlures, stress), devis ORIAS.",
    meta: "7 min · Août 2026",
    cardExcerpt: "Feux de forêt : kit évacuation animaux + assurance véto.",
    keywords: [
      "incendie animaux assurance",
      "évacuation chien chat feu",
      "assurance chien incendie",
      "frais véto brûlure animal",
      "feux de forêt animaux domestiques",
    ],
    cta: { href: "../landings/animaux.html", label: "Devis assurance animaux" },
    heroImage: {
      src: "./images/animaux/canicule-chien-eau.jpg",
      alt: "Chien en période de chaleur — hydratation et prévention",
      caption: "Chaleur et feux : anticiper l'évacuation des animaux.",
    },
    blocks: [
      {
        type: "p",
        text: "En <strong>vigilance rouge feux de forêt</strong> (comme en Gironde en août 2026), chiens et chats font partie du <strong>kit d'évacuation</strong> : laisse, cage, médicaments, carnet. L'<strong>assurance animaux</strong> intervient ensuite sur les <strong>frais véto</strong> (brûlures, intoxications fumée, stress). <a href=\"../landings/animaux.html\"><strong>Comparer assurance animaux</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Avant le feu" },
      {
        type: "ul",
        items: [
          "Laisse / cage prêtes près de la sortie",
          "Médicaments et ordonnances",
          "Photo récente de l'animal",
          "Attestation assurance animaux sur le téléphone",
        ],
      },
      { type: "h2", text: "Après : ce que paie (ou non) le contrat" },
      {
        type: "p",
        text: "Urgence, hospitalisation, chirurgie : selon plafonds. Les exclusions (actes de prévention seule, délais de carence) restent classiques. Habitation : <a href=\"./incendies-gironde-feux-foret-assurance-habitation-2026.html\">guide incendies Gironde</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "L'habitation couvre-t-elle mon animal en cas d'incendie ?",
        a: "Parfois une indemnité forfaitaire limitée. Les frais véto lourds passent surtout par une assurance animaux dédiée.",
      },
    ],
    related: [
      { href: "./incendies-gironde-feux-foret-assurance-habitation-2026.html", label: "Incendies habitation" },
      { href: "./canicule-animaux-eau-chien-chat-oiseaux-assurance.html", label: "Canicule animaux" },
      { href: "../landings/animaux.html", label: "Landing animaux" },
    ],
  },

  {
    file: "orages-grele-ete-auto-habitation-2026.html",
    section: "auto",
    tag: "Climat",
    tagClass: "tag-actu",
    themes: ["orage", "grele", "climat"],
    title: "Orages et grêle été 2026 : assurance auto et habitation",
    description:
      "Orages violents et grêle après la chaleur : garanties auto (bris de glace, tempête) et habitation — checklist sinistre.",
    meta: "7 min · Août 2026",
    cardExcerpt: "Grêle et orages : auto + habitation à synchroniser.",
    keywords: [
      "assurance grêle auto",
      "orage violent habitation",
      "bris de glace grêle",
      "tempête assurance voiture",
      "sinistre grêle 2026",
    ],
    cta: { href: "../landings/devis.html?need=auto", label: "Devis auto" },
    heroImage: {
      src: "./images/canicule/inondation-degats-eaux.jpg",
      alt: "Dégâts après orage — eau et toiture",
      caption: "Orages post-canicule : auto et toiture.",
    },
    blocks: [
      {
        type: "p",
        text: "Après les pics de chaleur et les <strong>feux de forêt</strong>, les <strong>orages</strong> et la <strong>grêle</strong> frappent carrosseries et toitures. Deux contrats à aligner : <strong>auto</strong> (bris de glace, tempête) et <strong>habitation</strong> (toiture, dépendances). <a href=\"../landings/devis.html?need=auto\"><strong>Devis auto</strong></a> · <a href=\"../landings/devis.html?need=habitation\">habitation</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Auto" },
      {
        type: "p",
        text: "Tous risques vs tiers + bris de glace : la grêle se joue souvent sur les options. Photographiez avant réparation.",
      },
      { type: "h2", text: "Habitation" },
      {
        type: "p",
        text: "Toiture, gouttières, caves après pluie diluvienne : voir aussi <a href=\"./canicule-degats-eaux-assurance-habitation.html\">dégâts des eaux</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "La grêle est-elle toujours couverte en auto ?",
        a: "Selon la formule. Le tiers simple ne suffit souvent pas ; vérifiez bris de glace et dommages tous accidents.",
      },
    ],
    related: [
      { href: "./incendies-gironde-feux-foret-assurance-habitation-2026.html", label: "Incendies Gironde" },
      { href: "./restriction-eau-secheresse-gironde-assurance-habitation.html", label: "Sécheresse eau" },
      { href: "../landings/devis.html?need=auto", label: "Devis auto" },
    ],
  },
];
