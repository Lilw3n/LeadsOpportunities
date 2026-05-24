(function () {
  var TOKEN_KEY = "lo_token";
  var token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    location.href = "./crm.html";
    return;
  }

  var COLS = [
    { id: "new", label: "Nouveau" },
    { id: "contacted", label: "Contacté" },
    { id: "qualified", label: "Qualifié" },
    { id: "converted", label: "Converti" },
    { id: "lost", label: "Perdu" },
  ];
  var allLeads = [];
  var searchQ = "";

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  function moveLead(id, status) {
    fetch("/api/dashboard/lead-update", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ leadId: id, status: status }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (r) {
        if (r.ok) load();
        else alert(r.error || "Erreur");
      });
  }

  function filtered() {
    var q = searchQ.toLowerCase().trim();
    if (!q) return allLeads;
    return allLeads.filter(function (l) {
      return (
        String(l.email || "")
          .toLowerCase()
          .indexOf(q) >= 0 ||
        String(l.phone || "")
          .toLowerCase()
          .indexOf(q) >= 0 ||
        String(l.id || "")
          .toLowerCase()
          .indexOf(q) >= 0
      );
    });
  }

  function render() {
    var leads = filtered();
    document.getElementById("kanTotal").textContent = leads.length + " lead(s) affiché(s)";
    document.getElementById("kanKpis").innerHTML = COLS.map(function (col) {
      var n = leads.filter(function (l) {
        return (l.status || "new") === col.id;
      }).length;
      return (
        '<div class="kpi-card panel"><div class="kpi-label">' +
        col.label +
        '</div><div class="kpi-value">' +
        n +
        "</div></div>"
      );
    }).join("");

    document.getElementById("kanban").innerHTML = COLS.map(function (col) {
      var items = leads.filter(function (l) {
        return (l.status || "new") === col.id;
      });
      return (
        '<div class="kan-col" data-col="' +
        col.id +
        '"><h3>' +
        col.label +
        " (" +
        items.length +
        ")</h3>" +
        items
          .map(function (l) {
            var others = COLS.filter(function (c) {
              return c.id !== col.id;
            })
              .slice(0, 2)
              .map(function (c) {
                return (
                  '<button type="button" class="btn btn-ghost btn-sm" data-move="' +
                  c.id +
                  '" data-id="' +
                  esc(l.id) +
                  '">→ ' +
                  c.label +
                  "</button>"
                );
              })
              .join("");
            return (
              '<div class="kan-card" draggable="true" data-id="' +
              esc(l.id) +
              '" data-status="' +
              col.id +
              '"><strong>' +
              esc(l.email || l.phone || l.id) +
              "</strong><br><span style='color:var(--muted)'>" +
              esc(l.vertical) +
              " · score " +
              (l.lead_score != null ? l.lead_score : "—") +
              '</span><div class="kan-actions">' +
              others +
              '<a class="btn btn-ghost btn-sm" href="./crm-leads-analysis.html">Analyser</a></div></div>'
            );
          })
          .join("") +
        "</div>"
      );
    }).join("");

    document.querySelectorAll("[data-move]").forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        moveLead(btn.getAttribute("data-id"), btn.getAttribute("data-move"));
      };
    });

    document.querySelectorAll(".kan-card").forEach(function (card) {
      card.ondragstart = function (e) {
        e.dataTransfer.setData("text/plain", card.getAttribute("data-id"));
      };
    });

    document.querySelectorAll(".kan-col").forEach(function (col) {
      col.ondragover = function (e) {
        e.preventDefault();
        col.classList.add("drag-over");
      };
      col.ondragleave = function () {
        col.classList.remove("drag-over");
      };
      col.ondrop = function (e) {
        e.preventDefault();
        col.classList.remove("drag-over");
        var id = e.dataTransfer.getData("text/plain");
        if (id) moveLead(id, col.getAttribute("data-col"));
      };
    });
  }

  function load() {
    fetch("/api/dashboard/leads?limit=100", {
      headers: { Authorization: "Bearer " + token },
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        allLeads = res.leads || [];
        render();
      });
  }

  document.getElementById("kanSearch").oninput = function (e) {
    searchQ = e.target.value;
    render();
  };

  load();
})();
