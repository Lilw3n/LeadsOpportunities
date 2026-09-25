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
  };
});
