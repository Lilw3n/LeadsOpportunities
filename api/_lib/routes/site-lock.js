/**
 * GET/POST /api/site-lock
 *   GET  ?op=status
 *   GET  ?op=gate
 *   GET  ?op=enter&token=JWT&to=/index.html  — pose le cookie porte + redirect (navigation pleine page)
 *   POST { action: "enter"|"validate"|"relock" }
 */
var { applyApiGuards, parseJsonBody } = require("../security");
var { getAuthUser, verifyToken } = require("../auth");
var {
  isSiteLockEnvForcedOpen,
  isSiteLockMechanismEnabled,
  isAllowedLoginEmail,
  siteAccessForEmail,
  getLegalReviewerEmails,
  getAdminEmails,
  GATE_COOKIE,
} = require("../site-lock");
var { getSiteLockState, setSiteUnlocked, clearSiteLockCache } = require("../site-lock-store");
var {
  verifyGateToken,
  createGateToken,
  gateCookieHeader,
  appendSetCookie,
} = require("../site-gate-cookie");

function readCookie(req, name) {
  var raw = req.headers.cookie || "";
  var parts = String(raw).split(";");
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i].trim();
    var eq = p.indexOf("=");
    if (eq < 0) continue;
    if (p.slice(0, eq) === name) {
      try {
        return decodeURIComponent(p.slice(eq + 1));
      } catch (e) {
        return p.slice(eq + 1);
      }
    }
  }
  return null;
}

function safeRedirectPath(raw) {
  var p = String(raw || "/index.html").trim();
  try {
    p = decodeURIComponent(p);
  } catch (e) {}
  if (!p || p.indexOf("://") >= 0 || p.indexOf("//") === 0) return "/index.html";
  if (p.charAt(0) !== "/") p = "/" + p;
  if (p.indexOf("/api/") === 0) return "/index.html";
  return p.split("#")[0] || "/index.html";
}

async function computeLocked(req) {
  if (isSiteLockEnvForcedOpen()) {
    return {
      locked: false,
      reason: "env_open",
      validatedBy: null,
      validatedAt: null,
    };
  }
  if (!isSiteLockMechanismEnabled(req)) {
    return {
      locked: false,
      reason: "host_open",
      validatedBy: null,
      validatedAt: null,
    };
  }
  var state = await getSiteLockState();
  if (state.unlocked) {
    return {
      locked: false,
      reason: "validated",
      validatedBy: state.validatedBy,
      validatedAt: state.validatedAt,
    };
  }
  return {
    locked: true,
    reason: "pending_review",
    validatedBy: null,
    validatedAt: null,
    noDb: !!state.noDb,
  };
}

function issueGateAndRedirect(res, email, toPath) {
  var access = siteAccessForEmail(email);
  if (!access) {
    return res.status(403).json({ error: "Compte non autorisé" });
  }
  var gate = createGateToken(email, access);
  var dest = safeRedirectPath(toPath);
  // Public-only: bloquer les chemins admin
  if (access === "public") {
    if (
      dest.indexOf("/crm") === 0 ||
      dest.indexOf("/admin") === 0 ||
      dest.indexOf("/dashboard") === 0 ||
      dest.indexOf("/espace-client") === 0
    ) {
      dest = "/index.html";
    }
  }
  res.writeHead(302, {
    Location: dest,
    "Set-Cookie": gateCookieHeader(gate),
    "Cache-Control": "private, no-store",
  });
  res.end();
}

module.exports = async function siteLockRoute(req, res) {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  var url = new URL(req.url, "http://localhost");
  var op = (url.searchParams.get("op") || "").trim().toLowerCase();

  // Entrée site : navigation pleine page pour garantir Set-Cookie avant l'HTML
  if (op === "enter" && (req.method === "GET" || req.method === "POST")) {
    var to = url.searchParams.get("to") || "/index.html";
    var tokenQ = url.searchParams.get("token") || "";
    var decoded = null;
    if (tokenQ) {
      decoded = verifyToken(tokenQ);
    }
    if (!decoded) {
      decoded = await getAuthUser(req);
    }
    if (!decoded || !decoded.email) {
      res.writeHead(302, { Location: "/auth.html?next=" + encodeURIComponent("/site-lock.html") });
      res.end();
      return;
    }
    var email = String(decoded.email).trim().toLowerCase();
    if (!isAllowedLoginEmail(email)) {
      res.writeHead(302, { Location: "/site-lock.html?oauth_error=" + encodeURIComponent("Compte non autorisé") });
      res.end();
      return;
    }
    return issueGateAndRedirect(res, email, to);
  }

  if (req.method === "GET" || op === "status" || op === "gate") {
    var status = await computeLocked(req);
    res.setHeader("Cache-Control", "private, no-store");
    if (op === "gate") {
      var gate = verifyGateToken(readCookie(req, GATE_COOKIE));
      var allowed = !status.locked || !!(gate && gate.access);
      return res.status(200).json({
        ok: true,
        locked: status.locked,
        allowed: allowed,
        access: gate ? gate.access : null,
        reason: status.reason,
      });
    }
    return res.status(200).json({
      ok: true,
      locked: status.locked,
      reason: status.reason,
      validatedBy: status.validatedBy,
      validatedAt: status.validatedAt,
      legalReviewers: getLegalReviewerEmails(),
      hasAdmins: getAdminEmails().length > 0,
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  var authUser = await getAuthUser(req);
  if (!authUser || !authUser.email) {
    return res.status(401).json({ error: "Authentification requise" });
  }
  var authEmail = String(authUser.email).trim().toLowerCase();
  if (!isAllowedLoginEmail(authEmail)) {
    return res.status(403).json({ error: "Compte non autorisé à valider le site" });
  }

  var parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  var body = parsed.body || {};
  var action = String(body.action || body.op || "validate")
    .trim()
    .toLowerCase();

  try {
    if (action === "enter") {
      var accessEnter = siteAccessForEmail(authEmail);
      if (!accessEnter) return res.status(403).json({ error: "Compte non autorisé" });
      appendSetCookie(res, gateCookieHeader(createGateToken(authEmail, accessEnter)));
      return res.status(200).json({
        ok: true,
        siteAccess: accessEnter,
        redirect: safeRedirectPath(body.to || "/index.html"),
        enterUrl:
          "/api/site-lock?op=enter&token=" +
          encodeURIComponent(req.headers.authorization ? req.headers.authorization.replace(/^Bearer\s+/i, "") : "") +
          "&to=" +
          encodeURIComponent(safeRedirectPath(body.to || "/index.html")),
      });
    }

    if (action === "relock" || action === "lock") {
      var access = siteAccessForEmail(authEmail);
      if (access !== "full") {
        return res.status(403).json({ error: "Seul un administrateur peut reverrouiller" });
      }
      await setSiteUnlocked(false, authEmail);
      clearSiteLockCache();
      return res.status(200).json({
        ok: true,
        locked: true,
        message: "Site reverrouillé",
        by: authEmail,
      });
    }

    if (action === "validate" || action === "unlock") {
      await setSiteUnlocked(true, authEmail);
      clearSiteLockCache();
      var after = await computeLocked(req);
      return res.status(200).json({
        ok: true,
        locked: after.locked,
        reason: after.reason,
        validatedBy: authEmail,
        validatedAt: after.validatedAt,
        message: "Site validé — ouvert au public",
        siteAccess: siteAccessForEmail(authEmail),
      });
    }

    return res.status(400).json({ error: "Action inconnue (enter | validate | relock)" });
  } catch (e) {
    console.error("[site-lock]", e);
    return res.status(500).json({ error: e.message || "Erreur serveur" });
  }
};
