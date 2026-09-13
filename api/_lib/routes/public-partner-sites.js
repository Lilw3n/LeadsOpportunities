const { applyApiGuards } = require("../security");
const { getPublicPartnerSites } = require("../partner-sites-store");

module.exports = async function publicPartnerSites(req, res) {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const catalog = await getPublicPartnerSites();
    res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=120");
    return res.status(200).json({ ok: true, catalog: catalog });
  } catch (e) {
    console.error("[partner-sites public]", e);
    return res.status(500).json({ error: "Impossible de charger les sites partenaires." });
  }
};
