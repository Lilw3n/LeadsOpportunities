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
  }
];

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

  unmatched.push(dl);
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
