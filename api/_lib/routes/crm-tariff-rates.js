/**
 * GET /api/crm/tariff-rates?insurer=fma&product=vtc — bordereau assureur (FMA API ou mock)
 */
const { applyApiGuards } = require("../security");
const { requireCrm } = require("../rbac");
const tariffRegistry = require("../insurers/tariff-registry");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;

  const url = new URL(req.url, "http://localhost");
  const insurer = (url.searchParams.get("insurer") || "fma").toLowerCase();
  const product = url.searchParams.get("product") || "vtc";
  const zone = url.searchParams.get("zone") || "metropole";

  try {
    const result = await tariffRegistry.getInsurerRates(insurer, { product: product, zone: zone });
    return res.status(200).json({
      ok: true,
      insurers: tariffRegistry.listInsurers(),
      result: result,
    });
  } catch (e) {
    console.error("[crm/tariff-rates]", e);
    return res.status(500).json({ error: "Erreur chargement tarifs" });
  }
};
