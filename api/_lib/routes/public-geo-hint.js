/**
 * GET /api/geo-hint — pays détecté (en-têtes edge) pour ciblage France côté client.
 */
const { applyApiGuards } = require("../security");
const { getVisitorCountry, isFranceAudience } = require("../geo-france");

module.exports = function publicGeoHint(req, res) {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  var country = getVisitorCountry(req);
  var inFrance = isFranceAudience(country);
  var audience = country ? (inFrance ? "france" : "foreign") : "unknown";

  res.setHeader("Cache-Control", "private, max-age=300");
  return res.status(200).json({
    ok: true,
    country: country,
    inFrance: inFrance,
    audience: audience,
    serviceArea: "France métropolitaine et DOM-TOM",
  });
};
