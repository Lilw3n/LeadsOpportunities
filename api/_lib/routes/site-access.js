/**
 * GET /api/auth/site-access — état public pour auth.html (verrouillage juridique).
 * Ne jamais exposer mots de passe ni listes d'e-mails admin / vérificateurs.
 */
const { applyApiGuards } = require("../security");
const { isSiteLegalLockEnabled } = require("../verifier-access");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const lock = isSiteLegalLockEnabled();
  return res.status(200).json({
    ok: true,
    legalLock: lock,
    hintPassword: null,
    publicVerifierEmails: [],
    adminEmails: [],
    verifierEmails: [],
    message: lock
      ? "Le site est temporairement verrouillé. Connexion réservée aux administrateurs et vérificateurs autorisés."
      : null,
  });
};
