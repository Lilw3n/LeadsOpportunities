const { applyApiGuards } = require("../security");
const { requireCrm } = require("../rbac");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;

  const url = new URL(req.url, "http://localhost");
  const fileId = url.searchParams.get("fileId");
  if (!fileId) return res.status(400).json({ error: "fileId requis" });

  var token = process.env.GOOGLE_DRIVE_ACCESS_TOKEN;
  if (!token) {
    return res.status(200).json({
      ok: true,
      demo: true,
      text: "Mode démo — configurez GOOGLE_DRIVE_ACCESS_TOKEN. Contenu exemple RIB pour test IA.",
    });
  }

  try {
    var metaUrl = "https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(fileId) + "?fields=name,mimeType";
    var metaResp = await fetch(metaUrl, { headers: { Authorization: "Bearer " + token } });
    if (!metaResp.ok) throw new Error("Meta " + metaResp.status);
    var meta = await metaResp.json();

    var exportMime = "text/plain";
    if (meta.mimeType && meta.mimeType.indexOf("google-apps") >= 0) {
      var exportUrl =
        "https://www.googleapis.com/drive/v3/files/" +
        encodeURIComponent(fileId) +
        "/export?mimeType=" +
        encodeURIComponent(exportMime);
      var expResp = await fetch(exportUrl, { headers: { Authorization: "Bearer " + token } });
      var text = await expResp.text();
      return res.status(200).json({ ok: true, name: meta.name, mimeType: meta.mimeType, text: text.slice(0, 50000) });
    }

    var mediaUrl = "https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(fileId) + "?alt=media";
    var mediaResp = await fetch(mediaUrl, { headers: { Authorization: "Bearer " + token } });
    var buf = await mediaResp.arrayBuffer();
    var text = new TextDecoder("utf-8", { fatal: false }).decode(buf);
    return res.status(200).json({
      ok: true,
      name: meta.name,
      mimeType: meta.mimeType,
      text: text.slice(0, 50000),
      note: "Extraction texte brute — PDF scanné nécessite OCR",
    });
  } catch (e) {
    return res.status(502).json({ ok: false, error: e.message });
  }
};
