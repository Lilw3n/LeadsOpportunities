const jwt = require("jsonwebtoken");
const { requireJwtSecret } = require("./security");

const ISSUER = "leads-opportunities-upload";
const DEFAULT_EXPIRY = "72h";

function createUploadToken(payload) {
  var email = payload.email ? String(payload.email).trim().toLowerCase() : "";
  if (!email) throw new Error("email requis pour le token upload");
  return jwt.sign(
    {
      scope: "client_upload",
      email: email,
      contactId: payload.contactId || null,
      leadId: payload.leadId || null,
      need: payload.need || payload.vertical || null,
    },
    requireJwtSecret(),
    { expiresIn: payload.expiresIn || DEFAULT_EXPIRY, algorithm: "HS256", issuer: ISSUER }
  );
}

function verifyUploadToken(token) {
  if (!token) return null;
  try {
    var decoded = jwt.verify(token, requireJwtSecret(), {
      algorithms: ["HS256"],
      issuer: ISSUER,
    });
    if (!decoded || decoded.scope !== "client_upload" || !decoded.email) return null;
    return decoded;
  } catch (e) {
    return null;
  }
}

function tokenMatchesBody(decoded, body) {
  if (!decoded) return false;
  var email = body.email ? String(body.email).trim().toLowerCase() : "";
  if (email && decoded.email !== email) return false;
  var contactId = body.contactId || body.contact_id || null;
  if (contactId && decoded.contactId && decoded.contactId !== contactId) return false;
  var leadId = body.leadId || body.lead_id || null;
  if (leadId && decoded.leadId && decoded.leadId !== leadId) return false;
  return true;
}

function extractUploadToken(req, body) {
  body = body || {};
  return (
    body.uploadToken ||
    body.upload_token ||
    (req.headers["x-upload-token"] ? String(req.headers["x-upload-token"]) : null)
  );
}

module.exports = {
  createUploadToken: createUploadToken,
  verifyUploadToken: verifyUploadToken,
  tokenMatchesBody: tokenMatchesBody,
  extractUploadToken: extractUploadToken,
};
