const fs = require("fs");
const path = require("path");

let cachedRules = null;

function loadVspRules() {
  if (cachedRules) return cachedRules;
  const file = path.join(process.cwd(), "config", "private-offers", "vsp-partners.json");
  cachedRules = JSON.parse(fs.readFileSync(file, "utf8"));
  return cachedRules;
}

function parsePayload(rowOrPayload) {
  if (!rowOrPayload) return {};
  if (rowOrPayload.payload) {
    try {
      const p = typeof rowOrPayload.payload === "string" ? JSON.parse(rowOrPayload.payload) : rowOrPayload.payload;
      return Object.assign({}, p, rowOrPayload);
    } catch {
      return Object.assign({}, rowOrPayload);
    }
  }
  return Object.assign({}, rowOrPayload);
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function pick(payload, keys) {
  for (const key of keys) {
    if (payload[key] !== undefined && payload[key] !== null && String(payload[key]).trim() !== "") {
      return payload[key];
    }
  }
  return null;
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(String(value).replace(",", ".").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function toBool(value) {
  if (value === true || value === false) return value;
  const s = normalizeText(value);
  if (!s) return null;
  if (["1", "true", "oui", "yes", "y", "o"].indexOf(s) >= 0) return true;
  if (["0", "false", "non", "no", "n"].indexOf(s) >= 0) return false;
  return null;
}

function normalizeUsage(payload) {
  const raw = normalizeText(pick(payload, ["usage", "vehicleUsage", "vehicle_use", "use"]));
  if (/pro|affaire|profession|liberal/.test(raw)) return "professional";
  if (/trajet|commute|travail/.test(raw)) return "private_commute";
  if (/tournee|transport|taxi|vsl|ambulance|marchandise/.test(raw)) return "paid_transport";
  return raw || "private";
}

function normalizeIssue(payload) {
  const raw = normalizeText(
    pick(payload, ["licenseIssue", "permisIssue", "aggravation", "terminationReason", "resiliation", "situation"])
  );
  if (/alcool|alcoolem/.test(raw)) return "alcohol";
  if (/stup|drogue|drug/.test(raw)) return "drugs";
  if (/delit|fuite/.test(raw)) return "hit_and_run";
  if (/annul/.test(raw)) return "cancellation";
  if (/susp/.test(raw)) return "suspension";
  if (/non.?paiement|impaye|npp/.test(raw)) return "non_payment";
  if (/resil|fausse|sinistr/.test(raw)) return "any_termination";
  return raw || "none";
}

function inferPlatform(payload) {
  const combined = normalizeText(
    [
      payload.platform,
      payload.source,
      payload.utm_source,
      payload.utm_medium,
      payload.utm_campaign,
      payload.gclid ? "google" : "",
      payload.fbclid ? "facebook" : "",
      payload.ttclid ? "tiktok" : "",
      payload.msclkid ? "bing" : "",
    ].join(" ")
  );
  if (/withallo|allo/.test(combined)) return "withallo";
  if (/google|adwords|gclid/.test(combined)) return "google";
  if (/facebook|fb|meta/.test(combined)) return "facebook";
  if (/instagram|ig/.test(combined)) return "instagram";
  if (/tiktok|ttclid/.test(combined)) return "tiktok";
  if (/pinterest/.test(combined)) return "pinterest";
  if (/bing|microsoft/.test(combined)) return "bing";
  if (/seo|organic/.test(combined)) return "seo";
  return payload.platform || payload.source || "unknown";
}

function parseBirthYear(value) {
  const n = toNumber(value);
  if (n != null && n >= 1900 && n <= 2100) return Math.round(n);
  return null;
}

function parseBirthEra(payload) {
  const raw = normalizeText(
    pick(payload, ["vspBirthEra", "birthEra", "birth_era", "anneeNaissance", "birthYearCategory"])
  );
  if (/avant.?1988|1987|bsr.*suffit/.test(raw)) return { bornBefore1988: true, requiresAssr: false };
  if (/1988|apres|après|assr/.test(raw)) return { bornBefore1988: false, requiresAssr: true };
  const year = parseBirthYear(pick(payload, ["birthYear", "birth_year", "annee_naissance", "yearOfBirth"]));
  if (year != null) {
    return {
      birthYear: year,
      bornBefore1988: year < 1988,
      requiresAssr: year >= 1988,
    };
  }
  return { bornBefore1988: null, requiresAssr: null, birthYear: year };
}

function parseDriverAgeBand(payload, explicitAge) {
  if (explicitAge != null) return explicitAge;
  const raw = normalizeText(pick(payload, ["vspDriverAgeBand", "driverAgeBand", "age_band", "trancheAge"]));
  if (/14.?15|14-15/.test(raw)) return 15;
  if (/16.?17|16-17/.test(raw)) return 16;
  if (/18.?25|18-25/.test(raw)) return 21;
  if (/26.?40|26-40/.test(raw)) return 33;
  if (/plus.*40|40\+|41/.test(raw)) return 45;
  return null;
}

function parseBsrStatus(payload) {
  const raw = normalizeText(pick(payload, ["hasBsrOrAm", "has_bsr_am", "bsr", "permisAM", "permis_am"]));
  if (!raw) return null;
  if (/en cours|demande|formation/.test(raw)) return "pending";
  if (/^(oui|yes|1|true|obtenu)/.test(raw) || (/oui|obtenu/.test(raw) && !/non/.test(raw))) return true;
  if (/^(non|no|0|false)/.test(raw) || /^non/.test(raw)) return false;
  return toBool(raw);
}

function parseAssrStatus(payload) {
  const raw = normalizeText(pick(payload, ["hasAssr", "has_assr", "assr"]));
  if (!raw) return null;
  if (/pas concern|non concern|nc|n\/a/.test(raw)) return null;
  if (/^(oui|yes|1|true|obtenu)/.test(raw)) return true;
  if (/^(non|no|0|false)/.test(raw)) return false;
  return toBool(raw);
}

function licensingCutoffDate(rules) {
  const cutoff = (rules.commonSignals && rules.commonSignals.licensingCutoff) || "1988-01-01";
  return new Date(cutoff + "T00:00:00Z");
}

function bornAfterCutoff(lead, cutoffDate) {
  if (lead.bornBefore1988 === true) return false;
  if (lead.bornBefore1988 === false) return true;
  if (lead.birthYear != null) return lead.birthYear >= cutoffDate.getUTCFullYear();
  return null;
}

function normalizeLead(rowOrPayload) {
  const payload = parsePayload(rowOrPayload);
  const claims24 = toNumber(pick(payload, ["claims24Months", "sinistres24", "claims_24_months", "claims"]));
  const birth = parseBirthEra(payload);
  const explicitAge = toNumber(pick(payload, ["driverAge", "age", "ageConducteur", "conducteur_age"]));
  const age = parseDriverAgeBand(payload, explicitAge);
  const department = String(pick(payload, ["garageDepartment", "department", "departement", "postal_department"]) || "")
    .slice(0, 3)
    .replace(/\D/g, "");
  const bsrStatus = parseBsrStatus(payload);
  const assrStatus = parseAssrStatus(payload);
  const rules = loadVspRules();
  const driveLegalMin = (rules.commonSignals && rules.commonSignals.driveLegalAgeMin) || 14;
  const insuranceMin = (rules.commonSignals && rules.commonSignals.insuranceAgeMinDefault) || 16;

  return {
    id: payload.id || payload.leadId || payload.lead_id || null,
    vertical: normalizeText(payload.vertical || payload.product || payload.product_type || payload.need),
    platform: inferPlatform(payload),
    leadScore: toNumber(payload.lead_score || payload.leadScore) || 0,
    email: payload.email || payload.contact_email || null,
    phone: payload.phone || payload.contact_phone || null,
    driverAge: age,
    birthYear: birth.birthYear != null ? birth.birthYear : parseBirthYear(pick(payload, ["birthYear", "birth_year"])),
    bornBefore1988: birth.bornBefore1988,
    requiresAssr: birth.requiresAssr,
    hasAssr: assrStatus,
    driveLegalAgeMin: driveLegalMin,
    insuranceAgeMin: insuranceMin,
    underInsuranceAge: age != null && age >= driveLegalMin && age < insuranceMin,
    garageDepartment: department,
    garageArea: normalizeText(pick(payload, ["garageArea", "region", "zone"])),
    usage: normalizeUsage(payload),
    vehicleAgeYears: toNumber(pick(payload, ["vehicleAgeYears", "vehicle_age_years", "ageVehicule"])),
    vehicleValue: toNumber(pick(payload, ["vehicleValue", "vehicle_value", "valeurVehicule"])),
    registrationHolder: normalizeText(pick(payload, ["registrationHolder", "carteGrise", "carte_grise_holder"])),
    hasBsrOrAm: bsrStatus === "pending" ? null : bsrStatus,
    bsrStatus: bsrStatus === "pending" ? "pending" : bsrStatus === true ? "yes" : bsrStatus === false ? "no" : null,
    hasPermitB: toBool(pick(payload, ["hasPermitB", "permisB", "permitB"])),
    hasPermitBHistory: toBool(pick(payload, ["hasPermitBHistory", "permitBHistory", "experiencePermisB"])),
    licenseIssue: normalizeIssue(payload),
    terminationReason: normalizeIssue(payload),
    claims24Months: claims24,
    responsibleBodilyClaim: toNumber(pick(payload, ["responsibleBodilyClaim", "corporelResponsable"])) || 0,
    isFleet: toBool(pick(payload, ["isFleet", "fleet", "flotte"])) === true,
    paidTransport: normalizeUsage(payload) === "paid_transport" || toBool(pick(payload, ["paidTransport"])) === true,
    vehicleModified: toBool(pick(payload, ["vehicleModified", "modifiedVehicle"])) === true,
    hasFixedAddress: toBool(pick(payload, ["hasFixedAddress", "fixedAddress"])) !== false,
    isLegalEntity: toBool(pick(payload, ["isLegalEntity", "personneMorale"])) === true,
    currentMonthly: toNumber(pick(payload, ["currentMonthly", "current_insurer_price", "competitorMonthly"])),
    availability: payload.availability || payload.disponibilite || null,
    callSummary: payload.summary || payload.callSummary || payload.transcript || "",
    raw: payload,
  };
}

function checkExclusion(lead, rule) {
  const value = lead[rule.field];
  if (rule.values && rule.values.indexOf(String(value)) >= 0) return rule.reason;
  if (rule.equals !== undefined && value === rule.equals) return rule.reason;
  if (rule.gt !== undefined && Number(value || 0) > Number(rule.gt)) return rule.reason;
  return null;
}

function inferSollyProfile(lead) {
  const issue = lead.licenseIssue || lead.terminationReason;
  if (["alcohol", "drugs", "hit_and_run", "cancellation", "any_termination"].indexOf(issue) >= 0) return "aggravated";
  if (issue === "suspension") return "suspended";
  if (!lead.raw.insuranceExperienceMonths || Number(lead.raw.insuranceExperienceMonths) < 12) return "novice";
  return "good_driver";
}

function evaluatePartner(partner, lead, rules) {
  const reasons = [];
  const warnings = [];
  const rejects = [];
  let score = 50;
  const cutoffDate = licensingCutoffDate(rules || loadVspRules());
  const bornAfter1987 = bornAfterCutoff(lead, cutoffDate);

  const target = partner.target || {};
  if (lead.driverAge == null) {
    warnings.push("Age conducteur manquant");
    score -= 8;
  } else if (lead.driverAge < (lead.driveLegalAgeMin || 14)) {
    rejects.push("Age inferieur au minimum legal de conduite (" + (lead.driveLegalAgeMin || 14) + " ans)");
  } else if (lead.driverAge < target.ageMin) {
    if (lead.underInsuranceAge) {
      warnings.push(
        "Conduite legale des " +
          (lead.driveLegalAgeMin || 14) +
          " ans — assurance partenaire souvent des " +
          (lead.insuranceAgeMin || target.ageMin) +
          " ans : rappeler a l'approche des 16 ans"
      );
      score -= 6;
    } else {
      rejects.push("Age conducteur hors cible " + target.ageMin + "-" + target.ageMax + " ans");
    }
  } else if (lead.driverAge > target.ageMax) {
    rejects.push("Age conducteur hors cible " + target.ageMin + "-" + target.ageMax + " ans");
  } else {
    reasons.push("Age compatible");
    score += 10;
  }

  if (lead.requiresAssr === true && lead.hasAssr === false) {
    warnings.push("ASSR scolaire requise (ne en 1988 ou apres) — a confirmer avant devis");
    score -= 10;
  } else if (lead.requiresAssr === true && lead.hasAssr === true) {
    reasons.push("ASSR + BSR conformes au profil post-1988");
    score += 4;
  } else if (lead.bornBefore1988 === true) {
    reasons.push("Ne avant 1988 : BSR/AM suffit (pas d'ASSR obligatoire)");
    score += 3;
  }

  if (target.requiresBsrOrPermitWhenBornAfter && bornAfter1987 === true) {
    if (lead.hasBsrOrAm === false && !lead.hasPermitB) {
      rejects.push("BSR/AM ou permis requis pour les nes en 1988 ou apres (FMA)");
    } else if (lead.bsrStatus === "pending") {
      warnings.push("BSR/AM en cours — verifier avant emission");
      score -= 4;
    } else if (lead.hasBsrOrAm === true || lead.hasPermitB) {
      reasons.push("Titre de conduite compatible FMA");
      score += 6;
    }
  } else if (lead.hasBsrOrAm === false && !lead.hasPermitB && lead.driverAge != null && lead.driverAge >= 16) {
    warnings.push("BSR/AM ou permis B a confirmer");
    score -= 5;
  }

  if (target.vehicleAgeMaxYears && lead.vehicleAgeYears != null) {
    if (lead.vehicleAgeYears > target.vehicleAgeMaxYears) rejects.push("Vehicule trop ancien");
    else score += 8;
  }

  if (target.vehicleValueMaxEur && lead.vehicleValue != null) {
    if (lead.vehicleValue > target.vehicleValueMaxEur) rejects.push("Valeur vehicule trop elevee");
    else score += 5;
  }

  (partner.exclusions || []).forEach(function (rule) {
    const reason = checkExclusion(lead, rule);
    if (reason) rejects.push(reason);
  });

  if (lead.paidTransport) rejects.push("Usage transport remunere a traiter hors VSP standard");
  if (lead.isFleet) rejects.push("Flotte a traiter hors parcours VSP particulier");

  const allowedUsages = target.allowedUsages || [];
  if (allowedUsages.length) {
    const usage = lead.usage === "professional" && allowedUsages.indexOf("business") >= 0 ? "business" : lead.usage;
    if (allowedUsages.indexOf(usage) >= 0 || (usage === "professional" && allowedUsages.indexOf("professional_liberal") >= 0)) {
      score += 6;
      reasons.push("Usage compatible");
    } else if (usage && usage !== "private") {
      warnings.push("Usage a verifier pour cet acteur");
      score -= 4;
    }
  }

  if (lead.platform && (loadVspRules().commonSignals.highIntentSources || []).indexOf(lead.platform) >= 0) {
    score += 5;
    reasons.push("Canal d'acquisition prioritaire");
  }
  if (lead.leadScore >= 70) score += 8;

  if (partner.id === "fma_wakam_vsp" && ["suspension", "cancellation", "non_payment", "any_termination"].indexOf(lead.licenseIssue) >= 0) {
    score += 14;
    reasons.push("Profil aggrave accepte par FMA selon fiche");
  }

  if (partner.id === "solly_azar_vsp") {
    const profile = inferSollyProfile(lead);
    const profileRule = partner.profiles && partner.profiles[profile];
    reasons.push("Profil Solly estime: " + profile);
    if (profileRule) {
      if (lead.driverAge != null && (lead.driverAge < profileRule.ageMin || lead.driverAge > profileRule.ageMax)) {
        rejects.push("Age hors profil " + profile + " Solly Azar");
      }
      if (profileRule.requiresPermitBHistory && !lead.hasPermitB && !lead.hasPermitBHistory) {
        warnings.push("Historique permis B a confirmer pour profil aggrave");
        score -= 6;
      }
      if (lead.claims24Months != null && lead.claims24Months > profileRule.maxTotalClaims) {
        warnings.push("Sinistralite elevee: RC seule possiblement");
        score -= 10;
      }
    }
    if (lead.garageDepartment === "13") warnings.push("Departement 13: formule F1 uniquement");
    if (["suspension", "cancellation", "alcohol", "drugs", "hit_and_run"].indexOf(lead.licenseIssue) >= 0) score += 12;
  }

  if (partner.id === "ami3f_vsp" && lead.claims24Months != null && lead.claims24Months <= 8) {
    score += 8;
    reasons.push("Sinistralite dans les seuils larges indiques");
  }

  if (!lead.phone && !lead.email) {
    warnings.push("Coordonnees insuffisantes");
    score -= 12;
  }

  const status = rejects.length ? "rejected" : warnings.length ? "needs_review" : "eligible";
  if (status === "rejected") score = Math.min(score, 25);
  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    partnerId: partner.id,
    partnerName: partner.displayName || partner.name,
    status,
    score,
    reasons,
    warnings,
    rejects,
    documents: partner.documents || [],
    commercialNotes: partner.commercialNotes || "",
  };
}

function buildLeadInsights(lead, matches) {
  const best = matches[0] || null;
  const tags = [];
  if (lead.platform === "google") tags.push("intention_recherche");
  if (["facebook", "instagram"].indexOf(lead.platform) >= 0) tags.push("social_ads");
  if (lead.platform === "withallo") tags.push("appel_allo");
  if (lead.leadScore >= 70) tags.push("lead_chaud");
  if (best && best.status !== "rejected" && best.score >= 70) tags.push("nouveau_interessant_pp");
  if (lead.licenseIssue && lead.licenseIssue !== "none") tags.push("profil_aggrave");
  if (lead.underInsuranceAge) tags.push("conduite_14_15_rappel_16");
  if (lead.bornBefore1988 === true) tags.push("bsr_seul_pre_1988");
  if (lead.requiresAssr === true) tags.push("assr_requis_post_1988");

  return {
    priority:
      best && best.status !== "rejected" && (best.score >= 75 || lead.leadScore >= 70) ? "high" : best ? "medium" : "low",
    tags,
    recommendedAction: best
      ? best.status === "eligible"
        ? "Preparer devis " + best.partnerName
        : best.status === "needs_review"
          ? "Verifier pieces avant devis " + best.partnerName
          : "Requalifier le besoin"
      : "Completer le questionnaire",
  };
}

function matchVspPrivateOffers(rowOrPayload) {
  const rules = loadVspRules();
  const lead = normalizeLead(rowOrPayload);
  const matches = (rules.partners || [])
    .map(function (partner) {
      return evaluatePartner(partner, lead, rules);
    })
    .sort(function (a, b) {
      if (a.status === "rejected" && b.status !== "rejected") return 1;
      if (b.status === "rejected" && a.status !== "rejected") return -1;
      return b.score - a.score;
    });
  const best = matches.find(function (m) {
    return m.status !== "rejected";
  }) || matches[0] || null;

  const allDocs = [];
  matches.forEach(function (m) {
    (m.documents || []).forEach(function (d) {
      if (allDocs.indexOf(d) < 0) allDocs.push(d);
    });
  });

  return {
    ok: true,
    product: rules.product,
    lead,
    bestActor: best,
    matches,
    documentsToRequest: allDocs.slice(0, 12),
    insights: buildLeadInsights(lead, matches),
    generatedAt: new Date().toISOString(),
  };
}

module.exports = {
  loadVspRules,
  normalizeLead,
  matchVspPrivateOffers,
};
