/**
 * Pages SEO — assurance voiture sans permis (VSP / quadricycle léger)
 */
var LT = require("./seo-long-term-related.cjs");

function buildVspPages(page) {
  const BASE = "/assurance-voiture-sans-permis/";
  const LANDING = "/landings/vsp.html";
  return [
    page({
      file: "assurance-voiture-sans-permis/index.html",
      theme: "niche",
      badge: "Voiture sans permis",
      title: "Assurance voiture sans permis | VSP, permis AM, devis 2026",
      description:
        "Assurance voiture sans permis (VSP / quadricycle léger) : RC, vol, bris. Permis AM, BSR, ASSR. Devis gratuit, courtier ORIAS, France entière.",
      keywords:
        "assurance voiture sans permis, assurance vsp, assurance sans permis, devis vsp, quadricycle léger, permis AM, BSR",
      h1: "Assurance voiture sans permis : comparer RC et tous risques",
      intro:
        "Quadricycle léger, voiturette, permis AM (BSR) : les contrats auto classiques ne couvrent pas toujours une VSP. Nous comparons les offres spécialisées (AMI 3F, FMA/Wakam, Solly Azar) avec un conseiller ORIAS.",
      cta: { href: LANDING, label: "Devis voiture sans permis" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurances", url: "/assurances/" },
        { name: "Voiture sans permis", url: BASE },
      ],
      benefits: [
        { title: "Spécialistes VSP", text: "Produits quadricycle léger, pas une auto perso bricolée." },
        { title: "Permis AM / BSR", text: "On vérifie ASSR, âge et documents avant de proposer." },
        { title: "Rappel conseiller", text: "Devis en ligne, rappel en journée ouvrable." },
      ],
      steps: [
        { title: "Profil conducteur", text: "Âge, année de naissance (ASSR), BSR / permis AM." },
        { title: "Véhicule", text: "Marque (Aixam, Ligier, Microcar…), année, usage ville." },
        { title: "Comparatif", text: "RC, vol, bris, assistance — explications au téléphone." },
      ],
      sections: [
        {
          h2: "Pourquoi une assurance dédiée voiture sans permis ?",
          paragraphs: [
            "Une VSP (quadricycle léger L6e) n'est pas une citadine classique. La puissance, le PTAC et le permis AM changent le risque perçu par les assureurs. Un contrat auto « permis B » refuse souvent le risque ou le tarif mal.",
            "Dès 14 ans on peut conduire avec le permis AM ; les partenaires assurance souscrivent souvent à partir de 16 ans. Entre 14 et 15 ans, nous prenons le lead et rappelons à l'approche des 16 ans.",
          ],
          list: [
            "Responsabilité civile obligatoire pour circuler",
            "Vol, incendie, bris de glace selon formules",
            "Assistance et véhicule de remplacement (selon contrat)",
            "Jeunes conducteurs et usage urbain",
          ],
        },
        {
          h2: "Permis AM, BSR et ASSR",
          paragraphs: [
            "Né(e) avant 1988 : le BSR (permis AM) suffit en principe. Né(e) en 1988 ou après : ASSR scolaire + BSR / permis AM. Nous posons ces questions dans le questionnaire, pas dans les publicités Meta (copy discrète « citadine légère »).",
          ],
        },
        {
          h2: "Google et Meta : deux canaux, même dossier",
          paragraphs: [
            "Sur Google, vous cherchez « assurance voiture sans permis » : nos pages et campagnes Search le disent clairement. Sur Facebook / Instagram, l'annonce reste générique (citadine urbaine) ; la qualification VSP se fait dans le formulaire et le CRM.",
          ],
        },
      ],
      related: LT.mergeUnique(
        [
          { href: BASE + "permis-am/", label: "Permis AM / BSR" },
          { href: BASE + "quadricycle/", label: "Quadricycle léger" },
          { href: BASE + "tarif/", label: "Tarif assurance VSP" },
          { href: BASE + "villes/", label: "Par ville" },
          { href: LANDING, label: "Devis VSP" },
          { href: "/assurances-niches.html", label: "Hub niches" },
        ],
        LT.NICHES_VSP
      ),
      faq: [
        {
          q: "L'assurance voiture sans permis est-elle obligatoire ?",
          a: "Oui : au minimum la responsabilité civile pour circuler, comme pour tout véhicule terrestre à moteur. Les formules vol / bris sont optionnelles.",
        },
        {
          q: "Puis-je assurer une VSP dès 14 ans ?",
          a: "La conduite est possible dès 14 ans avec le permis AM. Les assureurs partenaires souscrivent souvent à partir de 16 ans : nous notons le dossier et rappelons à l'échéance.",
        },
        {
          q: "Faut-il un permis B ?",
          a: "Non. Le permis AM (ex-BSR) suffit pour un quadricycle léger, sous réserve ASSR selon l'année de naissance.",
        },
      ],
    }),
    page({
      file: "assurance-voiture-sans-permis/permis-am/index.html",
      theme: "niche",
      badge: "Permis AM",
      title: "Permis AM et BSR | Assurance voiture sans permis",
      description:
        "Permis AM (BSR) et ASSR pour conduire une voiture sans permis. Devis assurance VSP, courtier ORIAS.",
      keywords: "permis AM, BSR, ASSR, assurance sans permis, voiturette permis AM",
      h1: "Permis AM (BSR) : conduire et assurer une VSP",
      intro:
        "Le permis AM remplace le BSR. Selon votre année de naissance, l'ASSR scolaire s'ajoute. Nous vérifions ces pièces avant de comparer les contrats.",
      cta: { href: LANDING, label: "Devis permis AM / VSP" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Voiture sans permis", url: BASE },
        { name: "Permis AM", url: BASE + "permis-am/" },
      ],
      related: LT.mergeUnique(
        [
          { href: BASE, label: "Guide VSP" },
          { href: BASE + "quadricycle/", label: "Quadricycle" },
          { href: "/blog/permis-am-bsr-assr-voiture-sans-permis-2026.html", label: "Guide permis AM 2026" },
        ],
        LT.NICHES_VSP
      ),
      faq: [
        {
          q: "Quelle est la différence BSR / permis AM ?",
          a: "Le permis AM est le nom actuel du BSR. Même usage : conduire un cyclomoteur ou un quadricycle léger sans permis B.",
        },
      ],
    }),
    page({
      file: "assurance-voiture-sans-permis/quadricycle/index.html",
      theme: "niche",
      badge: "Quadricycle",
      title: "Assurance quadricycle léger | Aixam, Ligier, Microcar",
      description:
        "Assurance quadricycle léger (L6e) : Aixam, Ligier, Microcar, Chatenet. Devis VSP, courtier ORIAS.",
      keywords: "assurance quadricycle, aixam assurance, ligier assurance, microcar assurance, voiturette",
      h1: "Assurer un quadricycle léger (Aixam, Ligier, Microcar)",
      intro:
        "Marque, année, usage ville ou périurbain : le tarif VSP dépend du véhicule autant que du conducteur. Nous ciblons les produits encore commercialisés.",
      cta: { href: LANDING, label: "Devis quadricycle" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Voiture sans permis", url: BASE },
        { name: "Quadricycle", url: BASE + "quadricycle/" },
      ],
      related: LT.mergeUnique(
        [{ href: BASE + "tarif/", label: "Tarifs" }, { href: BASE, label: "Guide VSP" }],
        LT.NICHES_VSP
      ),
    }),
    page({
      file: "assurance-voiture-sans-permis/tarif/index.html",
      theme: "niche",
      badge: "Tarif",
      title: "Tarif assurance voiture sans permis | Prix VSP 2026",
      description:
        "Prix assurance voiture sans permis : fourchettes RC / tous risques, jeunes conducteurs. Devis personnalisé, courtier ORIAS.",
      keywords: "tarif assurance vsp, prix assurance voiture sans permis, assurance sans permis pas cher",
      h1: "Combien coûte une assurance voiture sans permis ?",
      intro:
        "Le prix dépend de l'âge, du bonus éventuel, de la ville et de la formule. Un devis en ligne puis un rappel : pas de tarif figé sur une publicité.",
      cta: { href: LANDING, label: "Estimer mon tarif VSP" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Voiture sans permis", url: BASE },
        { name: "Tarif", url: BASE + "tarif/" },
      ],
      related: LT.mergeUnique(
        [
          { href: BASE + "pas-cher/", label: "VSP pas cher" },
          { href: BASE + "jeunes-conducteurs/", label: "Jeunes conducteurs" },
        ],
        LT.NICHES_VSP
      ),
    }),
    page({
      file: "assurance-voiture-sans-permis/pas-cher/index.html",
      theme: "niche",
      badge: "Pas cher",
      title: "Assurance voiture sans permis pas cher | Devis VSP",
      description:
        "Assurance VSP pas cher : comparer RC minimale et options. Courtier ORIAS, sans engagement.",
      keywords: "assurance voiture sans permis pas cher, devis vsp pas cher, assurance voiturette pas cher",
      h1: "Assurance voiture sans permis pas cher : comparer vraiment",
      intro:
        "Le moins cher n'est pas toujours le plus adapté (franchises, exclusions jeunes). Nous alignons garanties et budget.",
      cta: { href: LANDING, label: "Comparer les offres VSP" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Voiture sans permis", url: BASE },
        { name: "Pas cher", url: BASE + "pas-cher/" },
      ],
      related: LT.mergeUnique([{ href: BASE + "tarif/", label: "Tarifs" }], LT.NICHES_VSP),
    }),
    page({
      file: "assurance-voiture-sans-permis/jeunes-conducteurs/index.html",
      theme: "niche",
      badge: "Jeunes",
      title: "Assurance VSP jeunes conducteurs | 16–25 ans",
      description:
        "Jeune conducteur voiture sans permis : 16–25 ans, permis AM, devis. Courtier ORIAS.",
      keywords: "assurance vsp jeune, voiture sans permis 16 ans, assurance voiturette jeune",
      h1: "Jeunes conducteurs : assurer sa première VSP",
      intro:
        "Première voiturette, permis AM récent, usage lycée / travail : le profil jeune pèse sur la prime. Nous expliquons les options encore ouvertes.",
      cta: { href: LANDING, label: "Devis jeune conducteur VSP" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Voiture sans permis", url: BASE },
        { name: "Jeunes conducteurs", url: BASE + "jeunes-conducteurs/" },
      ],
      related: LT.mergeUnique(
        [{ href: BASE + "permis-am/", label: "Permis AM" }, { href: BASE + "tarif/", label: "Tarifs" }],
        LT.NICHES_VSP
      ),
    }),
  ];
}

module.exports = { buildVspPages: buildVspPages };
