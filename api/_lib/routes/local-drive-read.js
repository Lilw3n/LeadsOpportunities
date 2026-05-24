const { applyApiGuards } = require("../security");
const { requireCrm } = require("../rbac");
const localDrive = require("../local-drive");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;

  const url = new URL(req.url, "http://localhost");
  const filePath = url.searchParams.get("path");
  if (!filePath) return res.status(400).json({ error: "path requis" });

  try {
    var result = await localDrive.readFile(filePath);
    if (!result.configured) {
      return res.status(200).json({
        ok: true,
        demo: true,
        content: "IBAN FR76 1234 5678 9012 3456 7890 123\nBIC AGRIFRPP\nTitulaire: DUPONT Jean",
      });
    }
    if (result.error) return res.status(400).json({ error: result.error });
    return res.status(200).json({ ok: true, ...result });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
};
