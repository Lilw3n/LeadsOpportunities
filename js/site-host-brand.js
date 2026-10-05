/**
 * Marque / origine publique selon le host
 * (LO · Buchet Immobilier · Assurance VTC France).
 */
(function (root) {
  function host() {
    try {
      return String(location.hostname || "").toLowerCase();
    } catch (e) {
      return "";
    }
  }

  function isBuchet() {
    return /buchetimmobilier/.test(host());
  }

  function isAssuranceVtcFrance() {
    return /assurancevtcfrance\.com$/.test(host()) || host() === "assurancevtcfrance.com";
  }

  function isLeadsOpportunities() {
    return /leadsopportunities/.test(host());
  }

  var brand = {
    isBuchet: isBuchet,
    isAssuranceVtcFrance: isAssuranceVtcFrance,
    isLeadsOpportunities: isLeadsOpportunities,
    label: function () {
      if (isBuchet()) return "Buchet Immobilier";
      if (isAssuranceVtcFrance()) return "Assurance VTC France";
      return "Leads Opportunities";
    },
    publicOrigin: function () {
      if (isBuchet()) return "https://www.buchetimmobilier.com";
      if (isAssuranceVtcFrance()) return "https://assurancevtcfrance.com";
      return "https://www.leadsopportunities.fr";
    },
    /** Sections blog prioritaires côté immobilier Buchet */
    immoSections: ["finance", "habitat", "actu", "patrimoine"],
    isImmoSection: function (section) {
      var s = String(section || "").toLowerCase();
      return (
        brand.immoSections.indexOf(s) !== -1 ||
        /immo|credit|pret|vendeur|acquereur|habitation|syndic|location/.test(s)
      );
    },
    absoluteUrl: function (path) {
      if (!path) return brand.publicOrigin();
      if (/^https?:\/\//i.test(path) || /^mailto:/i.test(path)) return path;
      return brand.publicOrigin() + (path.charAt(0) === "/" ? path : "/" + path);
    },
  };

  root.LoSiteBrand = brand;
})(typeof window !== "undefined" ? window : globalThis);
