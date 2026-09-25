const { randomUUID } = require("crypto");
const { signToken, hashPassword } = require("../auth");
const { applyApiGuards } = require("../security");
const {
  isGoogleConfigured,
  verifyOAuthState,
  exchangeCodeForTokens,
  fetchGoogleProfile,
  getAppUrl,
} = require("../google-oauth");
const { getSql } = require("../db");
const { ensureCalendarSchema } = require("../ensure-schema");
const { upsertContactGoogle, makeExtToken, safeReturnPath } = require("../external-client-auth");

function redirectAuth(res, params) {
  const q = new URLSearchParams(params);
  res.writeHead(302, { Location: getAppUrl() + "/auth.html?" + q.toString() });
  res.end();
}

function redirectCalendar(res, query) {
  const dest = "/crm-calendar.html" + (query ? "?" + query : "");
  res.writeHead(302, { Location: getAppUrl() + dest });
  res.end();
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  if (!isGoogleConfigured()) {
    return redirectAuth(res, { oauth_error: "Google non configure" });
  }

  const url = new URL(req.url, "http://localhost");
  const err = url.searchParams.get("error");
  if (err) {
    return redirectAuth(res, { oauth_error: err });
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) {
    return redirectAuth(res, { oauth_error: "Parametres manquants" });
  }

  let returnTo = "";
  let oauthPurpose = "google_oauth";
  let calendarUserId = "";
  try {
    const decoded = verifyOAuthState(state);
    returnTo = decoded.returnTo || "";
    oauthPurpose = decoded.purpose || "google_oauth";
    calendarUserId = decoded.userId || "";
  } catch (e) {
    return redirectAuth(res, { oauth_error: "Session expiree, recommencez" });
  }

  const sql = getSql();
  if (!sql) {
    return redirectAuth(res, { oauth_error: "Base de donnees indisponible" });
  }

  try {
    const tokens = await exchangeCodeForTokens(code);

    if (oauthPurpose === "google_drive") {
      const expectedEmail = (process.env.GOOGLE_DRIVE_USER_EMAIL || "courtier972@gmail.com")
        .trim()
        .toLowerCase();
      const profile = await fetchGoogleProfile(tokens.access_token);
      const email = String(profile.email || "")
        .trim()
        .toLowerCase();
      if (expectedEmail && email !== expectedEmail) {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(
          "<!doctype html><html lang=\"fr\"><body style=\"font-family:sans-serif;max-width:640px;margin:40px auto;padding:0 16px\">" +
            "<h1>Compte Google incorrect</h1>" +
            "<p>Connectez-vous avec <strong>" +
            expectedEmail +
            "</strong> (pas " +
            email +
            ").</p>" +
            "<p><a href=\"" +
            getAppUrl() +
            "/test-drive.html\">Retour test Drive</a></p></body></html>"
        );
        return;
      }
      if (!tokens.refresh_token) {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(
          "<!doctype html><html lang=\"fr\"><body style=\"font-family:sans-serif;max-width:640px;margin:40px auto;padding:0 16px\">" +
            "<h1>Refresh token manquant</h1>" +
            "<p>Google n'a pas renvoye de refresh token. Recommencez et acceptez toutes les autorisations Drive.</p>" +
            "<p><a href=\"" +
            getAppUrl() +
            "/api/drive/oauth-start\">Relancer la connexion Drive</a></p></body></html>"
        );
        return;
      }
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(
        "<!doctype html><html lang=\"fr\"><head><meta charset=\"UTF-8\"/><title>Drive OAuth</title>" +
          "<style>body{font-family:Inter,Arial,sans-serif;max-width:720px;margin:32px auto;padding:0 16px;line-height:1.5}" +
          "code,pre{background:#f1f5f9;padding:12px;border-radius:8px;word-break:break-all;display:block}" +
          ".warn{background:#fef3c7;border:1px solid #fcd34d;padding:12px;border-radius:8px}</style></head><body>" +
          "<h1>GOOGLE_DRIVE_REFRESH_TOKEN</h1>" +
          "<p>Compte : <strong>" +
          email +
          "</strong></p>" +
          "<div class=\"warn\"><strong>Etape suivante :</strong> copiez le refresh token ci-dessous dans Vercel → Settings → Environment Variables → " +
          "<code>GOOGLE_DRIVE_REFRESH_TOKEN</code>, puis <strong>Redeploy</strong> sur <code>main</code>.</div>" +
          "<h2>Refresh token</h2><pre id=\"rt\">" +
          tokens.refresh_token +
          "</pre>" +
          "<p>Verifiez aussi : <code>GOOGLE_DRIVE_FOLDER_ID=19b0BAIySKxIDyc7ZTFwkp865Jk3nzs-Q</code></p>" +
          "<p><a href=\"" +
          getAppUrl() +
          "/test-drive.html\">→ Ouvrir test-drive.html</a></p>" +
          "<script>try{navigator.clipboard.writeText(document.getElementById('rt').textContent);}catch(e){}</script>" +
          "</body></html>"
      );
      return;
    }

    if (oauthPurpose === "google_calendar") {
      if (!calendarUserId) {
        return redirectCalendar(res, "calendar_error=" + encodeURIComponent("Session agenda invalide"));
      }
      await ensureCalendarSchema(sql);
      if (!tokens.refresh_token) {
        return redirectCalendar(
          res,
          "calendar_error=" +
            encodeURIComponent(
              "Google n'a pas renvoyé de jeton d'accès hors ligne. Recliquez Connecter Google et acceptez toutes les autorisations Agenda."
            )
        );
      }
      const calId = process.env.GOOGLE_CALENDAR_DEFAULT_ID || "primary";
      await sql`
        UPDATE users SET
          google_refresh_token = ${tokens.refresh_token},
          google_calendar_id = ${calId},
          google_calendar_connected_at = NOW(),
          updated_at = NOW()
        WHERE id = ${calendarUserId}
      `;
      const dest =
        returnTo && returnTo.indexOf("/crm") === 0 ? returnTo : "/crm-calendar.html";
      res.writeHead(302, {
        Location: getAppUrl() + dest + (dest.indexOf("?") >= 0 ? "&" : "?") + "calendar=connected",
      });
      res.end();
      return;
    }

    if (oauthPurpose === "external_client") {
      const profile = await fetchGoogleProfile(tokens.access_token);
      const contact = await upsertContactGoogle(sql, profile);
      const extToken = makeExtToken();
      const dest = safeReturnPath(returnTo || "/external/dashboard.html");
      const q = new URLSearchParams({
        ext_oauth: "success",
        token: extToken,
        email: contact.email,
        dest: dest,
        verified: "google",
      });
      const landing = dest.indexOf("/landings/") === 0 ? dest.split("#")[0] : "/external/login.html";
      const hash = dest.indexOf("#") >= 0 ? dest.slice(dest.indexOf("#")) : "";
      if (landing.indexOf("/landings/") === 0) {
        res.writeHead(302, { Location: getAppUrl() + landing + (landing.indexOf("?") >= 0 ? "&" : "?") + q.toString() + hash });
      } else {
        res.writeHead(302, { Location: getAppUrl() + "/external/login.html?" + q.toString() });
      }
      res.end();
      return;
    }

    const profile = await fetchGoogleProfile(tokens.access_token);
    const email = String(profile.email).trim().toLowerCase();
    const googleId = String(profile.id);
    const fullName = profile.name || profile.given_name || email.split("@")[0];
    const avatarUrl = profile.picture || null;

    let rows = await sql`
      SELECT id, email, role, crm_role, full_name, google_id, auth_provider
      FROM users WHERE google_id = ${googleId} OR email = ${email}
      LIMIT 1
    `;

    let userId;
    let role;
    let crmRole;

    const { isAdminEmail } = require("../admin-emails");

    if (rows.length) {
      const u = rows[0];
      userId = u.id;
      role = u.role;
      crmRole = u.role === "admin" ? u.crm_role || "admin" : u.crm_role;
      // Co-admin Google (ex. wendy.buchet.pro@gmail.com / Matterport) : promouvoir si listé dans ADMIN_EMAILS
      if (isAdminEmail(email) && role !== "admin") {
        role = "admin";
        crmRole = "admin";
        await sql`
          UPDATE users SET
            role = 'admin',
            crm_role = 'admin',
            google_id = ${googleId},
            auth_provider = CASE WHEN auth_provider = 'password' THEN 'both' ELSE 'google' END,
            avatar_url = COALESCE(${avatarUrl}, avatar_url),
            full_name = COALESCE(full_name, ${fullName}),
            last_login_at = NOW(),
            updated_at = NOW()
          WHERE id = ${userId}
        `;
      } else {
        await sql`
          UPDATE users SET
            google_id = ${googleId},
            auth_provider = CASE WHEN auth_provider = 'password' THEN 'both' ELSE 'google' END,
            avatar_url = COALESCE(${avatarUrl}, avatar_url),
            full_name = COALESCE(full_name, ${fullName}),
            last_login_at = NOW(),
            updated_at = NOW()
          WHERE id = ${userId}
        `;
      }
    } else {
      role = isAdminEmail(email) ? "admin" : "user";
      crmRole = role === "admin" ? "admin" : null;
      userId = randomUUID();
      const { hash, salt } = hashPassword(randomUUID() + randomUUID());
      await sql`
        INSERT INTO users (
          id, email, password_hash, salt, role, crm_role, full_name,
          google_id, auth_provider, avatar_url, status
        ) VALUES (
          ${userId}, ${email}, ${hash}, ${salt}, ${role}, ${crmRole}, ${fullName},
          ${googleId}, 'google', ${avatarUrl}, 'active'
        )
      `;
    }

    const token = signToken({
      userId: userId,
      email: email,
      role: role,
      crmRole: crmRole || null,
    });

    const allowedReturns = [
      "/crm.html",
      "/crm-mobile.html",
      "/dashboard.html",
      "/auth.html",
      "/admin.html",
      "/forum/",
      "/forum/index.html",
    ];
    // Accepte aussi /forum/#… passé sans le hash (returnTo côté client = chemin seul)
    let dest =
      returnTo && allowedReturns.indexOf(returnTo.split("?")[0].split("#")[0]) !== -1
        ? returnTo.split("?")[0].split("#")[0]
        : role === "admin" || crmRole
          ? "/admin.html"
          : "/auth.html";
    if (dest === "/forum/index.html") dest = "/forum/";

    const q = new URLSearchParams({
      oauth: "success",
      token: token,
      dest: dest,
    });
    // crm.html consomme le token lui-même ; sinon auth.html puis redirection vers dest
    const landing = dest === "/crm.html" ? "/crm.html" : "/auth.html";
    res.writeHead(302, { Location: getAppUrl() + landing + "?" + q.toString() });
    res.end();
  } catch (e) {
    console.error("[auth/google-callback]", e);
    if (oauthPurpose === "google_drive") {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(
        "<!doctype html><html lang=\"fr\"><body style=\"font-family:sans-serif;max-width:640px;margin:40px auto;padding:0 16px\">" +
          "<h1>Erreur OAuth Drive</h1><p>" +
          (e.message || "Connexion echouee") +
          "</p><p><a href=\"" +
          getAppUrl() +
          "/test-drive.html\">Retour test Drive</a></p></body></html>"
      );
      return;
    }
    if (oauthPurpose === "google_calendar") {
      return redirectCalendar(
        res,
        "calendar_error=" + encodeURIComponent(e.message || "Connexion Google Agenda échouée")
      );
    }
    if (oauthPurpose === "external_client") {
      res.writeHead(302, {
        Location:
          getAppUrl() +
          "/external/login.html?oauth_error=" +
          encodeURIComponent(e.message || "Connexion Google client échouée"),
      });
      res.end();
      return;
    }
    return redirectAuth(res, { oauth_error: "Connexion Google echouee" });
  }
};
