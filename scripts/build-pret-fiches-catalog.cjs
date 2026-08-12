#!/usr/bin/env node
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

const partnersMap = {};
manifest.files.forEach(function (f) {
  partnersMap[f.partner] = true;
});

const PARTNER_LABELS = {
  cfcal: "CFCAL",
  bank_b: "BANK B",
  mmb: "My Money Bank / MMB",
  creatis: "CREATIS",
  credilift: "Credit Lift / CREDILIFT",
  sygma: "SYGMA by BNP",
  lbp: "La Banque Postale",
  cgi: "CGI",
  cml: "CML",
  cmt: "CMT",
  sofinco: "Sofinco",
  griffon: "Griffon"
};

const documents = manifest.files.map(function (f, i) {
  const dir = path.join(root, manifest.baseDir || "docs/pret-fiches", f.section);
  const abs = path.join(dir, f.canonical);
  const available = fs.existsSync(abs);
  const rel = "./" + path.join(manifest.baseDir || "docs/pret-fiches", f.section, f.canonical).replace(/\\/g, "/");
  return {
    id: slug([f.section, f.partner, f.subsection, f.period || "na", f.canonical.replace(/\.[^.]+$/, ""), String(i)].join("-")),
    category: f.section,
    partner: f.partner,
    subsection: f.subsection || "produit",
    title: f.title,
    filename: f.canonical,
    kind: f.kind || "fiche",
    period: f.period || null,
    region: f.region || "metropole",
    tags: f.tags || [],
    status: available ? "available" : "pending_upload",
    path: available ? rel : "",
    flags: f.flags || [],
    notes: f.notes || "",
    aliases: f.aliases || []
  };
});

const catalog = {
  version: 1,
  kind: "fiches_produits",
  updatedAt: new Date().toISOString().slice(0, 10),
  disclaimer:
    "Documents à usage exclusif des professionnels, non contractuels. Fiches produits partenaires — ne pas remettre à la clientèle.",
  categories: (manifest.sections || []).map(function (s) {
    return {
      id: s.id,
      label: s.label,
      short: s.short || s.label,
      rubriques: [s.id],
      description: "Fiches produits — " + s.label
    };
  }),
  partners: Object.keys(partnersMap)
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
      preferCategories: ["cgi", "cfcal", "pvh", "mmb", "sygma"],
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
      preferCategories: ["cfcal", "cgi", "sygma", "creatis", "mmb", "antilles", "reunion"],
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
      preferCategories: ["cfcal", "cgi", "mmb", "sygma", "creatis"],
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
      preferCategories: ["reunion", "antilles"],
      preferTags: ["dom_tom"],
      advice: "Utiliser uniquement les fiches Réunion / Antilles (normes et RAV spécifiques).",
      confidence: "draft",
      todoValidate: []
    },
    {
      id: "pvh-fiches",
      label: "PVH — trésorerie senior",
      priority: 12,
      when: { needAny: ["pvh", "viager"] },
      preferCategories: ["pvh"],
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
      preferCategories: ["renov", "hypo_treso", "bank_b", "cfcal"],
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
      preferCategories: ["immo", "bank_b", "cgi"],
      preferTags: ["primo", "personne_physique", "personne_morale"],
      advice: "BANK B 1ère acquisition + CFCAL Edifys/Aquiz/Investys selon projet.",
      confidence: "draft",
      todoValidate: []
    }
  ],
  manifest: {
    source: "scripts/pret-fiches-manifest.json",
    uniqueFiles: documents.length,
    available: documents.filter((d) => d.status === "available").length,
    pending: documents.filter((d) => d.status === "pending_upload").length
  }
};

fs.writeFileSync(outPath, JSON.stringify(catalog, null, 2) + "\n", "utf8");
console.log(
  "Fiches catalogue:",
  documents.length,
  "— disponibles",
  catalog.manifest.available,
  "/ pending",
  catalog.manifest.pending
);
