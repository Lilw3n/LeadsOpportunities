/**
 * Sites partenaires — catalogue, aperçus, stockage local CRM.
 * API unique pour page publique + CRM.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.PartnerSites = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var STORAGE_KEY = "lo_partner_sites_v1";
  var DATA_URL = "./data/partner-sites.json";
  var API_URL = "/api/partner-sites";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function isHttpUrl(u) {
    try {
      var x = new URL(String(u || "").trim());
      return x.protocol === "http:" || x.protocol === "https:";
    } catch (e) {
      return false;
    }
  }

  function slugify(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60);
  }

  function normalizeSite(raw, i) {
    var s = raw || {};
    var url = String(s.url || "").trim();
    if (url && !/^https?:\/\//i.test(url)) url = "https://" + url;
    return {
      id: String(s.id || "site_" + (i + 1)).trim().slice(0, 80),
      category: String(s.category || "services").trim(),
      name: String(s.name || "Partenaire").trim().slice(0, 120),
      url: url,
      preview_image_url: String(s.preview_image_url || s.previewImageUrl || "").trim(),
      tagline: String(s.tagline || "").trim().slice(0, 180),
      city: String(s.city || "").trim().slice(0, 80),
      active: s.active !== false,
      order: Number(s.order) || 100 + i,
      notes: String(s.notes || "").trim().slice(0, 400),
    };
  }

  function normalizeCatalog(raw) {
    var data = raw && typeof raw === "object" ? raw : {};
    var categories = (Array.isArray(data.categories) ? data.categories : [])
      .map(function (c, i) {
        return {
          id: String(c.id || "cat_" + i).trim(),
          label: String(c.label || c.id || "Catégorie").trim(),
          order: Number(c.order) || (i + 1) * 10,
          icon: String(c.icon || "").trim(),
        };
      })
      .sort(function (a, b) {
        return a.order - b.order;
      });
    var sites = (Array.isArray(data.sites) ? data.sites : [])
      .map(normalizeSite)
      .filter(function (s) {
        return !!s.name;
      })
      .sort(function (a, b) {
        return a.order - b.order;
      });
    return {
      version: data.version || 1,
      updatedAt: data.updatedAt || "",
      title: String(data.title || "Sites partenaires"),
      lead: String(data.lead || ""),
      categories: categories,
      sites: sites,
    };
  }

  /** Photo manuelle > capture auto mshots > vide */
  function previewUrl(site, opts) {
    opts = opts || {};
    var s = site || {};
    var manual = String(s.preview_image_url || "").trim();
    if (manual && (isHttpUrl(manual) || manual.charAt(0) === "/")) return manual;
    if (opts.allowAuto === false) return "";
    if (s.url && isHttpUrl(s.url)) {
      return (
        "https://s.wordpress.com/mshots/v1/" +
        encodeURIComponent(s.url) +
        "?w=" +
        (opts.width || 900)
      );
    }
    return "";
  }

  function loadLocal() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return normalizeCatalog(JSON.parse(raw));
    } catch (e) {
      return null;
    }
  }

  function saveLocal(catalog) {
    var n = normalizeCatalog(catalog);
    n.updatedAt = new Date().toISOString().slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(n));
    return n;
  }

  function clearLocal() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function fetchJsonCatalog(url) {
    return fetch(url, { credentials: "same-origin", cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  }

  function catalogFromPayload(json) {
    if (json && json.catalog) return normalizeCatalog(json.catalog);
    return normalizeCatalog(json);
  }

  /**
   * Priorité :
   * - preferLocal (?preview=1 CRM) → localStorage
   * - API /api/partner-sites (catalogue publié Neon)
   * - dataUrl / data/partner-sites.json (seed)
   */
  function fetchCatalog(opts) {
    opts = opts || {};
    if (opts.preferLocal) {
      var local = loadLocal();
      if (local && local.sites && local.sites.length) return Promise.resolve(local);
    }

    var apiUrl = opts.apiUrl || API_URL;
    var fileUrl = opts.dataUrl || DATA_URL;

    function fromFile() {
      return fetchJsonCatalog(fileUrl)
        .then(catalogFromPayload)
        .catch(function () {
          return loadLocal() || normalizeCatalog({});
        });
    }

    if (opts.skipApi) return fromFile();

    return fetchJsonCatalog(apiUrl)
      .then(catalogFromPayload)
      .catch(fromFile);
  }

  function sitesByCategory(catalog, onlyActive) {
    var cat = normalizeCatalog(catalog);
    var map = {};
    cat.categories.forEach(function (c) {
      map[c.id] = { category: c, sites: [] };
    });
    cat.sites.forEach(function (s) {
      if (onlyActive && !s.active) return;
      if (!map[s.category]) {
        map[s.category] = {
          category: { id: s.category, label: s.category, order: 999, icon: "" },
          sites: [],
        };
      }
      map[s.category].sites.push(s);
    });
    return Object.keys(map)
      .map(function (k) {
        return map[k];
      })
      .filter(function (b) {
        return b.sites.length > 0;
      })
      .sort(function (a, b) {
        return (a.category.order || 0) - (b.category.order || 0);
      });
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    DATA_URL: DATA_URL,
    API_URL: API_URL,
    esc: esc,
    isHttpUrl: isHttpUrl,
    slugify: slugify,
    normalizeCatalog: normalizeCatalog,
    normalizeSite: normalizeSite,
    previewUrl: previewUrl,
    loadLocal: loadLocal,
    saveLocal: saveLocal,
    clearLocal: clearLocal,
    fetchCatalog: fetchCatalog,
    sitesByCategory: sitesByCategory,
  };
});
