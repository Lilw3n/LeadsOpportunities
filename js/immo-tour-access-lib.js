/**
 * Visite virtuelle acquéreur — token public (site / Leboncoin / portails),
 * vérif au choix, allowlist, période (dont mandat exclusif), droits d’auteur.
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
  var VERIFY_MODES = ["none", "email", "sms", "both"];
  var PERIOD_MODES = ["limited", "unlimited", "mandate"];
  var BIND_KEYS = ["site", "leboncoin", "seloger", "meta", "other"];
  var AVAILABILITIES = ["active", "paused"];
  var VISIBILITIES = ["listed", "unlisted"];

  var AUTHOR = {
    name: "Wendy BUCHET",
    role: "Mandataire immobilier",
    brand: "Leads Opportunities",
    orias: "15005935",
    email: "contact@leadsopportunities.fr",
    contact_path: "/landings/acheteur-immo.html?utm_source=visite-virtuelle&utm_medium=droits-auteur",
  };

  var COPYRIGHT =
    "© " +
    AUTHOR.name +
    " — " +
    AUTHOR.role +
    " (ORIAS n° " +
    AUTHOR.orias +
    "). Toute utilisation de cette visite virtuelle et de ce lien est autorisée de façon unique et personnelle, sauf dans le cadre d’une visibilité publique prévue par un mandat exclusif en cours. L’aboutissement direct ou indirect d’une vente grâce à l’utilisation de ce lien, ou la consultation de ce lien sans autorisation, est passible de poursuites. Toute republication ou réutilisation de ce lien hors du cadre prévu par le mandat est interdite.";

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

  function parseList(raw, kind) {
    var arr = raw;
    if (typeof raw === "string") arr = raw.split(/[\n,;]+/);
    if (!Array.isArray(arr)) arr = [];
    var out = [];
    var seen = {};
    arr.forEach(function (item) {
      var v = kind === "phone" ? normalizePhone(item) : normalizeEmail(item);
      if (!v || seen[v]) return;
      seen[v] = true;
      out.push(v);
    });
    return out.slice(0, 40);
  }

  function parseUrlList(raw) {
    var arr = raw;
    if (typeof raw === "string") arr = raw.split(/[\n,;]+/);
    if (!Array.isArray(arr)) arr = [];
    return arr
      .map(function (u) {
        return String(u || "").trim();
      })
      .filter(function (u) {
        return /^https:\/\//i.test(u) && !/@/.test(u) && u.length < 500;
      })
      .slice(0, 12);
  }

  function makeLinkId(token) {
    var t = String(token || "")
      .replace(/^vt_/i, "")
      .replace(/[^a-z0-9]+/gi, "")
      .slice(0, 18);
    if (t) return "tl_" + t;
    return "tl_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  function normalizeLinkName(name) {
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

  function publicTourPath(token, utm) {
    var q = "/immobilier/visite.html?t=" + encodeURIComponent(String(token || "").trim());
    if (utm) q += "&utm_source=" + encodeURIComponent(utm);
    return q;
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

  function normalizeVerifyMode(value, fallback) {
    var v = String(value || "").toLowerCase().trim();
    if (VERIFY_MODES.indexOf(v) !== -1) return v;
    return fallback || "email";
  }

  function normalizePeriodMode(value, fallback) {
    var v = String(value || "").toLowerCase().trim();
    if (PERIOD_MODES.indexOf(v) !== -1) return v;
    return fallback || "limited";
  }

  function boolFrom(v, fallback) {
    if (v === true || v === "1" || v === "on" || v === "true") return true;
    if (v === false || v === "0" || v === "off" || v === "false") return false;
    return fallback;
  }

  function parseBind(prev, form) {
    var p = (prev && prev.bind) || {};
    var out = {};
    BIND_KEYS.forEach(function (k) {
      var key = "tour_bind_" + k;
      if (form && Object.prototype.hasOwnProperty.call(form, key)) {
        out[k] = boolFrom(form[key], true);
      } else if (typeof p[k] === "boolean") {
        out[k] = p[k];
      } else {
        out[k] = true;
      }
    });
    return out;
  }

  function isExclusiveForm(forme) {
    var f = String(forme || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return f.indexOf("exclusif") !== -1;
  }

  function mandateInfo(property) {
    var p = property && typeof property === "object" ? property : {};
    var meta = p.metadata && typeof p.metadata === "object" ? p.metadata : {};
    var Mandate = null;
    try {
      if (typeof require === "function") Mandate = require("./immo-mandate-acl-lib.js");
    } catch (e) {
      Mandate = null;
    }
    if (!Mandate && typeof globalThis !== "undefined") Mandate = globalThis.ImmoMandateAcl;
    if (Mandate && Mandate.computeDuration) {
      var dur = Mandate.computeDuration(p, meta);
      return {
        ok: !!dur.ok,
        expired: !!dur.expired,
        endIso: dur.endIso || null,
        forme: dur.forme || "",
        exclusive: isExclusiveForm(dur.forme),
        remainingDays: dur.remainingDays,
        label: dur.label || "",
      };
    }
    var endRaw = p.mandate_ends_at || meta.date_echeance || meta.mandate_ends_at;
    var end = parseExpiresAt(endRaw);
    var forme = p.forme_mandat || p.mandate_form || meta.forme_mandat || "";
    var expired = !!(end && Date.now() > Date.parse(end));
    return {
      ok: true,
      expired: expired,
      endIso: end,
      forme: forme,
      exclusive: isExclusiveForm(forme),
      remainingDays: end ? Math.round((Date.parse(end) - Date.now()) / 86400000) : null,
      label: "",
    };
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

    var id = String(prev.id || "").trim();
    if (!/^tl_[a-z0-9_]+$/i.test(id)) id = token ? makeLinkId(token) : makeLinkId();

    var linkName = normalizeLinkName((f && f.tour_name != null ? f.tour_name : prev.name) || "");
    if (!linkName) linkName = "Visite virtuelle";

    var availability = String(
      (f && f.tour_availability != null && f.tour_availability !== ""
        ? f.tour_availability
        : prev.availability) || "active"
    ).toLowerCase();
    if (AVAILABILITIES.indexOf(availability) === -1) availability = "active";
    if (f && Object.prototype.hasOwnProperty.call(f, "tour_gate") && !enabled && token) {
      availability = "paused";
      enabled = true;
    }

    var visibility = String(
      (f && f.tour_visibility != null && f.tour_visibility !== ""
        ? f.tour_visibility
        : prev.visibility) || "listed"
    ).toLowerCase();
    if (VISIBILITIES.indexOf(visibility) === -1) visibility = "listed";

    var maxViews = toInt(f && f.tour_max_views != null ? f.tour_max_views : prev.max_views, 0);
    var verifyMode = normalizeVerifyMode(
      f && f.tour_verify_mode != null ? f.tour_verify_mode : prev.verify_mode,
      prev.verify_mode || "email"
    );
    var maxPerDefault =
      maxViews <= 0 || verifyMode === "none" ? 0 : DEFAULT_MAX_PER_CONTACT;
    var maxPer = toInt(
      f && f.tour_max_per_contact != null && f.tour_max_per_contact !== ""
        ? f.tour_max_per_contact
        : prev.max_views_per_contact != null
          ? prev.max_views_per_contact
          : maxPerDefault,
      maxPerDefault
    );
    if (maxPer < 0) maxPer = maxPerDefault;
    // Lien illimité ou accès libre public : pas de plafond caché par contact
    if (maxViews <= 0 || (verifyMode === "none" && !(f && f.tour_max_per_contact != null && f.tour_max_per_contact !== ""))) {
      maxPer = 0;
    }
    var periodMode = normalizePeriodMode(
      f && f.tour_period_mode != null ? f.tour_period_mode : prev.period_mode,
      prev.period_mode || (prev.expires_at ? "limited" : "limited")
    );

    var durationValue = toInt(
      f && f.tour_duration_value != null && f.tour_duration_value !== ""
        ? f.tour_duration_value
        : prev.duration_value,
      0
    );
    var durationUnit = String(
      (f && f.tour_duration_unit) || prev.duration_unit || "days"
    ).toLowerCase();
    if (durationUnit !== "hours" && durationUnit !== "days") durationUnit = "days";

    var durationStart;
    if (f && f.tour_duration_start != null && f.tour_duration_start !== "") {
      durationStart = String(f.tour_duration_start).toLowerCase();
    } else if (prev.duration_start) {
      durationStart = String(prev.duration_start).toLowerCase();
    } else if (prev.expires_at && !prev.first_viewed_at) {
      durationStart = "created";
    } else {
      durationStart = "first_view";
    }
    if (durationStart !== "created" && durationStart !== "first_view") durationStart = "first_view";

    var expiresAt = parseExpiresAt(prev.expires_at);
    if (periodMode === "unlimited") {
      expiresAt = null;
    } else if (periodMode === "mandate") {
      expiresAt = parseExpiresAt(prev.expires_at);
    } else if (f) {
      if (f.tour_expires_at) {
        expiresAt = parseExpiresAt(f.tour_expires_at);
      } else {
        var amount = null;
        var unit = durationUnit;
        if (f.tour_duration_value != null && f.tour_duration_value !== "") {
          amount = toInt(f.tour_duration_value, -1);
          unit = String(f.tour_duration_unit || "days").toLowerCase();
        } else if (f.tour_hours != null && f.tour_hours !== "") {
          amount = toInt(f.tour_hours, -1);
          unit = "hours";
        } else if (f.tour_days != null && f.tour_days !== "") {
          amount = toInt(f.tour_days, -1);
          unit = "days";
        }
        if (amount != null) {
          if (amount <= 0) {
            periodMode = "unlimited";
            expiresAt = null;
            durationValue = 0;
          } else {
            durationValue = amount;
            durationUnit = unit === "hours" ? "hours" : "days";
            if (durationStart === "first_view") {
              if (prev.first_viewed_at) {
                var already = Date.parse(prev.first_viewed_at);
                var remainMs = unit === "hours" ? amount * 3600000 : amount * 86400000;
                expiresAt = Number.isFinite(already)
                  ? new Date(already + remainMs).toISOString()
                  : null;
              } else {
                expiresAt = null;
              }
            } else {
              var ms = unit === "hours" ? amount * 3600000 : amount * 86400000;
              expiresAt = new Date(Date.now() + ms).toISOString();
            }
          }
        }
      }
    }

    var allowEmails = parseList(
      f && f.tour_allow_emails != null ? f.tour_allow_emails : prev.allow_emails,
      "email"
    );
    var allowPhones = parseList(
      f && f.tour_allow_phones != null ? f.tour_allow_phones : prev.allow_phones,
      "phone"
    );

    return {
      id: id,
      name: linkName,
      availability: availability,
      visibility: visibility,
      enabled: !!enabled,
      token: token,
      max_views: maxViews,
      max_views_per_contact: maxPer,
      expires_at: expiresAt,
      duration_value: durationValue || null,
      duration_unit: durationUnit,
      duration_start: durationStart,
      first_viewed_at: prev.first_viewed_at || null,
      verify_mode: verifyMode,
      period_mode: periodMode,
      require_email: verifyMode === "email" || verifyMode === "both",
      require_phone: verifyMode === "sms" || verifyMode === "both",
      allow_emails: allowEmails,
      allow_phones: allowPhones,
      bind: parseBind(prev, f),
      portal_urls: parseUrlList(f && f.tour_portal_urls != null ? f.tour_portal_urls : prev.portal_urls),
      view_count: toInt(prev.view_count, 0),
      created_at: prev.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  function defaultsForNewLink() {
    return {
      tour_gate: true,
      tour_days: DEFAULT_DAYS,
      tour_duration_value: DEFAULT_DAYS,
      tour_duration_unit: "days",
      tour_duration_start: "first_view",
      tour_max_views: DEFAULT_MAX_VIEWS,
      tour_max_per_contact: DEFAULT_MAX_PER_CONTACT,
      tour_verify_mode: "email",
      tour_period_mode: "limited",
    };
  }

  function tourLinkStatus(access, extraViews, property) {
    var a = access && typeof access === "object" ? access : {};
    if (!isTourToken(a.token)) {
      return { ok: false, reason: "disabled", remaining: 0 };
    }
    if (a.availability === "paused") {
      return { ok: false, reason: "paused", remaining: 0 };
    }
    if (!a.enabled) {
      return { ok: false, reason: "disabled", remaining: 0 };
    }
    var period = a.period_mode || "limited";
    if (period === "mandate") {
      var man = mandateInfo(property);
      if (!man.exclusive) {
        return { ok: false, reason: "mandate_not_exclusive", remaining: 0 };
      }
      if (man.expired) {
        return { ok: false, reason: "mandate_ended", remaining: 0, expires_at: man.endIso };
      }
      if (man.endIso) {
        a = Object.assign({}, a, { expires_at: man.endIso });
      }
    } else if (period !== "unlimited" && a.expires_at && Date.now() > Date.parse(a.expires_at)) {
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
      expires_at: period === "unlimited" ? null : a.expires_at || null,
      period_mode: period,
      duration_start: a.duration_start || "created",
      first_viewed_at: a.first_viewed_at || null,
    };
  }

  function durationMs(value, unit) {
    var n = toInt(value, 0);
    if (n <= 0) return 0;
    return String(unit) === "hours" ? n * 3600000 : n * 86400000;
  }

  function startDurationOnFirstView(access, now) {
    var a = Object.assign({}, access && typeof access === "object" ? access : {});
    if ((a.duration_start || "first_view") !== "first_view") return a;
    if (a.period_mode && a.period_mode !== "limited") return a;
    if (a.first_viewed_at) return a;
    var ms = durationMs(a.duration_value, a.duration_unit);
    var t = now || Date.now();
    a.first_viewed_at = new Date(t).toISOString();
    if (ms > 0) a.expires_at = new Date(t + ms).toISOString();
    a.updated_at = new Date(t).toISOString();
    return a;
  }

  function contactQuotaOk(used, access) {
    // Utilisations max du lien à 0 = illimité → pas de plafond par personne
    if (toInt(access && access.max_views, 0) <= 0) return true;
    // Accès libre (sans e-mail) : tous les visiteurs partagent une clé anonyme,
    // un plafond « par contact » bloquerait tout le monde après N ouvertures.
    if (((access && access.verify_mode) || "email") === "none") return true;
    var max = toInt(access && access.max_views_per_contact, DEFAULT_MAX_PER_CONTACT);
    if (max <= 0) return true;
    return toInt(used, 0) < max;
  }

  function isAllowlisted(access, email, phone) {
    var emails = (access && access.allow_emails) || [];
    var phones = (access && access.allow_phones) || [];
    if (!emails.length && !phones.length) return true;
    var e = normalizeEmail(email);
    var p = normalizePhone(phone);
    if (e && emails.indexOf(e) !== -1) return true;
    if (p && phones.indexOf(p) !== -1) return true;
    return false;
  }

  function needsEmail(access) {
    var m = (access && access.verify_mode) || "email";
    return m === "email" || m === "both";
  }

  function needsPhone(access) {
    var m = (access && access.verify_mode) || "email";
    return m === "sms" || m === "both";
  }

  function needsOtp(access) {
    return ((access && access.verify_mode) || "email") !== "none";
  }

  var REQUEST_STATUSES = ["pending", "approved", "declined"];

  function storeContactKey(email, phone, token) {
    var e = normalizeEmail(email);
    var p = normalizePhone(phone);
    if (e) return e;
    if (p) return "sms+" + p + "@visite.local";
    return "anon+" + String(token || "").slice(-12) + "@visite.local";
  }

  function normalizeRequestStatus(status) {
    var s = String(status || "")
      .toLowerCase()
      .trim();
    if (REQUEST_STATUSES.indexOf(s) !== -1) return s;
    return "";
  }

  function requestCanVerify(status) {
    return normalizeRequestStatus(status) === "approved";
  }

  function requestStatusMessage(status) {
    var s = normalizeRequestStatus(status);
    if (s === "declined") {
      return "Votre demande a été déclinée. Contactez Wendy BUCHET.";
    }
    if (s === "pending") {
      return "Votre demande est en attente de validation par Wendy BUCHET.";
    }
    if (!s) {
      return "Demandez d’abord l’accès. Wendy validera ou déclinera.";
    }
    return "";
  }

  function nextAskOutcome(prevStatus) {
    var s = normalizeRequestStatus(prevStatus);
    if (s === "declined") {
      return { ok: false, status: "declined", resend: false, create: false };
    }
    if (s === "approved") {
      return { ok: true, status: "approved", resend: true, create: false };
    }
    if (s === "pending") {
      return { ok: true, status: "pending", resend: false, create: false };
    }
    return { ok: true, status: "pending", resend: false, create: true };
  }

  function applyRequestDecision(decision) {
    var d = String(decision || "")
      .toLowerCase()
      .trim();
    if (d === "decline" || d === "declined") {
      return { ok: true, status: "declined", send_code: false };
    }
    if (d === "approve" || d === "approved" || d === "resend") {
      return { ok: true, status: "approved", send_code: true };
    }
    return { ok: false, status: "", send_code: false };
  }

  function statusMessage(reason) {
    if (reason === "expired") return "Ce lien de visite a expiré.";
    if (reason === "quota") return "Le nombre de consultations de ce lien est atteint.";
    if (reason === "mandate_ended") {
      return "Le mandat exclusif est terminé : ce lien n’est plus public.";
    }
    if (reason === "mandate_not_exclusive") {
      return "Ce lien n’est actif que pendant un mandat exclusif.";
    }
    if (reason === "paused") return "Cette visite est temporairement indisponible.";
    if (reason === "disabled") return "Cette visite n’est plus accessible.";
    return "Ce lien n’est plus valable (expiré, quota, mandat ou renouvelé).";
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

  function resolveTourUrl(ad, access) {
    return embedUrl((access && access.virtual_tour) || (ad && ad.virtual_tour) || "");
  }

  function playerPath(token) {
    return "/api/immo-tour-player?t=" + encodeURIComponent(String(token || "").trim());
  }

  function playerRequestOk(headers) {
    var h = headers || {};
    var dest = String(h["sec-fetch-dest"] || "").toLowerCase();
    if (dest === "iframe" || dest === "embed") return true;
    var ref = String(h.referer || h.referrer || "");
    return /\/immobilier\/visite\.html/i.test(ref);
  }

  function parseGrantCookie(cookieHeader) {
    var raw = String(cookieHeader || "");
    var m = raw.match(/(?:^|;\s*)lo_immo_tour_grant=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : "";
  }

  function grantSetCookie(grant, secure) {
    return (
      "lo_immo_tour_grant=" +
      encodeURIComponent(String(grant || "")) +
      "; HttpOnly; Path=/api/immo-tour-player; Max-Age=" +
      Math.floor(GRANT_TTL_MS / 1000) +
      "; SameSite=Lax" +
      (secure ? "; Secure" : "")
    );
  }

  function publicMeta(access, listingHint, property) {
    var st = tourLinkStatus(access, 0, property);
    var hint = listingHint || {};
    var a = access || {};
    var mode = a.verify_mode || "email";
    return {
      ok: st.ok,
      reason: st.ok ? null : st.reason,
      error: st.ok ? null : statusMessage(st.reason),
      title: String(hint.title || hint.headline || a.name || "Visite virtuelle").slice(0, 80),
      name: String(a.name || "").slice(0, 80),
      availability: a.availability || "active",
      visibility: a.visibility || "listed",
      city: String(hint.city || "").slice(0, 60),
      asking_price: hint.asking_price != null ? hint.asking_price : hint.price_fai != null ? hint.price_fai : null,
      price_fai: hint.price_fai != null ? hint.price_fai : hint.asking_price != null ? hint.asking_price : null,
      remaining: st.remaining,
      max_views: st.max_views || null,
      expires_at: st.expires_at || null,
      period_mode: a.period_mode || "limited",
      duration_start: a.duration_start || "first_view",
      duration_value: a.duration_value || null,
      duration_unit: a.duration_unit || "days",
      first_viewed_at: a.first_viewed_at || null,
      verify_mode: mode,
      require_email: needsEmail(a),
      require_phone: needsPhone(a),
      require_otp: needsOtp(a),
      approval_required: needsOtp(a),
      allowlist: !!(a.allow_emails && a.allow_emails.length) || !!(a.allow_phones && a.allow_phones.length),
      bind: a.bind || {},
      copyright: COPYRIGHT,
      author: AUTHOR,
      contact: {
        name: AUTHOR.name,
        role: AUTHOR.role,
        email: AUTHOR.email,
        href: AUTHOR.contact_path,
      },
    };
  }

  function listedHref(access) {
    var a = access && typeof access === "object" ? access : {};
    return !!(
      a.token &&
      a.enabled !== false &&
      a.availability !== "paused" &&
      a.visibility !== "unlisted"
    );
  }

  function listTourLinks(ad) {
    var src = ad && typeof ad === "object" ? ad : {};
    var raw = Array.isArray(src.tour_links) ? src.tour_links : [];
    var seen = {};
    var out = [];
    raw.forEach(function (item) {
      var n = normalizeTourAccess(item, null);
      if (!n.token || seen[n.token]) return;
      seen[n.token] = true;
      out.push(n);
    });
    var primary = src.tour_access ? normalizeTourAccess(src.tour_access, null) : null;
    if (primary && primary.token && !seen[primary.token]) {
      out.unshift(primary);
    }
    return out;
  }

  function pickPrimaryLink(links) {
    var list = Array.isArray(links) ? links : [];
    var i;
    for (i = 0; i < list.length; i++) {
      if (listedHref(list[i])) return list[i];
    }
    for (i = 0; i < list.length; i++) {
      if (list[i] && list[i].token) return list[i];
    }
    return normalizeTourAccess({}, { tour_gate: false });
  }

  function getTourAccessForToken(ad, token) {
    var t = String(token || "").trim();
    if (!isTourToken(t)) return null;
    var links = listTourLinks(ad);
    for (var i = 0; i < links.length; i++) {
      if (String(links[i].token || "") === t) return links[i];
    }
    return null;
  }

  function replaceTourLink(ad, nextAccess) {
    var bag = ad && typeof ad === "object" ? ad : {};
    var next = normalizeTourAccess(nextAccess, null);
    var links = listTourLinks(bag);
    var found = false;
    links = links.map(function (l) {
      if (l.token === next.token || (next.id && l.id === next.id)) {
        found = true;
        return next;
      }
      return l;
    });
    if (!found && next.token) links.push(next);
    bag.tour_links = links;
    if (bag.tour_access && bag.tour_access.token === next.token) {
      bag.tour_access = next;
    } else {
      bag.tour_access = pickPrimaryLink(links);
    }
    return bag;
  }

  function removeTourLink(ad, linkIdOrToken) {
    var bag = ad && typeof ad === "object" ? ad : {};
    var want = String(linkIdOrToken || "").trim();
    if (!want) {
      return { links: listTourLinks(bag), primary: pickPrimaryLink(listTourLinks(bag)), current: null, removed: false };
    }
    var links = listTourLinks(bag).filter(function (l) {
      return l.id !== want && l.token !== want;
    });
    bag.tour_links = links;
    bag.tour_access = pickPrimaryLink(links);
    return { links: links, primary: bag.tour_access, current: bag.tour_access, removed: true };
  }

  function applyTourLinks(prevAd, form) {
    var prev = prevAd && typeof prevAd === "object" ? prevAd : {};
    var f = form && typeof form === "object" ? form : {};
    var links = listTourLinks(prev);
    if (f.tour_delete_link) {
      var delWant = String(f.tour_link_id || f.tour_delete_link || "").trim();
      var removedPack = removeTourLink(prev, delWant);
      return {
        links: removedPack.links,
        primary: removedPack.primary,
        current: removedPack.primary,
        removed: removedPack.removed,
      };
    }
    if (f.tour_create_link) {
      var created = normalizeTourAccess(
        {},
        Object.assign({}, f, { rotate_tour_token: true, tour_gate: true })
      );
      links.push(created);
      return { links: links, primary: pickPrimaryLink(links), current: created };
    }
    var want = String(f.tour_link_id || "").trim();
    var idx = -1;
    var i;
    if (want) {
      for (i = 0; i < links.length; i++) {
        if (links[i].id === want || links[i].token === want) {
          idx = i;
          break;
        }
      }
    }
    if (idx < 0 && links.length) idx = 0;
    if (idx < 0) {
      var first = normalizeTourAccess({}, f);
      return {
        links: first.token ? [first] : [],
        primary: first.token ? first : pickPrimaryLink([]),
        current: first,
      };
    }
    links[idx] = normalizeTourAccess(links[idx], f);
    return { links: links, primary: pickPrimaryLink(links), current: links[idx] };
  }

  function channelLinks(token, origin) {
    var base = String(origin || "").replace(/\/$/, "");
    return {
      site: base + publicTourPath(token, "site"),
      leboncoin: base + publicTourPath(token, "leboncoin"),
      seloger: base + publicTourPath(token, "seloger"),
      meta: base + publicTourPath(token, "meta"),
      other: base + publicTourPath(token, "portail"),
    };
  }

  return {
    WINDOW_MS: WINDOW_MS,
    GRANT_TTL_MS: GRANT_TTL_MS,
    DEFAULT_DAYS: DEFAULT_DAYS,
    DEFAULT_MAX_VIEWS: DEFAULT_MAX_VIEWS,
    DEFAULT_MAX_PER_CONTACT: DEFAULT_MAX_PER_CONTACT,
    VERIFY_MODES: VERIFY_MODES,
    PERIOD_MODES: PERIOD_MODES,
    AVAILABILITIES: AVAILABILITIES,
    VISIBILITIES: VISIBILITIES,
    AUTHOR: AUTHOR,
    COPYRIGHT: COPYRIGHT,
    normalizeEmail: normalizeEmail,
    normalizePhone: normalizePhone,
    normalizeName: normalizeName,
    parseList: parseList,
    makeLinkId: makeLinkId,
    makeTourToken: makeTourToken,
    isTourToken: isTourToken,
    publicTourPath: publicTourPath,
    channelLinks: channelLinks,
    normalizeTourAccess: normalizeTourAccess,
    defaultsForNewLink: defaultsForNewLink,
    tourLinkStatus: tourLinkStatus,
    mandateInfo: mandateInfo,
    isExclusiveForm: isExclusiveForm,
    durationMs: durationMs,
    startDurationOnFirstView: startDurationOnFirstView,
    contactQuotaOk: contactQuotaOk,
    isAllowlisted: isAllowlisted,
    needsEmail: needsEmail,
    needsPhone: needsPhone,
    needsOtp: needsOtp,
    REQUEST_STATUSES: REQUEST_STATUSES,
    storeContactKey: storeContactKey,
    normalizeRequestStatus: normalizeRequestStatus,
    requestCanVerify: requestCanVerify,
    requestStatusMessage: requestStatusMessage,
    nextAskOutcome: nextAskOutcome,
    applyRequestDecision: applyRequestDecision,
    statusMessage: statusMessage,
    otpCode: otpCode,
    verifyOtp: verifyOtp,
    makeGrant: makeGrant,
    verifyGrant: verifyGrant,
    maskEmail: maskEmail,
    maskPhone: maskPhone,
    embedUrl: embedUrl,
    resolveTourUrl: resolveTourUrl,
    playerPath: playerPath,
    playerRequestOk: playerRequestOk,
    parseGrantCookie: parseGrantCookie,
    grantSetCookie: grantSetCookie,
    publicMeta: publicMeta,
    listedHref: listedHref,
    listTourLinks: listTourLinks,
    pickPrimaryLink: pickPrimaryLink,
    getTourAccessForToken: getTourAccessForToken,
    replaceTourLink: replaceTourLink,
    removeTourLink: removeTourLink,
    applyTourLinks: applyTourLinks,
  };
});
