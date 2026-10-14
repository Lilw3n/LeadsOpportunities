/**
 * Libellés IP côté navigateur — résolution exact /24 /16.
 */
(function (root) {
  function normalizeIp(ip) {
    if (!ip) return "";
    var s = String(ip).trim();
    if (s.indexOf("::ffff:") === 0) s = s.slice(7);
    return s;
  }

  function prefix24(ip) {
    var n = normalizeIp(ip);
    var p = n.split(".");
    if (p.length !== 4) return "";
    return p[0] + "." + p[1] + "." + p[2] + ".";
  }

  function prefix16(ip) {
    var n = normalizeIp(ip);
    var p = n.split(".");
    if (p.length !== 4) return "";
    return p[0] + "." + p[1] + ".";
  }

  function indexLabels(rows) {
    var map = {};
    (rows || []).forEach(function (r) {
      if (r && r.ip_key) map[String(r.ip_key).toLowerCase()] = r;
    });
    return map;
  }

  function resolve(ip, rowsOrMap) {
    var n = normalizeIp(ip);
    if (!n) return null;
    var map = Array.isArray(rowsOrMap) ? indexLabels(rowsOrMap) : rowsOrMap || {};
    if (map[n]) return Object.assign({ match: "exact" }, map[n]);
    var p24 = prefix24(n);
    if (p24 && map[p24]) return Object.assign({ match: "24" }, map[p24]);
    var p16 = prefix16(n);
    if (p16 && map[p16]) return Object.assign({ match: "16" }, map[p16]);
    return null;
  }

  function badgeHtml(hit, escFn) {
    if (!hit || !hit.label) return "";
    var esc =
      escFn ||
      function (s) {
        return String(s || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/"/g, "&quot;");
      };
    var tip = hit.label;
    if (hit.note) tip += " — " + hit.note;
    if (hit.match === "24") tip += " (préfixe /24)";
    if (hit.match === "16") tip += " (préfixe /16)";
    tip += " — hypothèse manuelle, peut être erronée";
    return (
      '<span class="ip-label-badge" title="' +
      esc(tip) +
      '">👤 ' +
      esc(hit.label) +
      "</span>"
    );
  }

  var api = {
    normalizeIp: normalizeIp,
    prefix24: prefix24,
    prefix16: prefix16,
    indexLabels: indexLabels,
    resolve: resolve,
    badgeHtml: badgeHtml,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.IpLabelLib = api;
})(typeof window !== "undefined" ? window : globalThis);
