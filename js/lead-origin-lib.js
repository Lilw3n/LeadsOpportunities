/**
 * Reconstruit l'URL d'origine d'un lead (page + UTM + hash).
 * Navigateur : window.LeadOrigin  |  Node : module.exports
 */
(function (root) {
  function parsePayload(lead) {
    if (!lead) return {};
    if (lead.payload_obj && typeof lead.payload_obj === "object") return lead.payload_obj;
    var p = lead.payload;
    if (p && typeof p === "object") return p;
    if (typeof p === "string" && p.trim()) {
      try {
        return JSON.parse(p);
      } catch (e) {
        return {};
      }
    }
    return {};
  }

  function pick(lead, payload, keys) {
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var v = lead && lead[k];
      if (v != null && String(v).trim() !== "") return String(v).trim();
      v = payload && payload[k];
      if (v != null && String(v).trim() !== "") return String(v).trim();
    }
    return "";
  }

  function hostFromDomain(domain) {
    var d = String(domain || "")
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "")
      .replace(/^www\./, "");
    if (!d) return "";
    if (/assurancevtcfrance/.test(d)) return "assurancevtcfrance.com";
    if (/leadsopportunities/.test(d)) return "www.leadsopportunities.fr";
    return d;
  }

  function inferHost(lead, payload) {
    var domain =
      pick(lead, payload, ["site_domain", "siteDomain"]) ||
      pick(lead, payload, ["utm_source", "source", "platform"]);
    var host = hostFromDomain(domain);
    if (host) return host;
    var page = pick(lead, payload, ["page_url", "page", "landing_path", "landing_slug"]);
    if (/^https?:\/\//i.test(page)) {
      try {
        return new URL(page).host.replace(/^www\./, "") === "assurancevtcfrance.com"
          ? "assurancevtcfrance.com"
          : new URL(page).host;
      } catch (e) {
        /* ignore */
      }
    }
    if (/assurancevtcfrance/i.test(String(lead && (lead.platform || lead.source || lead.utm_source) || ""))) {
      return "assurancevtcfrance.com";
    }
    return "www.leadsopportunities.fr";
  }

  function normalizePath(raw) {
    var p = String(raw || "").trim();
    if (!p) return "/";
    if (/^https?:\/\//i.test(p)) {
      try {
        var u = new URL(p);
        return (u.pathname || "/") + (u.search || "") + (u.hash || "");
      } catch (e) {
        return "/";
      }
    }
    if (p.charAt(0) !== "/" && p.charAt(0) !== "?" && p.charAt(0) !== "#") p = "/" + p;
    return p;
  }

  function appendQuery(url, key, value) {
    if (!value) return url;
    var sep = url.indexOf("?") >= 0 ? "&" : "?";
    return url + sep + encodeURIComponent(key) + "=" + encodeURIComponent(value);
  }

  /**
   * @returns {{ url: string, host: string, short: string, referrer: string }}
   */
  function build(lead) {
    lead = lead || {};
    var payload = parsePayload(lead);
    var pageUrl = pick(lead, payload, ["page_url", "pageUrl", "origin_url", "originUrl"]);
    var referrer = pick(lead, payload, ["referrer", "referrer_first", "referrerFirst"]);

    if (pageUrl && /^https?:\/\//i.test(pageUrl)) {
      var shortFull = pageUrl.length > 72 ? pageUrl.slice(0, 69) + "…" : pageUrl;
      var hostFull = "";
      try {
        hostFull = new URL(pageUrl).host;
      } catch (e) {
        hostFull = "";
      }
      return { url: pageUrl, host: hostFull, short: shortFull, referrer: referrer };
    }

    var host = inferHost(lead, payload);
    var pathRaw =
      pageUrl ||
      pick(lead, payload, ["page", "landing_path", "landing_slug"]) ||
      "/";
    var pathPart = normalizePath(pathRaw);
    var hash = pick(lead, payload, ["page_hash", "pageHash", "hash"]);
    if (hash && hash.charAt(0) !== "#") hash = "#" + hash;

    var pathOnly = pathPart;
    var searchFromPath = "";
    var hashFromPath = "";
    var qi = pathOnly.indexOf("?");
    var hi = pathOnly.indexOf("#");
    if (hi >= 0) {
      hashFromPath = pathOnly.slice(hi);
      pathOnly = pathOnly.slice(0, hi);
    }
    if (qi >= 0) {
      searchFromPath = pathOnly.slice(qi);
      pathOnly = pathOnly.slice(0, qi);
    }
    if (!pathOnly) pathOnly = "/";

    var url = "https://" + host + pathOnly + searchFromPath;

    var utmSource = pick(lead, payload, ["utm_source", "attr_last_utm_source"]);
    var utmMedium = pick(lead, payload, ["utm_medium", "attr_last_utm_medium"]);
    var utmCampaign = pick(lead, payload, ["utm_campaign", "attr_last_utm_campaign"]);
    var utmContent = pick(lead, payload, ["utm_content", "attr_last_utm_content"]);
    var utmTerm = pick(lead, payload, ["utm_term", "attr_last_utm_term"]);

    function hasParam(q, name) {
      return new RegExp("[?&]" + name + "=").test(q);
    }
    if (!hasParam(searchFromPath, "utm_source") && utmSource) url = appendQuery(url, "utm_source", utmSource);
    if (!hasParam(searchFromPath, "utm_medium") && utmMedium) url = appendQuery(url, "utm_medium", utmMedium);
    if (!hasParam(searchFromPath, "utm_campaign") && utmCampaign) url = appendQuery(url, "utm_campaign", utmCampaign);
    if (!hasParam(searchFromPath, "utm_content") && utmContent) url = appendQuery(url, "utm_content", utmContent);
    if (!hasParam(searchFromPath, "utm_term") && utmTerm) url = appendQuery(url, "utm_term", utmTerm);

    var finalHash = hash || hashFromPath || "";
    if (finalHash && url.indexOf("#") < 0) url += finalHash;

    var short = url.length > 72 ? url.slice(0, 69) + "…" : url;
    return { url: url, host: host, short: short, referrer: referrer };
  }

  function formatCell(lead, escFn) {
    var esc =
      escFn ||
      function (s) {
        return String(s == null ? "" : s)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/"/g, "&quot;");
      };
    var o = build(lead);
    if (!o.url) return "—";
    return (
      '<a class="lead-origin-link" href="' +
      esc(o.url) +
      '" target="_blank" rel="noopener noreferrer" title="' +
      esc(o.url) +
      '" onclick="event.stopPropagation()">' +
      esc(o.short) +
      "</a>"
    );
  }

  function formatDetail(lead, escFn) {
    var esc =
      escFn ||
      function (s) {
        return String(s == null ? "" : s)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/"/g, "&quot;");
      };
    var o = build(lead);
    var html =
      '<div class="detail-item detail-full"><div class="dlabel">D\'où vient le lead</div><div class="dvalue">';
    if (o.url) {
      html +=
        '<a href="' +
        esc(o.url) +
        '" target="_blank" rel="noopener noreferrer" style="word-break:break-all;font-weight:600">' +
        esc(o.url) +
        "</a>";
    } else {
      html += "—";
    }
    if (o.referrer) {
      html +=
        '<div style="margin-top:6px;font-size:0.82rem;color:var(--muted)">Referrer : <code style="word-break:break-all">' +
        esc(o.referrer) +
        "</code></div>";
    }
    html += "</div></div>";
    return html;
  }

  var api = {
    build: build,
    formatCell: formatCell,
    formatDetail: formatDetail,
    parsePayload: parsePayload,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.LeadOrigin = api;
})(typeof window !== "undefined" ? window : globalThis);
