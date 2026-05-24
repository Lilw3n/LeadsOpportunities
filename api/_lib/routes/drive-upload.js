const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm } = require("../rbac");
const { uploadTextFile } = require("../drive-upload-core");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;

  const parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};
  const fileName = body.fileName || body.name;
  if (!fileName) return res.status(400).json({ error: "fileName requis" });
  if (!body.content || typeof body.content !== "string") {
    return res.status(400).json({ error: "content texte requis pour upload simplifié" });
  }

  try {
    const result = await uploadTextFile({
      fileName: fileName,
      content: body.content,
      mimeType: body.mimeType || "text/plain",
      contactId: body.contactId || body.contact_id,
    });
    return res.status(200).json(result);
  } catch (e) {
    return res.status(502).json({ ok: false, error: e.message });
  }
};
