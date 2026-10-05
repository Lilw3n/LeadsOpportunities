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

  function tableFromEntries(entries, linkPrefix) {
    if (!entries || !entries.length) return '<p style="color:var(--muted)">Aucune donnée sur la période.</p>';
    return (
      "<table><thead><tr><th>Libellé</th><th>Leads</th><th></th></tr></thead><tbody>" +
      entries
        .map(function (e) {
          var link = linkPrefix
            ? '<a href="' + linkPrefix + encodeURIComponent(e.key) + '" class="btn btn-ghost btn-sm">Filtrer</a>'
            : "";
          return (
            "<tr><td>" +
            esc(e.key) +
            "</td><td><strong>" +
            e.count +
            "</strong></td><td>" +
            link +
            "</td></tr>"
          );
        })
        .join("") +
      "</tbody></table>"
    );
  }

  function renderPlatformLinks(platforms) {
    var el = document.getElementById("platformLinks");
    if (!el) return;
    el.innerHTML = (platforms || [])
      .map(function (p) {
        var primary = (p.links || []).filter(function (l) {
          return l.primary;
        });
        var others = (p.links || []).filter(function (l) {
          return !l.primary;
        });
        return (
          '<div class="pub-platform-card" style="border-left:4px solid ' +
          esc(p.color || "#64748b") +
          '">' +
          "<h3>" +
          esc(p.icon) +
          " " +
          esc(p.label) +
          "</h3>" +
          primary
            .map(function (l) {
              return (
                '<a href="' +
                esc(l.url) +
                '" target="_blank" rel="noopener" class="btn btn-primary btn-sm pub-ext-link">' +
                esc(l.label) +
                " ↗</a>"
              );
            })
            .join(" ") +
          (others.length
            ? '<details class="pub-more-links"><summary>Autres liens</summary><ul>' +
              others
                .map(function (l) {
                  return (
                    '<li><a href="' +
                    esc(l.url) +
                    '" target="_blank" rel="noopener">' +
                    esc(l.label) +
                    " ↗</a></li>"
                  );
                })
                .join("") +
              "</ul></details>"
            : "") +
          "</div>"
        );
      })
      .join("");
  }

  function renderRecent(recent) {
    var el = document.getElementById("srcRecent");
    if (!el) return;
    if (!recent || !recent.length) {
      el.innerHTML = '<p style="color:var(--muted)">Aucun lead sur la période.</p>';
      return;
    }
    el.innerHTML =
      "<table><thead><tr><th>Date</th><th>Lead</th><th>Plateforme</th><th>Domaine</th><th>Campagne</th><th>IDs clic</th><th></th></tr></thead><tbody>" +
      recent
        .map(function (l) {
          var pm = window.CrmLeadPlatform.meta(l.platform);
          var ids = [];
          if (l.gclid) ids.push("gclid");
          if (l.fbclid) ids.push("fbclid");
          if (l.ttclid) ids.push("ttclid");
          return (
            "<tr><td>" +
            esc(l.created_at ? new Date(l.created_at).toLocaleString("fr-FR") : "—") +
            "</td><td>" +
            esc(l.email || l.phone || l.id) +
            "<br><small>" +
            esc(l.vertical || "") +
            " · score " +
            esc(l.lead_score != null ? l.lead_score : "—") +
            "</small></td><td>" +
            pm.icon +
            " " +
            esc(pm.label) +
            "</td><td><small>" +
            esc(l.site_domain || "—") +
            "</small></td><td><small>" +
            esc(l.utm_campaign || l.utm_source || "—") +
            "</small></td><td>" +
            esc(ids.join(", ") || "—") +
            "</td><td><a href=\"./crm-lead-detail.html?id=" +
            encodeURIComponent(l.id) +
            '" class="btn btn-ghost btn-sm">Fiche</a></td></tr>'
          );
        })
        .join("") +
      "</tbody></table>";
  }

  function renderAvf(avf, tracking) {
    var kpis = document.getElementById("avfKpis");
    var list = document.getElementById("avfRecent");
    if (!kpis || !list) return;
    var count = (avf && avf.count) || (tracking && tracking.avf_count) || 0;
    kpis.innerHTML =
      '<span class="acq-stat">Leads AVF <strong>' +
      count +
      "</strong></span>" +
      '<span class="acq-stat">Source <strong>assurancevtcfrance</strong></span>' +
      '<span class="acq-stat">Domaine <strong>assurancevtcfrance.com</strong></span>';
    var recent = (avf && avf.recent) || [];
    if (!recent.length) {
      list.innerHTML =
        '<p style="color:var(--muted)">Aucun lead Assurance VTC France sur la période — dès qu’un devis part du site, il apparaît ici.</p>';
      return;
    }
    list.innerHTML =
      "<table><thead><tr><th>Date</th><th>Contact</th><th>Campagne</th><th></th></tr></thead><tbody>" +
      recent
        .map(function (l) {
          return (
            "<tr><td>" +
            esc(l.created_at ? new Date(l.created_at).toLocaleString("fr-FR") : "—") +
            "</td><td>" +
            esc(l.email || l.phone || l.id) +
            "<br><small>score " +
            esc(l.lead_score != null ? l.lead_score : "—") +
            "</small></td><td><small>" +
            esc(l.utm_campaign || l.utm_source || "—") +
            "</small></td><td><a href=\"./crm-lead-detail.html?id=" +
            encodeURIComponent(l.id) +
            '" class="btn btn-ghost btn-sm">Fiche</a></td></tr>'
          );
        })
        .join("") +
      "</tbody></table>";
  }

  function load() {
    var days = document.getElementById("srcDays").value;
    var platform = document.getElementById("srcPlatform").value;
    var params = new URLSearchParams(location.search);
    if (params.get("platform") && !platform) {
      platform = params.get("platform");
      document.getElementById("srcPlatform").value = platform;
    }

    var url = "/api/crm/leads-sources?days=" + encodeURIComponent(days);
    if (platform) url += "&platform=" + encodeURIComponent(platform);

    document.getElementById("srcKpis").innerHTML = "<span class='acq-stat'>Chargement…</span>";

    fetch(url, { headers: authHeaders() })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!res.ok) throw new Error(res.error || "Erreur");
        var tr = res.tracking || {};
        document.getElementById("srcKpis").innerHTML =
          '<span class="acq-stat">Total <strong>' +
          res.total +
          "</strong> (" +
          res.days +
          " j)</span>" +
          '<span class="acq-stat">AVF <strong>' +
          (tr.avf_count || 0) +
          "</strong></span>" +
          '<span class="acq-stat">Avec UTM <strong>' +
          tr.with_utm +
          "</strong></span>" +
          '<span class="acq-stat">gclid Google <strong>' +
          tr.with_gclid +
          "</strong></span>" +
          '<span class="acq-stat">fbclid Meta <strong>' +
          tr.with_fbclid +
          "</strong></span>" +
          '<span class="acq-stat">ttclid TikTok <strong>' +
          tr.with_ttclid +
          "</strong></span>";

        renderAvf(res.assurancevtcfrance, tr);
        renderPlatformLinks(res.platform_links);
        document.getElementById("tblPlatform").innerHTML = tableFromEntries(res.by_platform);
        var tblDomain = document.getElementById("tblSiteDomain");
        if (tblDomain) tblDomain.innerHTML = tableFromEntries(res.by_site_domain);
        document.getElementById("tblCampaign").innerHTML = tableFromEntries(res.by_campaign);
        document.getElementById("tblMedium").innerHTML = tableFromEntries(res.by_medium);
        document.getElementById("tblVertical").innerHTML = tableFromEntries(res.by_vertical);
        renderRecent(res.recent);
      })
      .catch(function (e) {
        document.getElementById("srcKpis").innerHTML =
          '<span class="acq-stat" style="color:#b91c1c">' + esc(String(e)) + "</span>";
      });
  }

  document.getElementById("btnSrcRefresh").onclick = load;
  document.getElementById("srcDays").onchange = load;
  document.getElementById("srcPlatform").onchange = load;
  load();
})();
