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

    if (rows.length) {
      const u = rows[0];
      userId = u.id;
      role = u.role;
      crmRole = u.role === "admin" ? u.crm_role || "admin" : u.crm_role;
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
    } else {
      const adminEmails = (process.env.ADMIN_EMAILS || "courtier972@gmail.com")
        .split(",")
        .map(function (e) {
          return e.trim().toLowerCase();
        })
        .filter(Boolean);
      role = adminEmails.indexOf(email) !== -1 ? "admin" : "user";
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

    const allowedReturns = ["/crm.html", "/dashboard.html", "/auth.html"];
    let dest =
      returnTo && allowedReturns.indexOf(returnTo) !== -1
        ? returnTo
        : role === "admin" || crmRole
          ? "/crm.html"
          : "/auth.html";

    const q = new URLSearchParams({
      oauth: "success",
      token: token,
      dest: dest,
    });
    const landing = dest === "/crm.html" ? "/crm.html" : "/auth.html";
    res.writeHead(302, { Location: getAppUrl() + landing + "?" + q.toString() });
    res.end();
  } catch (e) {
    console.error("[auth/google-callback]", e);
    if (oauthPurpose === "google_calendar") {
      return redirectCalendar(
        res,
        "calendar_error=" + encodeURIComponent(e.message || "Connexion Google Agenda échouée")
      );
    }
    return redirectAuth(res, { oauth_error: "Connexion Google echouee" });
  }
};
