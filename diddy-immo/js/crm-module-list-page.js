(function (global) {
  var TOKEN_KEY = "lo_token";

  var SHELLS = {
    claims: {
      title: "📊 Liste des sinistres",
      subtitle: "Suivi sinistres assurance — module multisite",
      newHref: "./crm-claim-new.html",
      newLabel: "+ Nouveau sinistre",
      links: [
        ["crm-vehicles.html", "Sinistres ↔ Véhicules"],
        ["crm-drivers.html", "Sinistres ↔ Conducteurs"],
        ["crm-intelligent-alerts.html", "Sinistres ↔ Notifications"],
      ],
      kpis: function (items) {
        var open = items.filter(function (i) {
          var s = String(i.status || "").toLowerCase();
          return s.indexOf("cours") >= 0 || s.indexOf("attente") >= 0;
        }).length;
        var done = items.filter(function (i) {
          return String(i.status || "").toLowerCase().indexOf("clôtur") >= 0 || String(i.status || "").toLowerCase().indexOf("resolu") >= 0;
        }).length;
        return [
          ["Total sinistres", items.length],
          ["En cours", open],
          ["Résolus", done],
          ["En attente", items.length - open - done],
        ];
      },
    },
    vehicles: {
      title: "🚗 Liste des véhicules",
      subtitle: "Gestion complète de la flotte de véhicules",
      newHref: "./crm-vehicle-new.html",
      newLabel: "+ Ajouter un véhicule",
      links: [
        ["crm-drivers.html", "Véhicules ↔ Conducteurs"],
        ["crm-claims.html", "Véhicules ↔ Sinistres"],
        ["crm-contracts.html", "Véhicules ↔ Contrats"],
      ],
      kpis: function (items) {
        var active = items.filter(function (i) { return String(i.status || "").toLowerCase().indexOf("actif") >= 0; }).length;
        return [["Total véhicules", items.length], ["Actifs", active], ["En attente", items.length - active]];
      },
    },
    drivers: {
      title: "👨‍💼 Conducteurs",
      subtitle: "Permis, validité et statuts conducteurs",
      newHref: "./crm-driver-new.html",
      newLabel: "+ Ajouter un conducteur",
      links: [
        ["crm-vehicles.html", "Conducteurs ↔ Véhicules"],
        ["crm-claims.html", "Conducteurs ↔ Sinistres"],
      ],
      kpis: function (items) {
        var active = items.filter(function (i) { return String(i.status || "").toLowerCase().indexOf("actif") >= 0; }).length;
        return [["Total conducteurs", items.length], ["Actifs", active]];
      },
    },
    contracts: {
      title: "📄 Contrats",
      subtitle: "Polices actives, avenants et échéances",
      newHref: "./crm-contract-new.html",
      newLabel: "+ Nouveau contrat",
      links: [
        ["crm-periods.html", "Contrats ↔ Périodes"],
        ["crm-financial-receivables.html", "Contrats ↔ Créances"],
        ["crm-bank-details.html", "Coordonnées bancaires"],
      ],
      kpis: function (items) {
        var active = items.filter(function (i) { return String(i.status || "").toLowerCase().indexOf("actif") >= 0; }).length;
        return [["Total contrats", items.length], ["Actifs", active]];
      },
    },
  };

  function kpiCard(label, val) {
    return '<div class="kpi-card panel"><div class="kpi-label">' + label + '</div><div class="kpi-value">' + val + "</div></div>";
  }

  function filterItems(type, items, filter) {
    if (!filter) return items;
    if (type === "claims") {
      return items.filter(function (i) {
        var s = String(i.status || "").toLowerCase();
        if (filter === "open") return s.indexOf("cours") >= 0;
        if (filter === "pending") return s.indexOf("attente") >= 0;
        if (filter === "done") return s.indexOf("clôtur") >= 0 || s.indexOf("resolu") >= 0;
        return true;
      });
    }
    if (type === "contracts") {
      if (filter === "avenant") {
        return items.filter(function (i) {
          return String(i.description || "").indexOf("[Avenant") >= 0;
        });
      }
      if (filter === "active") {
        return items.filter(function (i) {
          return String(i.status || "").toLowerCase().indexOf("actif") >= 0;
        });
      }
    }
    return items;
  }

  function contractFiltersHtml() {
    return (
      '<div id="contractFilterBar" style="margin-bottom:12px;display:flex;flex-wrap:wrap;gap:8px">' +
      '<button type="button" class="btn btn-ghost btn-sm active" data-contract-filter="">Tous</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-contract-filter="active">Actifs</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-contract-filter="avenant">Avenants</button>' +
      "</div>"
    );
  }

  function claimFiltersHtml() {
    return (
      '<div id="claimFilterBar" style="margin-bottom:12px;display:flex;flex-wrap:wrap;gap:8px">' +
      '<button type="button" class="btn btn-ghost btn-sm active" data-claim-filter="">Tous</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-claim-filter="pending">En attente</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-claim-filter="open">En cours</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-claim-filter="done">Résolus</button>' +
      "</div>"
    );
  }

  function renderShell(type, items, tableHtml, extra) {
    extra = extra || "";
    var shell = SHELLS[type];
    if (!shell) return tableHtml;
    var kpis = shell.kpis(items || [])
      .map(function (pair) { return kpiCard(pair[0], pair[1]); })
      .join("");
    var links =
      '<p style="margin:0 0 12px;display:flex;flex-wrap:wrap;gap:8px">' +
      shell.links
        .map(function (pair) {
          return '<a href="./' + pair[0] + '" class="btn btn-ghost btn-sm">🔗 ' + pair[1] + "</a>";
        })
        .join("") +
      "</p>";
    return (
      (shell.title ? "<h2 style='margin:0 0 4px;font-size:1.05rem'>" + shell.title + "</h2>" : "") +
      (shell.subtitle ? "<p style='margin:0 0 12px;color:var(--muted);font-size:.9rem'>" + shell.subtitle + "</p>" : "") +
      '<p style="margin-bottom:12px"><a href="' +
      shell.newHref +
      '" class="btn btn-primary btn-sm">' +
      shell.newLabel +
      "</a></p>" +
      extra +
      links +
      '<div class="crm-kpis" style="margin-bottom:16px">' +
      kpis +
      "</div>" +
      tableHtml
    );
  }

  function makePage(type) {
    return function () {
      if (!localStorage.getItem(TOKEN_KEY)) {
        location.href = "./crm.html";
        return;
      }
      var box = document.getElementById("listMount");
      box.innerHTML = "<p>Chargement…</p>";
      fetch("/api/crm/modules-global?type=" + encodeURIComponent(type), {
        headers: { Authorization: "Bearer " + localStorage.getItem(TOKEN_KEY) },
      })
        .then(function (r) {
          return r.json();
        })
        .then(function (res) {
          if (!res.ok || !window.CrmModulesGlobal) {
            box.innerHTML = "<p>" + (res.error || "Erreur") + "</p>";
            return;
          }
          var items = res.items || [];
          var claimFilter = "";
          var contractFilter = "";

          function paint() {
            var filtered = filterItems(type, items, type === "claims" ? claimFilter : contractFilter);
            var tableHtml = window.CrmModulesGlobal.render(type, filtered);
            var extra = type === "claims" ? claimFiltersHtml() : type === "contracts" ? contractFiltersHtml() : "";
            box.innerHTML = renderShell(type, items, tableHtml, extra);
            if (type === "claims") {
              box.querySelectorAll("[data-claim-filter]").forEach(function (btn) {
                btn.onclick = function () {
                  claimFilter = btn.getAttribute("data-claim-filter") || "";
                  box.querySelectorAll("[data-claim-filter]").forEach(function (b) {
                    b.classList.toggle("active", b === btn);
                  });
                  paint();
                };
              });
            }
            if (type === "contracts") {
              box.querySelectorAll("[data-contract-filter]").forEach(function (btn) {
                btn.onclick = function () {
                  contractFilter = btn.getAttribute("data-contract-filter") || "";
                  box.querySelectorAll("[data-contract-filter]").forEach(function (b) {
                    b.classList.toggle("active", b === btn);
                  });
                  paint();
                };
              });
            }
          }
          paint();
        });
    };
  }

  global.CrmModuleListPage = {
    init: function (type) {
      document.addEventListener("DOMContentLoaded", makePage(type));
    },
  };
})(window);
