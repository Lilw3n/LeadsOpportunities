/**
 * JSON-LD Organization / courtier ORIAS — accueil et pages SEO.
 * E-E-A-T (Google SEO starter + contenus people-first / YMYL).
 */
const { SITE_ORIGIN: SITE } = require("./site-url.cjs");
const { sameAsUrls } = require("./social-links-lib.cjs");

const ORG = {
  name: "Leads Opportunities",
  legalName: "Leads Opportunities — Wendy Buchet",
  url: SITE + "/",
  logo: SITE + "/og-default.svg",
  email: "contact@leadsopportunities.fr",
  phone: "+33651366222",
  siren: "810571513",
  orias: "15005935",
  address: {
    streetAddress: "15 & 17 rue Pierre Curie",
    postalCode: "54110",
    addressLocality: "Varangéville",
    addressCountry: "FR",
  },
};

/** Auteur / courtier — signal E-E-A-T pour thématiques YMYL (assurance, crédit). */
const AUTHOR = {
  "@type": "Person",
  name: "Wendy Buchet",
  jobTitle: "Courtier en assurance",
  email: ORG.email,
  telephone: ORG.phone,
  url: SITE + "/nancy-54/",
  worksFor: {
    "@type": "InsuranceAgency",
    name: ORG.name,
    url: ORG.url,
    identifier: ORG.orias,
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: ORG.address.addressLocality,
    postalCode: ORG.address.postalCode,
    addressCountry: "FR",
  },
  knowsAbout: [
    "Mutuelle santé",
    "Assurance VTC",
    "Crédit immobilier",
    "Assurance emprunteur",
    "Assurance habitation",
  ],
};

function organizationJsonLd(options) {
  var extra = options || {};
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "InsuranceAgency"],
    name: ORG.name,
    legalName: ORG.legalName,
    url: ORG.url,
    logo: ORG.logo,
    image: ORG.logo,
    email: ORG.email,
    telephone: ORG.phone,
    taxID: ORG.siren,
    identifier: {
      "@type": "PropertyValue",
      name: "ORIAS",
      value: ORG.orias,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: ORG.address.streetAddress,
      postalCode: ORG.address.postalCode,
      addressLocality: ORG.address.addressLocality,
      addressCountry: ORG.address.addressCountry,
    },
    areaServed: { "@type": "Country", name: "France" },
    founder: AUTHOR,
    employee: AUTHOR,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: ORG.email,
      telephone: ORG.phone,
      areaServed: "FR",
      availableLanguage: ["French"],
      hoursAvailable: "Mo-Fr 09:00-18:00",
      url: ORG.url + "#contact",
    },
    knowsAbout: [
      "Assurance VTC",
      "Mutuelle santé",
      "Crédit immobilier",
      "Assurance habitation",
      "Assurance emprunteur",
    ],
    sameAs: extra.sameAs || sameAsUrls(),
  };
}

function providerBlock() {
  return {
    "@type": "InsuranceAgency",
    name: ORG.name,
    url: ORG.url,
    identifier: ORG.orias,
  };
}

function authorPersonJsonLd() {
  return Object.assign({ "@context": "https://schema.org" }, AUTHOR);
}

function authorBlockHtml() {
  return (
    '<aside class="seo-author-box" itemscope itemtype="https://schema.org/Person">\n' +
    '  <p class="seo-author-kicker">Expertise · E-E-A-T</p>\n' +
    '  <p><strong itemprop="name">Wendy Buchet</strong> — <span itemprop="jobTitle">courtier en assurance</span> (ORIAS ' +
    ORG.orias +
    "), cabinet <span itemprop=\"worksFor\">Leads Opportunities</span> à Varangéville / Nancy Métropole.</p>\n" +
    "  <p>Réponse humaine, devis gratuit sans engagement · <a href=\"mailto:" +
    ORG.email +
    '">' +
    ORG.email +
    '</a> · <a href="tel:' +
    ORG.phone +
    '">06 51 36 62 22</a></p>\n' +
    "</aside>\n"
  );
}

function breadcrumbListJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: (items || []).map(function (it, i) {
      return {
        "@type": "ListItem",
        position: i + 1,
        name: it.name,
        item: it.item,
      };
    }),
  };
}

module.exports = {
  ORG: ORG,
  AUTHOR: AUTHOR,
  organizationJsonLd: organizationJsonLd,
  providerBlock: providerBlock,
  authorPersonJsonLd: authorPersonJsonLd,
  authorBlockHtml: authorBlockHtml,
  breadcrumbListJsonLd: breadcrumbListJsonLd,
};
