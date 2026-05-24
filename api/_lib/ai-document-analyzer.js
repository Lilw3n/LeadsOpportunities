/**
 * Analyse documentaire IA — Gemini + fallback OpenAI (multisite providerRouter)
 */
const { generateWithFallback } = require("./ai-provider-router");

const DOC_TYPES = [
  "bank_details",
  "vehicle_info",
  "driver_info",
  "contract_info",
  "claim_info",
  "generic",
];

function extractJson(text) {
  try {
    const fenced = String(text).match(/```(?:json)?\n([\s\S]*?)```/i);
    const raw = fenced ? fenced[1] : text;
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    const candidate = start !== -1 && end !== -1 ? raw.slice(start, end + 1) : raw;
    return JSON.parse(candidate);
  } catch (e) {
    return {
      type: "generic",
      extractedData: {},
      confidence: 0.5,
      suggestions: ["Impossible de parser la réponse JSON"],
    };
  }
}

function buildPrompt(documentType, textContent) {
  return (
    "Extrais les informations pertinentes de ce document au format JSON.\n\n" +
    "Type: " +
    documentType +
    "\nContenu: " +
    String(textContent).substring(0, 10000) +
    "\n\nJSON requis:\n{\n  \"type\": \"" +
    documentType +
    "\",\n  \"extractedData\": {},\n  \"confidence\": 0.95,\n  \"suggestions\": []\n}\n\n" +
    "Extrais: IBAN, BIC, immatriculation, permis, dates, montants, noms, adresses. Réponds uniquement en JSON valide."
  );
}

async function analyzeFromText(text, documentType) {
  const type = DOC_TYPES.indexOf(documentType) >= 0 ? documentType : "generic";
  const gen = await generateWithFallback(buildPrompt(type, String(text).slice(0, 15000)));
  if (!gen.success) return { success: false, error: gen.error };
  const parsed = extractJson(gen.text);
  return {
    success: true,
    data: {
      type: parsed.type || type,
      extractedData: parsed.extractedData || {},
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.75,
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      provider: gen.provider,
    },
  };
}

async function summarizeDocument(text) {
  const prompt =
    "Résume ce document assurance en français (3-5 phrases). Liste les points clés et actions conseillées.\n\n" +
    String(text).slice(0, 12000);
  const gen = await generateWithFallback(prompt);
  if (!gen.success) return { success: false, error: gen.error };
  return { success: true, summary: gen.text, provider: gen.provider };
}

async function askQuestionAboutDocument(text, question) {
  if (!question || !String(question).trim()) {
    return { success: false, error: "Question requise" };
  }
  const prompt =
    "Document:\n" +
    String(text).slice(0, 12000) +
    "\n\nQuestion: " +
    String(question).trim() +
    "\n\nRéponds en français de façon précise et concise.";
  const gen = await generateWithFallback(prompt);
  if (!gen.success) return { success: false, error: gen.error };
  return { success: true, answer: gen.text, provider: gen.provider };
}

async function batchAnalyze(items) {
  const results = [];
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var r = await analyzeFromText(item.text || "", item.documentType || "generic");
    results.push({ index: i, id: item.id || String(i), ...r });
  }
  return { success: true, results: results };
}

async function batchSummarize(items) {
  const results = [];
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var r = await summarizeDocument(item.text || "");
    results.push({ index: i, id: item.id || String(i), ...r });
  }
  return { success: true, results: results };
}

module.exports = {
  analyzeFromText,
  summarizeDocument,
  askQuestionAboutDocument,
  batchAnalyze,
  batchSummarize,
  DOC_TYPES,
};
