#!/usr/bin/env node
/**
 * Fusionne scripts/pret-fiches-download-list.txt dans le manifeste :
 * - ajoute aliases pour match import
 * - crée les entrées manquantes (Credit Lift, SCPI, SCI…)
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const listPath = path.join(root, "scripts", "pret-fiches-download-list.txt");
const manifestPath = path.join(root, "scripts", "pret-fiches-manifest.json");

function stripCopy(name) {
  return String(name || "")
    .replace(/\s*\(\d+\)(?=\.[^.]+$)/, "")
    .trim();
}

function norm(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "_")
    .replace(/[^a-z0-9]+/g, "")
    .replace(/inforrmations/g, "informations");
}

function tokenScore(a, b) {
  const na = norm(a);
  const nb = norm(b);
  if (!na || !nb) return 0;
  if (na === nb) return 100;
  if (na.includes(nb) || nb.includes(na)) return 80;
  /* token overlap */
  const ta = na.match(/[a-z0-9]{3,}/g) || [];
  const tb = new Set(nb.match(/[a-z0-9]{3,}/g) || []);
  let hit = 0;
  ta.forEach((t) => {
    if (tb.has(t)) hit++;
  });
  if (!ta.length) return 0;
  return Math.round((hit / Math.max(ta.length, tb.size)) * 70);
}

const downloads = fs
  .readFileSync(listPath, "utf8")
  .split(/\r?\n/)
  .map((l) => stripCopy(l.trim()))
  .filter((l) => /\.(pdf|xlsx|xls|docx?)$/i.test(l));

const unique = [];
const seen = new Set();
downloads.forEach((f) => {
  const k = norm(f);
  if (seen.has(k)) return;
  seen.add(k);
  unique.push(f);
});

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

/* Ensure sections exist */
function ensureSection(id, label, short) {
  if (!manifest.sections.some((s) => s.id === id)) {
    manifest.sections.push({ id, label, short: short || label });
  }
}
ensureSection("scpi", "SCPI", "SCPI");
ensureSection("sci", "SCI", "SCI");
ensureSection("credilift", "Credit Lift", "CREDITLIFT");

const NEW_DEFAULTS = [
  {
    match: /modif.?normes.?sci|normes.?sci/i,
    entry: {
      section: "sci",
      partner: "cfcal",
      subsection: "norme",
      title: "CFCAL Modif normes SCI",
      tags: ["sci", "normes", "cfcal"],
      period: "2026-01",
      kind: "memento"
    }
  },
  {
    match: /investys.?patrimonial/i,
    entry: {
      section: "immo",
      partner: "cfcal",
      subsection: "produit",
      title: "CFCAL Investys Patrimonial",
      tags: ["immo", "investys", "patrimoine"],
      period: "2026-01"
    }
  },
  {
    match: /scpi.?nom.?propre.?nantissement|nantissement.?parts.?cfcal/i,
    entry: {
      section: "scpi",
      partner: "cfcal",
      subsection: "produit",
      title: "SCPI nom propre — nantissement parts",
      tags: ["scpi", "nantissement", "nom_propre"],
      period: "2026-06"
    }
  },
  {
    match: /scpi.?nom.?propre.?caution|caution.?logement.?cfcal/i,
    entry: {
      section: "scpi",
      partner: "cfcal",
      subsection: "produit",
      title: "SCPI nom propre — caution logement",
      tags: ["scpi", "caution", "nom_propre"],
      period: "2026-06"
    }
  },
  {
    match: /scpi.?financement.?via.?sci|via.?sci.?cfcal/i,
    entry: {
      section: "scpi",
      partner: "cfcal",
      subsection: "produit",
      title: "SCPI financement via SCI",
      tags: ["scpi", "sci", "nantissement"],
      period: "2026-06"
    }
  },
  {
    match: /liste.?scpi.?cacf/i,
    entry: {
      section: "scpi",
      partner: "credilift",
      subsection: "liste",
      title: "Liste SCPI CACF",
      tags: ["scpi", "liste", "cacf"],
      period: "2026-07",
      kind: "liste"
    }
  },
  {
    match: /cacf.?book.?scpi/i,
    entry: {
      section: "scpi",
      partner: "credilift",
      subsection: "book",
      title: "CACF Book SCPI",
      tags: ["scpi", "book", "cacf"],
      period: "2026-07",
      kind: "book"
    }
  },
  {
    match: /^unilift/i,
    entry: {
      section: "credilift",
      partner: "credilift",
      subsection: "produit",
      title: "UNILIFT",
      tags: ["rac", "credilift", "unilift"],
      period: "2026-05"
    }
  },
  {
    match: /^minilift/i,
    entry: {
      section: "credilift",
      partner: "credilift",
      subsection: "produit",
      title: "MINILIFT",
      tags: ["rac", "credilift", "minilift", "sans_garantie"],
      period: "2026-05"
    }
  },
  {
    match: /consolift.?180/i,
    entry: {
      section: "credilift",
      partner: "credilift",
      subsection: "produit",
      title: "CONSOLIFT 180 mois",
      tags: ["rac", "credilift", "consolift"],
      period: "2026-05"
    }
  },
  {
    match: /^consolift-05/i,
    entry: {
      section: "credilift",
      partner: "credilift",
      subsection: "produit",
      title: "CONSOLIFT",
      tags: ["rac", "credilift", "consolift"],
      period: "2026-05"
    }
  },
  {
    match: /cautiolift/i,
    entry: {
      section: "credilift",
      partner: "credilift",
      subsection: "produit",
      title: "CAUTIOLIFT conso",
      tags: ["rac", "credilift", "caution", "conso"],
      period: "2026-05"
    }
  },
  {
    match: /hypolift.?conso.?2nd|2nd.?rang/i,
    entry: {
      section: "credilift",
      partner: "credilift",
      subsection: "produit",
      title: "HYPOLIFT conso 2nd rang",
      tags: ["rac", "credilift", "hypo", "conso", "avec_garantie"],
      period: "2026-05"
    }
  },
  {
    match: /^hypolift.?conso-05/i,
    entry: {
      section: "credilift",
      partner: "credilift",
      subsection: "produit",
      title: "HYPOLIFT conso",
      tags: ["rac", "credilift", "hypo", "conso", "avec_garantie"],
      period: "2026-05"
    }
  },
  {
    match: /assurlift/i,
    entry: {
      section: "credilift",
      partner: "credilift",
      subsection: "assurance",
      title: "Assurance Assurlift — présentation",
      tags: ["assurance", "credilift"],
      period: null,
      kind: "assurance"
    }
  },
  {
    match: /assurance-lettre-renonciation/i,
    entry: {
      section: "credilift",
      partner: "credilift",
      subsection: "assurance",
      title: "Assurance — lettre renonciation",
      tags: ["assurance", "credilift"],
      period: null,
      kind: "assurance"
    }
  },
  {
    match: /process-cession-sur-salaire/i,
    entry: {
      section: "credilift",
      partner: "credilift",
      subsection: "interne",
      title: "Process cession sur salaire",
      tags: ["interne", "credilift"],
      period: null,
      kind: "interne"
    }
  },
  {
    match: /mandat-sepa/i,
    entry: {
      section: "credilift",
      partner: "credilift",
      subsection: "formulaire",
      title: "Mandat SEPA",
      tags: ["formulaire", "sepa"],
      period: null,
      kind: "formulaire"
    }
  },
  {
    match: /garantie-descriptif-bien/i,
    entry: {
      section: "credilift",
      partner: "credilift",
      subsection: "interne",
      title: "Garantie — descriptif bien immobilier",
      tags: ["interne", "garantie", "bien"],
      period: null,
      kind: "interne"
    }
  },
  {
    match: /attestation-non-re-endettement/i,
    entry: {
      section: "credilift",
      partner: "credilift",
      subsection: "formulaire",
      title: "Attestation non réendettement",
      tags: ["formulaire", "rac"],
      period: null,
      kind: "formulaire"
    }
  },
  {
    match: /attestation-de-cloture-des-credits-renouvelables/i,
    entry: {
      section: "credilift",
      partner: "credilift",
      subsection: "formulaire",
      title: "Attestation clôture crédits renouvelables",
      tags: ["formulaire", "rac"],
      period: null,
      kind: "formulaire"
    }
  },
  /* —— Ajouts Desktop pret (CIB, dossiers types, flyers, CML taux…) —— */
  {
    match: /cib.?fiche.?partenariat|fiche.?partenariat/i,
    entry: {
      section: "immo",
      partner: "cgi",
      subsection: "partenariat",
      title: "CIB — fiche partenariat",
      tags: ["cib", "partenariat"],
      kind: "interne"
    }
  },
  {
    match: /cib.?fiches.?credit.?consommation/i,
    entry: {
      section: "treso",
      partner: "cgi",
      subsection: "produit",
      title: "CIB — crédit consommation",
      tags: ["cib", "conso", "treso"],
      period: "2024"
    }
  },
  {
    match: /cib.?fiches.?credit.?immobilier/i,
    entry: {
      section: "immo",
      partner: "cgi",
      subsection: "produit",
      title: "CIB — crédit immobilier",
      tags: ["cib", "immo"],
      period: "2024"
    }
  },
  {
    match: /cib.?fiches.?financement.?investisseur/i,
    entry: {
      section: "immo",
      partner: "cgi",
      subsection: "produit",
      title: "CIB — financement investisseur",
      tags: ["cib", "investisseur", "immo"],
      period: "2024"
    }
  },
  {
    match: /cib.?fiches.?financement.?scpi/i,
    entry: {
      section: "scpi",
      partner: "cgi",
      subsection: "produit",
      title: "CIB — financement SCPI",
      tags: ["cib", "scpi"],
      period: "2024"
    }
  },
  {
    match: /cib.?fiches.?pret.?viager|cib.?.*viager.?hypothecaire/i,
    entry: {
      section: "pvh",
      partner: "cgi",
      subsection: "produit",
      title: "CIB — prêt viager hypothécaire",
      tags: ["cib", "pvh"],
      period: "2024"
    }
  },
  {
    match: /cib.?fiches.?produits.?2024.?7.?rachat.?de.?soulte|cib.?.*rachat.?de.?soulte/i,
    entry: {
      section: "immo",
      partner: "cgi",
      subsection: "produit",
      title: "CIB — rachat de soulte",
      tags: ["cib", "soulte", "immo"],
      period: "2024"
    }
  },
  {
    match: /cib.?fiches.?produits.?2024.?8.?travaux|cib.?.*travaux/i,
    entry: {
      section: "renov",
      partner: "cgi",
      subsection: "produit",
      title: "CIB — travaux",
      tags: ["cib", "travaux", "renov"],
      period: "2024"
    }
  },
  {
    match: /cib.?fiches.?regroupement.?de.?credits/i,
    entry: {
      section: "credilift",
      partner: "cgi",
      subsection: "produit",
      title: "CIB — regroupement de crédits",
      tags: ["cib", "rac"],
      period: "2024"
    }
  },
  {
    match: /convention.?honoraire.?cib/i,
    entry: {
      section: "immo",
      partner: "cgi",
      subsection: "interne",
      title: "Convention honoraires CIB Finance",
      tags: ["cib", "honoraires", "interne"],
      kind: "interne"
    }
  },
  {
    match: /annexe.?convention.?honoraires|credit.?immoiblier.?annexe|regroupement.?de.?credits.?annexe/i,
    entry: {
      section: "immo",
      partner: "cgi",
      subsection: "interne",
      title: "Annexe convention honoraires",
      tags: ["honoraires", "interne"],
      kind: "interne"
    }
  },
  {
    match: /^dossier.?credit.?immobilier|^dossier---credit/i,
    entry: {
      section: "immo",
      partner: null,
      subsection: "dossier",
      title: "Dossier type — crédit immobilier",
      tags: ["dossier", "immo", "pieces"],
      kind: "dossier"
    }
  },
  {
    match: /dossier.?pret.?hypothecaire.?de.?tresorerie/i,
    entry: {
      section: "hypo_treso",
      partner: null,
      subsection: "dossier",
      title: "Dossier type — prêt hypothécaire de trésorerie",
      tags: ["dossier", "hypo_treso", "pieces"],
      kind: "dossier"
    }
  },
  {
    match: /dossier.?rac.?heberge/i,
    entry: {
      section: "credilift",
      partner: null,
      subsection: "dossier",
      title: "Dossier type RAC — hébergé",
      tags: ["dossier", "rac", "heberge"],
      kind: "dossier"
    }
  },
  {
    match: /dossier.?rac.?locataire/i,
    entry: {
      section: "credilift",
      partner: null,
      subsection: "dossier",
      title: "Dossier type RAC — locataire",
      tags: ["dossier", "rac", "locataire"],
      kind: "dossier"
    }
  },
  {
    match: /dossier.?rac.?propir|dossier.?rac.?propriet/i,
    entry: {
      section: "credilift",
      partner: null,
      subsection: "dossier",
      title: "Dossier type RAC — propriétaire",
      tags: ["dossier", "rac", "proprietaire"],
      kind: "dossier"
    }
  },
  {
    match: /dossier.?sci/i,
    entry: {
      section: "sci",
      partner: null,
      subsection: "dossier",
      title: "Dossier type — SCI",
      tags: ["dossier", "sci", "pieces"],
      kind: "dossier"
    }
  },
  {
    match: /dossier.?scpi/i,
    entry: {
      section: "scpi",
      partner: null,
      subsection: "dossier",
      title: "Dossier type — SCPI",
      tags: ["dossier", "scpi", "pieces"],
      kind: "dossier"
    }
  },
  {
    match: /dossier.?tresorerie/i,
    entry: {
      section: "treso",
      partner: null,
      subsection: "dossier",
      title: "Dossier type — trésorerie",
      tags: ["dossier", "treso", "pieces"],
      kind: "dossier"
    }
  },
  {
    match: /flyer.?pret.?travaux.?hypo/i,
    entry: {
      section: "renov",
      partner: null,
      subsection: "flyer",
      title: "Flyer prêt travaux hypo",
      tags: ["flyer", "travaux", "hypo"],
      kind: "flyer"
    }
  },
  {
    match: /^flyer.?pvh/i,
    entry: {
      section: "pvh",
      partner: null,
      subsection: "flyer",
      title: "Flyer PVH",
      tags: ["flyer", "pvh"],
      kind: "flyer"
    }
  },
  {
    match: /^flyer.?rac$/i,
    entry: {
      section: "credilift",
      partner: null,
      subsection: "flyer",
      title: "Flyer RAC",
      tags: ["flyer", "rac"],
      kind: "flyer"
    }
  },
  {
    match: /flyer.?rachat.?soulte/i,
    entry: {
      section: "immo",
      partner: null,
      subsection: "flyer",
      title: "Flyer rachat de soulte",
      tags: ["flyer", "soulte"],
      kind: "flyer"
    }
  },
  {
    match: /guide.?d.?informations.?cibassur|cibassur/i,
    entry: {
      section: "immo",
      partner: "cgi",
      subsection: "assurance",
      title: "Guide informations Cibassur",
      tags: ["assurance", "cib", "cibassur"],
      kind: "assurance"
    }
  },
  {
    match: /immobilier.?fiche.?renseignements.?clients/i,
    entry: {
      section: "immo",
      partner: null,
      subsection: "formulaire",
      title: "Immobilier — fiche renseignements clients",
      tags: ["formulaire", "immo"],
      kind: "formulaire"
    }
  },
  {
    match: /indic.?demande.?entree.?en.?relation|miob.?demande.?entree/i,
    entry: {
      section: "immo",
      partner: null,
      subsection: "formulaire",
      title: "Demande d'entrée en relation",
      tags: ["formulaire", "entree_relation"],
      kind: "formulaire"
    }
  },
  {
    match: /info.?pub.?docusign|publicite.?credit.?immobilier.?docusign|lutte.?anti.?blanchiment.?docusign|procedure.?de.?commercialisation.?des.?rac.?docusign/i,
    entry: {
      section: "immo",
      partner: null,
      subsection: "interne",
      title: "Procédure DocuSign / conformité",
      tags: ["docusign", "conformite", "interne"],
      kind: "interne"
    }
  },
  {
    match: /information.?pre.?contractuelle.?assurance/i,
    entry: {
      section: "immo",
      partner: null,
      subsection: "assurance",
      title: "Information précontractuelle assurance",
      tags: ["assurance", "precontractuel"],
      kind: "assurance"
    }
  },
  {
    match: /liste.?des.?pieces.?pvh/i,
    entry: {
      section: "pvh",
      partner: null,
      subsection: "pieces",
      title: "Liste des pièces PVH",
      tags: ["pieces", "pvh"],
      kind: "pieces"
    }
  },
  {
    match: /mise.?en.?place.?immo/i,
    entry: {
      section: "immo",
      partner: null,
      subsection: "interne",
      title: "Mise en place IMMO",
      tags: ["interne", "immo", "process"],
      kind: "interne"
    }
  },
  {
    match: /^rac.?fiche.?renseignements/i,
    entry: {
      section: "credilift",
      partner: null,
      subsection: "formulaire",
      title: "RAC — fiche renseignements",
      tags: ["formulaire", "rac"],
      kind: "formulaire"
    }
  },
  {
    match: /tableau.?patrimoine.?bank.?b/i,
    entry: {
      section: "bank_b",
      partner: "bank_b",
      subsection: "formulaire",
      title: "Tableau patrimoine BANK B",
      tags: ["bank_b", "patrimoine", "formulaire"],
      kind: "formulaire"
    }
  },
  {
    match: /taux.?pret.?personne.?cml/i,
    entry: {
      section: "cml",
      partner: "cml",
      subsection: "taux",
      title: "Taux prêt personnel CML",
      tags: ["cml", "conso", "taux"],
      kind: "grille"
    }
  },
  {
    match: /taux.?rac.?cml/i,
    entry: {
      section: "cml",
      partner: "cml",
      subsection: "taux",
      title: "Taux RAC CML",
      tags: ["cml", "rac", "taux"],
      kind: "grille"
    }
  },
  {
    match: /01.?2026.?sygma|^01-2026-sygma/i,
    entry: {
      section: "sygma",
      partner: "sygma",
      subsection: "memento",
      title: "SYGMA — memento 01-2026",
      tags: ["sygma", "memento"],
      period: "2026-01",
      kind: "memento"
    }
  },
  {
    match: /criteres.?gamme.?sans.?garantie/i,
    entry: {
      section: "credilift",
      partner: "creatis",
      subsection: "critere",
      title: "Critères gamme sans garantie",
      tags: ["rac", "sans_garantie", "critere"],
      period: "2025-02"
    }
  }
];

/** Fallback : crée une entrée minimale pour tout fichier encore non mappé */
function inferEntryFromFilename(dl) {
  var lower = dl.toLowerCase();
  var section = "immo";
  var partner = null;
  var tags = [];
  if (/scpi/.test(lower)) {
    section = "scpi";
    tags.push("scpi");
  } else if (/pvh|viager/.test(lower)) {
    section = "pvh";
    tags.push("pvh");
  } else if (/hypo.?treso|hypothecaire.?de.?tresorerie|hypo.?treso/.test(lower)) {
    section = "hypo_treso";
    tags.push("hypo_treso");
  } else if (/renov|travaux/.test(lower)) {
    section = "renov";
    tags.push("renov");
  } else if (/\brac\b|regroupement|consolift|unilift|minilift|hypolift|normalift/.test(lower)) {
    section = "credilift";
    tags.push("rac");
  } else if (/treso|tresorerie|conso/.test(lower)) {
    section = "treso";
    tags.push("treso");
  } else if (/\bsci\b/.test(lower)) {
    section = "sci";
    tags.push("sci");
  }
  if (/cfcal/.test(lower)) partner = "cfcal";
  else if (/creatis/.test(lower)) partner = "creatis";
  else if (/sygma/.test(lower)) partner = "sygma";
  else if (/mmb|my.?money|my.?new.?treso|my.?simply|easy.?treso/.test(lower)) partner = "mmb";
  else if (/cml|municipal.?lyon/.test(lower)) partner = "cml";
  else if (/cmt/.test(lower)) partner = "cmt";
  else if (/bank.?b|griffon/.test(lower)) partner = /griffon/.test(lower) ? "griffon" : "bank_b";
  else if (/cib|cgi/.test(lower)) partner = "cgi";
  else if (/lift|cacf/.test(lower)) partner = "credilift";
  var title = stripCopy(dl)
    .replace(/\.pdf$/i, "")
    .replace(/---+/g, " — ")
    .replace(/--+/g, " — ")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return {
    section: section,
    partner: partner,
    subsection: "produit",
    title: title,
    tags: tags.length ? tags : ["import"],
    canonical: dl.replace(/\s+/g, "-"),
    aliases: [dl],
    kind: /dossier/i.test(lower) ? "dossier" : /flyer/i.test(lower) ? "flyer" : "fiche"
  };
}

let aliasAdds = 0;
let newAdds = 0;
const unmatched = [];

unique.forEach(function (dl) {
  let best = null;
  let bestScore = 0;
  manifest.files.forEach(function (f, idx) {
    const names = [f.canonical, f.title].concat(f.aliases || []);
    names.forEach(function (n) {
      const sc = tokenScore(dl, n);
      if (sc > bestScore) {
        bestScore = sc;
        best = idx;
      }
    });
  });

  if (best != null && bestScore >= 55) {
    const f = manifest.files[best];
    f.aliases = f.aliases || [];
    if (f.aliases.indexOf(dl) < 0 && f.canonical !== dl) {
      f.aliases.push(dl);
      aliasAdds++;
    }
    /* Prefer download filename as canonical if closer to reality and not already available path-style */
    if (!f.downloadName) f.downloadName = dl;
    return;
  }

  const def = NEW_DEFAULTS.find((d) => d.match.test(dl));
  if (def) {
    const e = Object.assign({}, def.entry, {
      canonical: dl.replace(/\s+/g, "-"),
      aliases: [dl]
    });
    /* avoid dup new */
    const exists = manifest.files.some((f) => norm(f.canonical) === norm(e.canonical) || norm(f.title) === norm(e.title));
    if (!exists) {
      manifest.files.push(e);
      newAdds++;
    }
    return;
  }

  const inferred = inferEntryFromFilename(dl);
  const existsInf = manifest.files.some(
    (f) => norm(f.canonical) === norm(inferred.canonical) || (inferred.title && norm(f.title) === norm(inferred.title))
  );
  if (!existsInf) {
    manifest.files.push(inferred);
    newAdds++;
  } else {
    unmatched.push(dl);
  }
});

manifest.downloadList = {
  source: "scripts/pret-fiches-download-list.txt",
  uniqueCount: unique.length,
  aliasAdds,
  newAdds,
  unmatched
};

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log(
  JSON.stringify(
    {
      uniqueDownloads: unique.length,
      aliasAdds,
      newAdds,
      totalManifest: manifest.files.length,
      unmatched: unmatched.length,
      unmatchedSample: unmatched.slice(0, 20)
    },
    null,
    2
  )
);
