(function () {
  var TOKEN_KEY = "lo_token";
  var allAlerts = [];
  var filter = "all";
  var searchQ = "";

  if (!localStorage.getItem(TOKEN_KEY)) {
    location.href = "./crm.html";
    return;
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  function filtered() {
    return allAlerts.filter(function (a) {
      if (filter !== "all" && a.category !== filter) return false;
      if (searchQ) {
        var q = searchQ.toLowerCase();
        return (
          String(a.title || "").toLowerCase().indexOf(q) >= 0 ||
          String(a.message || "").toLowerCase().indexOf(q) >= 0 ||
          String(a.ruleId || "").toLowerCase().indexOf(q) >= 0
        );
      }
      return true;
    });
  }

  function render() {
    var items = filtered();
    var mount = document.getElementById("alertMount");
    if (!window.CrmAlertsPanel) {
      mount.innerHTML = "<p>Module alertes indisponible.</p>";
      return;
    }
    mount.innerHTML = window.CrmAlertsPanel.render(items, esc, { variant: "full" });
  }

  function paintCounts(c) {
    c = c || {};
    document.getElementById("counts").innerHTML =
      '<div class="kpi-card"><div class="kpi-label">Total</div><div class="kpi-value">' +
      (c.total || 0) +
      '</div></div><div class="kpi-card"><div class="kpi-label">Éligibilité</div><div class="kpi-value">' +
      (c.eligibility || 0) +
      '</div></div><div class="kpi-card"><div class="kpi-label">Sinistres</div><div class="kpi-value">' +
      (c.claimAging || 0) +
      '</div></div><div class="kpi-card"><div class="kpi-label">Rappels</div><div class="kpi-value">' +
      (c.reminders || 0) +
      '</div></div><div class="kpi-card"><div class="kpi-label">Événements</div><div class="kpi-value">' +
      (c.events || 0) +
      "</div></div>";
  }

  fetch("/api/crm/intelligent-alerts", {
    headers: { Authorization: "Bearer " + localStorage.getItem(TOKEN_KEY) },
  })
    .then(function (r) {
      return r.json();
    })
    .then(function (res) {
      if (!res.ok) {
        document.getElementById("alertMount").innerHTML =
          '<div class="crm-empty-state"><h3>Alertes indisponibles</h3><p>' +
          esc(res.error || "Erreur serveur") +
          "</p></div>";
        return;
      }
      allAlerts = res.alerts || [];
      paintCounts(res.counts);
      render();
    })
    .catch(function () {
      document.getElementById("alertMount").innerHTML =
        '<div class="crm-empty-state"><h3>Connexion impossible</h3><p>Le service alertes ne répond pas.</p></div>';
    });

  document.getElementById("btnMarkAll").onclick = function () {
    try {
      localStorage.setItem("lo_alerts_read_at", String(Date.now()));
    } catch (e) {}
    allAlerts = [];
    paintCounts({ total: 0, eligibility: 0, claimAging: 0, reminders: 0, events: 0 });
    document.getElementById("alertMount").innerHTML = window.CrmAlertsPanel
      ? window.CrmAlertsPanel.render([], esc, { variant: "full" })
      : "<p>Aucune alerte affichée.</p>";
  };

  document.querySelectorAll("#filters .crm-filter-chip").forEach(function (btn) {
    btn.onclick = function () {
      filter = btn.getAttribute("data-f") || "all";
      document.querySelectorAll("#filters .crm-filter-chip").forEach(function (b) {
        b.classList.toggle("active", b === btn);
      });
      render();
    };
  });

  var searchEl = document.getElementById("alertSearch");
  if (searchEl) {
    searchEl.oninput = function () {
      searchQ = this.value.trim();
      render();
    };
  }
})();
