const { estimateProperty } = require("../../scripts/dvf-estimate-lib.cjs");

module.exports = function publicPropertyEstimate() {
  return async function handler(req, res) {
    if (req.method !== "GET" && req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    var body = req.method === "POST" ? req.body || {} : req.query || {};
    var address = body.address || body.street || body.adresse;
    var postalCode = body.postalCode || body.postal_code || body.cp;
    var city = body.city || body.ville;
    var propertyType = body.propertyType || body.type || "maison";
    var surface = body.surface || body.surfaceHabitable || body.surface_m2;

    if (!address && !city) {
      return res.status(400).json({
        ok: false,
        error: "missing_address",
        message: "Indiquez au minimum une adresse (rue + code postal + ville).",
      });
    }

    try {
      var result = await estimateProperty({
        address: address,
        postalCode: postalCode,
        city: city,
        propertyType: propertyType,
        surface: surface,
      });
      res.setHeader("Cache-Control", "public, max-age=3600");
      return res.status(result.ok ? 200 : 422).json(result);
    } catch (e) {
      console.error("property-estimate", e);
      return res.status(500).json({
        ok: false,
        error: "server_error",
        message: "Estimation temporairement indisponible.",
      });
    }
  };
};
