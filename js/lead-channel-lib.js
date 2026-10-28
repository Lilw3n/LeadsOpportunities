/**
 * D’où vient un lead : pub (quel réseau, quelle campagne, quelle annonce),
 * SEO (quel moteur, quelle page), article de blog, réseaux sans pub,
 * lien depuis un autre site, accès direct.
 * Navigateur : window.LeadChannel  |  Node : module.exports
 *
 * Données lues : colonnes site_leads (utm_*, gclid, fbclid, ttclid, msclkid,
 * landing_slug, source, platform) + payload envoyé par js/attribution.js
 * (referrer_first, landing_path, attr_first_* / attr_last_*, blog_article).
 */
(function (root) {
  var SEARCH_ENGINES = [
    { re: /(^|\.)google\./, label: "Google" },
    { re: /(^|\.)bing\.com$/, label: "Bing" },
    { re: /(^|\.)qwant\.com$/, label: "Qwant" },
    { re: /(^|\.)duckduckgo\.com$/, label: "DuckDuckGo" },
    { re: /(^|\.)ecosia\.org$/, label: "Ecosia" },
    { re: /(^|\.)yahoo\./, label: "Yahoo" },
    { re: /(^|\.)lilo\.org$/, label: "Lilo" },
    { re: /(^|\.)search\.brave\.com$/, label: "Brave" },
    { re: /(^|\.)yandex\./, label: "Yandex" },
  ];

  var SOCIALS = [
    { re: /(^|\.)(facebook\.com|fb\.com|fb\.me|m\.facebook\.com|l\.facebook\.com|lm\.facebook\.com)$/, label: "Facebook" },
    { re: /(^|\.)instagram\.com$/, label: "Instagram" },
    { re: /(^|\.)tiktok\.com$/, label: "TikTok" },
    { re: /(^|\.)linkedin\.com$|(^|\.)lnkd\.in$/, label: "LinkedIn" },
    { re: /(^|\.)(t\.co|twitter\.com|x\.com)$/, label: "X" },
    { re: /(^|\.)youtube\.com$/, label: "YouTube" },
    { re: /(^|\.)pinterest\./, label: "Pinterest" },
    { re: /(^|\.)snapchat\.com$/, label: "Snapchat" },
    { re: /(^|\.)(whatsapp\.com|wa\.me)$/, label: "WhatsApp" },
  ];

  var OWN_HOSTS = /(^|\.)(leadsopportunities\.fr|assurancevtcfrance\.com|vercel\.app|localhost)$/;

  var PAID_MEDIUM = /^(cpc|ppc|paid|paid[_-]?social|paidsocial|cpm|cpa|display|ads?|sea|social[_-]?paid|retargeting)$/i;
  var SOCIAL_MEDIUM = /^(social|organic[_-]?social|social[_-]?organic|post|story|reel|bio)$/i;
  var EMAIL_MEDIUM = /^(e-?mail|newsletter|mailing|sms)$/i;
  var ORGANIC_MEDIUM = /^(organic|seo)$/i;

  function payloadOf(row) {
    var p = row && row.payload;
    if (!p) return {};
    if (typeof p === "string") {
      try {
        return JSON.parse(p) || {};
      } catch (e) {
        return {};
      }
    }
    return p;
  }

  function first() {
    for (var i = 0; i < arguments.length; i++) {
      var v = arguments[i];
      if (v != null && String(v).trim()) return String(v).trim();
    }
    return "";
  }

  function hostOf(url) {
    var s = String(url || "").trim();
    if (!s) return "";
    var m = s.match(/^[a-z]+:\/\/([^/?#:]+)/i);
    return m ? m[1].toLowerCase().replace(/^www\./, "") : "";
  }

  function match(list, host) {
    for (var i = 0; i < list.length; i++) if (list[i].re.test(host)) return list[i].label;
    return "";
  }

  function networkFromSource(src) {
    var s = String(src || "").toLowerCase();
    if (/meta|facebook|fb|instagram|ig\b/.test(s)) return "Meta";
    if (/google|gads|adwords|youtube/.test(s)) return "Google";
    if (/tiktok/.test(s)) return "TikTok";
    if (/bing|microsoft/.test(s)) return "Bing";
    if (/linkedin/.test(s)) return "LinkedIn";
    if (/snap/.test(s)) return "Snapchat";
    return "";
  }

  function cleanPath(p) {
    var s = String(p || "").trim();
    if (!s) return "";
    if (/^https?:\/\//i.test(s)) {
      var m = s.match(/^https?:\/\/[^/]+(\/[^?#]*)?/i);
      s = (m && m[1]) || "/";
    }
    s = s.split("?")[0].split("#")[0];
    if (s && s.charAt(0) !== "/") s = "/" + s;
    return s.slice(0, 160);
  }

  /**
   * @returns {{ channel: string, label: string, network: string, campaign: string,
   *   ad: string, keyword: string, page: string, article: string, referrer: string, detail: string }}
   *   channel ∈ pub | seo | social | email | referral | partner | manual | direct
   */
  function classify(row) {
    row = row || {};
    var p = payloadOf(row);
    var source = first(row.source, p.source).toLowerCase();
    var platform = first(row.platform, p.platform).toLowerCase();

    var utmSource = first(row.utm_source, p.attr_last_utm_source, p.utm_source, p.attr_first_utm_source);
    var utmMedium = first(row.utm_medium, p.attr_last_utm_medium, p.utm_medium, p.attr_first_utm_medium);
    var campaign = first(row.utm_campaign, p.attr_last_utm_campaign, p.utm_campaign, p.attr_first_utm_campaign, p.campaign_name, p.campaignName);
    var ad = first(p.ad_name, p.adName, row.utm_content, p.attr_last_utm_content, p.utm_content, p.attr_first_utm_content);
    var keyword = first(row.utm_term, p.attr_last_utm_term, p.utm_term, p.attr_first_utm_term);
    var gclid = first(row.gclid, p.gclid, p.attr_last_gclid, p.attr_first_gclid, row.msclkid, p.msclkid);
    var fbclid = first(row.fbclid, p.fbclid, p.attr_last_fbclid, p.attr_first_fbclid);
    var ttclid = first(row.ttclid, p.ttclid);
    var referrer = first(p.referrer_first, p.referrer, row.referrer);
    var refHost = hostOf(referrer);
    var page = cleanPath(first(p.landing_path, row.landing_slug, p.landing_slug, p.page_path, row.page_path));
    var article = first(row.article_title, p.blog_article && String(p.blog_article).indexOf("/") < 0 ? p.blog_article : "");
    if (!article && /^\/blog\//.test(page)) article = page.replace(/^\/blog\//, "").replace(/\.html$/, "");

    var out = {
      channel: "direct",
      label: "Accès direct",
      network: "",
      campaign: campaign,
      ad: ad,
      keyword: keyword,
      page: page,
      article: article,
      referrer: refHost,
      detail: "",
    };

    // 1. Saisie à la main dans le CRM
    if (source === "crm" || source.indexOf("crm_") === 0 || source.indexOf("crm-") === 0) {
      out.channel = "manual";
      out.label = "Saisie CRM";
      return finish(out);
    }

    // 2. Pub : identifiant de clic, formulaire Lead Ads, ou utm_medium payant
    var paidNetwork = "";
    if (source === "meta_lead_ads" || /lead[_-]?ads/.test(source)) paidNetwork = "Meta";
    else if (fbclid && (PAID_MEDIUM.test(utmMedium) || campaign)) paidNetwork = "Meta";
    else if (gclid) paidNetwork = row.msclkid || p.msclkid ? "Bing" : "Google";
    else if (ttclid) paidNetwork = "TikTok";
    else if (PAID_MEDIUM.test(utmMedium)) paidNetwork = networkFromSource(utmSource) || utmSource || "Pub";
    if (paidNetwork) {
      out.channel = "pub";
      out.network = paidNetwork;
      out.label = "Pub " + paidNetwork + (source === "meta_lead_ads" ? " (formulaire Facebook)" : "");
      return finish(out);
    }

    // 3. Partenaires / sites satellites
    if (platform === "withallo" || source.indexOf("withallo") >= 0) {
      out.channel = "partner";
      out.label = "Withallo (appel)";
      return finish(out);
    }

    // 4. Mail / SMS
    if (EMAIL_MEDIUM.test(utmMedium)) {
      out.channel = "email";
      out.label = "Mail / SMS" + (utmSource ? " " + utmSource : "");
      return finish(out);
    }

    // 5. Moteur de recherche sans pub = SEO
    var engine = match(SEARCH_ENGINES, refHost);
    if (engine || ORGANIC_MEDIUM.test(utmMedium)) {
      out.channel = "seo";
      out.network = engine || networkFromSource(utmSource) || "Google";
      out.label = "SEO " + out.network;
      return finish(out);
    }

    // 6. Réseaux sociaux sans pub (post, bio, partage), fbclid sans campagne compris
    var social = match(SOCIALS, refHost) || (SOCIAL_MEDIUM.test(utmMedium) ? networkFromSource(utmSource) || utmSource : "");
    if (social || fbclid) {
      out.channel = "social";
      out.network = social || "Facebook";
      out.label = out.network + " (sans pub)";
      return finish(out);
    }

    // 7. Lien depuis un autre site
    if (refHost && !OWN_HOSTS.test(refHost)) {
      out.channel = "referral";
      out.label = "Lien depuis " + refHost;
      return finish(out);
    }

    // 8. Site VTC dédié (domaine satellite) sans autre signal
    if (platform === "assurancevtcfrance" || source.indexOf("assurancevtcfrance") >= 0) {
      out.channel = "direct";
      out.label = "Site assurancevtcfrance.com (accès direct)";
      return finish(out);
    }

    // 9. Rien : favori, appli, lien copié, ou navigateur qui masque la provenance
    out.label = utmSource ? "Lien suivi (" + utmSource + ")" : "Accès direct";
    return finish(out);
  }

  function finish(out) {
    var bits = [];
    if (out.campaign) bits.push("campagne " + out.campaign);
    if (out.ad && out.ad !== out.campaign && out.ad !== out.article) bits.push("annonce " + out.ad);
    if (out.keyword) bits.push("mot-clé « " + out.keyword + " »");
    if (out.article) bits.push("article " + out.article);
    else if (out.page) bits.push("page " + out.page);
    out.detail = bits.join(" · ");
    return out;
  }

  var CHANNEL_LABELS = {
    pub: "Pub",
    seo: "SEO",
    social: "Réseaux sans pub",
    email: "Mail / SMS",
    referral: "Lien externe",
    partner: "Partenaire",
    manual: "Saisie CRM",
    direct: "Direct",
  };

  var api = { classify: classify, hostOf: hostOf, CHANNEL_LABELS: CHANNEL_LABELS };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.LeadChannel = api;
})(typeof window !== "undefined" ? window : globalThis);
