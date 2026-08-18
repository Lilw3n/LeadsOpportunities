/**
 * Estimation immobilière à partir des DVF (Demandes de valeurs foncières — open data DGFiP).
 * Partagé entre build, API et tests.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DVF_DEPT_URL =
  "https://files.data.gouv.fr/geo-dvf/latest/csv/2024/departements/{dept}.csv.gz";
const SKIP_DEPTS = { 57: 1, 67: 1, 68: 1 }; // Alsace-Moselle : pas de DVF publique
const VALID_TYPES = { Maison: "maison", Appartement: "appartement" };
const TYPE_FROM_INPUT = {
  maison: "Maison",
  appartement: "Appartement",
  appart: "Appartement",
  house: "Maison",
  apartment: "Appartement",
};

function normalizeStreet(s) {
  return String(s || "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function haversineM(lat1, lon1, lat2, lon2) {
  var R = 6371000;
  var p = Math.PI / 180;
  var a =
    0.5 -
    Math.cos((lat2 - lat1) * p) / 2 +
    (Math.cos(lat1 * p) * Math.cos(lat2 * p) * (1 - Math.cos((lon2 - lon1) * p))) / 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function median(nums) {
  if (!nums.length) return null;
  var s = nums.slice().sort(function (a, b) {
    return a - b;
  });
  var m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function percentile(nums, p) {
  if (!nums.length) return null;
  var s = nums.slice().sort(function (a, b) {
    return a - b;
  });
  var idx = (s.length - 1) * p;
  var lo = Math.floor(idx);
  var hi = Math.ceil(idx);
  if (lo === hi) return s[lo];
  return s[lo] + (s[hi] - s[lo]) * (idx - lo);
}

function parseCsvLine(line) {
  var out = [];
  var cur = "";
  var q = false;
  for (var i = 0; i < line.length; i++) {
    var c = line[i];
    if (c === '"') {
      q = !q;
      continue;
    }
    if (c === "," && !q) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  out.push(cur);
  return out;
}

function parseDvfRow(cols, header) {
  var row = {};
  header.forEach(function (h, i) {
    row[h] = cols[i] != null ? cols[i] : "";
  });
  return row;
}

function isValidSale(row) {
  if (!row || !row.nature_mutation || row.nature_mutation.indexOf("Vente") !== 0) return false;
  var price = Number(row.valeur_fonciere);
  var surf = Number(row.surface_reelle_bati);
  if (!price || price < 10000 || !surf || surf < 9) return false;
  if (!VALID_TYPES[row.type_local]) return false;
  var m2 = price / surf;
  if (m2 < 400 || m2 > 20000) return false;
  return true;
}

function mutationKey(row) {
  return row.id_mutation || [row.date_mutation, row.valeur_fonciere, row.code_commune].join("|");
}

function ingestDvfText(text, onSale) {
  var lines = text.split(/\r?\n/);
  if (!lines.length) return 0;
  var header = parseCsvLine(lines[0]);
  var seen = {};
  var count = 0;
  for (var i = 1; i < lines.length; i++) {
    if (!lines[i]) continue;
    var cols = parseCsvLine(lines[i]);
    if (cols.length < header.length) continue;
    var row = parseDvfRow(cols, header);
    if (!isValidSale(row)) continue;
    var key = mutationKey(row);
    var surf = Number(row.surface_reelle_bati);
    if (seen[key] && seen[key] >= surf) continue;
    seen[key] = surf;
    onSale({
      id: key,
      date: row.date_mutation,
      price: Number(row.valeur_fonciere),
      surface: surf,
      type: VALID_TYPES[row.type_local],
      commune: row.code_commune,
      communeName: row.nom_commune,
      dept: row.code_departement,
      street: normalizeStreet(row.adresse_nom_voie),
      streetRaw: row.adresse_nom_voie,
      number: row.adresse_numero,
      lat: Number(row.latitude) || null,
      lng: Number(row.longitude) || null,
      rooms: Number(row.nombre_pieces_principales) || null,
      year: String(row.date_mutation || "").slice(0, 4),
    });
    count++;
  }
  return count;
}

function aggregateCommune(sales) {
  var byType = {};
  sales.forEach(function (s) {
    if (!byType[s.type]) byType[s.type] = [];
    byType[s.type].push(s);
  });
  var out = {};
  Object.keys(byType).forEach(function (ty) {
    var list = byType[ty];
    var m2 = list.map(function (s) {
      return s.price / s.surface;
    });
    var byYear = {};
    list.forEach(function (s) {
      if (!s.year) return;
      if (!byYear[s.year]) byYear[s.year] = [];
      byYear[s.year].push(s.price / s.surface);
    });
    var years = {};
    Object.keys(byYear).forEach(function (y) {
      years[y] = {
        count: byYear[y].length,
        medianM2: Math.round(median(byYear[y])),
      };
    });
    out[ty] = {
      count: list.length,
      medianM2: Math.round(median(m2)),
      p25M2: Math.round(percentile(m2, 0.25)),
      p75M2: Math.round(percentile(m2, 0.75)),
      medianPrice: Math.round(median(list.map(function (s) {
        return s.price;
      }))),
      byYear: years,
    };
  });
  return out;
}

function compactSale(s) {
  return {
    d: s.date,
    p: s.price,
    s: s.surface,
    t: s.type === "maison" ? "M" : "A",
    c: s.commune,
    st: s.street,
    n: s.number,
    lat: s.lat,
    lng: s.lng,
    y: s.year,
  };
}

function expandSale(c) {
  return {
    date: c.d,
    price: c.p,
    surface: c.s,
    type: c.t === "M" ? "maison" : "appartement",
    commune: c.c,
    street: c.st,
    number: c.n,
    lat: c.lat,
    lng: c.lng,
    year: c.y,
  };
}

async function geocodeBan(address, postalCode, city) {
  var q = [address, postalCode, city, "France"].filter(Boolean).join(" ");
  if (!q || q.length < 5) return null;
  var url = "https://api-adresse.data.gouv.fr/search/?q=" + encodeURIComponent(q) + "&limit=1";
  var res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) return null;
  var data = await res.json();
  var feat = data.features && data.features[0];
  if (!feat) return null;
  var props = feat.properties || {};
  var coords = feat.geometry && feat.geometry.coordinates;
  return {
    label: props.label,
    city: props.city,
    citycode: props.citycode,
    postcode: props.postcode,
    dept: props.depcode || (props.citycode ? props.citycode.slice(0, 2) : null),
    street: normalizeStreet(props.street || props.name),
    lat: coords ? coords[1] : null,
    lng: coords ? coords[0] : null,
    score: props.score || 0,
  };
}

function loadJson(rel) {
  var p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function pickComparables(sales, geo, type, surface, opts) {
  opts = opts || {};
  var minSurface = surface * (opts.surfaceBand || 0.75);
  var maxSurface = surface * (opts.surfaceBand ? 2 - opts.surfaceBand : 1.25);
  var pool = sales.filter(function (s) {
    if (s.type !== type) return false;
    if (surface && s.surface < minSurface) return false;
    if (surface && s.surface > maxSurface) return false;
    return true;
  });
  var ranked = [];
  pool.forEach(function (s) {
    var score = 0;
    var dist = null;
    if (geo.lat && geo.lng && s.lat && s.lng) {
      dist = haversineM(geo.lat, geo.lng, s.lat, s.lng);
    }
    if (geo.street && s.street && geo.street === s.street) score += 100;
    if (geo.commune && s.commune === geo.commune) score += 40;
    if (dist != null) {
      if (dist <= 300) score += 80;
      else if (dist <= 800) score += 50;
      else if (dist <= 1500) score += 25;
      else if (dist > 5000) score -= 20;
    }
    if (surface && Math.abs(s.surface - surface) <= surface * 0.1) score += 20;
    ranked.push({ sale: s, score: score, dist: dist });
  });
  ranked.sort(function (a, b) {
    return b.score - a.score;
  });
  return ranked.slice(0, opts.limit || 12);
}

function estimateFromComparables(comps, surface) {
  if (!comps.length) return null;
  var m2 = comps.map(function (c) {
    return c.sale.price / c.sale.surface;
  });
  var medM2 = median(m2);
  return {
    medianM2: Math.round(medM2),
    p25M2: Math.round(percentile(m2, 0.25)),
    p75M2: Math.round(percentile(m2, 0.75)),
    estimatedPrice: surface ? Math.round(medM2 * surface) : null,
    lowPrice: surface ? Math.round(percentile(m2, 0.25) * surface) : null,
    highPrice: surface ? Math.round(percentile(m2, 0.75) * surface) : null,
    sampleSize: comps.length,
  };
}

function confidenceLabel(method, sampleSize) {
  if (method === "street" && sampleSize >= 2) return "élevée";
  if (method === "proximity" && sampleSize >= 4) return "élevée";
  if (method === "proximity" && sampleSize >= 2) return "moyenne";
  if (method === "commune" && sampleSize >= 8) return "moyenne";
  return "indicative";
}

async function estimateProperty(input) {
  var typeKey = TYPE_FROM_INPUT[String(input.propertyType || "maison").toLowerCase()] || "Maison";
  var type = VALID_TYPES[typeKey];
  var surface = Number(input.surface) || Number(input.surfaceHabitable) || 0;
  var geo = await geocodeBan(input.address, input.postalCode, input.city);
  if (!geo) {
    return { ok: false, error: "adresse_introuvable", message: "Adresse non reconnue. Vérifiez rue, code postal et ville." };
  }

  var dept = geo.dept || (geo.citycode ? geo.citycode.slice(0, 2) : null);
  var france = loadJson("data/dvf-france-communes.json");
  var localRaw = dept === "54" ? loadJson("data/dvf-54-sales.json") : null;
  var sales = localRaw && localRaw.sales ? localRaw.sales.map(expandSale) : [];

  geo.commune = geo.citycode;
  var communeStats =
    france && france.communes && geo.citycode && france.communes[geo.citycode]
      ? france.communes[geo.citycode][type]
      : null;

  var method = "commune";
  var comps = [];

  if (sales.length) {
    var streetComps = pickComparables(
      sales.filter(function (s) {
        return s.commune === geo.citycode && geo.street && s.street === geo.street;
      }),
      geo,
      type,
      surface,
      { limit: 8, surfaceBand: 0.65 }
    );
    if (streetComps.length >= 2) {
      comps = streetComps;
      method = "street";
    } else {
      var near = pickComparables(
        sales.filter(function (s) {
          return s.commune === geo.citycode;
        }),
        geo,
        type,
        surface,
        { limit: 10, surfaceBand: 0.7 }
      ).filter(function (c) {
        return c.dist != null && c.dist <= 1500;
      });
      if (near.length >= 2) {
        comps = near;
        method = "proximity";
      } else if (near.length) {
        comps = near;
        method = "proximity";
      }
    }
  }

  var result = estimateFromComparables(
    comps.map(function (c) {
      return c;
    }),
    surface
  );

  if (!result && communeStats && communeStats.medianM2) {
    method = "commune";
    result = {
      medianM2: communeStats.medianM2,
      p25M2: communeStats.p25M2,
      p75M2: communeStats.p75M2,
      estimatedPrice: surface ? Math.round(communeStats.medianM2 * surface) : communeStats.medianPrice,
      lowPrice: surface && communeStats.p25M2 ? Math.round(communeStats.p25M2 * surface) : null,
      highPrice: surface && communeStats.p75M2 ? Math.round(communeStats.p75M2 * surface) : null,
      sampleSize: communeStats.count,
    };
  }

  if (!result) {
    return {
      ok: false,
      error: "donnees_insuffisantes",
      message: "Pas assez de ventes DVF pour cette zone. Contactez-nous pour une estimation sur place.",
      geo: geo,
      externalUrl:
        "https://explore.data.gouv.fr/fr/immobilier?onglet=carte&filtre=maison&code=" + encodeURIComponent(geo.citycode),
    };
  }

  var comparables = comps.slice(0, 6).map(function (c) {
    return {
      date: c.sale.date,
      price: c.sale.price,
      surface: c.sale.surface,
      priceM2: Math.round(c.sale.price / c.sale.surface),
      street: c.sale.streetRaw || c.sale.street,
      distanceM: c.dist != null ? Math.round(c.dist) : null,
      year: c.sale.year,
    };
  });

  return {
    ok: true,
    source: "DVF open data (actes notariés)",
    scope: dept === "54" ? "local_54" : "national_commune",
    method: method,
    confidence: confidenceLabel(method, result.sampleSize),
    geo: {
      label: geo.label,
      city: geo.city,
      citycode: geo.citycode,
      postcode: geo.postcode,
      dept: dept,
    },
    propertyType: type,
    surface: surface || null,
    estimate: result,
    communeStats: communeStats || null,
    comparables: comparables,
    disclaimer:
      "Estimation indicative basée sur les ventes déclarées (DVF), hors état du bien, travaux, garage, terrain extra. Une visite et une expertise restent indispensables pour fixer un prix de mise en vente.",
    sellerCta: "/landings/acheteur-immo.html?role=vendeur&ville=" + encodeURIComponent(geo.city || ""),
  };
}

module.exports = {
  DVF_DEPT_URL: DVF_DEPT_URL,
  SKIP_DEPTS: SKIP_DEPTS,
  normalizeStreet: normalizeStreet,
  haversineM: haversineM,
  ingestDvfText: ingestDvfText,
  aggregateCommune: aggregateCommune,
  compactSale: compactSale,
  expandSale: expandSale,
  geocodeBan: geocodeBan,
  estimateProperty: estimateProperty,
};
