/**
 * Courbe visiteurs CRM trafic — dates YYYY-MM-DD + SVG (Node + navigateur).
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.TrafficChart = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  function pad2(n) {
    return String(n).length < 2 ? "0" + n : String(n);
  }

  function normalizeDay(value) {
    if (value == null || value === "") return "";
    if (Object.prototype.toString.call(value) === "[object Date]") {
      if (isNaN(value.getTime())) return "";
      return value.toISOString().slice(0, 10);
    }
    var s = String(value).trim();
    var m = s.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
    var d = new Date(s);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    return "";
  }

  function formatDayLabel(day) {
    var key = normalizeDay(day);
    var m = key.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return String(day || "");
    return m[3] + "/" + m[2];
  }

  function addUtcDays(isoDay, delta) {
    var p = String(isoDay).split("-");
    var d = new Date(Date.UTC(Number(p[0]), Number(p[1]) - 1, Number(p[2]) + delta));
    return d.getUTCFullYear() + "-" + pad2(d.getUTCMonth() + 1) + "-" + pad2(d.getUTCDate());
  }

  function todayUtc() {
    var d = new Date();
    return d.getUTCFullYear() + "-" + pad2(d.getUTCMonth() + 1) + "-" + pad2(d.getUTCDate());
  }

  function fillTrendDays(trend, days, endDay) {
    var n = Math.min(Math.max(Number(days) || 30, 1), 90);
    var end = normalizeDay(endDay) || todayUtc();
    var map = {};
    (trend || []).forEach(function (row) {
      var key = normalizeDay(row && row.day);
      if (!key) return;
      map[key] = {
        day: key,
        visitors: Number(row.visitors) || 0,
        page_views: Number(row.page_views) || 0,
      };
    });
    var out = [];
    var i;
    for (i = n - 1; i >= 0; i--) {
      var key = addUtcDays(end, -i);
      out.push(map[key] || { day: key, visitors: 0, page_views: 0 });
    }
    return out;
  }

  function niceMax(n) {
    n = Number(n) || 0;
    if (n <= 1) return 1;
    var mag = Math.pow(10, Math.floor(Math.log10(n)));
    var norm = n / mag;
    var nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
    return nice * mag;
  }

  function xmlEsc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderSvg(trend) {
    var rows = trend && trend.length ? trend : [];
    if (!rows.length) {
      return '<p class="traf-chart-empty">Pas encore de données journey_events.</p>';
    }
    var w = 640;
    var h = 240;
    var padL = 42;
    var padR = 12;
    var padT = 18;
    var padB = 36;
    var innerW = w - padL - padR;
    var innerH = h - padT - padB;
    var maxVis = 0;
    rows.forEach(function (r) {
      if ((r.visitors || 0) > maxVis) maxVis = r.visitors || 0;
    });
    var yMax = niceMax(maxVis);
    var last = rows.length - 1;
    var xAt = function (i) {
      return padL + (last <= 0 ? innerW / 2 : (i / last) * innerW);
    };
    var yAt = function (v) {
      return padT + innerH - (yMax <= 0 ? 0 : (v / yMax) * innerH);
    };
    var line = rows
      .map(function (r, i) {
        return (i === 0 ? "M" : "L") + xAt(i).toFixed(1) + " " + yAt(r.visitors || 0).toFixed(1);
      })
      .join(" ");
    var area =
      "M" +
      xAt(0).toFixed(1) +
      " " +
      yAt(0).toFixed(1) +
      " " +
      rows
        .map(function (r, i) {
          return "L" + xAt(i).toFixed(1) + " " + yAt(r.visitors || 0).toFixed(1);
        })
        .join(" ") +
      " L" +
      xAt(last).toFixed(1) +
      " " +
      yAt(0).toFixed(1) +
      " Z";
    var yTicks = [0, yMax / 2, yMax];
    var yGrid = yTicks
      .map(function (tick) {
        var y = yAt(tick);
        return (
          '<line x1="' +
          padL +
          '" y1="' +
          y.toFixed(1) +
          '" x2="' +
          (w - padR) +
          '" y2="' +
          y.toFixed(1) +
          '" stroke="#e2e8f0" stroke-width="1"/>' +
          '<text x="' +
          (padL - 6) +
          '" y="' +
          (y + 4).toFixed(1) +
          '" text-anchor="end" font-size="11" fill="#64748b">' +
          xmlEsc(String(Math.round(tick))) +
          "</text>"
        );
      })
      .join("");
    var labelEvery = rows.length > 45 ? 14 : rows.length > 21 ? 7 : rows.length > 10 ? 3 : 1;
    var xLabels = rows
      .map(function (r, i) {
        if (i !== 0 && i !== last && i % labelEvery !== 0) return "";
        return (
          '<text x="' +
          xAt(i).toFixed(1) +
          '" y="' +
          (h - 10) +
          '" text-anchor="middle" font-size="11" fill="#64748b">' +
          xmlEsc(formatDayLabel(r.day)) +
          "</text>"
        );
      })
      .join("");
    var dots = rows
      .map(function (r, i) {
        var show = rows.length <= 21 || i % Math.ceil(rows.length / 16) === 0 || i === last;
        if (!show) return "";
        return (
          '<circle cx="' +
          xAt(i).toFixed(1) +
          '" cy="' +
          yAt(r.visitors || 0).toFixed(1) +
          '" r="3.2" fill="#0284c7">' +
          "<title>" +
          xmlEsc(formatDayLabel(r.day) + " — " + (r.visitors || 0) + " visiteurs, " + (r.page_views || 0) + " vues") +
          "</title></circle>"
        );
      })
      .join("");
    return (
      '<svg class="traf-svg" viewBox="0 0 ' +
      w +
      " " +
      h +
      '" role="img" aria-label="Évolution quotidienne des visiteurs">' +
      '<rect x="0" y="0" width="' +
      w +
      '" height="' +
      h +
      '" fill="#fff" rx="8"/>' +
      yGrid +
      '<path d="' +
      area +
      '" fill="rgba(14,165,233,0.16)"/>' +
      '<path d="' +
      line +
      '" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>' +
      dots +
      xLabels +
      "</svg>"
    );
  }

  return {
    normalizeDay: normalizeDay,
    formatDayLabel: formatDayLabel,
    fillTrendDays: fillTrendDays,
    niceMax: niceMax,
    renderSvg: renderSvg,
  };
});
