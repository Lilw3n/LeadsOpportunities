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
  const folder = url.searchParams.get("path") || "";

  try {
    var result = await localDrive.listFiles(folder);
    if (!result.configured) {
      return res.status(200).json({
        ok: true,
        configured: false,
        message: "LOCAL_DRIVE_PATH non configuré (fonctionne en local/dev uniquement)",
        demoFiles: [
          { name: "RIB_client.pdf", path: "demo/RIB_client.pdf", isDirectory: false },
          { name: "Carte_grise.pdf", path: "demo/Carte_grise.pdf", isDirectory: false },
        ],
      });
    }
    return res.status(200).json({ ok: true, ...result });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
};
