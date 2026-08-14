(function () {
  var TOKEN_KEY = "lo_token";
  var token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    location.href = "./crm.html";
    return;
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : s;
    return d.innerHTML;
  }

  function authHeaders() {
    return { Authorization: "Bearer " + token, "Content-Type": "application/json" };
  }

  function euro(n) {
    if (n == null || n === "") return "—";
    return Number(n).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " €";
  }

  function fmtDay(iso) {
    if (!iso) return "—";
    var p = String(iso).slice(0, 10).split("-");
    if (p.length !== 3) return iso;
    return p[2] + "/" + p[1];
  }

  function fmtDateTime(iso) {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return iso;
    }
  }

  function moneyClass(cpl) {
    if (cpl == null) return "";
    if (cpl === 0) return "roi-good";
    if (cpl <= 15) return "roi-good";
    if (cpl <= 25) return "roi-ok";
    return "roi-bad";
  }

  function kpisHtml(k, from, to) {
    var best = k.best_platform;
    return (
      '<div class="acq-stat">Leads <strong>' +
      k.leads +
      "</strong></div>" +
      '<div class="acq-stat">Dont pubs <strong>' +
      k.paid_leads +
      "</strong></div>" +
      '<div class="acq-stat">Organique <strong>' +
      k.organic_leads +
      "</strong></div>" +
      '<div class="acq-stat">Qualifiés (≥70) <strong>' +
      k.qualified +
      "</strong></div>" +
      '<div class="acq-stat">Dépense <strong>' +
      euro(k.spend_eur) +
      "</strong></div>" +
      '<div class="acq-stat">CPL pubs <strong class="' +
      moneyClass(k.cpl_eur) +
      '">' +
      euro(k.cpl_eur) +
      "</strong></div>" +
      '<div class="acq-stat">CPL qualifié <strong>' +
      euro(k.cpl_qualified_eur) +
      "</strong></div>" +
      '<div class="acq-stat">Meilleur réseau <strong>' +
      (best ? esc(best.label) + " · " + euro(best.cpl_eur) : "—") +
      "</strong></div>"
    );
  }

  function cardsHtml(platforms) {
    if (!platforms || !platforms.length) return "<p>Aucun lead sur la période.</p>";
    var max = Math.max.apply(
      null,
      platforms.map(function (p) {
        return p.leads;
      })
    ) || 1;
    return platforms
      .map(function (p) {
        var w = Math.max(4, Math.round((p.leads / max) * 100));
        var top = p.top_verticals && p.top_verticals[0] ? p.top_verticals[0].key : "—";
        return (
          '<article class="roi-card" style="border-top-color:' +
          esc(p.color) +
          '">' +
          "<h3>" +
          esc(p.icon) +
          " " +
          esc(p.label) +
          "</h3>" +
          '<div class="roi-card-nums">' +
          "<div><strong>" +
          p.leads +
          "</strong><span>leads</span></div>" +
          "<div><strong>" +
          euro(p.spend_eur) +
          "</strong><span>dépense</span></div>" +
          "<div><strong class=\"" +
          moneyClass(p.cpl_eur) +
          '">' +
          euro(p.cpl_eur) +
          "</strong><span>CPL</span></div>" +
          "</div>" +
          '<div class="roi-bar"><span style="width:' +
          w +
          "%;background:" +
          esc(p.color) +
          '"></span></div>' +
          '<p class="roi-card-meta">' +
          (p.share_pct || 0) +
          " % du volume · score moy. " +
          (p.avg_score != null ? p.avg_score : "—") +
          " · qualifiés " +
          p.qualified +
          " · top : " +
          esc(top) +
          (p.paid && p.daily_budget_eur
            ? " · budget " + euro(p.daily_budget_eur) + "/j"
            : "") +
          "</p>" +
          '<a class="btn btn-ghost btn-sm" href="./dashboard.html?section=leads&amp;platform=' +
          encodeURIComponent(p.id) +
          '">Voir les leads →</a>' +
          "</article>"
        );
      })
      .join("");
  }

  function budgetsHtml(platforms) {
    return (platforms || [])
      .filter(function (p) {
        return p.paid;
      })
      .map(function (p) {
        return (
          '<form class="roi-budget-card" data-platform="' +
          esc(p.id) +
          '" style="border-left:4px solid ' +
          esc(p.color) +
          '">' +
          "<h3>" +
          esc(p.icon) +
          " " +
          esc(p.label) +
          "</h3>" +
          '<label>Budget / jour (€)' +
          '<input type="number" name="daily" class="crm-input" min="0" step="0.01" value="' +
          (p.daily_budget_eur || 0) +
          '" /></label>' +
          '<p class="roi-card-meta">Estimé période : ' +
          euro(p.estimated_eur) +
          (p.actual_days ? " · réel saisi : " + euro(p.actual_eur) + " (" + p.actual_days + " j)" : "") +
          "</p>" +
          '<button type="submit" class="btn btn-ghost btn-sm">Enregistrer</button>' +
          "</form>"
        );
      })
      .join("");
  }

  function tableHtml(platforms) {
    if (!platforms || !platforms.length) return "<p>Aucune donnée.</p>";
    return (
      '<div class="table-wrap"><table class="roi-table"><thead><tr>' +
      "<th>Réseau</th><th>Leads</th><th>%</th><th>Score</th><th>Qualifiés</th><th>Convertis</th>" +
      "<th>Budget/j</th><th>Dépense</th><th>CPL</th><th>CPL qualifié</th>" +
      "</tr></thead><tbody>" +
      platforms
        .map(function (p) {
          return (
            "<tr><td>" +
            esc(p.icon) +
            " " +
            esc(p.label) +
            "</td><td><strong>" +
            p.leads +
            "</strong></td><td>" +
            (p.share_pct || 0) +
            " %</td><td>" +
            (p.avg_score != null ? p.avg_score : "—") +
            "</td><td>" +
            p.qualified +
            "</td><td>" +
            p.converted +
            "</td><td>" +
            euro(p.daily_budget_eur) +
            "</td><td>" +
            euro(p.spend_eur) +
            "</td><td class=\"" +
            moneyClass(p.cpl_eur) +
            '">' +
            euro(p.cpl_eur) +
            "</td><td>" +
            euro(p.cpl_qualified_eur) +
            "</td></tr>"
          );
        })
        .join("") +
      "</tbody></table></div>"
    );
  }

  function trendHtml(trend) {
    if (!trend || !trend.length) return "<p>Pas de série.</p>";
    var max = Math.max.apply(
      null,
      trend.map(function (d) {
        return d.total || 0;
      })
    ) || 1;
    return (
      '<div class="roi-trend">' +
      trend
        .map(function (d) {
          var h = Math.max(2, Math.round(((d.total || 0) / max) * 80));
          return (
            '<div class="roi-trend-col" title="' +
            esc(d.day) +
            " : " +
            (d.total || 0) +
            ' lead(s)"><span style="height:' +
            h +
            'px"></span><em>' +
            esc(fmtDay(d.day)) +
            "</em></div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function matrixHtml(matrix, platforms) {
    if (!matrix || !matrix.length) return "<p>Pas de croisement.</p>";
    var cols = (platforms || []).filter(function (p) {
      return p.leads > 0 || p.paid;
    });
    return (
      '<div class="table-wrap"><table class="roi-table"><thead><tr><th>Produit</th>' +
      cols
        .map(function (p) {
          return "<th>" + esc(p.label) + "</th>";
        })
        .join("") +
      "<th>Total</th></tr></thead><tbody>" +
      matrix
        .map(function (row) {
          return (
            "<tr><td>" +
            esc(row.vertical) +
            "</td>" +
            cols
              .map(function (p) {
                var n = (row.by_platform && row.by_platform[p.id]) || 0;
                return "<td>" + (n || "·") + "</td>";
              })
              .join("") +
            "<td><strong>" +
            row.total +
            "</strong></td></tr>"
          );
        })
        .join("") +
      "</tbody></table></div>"
    );
  }

  function campaignsHtml(entries) {
    if (!entries || !entries.length) return "<p>Pas de campagne UTM.</p>";
    return (
      "<table><thead><tr><th>Campagne</th><th>Leads</th></tr></thead><tbody>" +
      entries
        .map(function (e) {
          return "<tr><td>" + esc(e.key) + "</td><td><strong>" + e.count + "</strong></td></tr>";
        })
        .join("") +
      "</tbody></table>"
    );
  }

  function linksHtml(platforms) {
    return (platforms || [])
      .map(function (p) {
        var primary = (p.links || []).filter(function (l) {
          return l.primary;
        }).slice(0, 2);
        return (
          '<div class="pub-link-row" style="margin-bottom:8px"><strong>' +
          esc(p.icon) +
          " " +
          esc(p.label) +
          "</strong> " +
          primary
            .map(function (l) {
              return (
                '<a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="' +
                esc(l.url) +
                '">' +
                esc(l.label) +
                " ↗</a>"
              );
            })
            .join(" ") +
          "</div>"
        );
      })
      .join("");
  }

  function recentHtml(rows) {
    if (!rows || !rows.length) return "<p>Aucun lead récent.</p>";
    return (
      '<div class="table-wrap"><table class="roi-table"><thead><tr>' +
      "<th>Date</th><th>Réseau</th><th>Produit</th><th>Score</th><th>Contact</th><th></th>" +
      "</tr></thead><tbody>" +
      rows
        .map(function (l) {
          return (
            "<tr><td>" +
            esc(fmtDateTime(l.created_at)) +
            "</td><td>" +
            esc(l.network_label || l.network) +
            "</td><td>" +
            esc(l.vertical) +
            "</td><td>" +
            (l.lead_score != null ? l.lead_score : "—") +
            "</td><td>" +
            esc(l.email || l.phone || "—") +
            '</td><td><a class="btn btn-ghost btn-sm" href="./dashboard.html?section=leads&amp;lead=' +
            encodeURIComponent(l.id) +
            '">Ouvrir</a></td></tr>'
          );
        })
        .join("") +
      "</tbody></table></div>"
    );
  }

  function bindBudgets() {
    document.querySelectorAll(".roi-budget-card").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var platform = form.getAttribute("data-platform");
        var daily = parseFloat(form.querySelector('[name="daily"]').value) || 0;
        fetch("/api/crm/leads-roi", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ op: "budget", platform: platform, daily_budget_eur: daily }),
        })
          .then(function (r) {
            return r.json();
          })
          .then(function (res) {
            if (!res.ok) alert(res.error || "Erreur budget");
            else load();
          })
          .catch(function (err) {
            alert(String(err));
          });
      });
    });
  }

  function load() {
    var days = document.getElementById("roiDays").value;
    var platform = document.getElementById("roiPlatform").value;
    var qs = "?days=" + encodeURIComponent(days);
    if (platform) qs += "&platform=" + encodeURIComponent(platform);
    fetch("/api/crm/leads-roi" + qs, { headers: authHeaders() })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (!data.ok) {
          document.getElementById("roiKpis").innerHTML = "<p>" + esc(data.error || "Erreur") + "</p>";
          return;
        }
        document.getElementById("roiPeriodHint").textContent =
          "Du " +
          (data.from || "") +
          " au " +
          (data.to || "") +
          (data.truncated ? " — échantillon limité à 3 000 leads." : "");
        document.getElementById("roiKpis").innerHTML = kpisHtml(data.kpis || {}, data.from, data.to);
        document.getElementById("roiCards").innerHTML = cardsHtml(data.platforms);
        document.getElementById("roiBudgets").innerHTML = budgetsHtml(data.platforms);
        document.getElementById("roiTable").innerHTML = tableHtml(data.platforms);
        document.getElementById("roiTrend").innerHTML = trendHtml(data.trend);
        document.getElementById("roiMatrix").innerHTML = matrixHtml(data.matrix, data.platforms);
        document.getElementById("roiCampaigns").innerHTML = campaignsHtml(data.by_campaign);
        document.getElementById("roiLinks").innerHTML = linksHtml(data.platform_links);
        document.getElementById("roiRecent").innerHTML = recentHtml(data.recent);
        bindBudgets();
        var form = document.getElementById("roiSpendForm");
        if (form && data.from) {
          var fromEl = form.querySelector('[name="from"]');
          var toEl = form.querySelector('[name="to"]');
          if (fromEl && !fromEl.value) fromEl.value = data.from;
          if (toEl && !toEl.value) toEl.value = data.to;
        }
      })
      .catch(function (e) {
        document.getElementById("roiKpis").innerHTML = "<p>" + esc(String(e)) + "</p>";
      });
  }

  document.getElementById("btnRoiRefresh").addEventListener("click", load);
  document.getElementById("roiDays").addEventListener("change", load);
  document.getElementById("roiPlatform").addEventListener("change", load);

  document.getElementById("roiSpendForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var form = e.target;
    var msg = document.getElementById("roiSpendMsg");
    msg.textContent = "Enregistrement…";
        var from = form.querySelector('[name="from"]').value;
        var to = form.querySelector('[name="to"]').value;
        var amount = parseFloat(form.querySelector('[name="amount"]').value);
        fetch("/api/crm/leads-roi", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            op: "spend",
            platform: form.platform.value,
            from: from,
            to: to,
            amount_eur: amount,
          }),
        })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        msg.textContent = res.ok ? "Dépense enregistrée ✓" : res.error || "Erreur";
        if (res.ok) load();
      })
      .catch(function (err) {
        msg.textContent = String(err);
      });
  });

  load();
})();
