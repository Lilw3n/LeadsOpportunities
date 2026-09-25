const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(process.cwd(), "config", "subscription-plans.json");
const INTERVALS = ["month", "year"];
const CTA_MODES = ["checkout", "link", "contact", "disabled"];

function readSeed() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  } catch (e) {
    return {
      pageTitle: "Choisissez votre formule",
      pageSubtitle: "",
      currency: "eur",
      billingToggle: true,
      defaultInterval: "month",
      contactUrl: "/index.html#contact",
      successPath: "/paiement-success.html",
      cancelPath: "/abonnements/?canceled=1",
      footnote: "",
      plans: [],
    };
  }
}

function asText(value, fallback) {
  if (value == null) return fallback;
  return String(value).trim();
}

function asNumber(value, fallback) {
  var n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asBool(value, fallback) {
  if (typeof value === "boolean") return value;
  if (value == null) return fallback;
  var s = String(value).toLowerCase();
  if (s === "1" || s === "true" || s === "yes") return true;
  if (s === "0" || s === "false" || s === "no") return false;
  return fallback;
}

function normalizeFeatures(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map(function (item) {
      return asText(item, "");
    })
    .filter(Boolean)
    .slice(0, 40);
}

function normalizeEntitlements(raw) {
  var src = raw && typeof raw === "object" ? raw : {};
  var modules = Array.isArray(src.modules)
    ? src.modules
        .map(function (m) {
          return asText(m, "");
        })
        .filter(Boolean)
        .slice(0, 40)
    : [];
  return {
    contactsPerMonth: asNumber(src.contactsPerMonth, 0),
    tourViews: asNumber(src.tourViews, 0),
    modules: modules,
  };
}

function slugify(value) {
  return (
    asText(value, "plan")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64) || "plan"
  );
}

function normalizePlan(raw, index) {
  var src = raw && typeof raw === "object" ? raw : {};
  var id = slugify(src.id || src.name || "plan-" + (index + 1));
  var ctaMode = asText(src.ctaMode, "checkout").toLowerCase();
  if (CTA_MODES.indexOf(ctaMode) === -1) ctaMode = "checkout";
  return {
    id: id,
    name: asText(src.name, "Offre") || "Offre",
    tagline: asText(src.tagline, ""),
    badge: asText(src.badge, ""),
    priceMonthly: Math.max(0, asNumber(src.priceMonthly, 0)),
    priceYearly: Math.max(0, asNumber(src.priceYearly, 0)),
    ctaLabel: asText(src.ctaLabel, "Choisir") || "Choisir",
    ctaMode: ctaMode,
    ctaUrl: asText(src.ctaUrl, ""),
    features: normalizeFeatures(src.features),
    highlighted: asBool(src.highlighted, false),
    enabled: asBool(src.enabled, true),
    sortOrder: asNumber(src.sortOrder, (index + 1) * 10),
    trialDays: Math.max(0, Math.min(90, Math.round(asNumber(src.trialDays, 0)))),
    stripePriceIdMonthly: asText(src.stripePriceIdMonthly, ""),
    stripePriceIdYearly: asText(src.stripePriceIdYearly, ""),
    entitlements: normalizeEntitlements(src.entitlements),
  };
}

function normalizeConfig(raw) {
  var seed = readSeed();
  var src = raw && typeof raw === "object" ? raw : {};
  var plansSrc = Array.isArray(src.plans) ? src.plans : seed.plans;
  var plans = plansSrc.map(normalizePlan).sort(function (a, b) {
    return a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "fr");
  });
  var seen = Object.create(null);
  plans.forEach(function (plan, i) {
    var base = plan.id;
    var id = base;
    var n = 2;
    while (seen[id]) {
      id = base + "-" + n;
      n += 1;
    }
    seen[id] = true;
    plan.id = id;
    plans[i] = plan;
  });

  var defaultInterval = asText(src.defaultInterval, seed.defaultInterval || "month").toLowerCase();
  if (INTERVALS.indexOf(defaultInterval) === -1) defaultInterval = "month";

  return {
    pageTitle: asText(src.pageTitle, seed.pageTitle) || "Formules",
    pageSubtitle: asText(src.pageSubtitle, seed.pageSubtitle),
    currency: asText(src.currency, seed.currency || "eur").toLowerCase() || "eur",
    billingToggle: asBool(src.billingToggle, seed.billingToggle !== false),
    defaultInterval: defaultInterval,
    contactUrl: asText(src.contactUrl, seed.contactUrl || "/index.html#contact"),
    successPath: asText(src.successPath, seed.successPath || "/paiement-success.html"),
    cancelPath: asText(src.cancelPath, seed.cancelPath || "/abonnements/?canceled=1"),
    footnote: asText(src.footnote, seed.footnote),
    plans: plans,
  };
}

function publicConfig(config) {
  var full = normalizeConfig(config);
  return {
    pageTitle: full.pageTitle,
    pageSubtitle: full.pageSubtitle,
    currency: full.currency,
    billingToggle: full.billingToggle,
    defaultInterval: full.defaultInterval,
    contactUrl: full.contactUrl,
    footnote: full.footnote,
    plans: full.plans
      .filter(function (p) {
        return p.enabled;
      })
      .map(function (p) {
        return {
          id: p.id,
          name: p.name,
          tagline: p.tagline,
          badge: p.badge,
          priceMonthly: p.priceMonthly,
          priceYearly: p.priceYearly,
          ctaLabel: p.ctaLabel,
          ctaMode: p.ctaMode,
          ctaUrl: p.ctaUrl,
          features: p.features,
          highlighted: p.highlighted,
          trialDays: p.trialDays,
          sortOrder: p.sortOrder,
        };
      }),
  };
}

function findPlan(config, planId) {
  var full = normalizeConfig(config);
  var id = slugify(planId);
  for (var i = 0; i < full.plans.length; i++) {
    if (full.plans[i].id === id) return full.plans[i];
  }
  return null;
}

function priceForInterval(plan, interval) {
  if (interval === "year") return Number(plan.priceYearly) || 0;
  return Number(plan.priceMonthly) || 0;
}

function stripePriceIdForInterval(plan, interval) {
  if (interval === "year") return asText(plan.stripePriceIdYearly, "");
  return asText(plan.stripePriceIdMonthly, "");
}

module.exports = {
  INTERVALS: INTERVALS,
  CTA_MODES: CTA_MODES,
  CONFIG_PATH: CONFIG_PATH,
  readSeed: readSeed,
  normalizeConfig: normalizeConfig,
  publicConfig: publicConfig,
  findPlan: findPlan,
  priceForInterval: priceForInterval,
  stripePriceIdForInterval: stripePriceIdForInterval,
  slugify: slugify,
};
