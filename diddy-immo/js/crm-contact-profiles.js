/**
 * Profils de fiche contact — sections affichees selon le type de devis / contrat.
 */
window.CrmContactProfiles = {
  PROFILES: {
    "mobilite-vtc": {
      label: "Taxi / VTC",
      sections: {
        eligibility: true,
        company: true,
        family: true,
        claims: true,
        vehicles: true,
        drivers: true,
        contracts: true,
        requests: true,
        leads: true,
        quoteDetails: false,
      },
      kpis: ["events", "claims", "vehicles", "contracts", "requests"],
    },
    mobilite: {
      label: "Mobilite (auto, moto, flotte)",
      sections: {
        eligibility: true,
        company: true,
        family: false,
        claims: true,
        vehicles: true,
        drivers: true,
        contracts: true,
        requests: true,
        leads: true,
        quoteDetails: false,
      },
      kpis: ["events", "claims", "vehicles", "contracts", "requests"],
    },
    sante: {
      label: "Sante et prevoyance",
      sections: {
        eligibility: false,
        company: false,
        family: true,
        claims: false,
        vehicles: false,
        drivers: false,
        contracts: true,
        requests: true,
        leads: true,
        quoteDetails: true,
      },
      kpis: ["events", "contracts", "requests"],
    },
    habitat: {
      label: "Habitation",
      sections: {
        eligibility: false,
        company: false,
        family: false,
        claims: false,
        vehicles: false,
        drivers: false,
        contracts: true,
        requests: true,
        leads: true,
        quoteDetails: true,
      },
      kpis: ["events", "contracts", "requests"],
    },
    finance: {
      label: "Financement / credit",
      sections: {
        eligibility: false,
        company: false,
        family: false,
        claims: false,
        vehicles: false,
        drivers: false,
        contracts: true,
        requests: true,
        leads: true,
        quoteDetails: true,
      },
      kpis: ["events", "contracts", "requests"],
    },
    pro: {
      label: "Assurance professionnelle",
      sections: {
        eligibility: false,
        company: true,
        family: false,
        claims: true,
        vehicles: false,
        drivers: false,
        contracts: true,
        requests: true,
        leads: true,
        quoteDetails: true,
      },
      kpis: ["events", "claims", "contracts", "requests"],
    },
    patrimoine: {
      label: "Patrimoine",
      sections: {
        eligibility: false,
        company: false,
        family: true,
        claims: false,
        vehicles: false,
        drivers: false,
        contracts: true,
        requests: true,
        leads: true,
        quoteDetails: true,
      },
      kpis: ["events", "contracts", "requests"],
    },
    generic: {
      label: "Assurance generale",
      sections: {
        eligibility: false,
        company: true,
        family: false,
        claims: false,
        vehicles: false,
        drivers: false,
        contracts: true,
        requests: true,
        leads: true,
        quoteDetails: true,
      },
      kpis: ["events", "contracts", "requests"],
    },
  },

  PROFILE_OPTIONS: [
    { key: "mobilite-vtc", label: "Taxi / VTC" },
    { key: "mobilite", label: "Mobilite (auto, moto…)" },
    { key: "sante", label: "Sante / prevoyance" },
    { key: "habitat", label: "Habitation" },
    { key: "finance", label: "Financement" },
    { key: "pro", label: "Professionnel" },
    { key: "patrimoine", label: "Patrimoine" },
    { key: "generic", label: "Autre / general" },
  ],

  normalizeVertical: function (v) {
    return String(v || "")
      .trim()
      .toLowerCase()
      .replace(/-/g, "_");
  },

  fromNeed: function (need) {
    if (!need) return null;
    var n = String(need).trim().toLowerCase();
    if (n === "vtc" || n === "taxi") return "mobilite-vtc";
    var cat = this.categoryFromNeed(n);
    if (cat) return this.categoryToProfileKey(cat, n);
    return null;
  },

  categoryFromNeed: function (need) {
    var catalog = window.SERVICE_CATALOG;
    if (!catalog || !catalog.getService) return null;
    var svc = catalog.getService(need);
    return svc ? svc.category : null;
  },

  categoryToProfileKey: function (category, need) {
    if (need === "vtc" || need === "taxi") return "mobilite-vtc";
    if (category === "mobilite") return "mobilite";
    if (category === "sante") return "sante";
    if (category === "habitat") return "habitat";
    if (category === "finance") return "finance";
    if (category === "pro") return "pro";
    if (category === "patrimoine") return "patrimoine";
    return "generic";
  },

  fromVertical: function (vertical) {
    var v = this.normalizeVertical(vertical);
    if (!v) return null;
    if (v === "vtc" || v === "taxi") return "mobilite-vtc";
    if (["auto", "moto", "flotte", "temporaire"].indexOf(v) !== -1) return "mobilite";
    if (["sante", "prevoyance", "tns", "deces", "collective"].indexOf(v) !== -1) return "sante";
    if (["habitation", "pno", "emprunteur", "mrh"].indexOf(v) !== -1) return "habitat";
    if (["credit_immo", "credit_immo", "rachat", "conso", "credit_pro", "renegociation"].indexOf(v) !== -1)
      return "finance";
    if (["rc_pro", "mrp", "decennale", "pj_pro", "dirigeant"].indexOf(v) !== -1) return "pro";
    if (["assurance_vie", "retraite", "gav", "pj", "famille", "autre"].indexOf(v) !== -1) return "patrimoine";
    return this.fromNeed(v);
  },

  resolve: function (ctx) {
    ctx = ctx || {};
    var meta = ctx.meta || {};
    if (meta.profileKey && this.PROFILES[meta.profileKey]) {
      return meta.profileKey;
    }
    if (meta.primaryNeed) {
      var fromNeed = this.fromNeed(meta.primaryNeed);
      if (fromNeed) return fromNeed;
    }
    if (meta.vertical) {
      var fromV = this.fromVertical(meta.vertical);
      if (fromV) return fromV;
    }
    var leads = ctx.leads || [];
    for (var i = 0; i < leads.length; i++) {
      var fk = this.fromVertical(leads[i].vertical);
      if (fk) return fk;
    }
    var vehicles = ctx.vehicles || [];
    var drivers = ctx.drivers || [];
    if (vehicles.length || drivers.length) {
      var vtc = vehicles.some(function (v) {
        var t = (v.vehicle_type || "").toLowerCase();
        return t.indexOf("vtc") !== -1 || t.indexOf("taxi") !== -1;
      });
      return vtc ? "mobilite-vtc" : "mobilite";
    }
    return "generic";
  },

  get: function (profileKey) {
    return this.PROFILES[profileKey] || this.PROFILES.generic;
  },

  applyLayout: function (profileKey) {
    var cfg = this.get(profileKey);
    var sections = cfg.sections;
    document.querySelectorAll("[data-crm-section]").forEach(function (el) {
      var key = el.getAttribute("data-crm-section");
      var show = sections[key] === true;
      if (key === "quotes" || key === "moduleLinks" || key === "events") show = true;
      el.classList.toggle("crm-section-hidden", !show);
    });
    var bar = document.getElementById("contactProfileBar");
    if (bar) {
      bar.innerHTML =
        '<span class="profile-badge">' +
        cfg.label +
        '</span><span class="profile-hint">Fiche adaptee au type de devis — modifiable dans « Modifier profil »</span>';
    }
    var eligTitle = document.querySelector(".eligibility-panel h2");
    if (eligTitle && profileKey === "mobilite-vtc") {
      eligTitle.textContent = "Eligibilite produits VTC (apercu)";
    }
    return cfg;
  },

  buildProfileFields: function (meta) {
    meta = meta || {};
    var opts = this.PROFILE_OPTIONS.map(function (o) {
      return (
        '<option value="' +
        o.key +
        '"' +
        (meta.profileKey === o.key ? " selected" : "") +
        ">" +
        o.label +
        "</option>"
      );
    }).join("");
    var needVal = meta.primaryNeed || "";
    return (
      '<label class="full">Type de fiche (devis / contrat)<select name="profileKey" required>' +
      opts +
      "</select></label>" +
      '<label>Produit / besoin (code)<input name="primaryNeed" value="' +
      String(needVal).replace(/"/g, "&quot;") +
      '" placeholder="vtc, sante, habitation…" /></label>' +
      '<p class="form-hint full">Les blocs VTC, vehicules et conducteurs ne s affichent que pour Taxi/VTC ou Mobilite.</p>'
    );
  },

  mergeProfileMeta: function (meta, fd) {
    meta = meta || {};
    var pk = fd.get("profileKey");
    var need = (fd.get("primaryNeed") || "").trim();
    if (pk) meta.profileKey = pk;
    if (need) {
      meta.primaryNeed = need;
      var catalog = window.SERVICE_CATALOG;
      if (catalog && catalog.getService(need)) {
        var svc = catalog.getService(need);
        meta.vertical = svc.vertical;
        meta.serviceLabel = svc.label;
      }
    }
    return meta;
  },
};
