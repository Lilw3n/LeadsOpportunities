const { generateResetCode, setCors } = require("../_lib/auth");

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: "JSON invalide" }); }
  }
  if (!body || !body.email) {
    return res.status(400).json({ error: "Email requis" });
  }

  const email = String(body.email).trim().toLowerCase();
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return res.status(500).json({ error: "Base de données non configurée" });

  try {
    const { neon } = require("@neondatabase/serverless");
    const sql = neon(dbUrl);

    const rows = await sql`SELECT id, email FROM users WHERE email = ${email}`;
    if (rows.length === 0) {
      return res.status(200).json({ ok: true, message: "Si un compte existe, un code a été envoyé." });
    }

    const code = generateResetCode();
    const expires = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    await sql`
      UPDATE users SET reset_code = ${code}, reset_code_expires = ${expires}, updated_at = now()
      WHERE email = ${email}
    `;

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const fromEmail = process.env.LEAD_FROM_EMAIL || "Leads Opportunities <onboarding@resend.dev>";
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: "Bearer " + resendKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromEmail,
          to: [email],
          subject: "Votre code de réinitialisation — Leads Opportunities",
          html:
            '<div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px">' +
            '<h2 style="color:#1e3a5f">Réinitialisation de mot de passe</h2>' +
            "<p>Votre code de réinitialisation est :</p>" +
            '<p style="font-size:32px;font-weight:700;letter-spacing:6px;color:#2563eb;text-align:center;margin:24px 0">' +
            code + "</p>" +
            "<p>Ce code expire dans 30 minutes.</p>" +
            '<p style="color:#94a3b8;font-size:13px">Si vous n\'avez pas demandé cette réinitialisation, ignorez cet email.</p>' +
            "</div>",
        }),
      });
    }

    return res.status(200).json({ ok: true, message: "Si un compte existe, un code a été envoyé." });
  } catch (e) {
    console.error("[auth/forgot-password]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
