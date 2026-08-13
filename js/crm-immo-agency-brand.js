/**
 * En-têtes agence pour formulaires immo — profils serveur + overrides navigateur.
 */
window.CrmImmoAgencyBrand = (function () {
  var SELECTED_KEY = "lo_immo_form_agency_v1";
  var LETTERHEAD_KEY = "lo_immo_agency_letterheads_v1";
  var serverAgencies = [];
  var profileCache = {};

  function loadOverrides() {
    try {
      return JSON.parse(localStorage.getItem(LETTERHEAD_KEY) || "{}") || {};
    } catch (e) {
      return {};
    }
  }

  function saveOverrides(map) {
    localStorage.setItem(LETTERHEAD_KEY, JSON.stringify(map || {}));
  }

  function setServerAgencies(list) {
    serverAgencies = Array.isArray(list) ? list.slice() : [];
  }

  function listFeeAgencies() {
    if (window.CrmAgencyFees && window.CrmAgencyFees.listAgencies) {
      return window.CrmAgencyFees.listAgencies();
    }
    return [];
  }

  function mergeProfile(base, override) {
    if (!override || typeof override !== "object") return base || {};
    var out = Object.assign({}, base || {}, override);
    if (override.addressText) {
      out.addressLines = String(override.addressText)
        .split("\n")
        .map(function (l) {
          return l.trim();
        })
        .filter(Boolean);
      out.addressLine = out.addressLines.join(" — ");
    }
    return out;
  }

  function cacheProfile(agencyId, profile) {
    if (agencyId && profile) profileCache[agencyId] = profile;
  }

  function getCachedProfile(agencyId) {
    return profileCache[agencyId] || null;
  }

  function fetchProfile(agencyId, token) {
    if (profileCache[agencyId]) return Promise.resolve(profileCache[agencyId]);
    return fetch("/api/crm/immo-document?profile=" + encodeURIComponent(agencyId), {
      headers: { Authorization: "Bearer " + token },
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (res && res.profile) cacheProfile(agencyId, res.profile);
        return res.profile || {};
      })
      .catch(function () {
        return {};
      });
  }

  function getLetterhead(agencyId) {
    var overrides = loadOverrides();
    var cached = profileCache[agencyId] || {};
    var server = serverAgencies.find(function (a) {
      return a.id === agencyId;
    });
    var feeAgency = listFeeAgencies().find(function (a) {
      return a.id === agencyId;
    });
    var base = Object.assign(
      {
        id: agencyId,
        displayName: (feeAgency && feeAgency.name) || (server && server.displayName) || agencyId,
        companyName: (feeAgency && feeAgency.name) || (server && server.displayName) || agencyId,
        networkName: (server && server.networkName) || "",
        logoMonogram: (server && server.logoMonogram) || "",
        accentColor: (server && server.accentColor) || "#1d4ed8",
        accentDark: "#1e3a8a",
      },
      cached
    );
    if (overrides[agencyId]) {
      return mergeProfile(base, overrides[agencyId]);
    }
    return base;
  }

  function saveLetterhead(agencyId, data) {
    var map = loadOverrides();
    map[agencyId] = Object.assign({}, map[agencyId] || {}, data || {}, { updatedAt: new Date().toISOString() });
    saveOverrides(map);
  }

  function getSelectedAgencyId() {
    return localStorage.getItem(SELECTED_KEY) || "";
  }

  function setSelectedAgencyId(id) {
    if (id) localStorage.setItem(SELECTED_KEY, id);
    else localStorage.removeItem(SELECTED_KEY);
  }

  function listAgencyOptions() {
    var fee = listFeeAgencies();
    var ids = {};
    var out = [];
    fee.forEach(function (a) {
      ids[a.id] = true;
      var server = serverAgencies.find(function (s) {
        return s.id === a.id;
      });
      out.push({
        id: a.id,
        label: a.name,
        accentColor: (server && server.accentColor) || "#1d4ed8",
        logoMonogram: (server && server.logoMonogram) || "",
      });
    });
    serverAgencies.forEach(function (s) {
      if (ids[s.id]) return;
      out.push({
        id: s.id,
        label: s.displayName || s.id,
        accentColor: s.accentColor || "#1d4ed8",
        logoMonogram: s.logoMonogram || "",
      });
    });
    return out;
  }

  function applyLetterheadToDocument(doc, agencyId) {
    if (!doc || !agencyId) return;
    var lh = getLetterhead(agencyId);
    var root = doc.documentElement;
    if (lh.accentColor) {
      root.style.setProperty("--immo-accent", lh.accentColor);
    }
    if (lh.accentDark) {
      root.style.setProperty("--immo-accent-dark", lh.accentDark);
    }

    function setText(sel, text) {
      if (!text) return;
      doc.querySelectorAll(sel).forEach(function (el) {
        el.textContent = text;
      });
    }

    setText(".immo-brand-text h1, .immo-cover-agency", lh.displayName || lh.companyName);
    setText(".immo-network, .immo-cover-network", lh.networkName);
    setText(".immo-agent, .immo-cover-agent", lh.agentName);
    setText(".immo-tag", lh.tagline);
    setText(".immo-logo, .immo-cover-logo", lh.logoMonogram);

    if (lh.addressLines && lh.addressLines.length) {
      var addrHtml = lh.addressLines.map(function (l) {
        return l.replace(/&/g, "&amp;").replace(/</g, "&lt;");
      }).join("<br/>");
      doc.querySelectorAll(".immo-meta-addr").forEach(function (el) {
        el.innerHTML = addrHtml;
      });
      setText(".immo-cover-foot", lh.addressLine || lh.addressLines.join(" — "));
    }

    if (lh.phone) {
      doc.querySelectorAll(".immo-meta-line").forEach(function (el) {
        if (el.textContent.indexOf("Tél") === 0) el.innerHTML = "<span>Tél.</span> " + lh.phone;
      });
    }
    if (lh.email) {
      doc.querySelectorAll('.immo-meta a[href^="mailto:"]').forEach(function (a) {
        a.href = "mailto:" + lh.email;
        a.textContent = lh.email;
      });
    }
    if (lh.footerLegal) {
      doc.querySelectorAll(".immo-footer span:first-child").forEach(function (el) {
        el.textContent = lh.footerLegal;
      });
    }
    if (lh.website) {
      doc.querySelectorAll(".immo-meta-line").forEach(function (el) {
        if (el.textContent.indexOf("Web") === 0) {
          el.innerHTML = "<span>Web</span> " + lh.website.replace(/^https?:\/\//, "");
        }
      });
    }
  }

  return {
    SELECTED_KEY: SELECTED_KEY,
    LETTERHEAD_KEY: LETTERHEAD_KEY,
    setServerAgencies: setServerAgencies,
    listAgencyOptions: listAgencyOptions,
    getLetterhead: getLetterhead,
    saveLetterhead: saveLetterhead,
    getSelectedAgencyId: getSelectedAgencyId,
    setSelectedAgencyId: setSelectedAgencyId,
    applyLetterheadToDocument: applyLetterheadToDocument,
    loadOverrides: loadOverrides,
    cacheProfile: cacheProfile,
    fetchProfile: fetchProfile,
    getCachedProfile: getCachedProfile,
  };
})();
