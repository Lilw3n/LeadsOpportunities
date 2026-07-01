/**
 * Clusters mots-clés SEO/SEA — source : seo/keyword-clusters-seo-sea.csv
 */
const fs = require("fs");
const path = require("path");

const CSV_PATH = path.join(__dirname, "..", "seo", "keyword-clusters-seo-sea.csv");

let _cache = null;

function parseCsvLine(line) {
  var out = [];
  var cur = "";
  var inQ = false;
  for (var i = 0; i < line.length; i++) {
    var c = line[i];
    if (c === '"') {
      inQ = !inQ;
      continue;
    }
    if (c === "," && !inQ) {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += c;
  }
  out.push(cur.trim());
  return out;
}

function loadClusters() {
  if (_cache) return _cache;
  var raw = fs.readFileSync(CSV_PATH, "utf8");
  var lines = raw.split(/\r?\n/).filter(function (l) {
    return l.trim() && !l.startsWith("verticale");
  });
  _cache = lines.map(function (line) {
    var cols = parseCsvLine(line);
    return {
      verticale: cols[0] || "",
      intention: cols[1] || "",
      mot_cle_principal: cols[2] || "",
      mots_cles_secondaires: (cols[3] || "").split("|").filter(Boolean),
      type_page: cols[4] || "",
      priorite: cols[5] || "moyenne",
    };
  });
  return _cache;
}

function keywordsForVertical(verticale, options) {
  options = options || {};
  var rows = loadClusters().filter(function (r) {
    return r.verticale === verticale;
  });
  if (options.intention) {
    rows = rows.filter(function (r) {
      return r.intention === options.intention;
    });
  }
  if (options.priorite) {
    rows = rows.filter(function (r) {
      return r.priorite === options.priorite;
    });
  }
  var out = [];
  rows.forEach(function (r) {
    if (r.mot_cle_principal) out.push(r.mot_cle_principal);
    out = out.concat(r.mots_cles_secondaires);
  });
  return dedupe(out);
}

function keywordsForTheme(theme) {
  var map = {
    vtc: "vtc",
    sante: "sante",
    credit: "credit_immo",
    emprunteur: "emprunteur",
    auto: "auto",
    habitation: "habitation",
    animaux: "animaux",
    prevoyance: "prevoyance",
    chien: "animaux",
    chat: "animaux",
    chasse: "chasse",
    equitation: "equitation",
  };
  var v = map[theme] || theme;
  var kws = keywordsForVertical(v);
  if (!kws.length) {
    kws = keywordsForVertical("transversal");
  }
  return kws;
}

function dedupe(arr) {
  var seen = {};
  return arr.filter(function (x) {
    var k = x.toLowerCase();
    if (seen[k]) return false;
    seen[k] = true;
    return true;
  });
}

function metaKeywordsString(keywords, max) {
  max = max || 12;
  return dedupe(keywords || [])
    .slice(0, max)
    .join(", ");
}

function enrichDescription(desc, keywords) {
  if (!keywords || !keywords.length) return desc;
  var extra = keywords.slice(0, 4).join(", ");
  if (desc.toLowerCase().indexOf(keywords[0].toLowerCase()) >= 0) return desc;
  return desc + " Mots-cles : " + extra + ".";
}

module.exports = {
  loadClusters,
  keywordsForVertical,
  keywordsForTheme,
  metaKeywordsString,
  enrichDescription,
  dedupe,
};
