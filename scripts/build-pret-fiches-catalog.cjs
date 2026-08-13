#!/usr/bin/env node
/**
 * Catalogue fiches produits prêt.
 * Dissocie clairement :
 *  - categories = types de prêt / termes (SCI, Crédit immo, PVH…)
 *  - partners   = établissements (CFCAL, SYGMA, BANK B…)
 *  - region     = géographie (métropole, DOM-TOM…)
 * Les dossiers filesystem (section) peuvent encore porter un nom partenaire ;
 * la catégorie métier est déduite des tags / section produit.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "scripts", "pret-fiches-manifest.json"), "utf8"));
const outPath = path.join(root, "data", "pret-fiches-produits.json");

function slug(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

/** Types de prêt / termes (pas des partenaires) */
const PRODUCT_CATEGORIES = [
  { id: "sci", label: "SCI", short: "SCI" },
  { id: "immo", label: "Crédit immobilier", short: "IMMO" },
  { id: "hypo_treso", label: "Prêt hypothécaire de trésorerie", short: "HYPO TRESO" },
  { id: "pvh", label: "Prêt viager hypothécaire", short: "PVH" },
  { id: "scpi", label: "SCPI", short: "SCPI" },
  { id: "treso", label: "Trésorerie", short: "TRESO" },
  { id: "renov", label: "Crédit rénovation", short: "RENOV" },
  { id: "rac", label: "Rachat de crédits", short: "RAC" },
  { id: "relais", label: "Prêt relais", short: "RELAIS" }
];

const PRODUCT_IDS = new Set(PRODUCT_CATEGORIES.map(function (c) {
  return c.id;
}));

const PARTNER_IDS = new Set([
  "bank_b",
  "cfcal",
  "cgi",
  "cml",
  "cmt",
  "creatis",
  "credilift",
  "lbp",
  "mmb",
  "sygma",
  "sofinco",
  "griffon"
]);

const REGION_IDS = new Set(["antilles", "reunion"]);

const PARTNER_LABELS = {
  cfcal: "CFCAL",
  bank_b: "BANK B",
  mmb: "My Money Bank / MMB",
  creatis: "CREATIS",
  credilift: "Credit Lift / CREDITLIFT",
  sygma: "SYGMA by BNP",
  lbp: "La Banque Postale",
  cgi: "CGI",
  cml: "CML",
  cmt: "CMT",
  sofinco: "Sofinco",
  griffon: "Griffon"
};

function inferCategory(f) {
  const tags = (f.tags || []).map(function (t) {
    return String(t).toLowerCase();
  });
  const hay = tags.concat([String(f.subsection || "").toLowerCase(), String(f.title || "").toLowerCase()]);

  function has() {
    for (var i = 0; i < arguments.length; i++) {
      if (hay.indexOf(arguments[i]) >= 0) return true;
    }
    return false;
  }

  // Produit explicite dans les tags
  for (var i = 0; i < tags.length; i++) {
    if (PRODUCT_IDS.has(tags[i])) return tags[i];
  }

  if (has("pvh", "viager")) return "pvh";
  if (has("scpi")) return "scpi";
  if (has("sci")) return "sci";
  if (has("renov", "renovation", "travaux")) return "renov";
  if (has("relais")) return "relais";
  if (has("hypo_treso", "hypo", "hypothecaire") && has("treso", "tresorerie", "trésorerie")) return "hypo_treso";
  if (has("hypo_treso")) return "hypo_treso";
  if (has("rac", "rachat")) return "rac";
  if (has("treso", "tresorerie", "trésorerie", "conso", "personnel")) return "treso";
  if (has("immo", "primo", "acquisition", "investissement", "edifys", "aquiz", "investys")) return "immo";

  // Section dossier = type produit
  if (PRODUCT_IDS.has(f.section)) return f.section;

  // Section partenaire / DOM-TOM : défaut métier
  if (has("hypo")) return "hypo_treso";
  return "immo";
}

function inferRegion(f) {
  if (f.region && f.region !== "metropole") return f.region;
  if (REGION_IDS.has(f.section)) return f.section;
  const tags = f.tags || [];
  if (tags.indexOf("reunion") >= 0 || tags.indexOf("dom_tom") >= 0 && String(f.title || "").toLowerCase().indexOf("reunion") >= 0) {
    return "reunion";
  }
  if (tags.indexOf("antilles") >= 0) return "antilles";
  if (tags.indexOf("dom_tom") >= 0) {
    const t = String(f.title || "").toLowerCase();
    if (t.indexOf("reunion") >= 0 || t.indexOf("réunion") >= 0) return "reunion";
    if (t.indexOf("antilles") >= 0 || t.indexOf("guadeloupe") >= 0 || t.indexOf("martinique") >= 0) return "antilles";
  }
  return f.region || "metropole";
}

const partnersMap = {};
manifest.files.forEach(function (f) {
  if (f.partner) partnersMap[f.partner] = true;
});

const documents = manifest.files.map(function (f, i) {
  const storageSection = f.section; // dossier filesystem (peut être un partenaire)
  const category = inferCategory(f);
  const partner = f.partner && PARTNER_IDS.has(f.partner) ? f.partner : f.partner || null;
  const dir = path.join(root, manifest.baseDir || "docs/pret-fiches", storageSection);
  const abs = path.join(dir, f.canonical);
  const available = fs.existsSync(abs);
  const rel = "./" + path.join(manifest.baseDir || "docs/pret-fiches", storageSection, f.canonical).replace(/\\/g, "/");
  return {
    id: slug([storageSection, f.partner, f.subsection, f.period || "na", f.canonical.replace(/\.[^.]+$/, ""), String(i)].join("-")),
    category: category,
    partner: partner,
    subsection: f.subsection || "produit",
    title: f.title,
    filename: f.canonical,
    kind: f.kind || "fiche",
    period: f.period || null,
    region: inferRegion(f),
    storageSection: storageSection,
    tags: f.tags || [],
    status: available ? "available" : "pending_upload",
    path: available ? rel : "",
    flags: f.flags || [],
    notes: f.notes || "",
    aliases: f.aliases || []
  };
});

const catalog = {
  version: 2,
  kind: "fiches_produits",
  updatedAt: new Date().toISOString().slice(0, 10),
  disclaimer:
    "Documents à usage exclusif des professionnels, non contractuels. Fiches produits — types de prêt ≠ partenaires financeurs.",
  categories: PRODUCT_CATEGORIES.map(function (c) {
    return {
      id: c.id,
      label: c.label,
      short: c.short,
      rubriques: [c.id],
      description: "Type de prêt — " + c.label
    };
  }),
  partners: Object.keys(partnersMap)
    .filter(function (id) {
      return PARTNER_IDS.has(id) || !PRODUCT_IDS.has(id);
    })
    .sort()
    .map(function (id) {
      return { id: id, label: PARTNER_LABELS[id] || id, aliases: [id] };
    }),
  documents: documents,
  eligibilityRules: [
    {
      id: "senior-retraite-rac",
      label: "Senior / retraite — RAC & PVH",
      priority: 10,
      when: { ageMin: 60, needAny: ["rac", "retraite", "senior", "pvh", "viager"] },
      preferCategories: ["rac", "pvh", "hypo_treso"],
      preferPartners: ["cgi", "cfcal", "mmb", "sygma"],
      preferTags: ["retraite", "senior", "pvh", "avec_garantie", "hypo"],
      advice:
        "Prioriser fiches retraite (CGI), PVH CFCAL, et RAC avec garantie. Croiser avec grilles de taux et calcul retraites interne CGI.",
      confidence: "draft",
      todoValidate: ["âge fin de prêt", "prise en compte retraite"]
    },
    {
      id: "locataire-sans-garantie",
      label: "Locataire — RAC sans garantie",
      priority: 15,
      when: { hasProperty: false, needAny: ["rac", "conso", "locataire"] },
      preferCategories: ["rac", "treso"],
      preferPartners: ["cfcal", "cgi", "sygma", "creatis", "mmb", "credilift"],
      preferTags: ["sans_garantie", "locataire", "conso"],
      advice: "Filtrer les fiches « sans garantie / locataire » (CFCAL, CGI, SYGMA…). Vérifier RAV et barèmes DOM-TOM si besoin.",
      confidence: "draft",
      todoValidate: []
    },
    {
      id: "proprietaire-garantie",
      label: "Propriétaire — RAC avec garantie / hypo",
      priority: 15,
      when: { hasProperty: true, needAny: ["rac", "hypo", "proprietaire"] },
      preferCategories: ["rac", "hypo_treso"],
      preferPartners: ["cfcal", "cgi", "mmb", "sygma", "creatis"],
      preferTags: ["avec_garantie", "hypo", "proprietaire"],
      advice: "Orienter vers RAC hypothécaire / avec garantie + descriptif bien + book revenus/charges.",
      confidence: "draft",
      todoValidate: []
    },
    {
      id: "dom-tom-fiches",
      label: "Dossiers DOM-TOM",
      priority: 5,
      when: { regionAny: ["reunion", "antilles", "dom", "dom-tom"] },
      preferCategories: ["rac", "treso", "immo"],
      preferPartners: ["credilift", "cfcal", "cgi"],
      preferTags: ["dom_tom"],
      advice: "Filtrer la région Réunion / Antilles (normes et RAV spécifiques) — ce ne sont pas des partenaires.",
      confidence: "draft",
      todoValidate: []
    },
    {
      id: "pvh-fiches",
      label: "PVH — trésorerie senior",
      priority: 12,
      when: { needAny: ["pvh", "viager"] },
      preferCategories: ["pvh"],
      preferPartners: ["cfcal", "cgi"],
      preferTags: ["pvh", "senior"],
      advice: "Fiche PVH + attestations destination des fonds / résidence secondaire + tableau patrimonial.",
      confidence: "draft",
      todoValidate: []
    },
    {
      id: "renov-travaux",
      label: "Travaux / rénovation",
      priority: 20,
      when: { needAny: ["renov", "renovation", "travaux"] },
      preferCategories: ["renov", "hypo_treso"],
      preferPartners: ["bank_b", "cfcal"],
      preferTags: ["travaux", "renovation", "hypo"],
      advice: "CFCAL HYPO RENOV + BANK B travaux > 75 k€ (privé/pro) + book revenus.",
      confidence: "draft",
      todoValidate: []
    },
    {
      id: "primo",
      label: "Primo-accession",
      priority: 25,
      when: { needAny: ["primo", "acquisition", "immo"] },
      preferCategories: ["immo"],
      preferPartners: ["bank_b", "cgi", "cfcal"],
      preferTags: ["primo", "personne_physique", "personne_morale"],
      advice: "BANK B 1ère acquisition + CFCAL Edifys/Aquiz/Investys selon projet.",
      confidence: "draft",
      todoValidate: []
    },
    {
      id: "credilift-gamme",
      label: "Gamme Credit Lift (Normalift / Hypolift / Minilift…)",
      priority: 18,
      when: { needAny: ["credilift", "lift", "normalift", "minilift", "hypolift", "consolift"] },
      preferCategories: ["rac", "treso", "hypo_treso"],
      preferPartners: ["credilift"],
      preferTags: ["credilift", "rac"],
      advice: "Orienter vers Normalift / Hypolift / Minilift / Consolift + récap endettement & RAV. Croiser grilles RAC Credit Lift.",
      confidence: "draft",
      todoValidate: ["âge max", "avec/sans garantie"]
    },
    {
      id: "scpi-fiches",
      label: "Financement SCPI",
      priority: 22,
      when: { needAny: ["scpi"] },
      preferCategories: ["scpi"],
      preferPartners: ["cfcal"],
      preferTags: ["scpi", "nantissement", "caution"],
      advice: "CFCAL (nom propre / SCI) + listes/book CACF. Croiser grilles SCPI.",
      confidence: "draft",
      todoValidate: []
    },
    {
      id: "sci-fiches",
      label: "Financement SCI",
      priority: 22,
      when: { needAny: ["sci"] },
      preferCategories: ["sci", "immo"],
      preferPartners: ["cfcal", "bank_b", "cgi"],
      preferTags: ["sci"],
      advice: "Croiser fiches SCI / personne morale et conditions partenaire.",
      confidence: "draft",
      todoValidate: []
    }
  ],
  manifest: {
    source: "scripts/pret-fiches-manifest.json",
    uniqueFiles: documents.length,
    available: documents.filter((d) => d.status === "available").length,
    pending: documents.filter((d) => d.status === "pending_upload").length,
    note: "categories = types de prêt ; partners = établissements ; region = géographie (DOM-TOM ≠ partenaire)"
  }
};

fs.writeFileSync(outPath, JSON.stringify(catalog, null, 2) + "\n", "utf8");

const catCounts = {};
documents.forEach(function (d) {
  catCounts[d.category] = (catCounts[d.category] || 0) + 1;
});
console.log(
  "Fiches catalogue:",
  documents.length,
  "— disponibles",
  catalog.manifest.available,
  "/ pending",
  catalog.manifest.pending
);
console.log("Catégories (types):", catalog.categories.map((c) => c.id).join(", "));
console.log("Partenaires:", catalog.partners.map((p) => p.id).join(", "));
console.log("Répartition par type:", JSON.stringify(catCounts));
