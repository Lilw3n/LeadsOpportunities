/**
 * Niche ACPR Wakam — pack PUB / conversion (Meta + organique).
 * Contenu 100 % Leads Opportunities : ne pas calquer VTC Protect
 * (pas de « 7 assureurs », pas de tables sept–nov, pas de stats 15–20 %).
 *
 * Angle pub : courses perdues si attestation coupe, checklist action,
 * CTA questionnaire / landing VTC dès le hero.
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
var bridge = { type: "bridge" };

var CTA_VTC =
  '<a href="../landings/vtc.html?utm_content=wakam-pub"><strong>Devis VTC hors Wakam</strong></a> · <a href="../landings/questionnaire.html?need=vtc&journey=standard&utm_content=wakam-pub">questionnaire 3 min</a>';
var CTA_YEET =
  '<a href="../landings/vtc.html?utm_content=yeet-wakam"><strong>Remplacer Yeet sans trou</strong></a> · <a href="../landings/questionnaire.html?need=vtc&journey=standard&utm_content=yeet-wakam">questionnaire VTC</a>';
var CTA_MB =
  '<a href="../landings/vtc.html?utm_content=marque-blanche-wakam"><strong>Vérifier mon porteur + devis</strong></a> · <a href="../landings/questionnaire.html?need=vtc&journey=standard&utm_content=marque-blanche-wakam">questionnaire</a>';

var deep = {
  "wakam-acpr-assurance-vtc-bascule-2026.html": {
    keywords: [
      "Wakam VTC ACPR",
      "bascule assurance VTC 2026",
      "attestation Uber hors Wakam",
      "Yeet +Simple Solly Zéphir Wakam",
      "relevé d'information chauffeur",
      "zéro jour de trou VTC",
      "RC à titre onéreux",
      "RC Pro plateforme",
      "devis assurance VTC urgent",
      "courtier ORIAS Leads Opportunities",
      "échéance assurance VTC",
      "Île-de-France VTC",
      "sinistre Wakam supervision",
      "changer assureur VTC avant anniversaire",
      "courses perdues attestation",
    ],
    extraBlocks: [
      h2("Ce que ça coûte vraiment si Uber coupe demain"),
      p(
        "Un compte plateforme désactivé pour attestation non conforme, ce n’est pas « un papier à refaire » : c’est <strong>zéro course</strong> le temps de trouver un porteur, de signer, d’uploader. En IDF aux heures de pointe, ça se compte en <strong>centaines d’euros de chiffre d’affaires</strong> — plus le stress du malus si vous tentez de rouler quand même. La décision ACPR du <strong>25 septembre 2026</strong> ne vous radié pas aujourd’hui ; elle fixe une <strong>deadline = votre date d’anniversaire</strong>."
      ),
      h3("Ce que l’ACPR a figé (en clair)"),
      ul([
        "Plus de <strong>nouvelles souscriptions</strong> chez Wakam",
        "Plus de <strong>renouvellements</strong> à l’échéance",
        "Les contrats <strong>en cours</strong> restent à gérer (sinistres inclus) sous supervision",
        "Ce n’est <strong>pas</strong> une liquidation annoncée : c’est un gel de développement",
      ]),
      bridge,
      h2("60 secondes : êtes-vous vraiment chez Wakam ?"),
      ul([
        "Ouvrir l’attestation PDF (pas le logo de l’app Yeet / du courtier)",
        "Chercher « <strong>Wakam</strong> » ou « 120‑122 rue Réaumur »",
        "Noter <strong>échéance</strong> (jour + heure si indiquée)",
        "Lister Uber / Bolt / Heetch / Free Now actifs",
        "Demander le <strong>relevé d’information</strong> par écrit à l’intermédiaire <em>aujourd’hui</em>",
      ]),
      p(
        "Marques souvent concernées quand le porteur est Wakam : <strong>Yeet</strong>, <strong>+Simple</strong>, Solly Azar, Zéphir, Axece, cabinets locaux en marque blanche. Le nom commercial n’est pas le porteur — l’attestation, si."
      ),
      h2("Plan de bascule « zéro course perdue »"),
      ul([
        "<strong>J‑45 → J‑30</strong> : RI + 2 devis hors Wakam (même postes : RC onéreuse, RC Pro, franchises, assistance)",
        "<strong>J‑21</strong> : pièces (carte VTC, SIRET, CG, permis, historique)",
        "<strong>J‑7</strong> : attestation de remplacement en main — vérifier « <em>transport de personnes à titre onéreux</em> »",
        "<strong>J‑0</strong> : prise d’effet alignée à l’heure ; upload plateformes le jour même",
      ]),
      h3("Ne faites pas ça"),
      ul([
        "Résilier avant d’avoir la nouvelle attestation",
        "Uploader une auto « particulier » ou pro sans mention onéreuse",
        "Attendre le dernier SMS d’Uber pour bouger",
        "Comparer uniquement le prix mensuel (franchise 1 500 € vs 400 € = piège)",
        "Croire que le score de conduite Yeet « suivra » chez un autre porteur",
      ]),
      bridge,
      h2("Ce que Leads Opportunities place réellement"),
      p(
        "On n’est pas un comparateur grand public. Courtier <strong>ORIAS</strong> : on aligne les garanties pour que l’attestation <strong>passe les plateformes</strong>, puis on cherche la capacité hors Wakam via nos accords. Fourchettes de marché 2026 souvent vues : <strong>~150–350 € / mois</strong> selon zone (Paris / IDF plus sélectif), véhicule, sinistralité, formule. Confirmé au devis — pas au slogan. " +
          CTA_VTC
      ),
      h3("Profils à traiter en priorité"),
      ul([
        "Échéance &lt; 90 jours",
        "Résilié / malussé (délais d’étude plus longs)",
        "Paris, petite couronne, Marseille, aéroports",
        "Flotte / multi‑véhicules",
        "Attestation sans mention à titre onéreux",
      ]),
      h2("Documents = vitesse de signature"),
      ul([
        "Relevé d’information (idéalement 3–5 ans)",
        "Attestation + conditions particulières actuelles",
        "Carte pro VTC + preuve d’activité",
        "Carte grise, permis, situation malus",
        "SIRET / statut (AE, EURL, SASU…)",
      ]),
      h2("Réponses nettes (pour Meta & WhatsApp)"),
      p(
        "<strong>Mon sinistre Wakam sera payé ?</strong> Tant que le contrat court, la gestion des sinistres continue sous supervision. Déclarez dans les délais."
      ),
      p(
        "<strong>Non‑renouvellement = résiliation pour faute ?</strong> Non. Motif porteur, pas votre conduite. Le RI + un mot du courtier évitent le mauvais classement."
      ),
      p(
        "<strong>Et si le gel est levé ?</strong> Possible. Comparer maintenant ne coûte rien ; attendre J‑5 multiplie les refus."
      ),
    ],
    faq: [
      {
        q: "Comment savoir si mon VTC est porté par Wakam ?",
        a: "Lisez l’attestation et les conditions particulières : le porteur (Wakam) y figure même si vous avez souscrit chez Yeet, +Simple ou un grossiste. Demandez confirmation écrite en cas de doute.",
      },
      {
        q: "Dois-je résilier tout de suite ?",
        a: "Non. Gardez la couverture jusqu’à l’échéance et basculez seulement avec une nouvelle attestation déjà émise et compatible plateformes.",
      },
      {
        q: "Que faut-il pour rester actif sur Uber / Bolt / Heetch ?",
        a: "RC circulation à titre onéreux + RC Pro. Sans ces mentions, le compte peut être coupé immédiatement.",
      },
      {
        q: "Quand lancer les devis ?",
        a: "30 à 45 jours avant l’échéance. Plus tôt si résilié, malussé, IDF, ou RI qui tarde.",
      },
      {
        q: "Leads Opportunities peut-il placer hors Wakam ?",
        a: "Oui, via nos accords courtiers / grossistes. Passez par le devis VTC ou le questionnaire pour démarrer le dossier.",
      },
    ],
  },

  "yeet-vtc-wakam-bascule-attestation-2026.html": {
    keywords: [
      "Yeet VTC Wakam",
      "Yeet assurance non renouvelée",
      "boîtier Yeet score conduite",
      "remplacer Yeet VTC",
      "attestation Uber après Yeet",
      "relevé information Yeet",
      "ACPR Wakam Yeet",
      "tarif fixe vs comportement VTC",
      "rachat franchise VTC",
      "devis hors Yeet",
      "chauffeur VTC Lyon Yeet",
      "DriveQuant VTC",
      "bascule Yeet échéance",
      "Leads Opportunities VTC",
      "RC Pro après Yeet",
    ],
    extraBlocks: [
      h2("Yeet, c’est une marque — Wakam, c’est le porteur"),
      p(
        "L’app, le boîtier, le score de conduite : c’est l’expérience <strong>Yeet</strong>. Sur l’attestation, c’est souvent <strong>Wakam</strong> qui porte le risque. Depuis le gel ACPR du 25 septembre 2026, ce porteur ne peut plus renouveler. Votre score 5 étoiles ne prolonge pas le contrat : seule l’<strong>échéance</strong> compte."
      ),
      h3("Ce que vous pourriez « perdre » en sortant de Yeet — et ce qui compte vraiment"),
      ul([
        "<strong>Remise comportementale</strong> : elle reste dans l’écosystème Yeet. Ailleurs, comparez un <em>tarif fixe</em> à garanties égales, pas « avec la remise ».",
        "<strong>Rachat de franchise / options</strong> : rares ailleurs — notez le montant de franchise du nouveau contrat (400 € vs 1 500 € = vrai écart au sinistre).",
        "<strong>RC onéreuse + RC Pro</strong> : non négociables pour Uber / Bolt — c’est le cœur de la bascule.",
        "<strong>Boîtier</strong> : demandez par écrit la marche à suivre (restitution / désactivation) en même temps que le RI.",
      ]),
      bridge,
      h2("Séquence Yeet → nouvel assureur (sans couper les apps)"),
      ul([
        "Noter l’échéance dans l’espace client Yeet / conditions particulières",
        "Demander RI + motif de fin (non‑renouvellement porteur ≠ résiliation faute)",
        "Lancer devis hors Wakam avec Leads Opportunities — " + CTA_YEET,
        "Signer pour une prise d’effet à l’heure de fin Yeet",
        "Uploader l’attestation le J‑0 (pas la veille « pour voir » si elle n’est pas encore active)",
      ]),
      h2("Piège Meta : « je change demain »"),
      p(
        "Les pubs concurrentes poussent le devis 2 minutes. Notre critère est plus dur : <strong>attestation conforme plateformes à la bonne date</strong>. Un devis trop bas sans mention onéreuse, c’est une fausse économie et un compte Uber coupé. On préfère un dossier un peu plus long qu’un trou de couverture."
      ),
      h3("Pour qui c’est urgent"),
      ul([
        "Échéance dans les 45 jours",
        "Chauffeur IDF / aéroports (sélection plus serrée)",
        "Malus ou sinistre récent",
        "Flotte multi‑véhicules sous Yeet",
      ]),
    ],
    faq: [
      {
        q: "Mon contrat Yeet est-il porté par Wakam ?",
        a: "Souvent oui depuis le lancement du produit : vérifiez l’attestation. En cas de doute, demandez confirmation écrite à Yeet / votre intermédiaire.",
      },
      {
        q: "Mon score de conduite sert-il ailleurs ?",
        a: "En pratique non. Ce qui suit, c’est le relevé d’information et le bonus-malus officiel.",
      },
      {
        q: "Yeet va-t-il me trouver un autre porteur ?",
        a: "Ne comptez pas dessus pour une échéance proche. Sécurisez un devis hors Wakam en parallèle.",
      },
      {
        q: "Puis-je garder le même prix qu’avec la remise Yeet ?",
        a: "Pas garanti. Comparez des tarifs à garanties égales, sans la remise comportementale, et regardez la franchise.",
      },
      {
        q: "Comment démarrer avec Leads Opportunities ?",
        a: "Questionnaire VTC ou landing devis : on récupère l’échéance, le RI et on vise une attestation compatible apps.",
      },
    ],
  },

  "solly-zephir-wakam-marque-blanche-vtc-2026.html": {
    keywords: [
      "Solly Azar VTC Wakam",
      "Zéphir VTC Wakam",
      "marque blanche assurance VTC",
      "porteur de risque attestation",
      "non renouvellement Solly VTC",
      "Zéphir échéance ACPR",
      "grossiste VTC alternatif",
      "Axece PlusSimple Wakam",
      "attestation transport onéreux",
      "bascule Solly Azar",
      "courtier VTC hors Wakam",
      "relevé information Solly",
      "Uber attestation après Solly",
      "Leads Opportunities Solly Zéphir",
      "portefeuille marque blanche VTC",
    ],
    extraBlocks: [
      h2("Marque blanche = un seul point de rupture"),
      p(
        "Solly Azar, Zéphir, +Simple, Axece… beaucoup vendent sous leur marque. Si le <strong>porteur</strong> sur l’attestation est Wakam, le gel ACPR du 25 septembre 2026 les touche tous de la même façon : <strong>pas de renouvellement</strong> à l’anniversaire. Ce n’est pas « Solly qui a mal fait » ni « Zéphir qui résilie pour faute » : c’est le porteur qui ne peut plus prolonger."
      ),
      h3("Comment lire l’attestation en 20 secondes"),
      ul([
        "Ignorez le logo commercial en haut",
        "Cherchez la ligne assureur / porteur : Wakam ?",
        "Notez l’adresse Réaumur si présente",
        "Relevez l’échéance et le n° de contrat",
        "Demandez le RI au grossiste / courtier qui gère le dossier",
      ]),
      bridge,
      h2("Message à envoyer à votre intermédiaire (copier-coller)"),
      p(
        "« Bonjour, suite à la mesure ACPR concernant Wakam, merci de me confirmer par écrit (1) si Wakam est bien le porteur de mon contrat VTC, (2) ma date d’échéance exacte, (3) le motif de non‑renouvellement le cas échéant, et (4) de m’adresser mon relevé d’information sous 15 jours. »"
      ),
      h2("Ensuite : placement hors Wakam avec LO"),
      p(
        "Une fois le RI en main, on compare des capacités <strong>hors Wakam</strong> sur les mêmes postes (RC onéreuse, RC Pro, franchises, assistance). Objectif pub = <strong>pas de jour sans attestation conforme</strong>. " +
          CTA_MB
      ),
      h3("Erreurs fréquentes après un article concurrent"),
      ul([
        "Résilier « pour être libre » trop tôt",
        "Accepter un devis sans vérifier la mention plateformes",
        "Oublier le RI → dossier refusé ou surprime injustifiée",
        "Traiter Solly et Zéphir comme des situations différentes alors que le porteur est le même",
      ]),
    ],
    faq: [
      {
        q: "Solly Azar et Zéphir sont-ils tous les deux concernés ?",
        a: "Si l’attestation indique Wakam comme porteur, oui pour le non-renouvellement. Vérifiez toujours le PDF, pas seulement le nom commercial.",
      },
      {
        q: "Mon contrat est-il annulé immédiatement ?",
        a: "Non. Les contrats en cours restent valides jusqu’à l’échéance. Anticipez le remplacement avant cette date.",
      },
      {
        q: "Qui demande le relevé d’information ?",
        a: "Vous, par écrit, à l’intermédiaire qui gère le contrat (grossiste ou courtier). Conservez la preuve d’envoi.",
      },
      {
        q: "Leads Opportunities travaille-t-il ces dossiers ?",
        a: "Oui : bascule hors Wakam avec attestation compatible Uber/Bolt/Heetch, via devis ou questionnaire VTC.",
      },
      {
        q: "Puis-je rester chez le même courtier commercial ?",
        a: "Parfois via co-courtage / autre porteur. L’important est la capacité hors Wakam et la continuité d’attestation.",
      },
    ],
  },

  "wakam-vtc-opportunite-courtiers-portefeuille.html": {
    keywords: [
      "Wakam courtiers VTC",
      "co-courtage VTC MFA",
      "portefeuille Wakam échéances",
      "grossiste assurance VTC",
      "opportunité leads VTC 2026",
      "KT Courtage FlexiFleet",
      "Assurmax Integra VTC",
      "CRM J-30 VTC",
      "partenariat Leads Opportunities VTC",
      "commission co-courtage",
      "ORIAS bascule Wakam",
      "flux chauffeurs Meta VTC",
      "playbook courtier VTC",
      "RI portefeuille Wakam",
      "zéro trou Uber clients",
    ],
    extraBlocks: [
      h2("La pub Meta chauffe — votre CRM doit suivre"),
      p(
        "Pendant que les chauffeurs voient des pubs « Wakam / Yeet / Solly », vos clients Wakam scrollent aussi. Si vous n’avez pas de <strong>capacité hors Wakam</strong> et un tri d’échéances, un concurrent (ou un flux tipo Leads Opportunities) prendra le renouvellement. La fenêtre n’est pas « un jour » : c’est <strong>chaque anniversaire de contrat</strong> jusqu’à fin de mesure."
      ),
      h3("Capacité avant discours"),
      p(
        "Codes AXA / MAAF VTC directs ? Rare pour un cabinet indépendant. Voie réaliste : <strong>co‑courtage</strong> (ex. accords type MFA / KT Courtage) ou <strong>grossistes</strong> encore ouverts (FlexiFleet, Assurmax, Integra, April / NetVox / Zéphir selon vos accès). Signez la convention avant d’appeler le premier client."
      ),
      bridge,
      h2("Sprint CRM 1 après‑midi"),
      ul([
        "Filtrer VTC + Wakam / Yeet / +Simple / Solly / Zéphir",
        "Colonnes : échéance | RI | devis | placé",
        "Priorité J‑30 puis J‑60",
        "SMS type : « Votre porteur est gelé au renouvellement — on sécurise l’attestation Uber/Bolt sans trou »",
        "Objectif semaine 1 : 100 % des J‑30 contactés + RI demandés",
      ]),
      h2("Playbook J‑45 → J‑0"),
      ul([
        "J‑45 : appel + RI",
        "J‑30 : 1–2 devis hors Wakam",
        "J‑15 : closing + pièces",
        "J‑3 : attestation prête",
        "J‑0 : bascule horaire + tag CRM « hors Wakam »",
      ]),
      h2("Partenariat flux avec Leads Opportunities"),
      p(
        "On capte déjà la demande chauffeurs (landings + Meta blog convert). Courtiers : envoyez volume estimé Wakam + codes grossistes ouverts à <a href=\"mailto:contact@leadsopportunities.fr?subject=Partenariat%20Wakam%20VTC%20pub\"><strong>contact@leadsopportunities.fr</strong></a> — co‑placement selon convention."
      ),
      h2("KPI qui comptent (pas le vanity)"),
      ul([
        "Contrats Wakam identifiés",
        "% RI &lt; 7 jours",
        "≥ 2 devis hors Wakam par dossier chaud",
        "0 interruption J‑0",
        "Cross‑sell mutuelle / auto perso après placement",
      ]),
    ],
    faq: [
      {
        q: "Sans code AXA/MAAF, puis-je placer ?",
        a: "Oui via co-courtage ou grossistes hors Wakam. Convention + process attestation avant l’échéance.",
      },
      {
        q: "Comment prioriser ?",
        a: "Échéance croissante, puis complexité (résiliés, IDF, flottes).",
      },
      {
        q: "Le client doit-il résilier chez Wakam ?",
        a: "Non. Prise d’effet du nouveau contrat à l’échéance.",
      },
      {
        q: "Que répondre à un client paniqué par une pub concurrente ?",
        a: "Contrats en cours valides ; action = RI + devis hors Wakam ; vous pilotez la bascule.",
      },
      {
        q: "LO prend-il des dossiers chauffeurs ?",
        a: "Oui en direct via parcours VTC ; partenaires courtiers selon convention de flux.",
      },
    ],
  },
};

var articles = [
  {
    file: "wakam-acpr-assurance-vtc-bascule-2026.html",
    section: "vtc",
    tag: "Wakam / ACPR",
    tagClass: "tag-vtc",
    themes: ["wakam", "acpr", "vtc", "bascule", "pub"],
    title: "Wakam VTC (ACPR) : combien de courses vous coûte un trou d’attestation ?",
    description:
      "Gel ACPR Wakam du 25/09/2026 : vérifiez Yeet / +Simple / Solly / Zéphir, récupérez le RI, basculez hors Wakam sans couper Uber ou Bolt. Devis courtier ORIAS.",
    meta: "11 min · Octobre 2026",
    cardExcerpt: "Gel Wakam : plan anti trou Uber/Bolt avant l’échéance.",
    keywords: deep["wakam-acpr-assurance-vtc-bascule-2026.html"].keywords,
    cta: { href: "../landings/vtc.html?utm_content=wakam-pub", label: "Devis VTC hors Wakam" },
    blocks: [
      {
        type: "p",
        text:
          "Votre attestation mentionne <strong>Wakam</strong> — derrière <strong>Yeet</strong>, <strong>+Simple</strong>, Solly, Zéphir ou un cabinet local ? Depuis le <strong>25 septembre 2026</strong>, plus de renouvellement chez ce porteur. Ce n’est pas une radiation du jour au lendemain : c’est une <strong>course contre votre date d’anniversaire</strong>. Chaque jour sans attestation conforme = apps coupées. " +
          CTA_VTC +
          ".",
      },
      bridge,
      h2("En une phrase : ce qu’il faut faire cette semaine"),
      ul([
        "Confirmer Wakam sur l’attestation (pas le logo commercial)",
        "Noter l’échéance exacte",
        "Exiger le relevé d’information",
        "Lancer un devis hors Wakam avec un courtier ORIAS",
        "Aligner la prise d’effet à l’heure de fin de l’ancien contrat",
      ]),
      p(
        "Guides liés : <a href=\"./yeet-vtc-wakam-bascule-attestation-2026.html\">cas Yeet</a>, <a href=\"./solly-zephir-wakam-marque-blanche-vtc-2026.html\">Solly / Zéphir / marque blanche</a>, <a href=\"./assurance-vtc-uber-bolt-heetch.html\">exigences plateformes</a>."
      ),
    ],
    related: [
      { href: "./yeet-vtc-wakam-bascule-attestation-2026.html", label: "Yeet → bascule" },
      { href: "./solly-zephir-wakam-marque-blanche-vtc-2026.html", label: "Solly / Zéphir" },
      { href: "./wakam-vtc-opportunite-courtiers-portefeuille.html", label: "Playbook courtiers" },
      { href: "../landings/vtc.html", label: "Landing devis VTC" },
    ],
    faq: deep["wakam-acpr-assurance-vtc-bascule-2026.html"].faq,
  },
  {
    file: "yeet-vtc-wakam-bascule-attestation-2026.html",
    section: "vtc",
    tag: "Yeet",
    tagClass: "tag-vtc",
    themes: ["yeet", "wakam", "vtc", "pub"],
    title: "Yeet VTC & Wakam : le score ne sauve pas l’échéance — basculez proprement",
    description:
      "Contrat Yeet porté par Wakam : boîtier et remise comportementale ne prolongent pas le renouvellement. RI, devis hors Wakam, attestation Uber/Bolt à l’heure.",
    meta: "9 min · Octobre 2026",
    cardExcerpt: "Yeet + Wakam : sortir sans perdre les apps ni se faire piéger au tarif.",
    keywords: deep["yeet-vtc-wakam-bascule-attestation-2026.html"].keywords,
    cta: { href: "../landings/vtc.html?utm_content=yeet-wakam", label: "Remplacer Yeet" },
    blocks: [
      {
        type: "p",
        text:
          "Vous roulez avec <strong>Yeet</strong> (app, boîtier, score) ? Le porteur sur l’attestation est souvent <strong>Wakam</strong>. Gel ACPR = <strong>pas de renouvellement</strong> à l’anniversaire. Le score ne suit pas ailleurs : ce qui compte, c’est le <strong>RI</strong> et une attestation <strong>à titre onéreux + RC Pro</strong>. " +
          CTA_YEET +
          ".",
      },
      bridge,
      h2("Ce qu’on compare vraiment (pas la remise fantôme)"),
      ul([
        "Prix hors remise comportementale",
        "Franchise réelle au premier sinistre",
        "Mention plateformes sur l’attestation",
        "Assistance / immobilisation si vous en avez besoin",
      ]),
    ],
    related: [
      { href: "./wakam-acpr-assurance-vtc-bascule-2026.html", label: "Guide général Wakam" },
      { href: "./solly-zephir-wakam-marque-blanche-vtc-2026.html", label: "Autres marques blanches" },
      { href: "./assurance-vtc-moins-cher-2026.html", label: "Leviers de prime VTC" },
      { href: "../landings/vtc.html", label: "Devis VTC" },
    ],
    faq: deep["yeet-vtc-wakam-bascule-attestation-2026.html"].faq,
  },
  {
    file: "solly-zephir-wakam-marque-blanche-vtc-2026.html",
    section: "vtc",
    tag: "Marque blanche",
    tagClass: "tag-vtc",
    themes: ["solly", "zephir", "wakam", "vtc", "pub"],
    title: "Solly Azar, Zéphir & co : si Wakam est le porteur, même course contre l’échéance",
    description:
      "Marque blanche VTC (Solly, Zéphir, +Simple…) portée par Wakam : comment lire l’attestation, demander le RI, basculer hors porteur gelé sans trou Uber/Bolt.",
    meta: "8 min · Octobre 2026",
    cardExcerpt: "Solly / Zéphir / +Simple : même porteur Wakam → même plan de bascule.",
    keywords: deep["solly-zephir-wakam-marque-blanche-vtc-2026.html"].keywords,
    cta: { href: "../landings/vtc.html?utm_content=marque-blanche-wakam", label: "Devis hors Wakam" },
    blocks: [
      {
        type: "p",
        text:
          "Vous voyez <strong>Solly Azar</strong> ou <strong>Zéphir</strong> sur vos docs, mais l’assureur écrit <strong>Wakam</strong> ? Alors le gel ACPR du 25/09/2026 vous concerne au renouvellement — comme Yeet ou +Simple. Un seul réflexe : <strong>attestation + échéance + RI</strong>, puis devis hors Wakam. " +
          CTA_MB +
          ".",
      },
      bridge,
      h2("Pourquoi on regroupe ces marques (sans les confondre)"),
      p(
        "Commercialement, les offres diffèrent. Réglementairement, si le <strong>porteur</strong> est le même et qu’il ne peut plus renouveler, le plan chauffeur est identique : zéro jour de trou, attestation onéreuse, upload plateformes au J‑0. Voir aussi le <a href=\"./wakam-acpr-assurance-vtc-bascule-2026.html\">guide général Wakam</a>."
      ),
    ],
    related: [
      { href: "./wakam-acpr-assurance-vtc-bascule-2026.html", label: "Guide Wakam ACPR" },
      { href: "./yeet-vtc-wakam-bascule-attestation-2026.html", label: "Cas Yeet" },
      { href: "./comparatif-vtc-zephir-solly-azar.html", label: "Comparatif Zéphir / Solly" },
      { href: "../landings/vtc.html", label: "Landing VTC" },
    ],
    faq: deep["solly-zephir-wakam-marque-blanche-vtc-2026.html"].faq,
  },
  {
    file: "wakam-vtc-opportunite-courtiers-portefeuille.html",
    section: "vtc",
    tag: "Courtiers",
    tagClass: "tag-vtc",
    themes: ["wakam", "courtier", "co-courtage", "pub"],
    title: "Courtiers : la vague Wakam sur Meta — sauvez le portefeuille avant les pubs concurrentes",
    description:
      "Clients VTC Yeet / Solly / Zéphir / Wakam : cartographier les échéances, ouvrir co‑courtage, playbook zéro trou, partenariat flux avec Leads Opportunities.",
    meta: "10 min · Octobre 2026",
    cardExcerpt: "CRM + capacité hors Wakam pendant que Meta chauffe les chauffeurs.",
    keywords: deep["wakam-vtc-opportunite-courtiers-portefeuille.html"].keywords,
    cta: {
      href: "mailto:contact@leadsopportunities.fr?subject=Partenariat%20Wakam%20VTC%20pub",
      label: "Partenariat flux VTC",
    },
    blocks: [
      {
        type: "p",
        text:
          "Les chauffeurs voient déjà des pubs Wakam / Yeet / Solly. Vos clients aussi. Sans <strong>capacité hors Wakam</strong> et un tri d’échéances, vous perdez le renouvellement — et souvent le foyer. Playbook ORIAS + option flux avec <strong>Leads Opportunities</strong>. <a href=\"./wakam-acpr-assurance-vtc-bascule-2026.html\"><strong>Version chauffeur</strong></a> · <a href=\"mailto:contact@leadsopportunities.fr?subject=Partenariat%20Wakam%20VTC%20pub\"><strong>nous écrire</strong></a>.",
      },
      bridge,
      h2("Ordre de priorité (cette semaine)"),
      ul([
        "Isoler tous les VTC Wakam / marques blanches",
        "Trier J‑30 d’abord",
        "Bloquer une convention co‑courtage / grossiste sous 48 h",
        "Lancer les RI en masse",
        "Standardiser le script « zéro trou Uber/Bolt »",
      ]),
    ],
    related: [
      { href: "./wakam-acpr-assurance-vtc-bascule-2026.html", label: "Guide chauffeur" },
      { href: "./yeet-vtc-wakam-bascule-attestation-2026.html", label: "Angle Yeet" },
      { href: "./solly-zephir-wakam-marque-blanche-vtc-2026.html", label: "Solly / Zéphir" },
      { href: "../landings/vtc.html", label: "Parcours devis VTC" },
    ],
    faq: deep["wakam-vtc-opportunite-courtiers-portefeuille.html"].faq,
  },
];

module.exports = { articles: articles, deep: deep };
