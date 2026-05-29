/**
 * Pages SEO longue traîne — silo assurance VTC
 */
function buildVtcLongtailPages(page) {
  const BASE = "/assurance-vtc/";
  const LANDING = "/landings/vtc.html";
  const LANDING_EXPRESS = "/landings/devis-rapide.html";

  function lt(data) {
    return page(
      Object.assign(
        {
          theme: "vtc",
          cta: { href: LANDING, label: data.ctaLabel || "Devis assurance VTC" },
          benefits: [
            { title: "Courtier ORIAS", text: "Conseil specialise chauffeurs VTC." },
            { title: "Partenaires connus", text: "Allianz, AXA, Zéphir, Solly Azar, 2M2A…" },
            { title: "Devis gratuit", text: "Comparatif sans engagement." },
          ],
          related: data.related || [
            { href: BASE, label: "Guide assurance VTC" },
            { href: BASE + "villes/", label: "VTC par ville" },
            { href: BASE + "tarif/", label: "Tarif VTC" },
            { href: LANDING_EXPRESS, label: "Devis express 30 sec" },
          ],
        },
        data
      )
    );
  }

  return [
    lt({
      file: "assurance-vtc/rc-pro/index.html",
      badge: "RC Pro",
      title: "RC Pro VTC | Responsabilite civile professionnelle",
      description:
        "RC Pro VTC obligatoire : dommages aux tiers, defense. Devis chauffeur, courtier ORIAS.",
      h1: "RC Pro VTC : la garantie incontournable",
      intro:
        "Sans RC professionnelle adaptee au transport de personnes, vous exposez votre activite et vos revenus. Nous verifions plafonds et exclusions avant toute recommandation.",
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurance VTC", url: BASE },
        { name: "RC Pro", url: BASE + "rc-pro/" },
      ],
      related: [
        { href: BASE + "creation-activite/", label: "Creer son activite VTC" },
        { href: "/blog/assurance-vtc-rc-pro-garanties.html", label: "Article RC Pro & garanties" },
      ],
    }),
    lt({
      file: "assurance-vtc/creation-activite/index.html",
      badge: "Creation",
      title: "Assurance VTC creation d activite | Nouveau chauffeur",
      description:
        "Assurer son VTC avant la premiere course : inscription, vehicule, RC Pro. Devis courtier.",
      h1: "Assurance VTC en creation d activite",
      intro:
        "Vous preparez votre carte VTC ou venez de l obtenir ? Anticiper l assurance des la reservation du vehicule evite les refus de prise en charge.",
      ctaLabel: "Devis VTC creation",
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurance VTC", url: BASE },
        { name: "Creation activite", url: BASE + "creation-activite/" },
      ],
      related: [{ href: "/blog/assurance-vtc-creation-chauffeur.html", label: "Guide nouveau chauffeur" }],
    }),
    lt({
      file: "assurance-vtc/uber-bolt/index.html",
      badge: "Plateformes",
      title: "Assurance VTC Uber, Bolt, Heetch | Devis",
      description:
        "Assurance VTC compatible Uber, Bolt, Heetch : RC Pro, vehicule, franchises. Courtier specialise.",
      h1: "Assurance VTC pour Uber, Bolt et Heetch",
      intro:
        "Les plateformes exigent une couverture conforme. Nous alignons votre contrat sur les exigences courantes et votre zone d exercice.",
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurance VTC", url: BASE },
        { name: "Uber & Bolt", url: BASE + "uber-bolt/" },
      ],
      related: [{ href: "/blog/assurance-vtc-uber-bolt-heetch.html", label: "Article plateformes VTC" }],
    }),
    lt({
      file: "assurance-vtc/resiliation/index.html",
      badge: "Resiliation",
      title: "Resiliation assurance VTC | Renouvellement & loi Hamon",
      description:
        "Resilier ou changer d assurance VTC : echeance, loi Hamon, comparatif. Courtier ORIAS.",
      h1: "Changer d assurance VTC au bon moment",
      intro:
        "Renouveler sans comparer peut vous couter des centaines d euros par an. Nous vous aidons a preparer la bascule sans interruption de garanties.",
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurance VTC", url: BASE },
        { name: "Resiliation", url: BASE + "resiliation/" },
      ],
      related: [{ href: "/blog/assurance-vtc-renouvellement-resiliation.html", label: "Article resiliation VTC" }],
    }),
    lt({
      file: "assurance-vtc/comparatif-assureurs/index.html",
      badge: "Comparatif",
      title: "Comparatif assureurs VTC 2026 | Zéphir, Solly Azar…",
      description:
        "Comparer les assureurs VTC : garanties, franchises, bonus. Devis gratuit courtier.",
      h1: "Comparatif assureurs VTC : au-dela des noms",
      intro:
        "Zéphir, Solly Azar, Allianz, AXA : les marques rassurent, mais ce sont les garanties qui protegent. Nous comparons a prestations equivalentes.",
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurance VTC", url: BASE },
        { name: "Comparatif", url: BASE + "comparatif-assureurs/" },
      ],
      related: [{ href: "/blog/comparatif-vtc-zephir-solly-azar.html", label: "Article comparatif assureurs" }],
    }),
    lt({
      file: "assurance-vtc/pas-cher/index.html",
      badge: "Budget",
      title: "Assurance VTC pas cher | Sans sacrifier la RC Pro",
      description:
        "Assurance VTC pas cher : franchises, garanties, pieges. Devis comparatif chauffeur.",
      h1: "Assurance VTC pas cher : les limites a connaitre",
      intro:
        "Le tarif le plus bas peut exclure l activite VTC ou laisser des franchises prohibitives. Nous filtrons les offres exploitables.",
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurance VTC", url: BASE },
        { name: "Pas cher", url: BASE + "pas-cher/" },
      ],
      related: [{ href: "/blog/assurance-vtc-moins-cher-2026.html", label: "7 leviers pour payer moins cher" }],
    }),
  ];
}

function getVtcLongtailSitemapEntries(base) {
  const today = new Date().toISOString().slice(0, 10);
  const paths = [
    "/assurance-vtc/rc-pro/",
    "/assurance-vtc/creation-activite/",
    "/assurance-vtc/uber-bolt/",
    "/assurance-vtc/resiliation/",
    "/assurance-vtc/comparatif-assureurs/",
    "/assurance-vtc/pas-cher/",
  ];
  return paths.map(function (p) {
    return { loc: base + p, lastmod: today, changefreq: "weekly", priority: "0.87" };
  });
}

module.exports = { buildVtcLongtailPages: buildVtcLongtailPages, getVtcLongtailSitemapEntries: getVtcLongtailSitemapEntries };
