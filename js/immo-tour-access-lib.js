/**
 * Visite virtuelle acquéreur — token public (Leboncoin / Meta), OTP, grant, quotas.
 * Node + navigateur (OTP / grant = API uniquement).
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(require("crypto"));
  } else {
    root.ImmoTourAccess = factory(null);
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function (crypto) {
  var WINDOW_MS = 10 * 60 * 1000;
  var GRANT_TTL_MS = 4 * 60 * 60 * 1000;
  var DEFAULT_DAYS = 30;
  var DEFAULT_MAX_VIEWS = 50;
  var DEFAULT_MAX_PER_CONTACT = 8;

  function normalizeEmail(email) {
    var e = String(email || "")
      .trim()
      .toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) || e.length > 120) return "";
    return e;
  }

  function normalizePhone(phone) {
    var raw = String(phone || "").trim();
    if (!raw) return "";
    var digits = raw.replace(/\D/g, "");
    if (digits.indexOf("33") === 0 && digits.length >= 11) digits = "0" + digits.slice(2);
    if (digits.length === 9 && digits[0] !== "0") digits = "0" + digits;
    if (!/^0[1-9]\d{8}$/.test(digits)) return "";
    return digits;
  }

  function normalizeName(name) {
    return String(name || "")
      .replace(/[<>]/g, "")
      .trim()
      .slice(0, 80);
  }

  function makeTourToken() {
    var a = Date.now().toString(36);
    var b = Math.random().toString(36).slice(2, 10);
    var c = Math.random().toString(36).slice(2, 8);
    return "vt_" + a + "_" + b + c;
  }

  function isTourToken(token) {
    return /^vt_[a-z0-9]+_[a-z0-9]+$/i.test(String(token || "").trim());
  }

  function publicTourPath(token) {
    return "/immobilier/visite.html?t=" + encodeURIComponent(String(token || "").trim());
  }

  function parseExpiresAt(value) {
    if (!value) return null;
    var t = Date.parse(String(value));
    return Number.isFinite(t) ? new Date(t).toISOString() : null;
  }

  function toInt(value, fallback) {
    if (value == null || value === "") return fallback;
    var n = Number(value);
    if (!Number.isFinite(n) || n < 0) return fallback;
    return Math.floor(n);
  }

  function normalizeTourAccess(raw, form) {
    var prev = raw && typeof raw === "object" ? raw : {};
    var f = form && typeof form === "object" ? form : null;
    var enabled;
    if (f && Object.prototype.hasOwnProperty.call(f, "tour_gate")) {
      enabled = f.tour_gate === true || f.tour_gate === "1" || f.tour_gate === "on";
    } else if (typeof prev.enabled === "boolean") {
      enabled = prev.enabled;
    } else {
      enabled = false;
    }

    var token = String(prev.token || "").trim();
    if (!isTourToken(token)) token = "";
    if (f && f.rotate_tour_token) token = makeTourToken();
    if (enabled && !token) token = makeTourToken();

    var maxViews = toInt(f && f.tour_max_views != null ? f.tour_max_views : prev.max_views, 0);
    var maxPer = toInt(
      f && f.tour_max_per_contact != null ? f.tour_max_per_contact : prev.max_views_per_contact,
      DEFAULT_MAX_PER_CONTACT
    );
    if (maxPer < 1) maxPer = DEFAULT_MAX_PER_CONTACT;

    var expiresAt = parseExpiresAt(prev.expires_at);
    if (f) {
      if (f.tour_expires_at) {
        expiresAt = parseExpiresAt(f.tour_expires_at);
      } else if (f.tour_days != null && f.tour_days !== "") {
        var days = toInt(f.tour_days, -1);
        expiresAt = days > 0 ? new Date(Date.now() + days * 86400000).toISOString() : null;
      }
    }

    return {
      enabled: !!enabled,
      token: enabled ? token : token,
      max_views: maxViews,
      max_views_per_contact: maxPer,
      expires_at: expiresAt,
      require_email: true,
      require_phone: true,
      view_count: toInt(prev.view_count, 0),
      created_at: prev.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  function defaultsForNewLink() {
    return {
      tour_gate: true,
      tour_days: DEFAULT_DAYS,
      tour_max_views: DEFAULT_MAX_VIEWS,
      tour_max_per_contact: DEFAULT_MAX_PER_CONTACT,
    };
  }

  function tourLinkStatus(access, extraViews) {
    var a = access && typeof access === "object" ? access : {};
    if (!a.enabled || !isTourToken(a.token)) {
      return { ok: false, reason: "disabled", remaining: 0 };
    }
    if (a.expires_at && Date.now() > Date.parse(a.expires_at)) {
      return { ok: false, reason: "expired", remaining: 0, expires_at: a.expires_at };
    }
    var used = toInt(a.view_count, 0) + toInt(extraViews, 0);
    var max = toInt(a.max_views, 0);
    if (max > 0 && used >= max) {
      return { ok: false, reason: "quota", remaining: 0, max_views: max, view_count: used };
    }
    return {
      ok: true,
      remaining: max > 0 ? Math.max(0, max - used) : null,
      max_views: max || null,
      view_count: used,
      expires_at: a.expires_at || null,
    };
  }

  function contactQuotaOk(used, access) {
    var max = toInt(access && access.max_views_per_contact, DEFAULT_MAX_PER_CONTACT);
    return toInt(used, 0) < max;
  }

  function secretKey() {
    return (
      process.env.IMMO_TOUR_OTP_SECRET ||
      process.env.IMMO_DEMO_OTP_SECRET ||
      process.env.JWT_SECRET ||
      process.env.CRM_JWT_SECRET ||
      "lo-immo-tour-dev-secret"
    );
  }

  function windowIndex(ts) {
    return Math.floor((ts || Date.now()) / WINDOW_MS);
  }

  function otpCode(token, contactKey, win) {
    if (!crypto) return null;
    var w = win != null ? win : windowIndex();
    var h = crypto
      .createHmac("sha256", secretKey())
      .update("tour|" + String(token) + "|" + String(contactKey) + "|" + String(w))
      .digest("hex");
    return String(parseInt(h.slice(0, 8), 16) % 1000000).padStart(6, "0");
  }

  function verifyOtp(token, contactKey, code) {
    if (!crypto) return false;
    var c = String(code || "").replace(/\D/g, "");
    if (c.length !== 6) return false;
    var now = windowIndex();
    for (var i = 0; i < 2; i++) {
      if (otpCode(token, contactKey, now - i) === c) return true;
    }
    return false;
  }

  function makeGrant(token, contactKey) {
    if (!crypto) return null;
    var payload = Buffer.from(
      JSON.stringify({
        p: "tour",
        t: String(token),
        c: String(contactKey),
        e: Date.now() + GRANT_TTL_MS,
      }),
      "utf8"
    ).toString("base64url");
    var sig = crypto.createHmac("sha256", secretKey()).update(payload).digest("base64url");
    return payload + "." + sig;
  }

  function verifyGrant(grant, token) {
    if (!crypto || !grant) return null;
    var parts = String(grant).split(".");
    if (parts.length !== 2) return null;
    var payload = parts[0];
    var sig = parts[1];
    var expect = crypto.createHmac("sha256", secretKey()).update(payload).digest("base64url");
    if (sig.length !== expect.length) return null;
    try {
      if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect))) return null;
    } catch (e) {
      return null;
    }
    try {
      var data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
      if (!data || data.p !== "tour" || data.t !== token) return null;
      if (!data.e || Date.now() > Number(data.e)) return null;
      return { contact: String(data.c || ""), exp: Number(data.e) };
    } catch (e2) {
      return null;
    }
  }

  function maskEmail(email) {
    var e = normalizeEmail(email);
    if (!e) return "";
    var at = e.indexOf("@");
    if (at < 2) return "***";
    return e[0] + "***" + e.slice(at);
  }

  function maskPhone(phone) {
    var p = normalizePhone(phone);
    if (!p) return "";
    return p.slice(0, 2) + "** ** ** " + p.slice(-2);
  }

  function embedUrl(tourUrl) {
    var u = String(tourUrl || "").trim();
    if (!/^https:\/\//i.test(u) || /@/.test(u) || u.length > 2000) return "";
    return u;
  }

  function publicMeta(access, listingHint) {
    var st = tourLinkStatus(access);
    var hint = listingHint || {};
    return {
      ok: st.ok,
      reason: st.ok ? null : st.reason,
      title: String(hint.title || hint.headline || "Visite virtuelle").slice(0, 80),
      city: String(hint.city || "").slice(0, 60),
      remaining: st.remaining,
      max_views: st.max_views || null,
      expires_at: st.expires_at || null,
      require_email: true,
      require_phone: true,
    };
  }

  return {
    WINDOW_MS: WINDOW_MS,
    GRANT_TTL_MS: GRANT_TTL_MS,
    DEFAULT_DAYS: DEFAULT_DAYS,
    DEFAULT_MAX_VIEWS: DEFAULT_MAX_VIEWS,
    DEFAULT_MAX_PER_CONTACT: DEFAULT_MAX_PER_CONTACT,
    normalizeEmail: normalizeEmail,
    normalizePhone: normalizePhone,
    normalizeName: normalizeName,
    makeTourToken: makeTourToken,
    isTourToken: isTourToken,
    publicTourPath: publicTourPath,
    normalizeTourAccess: normalizeTourAccess,
    defaultsForNewLink: defaultsForNewLink,
    tourLinkStatus: tourLinkStatus,
    contactQuotaOk: contactQuotaOk,
    otpCode: otpCode,
    verifyOtp: verifyOtp,
    makeGrant: makeGrant,
    verifyGrant: verifyGrant,
    maskEmail: maskEmail,
    maskPhone: maskPhone,
    embedUrl: embedUrl,
    publicMeta: publicMeta,
  };
});
