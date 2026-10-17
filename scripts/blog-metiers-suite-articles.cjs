/**
 * Articles des métiers activés (flotte, TNS, plaisance, scolaire, etc.).
 * Chaque article reçoit une photo de la banque d'images du blog.
 */
var catalog = require("./metiers-suite-catalog.cjs");

function utm(file, campaign) {
  return "../landings/" + file + "?utm_source=blog&utm_medium=article&utm_campaign=" + encodeURIComponent(campaign);
}

function fromBlog(href) {
  if (href.indexOf("/landings/") === 0) return ".." + href;
  if (href.indexOf("/blog/") === 0) return "." + href.slice("/blog".length);
  if (href.indexOf("/") === 0) return ".." + href;
  return href;
}

function articleFrom(item) {
  var blocks = [
    { type: "p", text: item.intro },
    { type: "bridge" },
  ];
  item.sections.forEach(function (section) {
    blocks.push({ type: "h2", text: section.h2 });
    if (section.items) blocks.push({ type: "ul", items: section.items });
    if (section.p) blocks.push({ type: "p", text: section.p });
  });
  return {
    file: item.blog,
    section: item.blogSection,
    tag: item.tag,
    tagClass: "tag-pro",
    themes: item.themes,
    title: item.blogTitle,
    description: item.blogDescription,
    meta: "7 min · Octobre 2026",
    cardExcerpt: item.cardExcerpt,
    keywords: item.blogKeywords,
    cta: { href: utm(item.file, item.campaign), label: item.ctaLabel },
    blocks: blocks,
    faq: item.faq,
    related: [{ href: "../assurances-niches.html", label: "Assurances de niche" }]
      .concat(
        item.links.map(function (l) {
          return { href: fromBlog(l.href), label: l.label };
        })
      )
      .concat([{ href: "../landings/metiers-batiment.html", label: "Métiers du bâtiment" }]),
  };
}

var pillar = {
  file: "assurance-metiers-quel-contrat-choisir-2026.html",
  section: "pro",
  tag: "Métiers",
  tagClass: "tag-pro",
  themes: ["pro"],
  title: "Quel contrat selon le métier : RC, MRP, décennale, flotte",
  description:
    "Garage, bâtiment, transport, TNS, association, plaisance : un métier, un contrat. Carte des parcours Leads Opportunities.",
  meta: "8 min · Octobre 2026",
  cardExcerpt: "Chaque métier a son contrat. Cette carte envoie vers le bon questionnaire, sans tout mettre dans la RC Pro.",
  keywords: ["assurance métier", "rc pro ou décennale", "quel contrat artisan", "assurance selon activité"],
  cta: { href: "../assurances-niches.html", label: "Voir toutes les niches" },
  blocks: [
    {
      type: "p",
      text: "Le même mot « assurance pro » recouvre des contrats qui ne se remplacent pas. Cette carte envoie vers le parcours qui correspond à l’activité déclarée. <a href=\"../assurances-niches.html\"><strong>Ouvrir les niches</strong></a>.",
    },
    { type: "bridge" },
    { type: "h2", text: "Activité, murs, ouvrage, personnes" },
    {
      type: "ul",
      items: [
        "RC Pro : le dommage causé aux tiers par l’activité",
        "Multirisque : le local, le stock, le matériel",
        "Décennale : l’ouvrage du bâtiment",
        "Santé collective : les salariés",
        "Prévoyance TNS ou homme clé : la personne qui fait tourner l’entreprise",
        "Flotte : les véhicules, pas la marchandise",
      ],
    },
    { type: "h2", text: "Loisirs et biens nommés" },
    {
      type: "p",
      text: "Instrument, photo, bateau, caravane, moto de collection, piscine, forêt : le bien se décrit. L’habitation ou l’auto du quotidien ne les absorbe pas dès que la valeur ou l’usage sort du cadre. Le <a href=\"../landings/transport-voyageurs.html\">transport de voyageurs</a> et le <a href=\"../landings/transport-logistique.html\">transport de marchandises</a> restent les hubs déjà ouverts.",
    },
  ],
  faq: [
    {
      q: "Une seule RC Pro peut-elle tout couvrir ?",
      a: "Non. Elle suit l’activité déclarée. Les murs, l’ouvrage, les salariés, la flotte et les biens nommés se déclarent à part.",
    },
    {
      q: "Où commencer si je ne sais pas ?",
      a: "Par le métier le plus proche sur le hub niches, puis le questionnaire. Le courtier sépare les contrats ensuite.",
    },
  ],
  related: [
    { href: "../assurances-niches.html", label: "Assurances de niche" },
    { href: "../landings/rc-pro.html", label: "RC Pro" },
    { href: "../landings/metiers-batiment.html", label: "Bâtiment" },
    { href: "../landings/multirisque-professionnelle.html", label: "Multirisque" },
    { href: "../landings/flotte-vehicules.html", label: "Flotte" },
  ],
};

module.exports = catalog.map(articleFrom).concat([pillar]);
