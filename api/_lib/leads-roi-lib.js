/**
 * Agrégation leads × réseau × coût pub (CPL).
 * Indépendant de la base — testable unitairement.
 */
var { detectNetwork, networkLabel, parsePayload } = require("./lead-network");

var ROI_PLATFORMS = [
  { id: "facebook", label: "Meta", icon: "📘", color: "#1877f2", paid: true },
  { id: "instagram", label: "Instagram", icon: "📸", color: "#e4405f", paid: true },
  { id: "google", label: "Google", icon: "🔍", color: "#4285f4", paid: true },
  { id: "tiktok", label: "TikTok", icon: "🎵", color: "#111111", paid: true },
  { id: "linkedin", label: "LinkedIn", icon: "💼", color: "#0a66c2", paid: true },
  { id: "withallo", label: "WithAllo", icon: "📞", color: "#7c3aed", paid: true },
  { id: "site_web", label: "Site / organique", icon: "🌐", color: "#0d9488", paid: false },
  { id: "autre", label: "Autre", icon: "📋", color: "#94a3b8", paid: false },
];

var PAID_IDS = ROI_PLATFORMS.filter(function (p) {
  return p.paid;
}).map(function (p) {
  return p.id;
});

function round2(n) {
  if (n == null || !isFinite(n)) return null;
  return Math.round(n * 100) / 100;
}

function isoDay(value) {
  var d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function eachDay(sinceIso, days) {
  var out = [];
  var start = new Date(sinceIso);
  if (isNaN(start.getTime())) start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  for (var i = 0; i < days; i++) {
    out.push(new Date(start.getTime() + i * 86400000).toISOString().slice(0, 10));
  }
  return out;
}

function emptyBucket() {
  return {
    leads: 0,
    qualified: 0,
    converted: 0,
    score_sum: 0,
    score_n: 0,
    high_relevance: 0,
    by_vertical: {},
    by_campaign: {},
  };
}

function bump(map, key) {
  var k = key && String(key).trim() ? String(key).trim() : "(non renseigné)";
  map[k] = (map[k] || 0) + 1;
}

function topEntries(map, limit) {
  return Object.keys(map)
    .map(function (k) {
      return { key: k, count: map[k] };
    })
    .sort(function (a, b) {
      return b.count - a.count;
    })
    .slice(0, limit || 8);
}

function computeSpend(paid, daysList, dailyBudget, actualByDay) {
  var periodDays = (daysList || []).length;
  if (!paid) {
    return {
      spend_eur: 0,
      estimated_eur: 0,
      actual_eur: 0,
      actual_days: 0,
      estimated_days: 0,
      period_days: periodDays,
      daily_budget_eur: 0,
    };
  }
  var estimated = 0;
  var actual = 0;
  var actualDays = 0;
  var estimatedDays = 0;
  var budget = Number(dailyBudget) || 0;
  (daysList || []).forEach(function (day) {
    if (actualByDay && actualByDay[day] != null && actualByDay[day] !== "") {
      actual += Number(actualByDay[day]) || 0;
      actualDays++;
    } else {
      estimated += budget;
      estimatedDays++;
    }
  });
  return {
    spend_eur: round2(actual + estimated) || 0,
    estimated_eur: round2(estimated) || 0,
    actual_eur: round2(actual) || 0,
    actual_days: actualDays,
    estimated_days: estimatedDays,
    period_days: periodDays,
    daily_budget_eur: round2(budget) || 0,
  };
}

function cpl(spend, leads) {
  if (!leads) return null;
  if (!spend) return 0;
  return round2(spend / leads);
}

function aggregateLeadsRoi(rows, opts) {
  opts = opts || {};
  var days = Math.min(90, Math.max(1, parseInt(opts.days, 10) || 30));
  var since = opts.since || new Date(Date.now() - days * 86400000).toISOString();
  var daysList = opts.daysList || eachDay(since, days);
  var costs = opts.costs || {};
  var filter = opts.platform || "";

  var byNet = {};
  ROI_PLATFORMS.forEach(function (p) {
    byNet[p.id] = emptyBucket();
  });
  var byDay = {};
  daysList.forEach(function (d) {
    byDay[d] = { total: 0 };
  });
  var byVerticalAll = {};
  var byCampaignAll = {};
  var total = 0;

  (rows || []).forEach(function (row) {
    var net = detectNetwork(row);
    if (filter && net !== filter && !(filter === "facebook" && net === "instagram")) return;
    if (!byNet[net]) byNet[net] = emptyBucket();
    var b = byNet[net];
    b.leads++;
    total++;
    var score = Number(row.lead_score) || 0;
    if (score > 0) {
      b.score_sum += score;
      b.score_n++;
    }
    if (score >= 70) b.qualified++;
    var st = String(row.status || "").toLowerCase();
    if (st === "converted" || st === "won") b.converted++;
    var payload = parsePayload(row);
    var rel = row.relevance || payload.relevance;
    if (rel === "high") b.high_relevance++;
    bump(b.by_vertical, row.vertical || payload.vertical || payload.need);
    bump(b.by_campaign, row.utm_campaign || payload.utm_campaign);
    bump(byVerticalAll, row.vertical || payload.vertical || payload.need);
    bump(byCampaignAll, row.utm_campaign || payload.utm_campaign);

    var day = isoDay(row.created_at);
    if (day && byDay[day]) {
      byDay[day].total++;
      byDay[day][net] = (byDay[day][net] || 0) + 1;
    }
  });

  var platforms = ROI_PLATFORMS.map(function (meta) {
    var b = byNet[meta.id] || emptyBucket();
    var c = costs[meta.id] || {};
    var spend = computeSpend(meta.paid, daysList, c.daily_budget_eur, c.actualByDay);
    var avg = b.score_n ? Math.round(b.score_sum / b.score_n) : null;
    return {
      id: meta.id,
      label: meta.label,
      icon: meta.icon,
      color: meta.color,
      paid: meta.paid,
      leads: b.leads,
      qualified: b.qualified,
      converted: b.converted,
      high_relevance: b.high_relevance,
      avg_score: avg,
      share_pct: total ? round2((100 * b.leads) / total) : 0,
      spend_eur: spend.spend_eur,
      estimated_eur: spend.estimated_eur,
      actual_eur: spend.actual_eur,
      actual_days: spend.actual_days,
      estimated_days: spend.estimated_days,
      period_days: spend.period_days,
      daily_budget_eur: spend.daily_budget_eur,
      cpl_eur: cpl(spend.spend_eur, b.leads),
      cpl_qualified_eur: cpl(spend.spend_eur, b.qualified),
      top_verticals: topEntries(b.by_vertical, 5),
      top_campaigns: topEntries(b.by_campaign, 5),
    };
  }).filter(function (p) {
    return p.paid || p.id === "site_web" || p.leads > 0;
  });

  var spendTotal = platforms.reduce(function (s, p) {
    return s + (p.paid ? Number(p.spend_eur) || 0 : 0);
  }, 0);
  var actualEurTotal = platforms.reduce(function (s, p) {
    return s + (p.paid ? Number(p.actual_eur) || 0 : 0);
  }, 0);
  var estimatedEurTotal = platforms.reduce(function (s, p) {
    return s + (p.paid ? Number(p.estimated_eur) || 0 : 0);
  }, 0);
  var actualDaysTotal = platforms.reduce(function (s, p) {
    return s + (p.paid ? Number(p.actual_days) || 0 : 0);
  }, 0);
  var estimatedDaysTotal = platforms.reduce(function (s, p) {
    return s + (p.paid ? Number(p.estimated_days) || 0 : 0);
  }, 0);
  var paidLeads = platforms.reduce(function (s, p) {
    return s + (p.paid ? p.leads : 0);
  }, 0);
  var qualifiedTotal = platforms.reduce(function (s, p) {
    return s + p.qualified;
  }, 0);

  var rankedPaid = platforms
    .filter(function (p) {
      return p.paid && p.leads > 0;
    })
    .slice()
    .sort(function (a, b) {
      var ca = a.cpl_eur == null ? 9999 : a.cpl_eur;
      var cb = b.cpl_eur == null ? 9999 : b.cpl_eur;
      if (ca !== cb) return ca - cb;
      return b.leads - a.leads;
    });

  var verticals = Object.keys(byVerticalAll).sort();
  var matrix = verticals.map(function (vert) {
    var row = { vertical: vert, total: byVerticalAll[vert], by_platform: {} };
    ROI_PLATFORMS.forEach(function (p) {
      var n = (byNet[p.id] && byNet[p.id].by_vertical[vert]) || 0;
      row.by_platform[p.id] = n;
    });
    return row;
  });
  matrix.sort(function (a, b) {
    return b.total - a.total;
  });

  var trend = daysList.map(function (day) {
    var cell = byDay[day] || { total: 0 };
    return Object.assign({ day: day }, cell);
  });

  return {
    days: days,
    since: since,
    total: total,
    paid_leads: paidLeads,
    organic_leads: total - paidLeads,
    qualified: qualifiedTotal,
    spend_eur: round2(spendTotal) || 0,
    actual_eur: round2(actualEurTotal) || 0,
    estimated_eur: round2(estimatedEurTotal) || 0,
    actual_days: actualDaysTotal,
    estimated_days: estimatedDaysTotal,
    period_days: daysList.length,
    cpl_eur: cpl(spendTotal, paidLeads),
    cpl_all_eur: cpl(spendTotal, total),
    cpl_qualified_eur: cpl(spendTotal, qualifiedTotal),
    best_platform: rankedPaid[0] || null,
    platforms: platforms,
    matrix: matrix.slice(0, 12),
    by_campaign: topEntries(byCampaignAll, 12),
    by_vertical: topEntries(byVerticalAll, 12),
    trend: trend,
    network_label: networkLabel,
  };
}

function distributeSpend(amount, fromDay, toDay) {
  var start = new Date(fromDay + "T00:00:00.000Z");
  var end = new Date(toDay + "T00:00:00.000Z");
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return [];
  var days = Math.round((end - start) / 86400000) + 1;
  if (days < 1 || days > 92) return [];
  var total = Number(amount);
  if (!isFinite(total) || total < 0) return [];
  var base = Math.floor((total / days) * 100) / 100;
  var rows = [];
  var sum = 0;
  for (var i = 0; i < days; i++) {
    var day = new Date(start.getTime() + i * 86400000).toISOString().slice(0, 10);
    var val = i === days - 1 ? round2(total - sum) : base;
    sum = round2(sum + val);
    rows.push({ day: day, amount_eur: val });
  }
  return rows;
}

module.exports = {
  ROI_PLATFORMS: ROI_PLATFORMS,
  PAID_IDS: PAID_IDS,
  round2: round2,
  isoDay: isoDay,
  eachDay: eachDay,
  computeSpend: computeSpend,
  cpl: cpl,
  aggregateLeadsRoi: aggregateLeadsRoi,
  distributeSpend: distributeSpend,
  topEntries: topEntries,
};
