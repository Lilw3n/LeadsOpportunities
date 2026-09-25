/**
 * GET /api/auth/site-access — config publique pour auth.html (verrouillage juridique).
 */
const { applyApiGuards } = require("../security");
const { getAdminEmails } = require("../admin-emails");
const {
  isSiteLegalLockEnabled,
  getVerifierSharedPassword,
  getPublicVerifierEmails,
  getVerifierEmails,
} = require("../verifier-access");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const lock = isSiteLegalLockEnabled();
  return res.status(200).json({
    ok: true,
    legalLock: lock,
    hintPassword: lock ? getVerifierSharedPassword() : null,
    publicVerifierEmails: getPublicVerifierEmails(),
    adminEmails: getAdminEmails(),
    verifierEmails: getVerifierEmails(),
    message: lock
      ? "Le site est temporairement verrouillé. Seuls les administrateurs et les vérificateurs juridiques (@immobilier.email) peuvent se connecter."
      : null,
  });
};
