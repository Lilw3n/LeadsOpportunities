/**
 * Annonces externes liées à des mandats hors établissement (URL + type + validité).
 * Partagé navigateur / Node (API submit, verify).
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(require("./immo-listing-portals-lib.js"));
  } else {
    root.ImmoExternalListings = factory(root.ImmoListingPortals);
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function (Portals) {
  var MANDATE_TYPES = [
    { id: "", label: "— Type —" },
    { id: "simple", label: "Simple" },
    { id: "exclusif", label: "Exclusif" },
    { id: "semi_exclusif", label: "Semi-exclusif" },
    { id: "hors_agence", label: "Hors agence (concurrent)" },
  ];

  function str(v, max) {
    return String(v == null ? "" : v)
      .trim()
      .slice(0, max || 400);
  }

  function bool(v) {
    return v === true || v === 1 || v === "1" || v === "true" || v === "on";
  }

  function mandateLabel(id) {
    var hit = MANDATE_TYPES.find(function (m) {
      return m.id === id;
    });
    return hit ? hit.label : id || "";
  }

  function detectUrl(url) {
    if (!Portals || !Portals.detectFromUrl) {
      return { ok: !!url, portal: "autre", url: url, label: "Autre", listingId: "", host: "" };
    }
    var d = Portals.detectFromUrl(url);
    if (d && d.ok) return d;
    return { ok: !!url, portal: "autre", url: url, label: "Autre", listingId: "", host: "" };
  }

  function normalizeItem(raw) {
    if (!raw || typeof raw !== "object") return null;
    var url = str(raw.url || raw.listing_url || raw.listingUrl, 800);
    if (!url) return null;
    var det = detectUrl(url);
    return {
      url: det.url || url,
      portal: str(raw.portal || det.portal, 40) || "autre",
      label: str(raw.label || det.label, 80) || "Autre",
      listingId: str(raw.listingId || det.listingId, 80),
      mandateType: str(raw.mandateType || raw.mandate_type || raw.forme_mandat, 40).toLowerCase(),
      validFrom: str(raw.validFrom || raw.valid_from || raw.date_debut, 20),
      validTo: str(raw.validTo || raw.valid_to || raw.date_fin || raw.date_echeance, 20),
      approximateDates: bool(raw.approximateDates || raw.approximate_dates || raw.dates_approximatives),
      horsEtablissement: raw.horsEtablissement != null ? bool(raw.horsEtablissement) : bool(raw.hors_etablissement != null ? raw.hors_etablissement : raw.mandat_hors_etablissement != null ? raw.mandat_hors_etablissement : true),
      notes: str(raw.notes || raw.agency || raw.agence, 200),
    };
  }

  function normalizeList(input) {
    var list = [];
    if (Array.isArray(input)) list = input;
    else if (input && typeof input === "object") list = [input];
    else return [];
    var out = [];
    var seen = Object.create(null);
    list.forEach(function (raw) {
      var item = normalizeItem(raw);
      if (!item) return;
      var key = item.url.toLowerCase();
      if (seen[key]) return;
      seen[key] = true;
      out.push(item);
    });
    return out.slice(0, 12);
  }

  function fromLegacyUrls(urls) {
    var arr = [];
    if (Array.isArray(urls)) arr = urls;
    else if (typeof urls === "string") {
      arr = urls
        .split(/[\n,;]+/)
        .map(function (s) {
          return s.trim();
        })
        .filter(Boolean);
    }
    return arr
      .map(function (url) {
        return normalizeItem({ url: url, horsEtablissement: true });
      })
      .filter(Boolean);
  }

  function mergeSources(body) {
    body = body || {};
    var fromStructured = normalizeList(body.externalListings || body.external_listings || body.listingMandates || body.listing_mandates);
    if (fromStructured.length) return fromStructured;
    if (Array.isArray(body.urls) && body.urls.length) return fromLegacyUrls(body.urls);
    if (body.listingUrl || body.listing_url) return fromLegacyUrls([body.listingUrl || body.listing_url]);
    if (body.listingUrls || body.listing_urls) return fromLegacyUrls(body.listingUrls || body.listing_urls);
    if (body.urlsText || body.urls_text) return fromLegacyUrls(body.urlsText || body.urls_text);
    return [];
  }

  function toUrlHits(list) {
    return (list || [])
      .map(function (item) {
        var det = detectUrl(item.url);
        return Object.assign({}, det, { ok: true });
      })
      .filter(function (d) {
        return d.url;
      });
  }

  function formatValidity(item) {
    if (!item) return "";
    var parts = [];
    if (item.validFrom) parts.push("dès " + item.validFrom + (item.approximateDates ? " (env.)" : ""));
    if (item.validTo) parts.push("jusqu'au " + item.validTo + (item.approximateDates ? " (env.)" : ""));
    return parts.join(" · ");
  }

  function summaryLine(item) {
    if (!item) return "";
    var bits = [item.label || item.portal, mandateLabel(item.mandateType), formatValidity(item)].filter(Boolean);
    return bits.join(" — ");
  }

  return {
    MANDATE_TYPES: MANDATE_TYPES,
    normalizeItem: normalizeItem,
    normalizeList: normalizeList,
    fromLegacyUrls: fromLegacyUrls,
    mergeSources: mergeSources,
    toUrlHits: toUrlHits,
    mandateLabel: mandateLabel,
    formatValidity: formatValidity,
    summaryLine: summaryLine,
    detectUrl: detectUrl,
  };
});
