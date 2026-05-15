const crypto = require("crypto");

const RATE_BUCKETS = new Map();

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return String(forwarded).split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}

function rateLimit(key, max, windowMs) {
  const now = Date.now();
  let bucket = RATE_BUCKETS.get(key);
  if (!bucket || now > bucket.reset) {
    bucket = { count: 0, reset: now + windowMs };
    RATE_BUCKETS.set(key, bucket);
  }
  bucket.count += 1;
  if (bucket.count > max) {
    return { allowed: false, retryAfterMs: bucket.reset - now };
  }
  return { allowed: true };
}

function safeEqual(a, b) {
  const sa = String(a || "");
  const sb = String(b || "");
  if (sa.length !== sb.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(sa), Buffer.from(sb));
  } catch {
    return false;
  }
}

function getAllowedOrigins() {
  const raw = process.env.ALLOWED_ORIGINS || process.env.NEXT_PUBLIC_APP_URL || "";
  return raw
    .split(",")
    .map(function (s) {
      return s.trim().replace(/\/$/, "");
    })
    .filter(Boolean);
}

function setCors(req, res) {
  const origins = getAllowedOrigins();
  const origin = req.headers.origin || "";
  if (origins.length === 0) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else if (origin && origins.indexOf(origin) !== -1) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");
}

function setSecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("X-XSS-Protection", "0");
  if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
}

function applyApiGuards(req, res) {
  setSecurityHeaders(res);
  setCors(req, res);
}

function parseJsonBody(req, maxBytes) {
  maxBytes = maxBytes || 65536;
  let body = req.body;
  if (typeof body === "string") {
    if (body.length > maxBytes) return { error: "Payload trop volumineux" };
    try {
      body = JSON.parse(body);
    } catch {
      return { error: "JSON invalide" };
    }
  }
  if (body && typeof body === "object" && Buffer.byteLength(JSON.stringify(body), "utf8") > maxBytes) {
    return { error: "Payload trop volumineux" };
  }
  if (!body || typeof body !== "object") {
    return { error: "Corps de requête invalide" };
  }
  return { body: body };
}

function isHoneypotFilled(body) {
  if (!body || typeof body !== "object") return false;
  const hp = body._hp || body.website || body.company_url;
  return hp != null && String(hp).trim() !== "";
}

function sanitizeEnum(value, allowed, fallback) {
  const v = String(value || "").trim().toLowerCase();
  return allowed.indexOf(v) !== -1 ? v : fallback;
}

function sanitizeSearch(value, maxLen) {
  maxLen = maxLen || 80;
  return String(value || "")
    .trim()
    .slice(0, maxLen)
    .replace(/[%_\\]/g, "");
}

function requireJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET manquant ou trop court (min 32 caractères)");
  }
  return secret || "lo-dev-only-not-for-production";
}

async function readRawBody(req, limit) {
  limit = limit || 1024 * 1024;
  return new Promise(function (resolve, reject) {
    const chunks = [];
    let size = 0;
    req.on("data", function (chunk) {
      size += chunk.length;
      if (size > limit) {
        reject(new Error("Body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", function () {
      resolve(Buffer.concat(chunks));
    });
    req.on("error", reject);
  });
}

module.exports = {
  getClientIp,
  rateLimit,
  safeEqual,
  setCors,
  setSecurityHeaders,
  applyApiGuards,
  parseJsonBody,
  isHoneypotFilled,
  sanitizeEnum,
  sanitizeSearch,
  requireJwtSecret,
  readRawBody,
};
