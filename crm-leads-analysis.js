(function () {
  var TOKEN_KEY = "lo_token";

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  if (!localStorage.getItem(TOKEN_KEY)) {
    location.href = "./crm.html";
    return;
  }

  var sessions = [];
  try {
    sessions = JSON.parse(localStorage.getItem("lead_analysis_sessions") || "[]");
  } catch (e) {}

  var filter = "";
  var liveLeads = [];

  function render() {
    var el = document.getElementById("leadsMount");
    var list = sessions.filter(function (s) {
      if (!filter) return true;
      return (s.leadQualification || {}).leadCategory === filter;
    });

    if (!sessions.length) {
      el.innerHTML =
        "<p>Aucune session locale — testez <a href='./external/assurance/devis-intelligent.html'>Devis intelligent IA</a></p>";
      return;
    }

    var hot = sessions.filter(function (s) {
      return (s.leadQualification || {}).leadCategory === "hot";
    }).length;

    el.innerHTML =
      '<div class="crm-kpis" style="margin-bottom:16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px">' +
      '<div class="kpi-card panel"><div class="kpi-label">Sessions</div><div class="kpi-value">' +
      sessions.length +
      '</div></div><div class="kpi-card panel"><div class="kpi-label">🔥 Hot</div><div class="kpi-value">' +
      hot +
      "</div></div></div>" +
      '<p style="margin-bottom:12px"><button type="button" class="btn btn-ghost btn-sm filt-btn active" data-f="">Tous</button> ' +
      '<button type="button" class="btn btn-ghost btn-sm filt-btn" data-f="hot">Hot</button> ' +
      '<button type="button" class="btn btn-ghost btn-sm filt-btn" data-f="warm">Warm</button> ' +
      '<button type="button" class="btn btn-ghost btn-sm filt-btn" data-f="cold">Cold</button> ' +
      '<button type="button" id="btnExportLeads" class="btn btn-ghost btn-sm">Exporter CSV</button></p>';

    if (!list.length) {
      el.innerHTML += "<p>Aucune session pour ce filtre.</p>";
      bind();
      return;
    }

    el.innerHTML +=
      "<table><thead><tr><th>Date</th><th>Client</th><th>Produit</th><th>Faisabilité</th><th>Catégorie</th><th>Commission</th><th></th></tr></thead><tbody>" +
      list
        .map(function (s) {
          var q = s.leadQualification || {};
          var f = s.feasibilityAnalysis || {};
          var p = (s.sessionData && s.sessionData.clientProfile && s.sessionData.clientProfile.personalInfo) || {};
          var name = ((p.firstName || "") + " " + (p.lastName || "")).trim() || p.email || "—";
          return (
            "<tr><td>" +
            new Date(Number(String(s.id).replace("lead_", "")) || Date.now()).toLocaleDateString("fr-FR") +
            "</td><td>" +
            esc(name) +
            "</td><td>" +
            esc((s.sessionData && s.sessionData.needs && s.sessionData.needs.primaryInsurance) || "—") +
            "</td><td>" +
            (f.overallFeasibility || "—") +
            "%</td><td>" +
            esc(q.leadCategory || "—") +
            "</td><td>" +
            ((q.revenueEstimate && q.revenueEstimate.commission) || "—") +
            " €</td><td><button type='button' class='btn btn-ghost btn-sm btn-relance' data-email='" +
            esc(p.email || "") +
            "'>Relancer</button></td></tr>"
          );
        })
        .join("") +
      "</tbody></table>";

    bind();
  }

  function authHeaders() {
    return {
      Authorization: "Bearer " + (localStorage.getItem(TOKEN_KEY) || ""),
      "Content-Type": "application/json",
    };
  }

  function loadLiveLeads() {
    var mount = document.getElementById("liveLeadsMount");
    if (!mount) return;
    mount.innerHTML = "<p>Chargement des leads CRM…</p>";
    fetch("/api/crm/leads-acquisition?limit=40&view=unopened", { headers: authHeaders() })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.ok) {
          mount.innerHTML = "<p>" + esc(res.error || "Erreur chargement leads") + "</p>";
          return;
        }
        liveLeads = res.leads || [];
        if (!liveLeads.length) {
          mount.innerHTML = "<h3>Nouveaux leads CRM</h3><p>Aucun lead non ouvert.</p>";
          return;
        }
        mount.innerHTML =
          "<h3>Nouveaux leads CRM (prioritaires)</h3>" +
          "<table><thead><tr><th>Date</th><th>Contact</th><th>Vertical</th><th>Score</th><th></th></tr></thead><tbody>" +
          liveLeads
            .map(function (l) {
              return (
                "<tr><td>" +
                new Date(l.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) +
                "</td><td>" +
                esc(l.full_name || l.email || l.phone || "—") +
                "</td><td>" +
                esc(l.vertical || "—") +
                "</td><td>" +
                (l.lead_score != null ? l.lead_score : "—") +
                "</td><td>" +
                '<button type="button" class="btn btn-ghost btn-sm btn-arc" data-id="' +
                esc(l.id) +
                '">Archiver</button> ' +
                '<a class="btn btn-ghost btn-sm" href="./crm-lead-detail.html?id=' +
                encodeURIComponent(l.id) +
                '">Ouvrir</a></td></tr>'
              );
            })
            .join("") +
          "</tbody></table>";
        mount.querySelectorAll(".btn-arc").forEach(function (btn) {
          btn.addEventListener("click", function () {
            fetch("/api/crm/lead-acquisition?id=" + encodeURIComponent(btn.getAttribute("data-id")), {
              method: "PATCH",
              headers: authHeaders(),
              body: JSON.stringify({ action: "archive", archive_reason: "Archive depuis analyse leads" }),
            })
              .then(function (r) { return r.json(); })
              .then(function (out) {
                if (!out.ok) return alert(out.error || "Erreur");
                loadLiveLeads();
              });
          });
        });
      });
  }

  function loadDuplicates() {
    var mount = document.getElementById("duplicatesMount");
    if (!mount) return;
    mount.innerHTML = "<p>Chargement doublons…</p>";
    fetch("/api/crm/contact-duplicates", { headers: authHeaders() })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.ok) {
          mount.innerHTML = "<p>" + esc(res.error || "Erreur doublons") + "</p>";
          return;
        }
        var groups = (res.groups || []).slice(0, 20);
        if (!groups.length) {
          mount.innerHTML = "<h3>Doublons contacts</h3><p>Aucun doublon detecte.</p>";
          return;
        }
        mount.innerHTML =
          "<h3>Doublons contacts (fusion)</h3>" +
          groups
            .map(function (g) {
              var keep = g.contacts[0];
              return (
                '<div class="activity" style="margin-bottom:8px">' +
                "<strong>" + esc(g.reason) + " : " + esc(g.key) + "</strong><br>" +
                g.contacts
                  .map(function (c, idx) {
                    return (
                      esc(((c.first_name || "") + " " + (c.last_name || "")).trim() || c.email || c.phone || c.id) +
                      (idx === 0
                        ? " (conserve)"
                        : ' <button type="button" class="btn btn-primary btn-sm btn-merge" data-keep="' +
                          esc(keep.id) +
                          '" data-merge="' +
                          esc(c.id) +
                          '">Fusionner ici</button>') +
                      "<br>"
                    );
                  })
                  .join("") +
                "</div>"
              );
            })
            .join("");
        mount.querySelectorAll(".btn-merge").forEach(function (btn) {
          btn.addEventListener("click", function () {
            if (!confirm("Confirmer la fusion ?")) return;
            fetch("/api/crm/merge-contacts", {
              method: "POST",
              headers: authHeaders(),
              body: JSON.stringify({
                keepId: btn.getAttribute("data-keep"),
                mergeId: btn.getAttribute("data-merge"),
              }),
            })
              .then(function (r) { return r.json(); })
              .then(function (out) {
                if (!out.ok) return alert(out.error || "Erreur fusion");
                loadDuplicates();
              });
          });
        });
      });
  }

  function bind() {
    document.querySelectorAll(".filt-btn").forEach(function (btn) {
      btn.onclick = function () {
        filter = btn.getAttribute("data-f");
        document.querySelectorAll(".filt-btn").forEach(function (b) {
          b.classList.toggle("active", b === btn);
        });
        render();
      };
    });
    var ex = document.getElementById("btnExportLeads");
    if (ex) {
      ex.onclick = function () {
        var csv =
          "date;client;produit;faisabilite;categorie;commission\n" +
          sessions
            .map(function (s) {
              var q = s.leadQualification || {};
              var f = s.feasibilityAnalysis || {};
              var p = (s.sessionData && s.sessionData.clientProfile && s.sessionData.clientProfile.personalInfo) || {};
              return [
                s.id,
                ((p.firstName || "") + " " + (p.lastName || "")).trim(),
                (s.sessionData.needs && s.sessionData.needs.primaryInsurance) || "",
                f.overallFeasibility || "",
                q.leadCategory || "",
                (q.revenueEstimate && q.revenueEstimate.commission) || "",
              ].join(";");
            })
            .join("\n");
        var a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
        a.download = "leads-ia-" + new Date().toISOString().slice(0, 10) + ".csv";
        a.click();
      };
    }
    document.querySelectorAll(".btn-relance").forEach(function (btn) {
      btn.onclick = function () {
        var em = btn.getAttribute("data-email");
        if (em) location.href = "mailto:" + em + "?subject=Suite à votre analyse assurance";
        else alert("Email non renseigné dans la session.");
      };
    });
  }

  render();
  loadLiveLeads();
  loadDuplicates();
})();
