/**
 * GET /api/auth/site-access — config publique pour auth.html (verrouillage juridique).
 */
const { applyApiGuards } = require("../security");
const {
  isSiteLegalLockEnabled,
  getVerifierSharedPassword,
} = require("../verifier-access");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  // Ne pas exposer le mdp en clair côté client en prod « ouverte » ;
  // pendant la revue on affiche le hint (mot de passe partagé volontaire).
  const lock = isSiteLegalLockEnabled();
  return res.status(200).json({
    ok: true,
    legalLock: lock,
    hintPassword: lock ? getVerifierSharedPassword() : null,
    verifierEmails: require("../verifier-access").getVerifierEmails(),
    message: lock
      ? "Le site est temporairement verrouillé. Seuls les comptes administrateur et les vérificateurs juridiques peuvent se connecter."
      : null,
  });
};
