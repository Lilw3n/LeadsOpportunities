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

  function growthClass(pct) {
    if (pct > 0) return "traf-growth--up";
    if (pct < 0) return "traf-growth--down";
    return "traf-growth--flat";
  }

  function growthLabel(pct) {
    if (pct > 0) return "+" + pct + " % vs semaine précédente";
    if (pct < 0) return pct + " % vs semaine précédente";
    return "= semaine précédente";
  }

  function renderCompare(cmp) {
    var items = [
      { key: "visitors", label: "Visiteurs uniques", icon: "👥" },
      { key: "page_views", label: "Pages vues", icon: "📄" },
      { key: "form_starts", label: "Débuts formulaire", icon: "📝" },
      { key: "leads_crm", label: "Leads CRM", icon: "🎯" },
    ];
    document.getElementById("trafCompare").innerHTML = items
      .map(function (it) {
        var d = cmp[it.key] || {};
        var up = (d.growth_pct || 0) > 0;
        return (
          '<div class="traf-card">' +
          "<h3>" +
          it.icon +
          " " +
          esc(it.label) +
          "</h3>" +
          '<div class="traf-big">' +
          esc(d.this_week) +
          "</div>" +
          '<div class="traf-sub">Semaine préc. : <strong>' +
          esc(d.last_week) +
          "</strong></div>" +
          '<div class="' +
          growthClass(d.growth_pct) +
          '" style="margin-top:8px;font-size:0.9rem">' +
          esc(growthLabel(d.growth_pct)) +
          (up ? " ↑" : d.growth_pct < 0 ? " ↓" : "") +
          "</div></div>"
        );
      })
      .join("");
  }

  function renderSummary(cmp) {
    var v = cmp.visitors || {};
    var verdict =
      v.growth_pct > 0
        ? "Trafic en hausse cette semaine"
        : v.growth_pct < 0
          ? "Trafic en baisse cette semaine"
          : "Trafic stable";
    document.getElementById("trafSummary").innerHTML =
      '<span class="acq-stat">Visiteurs 7j <strong>' +
      (v.this_week || 0) +
      "</strong></span>" +
      '<span class="acq-stat">Évolution <strong class="' +
      growthClass(v.growth_pct) +
      '">' +
      esc(growthLabel(v.growth_pct)) +
      "</strong></span>" +
      '<span class="acq-stat">' +
      esc(verdict) +
      "</span>";
  }

  function renderChart(trend) {
    var el = document.getElementById("trafChart");
    if (!trend || !trend.length) {
      el.innerHTML = '<p style="color:var(--muted)">Pas encore de données journey_events.</p>';
      return;
    }
    var max = Math.max.apply(
      null,
      trend.map(function (t) {
        return t.visitors || 0;
      }).concat([1])
    );
    el.innerHTML = trend
      .map(function (t) {
        var h = Math.round(((t.visitors || 0) / max) * 100);
        var day = String(t.day).slice(5);
        return (
          '<div class="traf-bar-wrap" title="' +
          esc(t.day) +
          " — " +
          t.visitors +
          " visiteurs, " +
          t.page_views +
          ' vues">' +
          '<div class="traf-bar" style="height:' +
          h +
          '%"></div>' +
          '<span class="traf-bar-label">' +
          esc(day) +
          "</span></div>"
        );
      })
      .join("");
  }

  function renderTopPages(pages) {
    var el = document.getElementById("trafTopPages");
    if (!pages || !pages.length) {
      el.innerHTML = '<p style="color:var(--muted)">Aucune page vue enregistrée.</p>';
      return;
    }
    el.innerHTML =
      "<table><thead><tr><th>Page</th><th>Vues (7j)</th><th></th></tr></thead><tbody>" +
      pages
        .map(function (p) {
          var url = p.path.indexOf("http") === 0 ? p.path : "https://www.leadsopportunities.fr" + p.path;
          return (
            "<tr><td><code>" +
            esc(p.path) +
            '</code></td><td><strong>' +
            p.views +
            '</strong></td><td><a href="' +
            esc(url) +
            '" target="_blank" rel="noopener" class="btn btn-ghost btn-sm">Ouvrir ↗</a></td></tr>'
          );
        })
        .join("") +
      "</tbody></table>";
  }

  function renderAlertConfig(cfg) {
    var badge = document.getElementById("trafAlertBadge");
    var desc = document.getElementById("trafAlertDesc");
    if (!cfg) return;
    if (cfg.enabled) {
      badge.textContent = "Actif ✓";
      badge.className = "acq-badge meta";
    } else if (cfg.slack_configured) {
      badge.textContent = "Désactivé";
      badge.className = "acq-badge muted";
    } else {
      badge.textContent = "Slack manquant";
      badge.className = "acq-badge muted";
    }
    desc.textContent =
      "Seuil : " +
      cfg.threshold_pct +
      " % · min. " +
      cfg.min_visitors_last_week +
      " visiteurs semaine préc. · cooldown " +
      cfg.cooldown_hours +
      " h · cron 9h (Paris). Variables : TRAFFIC_ALERT_THRESHOLD_PCT, SLACK_WEBHOOK_URL.";
  }

  function runAlertCheck(force) {
    var out = document.getElementById("trafAlertResult");
    out.textContent = "Vérification…";
    fetch("/api/crm/traffic-alert-test" + (force ? "?force=1" : ""), {
      method: "POST",
      headers: authHeaders(),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!res.ok && res.error) {
          out.textContent = res.error;
          out.style.color = "#b91c1c";
          return;
        }
        if (res.alerted) {
          out.textContent = "✓ Alerte envoyée sur Slack";
          out.style.color = "#16a34a";
        } else if (res.on_cooldown) {
          out.textContent = "Cooldown actif — pas de nouvel envoi";
          out.style.color = "var(--muted)";
        } else if (!res.should_alert) {
          out.textContent = res.reason || "Pas d'alerte (trafic OK ou volume faible)";
          out.style.color = "#16a34a";
        } else {
          out.textContent = res.slack_error || res.reason || "Pas envoyé";
          out.style.color = "#b91c1c";
        }
      })
      .catch(function (e) {
        out.textContent = String(e);
        out.style.color = "#b91c1c";
      });
  }

  function renderExternal(links) {
    var el = document.getElementById("trafExternal");
    el.innerHTML = (links || [])
      .map(function (l) {
        return (
          '<a href="' +
          esc(l.url) +
          '" target="_blank" rel="noopener" class="btn btn-primary btn-sm">' +
          esc(l.label) +
          " ↗</a>"
        );
      })
      .join("");
    el.innerHTML +=
      '<a href="https://search.google.com/search-console" target="_blank" rel="noopener" class="btn btn-ghost btn-sm">Search Console ↗</a>';
  }

  function load() {
    var days = document.getElementById("trafTrendDays").value || 30;
    fetch("/api/crm/traffic-stats?trendDays=" + encodeURIComponent(days), { headers: authHeaders() })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!res.ok) throw new Error(res.error || "Erreur");
        renderSummary(res.comparison);
        renderCompare(res.comparison);
        renderChart(res.trend);
        renderTopPages(res.top_pages);
        renderExternal(res.analytics_links);
        renderAlertConfig(res.alert_config);
        document.getElementById("trafNote").textContent = res.note || "";
      })
      .catch(function (e) {
        document.getElementById("trafCompare").innerHTML =
          '<p style="color:#b91c1c">' + esc(String(e)) + "</p>";
      });
  }

  document.getElementById("btnTrafRefresh").onclick = load;
  document.getElementById("trafTrendDays").onchange = load;
  document.getElementById("btnTrafAlertTest").onclick = function () {
    runAlertCheck(false);
  };
  document.getElementById("btnTrafAlertForce").onclick = function () {
    runAlertCheck(true);
  };
  load();
})();
