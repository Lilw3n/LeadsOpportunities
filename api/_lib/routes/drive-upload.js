const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm } = require("../rbac");
const { getSql } = require("../db");
const { uploadTextFile, uploadBase64File } = require("../drive-upload-core");
const { subfolderForDocumentType } = require("../drive-folders");
const { UPLOAD_JSON_MAX_BYTES } = require("../upload-limits");
const { resolveOrCreateContact } = require("../resolve-upload-contact");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;

  const parsed = parseJsonBody(req, UPLOAD_JSON_MAX_BYTES);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};
  const fileName = body.fileName || body.name;
  if (!fileName) return res.status(400).json({ error: "fileName requis" });

  const documentType = body.documentType || "generic";
  const subfolder = body.subfolder || subfolderForDocumentType(documentType);
  var contactId = body.contactId || body.contact_id;
  var contactCreated = false;

  if (!contactId && body.email) {
    const sql = getSql();
    if (sql) {
      const resolved = await resolveOrCreateContact(sql, body);
      if (resolved.contact) {
        contactId = resolved.contact.id;
        contactCreated = resolved.created;
      }
    }
  }

  const common = {
    fileName: fileName,
    mimeType: body.mimeType,
    contactId: contactId,
    subfolder: subfolder,
    documentType: documentType,
    source: body.source || "crm_upload",
  };

  try {
    var result;
    if (body.fileBase64 || body.base64) {
      result = await uploadBase64File(
        Object.assign({}, common, {
          base64: body.fileBase64 || body.base64,
          mimeType: body.mimeType || "application/octet-stream",
        })
      );
    } else if (body.content && typeof body.content === "string") {
      result = await uploadTextFile(
        Object.assign({}, common, {
          content: body.content,
          mimeType: body.mimeType || "text/plain",
        })
      );
    } else {
      return res.status(400).json({ error: "fileBase64 ou content requis" });
    }
    return res.status(200).json(Object.assign({ contactId: contactId, contactCreated: contactCreated }, result));
  } catch (e) {
    return res.status(502).json({ ok: false, error: e.message });
  }
};
