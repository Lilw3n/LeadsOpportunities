const fs = require("fs");
const path = require("path");

let profilesCache = null;

function loadProfilesFile() {
  if (profilesCache) return profilesCache;
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "data", "immo-agency-profiles.json"), "utf8");
    profilesCache = JSON.parse(raw);
    return profilesCache;
  } catch (e) {
    profilesCache = { defaultAgencyId: "leads_opportunities", profiles: {} };
    return profilesCache;
  }
}

function loadImmoBrandBase() {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "config", "immo-brand.json"), "utf8");
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function listAgencyProfiles() {
  const file = loadProfilesFile();
  return Object.keys(file.profiles || {}).map(function (id) {
    const p = file.profiles[id];
    return {
      id: p.id || id,
      displayName: p.displayName || p.companyName || id,
      networkName: p.networkName || "",
      logoMonogram: p.logoMonogram || "",
      accentColor: p.accentColor || "#1d4ed8",
    };
  });
}

function resolveAgencyBrand(agencyId) {
  const base = loadImmoBrandBase();
  const file = loadProfilesFile();
  const id = agencyId || file.defaultAgencyId || "leads_opportunities";
  const profile = (file.profiles && file.profiles[id]) || (file.profiles && file.profiles.leads_opportunities) || {};

  const addressLines = profile.addressLines || (profile.addressLine ? [profile.addressLine] : base.addressLine ? [base.addressLine] : []);

  return Object.assign({}, base, profile, {
    agencyId: profile.id || id,
    companyName: profile.displayName || profile.companyName || base.companyName || "Agence immobilière",
    addressLine: addressLines.join(" — ") || base.addressLine || "",
    addressLines: addressLines,
    agentName: profile.agentName || base.agentName || "",
    tagline: profile.tagline || base.tagline || "",
    email: profile.email || base.email || "",
    phone: profile.phone || base.phone || "",
    website: profile.website || base.website || "",
    orias: profile.orias || base.orias || "",
    cartePro: profile.cartePro || base.cartePro || "",
    carteProCCI: profile.carteProCCI || base.carteProCCI || "",
    garantieFinanciere: profile.garantieFinanciere || base.garantieFinanciere || "",
    rcpInsurer: profile.rcpInsurer || base.rcpInsurer || "",
    mediateur: profile.mediateur || base.mediateur || "",
    siret: profile.siret || base.siret || "",
    rcs: profile.rcs || base.rcs || "",
    logoMonogram: profile.logoMonogram || base.logoMonogram || "",
    accentColor: profile.accentColor || base.accentColor || "#1d4ed8",
    accentDark: profile.accentDark || base.accentDark || "#1e3a8a",
    honorairesDefault: profile.honorairesDefault || base.honorairesDefault || "",
    mediationClause: profile.mediationClause || base.mediationClause || "",
    footerLegal: profile.footerLegal || base.footerLegal || "",
    networkName: profile.networkName || "",
  });
}

module.exports = {
  loadProfilesFile,
  listAgencyProfiles,
  resolveAgencyBrand,
  loadImmoBrandBase,
};
