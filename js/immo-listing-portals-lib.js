/**
 * Portails d'annonces immobilières (diffusion) + détection d'URL.
 * Pas de scraping : on identifie le support et on enregistre le lien collé.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.ImmoListingPortals = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var GROUPS = [
    { id: "payant", label: "Supports payants" },
    { id: "gratuit", label: "Supports gratuits" },
    { id: "agence", label: "Supports agences" },
    { id: "courant", label: "Portails courants" },
    { id: "manuel", label: "Saisie" },
  ];

  var PORTALS = [
    { id: "manual", label: "Saisie manuelle", group: "manuel", hosts: [] },
    { id: "acheter_louer", label: "Acheter-Louer.fr", group: "payant", hosts: ["acheter-louer.fr", "acheterlouer.fr"] },
    { id: "amanda_amepi", label: "Amanda (fichier AMEPI)", group: "payant", hosts: ["amepi.fr", "fichier-amepi.fr"] },
    { id: "bienici", label: "Bien'ici", group: "payant", hosts: ["bienici.com"] },
    { id: "cautioneo", label: "Cautioneo", group: "payant", hosts: ["cautioneo.com"] },
    { id: "cession_pme", label: "Cession PME", group: "payant", hosts: ["cessionpme.com", "cession-pme.com"] },
    { id: "domimmo", label: "DOMimmo (kelDOM)", group: "payant", hosts: ["keldom.fr", "domimmo.com"] },
    { id: "figaro_immo", label: "Figaro Immo", group: "payant", hosts: ["figaro-immo.com", "immobilier.lefigaro.fr"] },
    { id: "fnaim", label: "FNAIM / FNAIM Vacances", group: "payant", hosts: ["fnaim.fr", "fnaim-vacances.fr"] },
    { id: "green_acres", label: "Green-Acres (Immo de France)", group: "payant", hosts: ["green-acres.fr", "green-acres.com"] },
    { id: "immoregion", label: "ImmoRegion.fr — atHome", group: "payant", hosts: ["immoregion.fr", "athome.lu", "athome.be"] },
    { id: "leboncoin", label: "Leboncoin (en direct)", group: "payant", hosts: ["leboncoin.fr"] },
    { id: "leboncoin_ubiflow", label: "Leboncoin — Ubiflow", group: "payant", hosts: ["ubiflow.net", "ubiflow.fr"] },
    { id: "les_terrains", label: "Les-terrains.com", group: "payant", hosts: ["les-terrains.com"] },
    { id: "maisons_appartements", label: "Maisons & Appartements", group: "payant", hosts: ["maisons-et-appartements.fr"] },
    { id: "ouestfrance_immo", label: "Ouest-France Immo", group: "payant", hosts: ["ouestfrance-immo.com"] },
    { id: "paruvendu", label: "ParuVendu", group: "payant", hosts: ["paruvendu.fr"] },
    { id: "proprietes_figaro", label: "Propriétés Le Figaro", group: "payant", hosts: ["proprietes.lefigaro.fr"] },
    { id: "residences_immobilier", label: "Résidences Immobilier", group: "payant", hosts: ["residences-immobilier.fr"] },
    { id: "snpi", label: "SNPI", group: "payant", hosts: ["snpi.fr"] },
    { id: "studapart", label: "Studapart", group: "payant", hosts: ["studapart.com"] },
    { id: "etreproprio", label: "EtreProprio", group: "gratuit", hosts: ["etreproprio.com"] },
    { id: "immo_square", label: "IMMO SQUARE", group: "gratuit", hosts: ["immosquare.fr", "immo-square.fr"] },
    { id: "xml_libre", label: "Export XML libre", group: "agence", hosts: [] },
    { id: "seloger", label: "SeLoger", group: "courant", hosts: ["seloger.com", "selogerneuf.com"] },
    { id: "pap", label: "PAP", group: "courant", hosts: ["pap.fr"] },
    { id: "logic_immo", label: "Logic-Immo", group: "courant", hosts: ["logic-immo.com", "logicimmo.com"] },
    { id: "orpi", label: "ORPI / réseau", group: "courant", hosts: ["orpi.com"] },
    { id: "autre", label: "Autre portail", group: "manuel", hosts: [] },
  ];

  var LISTING_SOURCES = PORTALS.map(function (p) {
    return { id: p.id, label: p.label, group: p.group };
  });

  function hostOf(url) {
    try {
      var u = new URL(String(url || "").trim());
      return String(u.hostname || "")
        .replace(/^www\./i, "")
        .toLowerCase();
    } catch (e) {
      return "";
    }
  }

  function isHttpUrl(url) {
    try {
      var u = new URL(String(url || "").trim());
      return u.protocol === "http:" || u.protocol === "https:";
    } catch (e) {
      return false;
    }
  }

  function findPortalByHost(host) {
    if (!host) return null;
    var i;
    for (i = 0; i < PORTALS.length; i++) {
      var p = PORTALS[i];
      if (!p.hosts || !p.hosts.length) continue;
      var h;
      for (h = 0; h < p.hosts.length; h++) {
        var needle = p.hosts[h];
        if (host === needle || host.endsWith("." + needle)) return p;
      }
    }
    return null;
  }

  function parseListingId(url, portalId) {
    var s = String(url || "");
    var m;
    if (portalId === "leboncoin" || portalId === "leboncoin_ubiflow") {
      m = s.match(/\/ad\/[^/]+\/(\d+)/i) || s.match(/\/(\d{8,})(?:\?|$)/);
      return m ? m[1] : "";
    }
    if (portalId === "seloger") {
      m = s.match(/\/(\d{7,})(?:\.htm|\?|$)/i);
      return m ? m[1] : "";
    }
    if (portalId === "paruvendu") {
      m = s.match(/\/(\d{6,})(?:\.htm|\?|$)/i);
      return m ? m[1] : "";
    }
    if (portalId === "bienici") {
      m = s.match(/\/annonce\/([^/?#]+)/i);
      return m ? m[1] : "";
    }
    return "";
  }

  function detectFromUrl(url) {
    var raw = String(url || "").trim();
    if (!raw) return { ok: false, error: "empty" };
    if (!/^https?:\/\//i.test(raw)) raw = "https://" + raw;
    if (!isHttpUrl(raw)) return { ok: false, error: "invalid", url: raw };
    var host = hostOf(raw);
    var portal = findPortalByHost(host);
    var id = portal ? portal.id : "autre";
    return {
      ok: true,
      url: raw,
      host: host,
      portal: id,
      label: (portal && portal.label) || "Autre portail",
      group: (portal && portal.group) || "manuel",
      listingId: parseListingId(raw, id),
    };
  }

  function extractUrls(text) {
    var raw = String(text || "");
    var found = [];
    var re = /https?:\/\/[^\s<>"']+/gi;
    var m;
    while ((m = re.exec(raw))) {
      found.push(m[0].replace(/[).,;]+$/, ""));
    }
    raw.split(/[\s,;]+/).forEach(function (part) {
      var p = String(part || "").trim();
      if (!p || /^https?:\/\//i.test(p)) return;
      if (/\.[a-z]{2,}/i.test(p) && /leboncoin|seloger|paruvendu|bienici|pap\.fr|orpi/i.test(p)) {
        found.push(p);
      }
    });
    var seen = {};
    return found.filter(function (u) {
      var key = u.toLowerCase();
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function detectMany(textOrList) {
    var urls = Array.isArray(textOrList) ? textOrList : extractUrls(textOrList);
    return urls.map(detectFromUrl);
  }

  function groupedOptions() {
    return GROUPS.map(function (g) {
      return {
        id: g.id,
        label: g.label,
        items: PORTALS.filter(function (p) {
          return p.group === g.id;
        }),
      };
    }).filter(function (g) {
      return g.items.length;
    });
  }

  function labelFor(id) {
    var p = PORTALS.filter(function (x) {
      return x.id === id;
    })[0];
    return p ? p.label : id || "Autre";
  }

  function slugToCity(slug) {
    return String(slug || "")
      .replace(/[-_]+/g, " ")
      .replace(/\d{2,5}\s*eme\b/gi, "")
      .replace(/\d{5}/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/(^|\s)\S/g, function (c) {
        return c.toUpperCase();
      });
  }

  function typeFromPath(path) {
    var p = String(path || "").toLowerCase();
    if (/maison|house|villa/.test(p)) return "maison";
    if (/appartement|appart|studio/.test(p)) return "appartement";
    if (/terrain/.test(p)) return "terrain";
    if (/immeuble/.test(p)) return "immeuble";
    if (/parking|garage/.test(p)) return "parking";
    if (/local|commerce|bureau/.test(p)) return "local";
    return "";
  }

  function hintsFromUrl(url, portalId) {
    var hints = { property_type: "", city: "", postal_code: "", listingId: "" };
    var raw = String(url || "").trim();
    if (!raw) return hints;
    hints.listingId = parseListingId(raw, portalId);
    try {
      var u = new URL(/^https?:\/\//i.test(raw) ? raw : "https://" + raw);
      var path = decodeURIComponent(u.pathname || "");
      hints.property_type = typeFromPath(path);
      var postal = path.match(/(\d{5})/);
      if (postal) hints.postal_code = postal[1];
      var se = path.match(/\/annonces\/[^/]+\/[^/]+\/([^/]+)\//i);
      if (se) hints.city = slugToCity(se[1]);
      var pv = path.match(/\/immobilier\/[^/]+\/[^/]+\/([^/]+)/i);
      if (pv) {
        var m = pv[1].match(/^(.*)-(\d{5})$/);
        if (m) {
          hints.city = slugToCity(m[1]);
          hints.postal_code = hints.postal_code || m[2];
        } else {
          hints.city = slugToCity(pv[1]);
        }
      }
      var bi = path.match(/\/annonce\/(?:vente|location)\/([^/]+)/i);
      if (bi) hints.city = hints.city || slugToCity(bi[1]);
    } catch (e) {}
    return hints;
  }

  function faviconForHost(host) {
    var h = String(host || "").replace(/^www\./i, "");
    if (!h) return "";
    return "https://www.google.com/s2/favicons?domain=" + encodeURIComponent(h) + "&sz=64";
  }

  function isPublicPortalUrl(url) {
    var d = detectFromUrl(url);
    return !!(d.ok && d.portal && d.portal !== "autre" && d.portal !== "manual");
  }

  return {
    GROUPS: GROUPS,
    PORTALS: PORTALS,
    LISTING_SOURCES: LISTING_SOURCES,
    detectFromUrl: detectFromUrl,
    detectMany: detectMany,
    extractUrls: extractUrls,
    groupedOptions: groupedOptions,
    labelFor: labelFor,
    isHttpUrl: isHttpUrl,
    hintsFromUrl: hintsFromUrl,
    faviconForHost: faviconForHost,
    isPublicPortalUrl: isPublicPortalUrl,
    slugToCity: slugToCity,
  };
});
