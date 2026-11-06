/**
 * Router IA multi-provider — inspire providerRouter.ts multisite
 */
async function callGeminiGenerate(prompt, maxTokens) {
  var key = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  if (!key) return { success: false, error: "gemini: clé API manquante" };
  var url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
    encodeURIComponent(key);
  var resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: maxTokens || 2048 },
    }),
  });
  if (!resp.ok) {
    return { success: false, error: "gemini: HTTP " + resp.status };
  }
  var data = await resp.json();
  var text =
    data.candidates &&
    data.candidates[0] &&
    data.candidates[0].content &&
    data.candidates[0].content.parts &&
    data.candidates[0].content.parts[0] &&
    data.candidates[0].content.parts[0].text;
  if (!text) return { success: false, error: "gemini: réponse vide" };
  return { success: true, text: text.trim(), provider: "gemini" };
}

async function callOpenAIGenerate(prompt, maxTokens) {
  var key = process.env.OPENAI_API_KEY || "";
  if (!key) return { success: false, error: "openai: clé API manquante" };
  var model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  var resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: maxTokens || 2048,
    }),
  });
  if (!resp.ok) {
    return { success: false, error: "openai: HTTP " + resp.status };
  }
  var data = await resp.json();
  var text = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  if (!text) return { success: false, error: "openai: réponse vide" };
  return { success: true, text: text.trim(), provider: "openai" };
}

async function generateWithFallback(prompt, maxTokens) {
  var order = (process.env.AI_PROVIDER_ORDER || "gemini,openai")
    .split(",")
    .map(function (s) {
      return s.trim();
    });
  var providers = {
    gemini: callGeminiGenerate,
    openai: callOpenAIGenerate,
  };
  var lastError = "";
  for (var i = 0; i < order.length; i++) {
    var fn = providers[order[i]];
    if (!fn) continue;
    var res = await fn(prompt, maxTokens);
    if (res.success) return res;
    lastError = res.error || order[i] + ": échec";
  }
  return { success: false, error: lastError || "Aucun provider IA disponible" };
}

module.exports = { generateWithFallback, callGeminiGenerate, callOpenAIGenerate };
