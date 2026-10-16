/**
 * Résumé d'appel courtage — sans audio Free.
 * Freebox : métadonnées (numéro, durée, sens) uniquement, lues côté navigateur.
 * Le texte vient d'un transcript WithAllo ou d'un collage après information du correspondant.
 */
var { normalizePhone } = require("./lead-enrichment");

var METIERS = [
  { id: "garage", label: "Garage et négociant auto", need: "rc-pro", words: ["garage", "negociant", "négociant", "carrosserie", "vehicules en depot", "véhicules en dépôt", "atelier"] },
  { id: "mrp", label: "Multirisque professionnelle", need: "mrp", words: ["multirisque", "mrp", "perte d'exploitation", "perte d’exploitation", "locaux pro"] },
  { id: "decennale", label: "Décennale", need: "decennale", words: ["decennale", "décennale", "dommage ouvrage", "garantie decennale"] },
  { id: "metiers-batiment", label: "Métiers du bâtiment", need: "decennale", words: ["macon", "maçon", "couvreur", "plombier", "electricien", "électricien", "batiment", "bâtiment", "chantier"] },
  { id: "transport-logistique", label: "Transport et logistique", need: "rc-pro", words: ["logistique", "marchandise", "entrepot", "entrepôt", "commissionnaire", "poids lourd"] },
  { id: "transport-voyageurs", label: "Transport de voyageurs", need: "rc-pro", words: ["autocar", "transport scolaire", "navette", "voyageurs", "transport en commun"] },
  { id: "collective", label: "Santé collective", need: "collective", words: ["mutuelle collective", "sante collective", "santé collective", "salaries", "salariés", "due"] },
  { id: "flotte", label: "Flotte de véhicules", need: "flotte", words: ["flotte", "parc auto", "parc de vehicules", "parc de véhicules"] },
  { id: "dirigeant", label: "Assurance dirigeant", need: "dirigeant", words: ["homme cle", "homme clé", "dirigeant", "mandataire social"] },
  { id: "tns", label: "Prévoyance TNS", need: "tns", words: ["tns", "travailleur non salarie", "travailleur non salarié", "prevoyance independant", "prévoyance indépendant"] },
  { id: "pj-pro", label: "Protection juridique pro", need: "pj-pro", words: ["protection juridique", "pj pro"] },
  { id: "credit-pro", label: "Crédit professionnel", need: "credit-pro", words: ["credit pro", "crédit pro", "tresorerie", "trésorerie", "financement materiel", "financement matériel"] },
  { id: "instrument", label: "Instrument de musique", need: "instrument", words: ["guitare", "piano", "violon", "instrument", "musicien"] },
  { id: "materiel-photo", label: "Matériel photo", need: "materiel-photo", words: ["appareil photo", "reflex", "objectif", "materiel photo", "matériel photo"] },
  { id: "bateau", label: "Bateau de plaisance", need: "bateau", words: ["bateau", "voilier", "semi-rigide", "plaisance"] },
  { id: "caravane", label: "Caravane et camping-car", need: "caravane", words: ["caravane", "camping-car", "camping car", "van amenage", "van aménagé"] },
  { id: "scolaire", label: "Assurance scolaire", need: "famille", words: ["assurance scolaire", "extra-scolaire", "extrascolaire", "sortie scolaire"] },
  { id: "moto-collection", label: "Moto et collection", need: "moto", words: ["moto", "collection", "vehicule ancien", "véhicule ancien"] },
  { id: "drone-pro", label: "Drone professionnel", need: "rc-pro", words: ["drone", "telepilote", "télépilote"] },
  { id: "association", label: "Association", need: "rc-pro", words: ["association", "loi 1901", "benevoles", "bénévoles"] },
  { id: "piscine", label: "Piscine", need: "habitation", words: ["piscine", "spa"] },
  { id: "apiculture", label: "Apiculture", need: "rc-pro", words: ["ruche", "apiculteur", "apiculture"] },
  { id: "foret", label: "Forêt", need: "autre", words: ["foret", "forêt", "parcelle boisee", "parcelle boisée"] },
  { id: "collection", label: "Collection et objets d'art", need: "autre", words: ["objets d'art", "objets d’art", "cave a vin", "cave à vin", "montre de collection"] },
  { id: "temporaire", label: "Assurance temporaire", need: "temporaire", words: ["temporaire", "quelques jours", "immatriculation temporaire"] },
  { id: "vtc", label: "VTC", need: "vtc", words: ["vtc", "uber", "bolt", "heetch"] },
  { id: "rc-pro", label: "RC Pro", need: "rc-pro", words: ["rc pro", "responsabilite civile pro", "responsabilité civile pro"] },
];

var AUDIO_NOTE =
  "Free ne fournit pas l'enregistrement. Le texte vient de WithAllo ou d'un collage, après information du correspondant.";

function fold(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function detectMetier(text) {
  var low = fold(text);
  var best = null;
  var bestScore = 0;
  METIERS.forEach(function (m) {
    var score = 0;
    m.words.forEach(function (w) {
      if (low.indexOf(fold(w)) >= 0) score += fold(w).length;
    });
    if (score > bestScore) {
      best = m;
      bestScore = score;
    }
  });
  if (!best) return null;
  return { id: best.id, label: best.label, need: best.need };
}

function nextStepFor(metier, text) {
  var low = fold(text);
  if (/rappel|rappeler|recontacter|a rappeler/.test(low)) {
    return "Noter le rappel promis et l'heure, puis rouvrir la fiche.";
  }
  if (/devis|tarif|prix|cotisation/.test(low) && metier) {
    return "Ouvrir le questionnaire " + metier.label + " sans chiffrer tant que l'activité n'est pas décrite.";
  }
  if (metier) return "Rattacher l'appel au parcours " + metier.label + " et lister les pièces manquantes.";
  return "Qualifier le métier, l'échéance et un moyen de recontact avant tout devis.";
}

function clip(text, max) {
  var t = String(text || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trim() + "…";
}

function hasConsent(input) {
  if (!input) return false;
  if (input.consent === true) return true;
  return input.consentSource === "withallo";
}

function normalizeFreeboxEntry(entry) {
  if (!entry || typeof entry !== "object") return null;
  var type = fold(entry.type || entry.direction || "");
  var direction = "entrant";
  if (/out|sortant|emitted/.test(type)) direction = "sortant";
  else if (/miss|manque|absent/.test(type)) direction = "manque";
  var started = entry.datetime || entry.startedAt || entry.date || null;
  if (typeof started === "number") {
    var ms = started < 1e12 ? started * 1000 : started;
    started = new Date(ms).toISOString();
  }
  var phone = String(entry.number || entry.phone || entry.num || "").trim();
  var duration = Number(entry.duration || entry.duree || 0);
  if (!phone && !duration && !started) return null;
  return {
    id: entry.id || null,
    phone: phone,
    phoneNorm: normalizePhone(phone),
    duration: isFinite(duration) ? duration : 0,
    direction: direction,
    startedAt: started ? String(started) : null,
    name: entry.name && entry.name !== phone ? String(entry.name).slice(0, 120) : "",
  };
}

function normalizeFreeboxLog(raw) {
  var list = [];
  if (Array.isArray(raw)) list = raw;
  else if (raw && Array.isArray(raw.result)) list = raw.result;
  else if (raw && typeof raw === "object") list = [raw];
  var out = [];
  list.slice(0, 50).forEach(function (entry) {
    var row = normalizeFreeboxEntry(entry);
    if (row) out.push(row);
  });
  return out;
}

function pickFreeboxCall(calls, phone) {
  if (!calls || !calls.length) return null;
  var want = normalizePhone(phone);
  if (want) {
    var hit = calls.filter(function (c) {
      return c.phoneNorm && c.phoneNorm.slice(-9) === want.slice(-9);
    });
    if (hit.length) return hit[0];
  }
  return calls[0];
}

function phonesMatch(a, b) {
  var na = normalizePhone(a);
  var nb = normalizePhone(b);
  if (!na || !nb) return false;
  return na.slice(-9) === nb.slice(-9);
}

function summarizeCallLocal(input) {
  var src = input || {};
  var transcript = String(src.transcript || src.text || "").slice(0, 20000);
  var metier = detectMetier(transcript);
  var free = src.free || null;
  var bits = [];
  if (transcript) bits.push(clip(transcript, 420));
  else bits.push("Pas de transcript : seul le journal Free (numéro, sens, durée) est connu.");
  if (metier) bits.push("Métier repéré : " + metier.label + ".");
  if (free && (free.phone || free.duration)) {
    var duree = free.duration ? free.duration + " s" : "durée inconnue";
    bits.push("Journal Free : appel " + (free.direction || "entrant") + ", " + duree + ".");
  }
  var step = nextStepFor(metier, transcript);
  bits.push(step);
  return {
    ok: true,
    provider: "local",
    audio: false,
    note: AUDIO_NOTE,
    summary: bits.join(" "),
    metier: metier,
    nextStep: step,
    consentSource: src.consentSource || (src.consent === true ? "crm" : ""),
  };
}

function parseAiJson(text) {
  try {
    var raw = String(text || "");
    var fenced = raw.match(/```(?:json)?\n([\s\S]*?)```/i);
    if (fenced) raw = fenced[1];
    var start = raw.indexOf("{");
    var end = raw.lastIndexOf("}");
    if (start < 0 || end < start) return null;
    return JSON.parse(raw.slice(start, end + 1));
  } catch (e) {
    return null;
  }
}

function buildAiPrompt(transcript, local) {
  return (
    "Tu résumes un appel de courtage assurance en France pour un CRM. " +
    "N'invente aucun prix, aucune garantie, aucun plafond. " +
    "Si le métier n'est pas dit, laisse metierId vide. " +
    "Réponds uniquement en JSON : " +
    '{"summary":"4 phrases max","nextStep":"une action","metierId":""}\n' +
    "Métier déjà repéré : " +
    (local.metier ? local.metier.id : "aucun") +
    "\nTranscript :\n" +
    clip(transcript, 8000)
  );
}

async function summarizeCall(input) {
  var src = input || {};
  if (!hasConsent(src)) {
    return {
      ok: false,
      error: "Consentement requis : le correspondant doit avoir été informé que l'appel peut être transcrit.",
      audio: false,
    };
  }
  var local = summarizeCallLocal(src);
  var transcript = String(src.transcript || src.text || "");
  if (!src.useAi || !transcript.trim()) return local;
  var hasKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.OPENAI_API_KEY;
  if (!hasKey) return local;
  try {
    var gen = await require("./ai-provider-router").generateWithFallback(buildAiPrompt(transcript, local), 700);
    if (!gen.success) return local;
    var parsed = parseAiJson(gen.text);
    if (!parsed || !parsed.summary) return local;
    var metier = local.metier;
    if (!metier && parsed.metierId) {
      var found = METIERS.filter(function (m) {
        return m.id === String(parsed.metierId).trim();
      })[0];
      if (found) metier = { id: found.id, label: found.label, need: found.need };
    }
    return {
      ok: true,
      provider: gen.provider || "ai",
      audio: false,
      note: AUDIO_NOTE,
      summary: clip(parsed.summary, 1200),
      metier: metier,
      nextStep: clip(parsed.nextStep || local.nextStep, 300),
      consentSource: local.consentSource,
      localSummary: local.summary,
    };
  } catch (e) {
    return local;
  }
}

module.exports = {
  METIERS: METIERS,
  AUDIO_NOTE: AUDIO_NOTE,
  hasConsent: hasConsent,
  detectMetier: detectMetier,
  normalizeFreeboxLog: normalizeFreeboxLog,
  pickFreeboxCall: pickFreeboxCall,
  phonesMatch: phonesMatch,
  summarizeCallLocal: summarizeCallLocal,
  summarizeCall: summarizeCall,
};
