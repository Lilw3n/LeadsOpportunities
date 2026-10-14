/**
 * Catégorisation visiteurs / IP pour le CRM (affichage uniquement, pas de blocage).
 * Navigateur : window.LeadVisitorCategory  |  Node : module.exports
 */
(function (root) {
  /** Préfixes Meta / Facebook (AS32934) observés sur les landings */
  var META_PREFIXES = [
    "57.141.",
    "173.252.",
    "31.13.",
    "157.240.",
    "69.171.",
    "66.220.",
    "185.60.216.",
    "185.60.217.",
    "185.60.218.",
    "185.60.219.",
    "204.15.20.",
    "102.132.",
    "163.70.",
  ];

  /** Préfixes cloud fréquents (bots / scanners) — volontairement restreints */
  var CLOUD_PREFIXES = [
    "34.219.",
    "34.210.",
    "34.211.",
    "34.212.",
    "34.213.",
    "34.214.",
    "34.215.",
    "34.216.",
    "34.217.",
    "34.218.",
    "52.32.",
    "52.33.",
    "52.34.",
    "52.35.",
    "35.180.",
    "35.181.",
    "104.196.",
    "35.184.",
    "66.249.",
  ];

  var TEST_EMAIL =
    /@(example\.com|example\.org|test\.local|localhost)$/i;
  var TEST_LOCAL =
    /^(test|flood|audit|spam|fake|demo|noreply|no-reply)([+._-]|$)/i;

  function normalizeIp(ip) {
    if (!ip) return "";
    var s = String(ip).trim();
    if (s.indexOf("::ffff:") === 0) s = s.slice(7);
    return s;
  }

  function ipStartsWith(ip, prefixes) {
    var n = normalizeIp(ip);
    if (!n) return false;
    for (var i = 0; i < prefixes.length; i++) {
      if (n.indexOf(prefixes[i]) === 0) return true;
    }
    return false;
  }

  function hasContact(lead) {
    var email = String((lead && (lead.email || lead.Email)) || "").trim();
    var phone = String((lead && (lead.phone || lead.Phone)) || "").trim();
    if (email && !TEST_EMAIL.test(email)) return true;
    if (phone && phone.replace(/\D/g, "").length >= 8) return true;
    return false;
  }

  function isTestLead(lead) {
    var email = String((lead && lead.email) || "").trim().toLowerCase();
    if (!email) return false;
    if (TEST_EMAIL.test(email)) return true;
    var local = email.split("@")[0] || "";
    if (TEST_LOCAL.test(local)) return true;
    if (/test-audit|flood@|xyz@example/i.test(email)) return true;
    return false;
  }

  function leadScore(lead) {
    var s = lead && lead.lead_score != null ? Number(lead.lead_score) : NaN;
    return isNaN(s) ? 0 : s;
  }

  function sourceOf(lead) {
    return String(
      (lead && (lead.platform || lead.source || lead.utm_source)) || ""
    ).toLowerCase();
  }

  function funnelAbandoned(lead) {
    var p = (lead && lead.payload) || {};
    var f = p.funnel || {};
    return !!(f.abandonedAt || lead.pipeline_stage === "abandoned" || lead.status === "abandoned");
  }

  /**
   * @returns {{ id, label, intent, tone, org }}
   */
  function categorize(lead) {
    lead = lead || {};
    var ip = normalizeIp(lead.client_ip || lead.clientIp || lead.ip || "");
    var score = leadScore(lead);
    var contact = hasContact(lead);
    var src = sourceOf(lead);
    var manual =
      (lead.ipLabel && String(lead.ipLabel).trim()) ||
      (lead.manualLabel && String(lead.manualLabel).trim()) ||
      "";

    /* Libellé manuel prioritaire (ex. « mon pote ») même sur une plage Meta */
    if (manual) {
      var metaHint = ipStartsWith(ip, META_PREFIXES);
      return {
        id: "named",
        label: manual,
        org: metaHint
          ? "Nommé manuellement · plage aussi utilisée par Meta"
          : "Nommé manuellement",
        intent: metaHint
          ? "Tu as identifié cette IP (ou ce préfixe). WHOIS = Meta, mais ton nom reste affiché en priorité — à confirmer avec email/tél."
          : "Identification manuelle CRM — peut être corrigée à tout moment",
        tone: "good",
      };
    }

    if (ipStartsWith(ip, META_PREFIXES)) {
      return {
        id: "bot_meta",
        label: "Plage Meta",
        org: "Facebook / Meta (AS32934) — WHOIS",
        intent:
          "Cette plage (ex. 57.141.x.y) est enregistrée chez Meta. Souvent : preview pub / crawler. Le dernier chiffre change = pool de serveurs. Si tu penses que c’est un proche, utilise « Nommer » : ton libellé passera devant.",
        tone: "bot",
      };
    }

    if (ipStartsWith(ip, CLOUD_PREFIXES)) {
      return {
        id: "bot_cloud",
        label: "Bot cloud",
        org: "AWS / GCP / scan",
        intent: "Scan ou monitoring automatisé — pas un prospect",
        tone: "bot",
      };
    }

    if (isTestLead(lead)) {
      return {
        id: "test",
        label: "Test",
        org: "Session de test",
        intent: "Essai interne ou audit (email fictif) — à ignorer",
        tone: "test",
      };
    }

    if (contact && score >= 50) {
      return {
        id: "prospect",
        label: "Prospect",
        org: "Humain (FR probable)",
        intent: "A laissé un contact et avancé dans le parcours — à traiter",
        tone: "good",
      };
    }

    if (contact && (funnelAbandoned(lead) || score < 50)) {
      return {
        id: "abandon",
        label: "Abandon",
        org: "Humain probable",
        intent: "A commencé (tél/email) puis a quitté — rappel possible",
        tone: "warn",
      };
    }

    if (!contact && score <= 5 && (src.indexOf("wizard") >= 0 || src.indexOf("landing") >= 0)) {
      return {
        id: "noise",
        label: "Bruit",
        org: "Bot ou clic vide",
        intent: "Parcours wizard sans contact — robot ou ouverture accidentelle",
        tone: "muted",
      };
    }

    if (contact) {
      return {
        id: "prospect",
        label: "Prospect",
        org: "Humain",
        intent: "Contact présent — à qualifier",
        tone: "good",
      };
    }

    return {
      id: "unknown",
      label: "À voir",
      org: ip ? "IP non classée" : "Sans IP",
      intent: "Pas assez de signaux — ouvrir la fiche",
      tone: "muted",
    };
  }

  function badgeHtml(cat, escFn) {
    var esc =
      escFn ||
      function (s) {
        return String(s || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/"/g, "&quot;");
      };
    cat = cat || categorize({});
    return (
      '<span class="visitor-cat visitor-cat--' +
      esc(cat.tone || cat.id) +
      '" title="' +
      esc((cat.org ? cat.org + " — " : "") + (cat.intent || "")) +
      '">' +
      esc(cat.label) +
      "</span>"
    );
  }

  function detailHtml(cat, escFn) {
    var esc =
      escFn ||
      function (s) {
        return String(s || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/"/g, "&quot;");
      };
    cat = cat || categorize({});
    return (
      '<div class="visitor-cat-detail visitor-cat-detail--' +
      esc(cat.tone || cat.id) +
      '">' +
      '<strong>' +
      esc(cat.label) +
      "</strong>" +
      (cat.org ? " · " + esc(cat.org) : "") +
      "<br><span>" +
      esc(cat.intent) +
      "</span></div>"
    );
  }

  var api = {
    categorize: categorize,
    badgeHtml: badgeHtml,
    detailHtml: detailHtml,
    normalizeIp: normalizeIp,
    META_PREFIXES: META_PREFIXES,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.LeadVisitorCategory = api;
})(typeof window !== "undefined" ? window : globalThis);
