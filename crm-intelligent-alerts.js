(function () {
  var TOKEN_KEY = "lo_token";
  var allAlerts = [];
  var filter = "all";

  if (!localStorage.getItem(TOKEN_KEY)) {
    location.href = "./crm.html";
    return;
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  function render() {
    var items = allAlerts.filter(function (a) {
      return filter === "all" || a.category === filter;
    });
    if (!items.length) {
      document.getElementById("alertMount").innerHTML = "<p class='panel'>Aucune alerte</p>";
      return;
    }
    document.getElementById("alertMount").innerHTML = items
      .map(function (a) {
        var href = a.href || (a.contactId ? "./crm-contact.html?id=" + encodeURIComponent(a.contactId) : "#");
        return (
          '<div class="alert-card ' +
          esc(a.priority) +
          '"><div class="alert-cat">' +
          esc(a.category) +
          " · " +
          esc(a.ruleId || "") +
          '</div><a href="' +
          href +
          '"><strong>' +
          esc(a.title) +
          "</strong></a><p style='margin:4px 0 0;color:var(--muted);font-size:.9rem'>" +
          esc(a.message) +
          "</p><button type='button' class='btn btn-ghost btn-sm btn-relance-alert' data-cid='" +
          esc(a.contactId || "") +
          "'>Relancer</button></div>"
        );
      })
      .join("");
    document.querySelectorAll(".btn-relance-alert").forEach(function (btn) {
      btn.onclick = function (e) {
        e.preventDefault();
        var cid = btn.getAttribute("data-cid");
        if (cid) location.href = "./crm-contact.html?id=" + encodeURIComponent(cid);
        else alert("Relance simulée — configurez SMTP dans Paramètres.");
      };
    });
  }

  fetch("/api/crm/intelligent-alerts", {
    headers: { Authorization: "Bearer " + localStorage.getItem(TOKEN_KEY) },
  })
    .then(function (r) {
      return r.json();
    })
    .then(function (res) {
      if (!res.ok) {
        document.getElementById("alertMount").innerHTML = "<p>Erreur</p>";
        return;
      }
      allAlerts = res.alerts || [];
      var c = res.counts || {};
      document.getElementById("counts").innerHTML =
        '<div class="kpi-card panel"><div class="kpi-label">Éligibilité</div><div class="kpi-value">' +
        (c.eligibility || 0) +
        '</div></div><div class="kpi-card panel"><div class="kpi-label">Sinistres</div><div class="kpi-value">' +
        (c.claimAging || 0) +
        '</div></div><div class="kpi-card panel"><div class="kpi-label">Rappels</div><div class="kpi-value">' +
        (c.reminders || 0) +
        "</div></div>";
      render();
    });

  var btnAll = document.getElementById("btnMarkAll");
  if (btnAll) {
    btnAll.onclick = function () {
      try {
        localStorage.setItem("lo_alerts_read_at", String(Date.now()));
      } catch (e) {}
      document.getElementById("alertMount").innerHTML =
        "<p class='panel'>Toutes les alertes marquées comme lues.</p>";
    };
  }

  document.querySelectorAll("#filters button").forEach(function (btn) {
    btn.onclick = function () {
      filter = btn.getAttribute("data-f");
      document.querySelectorAll("#filters button").forEach(function (b) {
        b.classList.toggle("active", b === btn);
      });
      render();
    };
  });
})();
