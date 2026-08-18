/**
 * JSON-LD Organization / courtier ORIAS — accueil et pages SEO.
 */
const { SITE_ORIGIN: SITE } = require("./site-url.cjs");

const ORG = {
  name: "Leads Opportunities",
  legalName: "Leads Opportunities — Wendy Buchet",
  founder: "Wendy Buchet",
  url: SITE + "/",
  localUrl: SITE + "/agence-varangeville/",
  logo: SITE + "/og-default.svg",
  email: "contact@leadsopportunities.fr",
  telephone: "+33695820866",
  telephoneDisplay: "06 95 82 08 66",
  siren: "810571513",
  orias: "15005935",
  address: {
    streetAddress: "15 rue Pierre Curie",
    postalCode: "54110",
    addressLocality: "Varangeville",
    addressRegion: "Meurthe-et-Moselle",
    addressCountry: "FR",
  },
  geo: {
    latitude: 48.6344,
    longitude: 6.3156,
  },
  openingHours: "Mo-Fr 09:00-18:00",
  openingHoursDisplay: "Lun–Ven 9h–18h",
};

const KNOWS_ABOUT = [
  "Assurance VTC",
  "Mutuelle santé",
  "Crédit immobilier",
  "Rachat de crédits",
  "Crédit consommation",
  "Prêt relais",
  "Crédit professionnel",
  "Renégociation de prêt",
  "Assurance habitation",
  "Assurance emprunteur",
];

const OFFER_CATALOG = [
  { name: "Crédit immobilier", url: "/credit-immo/" },
  { name: "Rachat de crédits", url: "/rachat-credit/" },
  { name: "Crédit consommation", url: "/credit-conso/" },
  { name: "Prêt relais", url: "/pret-relais/" },
  { name: "Crédit professionnel", url: "/credit-pro/" },
  { name: "Renégociation de prêt", url: "/renegociation-pret/" },
  { name: "Assurance VTC", url: "/assurance-vtc/" },
  { name: "Mutuelle santé", url: "/assurance-sante/" },
  { name: "Assurance habitation", url: "/assurance-habitation/" },
  { name: "Recherche de bien immobilier", url: "/recherche-bien/" },
];

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
    telephone: ORG.telephone,
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
      addressRegion: ORG.address.addressRegion,
      addressCountry: ORG.address.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: ORG.geo.latitude,
      longitude: ORG.geo.longitude,
    },
    areaServed: [
      { "@type": "Country", name: "France" },
      { "@type": "AdministrativeArea", name: "Meurthe-et-Moselle" },
      { "@type": "City", name: "Varangéville" },
      { "@type": "City", name: "Nancy" },
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: ORG.telephone,
      email: ORG.email,
      areaServed: "FR",
      availableLanguage: ["French"],
      hoursAvailable: ORG.openingHours,
      url: ORG.localUrl,
    },
    knowsAbout: KNOWS_ABOUT,
    sameAs: extra.sameAs || [],
  };
}

function localBusinessJsonLd() {
  var org = organizationJsonLd();
  return {
    "@context": "https://schema.org",
    "@type": ["InsuranceAgency", "FinancialService", "LocalBusiness"],
    "@id": ORG.localUrl + "#local",
    name: ORG.name,
    alternateName: ["Wendy Buchet", "Leads Opportunities — Wendy Buchet"],
    legalName: ORG.legalName,
    founder: { "@type": "Person", name: ORG.founder },
    description:
      "Courtier ORIAS à Varangéville (54) : assurances, crédit immobilier, rachat de crédits, crédit conso, prêt relais. Devis gratuit, rappel sous 15 min.",
    url: ORG.localUrl,
    image: ORG.logo,
    logo: ORG.logo,
    email: ORG.email,
    telephone: ORG.telephone,
    taxID: ORG.siren,
    identifier: org.identifier,
    address: org.address,
    geo: org.geo,
    hasMap: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("15 rue Pierre Curie 54110 Varangéville"),
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    priceRange: "Devis gratuit",
    currenciesAccepted: "EUR",
    paymentAccepted: "Gratuit — étude sans engagement",
    areaServed: org.areaServed,
    knowsAbout: KNOWS_ABOUT,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Courtage assurance et financement",
      itemListElement: OFFER_CATALOG.map(function (s) {
        return {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: s.name,
            url: SITE + s.url,
            provider: { "@type": "InsuranceAgency", name: ORG.name },
            areaServed: "FR",
          },
        };
      }),
    },
    contactPoint: org.contactPoint,
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
  KNOWS_ABOUT: KNOWS_ABOUT,
  OFFER_CATALOG: OFFER_CATALOG,
  organizationJsonLd: organizationJsonLd,
  localBusinessJsonLd: localBusinessJsonLd,
  providerBlock: providerBlock,
};
