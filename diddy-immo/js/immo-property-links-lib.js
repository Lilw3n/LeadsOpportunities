/**
 * Multi-liens par bien (Leboncoin, SeLoger, site, Drive…).
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.ImmoPropertyLinks = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var PORTAL_PATTERNS = [
    { id: "leboncoin", re: /leboncoin\.fr/i, label: "Leboncoin" },
    { id: "seloger", re: /seloger\.com/i, label: "SeLoger" },
    { id: "logic-immo", re: /logic-immo\.com/i, label: "Logic-Immo" },
    { id: "orpi", re: /orpi\.com/i, label: "ORPI" },
    { id: "laforet", re: /laforet\.com/i, label: "Laforêt" },
    { id: "century21", re: /century21\.fr/i, label: "Century 21" },
    { id: "pap", re: /pap\.fr/i, label: "PAP" },
    { id: "bienici", re: /bien(?:%20|_|-)?ici|bienici\.com/i, label: "Bien'ici" },
    { id: "site", re: /leadsopportunities\.fr/i, label: "Site LO" },
  ];

  function detectPortal(url) {
    var u = String(url || "");
    for (var i = 0; i < PORTAL_PATTERNS.length; i++) {
      if (PORTAL_PATTERNS[i].re.test(u)) return PORTAL_PATTERNS[i];
    }
    return { id: "autre", label: "Autre" };
  }

  function normalizeUrl(url) {
    var u = String(url || "").trim();
    if (!u) return "";
    if (!/^https?:\/\//i.test(u)) u = "https://" + u;
    try {
      var parsed = new URL(u);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "";
      return parsed.toString();
    } catch (e) {
      return "";
    }
  }

  function normalizeList(input) {
    var arr = [];
    if (typeof input === "string") {
      try {
        var parsed = JSON.parse(input);
        arr = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        arr = String(input)
          .split(/[\n,;]+/)
          .map(function (s) {
            return s.trim();
          })
          .filter(Boolean)
          .map(function (url) {
            return { url: url };
          });
      }
    } else if (Array.isArray(input)) {
      arr = input;
    }
    var seen = {};
    var out = [];
    arr.forEach(function (item, idx) {
      var url = normalizeUrl(typeof item === "string" ? item : item && item.url);
      if (!url || seen[url]) return;
      seen[url] = true;
      var portal = detectPortal(url);
      out.push({
        id: (item && item.id) || null,
        url: url,
        portal: (item && item.portal) || portal.id,
        label: (item && item.label) || portal.label,
        is_primary: !!(item && item.is_primary) || out.length === 0,
        sort_order: item && item.sort_order != null ? item.sort_order : idx,
      });
    });
    return out.slice(0, 12);
  }

  function primaryUrl(list) {
    var links = normalizeList(list);
    var p = links.find(function (l) {
      return l.is_primary;
    });
    return (p || links[0] || {}).url || "";
  }

  function mergeLegacy(listingUrl, listingUrlsJson) {
    var list = normalizeList(listingUrlsJson);
    var legacy = normalizeUrl(listingUrl);
    if (legacy && !list.some(function (l) {
      return l.url === legacy;
    })) {
      list.unshift({
        url: legacy,
        portal: detectPortal(legacy).id,
        label: detectPortal(legacy).label,
        is_primary: true,
        sort_order: 0,
      });
    }
    return normalizeList(list);
  }

  return {
    PORTAL_PATTERNS: PORTAL_PATTERNS,
    detectPortal: detectPortal,
    normalizeUrl: normalizeUrl,
    normalizeList: normalizeList,
    primaryUrl: primaryUrl,
    mergeLegacy: mergeLegacy,
  };
});
