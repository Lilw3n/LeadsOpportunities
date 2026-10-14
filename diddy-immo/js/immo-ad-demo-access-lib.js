/**
 * Accès démo privée vendeur — e-mails / téléphones autorisés + OTP + grant.
 * Node + navigateur (sans crypto HMAC côté navigateur : OTP/grant = API uniquement).
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(require("crypto"));
  } else {
    root.ImmoAdDemoAccess = factory(null);
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function (crypto) {
  var WINDOW_MS = 10 * 60 * 1000;
  var GRANT_TTL_MS = 4 * 60 * 60 * 1000;

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

  function parseContactList(raw, kind) {
    var arr = raw;
    if (typeof raw === "string") {
      arr = raw.split(/[\n,;]+/);
    }
    if (!Array.isArray(arr)) arr = [];
    var out = [];
    var seen = {};
    arr.forEach(function (item) {
      var v = kind === "phone" ? normalizePhone(item) : normalizeEmail(item);
      if (!v || seen[v]) return;
      seen[v] = true;
      out.push(v);
    });
    return out.slice(0, 12);
  }

  function getAccess(ad) {
    var a = (ad && ad.access) || {};
    return {
      emails: parseContactList(a.emails, "email"),
      phones: parseContactList(a.phones, "phone"),
    };
  }

  function hasRestrictedAccess(ad) {
    var acc = getAccess(ad);
    return acc.emails.length > 0 || acc.phones.length > 0;
  }

  function accessMethods(ad) {
    var acc = getAccess(ad);
    var methods = [];
    if (acc.emails.length) methods.push("email");
    if (acc.phones.length) methods.push("phone");
    return methods;
  }

  function contactAllowed(ad, email, phone) {
    var acc = getAccess(ad);
    var em = normalizeEmail(email);
    var ph = normalizePhone(phone);
    if (em && acc.emails.indexOf(em) !== -1) return { ok: true, kind: "email", contact: em };
    if (ph && acc.phones.indexOf(ph) !== -1) return { ok: true, kind: "phone", contact: ph };
    return { ok: false };
  }

  function secretKey() {
    return (
      process.env.IMMO_DEMO_OTP_SECRET ||
      process.env.JWT_SECRET ||
      process.env.CRM_JWT_SECRET ||
      "lo-immo-demo-dev-secret"
    );
  }

  function windowIndex(ts) {
    return Math.floor((ts || Date.now()) / WINDOW_MS);
  }

  function otpCode(shareToken, contactKey, win) {
    if (!crypto) return null;
    var w = win != null ? win : windowIndex();
    var h = crypto
      .createHmac("sha256", secretKey())
      .update(String(shareToken) + "|" + String(contactKey) + "|" + String(w))
      .digest("hex");
    return String(parseInt(h.slice(0, 8), 16) % 1000000).padStart(6, "0");
  }

  function verifyOtp(shareToken, contactKey, code) {
    if (!crypto) return false;
    var c = String(code || "").replace(/\D/g, "");
    if (c.length !== 6) return false;
    var now = windowIndex();
    for (var i = 0; i < 2; i++) {
      if (otpCode(shareToken, contactKey, now - i) === c) return true;
    }
    return false;
  }

  function makeGrant(shareToken, contactKey) {
    if (!crypto) return null;
    var payload = Buffer.from(
      JSON.stringify({
        t: String(shareToken),
        c: String(contactKey),
        e: Date.now() + GRANT_TTL_MS,
      }),
      "utf8"
    ).toString("base64url");
    var sig = crypto.createHmac("sha256", secretKey()).update(payload).digest("base64url");
    return payload + "." + sig;
  }

  function verifyGrant(grant, shareToken) {
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
      if (!data || data.t !== shareToken) return null;
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

  return {
    WINDOW_MS: WINDOW_MS,
    GRANT_TTL_MS: GRANT_TTL_MS,
    normalizeEmail: normalizeEmail,
    normalizePhone: normalizePhone,
    parseContactList: parseContactList,
    getAccess: getAccess,
    hasRestrictedAccess: hasRestrictedAccess,
    accessMethods: accessMethods,
    contactAllowed: contactAllowed,
    otpCode: otpCode,
    verifyOtp: verifyOtp,
    makeGrant: makeGrant,
    verifyGrant: verifyGrant,
    maskEmail: maskEmail,
    maskPhone: maskPhone,
  };
});
