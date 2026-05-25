/**
 * GET /api/drive/files — liste Drive (stub si non configuré)
 */
const { applyApiGuards } = require("../security");
const { requireCrm } = require("../rbac");

const { getDriveAccessToken, getRootFolderId, isDriveConfigured } = require("../google-drive-auth");

async function listDriveFiles() {
  const auth = await getDriveAccessToken();
  var token = auth ? auth.accessToken : null;
  var folderId = getRootFolderId();
  if (!token || !isDriveConfigured()) return { configured: false, files: [] };

  var q = folderId ? "mimeType!='application/vnd.google-apps.folder' and '" + folderId + "' in parents" : "mimeType!='application/vnd.google-apps.folder'";
  var url =
    "https://www.googleapis.com/drive/v3/files?q=" +
    encodeURIComponent(q) +
    "&pageSize=20&fields=files(id,name,mimeType,modifiedTime)&orderBy=modifiedTime desc";
  var resp = await fetch(url, { headers: { Authorization: "Bearer " + token } });
  if (!resp.ok) {
    var err = await resp.text();
    throw new Error("Drive API " + resp.status + ": " + err.slice(0, 150));
  }
  var data = await resp.json();
  return { configured: true, files: data.files || [] };
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;

  try {
    var result = await listDriveFiles();
    if (!result.configured) {
      return res.status(200).json({
        ok: true,
        configured: false,
        message: "Configurez Drive — voir docs/DRIVE-SETUP.md",
        demoFiles: [
          { id: "demo-rib", name: "RIB_client_dupont.pdf", mimeType: "application/pdf" },
          { id: "demo-cg", name: "Carte_grise_AB123CD.pdf", mimeType: "application/pdf" },
        ],
      });
    }
    return res.status(200).json({ ok: true, configured: true, files: result.files });
  } catch (e) {
    return res.status(502).json({ ok: false, error: e.message });
  }
};
