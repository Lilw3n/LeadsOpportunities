/**
 * Edge middleware :
 * 1) Open Graph dynamique pour crawlers sociaux sur /immobilier/visite
 * 2) Verrouillage revue juridique — uniquement hôte Buchet (ou SITE_LOCK=1)
 */
var GATE_COOKIE = "buchet_site_gate_v2";

var SOCIAL_UA =
  /facebookexternalhit|facebot|meta-externalagent|whatsapp|twitterbot|linkedinbot|slackbot|discordbot|telegrambot/i;

var unlockCache = { at: 0, unlocked: false };
var UNLOCK_CACHE_MS = 12 * 1000;

function pass() {
  return new Response(null, {
    headers: { "x-middleware-next": "1" },
  });
}

function b64urlDecode(str) {
  var s = String(str || "").replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  var bin = atob(s);
  var out = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function gateSecret() {
  return (
    process.env.SITE_GATE_SECRET ||
    process.env.JWT_SECRET ||
    process.env.ADMIN_JWT_SECRET ||
    "buchet-site-gate-dev-only"
  );
}

function timingSafeEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  var diff = 0;
  for (var i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function verifyGateToken(token) {
  try {
    var parts = String(token || "").split(".");
    if (parts.length !== 2) return null;
    var body = parts[0];
    var sig = parts[1];
    var enc = new TextEncoder();
    var key = await crypto.subtle.importKey(
      "raw",
      enc.encode(gateSecret()),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    var expectedBuf = await crypto.subtle.sign("HMAC", key, enc.encode(body));
    var expected = new Uint8Array(expectedBuf);
    var got = b64urlDecode(sig);
    if (!timingSafeEqual(expected, got)) return null;
    var json = new TextDecoder().decode(b64urlDecode(body));
    var payload = JSON.parse(json);
    if (!payload || !payload.email || !payload.access) return null;
    if (payload.exp && Date.now() > Number(payload.exp)) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

function getCookie(req, name) {
  var raw = req.headers.get("cookie") || "";
  var parts = raw.split(";");
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i].trim();
    var eq = p.indexOf("=");
    if (eq < 0) continue;
    if (p.slice(0, eq) === name) {
      var val = p.slice(eq + 1);
      try {
        var decoded = decodeURIComponent(val);
        if (decoded.indexOf(".") >= 0) return decoded;
      } catch (e) {}
      return val;
    }
  }
  return null;
}

function isEnvForcedOpen() {
  var raw = process.env.SITE_LOCK;
  if (raw == null || String(raw).trim() === "") return false;
  var v = String(raw).trim().toLowerCase();
  return v === "0" || v === "false" || v === "off" || v === "no";
}

function isEnvForcedClosed() {
  var raw = process.env.SITE_LOCK;
  if (raw == null || String(raw).trim() === "") return false;
  var v = String(raw).trim().toLowerCase();
  return v === "1" || v === "true" || v === "on" || v === "yes";
}

function isBuchetHost(hostname) {
  var h = String(hostname || "")
    .split(":")[0]
    .trim()
    .toLowerCase();
  return (
    h === "buchetimmobilier.com" ||
    h === "www.buchetimmobilier.com" ||
    /\.buchetimmobilier\.com$/.test(h)
  );
}

function siteLockActive(hostname) {
  if (isEnvForcedOpen()) return false;
  if (isEnvForcedClosed()) return true;
  return isBuchetHost(hostname);
}

function isAlwaysAllowed(pathname) {
  var p = pathname || "/";
  if (p === "/site-lock.html" || p === "/auth.html") return true;
  if (p.indexOf("/api/auth") === 0) return true;
  if (p === "/api/site-lock" || p.indexOf("/api/site-lock") === 0) return true;
  if (p === "/api/health" || p === "/api/google-config-env") return true;
  if (/\.(css|js|mjs|map|png|jpe?g|webp|gif|svg|ico|woff2?|ttf|txt|xml|json)$/i.test(p)) return true;
  if (p.indexOf("/assets/") === 0 || p.indexOf("/css/") === 0 || p.indexOf("/js/") === 0) return true;
  if (p.indexOf("/favicon") === 0) return true;
  if (p === "/robots.txt" || p === "/sitemap.xml") return true;
  if (p === "/main.css" || p === "/legal.css" || p === "/google-config.js") return true;
  return false;
}

function isAdminOnlyPath(pathname) {
  var p = pathname || "/";
  var blocked = [
    "/dashboard.html",
    "/admin.html",
    "/admin-sync-sites.html",
    "/crm.html",
    "/espace-client.html",
    "/api/dashboard",
    "/api/crm",
    "/api/drive",
  ];
  for (var i = 0; i < blocked.length; i++) {
    var b = blocked[i];
    if (p === b || p.indexOf(b + "/") === 0) return true;
  }
  if (p.indexOf("/crm") === 0) return true;
  if (/^\/crm[a-z0-9_-]*\.html$/i.test(p)) return true;
  if (p.indexOf("/admin") === 0) return true;
  return false;
}

async function isDbUnlocked(request) {
  if (Date.now() - unlockCache.at < UNLOCK_CACHE_MS) {
    return unlockCache.unlocked;
  }
  try {
    var statusUrl = new URL("/api/site-lock?op=status", request.url);
    var res = await fetch(statusUrl.toString(), {
      headers: { Accept: "application/json", "x-site-lock-mw": "1" },
    });
    if (!res.ok) {
      unlockCache = { at: Date.now(), unlocked: false };
      return false;
    }
    var data = await res.json();
    var unlocked = data && data.locked === false;
    unlockCache = { at: Date.now(), unlocked: !!unlocked };
    return !!unlocked;
  } catch (e) {
    unlockCache = { at: Date.now(), unlocked: false };
    return false;
  }
}

function redirectToLock(request, pathname) {
  var dest = new URL("/site-lock.html", request.url);
  if (pathname && pathname !== "/" && pathname !== "/site-lock.html") {
    dest.searchParams.set("next", pathname);
  }
  return Response.redirect(dest, 302);
}

async function handleSocialOg(request) {
  var ua = request.headers.get("user-agent") || "";
  if (!SOCIAL_UA.test(ua)) return null;
  var url = new URL(request.url);
  var path = url.pathname.replace(/\/$/, "") || "/";
  if (path !== "/immobilier/visite.html" && path !== "/immobilier/visite") return null;
  url.pathname = "/api/immo-tour-og";
  return fetch(url.toString(), {
    headers: request.headers,
    redirect: "manual",
  });
}

export default async function middleware(request) {
  var social = await handleSocialOg(request);
  if (social) return social;

  var url = new URL(request.url);
  var hostname = url.hostname || request.headers.get("host") || "";

  if (!siteLockActive(hostname)) {
    return pass();
  }

  var pathname = url.pathname || "/";

  if (isAlwaysAllowed(pathname)) {
    return pass();
  }

  if (await isDbUnlocked(request)) {
    return pass();
  }

  var token = getCookie(request, GATE_COOKIE);
  var gate = token ? await verifyGateToken(token) : null;

  if (!gate) {
    if (pathname.indexOf("/api/") === 0) {
      return new Response(JSON.stringify({ error: "Site verrouillé — connexion requise", locked: true }), {
        status: 401,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }
    return redirectToLock(request, pathname + (url.search || ""));
  }

  if (gate.access === "full") {
    return pass();
  }

  if (isAdminOnlyPath(pathname)) {
    if (pathname.indexOf("/api/") === 0) {
      return new Response(
        JSON.stringify({ error: "Accès réservé aux administrateurs", siteAccess: "public" }),
        { status: 403, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }
    return redirectToLock(request, pathname);
  }

  return pass();
}

export var config = {
  matcher: ["/((?!_next/|_vercel/|favicon.ico).*)"],
};
