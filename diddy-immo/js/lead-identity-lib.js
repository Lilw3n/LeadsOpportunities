/**
 * Identité leads : matching (email / tél / IP / visitor) + score humain vs spam/robot.
 * Navigateur : window.LeadIdentity  |  Node : module.exports
 */
(function (root) {
  var DISPOSABLE = {
    mailinator: 1,
    yopmail: 1,
    guerrillamail: 1,
    tempmail: 1,
    "10minutemail": 1,
    trashmail: 1,
    throwawaymail: 1,
    fakeinbox: 1,
    getnada: 1,
    sharklasers: 1,
    mailnesia: 1,
    tempail: 1,
  };

  var BOT_UA =
    /bot|crawler|spider|curl|wget|python-requests|httpie|scrapy|headless|phantom|puppeteer|playwright|axios\/|go-http|libwww|postman|java\/|okhttp|node-fetch|undici|httpclient|scan|exploit/i;

  var SHARED_IP_MAX = 4;

  function normalizeEmail(email) {
    if (!email) return "";
    return String(email).trim().toLowerCase();
  }

  function normalizePhone(phone) {
    if (!phone) return "";
    var d = String(phone).replace(/\D/g, "");
    if (d.indexOf("33") === 0 && d.length === 11) d = "0" + d.slice(2);
    if (d.length === 9 && /^[67]/.test(d)) d = "0" + d;
    return d.length >= 10 ? d.slice(-9) : d;
  }

  function normalizeIp(ip) {
    if (!ip) return "";
    var s = String(ip).split(",")[0].trim();
    if (s.indexOf("::ffff:") === 0) s = s.slice(7);
    if (s === "unknown" || s === "127.0.0.1" || s === "::1") return "";
    return s.slice(0, 45);
  }

  function emailDomain(email) {
    var e = normalizeEmail(email);
    var i = e.lastIndexOf("@");
    return i > 0 ? e.slice(i + 1) : "";
  }

  function isDisposableEmail(email) {
    var d = emailDomain(email);
    if (!d) return false;
    var rootDom = d.split(".").slice(0, -1).join(".") || d.split(".")[0];
    return !!(DISPOSABLE[d] || DISPOSABLE[rootDom] || DISPOSABLE[d.split(".")[0]]);
  }

  function isBotUa(ua) {
    var s = String(ua || "").trim();
    if (!s) return true;
    if (s.length < 20) return true;
    return BOT_UA.test(s);
  }

  function uaSummary(ua) {
    var s = String(ua || "").trim();
    if (!s) return "UA vide";
    if (/mobile/i.test(s) && /safari|chrome|firefox|crios/i.test(s)) return "Mobile";
    if (/windows/i.test(s) && /chrome|firefox|edg/i.test(s)) return "Windows";
    if (/macintosh|mac os/i.test(s)) return "Mac";
    if (/linux/i.test(s) && /chrome|firefox/i.test(s)) return "Linux";
    if (isBotUa(s)) return "Robot / script";
    return s.slice(0, 42);
  }

  function scoreTrust(input) {
    input = input || {};
    var score = 55;
    var reasons = [];
    var email = normalizeEmail(input.email);
    var phone = normalizePhone(input.phone);
    var ip = normalizeIp(input.ip || input.clientIp);
    var ua = input.ua || input.clientUa || "";
    var ipCount = Number(input.ipIdentityCount || 0);
    var country = String(input.country || input.visitor_country || "").toUpperCase();

    if (email && email.indexOf("@") > 0) {
      score += 12;
      reasons.push("email");
      if (isDisposableEmail(email)) {
        score -= 28;
        reasons.push("email jetable");
      }
    } else {
      score -= 8;
      reasons.push("sans email");
    }

    if (phone.length >= 9) {
      score += 14;
      reasons.push("téléphone");
    } else {
      score -= 6;
      reasons.push("sans téléphone");
    }

    if (isBotUa(ua)) {
      score -= 38;
      reasons.push("user-agent robot");
    } else {
      score += 10;
      reasons.push("navigateur réel");
    }

    if (!ip) {
      score -= 8;
      reasons.push("IP absente");
    } else if (ipCount >= SHARED_IP_MAX) {
      score -= 32;
      reasons.push("IP partagée (" + ipCount + " identités)");
    } else if (ipCount >= 2) {
      score -= 8;
      reasons.push("même IP, plusieurs dossiers");
    }

    if (country && country !== "FR" && country.indexOf("FR-") !== 0) {
      score -= 22;
      reasons.push("hors France (" + country + ")");
    }

    if (input.honeypot) {
      score -= 50;
      reasons.push("honeypot");
    }
    if (input.phone_format_warning) {
      score -= 10;
      reasons.push("tél. non FR");
    }
    if (Number(input.questionnaire_step) >= Number(input.questionnaire_total) && Number(input.questionnaire_total) > 0) {
      score += 8;
      reasons.push("parcours complet");
    }
    if (input.gclid || input.fbclid || input.ttclid) {
      score += 6;
      reasons.push("clic pub");
    }

    if (score < 0) score = 0;
    if (score > 100) score = 100;
    var label = "humain";
    if (score < 35) label = "spam";
    else if (score < 55) label = "suspect";
    return { score: score, label: label, reasons: reasons };
  }

  function matchPair(a, b) {
    a = a || {};
    b = b || {};
    if (a.id && b.id && a.id === b.id) return { reasons: [], strength: "" };
    var reasons = [];
    var ea = normalizeEmail(a.email);
    var eb = normalizeEmail(b.email);
    var pa = normalizePhone(a.phone);
    var pb = normalizePhone(b.phone);
    var ia = normalizeIp(a.ip || a.clientIp);
    var ib = normalizeIp(b.ip || b.clientIp);
    var va = String(a.visitorId || a.visitor_id || "").trim();
    var vb = String(b.visitorId || b.visitor_id || "").trim();

    if (ea && eb && ea === eb) reasons.push("email");
    if (pa && pb && pa === pb) reasons.push("téléphone");
    if (va && vb && va === vb) reasons.push("visitor_id");
    if (ia && ib && ia === ib) reasons.push("ip");

    var identity = reasons.indexOf("email") >= 0 || reasons.indexOf("téléphone") >= 0;
    var sameBrowser = reasons.indexOf("visitor_id") >= 0;
    var onlyIp = reasons.length === 1 && reasons[0] === "ip";
    var strength = "";
    if (identity) strength = "identity";
    else if (sameBrowser && reasons.indexOf("ip") >= 0) strength = "identity";
    else if (sameBrowser) strength = "likely";
    else if (onlyIp) strength = "ip";
    else if (reasons.length) strength = "weak";
    return { reasons: reasons, strength: strength };
  }

  function canFuse(match) {
    return match && (match.strength === "identity" || match.strength === "likely");
  }

  function canLink(match) {
    return match && match.reasons && match.reasons.length > 0;
  }

  function clusterItems(items, ipCounts) {
    items = items || [];
    ipCounts = ipCounts || {};
    var parent = items.map(function (_, i) {
      return i;
    });
    function find(i) {
      while (parent[i] !== i) {
        parent[i] = parent[parent[i]];
        i = parent[i];
      }
      return i;
    }
    function union(i, j) {
      var a = find(i);
      var b = find(j);
      if (a !== b) parent[a] = b;
    }
    var i;
    var j;
    for (i = 0; i < items.length; i++) {
      for (j = i + 1; j < items.length; j++) {
        var m = matchPair(items[i], items[j]);
        if (!m.strength) continue;
        if (m.strength === "ip") {
          var ip = normalizeIp(items[i].ip || items[i].clientIp);
          if ((ipCounts[ip] || 0) >= SHARED_IP_MAX) continue;
        }
        if (canLink(m)) union(i, j);
      }
    }
    var groups = {};
    items.forEach(function (item, idx) {
      var root = find(idx);
      if (!groups[root]) groups[root] = [];
      groups[root].push(item);
    });
    return Object.keys(groups)
      .map(function (k) {
        return groups[k];
      })
      .filter(function (g) {
        return g.length > 1;
      });
  }

  function countIdentitiesByIp(items) {
    var map = {};
    (items || []).forEach(function (it) {
      var ip = normalizeIp(it.ip || it.clientIp);
      if (!ip) return;
      if (!map[ip]) map[ip] = {};
      var key = normalizeEmail(it.email) || normalizePhone(it.phone) || it.id || "x";
      map[ip][key] = true;
    });
    var counts = {};
    Object.keys(map).forEach(function (ip) {
      counts[ip] = Object.keys(map[ip]).length;
    });
    return counts;
  }

  var api = {
    SHARED_IP_MAX: SHARED_IP_MAX,
    normalizeEmail: normalizeEmail,
    normalizePhone: normalizePhone,
    normalizeIp: normalizeIp,
    isDisposableEmail: isDisposableEmail,
    isBotUa: isBotUa,
    uaSummary: uaSummary,
    scoreTrust: scoreTrust,
    matchPair: matchPair,
    canFuse: canFuse,
    canLink: canLink,
    clusterItems: clusterItems,
    countIdentitiesByIp: countIdentitiesByIp,
  };
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LeadIdentity = api;
})(typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : this);
