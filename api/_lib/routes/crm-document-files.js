/**
 * GET /api/crm/document-files — métadonnées dépôts Drive / o2switch
 */
const { applyApiGuards } = require("../security");
const { requireCrm } = require("../rbac");
const { listDocumentFiles } = require("../document-files");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;

  const url = new URL(req.url, "http://localhost");
  const contactId = url.searchParams.get("contactId") || url.searchParams.get("id");
  const limit = url.searchParams.get("limit");

  try {
    const result = await listDocumentFiles({ contactId: contactId, limit: limit });
    if (!result.ok) {
      return res.status(200).json({ ok: false, files: [], error: result.error });
    }
    return res.status(200).json({ ok: true, files: result.files });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
};
