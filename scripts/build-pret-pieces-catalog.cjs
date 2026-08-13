#!/usr/bin/env node
/**
 * Construit data/pret-pieces-reglementaires.json
 * — listes de pièces dossier (IMMO, SCI, SCPI, RAC, PVH, tréso…)
 * — documents réglementaires IOBSP / IAS / conformité mandataires
 * Noms exacts : scripts/pret-pieces-download-list.txt (f:\Téléchargement\)
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const outPath = path.join(root, "data", "pret-pieces-reglementaires.json");
const listPath = path.join(root, "scripts", "pret-pieces-download-list.txt");

function slug(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

const categories = [
  { id: "pieces_immo", label: "Liste des pièces — Crédit immobilier", short: "PIÈCES IMMO", rubriques: ["immo"], family: "pieces" },
  { id: "pieces_sci", label: "Liste des pièces — SCI", short: "PIÈCES SCI", rubriques: ["sci"], family: "pieces" },
  { id: "pieces_scpi", label: "Liste des pièces — SCPI", short: "PIÈCES SCPI", rubriques: ["scpi"], family: "pieces" },
  { id: "pieces_rac", label: "Liste des pièces — Regroupement de crédits", short: "PIÈCES RAC", rubriques: ["rac"], family: "pieces" },
  { id: "pieces_hypo_treso", label: "Liste des pièces — Prêt hypo. trésorerie", short: "PIÈCES HYPO", rubriques: ["hypo"], family: "pieces" },
  { id: "pieces_treso", label: "Liste des pièces — Trésorerie", short: "PIÈCES TRESO", rubriques: ["conso", "treso"], family: "pieces" },
  { id: "pieces_pvh", label: "Liste des pièces — PVH", short: "PIÈCES PVH", rubriques: ["pvh", "viager"], family: "pieces" },
  { id: "iobsp", label: "Documents réglementaires — IOBSP", short: "IOBSP", rubriques: ["immo", "rac"], family: "reglementaire" },
  { id: "ias", label: "Documents réglementaires — IAS", short: "IAS", rubriques: ["assurance"], family: "reglementaire" },
  { id: "conformite", label: "Documents réglementaires — Conformité mandataires", short: "CONFORMITÉ", rubriques: ["immo", "rac"], family: "reglementaire" },
  { id: "indicateur", label: "Documents réglementaires — Indicateur d'affaires", short: "INDICATEUR", rubriques: ["immo", "rac"], family: "reglementaire" },
];

const partners = [
  { id: "cibfinance", label: "Cibfinance", aliases: ["cibfinance", "cib finance"] },
  { id: "cibassur", label: "Cibassur", aliases: ["cibassur"] },
];

/** Catalogue structuré d’après les écrans portail + noms Téléchargements */
const DOCS = [
  // —— Listes de pièces ——
  {
    filename: "Dossier---Credit-immobilier.pdf",
    title: "Dossier Crédit immobilier",
    category: "pieces_immo",
    subsection: "liste_pieces",
    kind: "liste_pieces",
    needs: ["immo", "pieces"],
    tags: ["pieces", "immo", "dossier", "credit_immobilier"],
    aliases: ["Dossier Crédit immobilier.pdf", "Dossier Credit immobilier.pdf"],
  },
  {
    filename: "Dossier--SCI.pdf",
    title: "Dossier SCI",
    category: "pieces_sci",
    subsection: "liste_pieces",
    kind: "liste_pieces",
    needs: ["sci", "pieces"],
    tags: ["pieces", "sci", "dossier"],
    aliases: ["Dossier SCI.pdf"],
  },
  {
    filename: "Dossier-SCPI.pdf",
    title: "Dossier SCPI",
    category: "pieces_scpi",
    subsection: "liste_pieces",
    kind: "liste_pieces",
    needs: ["scpi", "pieces"],
    tags: ["pieces", "scpi", "dossier"],
  },
  {
    filename: "Dossier-Rac---Propiretaire.pdf",
    title: "Dossier RAC — Propriétaire",
    category: "pieces_rac",
    subsection: "liste_pieces",
    kind: "liste_pieces",
    needs: ["rac", "pieces"],
    profiles: ["proprietaire"],
    tags: ["pieces", "rac", "proprietaire", "dossier"],
    aliases: ["Dossier Rac Proprietaire.pdf", "Dossier Rac Propiretaire.pdf"],
  },
  {
    filename: "Dossier-Rac---Locataire.pdf",
    title: "Dossier RAC — Locataire",
    category: "pieces_rac",
    subsection: "liste_pieces",
    kind: "liste_pieces",
    needs: ["rac", "pieces"],
    profiles: ["locataire"],
    tags: ["pieces", "rac", "locataire", "dossier"],
  },
  {
    filename: "Dossier-Rac---Heberge.pdf",
    title: "Dossier RAC — Hébergé",
    category: "pieces_rac",
    subsection: "liste_pieces",
    kind: "liste_pieces",
    needs: ["rac", "pieces"],
    profiles: ["locataire"],
    tags: ["pieces", "rac", "heberge", "dossier"],
  },
  {
    filename: "Dossier---Pret-Hypothecaire-de-Tresorerie.pdf",
    title: "Dossier Prêt Hypothécaire de Trésorerie",
    category: "pieces_hypo_treso",
    subsection: "liste_pieces",
    kind: "liste_pieces",
    needs: ["hypo", "treso", "pieces"],
    tags: ["pieces", "hypo", "treso", "dossier"],
  },
  {
    filename: "Dossier---Tresorerie.pdf",
    title: "Dossier Trésorerie",
    category: "pieces_treso",
    subsection: "liste_pieces",
    kind: "liste_pieces",
    needs: ["treso", "conso", "pieces"],
    tags: ["pieces", "treso", "dossier"],
  },
  {
    filename: "Liste-des-pieces-PVH.pdf",
    title: "Liste des pièces PVH",
    category: "pieces_pvh",
    subsection: "liste_pieces",
    kind: "liste_pieces",
    needs: ["pvh", "pieces"],
    tags: ["pieces", "pvh", "viager", "dossier"],
  },

  // —— IOBSP ——
  {
    filename: "Indic---Demande-Entree-en-Relation---Copie.pdf",
    title: "Indicateur — Demande d'entrée en relation",
    category: "indicateur",
    subsection: "demande_entree_relation",
    kind: "reglementaire",
    needs: ["immo", "rac", "pieces"],
    tags: ["iobsp", "indicateur", "entree_relation", "reglementaire"],
    partner: "cibfinance",
  },
  {
    filename: "MIOB---Demande-Entree-en-Relation.pdf",
    title: "MIOB — Demande d'entrée en relation",
    category: "iobsp",
    subsection: "demande_entree_relation",
    kind: "reglementaire",
    needs: ["immo", "rac", "pieces"],
    tags: ["iobsp", "miob", "entree_relation", "reglementaire"],
    partner: "cibfinance",
  },
  {
    filename: "Convention-Honoraire-Cib-finance.pdf.pdf",
    title: "Convention d'honoraires Cibfinance",
    category: "iobsp",
    subsection: "convention_honoraires",
    kind: "reglementaire",
    needs: ["immo", "rac"],
    tags: ["iobsp", "convention", "honoraires", "reglementaire"],
    partner: "cibfinance",
    aliases: ["Convention Honoraire Cib finance.pdf"],
  },
  {
    filename: "Immobilier---Fiche-renseignements-clients.pdf",
    title: "Fiche renseignements clients — Immobilier",
    category: "iobsp",
    subsection: "fiche_situation",
    kind: "reglementaire",
    needs: ["immo", "pieces"],
    tags: ["iobsp", "fiche", "renseignements", "immo"],
    partner: "cibfinance",
  },
  {
    filename: "Rac---Fiche-renseignements.pdf",
    title: "Fiche renseignements — RAC",
    category: "iobsp",
    subsection: "fiche_situation",
    kind: "reglementaire",
    needs: ["rac", "pieces"],
    tags: ["iobsp", "fiche", "renseignements", "rac"],
    partner: "cibfinance",
  },
  {
    filename: "Credit-immoiblier---Annexe-convention-honoraires.pdf",
    title: "Annexe convention honoraires — Crédit immobilier",
    category: "iobsp",
    subsection: "confirmation_honoraires",
    kind: "reglementaire",
    needs: ["immo"],
    tags: ["iobsp", "honoraires", "annexe", "immo"],
    partner: "cibfinance",
    aliases: ["Credit immobilier Annexe convention honoraires.pdf"],
  },
  {
    filename: "Regroupement-de-credits---Annexe-convention-honoraires.pdf",
    title: "Annexe convention honoraires — Regroupement de crédits",
    category: "iobsp",
    subsection: "confirmation_honoraires",
    kind: "reglementaire",
    needs: ["rac"],
    tags: ["iobsp", "honoraires", "annexe", "rac"],
    partner: "cibfinance",
  },
  {
    filename: "Mise-en-place-IMMO.pdf",
    title: "Mise en place IMMO",
    category: "iobsp",
    subsection: "mise_en_place",
    kind: "reglementaire",
    needs: ["immo", "pieces"],
    tags: ["iobsp", "mise_en_place", "immo", "process"],
    partner: "cibfinance",
  },

  // —— Conformité mandataires ——
  {
    filename: "Acquisition-client-Immo---Docusign.pdf",
    title: "Acquisition client Immo (DocuSign)",
    category: "conformite",
    subsection: "acquisition_client",
    kind: "conformite",
    needs: ["immo", "conformite"],
    tags: ["conformite", "acquisition", "docusign", "immo"],
    partner: "cibfinance",
  },
  {
    filename: "Acquisition-client-Regroupement-de-credits---Docusign.pdf",
    title: "Acquisition client Regroupement de crédits (DocuSign)",
    category: "conformite",
    subsection: "acquisition_client",
    kind: "conformite",
    needs: ["rac", "conformite"],
    tags: ["conformite", "acquisition", "docusign", "rac"],
    partner: "cibfinance",
  },
  {
    filename: "Lutte-anti-blanchiment---Docusign.pdf",
    title: "Lutte anti-blanchiment (DocuSign)",
    category: "conformite",
    subsection: "lcb_ft",
    kind: "conformite",
    needs: ["conformite"],
    tags: ["conformite", "blanchiment", "lcbft", "docusign"],
    partner: "cibfinance",
  },
  {
    filename: "Procedure-de-commercialisation-des-RAC---Docusign.pdf",
    title: "Procédure de commercialisation des RAC (DocuSign)",
    category: "conformite",
    subsection: "process_rac",
    kind: "conformite",
    needs: ["rac", "conformite"],
    tags: ["conformite", "commercialisation", "rac", "docusign"],
    partner: "cibfinance",
  },
  {
    filename: "Info-pub---Docusign.pdf",
    title: "Info publicité (DocuSign)",
    category: "conformite",
    subsection: "publicite",
    kind: "conformite",
    needs: ["conformite"],
    tags: ["conformite", "publicite", "docusign"],
    partner: "cibfinance",
  },
  {
    filename: "Publicite-Credit-immobilier---Docusign.pdf",
    title: "Publicité Crédit immobilier (DocuSign)",
    category: "conformite",
    subsection: "publicite",
    kind: "conformite",
    needs: ["immo", "conformite"],
    tags: ["conformite", "publicite", "immo", "docusign"],
    partner: "cibfinance",
  },

  // —— IAS ——
  {
    filename: "Information-pre-contractuelle-assurance.pdf",
    title: "Information pré-contractuelle assurance",
    category: "ias",
    subsection: "fiche_situation_assure",
    kind: "reglementaire",
    needs: ["assurance", "pieces"],
    tags: ["ias", "assurance", "precontrat", "ade"],
    partner: "cibassur",
  },
  {
    filename: "Guide-d_informations-Cibassur.pdf",
    title: "Guide d'informations Cibassur",
    category: "ias",
    subsection: "guide_ias",
    kind: "reglementaire",
    needs: ["assurance"],
    tags: ["ias", "assurance", "guide", "cibassur"],
    partner: "cibassur",
    aliases: ["Guide d'informations Cibassur.pdf"],
  },
];

const downloadSet = new Set(
  fs
    .readFileSync(listPath, "utf8")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
);

const documents = DOCS.map((d, i) => {
  const id = slug([d.category, d.subsection, d.filename, String(i)].join("-"));
  const inList = downloadSet.has(d.filename);
  return {
    id,
    category: d.category,
    partner: d.partner || "cibfinance",
    region: "metropole",
    subsection: d.subsection,
    title: d.title,
    filename: d.filename,
    kind: d.kind,
    status: "pending_upload",
    path: null,
    period: null,
    tags: d.tags || [],
    needs: d.needs || [],
    profiles: d.profiles || [],
    aliases: d.aliases || [],
    flags: inList ? [] : ["missing_from_download_list"],
    notes: "À déposer dans docs/pret-pieces/_inbox/ puis npm run pret:pieces:import",
  };
});

const catalog = {
  version: 1,
  kind: "pieces_reglementaires",
  updatedAt: new Date().toISOString().slice(0, 10),
  disclaimer:
    "Documents à usage exclusif des professionnels (Cibfinance / Cibassur), non contractuels. Ne pas remettre à la clientèle. Tracking des téléchargements recommandé.",
  categories,
  partners,
  documents,
  eligibilityRules: [
    {
      id: "pieces-par-rubrique",
      label: "Liste de pièces selon le type de dossier",
      priority: 12,
      when: { needAny: ["pieces", "dossier", "immo", "rac", "sci", "scpi", "pvh"] },
      preferCategories: [
        "pieces_immo",
        "pieces_rac",
        "pieces_sci",
        "pieces_scpi",
        "pieces_pvh",
        "pieces_hypo_treso",
        "pieces_treso",
      ],
      preferTags: ["pieces", "dossier"],
      advice:
        "Ouvrir la liste de pièces correspondant à la rubrique (IMMO / RAC propriétaire|locataire|hébergé / SCI / SCPI / PVH / tréso).",
      confidence: "draft",
      todoValidate: ["vérifier versions PDF à l’import"],
    },
    {
      id: "iobsp-parcours",
      label: "Parcours réglementaire IOBSP",
      priority: 18,
      when: { needAny: ["immo", "rac", "iobsp", "conformite"] },
      preferCategories: ["iobsp", "indicateur", "conformite"],
      preferTags: ["iobsp", "reglementaire"],
      advice:
        "Entrée en relation → fiche renseignements → convention / annexe honoraires → mise en place → pièces dossier.",
      confidence: "draft",
      todoValidate: [],
    },
    {
      id: "ias-assurance",
      label: "Parcours réglementaire IAS (assurance)",
      priority: 20,
      when: { needAny: ["assurance", "ade", "ias"] },
      preferCategories: ["ias"],
      preferTags: ["ias", "assurance"],
      advice: "Information pré-contractuelle + guide Cibassur avant proposition ADE / mutuelle.",
      confidence: "draft",
      todoValidate: [],
    },
  ],
  manifest: {
    source: "scripts/pret-pieces-download-list.txt",
    uniqueFiles: downloadSet.size,
    catalogued: documents.length,
    pending: documents.filter((d) => d.status === "pending_upload").length,
    inbox: "docs/pret-pieces/_inbox/",
  },
};

fs.writeFileSync(outPath, JSON.stringify(catalog, null, 2) + "\n");
console.log(
  "Wrote",
  outPath,
  "—",
  documents.length,
  "docs,",
  downloadSet.size,
  "fichiers listés"
);

const missing = [...downloadSet].filter((f) => !DOCS.some((d) => d.filename === f));
if (missing.length) console.warn("Dans la liste mais pas dans DOCS:", missing);
const extra = DOCS.filter((d) => !downloadSet.has(d.filename)).map((d) => d.filename);
if (extra.length) console.warn("Dans DOCS mais pas dans la liste:", extra);
