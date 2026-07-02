/**
 * JSON-LD Organization / courtier ORIAS — accueil et pages SEO.
 */
const { SITE_ORIGIN: SITE } = require("./site-url.cjs");

const ORG = {
  name: "Leads Opportunities",
  legalName: "Leads Opportunities — Wendy Buchet",
  url: SITE + "/",
  logo: SITE + "/og-default.svg",
  email: "contact@leadsopportunities.fr",
  siren: "810571513",
  orias: "15005935",
  address: {
    streetAddress: "15 & 17 rue Pierre Curie",
    postalCode: "54110",
    addressLocality: "Varangeville",
    addressCountry: "FR",
  },
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
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: ORG.email,
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
    sameAs: extra.sameAs || [],
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

module.exports = {
  ORG: ORG,
  organizationJsonLd: organizationJsonLd,
  providerBlock: providerBlock,
};
