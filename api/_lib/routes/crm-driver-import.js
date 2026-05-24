/**
 * POST /api/crm/driver-import — extraction conducteur (inspire geminiImport.ts multisite).
 */
const { applyApiGuards } = require("../security");
const { requireCrm } = require("../rbac");
const { generateWithFallback } = require("../ai-provider-router");

const PROMPT =
  "Tu es un extracteur CRM assurance. Analyse le texte et réponds UNIQUEMENT en JSON valide avec cette structure:\n" +
  '{"personalInfo":{"firstName":"","lastName":"","email":"","phone":"","address":"","licenseNumber":"","licenseObtainedDate":""},' +
  '"insurancePeriods":[{"startDate":"","endDate":"","company":"","policyNumber":"","premium":0,"crmCoefficient":1,"status":"Actif"}],' +
  '"insuranceGaps":[{"startDate":"","endDate":"","reason":"autre","description":""}],' +
  '"claims":[{"date":"","type":"materialRC100","description":"","amount":0,"responsibility":0,"insurer":""}]}\n' +
  "Texte:\n";

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;

  let body = {};
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  } catch (e) {
    return res.status(400).json({ error: "JSON invalide" });
  }

  const text = (body.text || "").trim();
  if (text.length < 40) {
    return res.status(400).json({ error: "Texte trop court (min 40 caractères)" });
  }

  const ai = await generateWithFallback(PROMPT + text.slice(0, 12000));
  if (!ai.success) {
    return res.status(502).json({ ok: false, error: ai.error || "IA indisponible" });
  }

  var raw = ai.text || "";
  var jsonStart = raw.indexOf("{");
  var jsonEnd = raw.lastIndexOf("}");
  if (jsonStart < 0 || jsonEnd <= jsonStart) {
    return res.status(422).json({ ok: false, error: "Réponse IA non JSON", raw: raw.slice(0, 500) });
  }

  try {
    var data = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
    var errors = [];
    if (!data.personalInfo || !data.personalInfo.lastName) errors.push("Nom manquant");
    if (!data.personalInfo || !data.personalInfo.licenseNumber) errors.push("N° permis manquant");
    return res.status(200).json({
      ok: true,
      data: data,
      validation: { isValid: errors.length === 0, errors: errors, warnings: [] },
      provider: ai.provider,
    });
  } catch (e) {
    return res.status(422).json({ ok: false, error: "JSON IA invalide" });
  }
};
